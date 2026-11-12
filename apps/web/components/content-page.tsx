import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_SLOTS } from "@/lib/ads";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "./json-ld";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Long-form marketing page with visible + structured breadcrumbs and a closing call to action. */
export function ContentPage({
  title,
  lead,
  path,
  children,
}: {
  title: string;
  lead: string;
  /** Route path, e.g. "/safety", used for the breadcrumb trail. */
  path: string;
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `${SITE_URL}${path}`,
      },
    ],
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            {SITE_NAME}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="truncate text-foreground">{title}</span>
        </nav>

        <article>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            {lead}
          </p>
          <div className="mt-10 space-y-4 leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:pt-2 [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {children}
          </div>
        </article>

        <div className="mt-12">
          <AdSlot slot={AD_SLOTS.banner} format="horizontal" />
        </div>

        <section className="mt-12 rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to meet someone new?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Chat anonymously, play 10-minute chess, and make real friends on
            Funstranger.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/chat">
              Start chatting
              <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbJsonLd} />
    </div>
  );
}
