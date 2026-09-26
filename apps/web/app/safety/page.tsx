import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { pageMetadata } from "@/lib/site";

const title = "How to Chat with Strangers Online Safely";
const description =
  "Practical safety tips for talking to strangers online: protect your identity, spot scams, handle uncomfortable chats and know when to skip.";

export const metadata: Metadata = pageMetadata({
  path: "/safety",
  title: "Safety Tips for Chatting with Strangers",
  socialTitle: title,
  description,
});

export default function SafetyPage() {
  return (
    <ContentPage
      title={title}
      path="/safety"
      lead="Talking to strangers can be fun, eye-opening and a great way to beat boredom. These simple habits help keep every conversation on StrangerChat — or anywhere online — safe and enjoyable."
    >
      <h2>Protect your identity</h2>
      <ul>
        <li>
          <strong>Keep personal details private.</strong> Don&apos;t share your
          full name, address, school, workplace, phone number or social media
          handles.
        </li>
        <li>
          <strong>Watch for small clues.</strong> A photo of your street, the
          name of a local shop or your daily routine can reveal more than you
          think.
        </li>
        <li>
          <strong>Use StrangerChat&apos;s anonymity.</strong> Your partner never
          sees your Google name, email or photo. Don&apos;t undo that by
          volunteering them.
        </li>
      </ul>

      <h2>Spot scams and manipulation</h2>
      <ul>
        <li>
          <strong>Never send money</strong>, gift cards or crypto to someone you
          met in a chat — no matter how convincing the story.
        </li>
        <li>
          <strong>Don&apos;t click unknown links.</strong> Links from strangers
          are a common way to spread phishing pages and malware.
        </li>
        <li>
          <strong>Be wary of urgency and flattery.</strong> Pressure to move to
          another app, share photos or &quot;prove&quot; something quickly is a
          red flag.
        </li>
        <li>
          <strong>Never share passwords or verification codes.</strong> No
          legitimate person needs them.
        </li>
      </ul>

      <h2>You&apos;re always in control</h2>
      <p>
        If a conversation makes you uncomfortable, you don&apos;t owe anyone an
        explanation. Tap <strong>Next</strong> or press <strong>Esc</strong> and
        you&apos;ll be matched with someone new. The other person can&apos;t
        follow you or find you again.
      </p>

      <h2>Be the stranger you&apos;d want to meet</h2>
      <ul>
        <li>Open with a friendly hello or an interesting question.</li>
        <li>Respect boundaries — if someone wants to leave, let them.</li>
        <li>
          Harassment, hate speech, threats and sexual content are banned by our{" "}
          <Link href="/terms">terms of service</Link>.
        </li>
      </ul>

      <h2>How StrangerChat helps</h2>
      <ul>
        <li>
          <strong>Verified sign-in</strong> keeps bots and spam accounts out of
          the queue.
        </li>
        <li>
          <strong>No stored messages</strong> — chats are relayed live and not
          kept once delivered. Read our{" "}
          <Link href="/privacy">privacy policy</Link>.
        </li>
        <li>
          <strong>Text only</strong>, so you&apos;re never pressured to turn on
          a camera.
        </li>
        <li>
          <strong>18+ only</strong>, so conversations stay between adults.
        </li>
      </ul>

      <h2>If you feel unsafe</h2>
      <p>
        End the chat immediately. If someone threatens you or you believe a
        person is in danger, contact your local emergency services. Talking to a
        trusted friend about an upsetting conversation can help too.
      </p>
    </ContentPage>
  );
}
