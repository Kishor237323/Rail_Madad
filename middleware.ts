import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/server/auth'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const session = token ? await verifyAdminSessionToken(token) : null

  if (pathname === '/admin') {
    if (session) {
      return NextResponse.redirect(new URL('/admin/analytics', request.url))
    }

    return NextResponse.next()
  }

  if (!session) {
    const loginUrl = new URL('/admin', request.url)
    loginUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
