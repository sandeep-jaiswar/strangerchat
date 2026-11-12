"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChessKnight,
  MessageSquare,
  Pencil,
  SendHorizontal,
  ShieldBan,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@funstranger/ui/components/badge";
import { Button } from "@funstranger/ui/components/button";
import { Textarea } from "@funstranger/ui/components/textarea";
import { cn } from "@funstranger/ui/lib/utils";

export interface ProfileData {
  id: string;
  handle: string;
  avatarSeed: string;
  chessRating: number;
  chessWins: number;
  chessLosses: number;
  chessDraws: number;
}

export interface FriendEntry {
  id: string;
  handle: string;
  avatarSeed: string;
  chessRating: number;
  online?: boolean;
}

interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: number;
}

interface FriendsDrawerProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onProfileUpdated: (profile: ProfileData) => void;
}

export function FriendsDrawer({
  open,
  onClose,
  profile,
  onProfileUpdated,
}: FriendsDrawerProps) {
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [incoming, setIncoming] = useState<FriendEntry[]>([]);
  const [outgoing, setOutgoing] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingHandle, setEditingHandle] = useState(false);
  const [handleInput, setHandleInput] = useState("");
  const [savingHandle, setSavingHandle] = useState(false);

  const [activeFriend, setActiveFriend] = useState<FriendEntry | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        friends: FriendEntry[];
        incoming: FriendEntry[];
        outgoing: FriendEntry[];
      };
      setFriends(data.friends ?? []);
      setIncoming(data.incoming ?? []);
      setOutgoing(data.outgoing ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (friendId: string) => {
    const res = await fetch(`/api/friends/${friendId}/messages`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { messages: DirectMessage[] };
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadFriends();
    const timer = setInterval(() => void loadFriends(), 15_000);
    return () => clearInterval(timer);
  }, [open, loadFriends]);

  useEffect(() => {
    if (!open || !activeFriend) return;
    void loadMessages(activeFriend.id);
    const timer = setInterval(() => void loadMessages(activeFriend.id), 4_000);
    return () => clearInterval(timer);
  }, [open, activeFriend, loadMessages]);

  if (!open) return null;

  const saveHandle = async () => {
    if (!profile) return;
    setSavingHandle(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handleInput }),
      });
      const data = (await res.json()) as { handle?: string; error?: string };
      if (!res.ok || !data.handle) {
        toast.error(data.error ?? "Unable to update handle.");
        return;
      }
      onProfileUpdated({ ...profile, handle: data.handle });
      setEditingHandle(false);
      toast.success("Handle updated.");
    } finally {
      setSavingHandle(false);
    }
  };

  const handleFriendAction = async (
    action: "accept" | "decline" | "remove" | "block",
    targetId: string,
  ) => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    if (!res.ok) {
      toast.error("Action failed. Please try again.");
      return;
    }
    if (activeFriend?.id === targetId && (action === "remove" || action === "block")) {
      setActiveFriend(null);
    }
    await loadFriends();
  };

  const sendDirectMessage = async () => {
    if (!activeFriend || !draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/friends/${activeFriend.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft }),
      });
      const data = (await res.json()) as {
        message?: DirectMessage;
        error?: string;
      };
      if (!res.ok || !data.message) {
        toast.error(data.error ?? "Unable to send message.");
        return;
      }
      setMessages((prev) => [...prev, data.message!]);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[1px]">
      <div
        role="dialog"
        aria-label="Friends and profile"
        className="flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          {activeFriend ? (
            <div className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setActiveFriend(null)}
                aria-label="Back to friends"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <p className="text-sm font-semibold">{activeFriend.handle}</p>
                <p className="text-xs text-muted-foreground">
                  {activeFriend.online ? "Online now" : "Offline"} · Elo{" "}
                  {activeFriend.chessRating}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h2 className="font-semibold">Friends & Profile</h2>
            </div>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {activeFriend ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="ph-no-capture min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Say hello to {activeFriend.handle}! Messages here are saved so
                  you can catch up anytime.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === profile?.id;
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap",
                        mine
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto bg-muted text-foreground",
                      )}
                    >
                      {m.body}
                    </div>
                  );
                })
              )}
            </div>

            <form
              className="flex shrink-0 items-end gap-2 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                void sendDirectMessage();
              }}
            >
              <Textarea
                value={draft}
                rows={1}
                placeholder={`Message ${activeFriend.handle}…`}
                className="max-h-28 min-h-10 resize-none py-2"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendDirectMessage();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={sending || !draft.trim()}
                aria-label="Send direct message"
              >
                <SendHorizontal />
              </Button>
            </form>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            {profile && (
              <section className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Your anonymous handle
                    </p>
                    {editingHandle ? (
                      <div className="mt-1 flex items-center gap-1.5">
                        <input
                          value={handleInput}
                          maxLength={24}
                          onChange={(e) => setHandleInput(e.target.value)}
                          placeholder="3-24 chars"
                          className="h-8 rounded-md border bg-background px-2 text-sm"
                        />
                        <Button
                          size="sm"
                          disabled={savingHandle}
                          onClick={() => void saveHandle()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingHandle(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="text-base font-semibold">
                          {profile.handle}
                        </p>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Edit handle"
                          onClick={() => {
                            setHandleInput(profile.handle);
                            setEditingHandle(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="size-3 text-amber-500" />
                    Elo {profile.chessRating}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Chess record: {profile.chessWins}W · {profile.chessLosses}L ·{" "}
                  {profile.chessDraws}D
                </p>
              </section>
            )}

            {incoming.length > 0 && (
              <section className="space-y-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <UserPlus className="size-3.5" />
                  Incoming Requests ({incoming.length})
                </h3>
                <div className="space-y-2">
                  {incoming.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border bg-card px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">{req.handle}</p>
                        <p className="text-xs text-muted-foreground">
                          Elo {req.chessRating}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => void handleFriendAction("accept", req.id)}
                        >
                          <Check className="size-3.5" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void handleFriendAction("decline", req.id)
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Friends ({friends.length})
                </h3>
                {loading && (
                  <span className="text-xs text-muted-foreground">
                    Refreshing…
                  </span>
                )}
              </div>
              {friends.length === 0 ? (
                <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                  No friends yet. Tap <strong>Add Friend</strong> during a chat
                  or chess match—when both sides accept, you can message each
                  other anytime!
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              friend.online
                                ? "bg-success"
                                : "bg-muted-foreground/40",
                            )}
                          />
                          <p className="truncate text-sm font-medium">
                            {friend.handle}
                          </p>
                        </div>
                        <p className="pl-4 text-xs text-muted-foreground">
                          <ChessKnight className="mr-1 inline size-3" />
                          Elo {friend.chessRating} ·{" "}
                          {friend.online ? "Online" : "Offline"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setActiveFriend(friend)}
                        >
                          <MessageSquare className="size-3.5" />
                          Message
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Remove friend"
                          onClick={() =>
                            void handleFriendAction("remove", friend.id)
                          }
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Block user"
                          onClick={() =>
                            void handleFriendAction("block", friend.id)
                          }
                        >
                          <ShieldBan className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {outgoing.length > 0 && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Pending Sent ({outgoing.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {outgoing.map((req) => (
                    <Badge key={req.id} variant="outline">
                      {req.handle}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
