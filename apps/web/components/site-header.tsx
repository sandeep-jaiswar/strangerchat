import Link from "next/link";
import { HeaderAuth } from "./auth-cta";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/play-chess-with-strangers", label: "Play Chess" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/make-friends-online", label: "Make Friends" },
  { href: "/safety", label: "Safety" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav
            aria-label="Primary"
            className="hidden items-center gap-4 text-sm text-muted-foreground md:flex"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
