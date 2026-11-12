"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@funstranger/ui/components/button";
import { cn } from "@funstranger/ui/lib/utils";
import type { ProfileData } from "@/components/friends/friends-drawer";
import { usePushAlerts } from "@/hooks/use-push-alerts";
import { captureEvent } from "@/lib/analytics";

const ONBOARDING_STORAGE_PREFIX = "funstranger_onboarded_v1:";

const VIBE_PRESETS: { label: string; tags: string[] }[] = [
  { label: "Chess & Tactics", tags: ["chess"] },
  { label: "Dev & Gaming", tags: ["coding", "gaming"] },
  { label: "Music & Movies", tags: ["music", "movies"] },
];

export function OnboardingBanner({
  profile,
  tags,
  onTagsChange,
  onProfileUpdated,
}: {
  profile: ProfileData | null;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onProfileUpdated: (profile: ProfileData) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [handleInput, setHandleInput] = useState("");
  const [savingHandle, setSavingHandle] = useState(false);
  const [handleCustomized, setHandleCustomized] = useState(false);

  const isBrandNewUser = Boolean(
    profile &&
      profile.chessWins === 0 &&
      profile.chessLosses === 0 &&
      profile.chessDraws === 0 &&
      (profile.dailyStreak ?? 0) === 0 &&
      (profile.recentGames?.length ?? 0) === 0,
  );

  useEffect(() => {
    if (!profile || !isBrandNewUser || typeof window === "undefined") {
      setVisible(false);
      return;
    }
    const key = `${ONBOARDING_STORAGE_PREFIX}${profile.id}`;
    const alreadySeen = window.localStorage.getItem(key) === "1";
    setHandleInput(profile.handle);
    setVisible(!alreadySeen);
  }, [isBrandNewUser, profile]);

  const pushAlerts = usePushAlerts(profile?.id, visible);

  if (!visible || !profile) return null;

  const markDone = () => {
    try {
      window.localStorage.setItem(
        `${ONBOARDING_STORAGE_PREFIX}${profile.id}`,
        "1",
      );
    } catch {
      // Ignore storage failures in restricted browsing contexts.
    }
    setVisible(false);
  };

  const saveHandle = async () => {
    const trimmed = handleInput.trim();
    if (!trimmed || trimmed === profile.handle) return;
    setSavingHandle(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: trimmed }),
      });
      const data = (await res.json()) as { handle?: string; error?: string };
      if (!res.ok || !data.handle) {
        toast.error(data.error ?? "Unable to update handle");
        return;
      }
      onProfileUpdated({ ...profile, handle: data.handle });
      setHandleInput(data.handle);
      setHandleCustomized(true);
      captureEvent("onboarding_handle_updated");
      toast.success(`Handle saved as ${data.handle}`);
    } finally {
      setSavingHandle(false);
    }
  };

  return (
    <section
      aria-label="Quick first-time setup"
      className="mx-auto mt-4 w-full max-w-2xl px-4 sm:px-6"
    >
      <div className="rounded-xl border border-primary/25 bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" />
              Welcome! Customize your anonymous setup (10s)
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your Google name stays hidden. Pick a handle and starter vibe
              before matching.
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 shrink-0"
            aria-label="Skip quick setup"
            onClick={() => {
              captureEvent("onboarding_skipped");
              markDone();
            }}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <form
            className="space-y-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              void saveHandle();
            }}
          >
            <label
              htmlFor="onboarding-handle"
              className="text-xs font-medium text-muted-foreground"
            >
              Anonymous handle
            </label>
            <div className="flex gap-1.5">
              <input
                id="onboarding-handle"
                value={handleInput}
                maxLength={24}
                onChange={(e) => setHandleInput(e.target.value)}
                className="h-8 flex-1 rounded-md border bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className="h-8 text-xs"
                disabled={
                  savingHandle ||
                  !handleInput.trim() ||
                  handleInput.trim() === profile.handle
                }
              >
                Save
              </Button>
            </div>
          </form>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-muted-foreground">
              Starter interests
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_PRESETS.map((preset) => {
                const selected = preset.tags.every((t) => tags.includes(t));
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onTagsChange(preset.tags)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          {pushAlerts.supported ? (
            <Button
              type="button"
              size="sm"
              variant={pushAlerts.subscribed ? "secondary" : "outline"}
              className="h-8 gap-1.5 text-xs"
              disabled={pushAlerts.toggling}
              onClick={() => void pushAlerts.toggle()}
            >
              {pushAlerts.subscribed ? (
                <Bell className="size-3.5 text-success" />
              ) : (
                <BellOff className="size-3.5" />
              )}
              {pushAlerts.subscribed
                ? "Challenge Alerts Enabled"
                : "Notify me of friend challenges"}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tip: share your Invite link below to play friends directly.
            </span>
          )}
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => {
              captureEvent("onboarding_completed", {
                customized_handle: handleCustomized,
                tags_count: tags.length,
                push_enabled: pushAlerts.subscribed,
              });
              markDone();
            }}
          >
            <Check className="size-3.5" />
            Ready to match
          </Button>
        </div>
      </div>
    </section>
  );
}
