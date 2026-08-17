import { useCallback, useEffect, useState } from "react";
import type { BonusDifficultyMap, BonusMetrics } from "@/lib/intelliplay/types";
import { cn } from "@/lib/utils";

type Props = {
  difficulty: BonusDifficultyMap["logicGrid"];
  onComplete: (metrics: BonusMetrics) => void;
};

const SUSPECT_NAMES = ["Detective Leo", "Maya", "Sam", "Jordan", "Robin"];
const PETS = ["🐱 Cat", "🐶 Dog", "🦜 Parrot", "🐰 Rabbit", "🐢 Turtle"];
const COLORS = ["🔴 Red Badge", "🔵 Blue Badge", "🟢 Green Badge", "🟡 Yellow Badge", "🟣 Purple Badge"];

type MysteryCase = {
  suspects: string[];
  solution: { suspect: string; pet: string; color: string }[];
  clues: { id: string; text: string; isRedHerring?: boolean }[];
};

function generateCase(suspectCount: number, clueCount: number, redHerringCount: number): MysteryCase {
  const suspects = SUSPECT_NAMES.slice(0, suspectCount);
  const pets = [...PETS.slice(0, suspectCount)].sort(() => Math.random() - 0.5);
  const colors = [...COLORS.slice(0, suspectCount)].sort(() => Math.random() - 0.5);

  const solution = suspects.map((s, i) => ({
    suspect: s,
    pet: pets[i]!,
    color: colors[i]!,
  }));

  const clues: { id: string; text: string; isRedHerring?: boolean }[] = [];

  // Generate direct and relational true clues
  for (let i = 0; i < solution.length; i++) {
    const s = solution[i]!;
    clues.push({
      id: `c-direct-${i}`,
      text: `${s.suspect} has the ${s.pet}.`,
    });
    clues.push({
      id: `c-rel-${i}`,
      text: `The person with the ${s.pet} wears the ${s.color}.`,
    });
  }

  // Pick required clueCount
  clues.sort(() => Math.random() - 0.5);
  const selectedClues = clues.slice(0, Math.max(clueCount, suspectCount * 2));

  // Add Red Herrings (extra noise clues)
  for (let i = 0; i < redHerringCount; i++) {
    const s1 = suspects[i % suspectCount]!;
    const otherPet = pets[(i + 1) % suspectCount]!;
    if (solution.find((s) => s.suspect === s1)?.pet !== otherPet) {
      selectedClues.push({
        id: `c-rh-${i}`,
        text: `Rumor: ${s1} was seen near the ${otherPet}, but doesn't own it.`,
        isRedHerring: true,
      });
    }
  }

  return { suspects, solution, clues: selectedClues };
}

export function LogicGridGame({ difficulty, onComplete }: Props) {
  const { suspects: suspectCount, clues: clueCount, redHerrings } = difficulty;

  const [caseData, setCaseData] = useState<MysteryCase | null>(null);
  const [userPets, setUserPets] = useState<Record<string, string>>({});
  const [userColors, setUserColors] = useState<Record<string, string>>({});

  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [finished, setFinished] = useState(false);

  const initGame = useCallback(() => {
    const newCase = generateCase(suspectCount, clueCount, redHerrings);
    setCaseData(newCase);
    setUserPets({});
    setUserColors({});
    setHintsUsed(0);
    setTimeTaken(0);
    setFinished(false);
  }, [suspectCount, clueCount, redHerrings]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimeTaken((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  if (!caseData) return null;

  const availablePets = PETS.slice(0, suspectCount);
  const availableColors = COLORS.slice(0, suspectCount);

  const useHint = () => {
    if (finished) return;
    // Find unassigned or wrong suspect
    for (const sol of caseData.solution) {
      if (userPets[sol.suspect] !== sol.pet) {
        setUserPets((p) => ({ ...p, [sol.suspect]: sol.pet }));
        setHintsUsed((h) => h + 1);
        return;
      }
      if (userColors[sol.suspect] !== sol.color) {
        setUserColors((c) => ({ ...c, [sol.suspect]: sol.color }));
        setHintsUsed((h) => h + 1);
        return;
      }
    }
  };

  const handleSolve = () => {
    let correct = 0;
    const total = suspectCount * 2;

    for (const sol of caseData.solution) {
      if (userPets[sol.suspect] === sol.pet) correct++;
      if (userColors[sol.suspect] === sol.color) correct++;
    }

    const accuracy = correct / total;
    setFinished(true);

    const expectedTime = suspectCount * 20;
    onComplete({
      accuracy,
      timeTaken,
      expectedTime,
      hintsUsed,
      completed: true,
    });
  };

  return (
    <div className="panel animate-pop flex flex-col items-center p-6">
      <div className="w-full max-w-xl flex items-center justify-between">
        <div>
          <span className="font-display text-xl font-bold">🔗 Logic Grid Puzzle</span>
          <p className="text-xs font-semibold text-muted-foreground">
            Suspects: {suspectCount} | Clues: {caseData.clues.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={useHint}
            className="toy-press rounded-full border-2 border-border bg-secondary px-3 py-1 text-xs font-bold"
          >
            💡 Hint ({hintsUsed})
          </button>
          <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full">
            Time: {timeTaken}s
          </span>
        </div>
      </div>

      {/* Clues Card */}
      <div className="mt-4 w-full max-w-xl rounded-2xl bg-card border-2 border-border p-4 shadow-soft">
        <h3 className="font-display text-base font-bold text-primary">📜 Case Clues:</h3>
        <ul className="mt-2 space-y-1.5 text-sm font-medium">
          {caseData.clues.map((c) => (
            <li key={c.id} className="rounded-lg bg-muted/60 px-3 py-1.5 flex items-center gap-2">
              <span>🔍</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Matching Matrix */}
      <div className="mt-6 w-full max-w-xl space-y-4">
        <h3 className="font-display text-lg font-bold text-center">Solve the Mystery: Match each suspect</h3>

        {caseData.suspects.map((suspect) => (
          <div
            key={suspect}
            className="panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30"
          >
            <span className="font-display text-lg font-bold min-w-32">{suspect}</span>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={userPets[suspect] ?? ""}
                onChange={(e) => setUserPets((p) => ({ ...p, [suspect]: e.target.value }))}
                className="rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-bold outline-none focus:border-primary flex-1"
              >
                <option value="">Select Pet...</option>
                {availablePets.map((pet) => (
                  <option key={pet} value={pet}>
                    {pet}
                  </option>
                ))}
              </select>

              <select
                value={userColors[suspect] ?? ""}
                onChange={(e) => setUserColors((c) => ({ ...c, [suspect]: e.target.value }))}
                className="rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-bold outline-none focus:border-primary flex-1"
              >
                <option value="">Select Badge...</option>
                {availableColors.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSolve}
        disabled={finished}
        className="toy-press mt-6 rounded-full bg-primary px-8 py-3 font-display text-lg font-bold text-primary-foreground shadow-toy"
      >
        🔎 Solve Case
      </button>
    </div>
  );
}
