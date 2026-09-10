import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = (auth?.user as any)?.role

      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isWholesaleRoute = nextUrl.pathname.startsWith('/wholesale')
      const isRetailRoute = nextUrl.pathname.startsWith('/retail')
      const isAuthRoute = nextUrl.pathname.startsWith('/auth')

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        if (role === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl))
        if (role === 'WHOLESALE') return Response.redirect(new URL('/wholesale/dashboard', nextUrl))
        if (role === 'RETAIL') return Response.redirect(new URL('/retail/dashboard', nextUrl))
      }

      // Protect admin routes
      if (isAdminRoute) {
        if (!isLoggedIn) return false
        if (role !== 'ADMIN') return Response.redirect(new URL('/', nextUrl))
      }

      // Protect wholesale routes
      if (isWholesaleRoute) {
        if (!isLoggedIn) return false
        if (role !== 'WHOLESALE') return Response.redirect(new URL('/', nextUrl))
      }

      // Protect retail routes
      if (isRetailRoute) {
        if (!isLoggedIn) return false
        if (role !== 'RETAIL') return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.status = (user as any).status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.status = token.status as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
