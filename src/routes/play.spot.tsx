import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { RoundResult, SpotDifficulty } from "@/lib/intelliplay/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/spot")({
  head: () => ({
    meta: [
      { title: "Spot the Difference — IntelliPlay Adaptive Games" },
      {
        name: "description",
        content:
          "Adaptive visual attention practice: scenes get busier and differences subtler as observation improves.",
      },
      { property: "og:title", content: "Spot the Difference — IntelliPlay" },
      {
        property: "og:description",
        content: "Adaptive observation and concentration training for children.",
      },
    ],
  }),
  component: SpotPage,
});

const EMOJI = [
  "🐶",
  "🐱",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐸",
  "🐵",
  "🦉",
  "🐝",
  "🦋",
  "🌻",
  "🍎",
  "⭐",
  "🚗",
  "🎈",
  "🧩",
  "🍩",
  "🐬",
  "🌈",
];
const HUES = [10, 45, 90, 150, 195, 240, 285, 320];

type Item = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  hue: number;
  rotate: number;
};

function makeScene(objectCount: number, differenceCount: number, subtlety: number) {
  const items: Item[] = [];
  const cols = Math.ceil(Math.sqrt(objectCount));
  for (let i = 0; i < objectCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    items.push({
      id: i,
      emoji: EMOJI[Math.floor(Math.random() * EMOJI.length)]!,
      x: (col + 0.5) * (100 / cols) + (Math.random() - 0.5) * 6,
      y: (row + 0.5) * (100 / Math.ceil(objectCount / cols)) + (Math.random() - 0.5) * 6,
      size: 1 + Math.random() * 0.35,
      hue: HUES[Math.floor(Math.random() * HUES.length)]!,
      rotate: Math.round((Math.random() - 0.5) * 20),
    });
  }

  const indices = [...items.keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(differenceCount, objectCount));
  const diffIds = new Set(indices);
  const right = items.map((it) => {
    if (!diffIds.has(it.id)) return { ...it };
    const magnitude = 1 - subtlety; // subtle => small change
    const kind = Math.floor(Math.random() * 3);
    if (kind === 0)
      return {
        ...it,
        emoji: EMOJI[(EMOJI.indexOf(it.emoji) + 1 + Math.floor(magnitude * 3)) % EMOJI.length]!,
      };
    if (kind === 1) return { ...it, size: it.size * (1 + (0.12 + magnitude * 0.4)) };
    return {
      ...it,
      rotate: it.rotate + 25 + magnitude * 60,
      hue: (it.hue + 40 + magnitude * 120) % 360,
    };
  });

  return { left: items, right, diffIds };
}

function SpotPage() {
  const { profile } = useProfile();
  if (!profile)
    return (
      <AppShell>
        <NeedsProfile />
      </AppShell>
    );
  return (
    <AppShell>
      <SpotGame />
    </AppShell>
  );
}

function SpotGame() {
  const { profile, submitRound } = useProfile();
  const [diff, setDiff] = useState<SpotDifficulty>(profile!.difficulty.spot);
  const [seed, setSeed] = useState(0);
  const scene = useMemo(
    () => makeScene(diff.objectCount, diff.differenceCount, diff.subtlety),
    [diff.objectCount, diff.differenceCount, diff.subtlety, seed],
  );

  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [hints, setHints] = useState(0);
  const [hinted, setHinted] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const startRef = useRef(Date.now());
  const clickTimes = useRef<number[]>([]);

  const total = scene.diffIds.size;
  const expected = total * 9 + 6;

  const finish = useCallback(
    (completed: boolean, foundCount: number) => {
      if (result) return;
      const time = (Date.now() - startRef.current) / 1000;
      const accuracy = total ? foundCount / total : 0;
      const avgReaction = clickTimes.current.length ? time / clickTimes.current.length : time;
      const res = submitRound(
        "spot",
        {
          accuracy,
          timeTaken: time,
          expectedTime: expected,
          attempts: 1,
          mistakes: misses,
          hintsUsed: hints,
          completed,
          reactionTime: avgReaction,
          mistakeType: misses > total ? "random-clicking" : "missed-detail",
        },
        {
          fastButWrong: time < expected * 0.6 && accuracy < 0.6,
          slowButAccurate: time > expected * 1.4 && accuracy >= 0.8,
          timePressureLoss: diff.timeLimit > 0 && !completed,
        },
      );
      setResult(res);
    },
    [result, total, expected, misses, hints, submitRound, diff.timeLimit],
  );

  useEffect(() => {
    if (result) return;
    const id = window.setInterval(() => {
      const t = (Date.now() - startRef.current) / 1000;
      setElapsed(t);
      if (diff.timeLimit > 0 && t > diff.timeLimit) finish(false, found.length);
    }, 200);
    return () => window.clearInterval(id);
  }, [diff.timeLimit, finish, found.length, result]);

  const click = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (result) return;
    clickTimes.current.push(Date.now());
    if (scene.diffIds.has(id) && !found.includes(id)) {
      const next = [...found, id];
      setFound(next);
      if (next.length === total) window.setTimeout(() => finish(true, next.length), 80);
    } else {
      // Tapped a non-difference icon or an already found icon => count mistake
      setMisses((m) => m + 1);
    }
  };

  const handlePanelClick = () => {
    if (result) return;
    clickTimes.current.push(Date.now());
    setMisses((m) => m + 1);
  };

  const hint = () => {
    const remaining = [...scene.diffIds].filter((id) => !found.includes(id));
    if (!remaining.length) return;
    setHinted(remaining[0]!);
    setHints((h) => h + 1);
    window.setTimeout(() => setHinted(null), 1400);
  };

  const reset = () => {
    setDiff(profile!.difficulty.spot);
    setSeed((s) => s + 1);
    setFound([]);
    setMisses(0);
    setHints(0);
    setHinted(null);
    setResult(null);
    startRef.current = Date.now();
    clickTimes.current = [];
    setElapsed(0);
  };

  const ability = rollingAbility(profile!.history, "spot", result?.performance ?? 60);

  const Panel = ({ items, label }: { items: Item[]; label: string }) => (
    <div
      onClick={handlePanelClick}
      className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-border bg-secondary/50 cursor-crosshair"
    >
      {items.map((it) => {
        const isFound = found.includes(it.id);
        const isHinted = hinted === it.id;

        return (
          <button
            key={it.id}
            onClick={(e) => click(it.id, e)}
            onDoubleClick={(e) => click(it.id, e)}
            className={cn(
              "absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-all duration-150 p-1.5 touch-manipulation cursor-pointer select-none",
              isFound && "ring-4 ring-success bg-success/25 scale-105 shadow-soft",
              isHinted && !isFound && "ring-4 ring-dashed ring-warning bg-warning/30"
            )}
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              fontSize: `${it.size * 1.6}rem`,
              transform: `translate(-50%,-50%) rotate(${it.rotate}deg)`,
              filter: `hue-rotate(${it.hue}deg)`,
            }}
            aria-label={`${label} scene object`}
          >
            <span>{it.emoji}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <GameHeader
        title="Spot the Difference"
        emoji="👀"
        skills="visual attention, observation and concentration"
        note={crossGameNote("spot", profile!.skills)}
        params={[
          { label: "Differences", value: String(diff.differenceCount) },
          { label: "Subtlety", value: diff.subtlety.toFixed(2) },
          { label: "Objects", value: String(diff.objectCount) },
          { label: "Time limit", value: diff.timeLimit ? `${diff.timeLimit}s` : "relaxed" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="panel p-4">
          <p className="mb-3 text-center text-sm font-bold text-muted-foreground">
            Tap or double-tap any object on <span className="text-foreground font-extrabold">either</span> picture to circle differences!
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Panel items={scene.left} label="Left" />
            <Panel items={scene.right} label="Right" />
          </div>
        </div>

        <aside className="panel h-fit space-y-3 p-4">
          <Stat label="Found" value={`${found.length} / ${total}`} />
          <Stat label="Wrong taps" value={misses} />
          <Stat
            label={diff.timeLimit ? "Time left" : "Time"}
            value={`${diff.timeLimit ? Math.max(0, diff.timeLimit - elapsed).toFixed(0) : elapsed.toFixed(0)}s`}
          />
          {!result ? (
            <>
              <button
                onClick={hint}
                className="toy-press w-full rounded-full bg-warning px-4 py-3 font-display font-bold text-warning-foreground shadow-toy"
              >
                💡 Show one
              </button>
              <button
                onClick={() => finish(false, found.length)}
                className="w-full rounded-full border-2 border-border px-4 py-2 text-sm font-bold"
              >
                Finish round
              </button>
            </>
          ) : null}
        </aside>
      </div>

      {result ? (
        <RoundSummary
          result={result}
          onAgain={reset}
          confidence={recommendation(
            adjustmentFor(bandFor(ability), profile!.streaks.spot),
            ability,
          )}
        />
      ) : null}
    </>
  );
}
