import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      phone: string
      status: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
    phone: string
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    phone: string
    status: string
  }
}
