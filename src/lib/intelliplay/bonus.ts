import { clamp } from "./engine";
import {
  BONUS_LABELS,
  BONUS_SKILL,
  type Adjustment,
  type BonusDifficultyMap,
  type BonusGameType,
  type BonusOffer,
  type BonusResult,
  type BonusState,
  type ChildProfile,
  type GameType,
  type ParentSettings,
  type RoundResult,
  type SkillKey,
} from "./types";

export const MAIN_GAMES: GameType[] = ["maze", "spot", "simon", "detective"];

export const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export function defaultSettings(): ParentSettings {
  return { dailyLimitMinutes: 30, bonusEnabled: true };
}

export function defaultBonusDifficulty(): BonusDifficultyMap {
  return {
    sudoku: { gridSize: 4, clueRatio: 0.6, timeLimit: 0, hints: true },
    advMaze: { size: 9, obstacles: 4, timeLimit: 0, hints: true },
    advMemory: { sequenceLength: 5, speed: 0.5, paletteSize: 5, reverse: false },
    logicGrid: { suspects: 3, clues: 4, redHerrings: 1 },
    pattern: { steps: 5, complexity: 0.3, options: 3 },
  };
}

export function defaultBonusState(): BonusState {
  return { level: 1, xp: 0, badges: [], history: [], difficulty: defaultBonusDifficulty() };
}

/* ---------------- Daily usage & parent limits ---------------- */

export function secondsToday(profile: ChildProfile, date = todayKey()) {
  return profile.usage.find((u) => u.date === date)?.seconds ?? 0;
}

export function minutesRemaining(profile: ChildProfile) {
  const used = secondsToday(profile) / 60;
  return Math.max(0, Math.round(profile.settings.dailyLimitMinutes - used));
}

export function addUsage(profile: ChildProfile, seconds: number): ChildProfile["usage"] {
  const date = todayKey();
  const rest = profile.usage.filter((u) => u.date !== date);
  return [...rest, { date, seconds: secondsToday(profile, date) + Math.max(0, seconds) }].slice(-60);
}

/* ---------------- Eligibility ---------------- */

const roundsOn = (history: RoundResult[], date: string) =>
  history.filter((r) => todayKey(new Date(r.timestamp)) === date);

/** Average accuracy per game today (0..100). */
function dailyGameScores(history: RoundResult[], date: string) {
  const today = roundsOn(history, date);
  const out: Partial<Record<GameType, number>> = {};
  for (const g of MAIN_GAMES) {
    const rounds = today.filter((r) => r.gameType === g);
    if (rounds.length)
      out[g] = Math.round(
        (rounds.reduce((a, r) => a + r.metrics.accuracy, 0) / rounds.length) * 100,
      );
  }
  return out;
}

/** How many of the recent sessions were strong (avg accuracy ≥ 80%). */
function consistentSessions(history: RoundResult[]) {
  const byDay = new Map<string, number[]>();
  for (const r of history) {
    const d = todayKey(new Date(r.timestamp));
    byDay.set(d, [...(byDay.get(d) ?? []), r.metrics.accuracy * 100]);
  }
  const days = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-3);
  let streak = 0;
  for (const [, scores] of days) {
    if (scores.reduce((a, b) => a + b, 0) / scores.length >= 80) streak += 1;
    else streak = 0;
  }
  return streak;
}

/** Pick the personalised advanced challenge from the cognitive profile. */
export function selectChallenge(
  skills: Record<SkillKey, number>,
  bonus: BonusState,
): { game: BonusGameType; targetSkill: SkillKey; mode: "strength" | "growth" } {
  const games = Object.keys(BONUS_SKILL) as BonusGameType[];
  const ranked = games
    .map((g) => ({ g, skill: BONUS_SKILL[g], value: skills[BONUS_SKILL[g]] }))
    .sort((a, b) => a.value - b.value);
  // Alternate: mostly train the weakest area, every third bonus celebrate a strength.
  const mode: "strength" | "growth" = bonus.history.length % 3 === 2 ? "strength" : "growth";
  const pick = mode === "growth" ? ranked[0]! : ranked[ranked.length - 1]!;
  return { game: pick.g, targetSkill: pick.skill, mode };
}

export const BONUS_MINUTES: Record<BonusGameType, number> = {
  sudoku: 6,
  advMaze: 5,
  advMemory: 4,
  logicGrid: 5,
  pattern: 4,
};

export function evaluateBonus(profile: ChildProfile, date = todayKey()): BonusOffer {
  const scores = dailyGameScores(profile.history, date);
  const played = MAIN_GAMES.filter((g) => scores[g] !== undefined);
  const values = played.map((g) => scores[g]!);
  const dailyAverage = values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
  const lowestGame = values.length ? Math.min(...values) : 0;
  const streak = consistentSessions(profile.history);
  const { game, targetSkill, mode } = selectChallenge(profile.skills, profile.bonus);

  const reasons: string[] = [];
  const blockers: string[] = [];

  if (played.length === MAIN_GAMES.length) reasons.push("All four games completed today");
  else
    blockers.push(
      `${String(MAIN_GAMES.length - played.length)} of 4 games still to play today`,
    );

  if (dailyAverage >= 85) reasons.push(`Daily average accuracy: ${String(dailyAverage)}%`);
  else if (played.length) blockers.push(`Daily average accuracy is ${String(dailyAverage)}% (needs 85%)`);

  if (played.length && lowestGame >= 70)
    reasons.push(`No game below 70% (lowest was ${String(lowestGame)}%)`);
  else if (played.length) blockers.push(`Lowest game today was ${String(lowestGame)}% (needs 70%)`);

  if (streak >= 2) reasons.push(`Strong performance for ${String(streak)} consecutive sessions`);
  else if (profile.bonus.history.length === 0 && dailyAverage >= 90)
    reasons.push("Exceptional first-day consistency across every game");
  else if (streak < 2) blockers.push("Recent sessions not consistently strong yet");

  const remaining = minutesRemaining(profile);
  const estimatedMinutes = BONUS_MINUTES[game];
  if (!profile.settings.bonusEnabled) blockers.push("Bonus challenges are switched off by a parent");
  if (remaining < estimatedMinutes)
    blockers.push(
      `Only ${String(remaining)} min of the ${String(profile.settings.dailyLimitMinutes)} min daily limit left (challenge needs ${String(estimatedMinutes)})`,
    );

  const unlocked = blockers.length === 0;
  if (unlocked) reasons.push(`Recommended challenge: ${BONUS_LABELS[game]}`);

  return {
    unlocked,
    game,
    targetSkill,
    mode,
    reasons,
    blockers,
    dailyAverage,
    lowestGame,
    gamesCompleted: played.length,
    consistentSessions: streak,
    estimatedMinutes,
  };
}

/* ---------------- Advanced adaptive difficulty ---------------- */

export function adaptBonusDifficulty(
  diff: BonusDifficultyMap,
  game: BonusGameType,
  adjustment: Adjustment,
): { difficulty: BonusDifficultyMap; notes: string[] } {
  const d: BonusDifficultyMap = JSON.parse(JSON.stringify(diff)) as BonusDifficultyMap;
  const notes: string[] = [];
  const up = adjustment === "harder";
  const down = adjustment === "easier" || adjustment === "much-easier";

  if (game === "sudoku") {
    const s = d.sudoku;
    if (up) {
      if (s.clueRatio > 0.45) {
        s.clueRatio = Math.round((s.clueRatio - 0.08) * 100) / 100;
        notes.push(`Fewer starting numbers (${String(Math.round(s.clueRatio * 100))}% filled).`);
      } else {
        s.gridSize = s.gridSize === 4 ? 6 : 9;
        s.clueRatio = 0.58;
        notes.push(`Grid grew to ${String(s.gridSize)}×${String(s.gridSize)}.`);
      }
      if (s.gridSize >= 6) s.hints = false;
      if (s.gridSize === 9) s.timeLimit = 420;
    } else if (down) {
      s.hints = true;
      if (s.clueRatio < 0.66) {
        s.clueRatio = Math.round((s.clueRatio + 0.1) * 100) / 100;
        notes.push("More starting numbers given as support.");
      } else if (s.gridSize > 4) {
        s.gridSize = s.gridSize === 9 ? 6 : 4;
        notes.push(`Grid eased to ${String(s.gridSize)}×${String(s.gridSize)}.`);
      }
      s.timeLimit = 0;
    } else {
      notes.push("Same grid size with a brand new puzzle.");
    }
  }

  if (game === "advMaze") {
    const m = d.advMaze;
    if (up) {
      if (m.obstacles < 8) {
        m.obstacles += 2;
        notes.push(`More obstacles to route around (${String(m.obstacles)}).`);
      } else {
        m.size = clamp(m.size + 2, 9, 19);
        m.obstacles = 4;
        notes.push(`Maze grew to ${String(m.size)}×${String(m.size)}.`);
      }
      if (m.size >= 13) m.hints = false;
    } else if (down) {
      m.hints = true;
      m.obstacles = Math.max(0, m.obstacles - 2);
      m.size = clamp(m.size - 2, 7, 19);
      notes.push(`Maze eased to ${String(m.size)}×${String(m.size)} with fewer obstacles.`);
    } else {
      notes.push("Same maze size, fresh layout.");
    }
  }

  if (game === "advMemory") {
    const s = d.advMemory;
    if (up) {
      if (s.sequenceLength >= 8 && !s.reverse) {
        s.reverse = true;
        notes.push("New rule: repeat the sequence backwards.");
      } else {
        s.sequenceLength = clamp(s.sequenceLength + 1, 4, 14);
        s.speed = Math.round(clamp(s.speed + 0.08, 0, 1) * 100) / 100;
        notes.push(`Sequence grew to ${String(s.sequenceLength)} and sped up.`);
      }
      if (s.sequenceLength >= 7) s.paletteSize = 6;
    } else if (down) {
      s.reverse = false;
      s.sequenceLength = clamp(s.sequenceLength - 1, 4, 14);
      s.speed = Math.round(clamp(s.speed - 0.15, 0, 1) * 100) / 100;
      notes.push("Sequence shortened and slowed down.");
    } else {
      notes.push("Same memory load with a new sequence.");
    }
  }

  if (game === "logicGrid") {
    const g = d.logicGrid;
    if (up) {
      if (g.suspects < 5) {
        g.suspects += 1;
        g.clues += 1;
        notes.push(`Now ${String(g.suspects)} suspects and ${String(g.clues)} clues.`);
      } else {
        g.redHerrings = Math.min(4, g.redHerrings + 1);
        notes.push("An extra misleading clue added.");
      }
    } else if (down) {
      g.redHerrings = Math.max(0, g.redHerrings - 1);
      g.suspects = Math.max(3, g.suspects - 1);
      g.clues = Math.max(3, g.clues - 1);
      notes.push("Smaller case with fewer distractions.");
    } else {
      notes.push("Same case size, new mystery.");
    }
  }

  if (game === "pattern") {
    const p = d.pattern;
    if (up) {
      p.complexity = Math.round(clamp(p.complexity + 0.15, 0, 1) * 100) / 100;
      if (p.complexity > 0.6) p.options = Math.min(5, p.options + 1);
      notes.push("Patterns now combine more than one rule.");
    } else if (down) {
      p.complexity = Math.round(clamp(p.complexity - 0.15, 0, 1) * 100) / 100;
      p.options = 3;
      notes.push("Simpler, single-rule patterns.");
    } else {
      notes.push("Same rule family with new sequences.");
    }
  }

  return { difficulty: d, notes };
}

/* ---------------- Rewards ---------------- */

export const BADGES: { id: string; label: string; test: (b: BonusState) => boolean }[] = [
  { id: "first-boost", label: "🌟 First Brain Boost", test: (b) => b.history.length >= 1 },
  { id: "explorer", label: "🧭 Challenge Explorer", test: (b) => new Set(b.history.map((r) => r.game)).size >= 3 },
  { id: "persistent", label: "💪 Never Gives Up", test: (b) => b.history.filter((r) => !r.completed).length >= 1 && b.history.length >= 3 },
  { id: "improver", label: "📈 Big Improver", test: (b) => b.history.length >= 2 && b.history[b.history.length - 1]!.performance > b.history[b.history.length - 2]!.performance + 8 },
  { id: "level-3", label: "🏅 Advanced Level 3", test: (b) => b.level >= 3 },
  { id: "level-5", label: "👑 Advanced Level 5", test: (b) => b.level >= 5 },
  { id: "marathon", label: "🎯 Ten Boosts", test: (b) => b.history.length >= 10 },
];

export type BonusMetrics = {
  accuracy: number;
  timeTaken: number;
  expectedTime: number;
  hintsUsed: number;
  completed: boolean;
};

export function processBonusRound(
  profile: ChildProfile,
  game: BonusGameType,
  m: BonusMetrics,
): { profile: ChildProfile; result: BonusResult } {
  const speed = clamp(1 - (m.timeTaken - m.expectedTime * 0.6) / (m.expectedTime * 1.6), 0, 1);
  const independence = clamp(1 - m.hintsUsed * 0.2, 0, 1);
  const raw = 62 * clamp(m.accuracy, 0, 1) + 20 * speed + 18 * independence;
  const performance = Math.round(clamp(m.completed ? raw : raw * 0.85, 0, 100));

  const adjustment: Adjustment =
    performance >= 85 ? "harder" : performance >= 65 ? "same" : performance >= 45 ? "scaffold" : "easier";
  const { difficulty, notes } = adaptBonusDifficulty(profile.bonus.difficulty, game, adjustment);

  // Reward effort as well as accuracy.
  const xp = Math.round(30 + performance * 0.7 + (m.completed ? 20 : 0));
  const totalXp = profile.bonus.xp + xp;
  const level = clamp(Math.floor(totalXp / 250) + 1, 1, 12);

  const result: BonusResult = {
    id: `${String(Date.now())}-${Math.random().toString(36).slice(2, 7)}`,
    game,
    timestamp: Date.now(),
    performance,
    accuracy: m.accuracy,
    timeTaken: m.timeTaken,
    hintsUsed: m.hintsUsed,
    completed: m.completed,
    level: profile.bonus.level,
    xp,
    adjustment,
    notes,
  };

  const nextBonus: BonusState = {
    ...profile.bonus,
    xp: totalXp,
    level,
    difficulty,
    history: [...profile.bonus.history, result].slice(-60),
  };
  nextBonus.badges = [
    ...new Set([
      ...profile.bonus.badges,
      ...BADGES.filter((b) => b.test(nextBonus)).map((b) => b.id),
    ]),
  ];

  // Bonus performance also feeds the cognitive profile.
  const skillKey = BONUS_SKILL[game];
  const skills = {
    ...profile.skills,
    [skillKey]: Math.round(clamp(profile.skills[skillKey] * 0.78 + performance * 0.22, 0, 100)),
  };

  return {
    profile: { ...profile, skills, bonus: nextBonus, usage: addUsage(profile, m.timeTaken) },
    result,
  };
}
