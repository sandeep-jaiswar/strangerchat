"use client";

import { ShieldAlert } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { AdSlot } from "@/components/ads/ad-slot";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu, type UserSummary } from "@/components/user-menu";
import {
  type ConnectionStatus,
  useStrangerchat,
} from "@/hooks/use-stranger-chat";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { AD_SLOTS } from "@/lib/ads";
import { Conversation } from "./conversation";
import { Lobby } from "./lobby";

export function ChatRoom({ user }: { user: UserSummary }) {
  const chat = useStrangerchat();
  const height = useViewportHeight();

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden"
      style={height ? { height } : undefined}
    >
      <header className="shrink-0 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4">
          <Logo />
          <div className="flex items-center gap-1">
            <StatusBadge connection={chat.connection} online={chat.online} />
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          {chat.phase === "chatting" || chat.phase === "ended" ? (
            <Conversation
              phase={chat.phase}
              connected={chat.connection === "open"}
              messages={chat.messages}
              partnerTyping={chat.partnerTyping}
              onSend={chat.sendMessage}
              onTyping={chat.notifyTyping}
              onNext={chat.findStranger}
              onLeave={chat.leave}
            />
          ) : (
            <Lobby
              searching={chat.phase === "searching"}
              ready={chat.connection === "open"}
              online={chat.online}
              onStart={chat.findStranger}
              onCancel={chat.leave}
            />
          )}
        </main>

        <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4 lg:flex">
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 font-medium">
              <ShieldAlert className="size-4 text-primary" />
              Stay safe
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Don&apos;t share your phone number, address or socials.</li>
              <li>Skip anyone who makes you uncomfortable.</li>
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
