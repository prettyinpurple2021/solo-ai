import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Ensure the encryption key is loaded from environment variables
const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY is not set in the environment variables.');
}

const key = Buffer.from(encryptionKey, 'base64');

if (key.length !== 32) {
  throw new Error('Invalid ENCRYPTION_KEY. Must be a 32-byte, base64-encoded string.');
}
// Lazy-load and validate the encryption key when needed
function getKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not set in the environment variables.');
  }
  const key = Buffer.from(encryptionKey, 'base64');
  if (key.length !== 32) {
    throw new Error('Invalid ENCRYPTION_KEY. Must be a 32-byte, base64-encoded string.');
  }
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
  const cipher = createCipheriv(ALGORITHM, key, iv);
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
  const iv = buffer.slice(0, IV_LENGTH);
  const authTag = buffer.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
