"use client";

/**
 * RawResponseLogger - HTTP Response Debugging Tool
 *
 * A debugging utility that intercepts and logs raw HTTP responses from
 * CopilotKit API endpoints. Useful for:
 * - Debugging GraphQL streaming responses
 * - Inspecting raw AG-UI protocol data
 * - Troubleshooting network-level issues
 * - Understanding the incremental delivery format
 *
 * See also: docs/raw-response-stream.md for response format documentation
 */

import { useEffect } from "react";

interface RawResponseChunk {
  id: string;
  text: string;
  timestamp: string;
}

export interface RawResponseRecord {
  id: string;
  url: string;
  method: string;
  requestBody?: string | null;
  startedAt: string;
  status?: number;
  statusText?: string;
  chunks: RawResponseChunk[];
  completed: boolean;
  completedAt?: string;
  error?: string;
}

type RawResponseSubscriber = (record: RawResponseRecord) => void;

const rawResponseStore = new Map<string, RawResponseRecord>();
const rawResponseSubscribers = new Set<RawResponseSubscriber>();

export function subscribeToRawResponses(
  callback: RawResponseSubscriber
): () => void {
  rawResponseSubscribers.add(callback);
  return () => rawResponseSubscribers.delete(callback);
}

export function getRawResponses(): RawResponseRecord[] {
  return Array.from(rawResponseStore.values());
}

export function getRawResponse(id: string): RawResponseRecord | null {
  return rawResponseStore.get(id) ?? null;
}

export function clearRawResponses(): void {
  rawResponseStore.clear();
}

export interface UseRawResponseLoggerOptions {
  shouldLogRequest?: (url: string) => boolean;
}

export function useRawResponseLogger(
  options?: UseRawResponseLoggerOptions
): void {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [input, init] = args;
      const url = extractUrl(input);
      const method = (init?.method || extractMethod(input)).toUpperCase();

      const matches = options?.shouldLogRequest
        ? options.shouldLogRequest(url)
        : url.includes("/api/copilotkit");

      if (!matches) {
        return originalFetch(...args);
      }

      const requestBody = extractRequestBody(init?.body);
      const recordId = createRecord({ url, method, requestBody });

      try {
        const response = await originalFetch(...args);
        updateRecord(recordId, (prev) => ({
          ...prev,
          status: response.status,
          statusText: response.statusText,
        }));

        recordResponseStream(recordId, response.clone());
        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error ?? "Unknown error");
        updateRecord(recordId, (prev) => ({
          ...prev,
          completed: true,
          completedAt: new Date().toISOString(),
          error: message,
        }));
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.shouldLogRequest]);
}

function extractUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.url;
  }

  try {
    return String(input);
  } catch {
    return "unknown";
  }
}

function extractMethod(input: RequestInfo | URL): string {
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method || "GET";
  }
  return "GET";
}

function extractRequestBody(body: BodyInit | null | undefined): string | null {
  if (!body) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return body.toString();
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const entries: string[] = [];
    body.forEach((value, key) => {
      entries.push(`${key}=${typeof value === "string" ? value : "[File]"}`);
    });
    return entries.join("&");
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return `[Blob size=${body.size}]`;
  }

  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return "[ReadableStream]";
  }

  return `[${body.constructor?.name ?? "Body"}]`;
}

function recordResponseStream(recordId: string, response: Response): void {
  const reader = response.body?.getReader();
  if (!reader) {
    updateRecord(recordId, (prev) => ({
      ...prev,
      completed: true,
      completedAt: new Date().toISOString(),
    }));
    return;
  }

  const decoder = new TextDecoder();

  const read = async (): Promise<void> => {
    try {
      const { done, value } = await reader.read();
      if (done) {
        updateRecord(recordId, (prev) => ({
          ...prev,
          completed: true,
          completedAt: new Date().toISOString(),
        }));
        return;
      }

      const text = decoder.decode(value, { stream: true });
      appendChunk(recordId, text);
      await read();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "Stream error");
      updateRecord(recordId, (prev) => ({
        ...prev,
        completed: true,
        completedAt: new Date().toISOString(),
        error: message,
      }));
    }
  };

  read();
}

function appendChunk(recordId: string, text: string): void {
  const timestamp = new Date().toISOString();
  updateRecord(recordId, (prev) => ({
    ...prev,
    chunks: [
      ...prev.chunks,
      {
        id: `${recordId}-${prev.chunks.length}`,
        text,
        timestamp,
      },
    ],
  }));
  console.log(`[RAW-STREAM][${recordId}] chunk`, text);
}

function createRecord(params: {
  url: string;
  method: string;
  requestBody: string | null;
}): string {
  const recordId = generateRecordId();
  const record: RawResponseRecord = {
    id: recordId,
    url: params.url,
    method: params.method,
    requestBody: params.requestBody,
    startedAt: new Date().toISOString(),
    chunks: [],
    completed: false,
  };

  rawResponseStore.set(recordId, record);
  notify(record);
  console.log(`[RAW-STREAM] Tracking request`, {
    recordId,
    url: params.url,
    method: params.method,
  });
  return recordId;
}

function updateRecord(
  recordId: string,
  updater: (record: RawResponseRecord) => RawResponseRecord
): RawResponseRecord | null {
  const current = rawResponseStore.get(recordId);
  if (!current) {
    return null;
  }

  const cloned: RawResponseRecord = {
    ...current,
    chunks: [...current.chunks],
  };

  const updated = updater(cloned);
  rawResponseStore.set(recordId, updated);
  notify(updated);
  return updated;
}

function notify(record: RawResponseRecord): void {
  rawResponseSubscribers.forEach((callback) => callback(record));
}

function generateRecordId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `raw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ConsoleLoggerOptions - reserved for future use
// interface ConsoleLoggerOptions {
//   shouldLogRecord?: (record: RawResponseRecord) => boolean;
//   logRequestBody?: boolean;
//   logMetadata?: boolean;
// }


interface LocalPersistenceOptions {
  storageKey?: string;
  maxEntries?: number;
  shouldPersistRecord?: (record: RawResponseRecord) => boolean;
}

export function persistRawResponsesLocally(
  options?: LocalPersistenceOptions
): () => void {
  if (typeof window === "undefined" || !window.localStorage) {
    // console.warn("[RAW-STREAM] localStorage not available; persistence disabled");
    return () => undefined;
  }

  const storageKey = options?.storageKey ?? "raw-response-log";
  const maxEntries = options?.maxEntries ?? 25;

  const unsubscribe = subscribeToRawResponses((record) => {
    if (options?.shouldPersistRecord && !options.shouldPersistRecord(record)) {
      return;
    }

    try {
      const entries = loadPersistedRawResponses(storageKey);
      const existingIndex = entries.findIndex((entry) => entry.id === record.id);

      if (existingIndex >= 0) {
        entries[existingIndex] = record;
      } else {
        entries.push(record);
      }

      if (entries.length > maxEntries) {
        entries.splice(0, entries.length - maxEntries);
      }

      window.localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // Silently fail on storage errors
    }
  });

  return unsubscribe;
}

export function loadPersistedRawResponses(
  storageKey = "raw-response-log"
): RawResponseRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return [];
    const parsed: RawResponseRecord[] = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Silently fail on parse errors
    return [];
  }
}
