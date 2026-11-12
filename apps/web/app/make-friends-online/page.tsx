import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/site";

const title = "Make Friends Online Safely with Anonymous Chat & Chess";
const description =
  "Meet new people by shared interests, chat one-on-one, play chess, and add mutual friends with anonymous handles on Funstranger.";

export const metadata: Metadata = pageMetadata({
  path: "/make-friends-online",
  title: "Make Friends Online Free — Safe Anonymous Chat",
  socialTitle: title,
  description,
});

const friendsFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does making friends work on Funstranger?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "During any chat or chess match, either person can tap Add Friend. Only when both people accept are your anonymous handles revealed so you can message each other again later.",
      },
    },
    {
      "@type": "Question",
      name: "Do friends see my Gmail address or Google name?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Funstranger generates a unique anonymous handle (which you can customize) so your Google name, email and photo stay completely private.",
      },
    },
  ],
};

export default function MakeFriendsOnlinePage() {
  return (
    <ContentPage
      title={title}
      path="/make-friends-online"
      lead="Social networks optimize for followers and feeds, not genuine one-on-one friendships. Funstranger lets you meet strangers around shared interests, bond over conversation or chess, and stay in touch only when both people want to."
    >
      <h2>Find your kind of people with interest tags</h2>
      <p>
        Before clicking Start, choose up to three interest tags — such as{" "}
        <strong>#chess</strong>, <strong>#coding</strong>,{" "}
        <strong>#music</strong>, <strong>#movies</strong>,{" "}
        <strong>#gaming</strong>, or <strong>#languages</strong>. Funstranger
        prioritizes strangers who share your interests so your conversation
        starts with common ground.
      </p>

      <h2>Mutual friend requests — zero creepiness</h2>
      <p>
        In standard random chat apps, hitting Next means losing a great
        conversation forever. On Funstranger, you can tap{" "}
        <strong>Add friend</strong> while chatting:
      </p>
      <ul>
        <li>
          Your Google name and email are <strong>never</strong> shared.
        </li>
        <li>
          Nothing is revealed unless <strong>both</strong> of you accept.
        </li>
        <li>
          Once connected, open the <strong>Friends</strong> drawer anytime to
          see who&apos;s online and send direct messages.
        </li>
      </ul>

      <h2>Built-in safety controls</h2>
      <p>
        Google sign-in blocks automated spam accounts, automated moderation
        masks abusive language, and you can block or report anyone in one tap.
        Read our full <Link href="/safety">online safety checklist</Link> or
        jump straight into <Link href="/play-chess-with-strangers">chess</Link>{" "}
        to break the ice over a game.
      </p>

      <JsonLd data={friendsFaqJsonLd} />
    </ContentPage>
  );
}
