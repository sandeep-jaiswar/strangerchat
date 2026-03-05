"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface MatchMakerProps {
  onFindMatch: () => void
  isConnecting: boolean
  isMatching: boolean
  onlineCount: number
}

export function MatchMaker({ onFindMatch, isConnecting, isMatching, onlineCount }: MatchMakerProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-12 flex h-48 w-48 items-center justify-center">
        {/* Radar Waves */}
        {(isConnecting || isMatching) && (
          <>
            <div className="animation-delay-[0ms] absolute inset-0 animate-ping rounded-full border border-indigo-500/50 bg-indigo-500/10 opacity-75" />
            <div className="animation-delay-[500ms] absolute inset-4 animate-ping rounded-full border border-indigo-500/40 bg-indigo-500/10 opacity-50" />
            <div className="animation-delay-[1000ms] absolute inset-8 animate-ping rounded-full border border-indigo-500/30 bg-indigo-500/10 opacity-25" />
          </>
        )}

        {/* Central Core */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 shadow-[0_0_40px_-5px_rgba(79,70,229,0.5)]">
          {isConnecting || isMatching ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <div className="h-8 w-8 rounded-full border-4 border-white/80 bg-transparent" />
          )}
        </div>
      </div>

      <h2 className="mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
        {isConnecting ? "Connecting to Server..." : isMatching ? "Scanning for Strangers..." : "Ready to Chat!"}
      </h2>

      <p className="mb-10 max-w-sm text-lg text-slate-400">
        {isConnecting
          ? "Establishing a secure connection."
          : isMatching
          ? "Finding a random stranger to connect you with instantly."
          : `There are currently ${onlineCount} users online.`}
      </p>

      <Button
        size="lg"
        onClick={onFindMatch}
        disabled={isConnecting || isMatching}
        isLoading={isConnecting || isMatching}
        className="rounded-full shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
      >
        {isConnecting || isMatching ? "Please wait..." : "Find a Stranger"}
      </Button>
    </div>
  )
}
