import { SignJWT, jwtVerify } from "jose";
import type { Env } from "./env";
import { requireEnv } from "./env";
import { cookie, getCookie } from "./http";

const TOKEN_NAME = "token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
// Cloudflare Workers currently rejects PBKDF2 requests above 100,000 iterations.
// Keep this at the platform limit so registration works in Pages Functions.
const PASSWORD_ITERATIONS = 100_000;

export interface SessionUser {
  userId: number;
  email: string;
}

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

async function derivePassword(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, iterationsRaw, saltRaw, expectedRaw] = encoded.split("$");
  const iterations = Number(iterationsRaw);
  if (
    algorithm !== "pbkdf2-sha256" ||
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    iterations > PASSWORD_ITERATIONS ||
    !saltRaw ||
    !expectedRaw
  ) {
    return false;
  }

  const actual = await derivePassword(password, fromBase64(saltRaw), iterations);
  const expected = fromBase64(expectedRaw);
  if (actual.length !== expected.length) return false;

  let difference = 0;
  for (let i = 0; i < actual.length; i += 1) {
    difference |= actual[i] ^ expected[i];
  }
  return difference === 0;
}

export async function signToken(env: Env, userId: number, email: string): Promise<string> {
  const secret = new TextEncoder().encode(requireEnv(env, "JWT_SECRET"));
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSession(request: Request, env: Env): Promise<SessionUser | null> {
  const token = getCookie(request, TOKEN_NAME);
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(requireEnv(env, "JWT_SECRET"));
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "number" || typeof payload.email !== "string") {
      return null;
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export function tokenCookie(request: Request, token: string): string {
  return cookie(TOKEN_NAME, token, request, TOKEN_MAX_AGE);
}

export function clearTokenCookie(request: Request): string {
  return cookie(TOKEN_NAME, "", request, 0);
}

export function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
