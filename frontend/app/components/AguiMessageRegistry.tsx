"use client";

/**
 * AguiMessageRegistry - AG-UI Message Debugging Tool
 *
 * A debugging and monitoring utility that records all AG-UI protocol messages
 * for inspection and troubleshooting. Useful for:
 * - Debugging data flow issues between backend and frontend
 * - Monitoring message structure during development
 * - Troubleshooting when components don't receive expected data
 *
 * Note: For normal application use, prefer CopilotKit's built-in
 * `useCopilotAction` with `renderAndWaitForResponse`.
 */

import { useEffect } from "react";
import {
  subscribeToRawResponses,
  useRawResponseLogger,
  UseRawResponseLoggerOptions,
} from "./RawResponseLogger";

/**
 * Message structure from AG-UI protocol
 */
interface AGUIMessage {
  __typename: string;
  id: string;
  createdAt: string;
  name?: string;           // For ActionExecutionMessage
  arguments?: string[];    // For ActionExecutionMessage
  content?: string[];      // For TextMessage
  role?: string;
  parentMessageId?: string | null;
  state?: string;          // For AgentStateMessage
  running?: boolean;
  agentName?: string;
  nodeName?: string;
  runId?: string;
  active?: boolean;
  [key: string]: any;      // Allow other fields
}

/**
 * Global message registry - records ALL AG-UI messages
 */
const messageStore = new Map<string, AGUIMessage>();
const messagesByType = new Map<string, Set<string>>(); // typename -> message IDs
const actionExecutionMessages = new Map<string, AGUIMessage>(); // action name -> latest message

// Subscribers for message updates
type MessageSubscriber = (message: AGUIMessage) => void;
const subscribers = new Set<MessageSubscriber>();

/**
 * Subscribe to ALL message updates
 * Returns an unsubscribe function
 */
export function subscribeToAguiMessages(callback: MessageSubscriber): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Get a specific message by ID
 */
export function getAguiMessage(id: string): AGUIMessage | null {
  return messageStore.get(id) || null;
}

/**
 * Get all messages of a specific type
 */
export function getAguiMessagesByType(typename: string): AGUIMessage[] {
  const ids = messagesByType.get(typename);
  if (!ids) return [];
  return Array.from(ids).map((id) => messageStore.get(id)!).filter(Boolean);
}

/**
 * Get the latest ActionExecutionMessage for a specific action name
 */
export function getLatestActionExecution(actionName: string): AGUIMessage | null {
  return actionExecutionMessages.get(actionName) || null;
}

/**
 * Get parsed arguments from an ActionExecutionMessage
 */
export function getActionArguments(message: AGUIMessage): any | null {
  if (message.__typename !== 'ActionExecutionMessageOutput') return null;
  if (!message.arguments || message.arguments.length === 0) return null;

  try {
    const argsJson = message.arguments[0];
    return typeof argsJson === 'string' ? JSON.parse(argsJson) : argsJson;
  } catch (e) {
    console.error('[AguiMessageRegistry] Failed to parse arguments:', e);
    return null;
  }
}

/**
 * Get all stored messages (for debugging)
 */
export function getAllAguiMessages(): AGUIMessage[] {
  return Array.from(messageStore.values());
}

/**
 * Check if an action message should be rendered.
 * Returns true only if this is the LATEST action of the same name.
 * This prevents duplicate rendering when thinking mode generates multiple text messages.
 */
export function shouldRenderAction(actionMessage: AGUIMessage): boolean {
  if (actionMessage.__typename !== 'ActionExecutionMessageOutput') {
    return true; // Not an action, render by default
  }

  // Get all actions with the same name
  const sameNameActions = Array.from(messageStore.values())
    .filter(m =>
      m.__typename === 'ActionExecutionMessageOutput' &&
      m.name === actionMessage.name
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Find the latest action of this name
  const latestAction = sameNameActions[sameNameActions.length - 1];

  // Only render if this is the latest action
  const shouldRender = actionMessage.id === latestAction?.id;

  console.log('[AguiMessageRegistry] shouldRenderAction:', {
    actionId: actionMessage.id,
    actionName: actionMessage.name,
    createdAt: actionMessage.createdAt,
    latestActionId: latestAction?.id,
    totalSameNameActions: sameNameActions.length,
    shouldRender,
  });

  return shouldRender;
}

/**
 * Clear the message store (for cleanup)
 */
export function resetAguiMessageRegistry(): void {
  messageStore.clear();
  messagesByType.clear();
  actionExecutionMessages.clear();
}

/**
 * Internal: Store a message and notify subscribers
 */
function storeMessage(message: AGUIMessage): void {
  messageStore.set(message.id, message);

  // Index by typename
  if (!messagesByType.has(message.__typename)) {
    messagesByType.set(message.__typename, new Set());
  }
  messagesByType.get(message.__typename)!.add(message.id);

  // Index ActionExecutionMessages by name
  if (message.__typename === 'ActionExecutionMessageOutput' && message.name) {
    actionExecutionMessages.set(message.name, message);
  }

  // Notify subscribers
  subscribers.forEach(callback => callback(message));

//   console.log('[AguiMessageRegistry] Stored message:', {
//     id: message.id,
//     typename: message.__typename,
//     name: message.name,
//     hasArguments: !!message.arguments,
//   });
}

interface UseAguiMessageRegistryOptions {
  rawLoggerOptions?: UseRawResponseLoggerOptions;
}

type MessageIndexTracker = Map<number, string>;

interface ChunkParserState {
  buffer: string;
  depth: number;
  inString: boolean;
  escaping: boolean;
}

interface ParsingContext {
  recordId: string;
  tracker: MessageIndexTracker;
  parser: ChunkParserState;
}

/**
 * Primary hook that wires raw response logging to the AG-UI message registry.
 */
export function useAguiMessageRegistry(options?: UseAguiMessageRegistryOptions) {
  useRawResponseLogger(options?.rawLoggerOptions);

  useEffect(() => {
    const processedChunkCounts = new Map<string, number>();
    const messageTrackers = new Map<string, MessageIndexTracker>();
    const parserStates = new Map<string, ChunkParserState>();

    const unsubscribe = subscribeToRawResponses((record) => {
      const previousCount = processedChunkCounts.get(record.id) ?? 0;
      if (record.chunks.length <= previousCount) {
        if (record.completed) {
          messageTrackers.delete(record.id);
          processedChunkCounts.delete(record.id);
        }
        return;
      }

      const tracker = getTracker(record.id, messageTrackers);
      const parser = getParserState(record.id, parserStates);
      const newChunks = record.chunks.slice(previousCount);

      newChunks.forEach((chunk) => {
        processChunk(chunk.text, { recordId: record.id, tracker, parser });
      });

      processedChunkCounts.set(record.id, record.chunks.length);

      if (record.completed) {
        messageTrackers.delete(record.id);
        parserStates.delete(record.id);
        processedChunkCounts.delete(record.id);
      }
    });

    return () => {
      unsubscribe();
      processedChunkCounts.clear();
      messageTrackers.clear();
      parserStates.clear();
    };
  }, [options?.rawLoggerOptions?.shouldLogRequest]);
}

function getTracker(
  recordId: string,
  trackers: Map<string, MessageIndexTracker>
): MessageIndexTracker {
  if (!trackers.has(recordId)) {
    trackers.set(recordId, new Map());
  }
  return trackers.get(recordId)!;
}

function getParserState(
  recordId: string,
  parserStates: Map<string, ChunkParserState>
): ChunkParserState {
  if (!parserStates.has(recordId)) {
    parserStates.set(recordId, {
      buffer: '',
      depth: 0,
      inString: false,
      escaping: false,
    });
  }
  return parserStates.get(recordId)!;
}

function processChunk(chunk: string, context: ParsingContext): void {
  if (chunk.includes('ask_user_question')) {
    // console.log('[NETWORK] Chunk with ask_user_question:', chunk);
  }

  const payloads = extractJsonPayloads(chunk, context.parser);
  payloads.forEach((payload) => {
    try {
      const data = JSON.parse(payload);
      processPayload(data, context);
    } catch (error) {
      console.error('[AguiMessageRegistry] Failed to parse chunk payload:', error);
    }
  });
}

function extractJsonPayloads(chunk: string, state: ChunkParserState): string[] {
  const payloads: string[] = [];

  for (let i = 0; i < chunk.length; i += 1) {
    const char = chunk[i];

    if (state.depth === 0) {
      if (char === '{') {
        state.buffer = '{';
        state.depth = 1;
      }
      continue;
    }

    state.buffer += char;

    if (state.escaping) {
      state.escaping = false;
      continue;
    }

    if (char === '\\') {
      state.escaping = true;
      continue;
    }

    if (char === '"') {
      state.inString = !state.inString;
      continue;
    }

    if (state.inString) {
      continue;
    }

    if (char === '{') {
      state.depth += 1;
      continue;
    }

    if (char === '}') {
      state.depth -= 1;
      if (state.depth === 0) {
        payloads.push(state.buffer);
        state.buffer = '';
      }
    }
  }

  return payloads;
}

function processPayload(payload: Record<string, any>, context: ParsingContext): void {
  if (payload.data) {
    processDataPayload(payload.data);
  }

  if (payload.incremental) {
    processIncrementalPayload(payload.incremental, context);
  }
}

function processDataPayload(data: Record<string, any>): void {
  const response = data.generateCopilotResponse;
  if (!response) return;

  if (Array.isArray(response.messages)) {
    response.messages.forEach((message: AGUIMessage) => {
      if (message && message.__typename && message.id) {
        storeMessage(message);
      }
    });
  }
}

function processIncrementalPayload(
  incremental: any[],
  context: ParsingContext
): void {
  incremental.forEach((inc) => {
    if (!inc) return;

    if (Array.isArray(inc.items)) {
      handleIncrementalItems(inc, context);
    }

    if (inc.data) {
      handleIncrementalData(inc, context);
    }
  });
}

function handleIncrementalItems(inc: any, context: ParsingContext): void {
  for (const item of inc.items) {
    if (isMessageObject(item)) {
      storeMessage(item);
      const messageIdx = getMessageIndexFromPath(inc.path);
      if (messageIdx !== null) {
        context.tracker.set(messageIdx, item.id);
      }
      continue;
    }

    if (typeof item === 'string') {
      applyArrayFieldUpdate(inc, item, context);
    }
  }
}

function handleIncrementalData(inc: any, context: ParsingContext): void {
  const messageIdx = getMessageIndexFromPath(inc.path);
  if (messageIdx === null) {
    return;
  }

  const messageId = context.tracker.get(messageIdx);
  if (!messageId) {
    return;
  }

  const current = messageStore.get(messageId);
  if (!current) {
    return;
  }

  const updated: AGUIMessage = {
    ...current,
    ...inc.data,
    id: current.id,
    __typename: current.__typename,
  };

  storeMessage(updated);
}

function applyArrayFieldUpdate(
  inc: any,
  item: string,
  context: ParsingContext
): void {
  if (!Array.isArray(inc.path)) {
    return;
  }

  const messageIdx = getMessageIndexFromPath(inc.path);
  if (messageIdx === null) {
    return;
  }

  const field = getFieldFromPath(inc.path);
  const arrayIdx = getArrayIndexFromPath(inc.path);
  if (!field || arrayIdx === null) {
    return;
  }

  if (field !== 'arguments' && field !== 'content') {
    return;
  }

  const messageId = context.tracker.get(messageIdx);
  if (!messageId) {
    return;
  }

  const current = messageStore.get(messageId);
  if (!current) {
    return;
  }

  const updated: AGUIMessage = {
    ...current,
    [field]: updateArrayField(current[field], arrayIdx, item),
  };

  storeMessage(updated);

  if (field === 'arguments') {
    // console.log('[NETWORK] Updated message arguments:', messageId);
  }
}

function updateArrayField(
  existing: string[] | undefined,
  index: number,
  value: string
): string[] {
  const next = Array.isArray(existing) ? [...existing] : [];
  next[index] = value;
  return next;
}

function getMessageIndexFromPath(path?: any[]): number | null {
  if (!Array.isArray(path)) {
    return null;
  }

  const messagePathIdx = path.findIndex((segment) => segment === 'messages');
  if (messagePathIdx === -1) {
    return null;
  }

  const idx = path[messagePathIdx + 1];
  return typeof idx === 'number' ? idx : null;
}

function getFieldFromPath(path: any[]): string | null {
  const messagePathIdx = path.findIndex((segment) => segment === 'messages');
  if (messagePathIdx === -1) {
    return null;
  }

  const field = path[messagePathIdx + 2];
  return typeof field === 'string' ? field : null;
}

function getArrayIndexFromPath(path: any[]): number | null {
  const messagePathIdx = path.findIndex((segment) => segment === 'messages');
  if (messagePathIdx === -1) {
    return null;
  }

  const index = path[messagePathIdx + 3];
  return typeof index === 'number' ? index : null;
}

function isMessageObject(value: any): value is AGUIMessage {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.__typename === 'string' &&
    typeof value.id === 'string'
  );
}
