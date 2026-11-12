import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "How Funstranger handles Google sign-in, anonymous chats, mutual friend DMs, chess ratings, safety reports, and AdSense cookies.",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This page explains what Funstranger (funstranger.in) collects and why.
      </p>
      <h2>Account information</h2>
      <p>
        When you sign in with Google we receive your name, email address and
        profile picture. We use them only to identify your account. They are
        never shown to people you chat with — other users only see your
        anonymous Funstranger handle if you become mutual friends.
      </p>
      <h2>Messages and chess games</h2>
      <p>
        Stranger chat messages are relayed in real time between you and your
        chat partner and are not stored on our servers once delivered. If two
        users mutually accept a friend request, direct messages between those
        friends and completed chess game records/ratings are stored so you can
        stay connected.
      </p>
      <h2>Safety and moderation records</h2>
      <p>
        If you block or report a user, we store that block or report against
        the relevant account IDs to prevent future matching and enforce bans
        against abusive behaviour.
      </p>
      <h2>Advertising, analytics, cookies and local storage</h2>
      <p>
        We use Google AdSense to show ads, PostHog (EU Cloud) for privacy-first
        product analytics, and browser local storage to remember your EEA/UK
        cookie consent choice and chess puzzle progress. Analytics never record
        stranger chat messages, friend DMs, Google names, or email addresses,
        and respect your consent preference. Google and its partners use cookies
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
      <h2>Contact</h2>
      <p>
        For privacy questions, data deletion requests or abuse reports, email{" "}
        <a
          href="mailto:jaiswarsandeep119@gmail.com"
          className="underline underline-offset-2"
        >
          jaiswarsandeep119@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
