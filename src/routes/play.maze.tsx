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
  crossGameNote,
  recommendation,
  rollingAbility,
  adjustmentFor,
  bandFor,
} from "@/lib/intelliplay/engine";
import { useProfile } from "@/lib/intelliplay/store";
import type { MazeDifficulty, RoundResult } from "@/lib/intelliplay/types";

export const Route = createFileRoute("/play/maze")({
  head: () => ({
    meta: [
      { title: "Maze Escape — IntelliPlay Adaptive Games" },
      {
        name: "description",
        content:
          "An adaptive maze that grows or shrinks with your child's spatial reasoning and planning skills.",
      },
      { property: "og:title", content: "Maze Escape — IntelliPlay" },
      {
        property: "og:description",
        content: "Adaptive spatial reasoning and planning practice for children.",
      },
    ],
  }),
  component: MazePage,
});

type Cell = { n: boolean; e: boolean; s: boolean; w: boolean };

function buildMaze(size: number, complexity: number) {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ n: true, e: true, s: true, w: true })),
  );
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const stack: [number, number][] = [[0, 0]];
  visited[0]![0] = true;

  while (stack.length) {
    const [r, c] = stack[stack.length - 1]!;
    const neighbours: [number, number, keyof Cell, keyof Cell][] = [
      [r - 1, c, "n", "s"],
      [r, c + 1, "e", "w"],
      [r + 1, c, "s", "n"],
      [r, c - 1, "w", "e"],
    ].filter(
      ([nr, nc]) =>
        (nr as number) >= 0 &&
        (nr as number) < size &&
        (nc as number) >= 0 &&
        (nc as number) < size &&
        !visited[nr as number]![nc as number],
    ) as [number, number, keyof Cell, keyof Cell][];

    if (!neighbours.length) {
      stack.pop();
      continue;
    }
    const [nr, nc, wall, opposite] = neighbours[Math.floor(Math.random() * neighbours.length)]!;
    grid[r]![c]![wall] = false;
    grid[nr]![nc]![opposite] = false;
    visited[nr]![nc] = true;
    stack.push([nr, nc]);
  }

  // extra loops => more possible routes
  const extra = Math.floor(complexity * size * size * 0.25);
  for (let i = 0; i < extra; i++) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (c < size - 1) {
      grid[r]![c]!.e = false;
      grid[r]![c + 1]!.w = false;
    }
  }
  return grid;
}

function shortestPath(grid: Cell[][], size: number) {
  const key = (r: number, c: number) => r * size + c;
  const prev = new Map<number, number>();
  const queue: [number, number][] = [[0, 0]];
  const seen = new Set([key(0, 0)]);
  while (queue.length) {
    const [r, c] = queue.shift()!;
    if (r === size - 1 && c === size - 1) break;
    const cell = grid[r]![c]!;
    const steps: [number, number][] = [];
    if (!cell.n) steps.push([r - 1, c]);
    if (!cell.s) steps.push([r + 1, c]);
    if (!cell.e) steps.push([r, c + 1]);
    if (!cell.w) steps.push([r, c - 1]);
    for (const [nr, nc] of steps) {
      if (nr < 0 || nc < 0 || nr >= size || nc >= size || seen.has(key(nr, nc))) continue;
      seen.add(key(nr, nc));
      prev.set(key(nr, nc), key(r, c));
      queue.push([nr, nc]);
    }
  }
  const path: number[] = [];
  let cur = key(size - 1, size - 1);
  while (cur !== key(0, 0)) {
    path.push(cur);
    const p = prev.get(cur);
    if (p === undefined) return [key(0, 0)];
    cur = p;
  }
  path.push(key(0, 0));
  return path.reverse();
}

function MazePage() {
  const { profile } = useProfile();
  if (!profile)
    return (
      <AppShell>
        <NeedsProfile />
      </AppShell>
    );
  return (
    <AppShell>
      <MazeGame />
    </AppShell>
  );
}

function MazeGame() {
  const { profile, submitRound } = useProfile();
  const [diff, setDiff] = useState<MazeDifficulty>(profile!.difficulty.maze);
  const size = diff.size;

  const [seed, setSeed] = useState(0);
  const grid = useMemo(() => buildMaze(size, diff.complexity), [size, diff.complexity, seed]);
  const optimal = useMemo(() => shortestPath(grid, size), [grid, size]);
  const optimalSet = useMemo(() => new Set(optimal), [optimal]);

  const [pos, setPos] = useState(0);
  const [moves, setMoves] = useState(0);
  const [wrongTurns, setWrongTurns] = useState(0);
  const [backtracks, setBacktracks] = useState(0);
  const [hints, setHints] = useState(0);
  const [hintCells, setHintCells] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const visitedRef = useRef(new Set([0]));
  const startRef = useRef(Date.now());

  const finish = useCallback(
    (completed: boolean) => {
      if (result) return;
      const time = (Date.now() - startRef.current) / 1000;
      const actual = Math.max(1, moves);
      const efficiency = Math.min(1, (optimal.length - 1) / actual);
      const res = submitRound(
        "maze",
        {
          accuracy: completed ? Math.max(0.35, efficiency) : efficiency * 0.4,
          timeTaken: time,
          expectedTime: (optimal.length - 1) * 1.6 + 8,
          attempts: 1,
          mistakes: wrongTurns,
          hintsUsed: hints,
          completed,
          reactionTime: time / actual,
          mistakeType: wrongTurns > optimal.length ? "wandering" : "dead-end",
        },
        {
          wanders: wrongTurns > (optimal.length - 1) * 0.8,
          timePressureLoss: diff.timeLimit > 0 && !completed,
          slowButAccurate: efficiency > 0.8 && time > (optimal.length - 1) * 2.5,
        },
      );
      setResult(res);
      setElapsed(time);
    },
    [result, moves, optimal.length, submitRound, wrongTurns, hints, diff.timeLimit],
  );

  useEffect(() => {
    if (result) return;
    const id = window.setInterval(() => {
      const t = (Date.now() - startRef.current) / 1000;
      setElapsed(t);
      if (diff.timeLimit > 0 && t > diff.timeLimit) finish(false);
    }, 200);
    return () => window.clearInterval(id);
  }, [diff.timeLimit, finish, result]);

  const move = useCallback(
    (dir: "n" | "e" | "s" | "w") => {
      if (result) return;
      const r = Math.floor(pos / size);
      const c = pos % size;
      if (grid[r]![c]![dir]) return;
      const nr = dir === "n" ? r - 1 : dir === "s" ? r + 1 : r;
      const nc = dir === "e" ? c + 1 : dir === "w" ? c - 1 : c;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) return;

      const next = nr * size + nc;
      if (next === pos) return;

      setPos(next);
      setMoves((m) => m + 1);
      if (visitedRef.current.has(next)) setBacktracks((b) => b + 1);
      else visitedRef.current.add(next);
      if (!optimalSet.has(next)) setWrongTurns((w) => w + 1);
      setHintCells([]);

      if (next === size * size - 1) {
        finish(true);
      }
    },
    [grid, optimalSet, result, size, pos, finish],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, "n" | "e" | "s" | "w"> = {
        ArrowUp: "n",
        ArrowRight: "e",
        ArrowDown: "s",
        ArrowLeft: "w",
        w: "n",
        d: "e",
        s: "s",
        a: "w",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const showHint = () => {
    const idx = optimal.indexOf(pos);
    setHintCells(idx >= 0 ? optimal.slice(idx + 1, idx + 4) : optimal.slice(0, 3));
    setHints((h) => h + 1);
  };

  const reset = () => {
    setDiff(profile!.difficulty.maze);
    setSeed((s) => s + 1);
    setPos(0);
    setMoves(0);
    setWrongTurns(0);
    setBacktracks(0);
    setHints(0);
    setHintCells([]);
    setResult(null);
    visitedRef.current = new Set([0]);
    startRef.current = Date.now();
    setElapsed(0);
  };

  const ability = rollingAbility(profile!.history, "maze", result?.performance ?? 60);

  return (
    <>
      <GameHeader
        title="Maze Escape"
        emoji="🧭"
        skills="spatial reasoning, planning and problem solving"
        note={crossGameNote("maze", profile!.skills)}
        params={[
          { label: "Grid", value: `${size}×${size}` },
          { label: "Complexity", value: diff.complexity.toFixed(2) },
          { label: "Time limit", value: diff.timeLimit ? `${diff.timeLimit}s` : "relaxed" },
          { label: "Hints", value: diff.hintAvailability ? "on" : "off" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="panel p-4">
          <div
            className="mx-auto grid aspect-square w-full max-w-lg overflow-hidden rounded-xl bg-muted/40"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}
          >
            {Array.from({ length: size * size }, (_, i) => {
              const r = Math.floor(i / size);
              const c = i % size;
              const cell = grid[r]![c]!;
              const isGoal = i === size * size - 1;
              return (
                <div
                  key={i}
                  className="relative grid place-items-center"
                  style={{
                    borderTop: cell.n ? "3px solid var(--foreground)" : "3px solid transparent",
                    borderRight: cell.e ? "3px solid var(--foreground)" : "3px solid transparent",
                    borderBottom: cell.s ? "3px solid var(--foreground)" : "3px solid transparent",
                    borderLeft: cell.w ? "3px solid var(--foreground)" : "3px solid transparent",
                    backgroundColor: hintCells.includes(i) ? "var(--warning)" : undefined,
                  }}
                >
                  {i === pos ? (
                    <span className="text-[min(4vw,1.6rem)] leading-none">🐣</span>
                  ) : isGoal ? (
                    <span className="text-[min(4vw,1.6rem)] leading-none">🏡</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-center gap-1">
            <button
              onClick={() => move("n")}
              className="toy-press size-12 rounded-xl bg-primary text-xl text-primary-foreground shadow-toy"
            >
              ▲
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => move("w")}
                className="toy-press size-12 rounded-xl bg-primary text-xl text-primary-foreground shadow-toy"
              >
                ◀
              </button>
              <button
                onClick={() => move("s")}
                className="toy-press size-12 rounded-xl bg-primary text-xl text-primary-foreground shadow-toy"
              >
                ▼
              </button>
              <button
                onClick={() => move("e")}
                className="toy-press size-12 rounded-xl bg-primary text-xl text-primary-foreground shadow-toy"
              >
                ▶
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Use arrow keys or the buttons</p>
          </div>
        </div>

        <aside className="panel h-fit space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Moves" value={moves} />
            <Stat label="Best route" value={optimal.length - 1} />
            <Stat label="Wrong turns" value={wrongTurns} />
            <Stat label="Backtracks" value={backtracks} />
          </div>
          <Stat
            label={diff.timeLimit ? "Time left" : "Time"}
            value={`${diff.timeLimit ? Math.max(0, diff.timeLimit - elapsed).toFixed(0) : elapsed.toFixed(0)}s`}
          />
          {diff.hintAvailability && !result ? (
            <button
              onClick={showHint}
              className="toy-press w-full rounded-full bg-warning px-4 py-3 font-display font-bold text-warning-foreground shadow-toy"
            >
              💡 Show a hint
            </button>
          ) : null}
          {!result ? (
            <button
              onClick={() => finish(false)}
              className="w-full rounded-full border-2 border-border px-4 py-2 text-sm font-bold"
            >
              Give up this round
            </button>
          ) : null}
        </aside>
      </div>

      {result ? (
        <RoundSummary
          result={result}
          onAgain={reset}
          confidence={recommendation(
            adjustmentFor(bandFor(ability), profile!.streaks.maze),
            ability,
          )}
        />
      ) : null}
    </>
  );
}
