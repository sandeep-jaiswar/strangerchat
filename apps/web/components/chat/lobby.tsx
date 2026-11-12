"use client";

import { useState } from "react";
import {
  ChessKnight,
  Hash,
  Loader2,
  MessageCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import { MAX_TAGS, MAX_TAG_LENGTH, type ChatMode } from "@repo/protocol";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_SLOTS } from "@/lib/ads";
import { cn } from "@repo/ui/lib/utils";

const SUGGESTED_TAGS = [
  "chess",
  "coding",
  "music",
  "movies",
  "gaming",
  "languages",
];

interface LobbyProps {
  searching: boolean;
  /** What we're searching for (or last searched for). */
  mode: ChatMode;
  tags: string[];
  ready: boolean;
  online: number;
  onTagsChange: (tags: string[]) => void;
  onStart: (mode: ChatMode) => void;
  onCancel: () => void;
}

export function Lobby({
  searching,
  mode,
  tags,
  ready,
  online,
  onTagsChange,
  onStart,
  onCancel,
}: LobbyProps) {
  const chess = mode === "chess";
  const [customTag, setCustomTag] = useState("");

  const toggleTag = (raw: string) => {
    const clean = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, MAX_TAG_LENGTH);
    if (!clean) return;
    if (tags.includes(clean)) {
      onTagsChange(tags.filter((t) => t !== clean));
    } else if (tags.length < MAX_TAGS) {
      onTagsChange([...tags, clean]);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <div className="relative mb-6 flex size-32 items-center justify-center sm:size-40">
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
              : tags.length > 0
                ? `Preferring strangers interested in ${tags.map((t) => `#${t}`).join(", ")}…`
                : "Hang tight — you'll be connected as soon as someone is free."
            : ready
              ? `${online.toLocaleString()} ${online === 1 ? "person is" : "people are"} online right now.`
              : "Connecting to the chat server…"}
        </p>

        {!searching && (
          <div className="mt-6 w-full max-w-sm rounded-xl border bg-card/60 p-3 text-left">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium">
                <Hash className="size-3.5" />
                Interests (optional, up to {MAX_TAGS})
              </span>
              {tags.length > 0 && (
                <button
                  type="button"
                  onClick={() => onTagsChange([])}
                  className="hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    #{tag}
                  </button>
                );
              })}
              {tags
                .filter((t) => !SUGGESTED_TAGS.includes(t))
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="cursor-pointer gap-1"
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                    <X className="size-3" />
                  </Badge>
                ))}
            </div>
            {tags.length < MAX_TAGS && (
              <form
                className="mt-2 flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  toggleTag(customTag);
                  setCustomTag("");
                }}
              >
                <input
                  value={customTag}
                  maxLength={MAX_TAG_LENGTH}
                  placeholder="Add custom interest (e.g. anime)…"
                  className="h-8 flex-1 rounded-md border bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                  onChange={(e) => setCustomTag(e.target.value)}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  disabled={!customTag.trim()}
                >
                  Add
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 w-full max-w-xs">
          {searching ? (
            <div className="space-y-6">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <AdSlot slot={AD_SLOTS.banner} format="auto" />
            </div>
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

      {/* The desktop sidebar carries its own ad; keep mobile idle ads away from the chat itself. */}
      {!searching && (
        <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
          <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
        </div>
      )}
    </div>
  );
}
