import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "saifcore_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD?.trim() || undefined;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(): string | null {
  const secret = getAdminPassword();
  if (!secret) return null;

  const payload = `${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = getAdminPassword();
  if (!secret || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = signPayload(payload, secret);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return false;
  }

  const issuedAt = Number(payload.split(":")[0]);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > SESSION_TTL_MS) return false;

  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
