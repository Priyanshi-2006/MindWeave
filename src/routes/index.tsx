import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/intelliplay/shell";
import { useProfile } from "@/lib/intelliplay/store";
import { CHARACTERS } from "@/lib/intelliplay/avatars";
import { BONUS_EMOJI, BONUS_LABELS, SKILLS, type SkillKey } from "@/lib/intelliplay/types";
import { clamp } from "@/lib/intelliplay/engine";
import { evaluateBonus, todayKey } from "@/lib/intelliplay/bonus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindWeave — Adaptive Cognitive Games for Kids" },
      {
        name: "description",
        content:
          "MindWeave learns how your child thinks and adapts four cognitive games — maze, spot the difference, memory and detective — to their exact challenge zone.",
      },
      { property: "og:title", content: "MindWeave — Adaptive Cognitive Games for Kids" },
      {
        property: "og:description",
        content:
          "Four adaptive games that personalise difficulty to every child's cognitive profile.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { profile, ready, user } = useProfile();
  const navigate = useNavigate();

  if (!ready)
    return (
      <AppShell>
        <div className="panel p-8 text-center">Loading…</div>
      </AppShell>
    );

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  if (!profile)
    return (
      <AppShell>
        <CreateProfile />
      </AppShell>
    );
  if (!profile.assessmentDone)
    return (
      <AppShell>
        <Assessment />
      </AppShell>
    );
  return (
    <AppShell>
      <Hub />
    </AppShell>
  );
}

function CreateProfile() {
  const { start } = useProfile();
  const [name, setName] = useState("");
  const [age, setAge] = useState(9);
  const [avatar, setAvatar] = useState<string>("fox");
  const preview = CHARACTERS.find((c) => c.id === avatar)?.src ?? avatar;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="animate-pop">
        <h1 className="font-display text-5xl font-bold leading-tight">
          The game learns the child,
          <br />
          not the other way round.
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          MindWeave watches how your child plays four cognitive games, builds a living profile of
          their strengths, and tunes every next challenge to keep them in the perfect learning zone.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
          {["🧭 Maze Escape", "👀 Spot the Difference", "🎵 Simon Says", "🔎 Mini Detective"].map(
            (g) => (
              <span key={g} className="rounded-full bg-card px-4 py-2 shadow-soft">
                {g}
              </span>
            ),
          )}
        </div>
        <div className="mt-8 flex items-end gap-1">
          {CHARACTERS.map((c, i) => (
            <img
              key={c.id}
              src={c.src}
              alt=""
              aria-hidden
              loading="lazy"
              width={512}
              height={512}
              className="size-20 sm:size-24"
              style={{ transform: `rotate(${(i % 2 ? 5 : -5).toString()}deg)` }}
            />
          ))}
        </div>
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) start(name.trim(), age, avatar);
        }}
        className="panel animate-pop h-fit space-y-4 p-6"
      >
        <h2 className="font-display text-2xl font-bold">Create a child profile</h2>
        <div className="flex items-center gap-3">
          <img
            src={preview}
            alt="Selected buddy"
            width={72}
            height={72}
            className="size-18 rounded-full bg-secondary/60 object-cover ring-4 ring-primary/20"
          />
          <div className="flex flex-wrap gap-2">
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setAvatar(c.id)}
                title={c.label}
                className={`toy-press grid size-12 place-items-center rounded-2xl border-2 bg-secondary/50 ${
                  avatar === c.id ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={c.src} alt={c.label} width={40} height={40} className="size-9" />
              </button>
            ))}
            <label className="toy-press grid size-12 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-border text-lg">
              ＋
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => setAvatar(String(reader.result));
                  reader.readAsDataURL(f);
                }}
              />
            </label>
          </div>
        </div>
        <label className="block text-sm font-bold">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya"
            className="mt-1 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base font-semibold outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm font-bold">
          Age: {age}
          <input
            type="range"
            min={9}
            max={15}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </label>
        <button
          type="submit"
          className="toy-press w-full rounded-full bg-primary px-6 py-4 font-display text-xl font-bold text-primary-foreground shadow-toy"
        >
          Start playing
        </button>
      </form>
    </div>
  );
}

/* ---------------- Initial assessment ---------------- */

type Q = {
  prompt: string;
  /** If set, the user first sees `reveal` for a moment, then `prompt` appears. */
  reveal?: string;
  options: string[];
  answer: number;
  skill: SkillKey;
};
const QUESTIONS: Q[] = [
  {
    prompt: "Which shape comes next?  ▲ ● ▲ ● ▲ __",
    options: ["▲", "●", "■"],
    answer: 1,
    skill: "logicalReasoning",
  },
  {
    prompt: "You must reach the door. Two paths: one has 3 turns, one has 7. Which is quicker?",
    options: ["3 turns", "7 turns", "Same"],
    answer: 0,
    skill: "spatialReasoning",
  },
  {
    prompt: "Which group is different?  🍎🍎🍎  |  🍎🍎🍏  |  🍎🍎🍎",
    options: ["First", "Second", "Third"],
    answer: 1,
    skill: "visualAttention",
  },
  {
    reveal: "3 · 7 · 1",
    prompt: "What was the middle number?",
    options: ["3", "7", "1"],
    answer: 1,
    skill: "workingMemory",
  },
  {
    prompt: "Sam is taller than Ana. Ana is taller than Rio. Who is shortest?",
    options: ["Sam", "Ana", "Rio"],
    answer: 2,
    skill: "problemSolving",
  },
];

function Assessment() {
  const { profile, finishAssessment } = useProfile();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState<Record<string, boolean>>({});
  const [startedAt] = useState(Date.now());
  const [revealing, setRevealing] = useState<boolean>(!!QUESTIONS[0]?.reveal);

  const q = QUESTIONS[step];

  // When the step changes, check if the new question has a reveal phase.
  const startStep = (newStep: number) => {
    setStep(newStep);
    setRevealing(!!QUESTIONS[newStep]?.reveal);
  };

  // Auto-dismiss the reveal after 2.5 s.
  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(() => setRevealing(false), 2500);
    return () => clearTimeout(id);
  }, [revealing, step]);

  const answer = (i: number) => {
    const correct = i === q!.answer;
    const next = { ...score, [q!.skill]: correct };
    setScore(next);
    if (step + 1 < QUESTIONS.length) {
      startStep(step + 1);
      return;
    }
    const seconds = (Date.now() - startedAt) / 1000;
    const speedBonus = clamp(20 - seconds / QUESTIONS.length, -6, 8);
    const skills: Partial<Record<SkillKey, number>> = {};
    for (const s of SKILLS) {
      const hit = next[s];
      const base = hit === undefined ? 60 : hit ? 74 : 48;
      skills[s] = Math.round(clamp(base + speedBonus, 25, 92));
    }
    finishAssessment(skills);
  };

  return (
    <div className="panel animate-pop mx-auto max-w-xl p-6">
      <p className="text-sm font-bold text-muted-foreground">
        Warm-up {step + 1} of {QUESTIONS.length} · Hi {profile!.name}!
      </p>
      {revealing ? (
        /* ── Phase 1: show the sequence, hide the options ── */
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Remember this
          </p>
          <p className="animate-pop font-display text-5xl font-bold tracking-widest">
            {q!.reveal}
          </p>
          <p className="text-xs text-muted-foreground">It will disappear in a moment…</p>
        </div>
      ) : (
        /* ── Phase 2: show the question and options ── */
        <>
          <h1 className="mt-2 font-display text-2xl font-bold">{q!.prompt}</h1>
          <div className="mt-5 space-y-2">
            {q!.options.map((o, i) => (
              <button
                key={o}
                onClick={() => answer(i)}
                className="toy-press w-full rounded-xl border-2 border-border bg-card px-4 py-4 text-left font-display text-lg font-bold shadow-toy"
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------- Game hub ---------------- */

const GAMES = [
  {
    to: "/play/maze",
    emoji: "🧭",
    title: "Maze Escape",
    desc: "Plan a route, avoid dead ends.",
    color: "var(--maze)",
  },
  {
    to: "/play/spot",
    emoji: "👀",
    title: "Spot the Difference",
    desc: "Find what changed between scenes.",
    color: "var(--spot)",
  },
  {
    to: "/play/simon",
    emoji: "🎵",
    title: "Simon Says",
    desc: "Repeat the sequence from memory.",
    color: "var(--simon)",
  },
  {
    to: "/play/detective",
    emoji: "🔎",
    title: "Mini Detective",
    desc: "Read the clues, solve the case.",
    color: "var(--detective)",
  },
] as const;

function Hub() {
  const { profile, dismissBonus } = useProfile();
  const p = profile!;

  const offer = evaluateBonus(p);
  const showBonusBanner = offer.unlocked && p.bonus.dismissedOn !== todayKey();

  const summary = (game: (typeof GAMES)[number]["to"]) => {
    const key = game.split("/")[2] as keyof typeof p.difficulty;
    const d = p.difficulty[key] as Record<string, number | boolean>;
    return Object.entries(d)
      .slice(0, 2)
      .map(
        ([k, v]) =>
          `${k}: ${typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(2)) : v ? "on" : "off"}`,
      )
      .join(" · ");
  };

  return (
    <div className="relative">
      <img
        src={CHARACTERS[1].src}
        alt=""
        aria-hidden
        loading="lazy"
        width={512}
        height={512}
        className="pointer-events-none absolute -top-10 right-2 hidden size-28 rotate-6 opacity-90 lg:block"
      />
      <img
        src={CHARACTERS[2].src}
        alt=""
        aria-hidden
        loading="lazy"
        width={512}
        height={512}
        className="pointer-events-none absolute -bottom-6 -left-10 hidden size-24 -rotate-6 opacity-80 xl:block"
      />

      {/* Brain Boost Banner when available */}
      {showBonusBanner ? (
        <div className="panel animate-pop mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/15 via-accent/15 to-card border-2 border-primary/40 shadow-toy">
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{BONUS_EMOJI[offer.game]}</span>
            <div>
              <h2 className="font-display text-2xl font-bold text-primary">
                🎉 Brain Boost Unlocked!
              </h2>
              <p className="text-sm font-semibold text-foreground">
                You've mastered today's games! {BONUS_LABELS[offer.game]} is ready for you.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/bonus"
              className="toy-press rounded-full bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground shadow-toy text-base"
            >
              Claim Brain Boost
            </Link>
            <button
              onClick={() => dismissBonus()}
              className="toy-press rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground"
            >
              Maybe Later
            </button>
          </div>
        </div>
      ) : null}

      <div className="text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Hi {p.name}! Pick a game 🎉
        </h1>
        <p className="mt-1 text-muted-foreground">
          Every challenge below is already tuned to your profile.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {GAMES.map((g, i) => (
          <Link
            key={g.to}
            to={g.to}
            className="panel toy-press animate-pop relative block overflow-hidden p-6 shadow-toy hover:-translate-y-1"
            style={{ borderColor: g.color }}
          >
            <span
              className="absolute -right-10 -top-10 size-32 rounded-full opacity-15"
              style={{ background: g.color }}
            />
            <img
              src={CHARACTERS[i % CHARACTERS.length]!.src}
              alt=""
              aria-hidden
              loading="lazy"
              width={512}
              height={512}
              className="absolute -bottom-3 right-2 size-20 opacity-90"
            />
            <span className="text-5xl">{g.emoji}</span>
            <h2 className="mt-2 font-display text-2xl font-bold">{g.title}</h2>
            <p className="max-w-[70%] text-sm text-muted-foreground">{g.desc}</p>
            <p className="mt-4 inline-block rounded-full bg-muted/70 px-3 py-1 text-xs font-bold">
              {summary(g.to)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
