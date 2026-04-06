import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const BACKEND_URL = process.env.BACKEND_API_BASE_URL ?? "http://localhost:8000";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in via OAuth, exchange for a backend JWT
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const res = await fetch(`${BACKEND_URL}/oauth-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: token.email,
              name: token.name ?? token.email,
              provider: account.provider,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.backendToken = data.access_token;
          }
        } catch {
          // backend may not be reachable; token.backendToken stays undefined
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
