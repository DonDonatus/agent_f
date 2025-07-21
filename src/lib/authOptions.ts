// src/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../../lib/prisma';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
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
        token.sub = user.id;                         // store userId in token.sub
        (token as any).isAdmin = (user as ExtendedUser).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;                 // expose userId on session.user.id
        (session.user as any).isAdmin = (token as any).isAdmin;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
