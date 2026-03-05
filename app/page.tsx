import { MessageCircle, ShieldCheck, Sparkles, Users, Zap } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { Button } from "@/components/ui/Button"

export default async function Home() {
  const session = await getServerSession()

  // If the user is already authenticated, redirect them directly to the app
  if (session) {
    redirect("/chat")
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-50 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-slate-950/80 px-6 py-4 backdrop-blur-xl md:px-12">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">StrangerChat</span>
        </div>
        <Link href="/login">
          <Button variant="outline" className="rounded-full border-slate-800 hover:bg-white hover:text-slate-950">
            Sign In
          </Button>
        </Link>
      </nav>

      <main className="flex flex-1 flex-col items-center">
        {/* Hero Section */}
        <section className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-24 text-center md:px-6 lg:py-32">
          {/* Background Glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px] md:h-[800px] md:w-[800px]" />

          <div className="z-10 mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
            <Sparkles className="h-4 w-4" />
            <span>Now with lightning-fast WebSockets</span>
          </div>

          <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
            Meet{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Strangers
            </span>
            .
            <br />
            Make Friends.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Instantly connect with random people around the world for meaningful conversations. No downloads, no
            permanent records. Just you and a stranger.
          </p>

          <Link href="/login">
            <Button size="lg" className="gap-2 rounded-full text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
              Start Chatting <Zap className="h-5 w-5" />
            </Button>
          </Link>

          <p className="mt-6 text-sm text-slate-500">100% Free &bull; No sign up required for matchmaking preview</p>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-6xl border-t border-white/5 px-6 py-24">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-indigo-400 shadow-xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Total Privacy</h3>
              <p className="leading-relaxed text-slate-400">
                We don't use databases to store your chats. Messages exist only in memory and disappear forever when you
                leave.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-purple-400 shadow-xl">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Instant Connections</h3>
              <p className="leading-relaxed text-slate-400">
                Powered by high-performance WebSockets. Skip a chat and connect to a new partner in milliseconds.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-400 shadow-xl">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Global Community</h3>
              <p className="leading-relaxed text-slate-400">
                Join thousands of online users matching simultaneously. Experience diverse cultures and new perspectives
                securely.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} StrangerChat. Built for secure communication.</p>
      </footer>
    </div>
  )
}
