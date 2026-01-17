import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Validate the encryption key only when actually needed at runtime to avoid build-time failures
let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not set in the environment variables.');
  }
  const key = Buffer.from(encryptionKey, 'base64');
  if (key.length !== 32) {
    throw new Error('Invalid ENCRYPTION_KEY. Must be a 32-byte, base64-encoded string.');
  }
  
  cachedKey = key;
  return key;
}
/**
 * Encrypts a string using AES-256-GCM.
 * The IV and auth tag are prepended to the encrypted text for storage.
 * @param text The plain text string to encrypt.
 * @returns A base64 encoded string containing the IV, auth tag, and encrypted data.
 */
export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypts a string that was encrypted with the encrypt function.
 * @param encryptedText The base64 encoded string to decrypt.
 * @returns The original plain text string.
 */
export function decrypt(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, 'base64');
  
  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Invalid encrypted text: too short or malformed");
  }

  const iv = buffer.slice(0, IV_LENGTH);
  const authTag = buffer.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptMfaField(text: string | null | undefined): string | null {
  // Treat null/undefined as no-op return
  if (text === null || text === undefined) return null;
  // Treat empty string as actual value
  try {
      return encrypt(text);
  } catch (error: any) {
    // Throw descriptive error
    throw new Error(`MFA encryption failed: ${error.message || 'Unknown error'}`);
  }
}

export type DecryptMfaResult = 
  | { success: true; value: string } 
  | { success: false; error: 'missing' | 'failed' };

export function decryptMfaField(text: string | null | undefined): DecryptMfaResult {
  if (text === null || text === undefined) return { success: false, error: 'missing' };
  try {
      const value = decrypt(text);
      return { success: true, value };
  } catch (error) {
    // Log only generic message
    console.error('MFA decryption failed');
    return { success: false, error: 'failed' };
  }
}
