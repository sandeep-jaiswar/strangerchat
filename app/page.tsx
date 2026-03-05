import { MessageCircle, Sparkles, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

export default async function Home() {
  const session = await getServerSession()

  // If the user is already authenticated, redirect them directly to the app
  if (session) {
    redirect("/chat")
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight">StrangerChat</span>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium transition-colors hover:bg-white/20"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center md:px-6">
        <div className="relative mb-8">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-75 blur-lg"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
        </div>

        <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
          Meet{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Strangers</span>.
          <br />
          Make Friends.
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
          Instantly connect with random people around the world. No downloads, no fuss. Just clean, fast, and anonymous
          real-time chatting.
        </p>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link
            href="/login"
            className="group flex items-center justify-center space-x-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95"
          >
            <Sparkles className="h-5 w-5" />
            <span>Start Chatting Now</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} StrangerChat. All rights reserved.</p>
      </footer>
    </div>
  )
}
