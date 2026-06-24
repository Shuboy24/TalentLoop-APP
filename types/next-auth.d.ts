import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      emailVerified?: boolean;
      onboardingComplete?: boolean;
      isSuspended?: boolean;
    } & DefaultSession["user"]
  }
}
