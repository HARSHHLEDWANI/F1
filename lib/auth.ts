import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_API_BASE =
  process.env.BACKEND_API_BASE_URL || "http://localhost:8000";

const nextAuth = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    // 🔵 Google Login (optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // 🔐 Email + Password Login (FastAPI)
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) return null;

        // ⚠️ FastAPI OAuth2PasswordRequestForm requires:
        // Content-Type: application/x-www-form-urlencoded
        const res = await fetch(`${BACKEND_API_BASE}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email, // FastAPI expects "username"
            password: password,
          }).toString(),
        });

        if (!res.ok) {
          console.error("Login failed:", await res.text());
          return null;
        }

        const data = await res.json();

        // Your backend should return something like:
        // { access_token, token_type, user: { id, email, is_pro } }

        return {
          id: String(data.user?.id ?? ""),
          email: data.user?.email ?? email,
          tier: data.user?.is_pro ? "pro" : "free",
          accessToken: data.access_token,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.tier = (user as any).tier;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken;
        session.tier = token.tier ?? "free";
      }
      return session;
    },
  },
});

export const { auth, handlers, signIn, signOut } = nextAuth;
