"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chess, type Square } from "chess.js";
import {
  Flag,
  Handshake,
  RotateCcw,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Chessboard, defaultPieces } from "react-chessboard";
import type { ChessColor, ChessOffer } from "@repo/protocol";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { type ChessView, describeResult } from "@/hooks/use-stranger-chat";
import { playChessSound } from "./chess-sounds";

interface ChessPanelProps {
  game: ChessView;
  /** The stranger left; the game is over and can't be rematched. */
  partnerGone: boolean;
  connected: boolean;
  /** Height of the visible viewport, to fit the board next to the chat. */
  viewportHeight?: number;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  onResign: () => void;
  onOffer: (offer: ChessOffer) => void;
  onFlag: () => void;
}

const PROMOTIONS = ["q", "r", "b", "n"] as const;

export function ChessPanel({
  game,
  partnerGone,
  connected,
  viewportHeight,
  onMove,
  onResign,
  onOffer,
  onFlag,
}: ChessPanelProps) {
  const chess = useMemo(() => new Chess(game.fen), [game.fen]);
  const [muted, setMuted] = useState(false);
  const prevMoveCount = useRef(game.moves.length);
  const prevStatus = useRef(game.status);

  useEffect(() => {
    if (muted) {
      prevMoveCount.current = game.moves.length;
      prevStatus.current = game.status;
      return;
    }
    if (game.status === "over" && prevStatus.current === "playing") {
      playChessSound("gameover");
    } else if (game.moves.length > prevMoveCount.current) {
      const lastSan = game.moves.at(-1) ?? "";
      if (lastSan.includes("+") || lastSan.includes("#")) playChessSound("check");
      else if (lastSan.includes("x")) playChessSound("capture");
      else playChessSound("move");
    }
    prevMoveCount.current = game.moves.length;
    prevStatus.current = game.status;
  }, [game.moves, game.status, muted]);

  const material = useMemo(() => computeMaterialLead(chess), [chess]);
  const playing = game.status === "playing";
  const turn: ChessColor = chess.turn() === "w" ? "white" : "black";
  const myTurn = playing && connected && turn === game.color;
  const opponent: ChessColor = game.color === "white" ? "black" : "white";

  // A half-made move (selected piece, pending promotion) only holds for the position it
  // was started in; anything that changes the board drops it.
  const [pending, setPending] = useState<{
    fen: string;
    selected?: Square;
    promotion?: { from: Square; to: Square };
  }>();
  const current = pending?.fen === game.fen ? pending : undefined;
  const selected = current?.selected ?? null;
  const promotion = current?.promotion;
  const setSelected = (square: Square | null) =>
    setPending(square ? { fen: game.fen, selected: square } : undefined);

  const now = useNow(playing);
  const elapsed = Math.max(0, now - game.clockAt);
  const timeLeft = (color: ChessColor) =>
    playing && game.clock.running && turn === color
      ? Math.max(0, game.clock[color] - elapsed)
      : game.clock[color];
  const firstMoveLeft =
    playing && game.clock.firstMoveMs !== null
      ? Math.max(0, game.clock.firstMoveMs - elapsed)
      : null;

  // When a clock hits zero, ask the server to end the game (once per position).
  const flaggedAt = useRef("");
  const outOfTime = firstMoveLeft === 0 || timeLeft(turn) === 0;
  useEffect(() => {
    const key = `${game.id}:${game.moves.length}`;
    if (playing && outOfTime && flaggedAt.current !== key) {
      flaggedAt.current = key;
      onFlag();
    }
  }, [playing, outOfTime, game.id, game.moves.length, onFlag]);

  const isMine = (square: Square) =>
    chess.get(square)?.color === (game.color === "white" ? "w" : "b");

  const targets = useMemo(
    () =>
      selected
        ? chess.moves({ square: selected, verbose: true }).map((m) => m.to)
        : [],
    [chess, selected],
  );

  const tryMove = (from: Square, to: Square) => {
    const moves = chess.moves({ square: from, verbose: true });
    const move = moves.find((m) => m.to === to);
    if (!move) return false;
    if (move.isPromotion()) {
      setPending({ fen: game.fen, promotion: { from, to } });
      return false;
    }
    setSelected(null);
    return onMove(from, to);
  };

  const squareStyles: Record<string, CSSProperties> = {};
  if (game.lastMove) {
    squareStyles[game.lastMove.from] = LAST_MOVE;
    squareStyles[game.lastMove.to] = LAST_MOVE;
  }
  if (chess.inCheck()) {
    const king = chess.findPiece({ type: "k", color: chess.turn() }).at(0);
    if (king) squareStyles[king] = CHECK;
  }
  if (selected) squareStyles[selected] = SELECTED;
  for (const square of targets) {
    squareStyles[square] = {
      ...squareStyles[square],
      ...(chess.get(square) ? CAPTURE_TARGET : MOVE_TARGET),
    };
  }

  const height = viewportHeight ? `${viewportHeight}px` : "100dvh";
  const sizing = {
    // Phones keep room for the chat below; desktops fill the column.
    "--board-sm": `max(10rem, calc(${height} - 23rem))`,
    "--board-lg": `min(40rem, calc(${height} - 14.5rem))`,
  } as CSSProperties;

  return (
    <div
      className="mx-auto flex w-(--board-sm) max-w-full flex-col gap-1.5 lg:w-(--board-lg)"
      style={sizing}
    >
      <PlayerBar
        label="Stranger"
        color={opponent}
        ms={timeLeft(opponent)}
        advantage={material[opponent]}
        active={playing && turn === opponent}
        status={
          partnerGone
            ? "Left"
            : !playing
              ? undefined
              : turn === opponent
                ? "Thinking…"
                : undefined
        }
      />

      <div className="relative aspect-square w-full overflow-hidden rounded-md shadow-sm">
        <Chessboard
          options={{
            id: `game-${game.id}`,
            position: game.fen,
            boardOrientation: game.color,
            squareStyles,
            darkSquareStyle: { backgroundColor: "#7c94b4" },
            lightSquareStyle: { backgroundColor: "#e6ebf2" },
            animationDurationInMs: 150,
            allowDrawingArrows: false,
            allowDragging: myTurn,
            canDragPiece: ({ square }) =>
              myTurn && square !== null && isMine(square as Square),
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              !!targetSquare &&
              tryMove(sourceSquare as Square, targetSquare as Square),
            onSquareClick: ({ square }) => {
              if (!myTurn) return;
              const target = square as Square;
              if (selected && targets.includes(target)) {
                tryMove(selected, target);
              } else {
                setSelected(
                  isMine(target) && target !== selected ? target : null,
                );
              }
            },
          }}
        />

        {promotion && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div
              role="dialog"
              aria-label="Promote pawn to"
              className="flex gap-1 rounded-xl border bg-card p-2 shadow-lg"
            >
              {PROMOTIONS.map((piece) => {
                const key = `${game.color === "white" ? "w" : "b"}${piece.toUpperCase()}`;
                return (
                  <button
                    key={piece}
                    type="button"
                    aria-label={PIECE_NAMES[piece]}
                    className="size-14 rounded-lg p-1 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    onClick={() => {
                      onMove(promotion.from, promotion.to, piece);
                      setPending(undefined);
                    }}
                  >
                    {defaultPieces[key]?.()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <PlayerBar
        label="You"
        color={game.color}
        ms={timeLeft(game.color)}
        advantage={material[game.color]}
        active={playing && turn === game.color}
        status={
          firstMoveLeft !== null && turn === game.color
            ? `First move: ${Math.ceil(firstMoveLeft / 1000)}s`
            : myTurn
              ? "Your move"
              : undefined
        }
      />

      <Actions
        game={game}
        partnerGone={partnerGone}
        connected={connected}
        muted={muted}
        onToggleMute={() => setMuted((v) => !v)}
        onResign={onResign}
        onOffer={onOffer}
      />
    </div>
  );
}

function Actions({
  game,
  partnerGone,
  connected,
  muted,
  onToggleMute,
  onResign,
  onOffer,
}: Pick<
  ChessPanelProps,
  "game" | "partnerGone" | "connected" | "onResign" | "onOffer"
> & { muted: boolean; onToggleMute: () => void }) {
  // Resigning needs a second press within a few seconds so it can't happen by accident.
  const [confirmingResign, setConfirmingResign] = useState(false);
  useEffect(() => {
    if (!confirmingResign) return;
    const timer = setTimeout(() => setConfirmingResign(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmingResign]);

  if (game.status === "over") {
    const rematch = game.offers.rematch;
    return (
      <div className="flex min-h-10 items-center justify-between gap-2">
        <p className="text-sm font-medium" aria-live="polite">
          {describeResult(game)}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute chess sounds" : "Mute chess sounds"}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          {!partnerGone && (
            <Button
              size="sm"
              variant={rematch === "them" ? "default" : "outline"}
              disabled={!connected || rematch === "me"}
              onClick={() => onOffer("rematch")}
            >
              <RotateCcw />
              {rematch === "them"
                ? "Accept rematch"
                : rematch === "me"
                  ? "Rematch offered"
                  : "Rematch"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const draw = game.offers.draw;
  const started = game.moves.length >= 2;
  return (
    <div className="flex min-h-10 items-center justify-between gap-2">
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onToggleMute}
        aria-label={muted ? "Unmute chess sounds" : "Mute chess sounds"}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </Button>
      <div className="flex items-center gap-2">
      {started && (
        <Button
          size="sm"
          variant={draw === "them" ? "default" : "outline"}
          disabled={!connected || draw === "me"}
          onClick={() => onOffer("draw")}
        >
          <Handshake />
          {draw === "them"
            ? "Accept draw"
            : draw === "me"
              ? "Draw offered"
              : "Offer draw"}
        </Button>
      )}
      <Button
        size="sm"
        variant={confirmingResign ? "destructive" : "outline"}
        disabled={!connected}
        onClick={() => {
          if (confirmingResign || !started) {
            setConfirmingResign(false);
            onResign();
          } else {
            setConfirmingResign(true);
          }
        }}
      >
        <Flag />
        {!started ? "Abort" : confirmingResign ? "Sure?" : "Resign"}
      </Button>
      </div>
    </div>
  );
}

function PlayerBar({
  label,
  color,
  ms,
  advantage,
  active,
  status,
}: {
  label: string;
  color: ChessColor;
  ms: number;
  advantage: number;
  active: boolean;
  status?: string;
}) {
  const low = ms < 30_000;
  return (
    <div className="flex h-9 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border",
            color === "white"
              ? "bg-white text-zinc-900"
              : "bg-zinc-900 text-white",
          )}
          aria-label={`Plays ${color}`}
        >
          <UserRound className="size-3.5" />
        </span>
        <span className="text-sm font-medium">{label}</span>
        {advantage > 0 && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            +{advantage}
          </span>
        )}
        {status && (
          <span className="truncate text-xs text-muted-foreground">
            {status}
          </span>
        )}
      </div>
      <span
        className={cn(
          "rounded-md px-2 py-1 font-mono text-sm tabular-nums",
          active
            ? low
              ? "bg-destructive text-white"
              : "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
        aria-label={`${label} clock`}
      >
        {formatClock(ms)}
      </span>
    </div>
  );
}

/** Re-renders a few times a second while `active`, returning the current time. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

function formatClock(ms: number) {
  const seconds = ms / 1000;
  if (seconds < 10) return seconds.toFixed(1);
  const whole = Math.ceil(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

function computeMaterialLead(chess: Chess): Record<ChessColor, number> {
  let w = 0;
  let b = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const val = PIECE_VALUES[cell.type] ?? 0;
      if (cell.color === "w") w += val;
      else b += val;
    }
  }
  return {
    white: Math.max(0, w - b),
    black: Math.max(0, b - w),
  };
}

const PIECE_NAMES = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" };

const LAST_MOVE: CSSProperties = {
  backgroundColor: "rgba(250, 204, 21, 0.45)",
};
const SELECTED: CSSProperties = { backgroundColor: "rgba(250, 204, 21, 0.6)" };
const CHECK: CSSProperties = {
  background:
    "radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.35) 60%, transparent 75%)",
};
const MOVE_TARGET: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(15, 23, 42, 0.3) 22%, transparent 24%)",
};
const CAPTURE_TARGET: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, transparent 58%, rgba(15, 23, 42, 0.3) 60%)",
};
