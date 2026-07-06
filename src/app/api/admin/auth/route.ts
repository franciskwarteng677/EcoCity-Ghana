import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  hasValidAdminSession,
  isAdminReviewCodeConfigured,
  isValidAdminReviewCode
} from "@/lib/adminAuth";

type AdminAuthRequest = {
  adminCode?: string;
};

export async function GET() {
  return NextResponse.json({ authenticated: await hasValidAdminSession() });
}

export async function POST(request: Request) {
  if (!isAdminReviewCodeConfigured()) {
    return NextResponse.json({ error: "Admin review is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as AdminAuthRequest;

  if (!isValidAdminReviewCode(body.adminCode)) {
    return NextResponse.json({ error: "Invalid admin review code." }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    message: "Admin access verified. Review console unlocked."
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), getAdminSessionCookieOptions());

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...getAdminSessionCookieOptions(),
    maxAge: 0
  });

  return response;
}
