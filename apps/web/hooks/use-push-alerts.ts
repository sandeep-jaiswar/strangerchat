"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { captureEvent } from "@/lib/analytics";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function usePushAlerts(accountId?: string | null, active = true) {
  const [config, setConfig] = useState<{
    supported: boolean;
    publicKey: string | null;
    subscribed: boolean;
    accountId?: string;
  }>({ supported: false, publicKey: null, subscribed: false });
  const [toggling, setToggling] = useState(false);

  const subscribed = Boolean(accountId) && config.accountId === accountId && config.subscribed;

  useEffect(() => {
    if (
      !active ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }
    let mounted = true;
    void (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        const existing = await reg?.pushManager.getSubscription();
        const res = await fetch(
          `/api/push?endpoint=${encodeURIComponent(existing?.endpoint ?? "")}`,
          { cache: "no-store" },
        );
        if (!res.ok || !mounted) return;
        const data = (await res.json()) as {
          supported: boolean;
          publicKey: string | null;
          subscribed: boolean;
        };
        if (!mounted || !data.supported || !data.publicKey) return;
        setConfig({
          accountId: accountId ?? undefined,
          supported: true,
          publicKey: data.publicKey,
          subscribed: Boolean(existing) && data.subscribed,
        });
      } catch {
        // Ignore push check errors in restricted browsers.
      }
    })();
    return () => {
      mounted = false;
    };
  }, [active, accountId]);

  const toggle = useCallback(async () => {
    if (!config.supported || !config.publicKey || toggling) return false;
    setToggling(true);
    try {
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing && subscribed) {
        const res = await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        if (!res.ok) throw new Error("Unable to remove subscription");
        await existing.unsubscribe();
        setConfig((prev) => ({ ...prev, subscribed: false }));
        captureEvent("push_alerts_disabled");
        toast.info("Push alerts disabled.");
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info(
          "Allow browser notifications to receive challenge and DM alerts.",
        );
        return false;
      }

      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config.publicKey),
        }));
      try {
        const json = sub.toJSON();
        const res = await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
        });
        if (!res.ok) throw new Error("Unable to enable push alerts");
      } catch (error) {
        if (!existing) await sub.unsubscribe();
        throw error;
      }
      setConfig((prev) => ({
        ...prev,
        accountId: accountId ?? undefined,
        subscribed: true,
      }));
      captureEvent("push_alerts_enabled");
      toast.success("Push alerts enabled for friend challenges & DMs!");
      return true;
    } catch {
      toast.error("Unable to configure push alerts in this browser.");
      return false;
    } finally {
      setToggling(false);
    }
  }, [accountId, config.publicKey, config.supported, subscribed, toggling]);

  return {
    supported: config.supported,
    subscribed,
    toggling,
    toggle,
  };
}
