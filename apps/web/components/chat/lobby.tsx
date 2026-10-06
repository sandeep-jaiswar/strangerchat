import {
  ChessKnight,
  Loader2,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import type { ChatMode } from "@repo/protocol";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_SLOTS } from "@/lib/ads";

interface LobbyProps {
  searching: boolean;
  /** What we're searching for (or last searched for). */
  mode: ChatMode;
  ready: boolean;
  online: number;
  onStart: (mode: ChatMode) => void;
  onCancel: () => void;
}

export function Lobby({
  searching,
  mode,
  ready,
  online,
  onStart,
  onCancel,
}: LobbyProps) {
  const chess = mode === "chess";
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative mb-8 flex size-36 items-center justify-center sm:size-44">
          {searching && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
              <span className="absolute inset-5 animate-ping rounded-full bg-primary/20 [animation-delay:400ms]" />
            </>
          )}
          <span className="relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            {searching ? (
              chess ? (
                <ChessKnight className="size-8 animate-pulse" />
              ) : (
                <Search className="size-8 animate-pulse" />
              )
            ) : (
              <Users className="size-8" />
            )}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {searching
            ? chess
              ? "Looking for a chess partner…"
              : "Looking for a stranger…"
            : "Ready to meet someone new?"}
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground" aria-live="polite">
          {searching
            ? chess
              ? "You'll play a casual 10-minute game and can chat while you play."
              : "Hang tight — you'll be connected as soon as someone is free."
            : ready
              ? `${online.toLocaleString()} ${online === 1 ? "person is" : "people are"} online right now.`
              : "Connecting to the chat server…"}
        </p>

        <div className="mt-8 w-full max-w-xs">
          {searching ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                disabled={!ready}
                onClick={() => onStart("chat")}
              >
                {ready ? (
                  <MessageCircle />
                ) : (
                  <Loader2 className="animate-spin" />
                )}
                Start chatting
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                disabled={!ready}
                onClick={() => onStart("chess")}
              >
                <ChessKnight />
                Play chess with a stranger
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* The desktop sidebar carries its own ad; keep mobile ads away from the chat itself. */}
      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
      </div>
    </div>
  );
}
