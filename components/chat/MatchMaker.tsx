"use client"

import { Users, Loader2 } from "lucide-react"

interface MatchMakerProps {
    onFindMatch: () => void
    isConnecting: boolean
    isMatching: boolean
    onlineCount: number
}

export function MatchMaker({ onFindMatch, isConnecting, isMatching, onlineCount }: MatchMakerProps) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="absolute -inset-4 animate-pulse rounded-full bg-indigo-500/20 blur-xl"></div>
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-indigo-500/30 bg-slate-900 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
                    {(isConnecting || isMatching) ? (
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
                    ) : (
                        <Users className="h-12 w-12 text-indigo-400" />
                    )}
                </div>
            </div>

            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                {isConnecting ? "Connecting to Server..." : isMatching ? "Looking for Someone..." : "Ready to Chat!"}
            </h2>

            <p className="mb-8 text-slate-400">
                {isConnecting ? (
                    "Establishing a secure connection."
                ) : isMatching ? (
                    "Finding a random stranger to connect you with."
                ) : (
                    `There are currently ${onlineCount} users online.`
                )}
            </p>

            <button
                onClick={onFindMatch}
                disabled={isConnecting || isMatching}
                className="group relative flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:scale-105 hover:shadow-indigo-500/25 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
                {isConnecting || isMatching ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Please wait...</span>
                    </>
                ) : (
                    <span>Find a Stranger</span>
                )}
            </button>
        </div>
    )
}
