import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import type { RoundResult, SimonDifficulty } from "@/lib/intelliplay/types";

export const Route = createFileRoute("/play/simon")({
  head: () => ({
    meta: [
      { title: "Simon Says — IntelliPlay Adaptive Games" },
      {
        name: "description",
        content:
          "Adaptive memory sequences that grow, slow down or add rules based on how a child remembers.",
      },
      { property: "og:title", content: "Simon Says — IntelliPlay" },
      {
        property: "og:description",
        content: "Adaptive working memory and impulse control training.",
      },
    ],
  }),
  component: SimonPage,
});

const PADS = [
  { label: "Red", color: "oklch(0.64 0.21 25)", emoji: "🍓" },
  { label: "Blue", color: "oklch(0.6 0.16 250)", emoji: "🫐" },
  { label: "Green", color: "oklch(0.68 0.16 152)", emoji: "🥝" },
  { label: "Yellow", color: "oklch(0.83 0.15 85)", emoji: "🍋" },
  { label: "Purple", color: "oklch(0.6 0.19 300)", emoji: "🍇" },
  { label: "Orange", color: "oklch(0.72 0.17 45)", emoji: "🍊" },
];

function SimonPage() {
  const { profile } = useProfile();
  if (!profile)
    return (
      <AppShell>
        <NeedsProfile />
      </AppShell>
    );
  return (
    <AppShell>
      <SimonGame />
    </AppShell>
  );
}

function SimonGame() {
  const { profile, submitRound } = useProfile();
  const [diff, setDiff] = useState<SimonDifficulty>(profile!.difficulty.simon);
  const pads = PADS.slice(0, diff.paletteSize);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const stepMs = Math.round(900 - diff.speed * 550);
  const conditionalRule = diff.sequenceLength >= 7;

  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "done">("idle");
  const [active, setActive] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<RoundResult | null>(null);
  const startRef = useRef(Date.now());
  const lastTapRef = useRef(Date.now());
  const reactionRef = useRef<number[]>([]);
  const correctRef = useRef(0);

  const startRound = useCallback(() => {
    const d = profileRef.current!.difficulty.simon;
    setDiff(d);
    const step = Math.round(900 - d.speed * 550);
    const seq = Array.from({ length: d.sequenceLength }, () =>
      Math.floor(Math.random() * pads.length),
    );
    setSequence(seq);
    setResult(null);
    setInputIndex(0);
    setMistakes(0);
    correctRef.current = 0;
    reactionRef.current = [];
    setPhase("showing");
    let i = 0;
    const tick = () => {
      if (i >= seq.length) {
        setActive(null);
        setLocked(true);
        window.setTimeout(() => {
          setLocked(false);
          setPhase("input");
          startRef.current = Date.now();
          lastTapRef.current = Date.now();
        }, d.inputDelay);
        return;
      }
      setActive(seq[i]!);
      window.setTimeout(() => {
        setActive(null);
        i += 1;
        window.setTimeout(tick, step * 0.3);
      }, step * 0.7);
    };
    window.setTimeout(tick, 600);
  }, []);

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(
    (correct: number, wrong: number) => {
      const time = (Date.now() - startRef.current) / 1000;
      const avgReaction = reactionRef.current.length
        ? reactionRef.current.reduce((a, b) => a + b, 0) / reactionRef.current.length / 1000
        : 1;
      const accuracy = correct / Math.max(1, sequence.length);
      const res = submitRound(
        "simon",
        {
          accuracy,
          timeTaken: time,
          expectedTime: sequence.length * 1.6,
          attempts: 1,
          mistakes: wrong,
          hintsUsed: 0,
          completed: wrong === 0,
          reactionTime: avgReaction,
          mistakeType:
            correct >= sequence.length - 2 && wrong > 0
              ? "late-sequence-forgetting"
              : "sequence-error",
        },
        {
          impulsive: avgReaction < 0.45 && wrong > 0,
          memoryLoadLoss: correct >= Math.floor(sequence.length * 0.6) && wrong > 0,
          timePressureLoss: diff.speed > 0.6 && accuracy < 0.6,
        },
      );
      setResult(res);
      setPhase("done");
    },
    [sequence.length, submitRound, diff.speed],
  );

  const tap = (i: number) => {
    if (phase !== "input" || locked) return;
    const now = Date.now();
    reactionRef.current.push(now - lastTapRef.current);
    lastTapRef.current = now;
    setActive(i);
    window.setTimeout(() => setActive(null), 180);

    if (sequence[inputIndex] === i) {
      correctRef.current += 1;
      const next = inputIndex + 1;
      setInputIndex(next);
      if (next === sequence.length) finish(correctRef.current, mistakes);
    } else {
      const wrong = mistakes + 1;
      setMistakes(wrong);
      if (wrong >= 2) finish(correctRef.current, wrong);
    }
  };

  const ability = rollingAbility(profile!.history, "simon", result?.performance ?? 60);

  return (
    <>
      <GameHeader
        title="Simon Says"
        emoji="🎵"
        skills="working memory, attention and reaction control"
        note={crossGameNote("simon", profile!.skills)}
        params={[
          { label: "Steps", value: String(diff.sequenceLength) },
          { label: "Speed", value: diff.speed.toFixed(2) },
          { label: "Buttons", value: String(diff.paletteSize) },
          { label: "Think pause", value: `${diff.inputDelay}ms` },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="panel p-6">
          <p className="mb-4 text-center font-display text-xl font-bold">
            {phase === "showing"
              ? "Watch carefully…"
              : phase === "input"
                ? `Your turn — step ${inputIndex + 1} of ${sequence.length}`
                : phase === "done"
                  ? "Round complete"
                  : "Get ready"}
          </p>
          {conditionalRule ? (
            <p className="mx-auto mb-4 max-w-md rounded-xl bg-accent/15 px-3 py-2 text-center text-sm font-bold">
              Extra rule: repeat the whole sequence exactly, including the repeats.
            </p>
          ) : null}
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
            {pads.map((p, i) => (
              <button
                key={p.label}
                onClick={() => tap(i)}
                disabled={phase !== "input" || locked}
                className="toy-press aspect-square rounded-2xl text-4xl shadow-toy transition-all disabled:cursor-not-allowed"
                style={{
                  backgroundColor: p.color,
                  opacity: active === i ? 1 : 0.72,
                  transform: active === i ? "scale(1.06)" : undefined,
                }}
                aria-label={p.label}
              >
                {p.emoji}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-1">
            {sequence.map((_, i) => (
              <span
                key={i}
                className="size-3 rounded-full"
                style={{ backgroundColor: i < inputIndex ? "var(--success)" : "var(--border)" }}
              />
            ))}
          </div>
        </div>

        <aside className="panel h-fit space-y-3 p-4">
          <Stat label="Sequence" value={`${sequence.length} steps`} />
          <Stat label="Correct" value={inputIndex} />
          <Stat label="Mistakes" value={`${mistakes} / 2`} />
          {phase === "input" ? (
            <button
              onClick={() => finish(correctRef.current, mistakes)}
              className="w-full rounded-full border-2 border-border px-4 py-2 text-sm font-bold"
            >
              I can't remember
            </button>
          ) : null}
        </aside>
      </div>

      {result ? (
        <RoundSummary
          result={result}
          onAgain={startRound}
          confidence={recommendation(
            adjustmentFor(bandFor(ability), profile!.streaks.simon),
            ability,
          )}
        />
      ) : null}
    </>
  );
}
