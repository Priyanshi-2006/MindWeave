import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useProfile } from "@/lib/intelliplay/store";
import { avatarSrc, CHARACTERS } from "@/lib/intelliplay/avatars";
import {
  SKILLS,
  SKILL_LABELS,
  type RoundResult,
  type SkillKey,
} from "@/lib/intelliplay/types";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <Link to="/" className="flex items-center" aria-label="MindWeave Home">
          <img
            src={logoImg}
            alt="MindWeave"
            className="h-auto w-28 sm:w-32 md:w-36 object-contain transition-transform hover:scale-105"
            width={144}
            height={81}
          />
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link
            to="/"
            className="rounded-full px-3 py-2 hover:bg-muted"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-card border-2 border-border" }}
          >
            Play
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full px-3 py-2 hover:bg-muted"
            activeProps={{ className: "bg-card border-2 border-border" }}
          >
            Dashboard
          </Link>
          <Link
            to="/parent"
            className="rounded-full px-3 py-2 hover:bg-muted"
            activeProps={{ className: "bg-card border-2 border-border" }}
          >
            🛡️ Parent Zone
          </Link>
          <ProfileShortcut />
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
    </div>
  );
}

/** Top-right avatar button + cognitive profile popover with avatar picker/upload. */
export function ProfileShortcut() {
  const { profile, setAvatar } = useProfile();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!profile) return null;

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div ref={wrapRef} className="relative ml-1">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile"
        className="toy-press flex items-center gap-2 rounded-full border-2 border-border bg-card py-1 pl-1 pr-3 shadow-soft"
      >
        <img
          src={avatarSrc(profile.avatar)}
          alt={`${profile.name}'s avatar`}
          width={40}
          height={40}
          className="size-10 rounded-full bg-secondary object-cover"
        />
        <span className="font-display text-base font-bold">{profile.name}</span>
      </button>

      {open ? (
        <div className="panel animate-pop absolute right-0 z-50 mt-2 w-[21rem] max-w-[calc(100vw-2rem)] p-4 text-left">
          <div className="flex items-center gap-3">
            <img
              src={avatarSrc(profile.avatar)}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-full bg-secondary object-cover ring-4 ring-primary/20"
            />
            <div>
              <p className="font-display text-xl font-bold">{profile.name}</p>
              <p className="text-xs font-bold text-muted-foreground">
                Age {profile.age}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Pick a buddy
          </p>
          <div className="mt-2 flex items-center gap-2">
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setAvatar(c.id)}
                title={c.label}
                className={cn(
                  "toy-press grid size-14 place-items-center rounded-2xl border-2 bg-secondary/50",
                  profile.avatar === c.id
                    ? "border-primary"
                    : "border-transparent",
                )}
              >
                <img
                  src={c.src}
                  alt={c.label}
                  width={48}
                  height={48}
                  className="size-11"
                />
              </button>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="toy-press grid size-14 place-items-center rounded-2xl border-2 border-dashed border-border text-xl"
              title="Upload a photo"
            >
              ＋
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.target.value = "";
              }}
            />
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Cognitive profile
          </p>
          <div className="mt-2 space-y-2">
            {SKILLS.map((s) => (
              <SkillBar key={s} skill={s} value={profile.skills[s]} />
            ))}
          </div>

          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="toy-press mt-4 block rounded-full bg-primary px-4 py-3 text-center font-display font-bold text-primary-foreground shadow-toy"
          >
            Full dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function SkillBar({ skill, value }: { skill: SkillKey; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm font-bold">
        <span>{SKILL_LABELS[skill]}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}

export function GameHeader({
  title,
  emoji,
  skills,
  note,
  params,
}: {
  title: string;
  emoji: string;
  skills: string;
  note?: string | null;
  params: { label: string; value: string }[];
}) {
  return (
    <div className="panel animate-pop mb-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {emoji} {title}
          </h1>
          <p className="text-sm text-muted-foreground">Trains {skills}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {params.map((p) => (
            <span
              key={p.label}
              className="rounded-full bg-muted px-3 py-1 text-xs font-bold"
            >
              {p.label}: {p.value}
            </span>
          ))}
        </div>
      </div>
      {note ? (
        <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground">
          🤖 {note}
        </p>
      ) : null}
    </div>
  );
}

const bandCopy: Record<RoundResult["band"], string> = {
  excelling: "Performing very well",
  strong: "Performing well",
  optimal: "Right in the challenge zone",
  struggling: "Finding this tricky",
  overwhelmed: "Too hard right now",
};

export function RoundSummary({
  result,
  onAgain,
  confidence,
}: {
  result: RoundResult;
  onAgain: () => void;
  confidence: { label: string; confidence: number };
}) {
  const router = useRouter();
  return (
    <div className="panel animate-pop mt-5 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-primary/15">
          <span className="font-display text-2xl font-bold text-primary">
            {result.performance}
          </span>
        </div>
        <div className="min-w-52 flex-1">
          <h2 className="font-display text-2xl font-bold">{result.feedback}</h2>
          <p className="text-sm text-muted-foreground">
            {bandCopy[result.band]}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-bold",
            confidence.label === "HARDER" && "bg-success/20 text-success",
            confidence.label === "SAME" && "bg-muted",
            confidence.label === "EASIER" && "bg-warning/25",
          )}
        >
          Next: {confidence.label} · {Math.round(confidence.confidence * 100)}%
          confident
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Accuracy"
          value={`${Math.round(result.metrics.accuracy * 100)}%`}
        />
        <Stat label="Time" value={`${result.metrics.timeTaken.toFixed(1)}s`} />
        <Stat label="Mistakes" value={result.metrics.mistakes} />
        <Stat label="Hints" value={result.metrics.hintsUsed} />
      </div>

      {result.notes.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm">
          {result.notes.map((n) => (
            <li key={n} className="rounded-lg bg-muted/60 px-3 py-2">
              ⚙️ {n}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={onAgain}
          className="toy-press rounded-full bg-primary px-5 py-3 font-display text-lg font-bold text-primary-foreground shadow-toy"
        >
          Next round
        </button>
        <button
          onClick={() => router.navigate({ to: "/" })}
          className="toy-press rounded-full border-2 border-border bg-card px-5 py-3 font-display text-lg font-bold"
        >
          Back to games
        </button>
        <button
          onClick={() => router.navigate({ to: "/dashboard" })}
          className="toy-press rounded-full border-2 border-border bg-card px-5 py-3 font-display text-lg font-bold"
        >
          See progress
        </button>
      </div>
    </div>
  );
}

/** Fullscreen trophy overlay shown on round completion. Trophy displays for
 *  1.5 s, then "Next Game" / "Home Screen" buttons fade in. */
export function GameWinOverlay({
  show,
  onNextGame,
}: {
  show: boolean;
  onNextGame: () => void;
}) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setShowButtons(false);
      // fade-in the overlay
      const t1 = setTimeout(() => setAnimate(true), 30);
      // after 1.5 s show the action buttons
      const t2 = setTimeout(() => setShowButtons(true), 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setAnimate(false);
      setShowButtons(false);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-500",
        animate ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Trophy — scales up on enter */}
      <div
        className={cn(
          "transition-all duration-700",
          animate ? "scale-100 translate-y-0" : "scale-50 -translate-y-12",
        )}
      >
        <img
          src="/trophy.png"
          alt="Winner trophy"
          width={180}
          height={180}
          className="drop-shadow-[0_0_40px_rgba(255,215,0,0.5)]"
        />
      </div>

      <p
        className={cn(
          "mt-6 font-display text-4xl font-bold text-white drop-shadow-lg transition-all duration-600 delay-150 sm:text-5xl",
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        You Win! 🎉
      </p>

      {/* Buttons — appear after 1.5 s delay */}
      <div
        className={cn(
          "mt-8 flex flex-col items-center gap-4 transition-all duration-500",
          showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none",
        )}
      >
        <button
          onClick={onNextGame}
          className="toy-press rounded-full bg-primary px-10 py-4 font-display text-2xl font-bold text-primary-foreground shadow-toy"
        >
          🎮 Next Game
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="toy-press rounded-full border-2 border-white/60 bg-white/15 px-10 py-4 font-display text-2xl font-bold text-white shadow-toy"
        >
          🏠 Home Screen
        </button>
      </div>
    </div>
  );
}

export function NeedsProfile() {
  return (
    <div className="panel animate-pop p-8 text-center">
      <h1 className="font-display text-2xl font-bold">
        Let's set up a player first
      </h1>
      <p className="mt-2 text-muted-foreground">
        MindWeave personalises every challenge, so it needs a profile before
        playing.
      </p>
      <Link
        to="/"
        className="toy-press mt-5 inline-block rounded-full bg-primary px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-toy"
      >
        Create profile
      </Link>
    </div>
  );
}
