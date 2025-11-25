/**
 * Utility functions for tool protocol components
 */

/**
 * Safe base64 encoding that handles Unicode characters (including Chinese, emojis, etc.)
 *
 * btoa() only works with Latin1 characters and throws error on Unicode.
 * This function properly encodes Unicode strings by converting to UTF-8 first.
 *
 * @param str - String to encode (can contain any Unicode characters)
 * @returns Base64 encoded string
 *
 * @example
 * safeBase64Encode("Hello 世界") // Works!
 * btoa("Hello 世界") // Error: characters outside Latin1 range
 */
export function safeBase64Encode(str: string): string {
  // Convert string to UTF-8 byte array, then to base64
  // Use TextEncoder for proper Unicode handling
  try {
    // Modern approach: use TextEncoder
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    // Convert byte array to binary string
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    // Now we can safely use btoa on the binary string
    return btoa(binary);
  } catch (e) {
    // Fallback: use simple hash if encoding fails
    console.warn('[safeBase64Encode] Encoding failed, using hash fallback:', e);
    return simpleHash(str);
  }
}

/**
 * Simple string hash function as fallback
 * Generates a short hash from any string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).padStart(8, '0').slice(0, 8);
}

/**
 * Generate a stable, short ID from arguments and status
 * Used for creating unique action IDs
 */
export function generateActionId(prefix: string, uniqueId: string, args: any, status: string): string {
  const argsHash = JSON.stringify({ args, status });
  const hash = safeBase64Encode(argsHash).slice(0, 8);
  return `${prefix}-${uniqueId}-${hash}`;
}
