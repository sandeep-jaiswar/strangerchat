import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">{title}</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:pt-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
