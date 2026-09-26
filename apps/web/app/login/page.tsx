import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Logo } from "@/components/logo";
import { SignInButton } from "@/components/sign-in-button";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already linked to another sign-in.",
  AccessDenied: "Access was denied. Please try again.",
};

/** Only allow same-site redirects so the login page can't be used as an open redirect. */
function safeCallbackUrl(value: string | string[] | undefined) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/chat";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  const session = await getServerSession(authOptions);
  if (session) redirect(callbackUrl);

  const error =
    typeof params.error === "string"
      ? (errorMessages[params.error] ?? "Something went wrong signing you in.")
      : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo />
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to start chatting with strangers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <SignInButton callbackUrl={callbackUrl} className="w-full" />
          <p className="text-center text-xs text-muted-foreground">
            Your name and email are never shown to other users. By continuing
            you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
