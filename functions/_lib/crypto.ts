import type { Env } from "./env";
import { requireEnv } from "./env";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function fromHex(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function encryptionKey(env: Env): Promise<CryptoKey> {
  const secret = requireEnv(env, "ENCRYPTION_KEY");
  const material: Uint8Array = /^[0-9a-f]{64}$/i.test(secret)
    ? fromHex(secret)
    : new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret)));
  return crypto.subtle.importKey("raw", material as BufferSource, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptApiKey(env: Env, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      await encryptionKey(env),
      new TextEncoder().encode(plaintext)
    )
  );
  const ciphertext = encrypted.slice(0, -16);
  const authTag = encrypted.slice(-16);
  return `${toBase64(iv)}:${toBase64(authTag)}:${toBase64(ciphertext)}`;
}

export async function decryptApiKey(env: Env, encrypted: string): Promise<string> {
  const [ivRaw, tagRaw, ciphertextRaw] = encrypted.split(":");
  if (!ivRaw || !tagRaw || ciphertextRaw === undefined) {
    throw new Error("Invalid encrypted API key format");
  }

  const ciphertext = fromBase64(ciphertextRaw);
  const tag = fromBase64(tagRaw);
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivRaw) as BufferSource, tagLength: 128 },
    await encryptionKey(env),
    combined as BufferSource
  );
  return new TextDecoder().decode(plaintext);
}

export function maskApiKey(plaintext: string): string {
  if (plaintext.length <= 4) return "****";
  const visible = plaintext.slice(-4);
  const prefix = plaintext.slice(0, -4);
  const dashIndex = prefix.lastIndexOf("-");
  if (dashIndex !== -1) {
    return `${prefix.slice(0, dashIndex + 1)}****${visible}`;
  }
  return `****${visible}`;
}
