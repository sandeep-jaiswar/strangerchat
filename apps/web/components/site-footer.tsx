import Link from "next/link";

const links = [
  { href: "/play-chess-with-strangers", label: "Play chess" },
  { href: "/puzzles", label: "Chess puzzles" },
  { href: "/make-friends-online", label: "Make friends" },
  { href: "/omegle-alternative", label: "Omegle alternative" },
  { href: "/safety", label: "Safety tips" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Funstranger · funstranger.in</p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-4 gap-y-2"
        >
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
