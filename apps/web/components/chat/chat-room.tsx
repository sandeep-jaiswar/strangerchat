"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Trophy, Users } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import {
  FriendsDrawer,
  type ProfileData,
} from "@/components/friends/friends-drawer";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu, type UserSummary } from "@/components/user-menu";
import {
  type ConnectionStatus,
  useStrangerchat,
} from "@/hooks/use-stranger-chat";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { AD_SLOTS } from "@/lib/ads";
import { cn } from "@repo/ui/lib/utils";
import { ChessPanel } from "../chess/chess-panel";
import { Conversation } from "./conversation";
import { Lobby } from "./lobby";

export function ChatRoom({ user }: { user: UserSummary }) {
  const chat = useStrangerchat();
  const height = useViewportHeight();
  const inChat = chat.phase === "chatting" || chat.phase === "ended";
  const game = inChat ? chat.game : null;

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
              <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
                <Trophy className="size-3 text-amber-500" />
                {profile.chessRating}
              </Badge>
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

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col lg:flex-row">
          {game && (
            <section
              aria-label="Chess board"
              className="shrink-0 border-b px-3 py-2 lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:border-r lg:border-b-0 lg:p-6"
            >
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
            </section>
          )}
          {chat.phase === "chatting" || chat.phase === "ended" ? (
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col",
                game && "lg:w-96 lg:flex-none",
              )}
            >
              <Conversation
                phase={chat.phase}
                connected={chat.connection === "open"}
                messages={chat.messages}
                partnerTyping={chat.partnerTyping}
                hasGame={game !== null}
                chessInvite={chat.chessInvite}
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
                onAddFriend={chat.sendFriendRequest}
                onSafetyAction={chat.safetyAction}
              />
            </div>
          ) : (
            <Lobby
              searching={chat.phase === "searching"}
              mode={chat.mode}
              tags={chat.tags}
              ready={chat.connection === "open"}
              online={chat.online}
              onTagsChange={chat.setTags}
              onStart={chat.findStranger}
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
