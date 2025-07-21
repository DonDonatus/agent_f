// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../../lib/prisma';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// Extended JWT token interface
interface ExtendedJWT {
  sub?: string;
  isAdmin?: boolean;
}

// Extended session user interface
interface ExtendedSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { userId: credentials.username },
        });

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.userId,            // use userId as the session ID
          name: user.userId,
          email: `${user.userId}@example.com`,
          isAdmin: user.isAdmin,
        } satisfies ExtendedUser;
      },
    }),
  ],

  pages: {
    signIn: '/', // your custom login page
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedToken = token as ExtendedJWT;
        const extendedUser = user as ExtendedUser;
        
        extendedToken.sub = extendedUser.id;                         // store userId in token.sub
        extendedToken.isAdmin = extendedUser.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const extendedSessionUser = session.user as ExtendedSessionUser;
        const extendedToken = token as ExtendedJWT;
        
        extendedSessionUser.id = token.sub;                 // expose userId on session.user.id
        extendedSessionUser.isAdmin = extendedToken.isAdmin;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};