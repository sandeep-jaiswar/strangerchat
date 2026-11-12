"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChessKnight,
  Copy,
  Hash,
  Link2,
  Loader2,
  MessageCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  CHESS_PUZZLES,
  MAX_TAGS,
  MAX_TAG_LENGTH,
  TIME_CONTROLS,
  getTimeControl,
  type ChatMode,
  type TimeControlId,
} from "@repo/protocol";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { AdSlot } from "@/components/ads/ad-slot";
import { PuzzleBoard } from "@/components/chess/puzzle-board";
import { AD_SLOTS } from "@/lib/ads";
import { BOT_LEVELS, type BotDifficulty } from "@/lib/stockfish";

const SUGGESTED_TAGS = [
  "chess",
  "coding",
  "music",
  "movies",
  "gaming",
  "languages",
];

const TIME_CONTROL_LIST = Object.values(TIME_CONTROLS);

interface LobbyProps {
  searching: boolean;
  /** What we're searching for (or last searched for). */
  mode: ChatMode;
  timeControl: TimeControlId;
  tags: string[];
  ready: boolean;
  online: number;
  inviteCode: string | null;
  inviteMode: ChatMode | null;
  onTagsChange: (tags: string[]) => void;
  onTimeControlChange: (tc: TimeControlId) => void;
  onStart: (mode: ChatMode, tc?: TimeControlId) => void;
  onCreateInvite: (mode: ChatMode, tc?: TimeControlId) => void;
  onStartAi: (difficulty: BotDifficulty, tc: TimeControlId) => void;
  onCancel: () => void;
}

export function Lobby({
  searching,
  mode,
  timeControl,
  tags,
  ready,
  online,
  inviteCode,
  inviteMode,
  onTagsChange,
  onTimeControlChange,
  onStart,
  onCreateInvite,
  onStartAi,
  onCancel,
}: LobbyProps) {
  const chess = mode === "chess";
  const waiting = searching || inviteCode !== null;
  const tcSpec = getTimeControl(timeControl);

  const [customTag, setCustomTag] = useState("");
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!searching) return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setWaitSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => {
      clearInterval(timer);
      setWaitSeconds(0);
    };
  }, [searching]);

  const inviteUrl =
    inviteCode && typeof window !== "undefined"
      ? `${window.location.origin}/c/${inviteCode}`
      : inviteCode
        ? `/c/${inviteCode}`
        : "";

  const copyInviteUrl = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts.
    }
  };

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

  const puzzle = CHESS_PUZZLES[puzzleIndex]!;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        {!waiting && (
          <div className="relative mb-5 flex size-24 items-center justify-center sm:size-28">
            <span className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 sm:size-20">
              <Users className="size-8" />
            </span>
          </div>
        )}

        {waiting && (
          <div className="relative mb-4 flex size-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25">
              {inviteCode ? (
                <Link2 className="size-6" />
              ) : chess ? (
                <ChessKnight className="size-6 animate-pulse" />
              ) : (
                <Search className="size-6 animate-pulse" />
              )}
            </span>
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {inviteCode
            ? "Waiting for your invited friend…"
            : searching
              ? chess
                ? `Looking for a ${tcSpec.label} chess partner…`
                : "Looking for a stranger…"
              : "Ready to meet someone new?"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground" aria-live="polite">
          {inviteCode
            ? `Share the ${inviteMode === "chess" ? `${tcSpec.label} chess` : "chat"} link below — they'll join your room as soon as they open it.`
            : searching
              ? chess
                ? `Queued for ${tcSpec.label} ${tcSpec.category}. Solve a warm-up puzzle while we pair you!`
                : tags.length > 0
                  ? `Preferring strangers interested in ${tags.map((t) => `#${t}`).join(", ")} — warm up with a puzzle while waiting!`
                  : "Warm up with a chess puzzle while we connect you with someone free."
              : ready
                ? `${online.toLocaleString()} ${online === 1 ? "person is" : "people are"} online right now.`
                : "Connecting to the chat server…"}
        </p>

        {inviteCode && (
          <div className="mt-5 w-full max-w-sm space-y-3 rounded-xl border bg-card p-4 text-left shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">
              Private invite link ({inviteMode === "chess" ? `${tcSpec.label} Chess` : "Stranger Chat"})
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteUrl}
                aria-label="Invite URL"
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 flex-1 rounded-md border bg-background px-2.5 font-mono text-xs outline-none"
              />
              <Button size="sm" onClick={() => void copyInviteUrl()}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onCancel}
            >
              Cancel invite
            </Button>
          </div>
        )}

        {searching && (
          <div className="mt-5 w-full max-w-sm space-y-4">
            <div className="rounded-xl border bg-card/80 p-3.5 text-left shadow-xs">
              <PuzzleBoard
                compact
                puzzle={puzzle}
                onSolved={() =>
                  setTimeout(
                    () => setPuzzleIndex((prev) => (prev + 1) % CHESS_PUZZLES.length),
                    700,
                  )
                }
                footerAction={
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      setPuzzleIndex((prev) => (prev + 1) % CHESS_PUZZLES.length)
                    }
                  >
                    Next
                    <ArrowRight className="size-3" />
                  </Button>
                }
              />
            </div>

            {waitSeconds >= 10 && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-left">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <Bot className="size-4 text-primary" />
                    Quiet queue? Play Stockfish Bot now (Unrated)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["casual", "club", "master"] as const).map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={level === "club" ? "default" : "outline"}
                      className="text-xs"
                      onClick={() => {
                        onCancel();
                        onStartAi(level, timeControl);
                      }}
                    >
                      ~{BOT_LEVELS[level].rating}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onCancel}
            >
              Cancel search
            </Button>
            <AdSlot slot={AD_SLOTS.banner} format="auto" />
          </div>
        )}

        {!waiting && (
          <>
            <div className="mt-5 w-full max-w-sm rounded-xl border bg-card/60 p-3 text-left">
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

            <div className="mt-5 w-full max-w-sm space-y-3">
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

                <div className="rounded-xl border bg-card/60 p-2.5 space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    {TIME_CONTROL_LIST.map((tc) => (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => onTimeControlChange(tc.id)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                          tc.id === timeControl
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <div>{tc.label}</div>
                        <div className="text-[10px] opacity-80">{tc.category}</div>
                      </button>
                    ))}
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled={!ready}
                    onClick={() => onStart("chess", timeControl)}
                  >
                    <ChessKnight />
                    Play {tcSpec.label} chess with a stranger
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 border text-xs"
                  disabled={!ready}
                  onClick={() => onCreateInvite("chess", timeControl)}
                >
                  <Link2 className="size-3.5" />
                  Invite link ({tcSpec.label})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 border text-xs"
                  onClick={() => onStartAi("club", timeControl)}
                >
                  <Bot className="size-3.5" />
                  Practice vs Bot
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* The desktop sidebar carries its own ad; keep mobile idle ads away from the chat itself. */}
      {!waiting && (
        <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
          <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
        </div>
      )}
    </div>
  );
}
