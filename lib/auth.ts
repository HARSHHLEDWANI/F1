import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_API_BASE = process.env.BACKEND_API_BASE_URL || "http://localhost:8000";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const res = await fetch(`${BACKEND_API_BASE}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          return null;
        }

        const user = await res.json();
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          tier: user.tier,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        (token as any).accessToken = (account as any).access_token;
      }
      if (user && (user as any).tier) {
        (token as any).tier = (user as any).tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = (token as any).accessToken;
        (session as any).tier = (token as any).tier ?? "free";
      }
      return session;
    },
  },
});

export default handlers;
