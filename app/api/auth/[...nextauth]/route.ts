import NextAuth from "next-auth";
import { authConfig } from "@/config/auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === authConfig.demoCredentials.email && credentials?.password === authConfig.demoCredentials.password) {
          return {
            id: authConfig.demoCredentials.id,
            name: authConfig.demoCredentials.name,
            email: authConfig.demoCredentials.email,
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: authConfig.loginUrl,
  },
  session: {
    strategy: "jwt",
  },
  secret: authConfig.secret,
});

export { handler as GET, handler as POST };
