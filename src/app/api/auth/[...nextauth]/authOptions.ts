// src/app/api/auth/[...nextauth]/authOptions.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { prisma } from '../../../../../lib/prisma';


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null;


        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId },
        });


        // For production, compare hashed passwords with bcrypt
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.userId,
            email: null, // Optional
          };
        }


        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // custom field
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};





