import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * Symmetric encryption for connector OAuth tokens / API keys at rest. AES-256-GCM with a
 * random IV per value; the key is derived (SHA-256) from CONNECTOR_ENCRYPTION_KEY so any
 * passphrase length works. Never log or return decrypted credentials outside this module
 * and the specific connector call that needs them.
 */

function getKey(): Buffer {
  const secret = process.env.CONNECTOR_ENCRYPTION_KEY;
  if (!secret) throw new Error('CONNECTOR_ENCRYPTION_KEY must be set');
  return createHash('sha256').update(secret).digest();
}

export function encryptCredentials(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptCredentials(payload: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
