import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import type { NextAuthOptions, User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

const prisma = new PrismaClient();

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
          id: user.userId,
          name: user.userId,
          email: `${user.userId}@example.com`,
          isAdmin: user.isAdmin,
        } as User & { isAdmin: boolean }; // Extended type
      },
    }),
  ],
  pages: {
    signIn: '/', // Login page route
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).isAdmin = token.isAdmin; // Cast if you're not extending the type yet
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.sub = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
