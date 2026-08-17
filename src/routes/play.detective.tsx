import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AppShell,
  GameHeader,
  NeedsProfile,
  RoundSummary,
  Stat,
} from "@/components/intelliplay/shell";
import {
  adjustmentFor,
  bandFor,
  crossGameNote,
  recommendation,
  rollingAbility,
} from "@/lib/intelliplay/engine";
import { useProfile } from "@/lib/intelliplay/store";
import type { DetectiveDifficulty, RoundResult } from "@/lib/intelliplay/types";

export const Route = createFileRoute("/play/detective")({
  head: () => ({
    meta: [
      { title: "Mini Detective — IntelliPlay Adaptive Games" },
      {
        name: "description",
        content:
          "Solve friendly classroom mysteries where clue count and red herrings adapt to your child's reasoning.",
      },
      { property: "og:title", content: "Mini Detective — IntelliPlay" },
      {
        property: "og:description",
        content: "Adaptive logical reasoning and deduction puzzles for children.",
      },
    ],
  }),
  component: DetectivePage,
});

const SUSPECTS = ["Rahul", "Meera", "Arjun", "Sara", "Kabir"];
const CASES = [
  { item: "the class mascot toy", place: "the art room", trace: "a muddy footprint" },
  { item: "the science trophy", place: "the library", trace: "a wet umbrella" },
  { item: "the birthday cupcakes", place: "the music room", trace: "a trail of crumbs" },
  { item: "the football", place: "the playground shed", trace: "a torn ribbon" },
];

type Clue = { id: number; text: string; relevant: boolean };

function buildCase(d: DetectiveDifficulty) {
  const scenario = CASES[Math.floor(Math.random() * CASES.length)]!;
  const suspects = [...SUSPECTS].sort(() => Math.random() - 0.5).slice(0, d.suspectCount);
  const culprit = suspects[Math.floor(Math.random() * suspects.length)]!;
  const others = suspects.filter((s) => s !== culprit);

  const clues: Clue[] = [];
  let id = 0;
  others.forEach((s) => {
    clues.push({
      id: id++,
      text: `${s} was in ${scenario.place === "the library" ? "the gym" : "the library"} the whole afternoon, and the camera proves it.`,
      relevant: true,
    });
  });
  clues.push({
    id: id++,
    text: `${scenario.trace.charAt(0).toUpperCase() + scenario.trace.slice(1)} was found right next to ${scenario.place}.`,
    relevant: true,
  });
  clues.push({
    id: id++,
    text: `${culprit} came back to class with ${scenario.trace.includes("mud") ? "muddy shoes" : "damp sleeves"}.`,
    relevant: true,
  });
  if (d.reasoningSteps >= 2)
    clues.push({
      id: id++,
      text: `${culprit} said they never left the classroom, but the door log shows one extra exit.`,
      relevant: true,
    });
  if (d.reasoningSteps >= 3)
    clues.push({
      id: id++,
      text: `${scenario.item} disappeared between 2:15 and 2:30, exactly when that exit was logged.`,
      relevant: true,
    });

  const fillers = [
    "The classroom window was open because it was warm.",
    "The pencil sharpener broke last week.",
    "Meera's water bottle is bright pink.",
    "There is a maths test on Friday.",
    "The bell rang two minutes late today.",
  ];
  for (let i = 0; i < d.irrelevantClues; i++)
    clues.push({ id: id++, text: fillers[i % fillers.length]!, relevant: false });

  const trimmed = clues
    .slice(0, Math.max(d.clueCount, others.length + 2))
    .sort(() => Math.random() - 0.5);
  return { scenario, suspects, culprit, clues: trimmed };
}

function DetectivePage() {
  const { profile } = useProfile();
  if (!profile)
    return (
      <AppShell>
        <NeedsProfile />
      </AppShell>
    );
  return (
    <AppShell>
      <DetectiveGame />
    </AppShell>
  );
}

function DetectiveGame() {
  const { profile, submitRound } = useProfile();
  const [d, setD] = useState<DetectiveDifficulty>(profile!.difficulty.detective);
  const [seed, setSeed] = useState(0);
  const kase = useMemo(() => buildCase(d), [d, seed]);

  const [picked, setPicked] = useState<number[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [result, setResult] = useState<RoundResult | null>(null);
  const startRef = useRef(Date.now());

  const expected = kase.clues.length * 9 + 12;

  const submit = useCallback(
    (choice: string) => {
      setAnswer(choice);
      const correct = choice === kase.culprit;
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (!correct && nextAttempts < 2) return;

      const time = (Date.now() - startRef.current) / 1000;
      const relevantIds = kase.clues.filter((c) => c.relevant).map((c) => c.id);
      const cluePrecision = picked.length
        ? picked.filter((p) => relevantIds.includes(p)).length / picked.length
        : 0.6;
      const accuracy = correct ? 0.7 + 0.3 * cluePrecision : 0.2 * cluePrecision;
      const res = submitRound(
        "detective",
        {
          accuracy,
          timeTaken: time,
          expectedTime: expected,
          attempts: nextAttempts,
          mistakes: nextAttempts - (correct ? 1 : 0),
          hintsUsed: hints,
          completed: correct,
          reactionTime: time / Math.max(1, picked.length + 1),
          mistakeType: cluePrecision < 0.5 ? "used-irrelevant-clues" : "reasoning-slip",
        },
        {
          fastButWrong: !correct && time < expected * 0.5,
          slowButAccurate: correct && time > expected * 1.4,
        },
      );
      setResult(res);
    },
    [attempts, kase, picked, hints, expected, submitRound],
  );

  const reset = () => {
    setD(profile!.difficulty.detective);
    setSeed((s) => s + 1);
    setPicked([]);
    setAnswer(null);
    setAttempts(0);
    setHints(0);
    setHighlight(false);
    setResult(null);
    startRef.current = Date.now();
  };

  const ability = rollingAbility(profile!.history, "detective", result?.performance ?? 60);

  return (
    <>
      <GameHeader
        title="Mini Detective"
        emoji="🔎"
        skills="logical reasoning, deduction and decision making"
        note={crossGameNote("detective", profile!.skills)}
        params={[
          { label: "Clues", value: String(kase.clues.length) },
          { label: "Suspects", value: String(d.suspectCount) },
          { label: "Red herrings", value: String(d.irrelevantClues) },
          { label: "Reasoning steps", value: String(d.reasoningSteps) },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="panel p-5">
          <h2 className="font-display text-2xl font-bold">
            Case: {kase.scenario.item} vanished from {kase.scenario.place}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the clues that actually help, then choose who did it.
          </p>

          <ul className="mt-4 space-y-2">
            {kase.clues.map((c, i) => {
              const chosen = picked.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    onClick={() =>
                      setPicked((p) => (chosen ? p.filter((x) => x !== c.id) : [...p, c.id]))
                    }
                    disabled={!!result}
                    className="w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors"
                    style={{
                      borderColor: chosen ? "var(--primary)" : "var(--border)",
                      backgroundColor: chosen
                        ? "color-mix(in oklab, var(--primary) 12%, transparent)"
                        : highlight && c.relevant
                          ? "color-mix(in oklab, var(--warning) 25%, transparent)"
                          : "transparent",
                    }}
                  >
                    <span className="mr-2 font-display text-muted-foreground">Clue {i + 1}</span>
                    {c.text}
                  </button>
                </li>
              );
            })}
          </ul>

          <h3 className="mt-6 font-display text-xl font-bold">Who took it?</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {kase.suspects.map((s) => (
              <button
                key={s}
                onClick={() => !result && submit(s)}
                disabled={!!result}
                className="toy-press rounded-full border-2 border-border bg-card px-5 py-3 font-display text-lg font-bold shadow-toy"
                style={{
                  backgroundColor:
                    answer === s
                      ? s === kase.culprit
                        ? "color-mix(in oklab, var(--success) 30%, var(--card))"
                        : "color-mix(in oklab, var(--destructive) 22%, var(--card))"
                      : undefined,
                }}
              >
                🧒 {s}
              </button>
            ))}
          </div>
          {answer && !result ? (
            <p className="mt-3 rounded-xl bg-warning/25 px-3 py-2 text-sm font-bold">
              Not quite — read the clues once more and try one last time.
            </p>
          ) : null}
        </div>

        <aside className="panel h-fit space-y-3 p-4">
          <Stat label="Clues selected" value={picked.length} />
          <Stat label="Attempts" value={`${attempts} / 2`} />
          {!result ? (
            <button
              onClick={() => {
                setHighlight(true);
                setHints((h) => h + 1);
                window.setTimeout(() => setHighlight(false), 2200);
              }}
              className="toy-press w-full rounded-full bg-warning px-4 py-3 font-display font-bold text-warning-foreground shadow-toy"
            >
              💡 Highlight useful clues
            </button>
          ) : null}
        </aside>
      </div>

      {result ? (
        <>
          <p className="panel mt-5 p-4 font-semibold">
            🕵️ The answer was <strong>{kase.culprit}</strong>.
          </p>
          <RoundSummary
            result={result}
            onAgain={reset}
            confidence={recommendation(
              adjustmentFor(bandFor(ability), profile!.streaks.detective),
              ability,
            )}
          />
        </>
      ) : null}
    </>
  );
}
