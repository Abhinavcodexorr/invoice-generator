import { NextResponse } from "next/server";

/** Intentionally lightweight — auth checks happen in API routes / pages. */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
