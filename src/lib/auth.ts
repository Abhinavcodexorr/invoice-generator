import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { normalizePlan } from "@/lib/plans";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        await connectMongo();
        const user = await User.findOne({ email });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          email: user.email,
          name: user.name || user.email,
          plan: normalizePlan(user.plan),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.plan = normalizePlan(user.plan);
        return token;
      }

      // Refresh plan only after explicit session.update() (e.g. checkout)
      if (trigger === "update" && token.sub) {
        await connectMongo();
        const dbUser = await User.findById(token.sub).select("plan");
        token.plan = normalizePlan(dbUser?.plan);
      } else if (token.plan == null) {
        token.plan = "free";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.email = token.email || session.user.email;
        session.user.plan = normalizePlan(token.plan);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-change-me",
});
