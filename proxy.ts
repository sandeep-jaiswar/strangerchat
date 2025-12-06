import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  console.log('proxy executed for:', request.nextUrl.pathname)
  return NextResponse.next();
}


export const config = {
  // Run on everything except static assets & Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}
