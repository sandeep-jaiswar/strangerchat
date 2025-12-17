import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  console.log("proxy executed for:", request.nextUrl.pathname)

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if the user is trying to access a protected route
  const isLoginPage = request.nextUrl.pathname.startsWith("/login")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
  const isPublicFile =
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/assets")

  // If user is not logged in and trying to access a protected route
  if (!token && !isLoginPage && !isAuthRoute && !isPublicFile) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in and trying to access login page, redirect to home
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except static assets & Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}
