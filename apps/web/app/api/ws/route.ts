import { experimental_upgradeWebSocket } from "@vercel/functions";
import {
  authenticate,
  getHub,
  isAllowedOrigin,
  isValidSessionId,
} from "@repo/chat-server";
import { CloseCode } from "@repo/protocol";

export const dynamic = "force-dynamic";
// Vercel closes the socket when the function hits its max duration; the client then
// reconnects and resumes. 300s is the Hobby limit — Pro plans can raise it to 800.
export const maxDuration = 300;

export async function GET(request: Request) {
  if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket upgrade", { status: 426 });
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isAllowedOrigin(request.headers.get("origin"), host)) {
    return new Response("Forbidden", { status: 403 });
  }
  const sid = new URL(request.url).searchParams.get("sid");
  if (!isValidSessionId(sid)) {
    return new Response("Invalid session id", { status: 400 });
  }

  const userId = await authenticate(request.headers.get("cookie"));
  return experimental_upgradeWebSocket(
    async (ws) => {
      // Upgrade first so the client gets a close code it can act on (redirect to login).
      if (!userId) {
        ws.close(CloseCode.Unauthorized, "Unauthorized");
        return;
      }
      await getHub().attach(ws, userId, sid);
    },
    { maxPayload: 8 * 1024 },
  );
}
