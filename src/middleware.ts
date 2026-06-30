import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  COOKIE_REDIRECT_HOME,
  COOKIE_DISPLAY_MODE,
} from '@/lib/pwa-cookies'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isDashboardRoute(req)) {
    auth().protect()
  }

  const { userId } = auth()
  const pathname = req.nextUrl.pathname

  // Мгновенный редирект с лендинга на дашборд до рендера страницы.
  // В PWA редирект всегда включён. В браузере — по настройке (по умолчанию включён).
  if (userId && pathname === '/') {
    const isPwa = req.cookies.get(COOKIE_DISPLAY_MODE)?.value === 'standalone'
    const redirectCookie = req.cookies.get(COOKIE_REDIRECT_HOME)?.value
    const redirectEnabled = redirectCookie !== 'false'

    if (isPwa || redirectEnabled) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
