"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  ChessKnight,
  Flame,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { getTimeControl } from "@funstranger/protocol";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { ChessPanel } from "@/components/chess/chess-panel";
import { RankBadge } from "@/components/chess/rank-badge";
import {
  FriendsDrawer,
  type ProfileData,
} from "@/components/friends/friends-drawer";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu, type UserSummary } from "@/components/user-menu";
import { useAiChessGame } from "@/hooks/use-ai-chess";
import {
  type ConnectionStatus,
  useStrangerchat,
} from "@/hooks/use-stranger-chat";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { AD_SLOTS } from "@/lib/ads";
import { BOT_LEVELS } from "@/lib/stockfish";
import { cn } from "@funstranger/ui/lib/utils";
import { Conversation } from "./conversation";
import { Lobby } from "./lobby";

export function ChatRoom({
  user,
  initialInviteCode,
}: {
  user: UserSummary;
  initialInviteCode?: string | null;
}) {
  const chat = useStrangerchat(initialInviteCode);
  const aiChess = useAiChessGame();
  const height = useViewportHeight();
  const inChat = chat.phase === "chatting" || chat.phase === "ended";
  const showAi = !inChat && chat.phase !== "searching" && aiChess.ai !== null;
  const game = inChat ? chat.game : showAi ? aiChess.ai!.game : null;

  const [friendsOpen, setFriendsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadProfileAndRequests = async () => {
      try {
        const [profRes, friendsRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/friends", { cache: "no-store" }),
        ]);
        if (!active) return;
        if (profRes.ok) {
          const data = (await profRes.json()) as { profile: ProfileData | null };
          if (data.profile) setProfile(data.profile);
        }
        if (friendsRes.ok) {
          const data = (await friendsRes.json()) as { incoming?: unknown[] };
          setPendingCount(data.incoming?.length ?? 0);
        }
      } catch {
        // Offline / DB unavailable in local dev.
      }
    };
    void loadProfileAndRequests();
    const timer = setInterval(() => void loadProfileAndRequests(), 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [chat.friendStatus, chat.game?.status, friendsOpen]);

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden"
      style={height ? { height } : undefined}
    >
      <header className="shrink-0 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
          <Logo />
          <div className="flex items-center gap-1.5">
            <StatusBadge connection={chat.connection} online={chat.online} />
            {profile && (
              <div className="hidden items-center gap-1 sm:flex">
                <RankBadge rating={profile.chessRating} />
                {(profile.dailyStreak ?? 0) > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Flame className="size-3 text-amber-500" />
                    {profile.dailyStreak}d
                  </Badge>
                )}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="relative gap-1.5"
              onClick={() => setFriendsOpen(true)}
            >
              <Users className="size-4" />
              <span className="hidden sm:inline">Friends</span>
              {pendingCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {chat.incomingChallenge && (
        <div
          role="alert"
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-primary/10 px-4 py-2 text-sm"
        >
          <span className="flex items-center gap-2 font-medium">
            <ChessKnight className="size-4 text-primary" />
            <span>
              <strong>{chat.incomingChallenge.from.handle}</strong> (Elo{" "}
              {chat.incomingChallenge.from.chessRating}) challenged you to{" "}
              {getTimeControl(chat.incomingChallenge.timeControl).label} chess!
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => {
                aiChess.stopAiGame();
                chat.respondFriendChallenge(
                  chat.incomingChallenge!.challengeId,
                  true,
                );
              }}
            >
              <Check className="size-3.5" />
              Accept &amp; Play
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                chat.respondFriendChallenge(
                  chat.incomingChallenge!.challengeId,
                  false,
                )
              }
            >
              <X className="size-3.5" />
              Decline
            </Button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col lg:flex-row">
          {game && (
            <section
              aria-label="Chess board"
              className="shrink-0 border-b px-3 py-2 lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:border-r lg:border-b-0 lg:p-6"
            >
              {showAi && aiChess.ai ? (
                <ChessPanel
                  game={aiChess.ai.game}
                  partnerGone={false}
                  connected={true}
                  opponentLabel={`Stockfish ${BOT_LEVELS[aiChess.ai.difficulty].label}`}
                  viewportHeight={height}
                  onMove={aiChess.playAiMove}
                  onResign={aiChess.resignAiGame}
                  onOffer={aiChess.offerAi}
                  onFlag={aiChess.flagAiGame}
                />
              ) : (
                <ChessPanel
                  game={game}
                  partnerGone={chat.phase === "ended"}
                  connected={chat.connection === "open"}
                  viewportHeight={height}
                  onMove={chat.playMove}
                  onResign={chat.resign}
                  onOffer={chat.offer}
                  onFlag={chat.claimFlag}
                />
              )}
            </section>
          )}
          {inChat ? (
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col",
                game && "lg:w-96 lg:flex-none",
              )}
            >
              <Conversation
                phase={chat.phase as "chatting" | "ended"}
                connected={chat.connection === "open"}
                messages={chat.messages}
                partnerTyping={chat.partnerTyping}
                hasGame={chat.game !== null}
                chessInvite={chat.chessInvite}
                chessInviteTimeControl={chat.chessInviteTimeControl}
                puzzleDuelInvite={chat.puzzleDuelInvite}
                puzzleDuel={chat.puzzleDuel}
                friendStatus={chat.friendStatus}
                friendPartner={chat.friendPartner}
                sharedTags={chat.sharedTags}
                nextLabel={
                  chat.mode === "chess" ? "Find a new opponent" : undefined
                }
                onSend={chat.sendMessage}
                onTyping={chat.notifyTyping}
                onNext={() => chat.findStranger()}
                onLeave={chat.leave}
                onInviteChess={chat.inviteToChess}
                onRespondChessInvite={chat.respondChessInvite}
                onInvitePuzzleDuel={chat.invitePuzzleDuel}
                onRespondPuzzleDuel={chat.respondPuzzleDuel}
                onPuzzleDuelProgress={chat.reportPuzzleDuelProgress}
                onDismissPuzzleDuel={chat.dismissPuzzleDuel}
                onAddFriend={chat.sendFriendRequest}
                onSafetyAction={chat.safetyAction}
              />
            </div>
          ) : showAi && aiChess.ai ? (
            <div className="flex min-h-0 flex-1 flex-col justify-between p-4 lg:w-96 lg:flex-none">
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <Bot className="size-4 text-primary" />
                    Unrated Bot Practice
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Playing locally in your browser with Stockfish 19 WASM. Real
                    Elo ratings are only affected against human opponents.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {(["casual", "club", "master"] as const).map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={
                          aiChess.ai?.difficulty === level
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                        onClick={() =>
                          aiChess.startAiGame(level, chat.timeControl)
                        }
                      >
                        ~{BOT_LEVELS[level].rating}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={chat.connection !== "open"}
                  onClick={() => {
                    aiChess.stopAiGame();
                    chat.findStranger("chess", chat.tags, chat.timeControl);
                  }}
                >
                  <ChessKnight />
                  Find human chess opponent
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={aiChess.stopAiGame}
                className="mt-4 w-full"
              >
                <ArrowLeft />
                Back to Lobby
              </Button>
            </div>
          ) : (
            <Lobby
              searching={chat.phase === "searching"}
              mode={chat.mode}
              timeControl={chat.timeControl}
              tags={chat.tags}
              ready={chat.connection === "open"}
              online={chat.online}
              inviteCode={chat.inviteCode}
              inviteMode={chat.inviteMode}
              onTagsChange={chat.setTags}
              onTimeControlChange={chat.setTimeControl}
              onStart={(mode, tc) => {
                aiChess.stopAiGame();
                chat.findStranger(mode, chat.tags, tc ?? chat.timeControl);
              }}
              onCreateInvite={(mode, tc) => {
                aiChess.stopAiGame();
                chat.createInvite(mode, tc ?? chat.timeControl);
              }}
              onStartAi={(difficulty, tc) =>
                aiChess.startAiGame(difficulty, tc)
              }
              onCancel={chat.leave}
            />
          )}
        </main>

        {/* With a board on screen there's only room for the sidebar on wide screens. */}
        <aside
          className={cn(
            "hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4",
            game ? "2xl:flex" : "lg:flex",
          )}
        >
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 font-medium">
              <ShieldAlert className="size-4 text-primary" />
              Stay safe
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Don&apos;t share your phone number, address or socials.</li>
              <li>Use Add Friend to keep talking safely with handles only.</li>
              <li>
                Press <kbd className="rounded border px-1 text-xs">Esc</kbd> to
                skip to the next stranger.
              </li>
            </ul>
          </div>
          <AdSlot
            slot={AD_SLOTS.sidebar}
            format="vertical"
            className="min-h-[600px]"
          />
        </aside>
      </div>

      <FriendsDrawer
        open={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        profile={profile}
        onProfileUpdated={setProfile}
        onChallengeFriend={chat.challengeFriend}
      />
    </div>
  );
}

function StatusBadge({
  connection,
  online,
}: {
  connection: ConnectionStatus;
  online: number;
}) {
  const label =
    connection === "open"
      ? `${online.toLocaleString()} online`
      : connection === "connecting"
        ? "Connecting…"
        : "Reconnecting…";

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 font-normal"
      aria-live="polite"
    >
      <span
        className={
          connection === "open"
            ? "size-1.5 rounded-full bg-success"
            : "size-1.5 animate-pulse rounded-full bg-amber-500"
        }
      />
      {label}
    </Badge>
  );
}
