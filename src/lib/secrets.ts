/**
 * ShepGate Secrets Manager
 *
 * Handles encrypted storage and retrieval of API keys and credentials.
 * Uses ENCRYPTION_KEY env var for app-layer encryption (AES-256-GCM).
 *
 * Implementation based on Node.js crypto best practices:
 * https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options
 *
 * See .specify/specs/001-shepgate-mvp/spec.md Section 4.4
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { prisma } from '@/lib/db';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits for authentication tag
const SALT_LENGTH = 32; // 256 bits for key derivation salt

/**
 * Get the encryption key from environment, deriving it with scrypt if needed
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (!envKey) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required for secrets management. ' +
      'Generate one with: openssl rand -base64 32'
    );
  }
  
  // If key is base64, decode it. Otherwise treat as passphrase and derive.
  if (envKey.length === 44 && envKey.endsWith('=')) {
    // Looks like base64-encoded 32-byte key
    return Buffer.from(envKey, 'base64');
  }
  
  // Derive key using scrypt (for passphrase-based keys)
  // Using a fixed salt for key derivation (the actual data uses random salt)
  const keySalt = Buffer.from('ShepGateKeyDerivation2024', 'utf8');
  return scryptSync(envKey, keySalt, 32);
}

/**
 * Encrypt a plaintext value using AES-256-GCM
 * Format: base64(salt + iv + authTag + ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  
  // Derive a unique key for this encryption using the salt
  const derivedKey = scryptSync(key, salt, 32);
  
  const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine: salt + iv + authTag + ciphertext
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  
  return combined.toString('base64');
}

/**
 * Decrypt a ciphertext value encrypted with AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  // Derive the same key using the salt
  const derivedKey = scryptSync(key, salt, 32);
  
  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  
  return decrypted.toString('utf8');
}

/**
 * Store an encrypted secret in the database
 */
export async function setSecret(name: string, value: string): Promise<void> {
  const encryptedValue = encrypt(value);
  
  await prisma.secret.upsert({
    where: { name },
    update: { value: encryptedValue },
    create: { name, value: encryptedValue },
  });
}

/**
 * Retrieve and decrypt a secret from the database
 */
export async function getSecret(name: string): Promise<string | null> {
  const secret = await prisma.secret.findUnique({
    where: { name },
  });
  
  if (!secret) {
    return null;
  }
  
  return decrypt(secret.value);
}

/**
 * Delete a secret from the database
 */
export async function deleteSecret(name: string): Promise<boolean> {
  try {
    await prisma.secret.delete({
      where: { name },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * List all secret names (never returns values)
 */
export async function listSecrets(): Promise<{ id: string; name: string; createdAt: Date }[]> {
  const secrets = await prisma.secret.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });
  
  return secrets;
}

/**
 * Get secrets as environment variables for MCP server injection
 * Returns a map of secret names to decrypted values
 */
export async function getSecretsAsEnv(secretNames: string[]): Promise<Record<string, string>> {
  const env: Record<string, string> = {};
  
  for (const name of secretNames) {
    const value = await getSecret(name);
    if (value) {
      env[name] = value;
    }
  }
  
  return env;
}
