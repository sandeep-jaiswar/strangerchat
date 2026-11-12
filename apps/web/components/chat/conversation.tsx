"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChessKnight,
  Flag,
  MoreVertical,
  SendHorizontal,
  ShieldBan,
  SkipForward,
  Swords,
  UserCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import {
  MAX_MESSAGE_LENGTH,
  TIME_CONTROLS,
  getTimeControl,
  type PublicFriendProfile,
  type TimeControlId,
} from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@funstranger/ui/components/dropdown-menu";
import { Textarea } from "@funstranger/ui/components/textarea";
import { cn } from "@funstranger/ui/lib/utils";
import { AdSlot } from "@/components/ads/ad-slot";
import { PuzzleDuelPanel } from "@/components/chess/puzzle-duel-panel";
import type {
  ChatItem,
  ChatPhase,
  FriendHandshakeStatus,
  PuzzleDuelView,
} from "@/hooks/use-stranger-chat";
import { AD_SLOTS } from "@/lib/ads";

interface ConversationProps {
  phase: Extract<ChatPhase, "chatting" | "ended">;
  /** False while the socket is reconnecting; the chat itself is kept alive server-side. */
  connected: boolean;
  messages: ChatItem[];
  partnerTyping: boolean;
  hasGame: boolean;
  chessInvite: "me" | "them" | null;
  chessInviteTimeControl: TimeControlId | null;
  puzzleDuelInvite: "me" | "them" | null;
  puzzleDuel: PuzzleDuelView | null;
  friendStatus: FriendHandshakeStatus;
  friendPartner: PublicFriendProfile | null;
  sharedTags: string[];
  /** Label of the button that finds someone new once the chat has ended. */
  nextLabel?: string;
  onSend: (text: string) => boolean;
  onTyping: () => void;
  onNext: () => void;
  onLeave: () => void;
  onInviteChess: (timeControl?: TimeControlId) => void;
  onRespondChessInvite: (accept: boolean) => void;
  onInvitePuzzleDuel: () => void;
  onRespondPuzzleDuel: (accept: boolean) => void;
  onPuzzleDuelProgress: (
    duelId: string,
    solved: number,
    mistakes: number,
    finished: boolean,
  ) => void;
  onDismissPuzzleDuel: () => void;
  onAddFriend: () => void;
  onSafetyAction: (action: "block" | "report", reason?: string) => void;
}

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

export function Conversation({
  phase,
  connected,
  messages,
  partnerTyping,
  hasGame,
  chessInvite,
  chessInviteTimeControl,
  puzzleDuelInvite,
  puzzleDuel,
  friendStatus,
  friendPartner,
  sharedTags,
  nextLabel = "Find a new stranger",
  onSend,
  onTyping,
  onNext,
  onLeave,
  onInviteChess,
  onRespondChessInvite,
  onInvitePuzzleDuel,
  onRespondPuzzleDuel,
  onPuzzleDuelProgress,
  onDismissPuzzleDuel,
  onAddFriend,
  onSafetyAction,
}: ConversationProps) {
  const ended = phase === "ended";

  // Skipping needs a second press within a few seconds so it can't happen by accident.
  const [confirmingNext, setConfirmingNext] = useState(false);
  useEffect(() => {
    if (!confirmingNext) return;
    const timer = setTimeout(() => setConfirmingNext(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmingNext]);

  const handleNext = () => {
    if (ended || confirmingNext) {
      setConfirmingNext(false);
      onNext();
    } else {
      setConfirmingNext(true);
    }
  };
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleNextRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <UserRound className="size-4" />
            <span
              className={cn(
                "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
                ended
                  ? "bg-muted-foreground"
                  : connected
                    ? "bg-success"
                    : "animate-pulse bg-amber-500",
              )}
            />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium">
                {friendPartner ? friendPartner.handle : "Stranger"}
              </p>
              {sharedTags.length > 0 && (
                <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
                  #{sharedTags[0]}
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {ended
                ? "Left the chat"
                : !connected
                  ? "Reconnecting…"
                  : partnerTyping
                    ? "Typing…"
                    : "Online"}
            </p>
          </div>
        </div>

        {!ended && (
          <div className="flex shrink-0 items-center gap-1.5">
            {!hasGame && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant={
                      chessInvite === "me" || puzzleDuelInvite === "me"
                        ? "secondary"
                        : "outline"
                    }
                    disabled={
                      !connected ||
                      (chessInvite !== null && puzzleDuelInvite !== null)
                    }
                    title="Challenge to chess or puzzle duel"
                  >
                    <ChessKnight className="size-4" />
                    <span className="hidden sm:inline">
                      {chessInvite === "me" || puzzleDuelInvite === "me"
                        ? "Invited…"
                        : "Play chess"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.values(TIME_CONTROLS).map((tc) => (
                    <DropdownMenuItem
                      key={tc.id}
                      disabled={chessInvite !== null}
                      onClick={() => onInviteChess(tc.id)}
                    >
                      <ChessKnight className="size-4" />
                      {tc.label} {tc.category} Chess
                    </DropdownMenuItem>
                  ))}
                  {!puzzleDuel && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={puzzleDuelInvite !== null}
                        onClick={onInvitePuzzleDuel}
                      >
                        <Swords className="size-4 text-primary" />
                        90s Puzzle Duel
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              size="sm"
              variant={
                friendStatus === "accepted"
                  ? "secondary"
                  : friendStatus === "pending_them"
                    ? "default"
                    : "outline"
              }
              disabled={
                !connected ||
                friendStatus === "pending_me" ||
                friendStatus === "accepted"
              }
              onClick={onAddFriend}
              title="Add friend"
            >
              {friendStatus === "accepted" ? (
                <UserCheck className="size-4 text-success" />
              ) : (
                <UserPlus className="size-4" />
              )}
              <span className="hidden sm:inline">
                {friendStatus === "accepted"
                  ? "Friends"
                  : friendStatus === "pending_me"
                    ? "Requested"
                    : friendStatus === "pending_them"
                      ? "Accept friend"
                      : "Add friend"}
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={!connected}
                  aria-label="Safety options"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSafetyAction("block")}>
                  <ShieldBan className="size-4" />
                  Block & skip stranger
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onSafetyAction("report", "harassment_or_spam")}
                >
                  <Flag className="size-4" />
                  Report & block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {!ended && chessInvite === "them" && !hasGame && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-accent/60 px-4 py-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <ChessKnight className="size-4 text-primary" />
            Stranger wants to play{" "}
            {getTimeControl(chessInviteTimeControl ?? undefined).label} chess!
          </span>
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={() => onRespondChessInvite(true)}>
              <Check className="size-3.5" />
              Play
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRespondChessInvite(false)}
            >
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        </div>
      )}

      {!ended && puzzleDuelInvite === "them" && !puzzleDuel && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-accent/60 px-4 py-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Swords className="size-4 text-primary" />
            Stranger challenged you to a 90s Puzzle Duel!
          </span>
          <div className="flex items-center gap-1.5">
            <Button size="sm" onClick={() => onRespondPuzzleDuel(true)}>
              <Check className="size-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRespondPuzzleDuel(false)}
            >
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        </div>
      )}

      {puzzleDuel && (
        <PuzzleDuelPanel
          duel={puzzleDuel}
          onProgress={onPuzzleDuelProgress}
          onDismiss={onDismissPuzzleDuel}
        />
      )}

      <MessageList
        messages={messages}
        partnerTyping={partnerTyping && !ended}
      />

      <div className="shrink-0 border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
        <div className="mx-auto max-w-3xl">
          {ended ? (
            <div className="space-y-3">
              <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
              <div className="flex gap-2">
                <Button variant="outline" size="lg" onClick={onLeave}>
                  <ArrowLeft />
                  <span className="sr-only sm:not-sr-only">Lobby</span>
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!connected}
                  onClick={onNext}
                >
                  <SkipForward />
                  {nextLabel}
                </Button>
              </div>
            </div>
          ) : (
            <Composer
              connected={connected}
              confirmingNext={confirmingNext}
              onNext={handleNext}
              onSend={onSend}
              onTyping={onTyping}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Composer({
  connected,
  confirmingNext,
  onNext,
  onSend,
  onTyping,
}: {
  connected: boolean;
  confirmingNext: boolean;
  onNext: () => void;
  onSend: (text: string) => boolean;
  onTyping: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Opening the on-screen keyboard unprompted is jarring on phones.
    if (!isTouchDevice()) inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (onSend(text)) setText("");
  };

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Button
        type="button"
        size="lg"
        variant={confirmingNext ? "destructive" : "outline"}
        className="h-10 shrink-0 px-3"
        disabled={!connected}
        onClick={onNext}
        aria-label={confirmingNext ? "Confirm skip" : "Skip to next stranger"}
      >
        <SkipForward />
        <span className={cn(!confirmingNext && "hidden sm:inline")}>
          {confirmingNext ? "Sure?" : "Next"}
        </span>
      </Button>

      <Textarea
        ref={inputRef}
        value={text}
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        enterKeyHint="send"
        placeholder="Type a message…"
        aria-label="Message"
        className="max-h-32 min-h-10 resize-none py-2"
        onChange={(event) => {
          setText(event.target.value);
          onTyping();
        }}
        onKeyDown={(event) => {
          // Desktop: Enter sends, Shift+Enter adds a line. Touch keyboards keep Enter as newline.
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            !isTouchDevice()
          ) {
            event.preventDefault();
            submit();
          }
        }}
      />

      <Button
        type="submit"
        size="icon"
        className="size-10 shrink-0"
        disabled={!connected || !text.trim()}
        aria-label="Send message"
        // Keep focus in the textarea so the mobile keyboard stays open after sending.
        onPointerDown={(event) => event.preventDefault()}
      >
        <SendHorizontal />
      </Button>
    </form>
  );
}

const MessageList = memo(function MessageList({
  messages,
  partnerTyping,
}: {
  messages: ChatItem[];
  partnerTyping: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    const last = messages.at(-1);
    // Follow new messages unless the user has scrolled up to read history.
    if (el && (pinnedToBottom.current || last?.from === "me")) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, partnerTyping]);

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      onScroll={(event) => {
        const el = event.currentTarget;
        pinnedToBottom.current =
          el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      }}
    >
      <ol
        className="ph-no-capture mx-auto flex max-w-3xl flex-col gap-1.5 px-3 py-4 sm:px-4"
        aria-live="polite"
      >
        {messages.map((message, index) => {
          if (message.from === "system") {
            return (
              <li
                key={message.id}
                className="my-2 self-center rounded-full bg-muted px-3 py-1 text-center text-xs text-muted-foreground"
              >
                {message.text}
              </li>
            );
          }
          const mine = message.from === "me";
          const groupedWithPrevious =
            messages[index - 1]?.from === message.from;
          return (
            <li
              key={message.id}
              title={new Date(message.sentAt).toLocaleTimeString()}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug break-words whitespace-pre-wrap sm:max-w-[70%]",
                mine
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-muted text-foreground",
                !groupedWithPrevious && "mt-2",
                groupedWithPrevious &&
                  (mine ? "rounded-tr-md" : "rounded-tl-md"),
              )}
            >
              <span className="sr-only">{mine ? "You: " : "Stranger: "}</span>
              {message.text}
            </li>
          );
        })}
        {partnerTyping && (
          <li className="mt-2 flex gap-1 self-start rounded-2xl bg-muted px-4 py-3">
            <span className="sr-only">Stranger is typing</span>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </li>
        )}
      </ol>
    </div>
  );
});
