import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import GitHubProvider from "next-auth/providers/github"
import { env } from "../../../../env.mjs"

const providers = [
  GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID!,
    clientSecret: env.GOOGLE_CLIENT_SECRET!,
  }),
]

// Add Email provider if configured
if (env.EMAIL_SERVER && env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    })
  )
}

// Add GitHub provider if configured
if (env.GITHUB_ID && env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    })
  )
}

const handler = NextAuth({
  providers,
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
})

export { handler as GET, handler as POST }
