import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { pageMetadata } from "@/lib/site";

const title = "The Best Free Omegle Alternative for Anonymous Chat";
const description =
  "Omegle is gone, but random chat isn't. StrangerChat is a free Omegle alternative with instant one-on-one matching, no bots, no chat logs and a one-tap skip.";

export const metadata: Metadata = pageMetadata({
  path: "/omegle-alternative",
  title: "Omegle Alternative — Free Random Chat with Strangers",
  socialTitle: title,
  description,
});

export default function OmegleAlternativePage() {
  return (
    <ContentPage
      title={title}
      path="/omegle-alternative"
      lead="Omegle shut down in November 2023 after 14 years. If you miss the thrill of talking to a random stranger, StrangerChat brings back the simple part — instant, anonymous, one-on-one chat — and fixes the parts that made Omegle frustrating."
    >
      <h2>What made Omegle great</h2>
      <p>
        Omegle&apos;s appeal was its simplicity: open the site, press a button,
        and you were talking to someone you&apos;d never otherwise meet. No
        profiles, no followers, no algorithm deciding who you see. Just a random
        conversation that could be funny, strange or genuinely meaningful.
      </p>
      <p>
        StrangerChat keeps that exact loop. Tap <strong>Start</strong>, get
        matched with a random person who&apos;s online right now, and chat. When
        you&apos;re done, tap <strong>Next</strong> (or press Esc) and
        you&apos;re instantly talking to someone new.
      </p>

      <h2>What we do differently</h2>
      <h3>Real people, not bots</h3>
      <p>
        Omegle&apos;s biggest problem was spam: bots pasting links, scripted ads
        and throwaway trolls. StrangerChat requires a Google sign-in before you
        enter the queue, which makes mass-created bot accounts impractical. Your
        Google name, email and photo are never shown to anyone you chat with.
      </p>
      <h3>No chat logs</h3>
      <p>
        Messages are relayed in real time between you and your partner and are
        not stored on our servers once delivered. There&apos;s no chat history
        to leak, sell or screenshot from our side. See our{" "}
        <Link href="/privacy">privacy policy</Link> for details.
      </p>
      <h3>Text only, by design</h3>
      <p>
        StrangerChat is a text chat. No webcam means no pressure to show your
        face and far less room for the unwanted content that made video chat
        sites risky. Conversation is the whole point.
      </p>
      <h3>Adults only</h3>
      <p>
        StrangerChat is for people aged 18 and over, and our{" "}
        <Link href="/terms">terms</Link> ban harassment, hate and sexual
        content. Anyone who makes you uncomfortable is one tap away from being
        gone.
      </p>

      <h2>StrangerChat vs. Omegle at a glance</h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Feature</th>
              <th className="px-4 py-3 font-semibold">StrangerChat</th>
              <th className="px-4 py-3 font-semibold">Omegle</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="px-4 py-3">Status</td>
              <td className="px-4 py-3">Online</td>
              <td className="px-4 py-3">Shut down (2023)</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Price</td>
              <td className="px-4 py-3">Free</td>
              <td className="px-4 py-3">Free</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Random one-on-one matching</td>
              <td className="px-4 py-3">Yes</td>
              <td className="px-4 py-3">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Anonymous to your partner</td>
              <td className="px-4 py-3">Yes</td>
              <td className="px-4 py-3">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Bot protection</td>
              <td className="px-4 py-3">Verified sign-in</td>
              <td className="px-4 py-3">Captcha only</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Messages stored</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">Logs kept</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Works on mobile</td>
              <td className="px-4 py-3">Yes, in the browser</td>
              <td className="px-4 py-3">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>How to get started</h2>
      <ol>
        <li>Open StrangerChat on your phone or computer — no download.</li>
        <li>Continue with Google. Strangers never see your account details.</li>
        <li>Tap Start. You&apos;ll be matched with someone in seconds.</li>
        <li>Chat, or skip to the next person whenever you like.</li>
      </ol>
      <p>
        New to random chat? Read our{" "}
        <Link href="/safety">safety tips for talking to strangers</Link> first.
      </p>
    </ContentPage>
  );
}
