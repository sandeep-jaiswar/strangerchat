import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist on Funstranger.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to Funstranger
      </Link>
    </main>
  );
}
