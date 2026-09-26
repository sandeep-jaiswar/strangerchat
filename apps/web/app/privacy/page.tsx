import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "What Strangerchat collects, why, and how your anonymous chats stay private.",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This page explains what Strangerchat collects and why. Replace it with a
        policy reviewed for your jurisdiction before launch.
      </p>
      <h2>Account information</h2>
      <p>
        When you sign in with Google we receive your name, email address and
        profile picture. We use them only to identify your account. They are
        never shown to people you chat with.
      </p>
      <h2>Messages</h2>
      <p>
        Messages are relayed in real time between you and your chat partner and
        are not stored on our servers once delivered.
      </p>
      <h2>Advertising and cookies</h2>
      <p>
        We use Google AdSense to show ads. Google and its partners use cookies
        to serve ads based on your prior visits to this and other websites. You
        can opt out of personalised advertising at{" "}
        <a
          href="https://adssettings.google.com"
          className="underline underline-offset-2"
        >
          Google Ads Settings
        </a>
        . Learn more about{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          className="underline underline-offset-2"
        >
          how Google uses data from partner sites
        </a>
        .
      </p>
    </LegalPage>
  );
}
