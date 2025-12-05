import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { env } from "../../../../env.mjs"

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add Email provider if configured
    ...(env.EMAIL_SERVER && env.EMAIL_FROM
      ? [
          EmailProvider({
            server: env.EMAIL_SERVER,
            from: env.EMAIL_FROM,
          }),
        ]
      : []),
    // Add GitHub provider if configured
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
