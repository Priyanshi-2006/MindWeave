export type GameType = "maze" | "spot" | "simon" | "detective";

export const SKILLS = [
  "spatialReasoning",
  "visualAttention",
  "workingMemory",
  "logicalReasoning",
  "problemSolving",
  "reactionControl",
  "concentration",
] as const;

export type SkillKey = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<SkillKey, string> = {
  spatialReasoning: "Spatial Reasoning",
  visualAttention: "Visual Attention",
  workingMemory: "Working Memory",
  logicalReasoning: "Logical Reasoning",
  problemSolving: "Problem Solving",
  reactionControl: "Reaction Control",
  concentration: "Concentration",
};

export const GAME_LABELS: Record<GameType, string> = {
  maze: "Maze Escape",
  spot: "Spot the Difference",
  simon: "Simon Says",
  detective: "Mini Detective",
};

/** How much each game contributes to each cognitive skill. */
export const GAME_SKILL_WEIGHTS: Record<GameType, Partial<Record<SkillKey, number>>> = {
  maze: { spatialReasoning: 1, problemSolving: 0.8, concentration: 0.3 },
  spot: { visualAttention: 1, concentration: 0.8, reactionControl: 0.3 },
  simon: { workingMemory: 1, reactionControl: 0.8, concentration: 0.4 },
  detective: { logicalReasoning: 1, problemSolving: 0.6, concentration: 0.3 },
};

export type MazeDifficulty = {
  size: number;
  complexity: number; // 0..1 extra loops / dead ends
  timeLimit: number; // seconds, 0 = relaxed
  hintAvailability: boolean;
};

export type SpotDifficulty = {
  differenceCount: number;
  subtlety: number; // 0..1
  objectCount: number;
  timeLimit: number;
};

export type SimonDifficulty = {
  sequenceLength: number;
  speed: number; // 0..1 -> faster
  paletteSize: number;
  inputDelay: number; // ms pause before accepting input (impulse control support)
};

export type DetectiveDifficulty = {
  clueCount: number;
  suspectCount: number;
  irrelevantClues: number;
  reasoningSteps: number;
};

export type DifficultyMap = {
  maze: MazeDifficulty;
  spot: SpotDifficulty;
  simon: SimonDifficulty;
  detective: DetectiveDifficulty;
};

export type RoundMetrics = {
  accuracy: number; // 0..1
  timeTaken: number; // seconds
  expectedTime: number; // seconds considered "par"
  attempts: number;
  mistakes: number;
  hintsUsed: number;
  completed: boolean;
  reactionTime?: number; // avg seconds per action
  mistakeType?: string;
};

export type RoundResult = {
  id: string;
  gameType: GameType;
  timestamp: number;
  metrics: RoundMetrics;
  performance: number; // 0..100
  difficulty: Record<string, number | boolean>;
  band: Band;
  feedback: string;
  adjustment: Adjustment;
  notes: string[];
};

export type Band = "excelling" | "strong" | "optimal" | "struggling" | "overwhelmed";
export type Adjustment = "harder" | "same" | "scaffold" | "easier" | "much-easier";

/* ---------------- Bonus advanced challenge system ---------------- */

export type BonusGameType = "sudoku" | "advMaze" | "advMemory" | "logicGrid" | "pattern";

export const BONUS_LABELS: Record<BonusGameType, string> = {
  sudoku: "Sudoku",
  advMaze: "Advanced Maze",
  advMemory: "Advanced Memory",
  logicGrid: "Logic Grid Puzzle",
  pattern: "Advanced Pattern Puzzle",
};

export const BONUS_EMOJI: Record<BonusGameType, string> = {
  sudoku: "🧩",
  advMaze: "🗺️",
  advMemory: "🧠",
  logicGrid: "🔗",
  pattern: "🔢",
};

/** Which cognitive skill each advanced challenge primarily trains. */
export const BONUS_SKILL: Record<BonusGameType, SkillKey> = {
  sudoku: "problemSolving",
  advMaze: "spatialReasoning",
  advMemory: "workingMemory",
  logicGrid: "logicalReasoning",
  pattern: "visualAttention",
};

export type BonusDifficultyMap = {
  sudoku: { gridSize: 4 | 6 | 9; clueRatio: number; timeLimit: number; hints: boolean };
  advMaze: { size: number; obstacles: number; timeLimit: number; hints: boolean };
  advMemory: { sequenceLength: number; speed: number; paletteSize: number; reverse: boolean };
  logicGrid: { suspects: number; clues: number; redHerrings: number };
  pattern: { steps: number; complexity: number; options: number };
};

export type BonusResult = {
  id: string;
  game: BonusGameType;
  timestamp: number;
  performance: number;
  accuracy: number;
  timeTaken: number;
  hintsUsed: number;
  completed: boolean;
  level: number;
  xp: number;
  adjustment: Adjustment;
  notes: string[];
};

export type BonusOffer = {
  unlocked: boolean;
  game: BonusGameType;
  targetSkill: SkillKey;
  mode: "strength" | "growth";
  /** Explainable-AI bullet points shown to the parent. */
  reasons: string[];
  blockers: string[];
  dailyAverage: number;
  lowestGame: number;
  gamesCompleted: number;
  consistentSessions: number;
  estimatedMinutes: number;
};

export type ParentSettings = {
  dailyLimitMinutes: number;
  bonusEnabled: boolean;
};

export type BonusState = {
  level: number;
  xp: number;
  badges: string[];
  history: BonusResult[];
  difficulty: BonusDifficultyMap;
  /** yyyy-mm-dd of the day the child said "maybe later". */
  dismissedOn?: string;
};

export type DayUsage = { date: string; seconds: number };

export type ChildProfile = {
  name: string;
  age: number;
  /** Character id (e.g. "fox") or an uploaded image data URL. */
  avatar?: string;
  createdAt: number;
  assessmentDone: boolean;
  skills: Record<SkillKey, number>;
  difficulty: DifficultyMap;
  streaks: Record<GameType, number>;
  history: RoundResult[];
  patterns: string[];
  settings: ParentSettings;
  bonus: BonusState;
  usage: DayUsage[];
};

