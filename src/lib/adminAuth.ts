import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "ecocity_admin_access";

const adminSessionVersion = "v1";
const adminSessionTtlMs = 8 * 60 * 60 * 1000;

function getAdminSecret() {
  return process.env.ADMIN_REVIEW_CODE;
}

function signAdminSessionPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeCompare(firstValue: string, secondValue: string) {
  const firstBuffer = Buffer.from(firstValue);
  const secondBuffer = Buffer.from(secondValue);

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

export function isAdminReviewCodeConfigured() {
  return Boolean(getAdminSecret());
}

export function isValidAdminReviewCode(code?: string | null) {
  const secret = getAdminSecret();
  const submittedCode = code?.trim();

  if (!secret || !submittedCode) {
    return false;
  }

  return safeCompare(submittedCode, secret);
}

export function createAdminSessionToken() {
  const secret = getAdminSecret();

  if (!secret) {
    throw new Error("Admin review is not configured.");
  }

  const payload = `${adminSessionVersion}.${Date.now()}`;
  const signature = signAdminSessionPayload(payload, secret);

  return `${payload}.${signature}`;
}

export function isValidAdminSessionToken(token?: string | null) {
  const secret = getAdminSecret();

  if (!secret || !token) {
    return false;
  }

  const [version, issuedAtValue, signature] = token.split(".");

  if (version !== adminSessionVersion || !issuedAtValue || !signature) {
    return false;
  }

  const issuedAt = Number(issuedAtValue);

  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > adminSessionTtlMs) {
    return false;
  }

  const payload = `${version}.${issuedAtValue}`;
  const expectedSignature = signAdminSessionPayload(payload, secret);

  return safeCompare(signature, expectedSignature);
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies();

  return isValidAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}
