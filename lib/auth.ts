import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { loginSchema } from "./validations/auth";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid email or password";
}

class SuspendedError extends CredentialsSignin {
  code = "Account suspended";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new InvalidLoginError();
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user) {
          throw new InvalidLoginError();
        }

        if (user.isSuspended) {
          throw new SuspendedError();
        }

        const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        
        if (!isPasswordValid) {
          throw new InvalidLoginError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { isAdmin: true, emailVerified: true, onboardingComplete: true, isSuspended: true }
        });
        
        if (dbUser) {
          session.user.isAdmin = dbUser.isAdmin;
          session.user.emailVerified = dbUser.emailVerified;
          session.user.onboardingComplete = dbUser.onboardingComplete;
          session.user.isSuspended = dbUser.isSuspended;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});
