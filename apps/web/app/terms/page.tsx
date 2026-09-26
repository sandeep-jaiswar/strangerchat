import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Service",
  description:
    "The rules for using Strangerchat: 18+ only, be respectful, and chat at your own risk.",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>These terms are a starting point. Have them reviewed before launch.</p>
      <h2>Eligibility</h2>
      <p>You must be at least 18 years old to use Strangerchat.</p>
      <h2>Be respectful</h2>
      <p>
        Do not harass, threaten, or send sexual, hateful or illegal content. Do
        not share personal information you wouldn&apos;t want a stranger to
        have. We may suspend accounts that break these rules.
      </p>
      <h2>No guarantees</h2>
      <p>
        The service is provided as is. You chat with strangers at your own risk
        and are responsible for what you share.
      </p>
    </LegalPage>
  );
}
