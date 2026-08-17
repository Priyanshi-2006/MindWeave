import { useCallback, useEffect, useState } from "react";
import type { BonusDifficultyMap, BonusMetrics } from "@/lib/intelliplay/types";
import { cn } from "@/lib/utils";

type Props = {
  difficulty: BonusDifficultyMap["pattern"];
  onComplete: (metrics: BonusMetrics) => void;
};

type PatternQuestion = {
  sequence: string[];
  missingIndex: number;
  options: string[];
  answer: string;
  explanation: string;
};

function generatePatternQuestion(complexity: number, optionCount: number): PatternQuestion {
  const isNumberPattern = Math.random() > 0.4 || complexity < 0.3;

  if (isNumberPattern) {
    const start = Math.floor(Math.random() * 10) + 1;
    const step1 = Math.floor(Math.random() * 4) + 1;
    const step2 = complexity > 0.4 ? Math.floor(Math.random() * 3) + 1 : step1;

    const seq: number[] = [start];
    for (let i = 1; i < 5; i++) {
      const inc = i % 2 === 1 ? step1 : step2;
      seq.push(seq[i - 1]! + inc);
    }

    const missingIdx = 3;
    const answerVal = seq[missingIdx]!;
    const strSeq = seq.map((v, i) => (i === missingIdx ? "❓" : String(v)));

    const optsSet = new Set<number>([answerVal]);
    while (optsSet.size < optionCount) {
      const delta = (Math.floor(Math.random() * 5) - 2) * 2;
      const fake = answerVal + (delta === 0 ? 3 : delta);
      if (fake > 0) optsSet.add(fake);
    }

    const options = Array.from(optsSet)
      .sort(() => Math.random() - 0.5)
      .map(String);

    return {
      sequence: strSeq,
      missingIndex: missingIdx,
      options,
      answer: String(answerVal),
      explanation: `Pattern increases alternately by +${step1} and +${step2}`,
    };
  } else {
    // Emoji shape / color pattern
    const Palettes = [
      ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"],
      ["🔺", "🟦", "🟢", "⭐️", "💎", "🌸"],
      ["🐱", "🐶", "🦊", "🐻", "🦁", "🐯"],
      ["🍏", "🍌", "🍇", "🍓", "🍊", "🍍"],
    ];
    const pal = Palettes[Math.floor(Math.random() * Palettes.length)]!;
    const seqLength = 5;

    const patternLen = complexity > 0.5 ? 3 : 2;
    const seq: string[] = [];
    for (let i = 0; i < seqLength; i++) {
      seq.push(pal[i % patternLen]!);
    }

    const missingIdx = 3;
    const answerVal = seq[missingIdx]!;
    const strSeq = seq.map((v, i) => (i === missingIdx ? "❓" : v));

    const optsSet = new Set<string>([answerVal]);
    while (optsSet.size < optionCount) {
      const fake = pal[Math.floor(Math.random() * pal.length)]!;
      optsSet.add(fake);
    }

    const options = Array.from(optsSet).sort(() => Math.random() - 0.5);

    return {
      sequence: strSeq,
      missingIndex: missingIdx,
      options,
      answer: answerVal,
      explanation: `Pattern repeats every ${patternLen} symbols`,
    };
  }
}

export function PatternGame({ difficulty, onComplete }: Props) {
  const { steps, complexity, options: optionCount } = difficulty;
  const totalQuestions = 4;

  const [currentStep, setCurrentStep] = useState(0);
  const [question, setQuestion] = useState<PatternQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [finished, setFinished] = useState(false);

  const nextQuestion = useCallback(() => {
    setSelectedOption(null);
    setQuestion(generatePatternQuestion(complexity, optionCount));
  }, [complexity, optionCount]);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimeTaken((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  if (!question) return null;

  const handleSelect = (opt: string) => {
    if (selectedOption !== null || finished) return;

    setSelectedOption(opt);
    const isCorrect = opt === question.answer;
    if (isCorrect) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      if (currentStep + 1 < totalQuestions) {
        setCurrentStep((s) => s + 1);
        nextQuestion();
      } else {
        setFinished(true);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const accuracy = finalCorrect / totalQuestions;
        const expectedTime = totalQuestions * 12;

        onComplete({
          accuracy,
          timeTaken,
          expectedTime,
          hintsUsed,
          completed: true,
        });
      }
    }, 1200);
  };

  const useHint = () => {
    if (hintsUsed > 0 || finished || selectedOption !== null) return;
    setHintsUsed((h) => h + 1);
    // Highlight answer
  };

  return (
    <div className="panel animate-pop flex flex-col items-center p-6 text-center">
      <div className="w-full max-w-md flex items-center justify-between">
        <div>
          <span className="font-display text-xl font-bold">🔢 Advanced Pattern Puzzle</span>
          <p className="text-xs font-semibold text-muted-foreground">
            Question {currentStep + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={useHint}
            disabled={hintsUsed > 0}
            className="toy-press rounded-full border-2 border-border bg-secondary px-3 py-1 text-xs font-bold"
          >
            💡 Hint ({hintsUsed})
          </button>
          <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full">
            Time: {timeTaken}s
          </span>
        </div>
      </div>

      <h3 className="mt-6 font-display text-lg font-bold">What completes the pattern?</h3>

      {/* Pattern Sequence */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {question.sequence.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "toy-press flex size-14 sm:size-16 items-center justify-center rounded-2xl border-4 font-display text-2xl sm:text-3xl font-bold shadow-soft",
              item === "❓"
                ? "border-primary bg-primary/10 text-primary animate-pulse"
                : "border-border bg-card text-foreground"
            )}
          >
            {item}
          </div>
        ))}
      </div>

      {hintsUsed > 0 ? (
        <p className="mt-4 text-xs font-bold text-accent">
          💡 {question.explanation}
        </p>
      ) : null}

      {/* Options */}
      <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-md">
        {question.options.map((opt) => {
          const isSel = selectedOption === opt;
          const isCorrect = opt === question.answer;

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={selectedOption !== null || finished}
              className={cn(
                "toy-press flex min-w-16 h-16 items-center justify-center px-5 rounded-2xl border-2 font-display text-2xl font-bold shadow-soft transition-all",
                selectedOption === null
                  ? "border-border bg-card hover:border-primary"
                  : isSel
                  ? isCorrect
                    ? "border-success bg-success/20 text-success"
                    : "border-destructive bg-destructive/20 text-destructive"
                  : isCorrect
                  ? "border-success bg-success/15 text-success"
                  : "border-border bg-card opacity-50"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
