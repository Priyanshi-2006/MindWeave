import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, NeedsProfile, SkillBar, Stat } from "@/components/intelliplay/shell";
import { useProfile } from "@/lib/intelliplay/store";
import { BONUS_LABELS, GAME_LABELS, SKILLS, SKILL_LABELS, type GameType } from "@/lib/intelliplay/types";
import { BADGES, evaluateBonus } from "@/lib/intelliplay/bonus";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Progress Dashboard — MindWeave" },
      {
        name: "description",
        content:
          "Parent and teacher view of cognitive growth: skill scores, strengths, areas to support and session-by-session progress.",
      },
      { property: "og:title", content: "Progress Dashboard — MindWeave" },
      {
        property: "og:description",
        content: "Track cognitive development across four adaptive games.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, ready, reset } = useProfile();
  if (!ready)
    return (
      <AppShell>
        <div className="panel p-8 text-center">Loading…</div>
      </AppShell>
    );
  if (!profile)
    return (
      <AppShell>
        <NeedsProfile />
      </AppShell>
    );

  const offer = evaluateBonus(profile);
  const skills = SKILLS.map((s) => ({ skill: SKILL_LABELS[s], value: profile.skills[s], key: s }));
  const sorted = [...skills].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 3);
  const growth = sorted.slice(-2);

  const trend = profile.history.map((r, i) => ({
    session: i + 1,
    score: r.performance,
    game: GAME_LABELS[r.gameType],
  }));

  const perGame = (Object.keys(GAME_LABELS) as GameType[]).map((g) => {
    const rounds = profile.history.filter((r) => r.gameType === g);
    const avg = rounds.length
      ? Math.round(rounds.reduce((a, r) => a + r.performance, 0) / rounds.length)
      : 0;
    return { game: g, rounds: rounds.length, avg };
  });

  const xpInLevel = profile.bonus.xp % 250;
  const xpPct = Math.min(100, Math.round((xpInLevel / 250) * 100));

  return (
    <AppShell>
      <div className="panel animate-pop mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h1 className="font-display text-3xl font-bold">{profile.name}'s progress</h1>
          <p className="text-sm text-muted-foreground">
            Age {profile.age} · {profile.history.length} rounds played · focused on growth, never on
            ranking
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Reset this child's profile and history?")) reset();
          }}
          className="rounded-full border-2 border-border px-4 py-2 text-sm font-bold"
        >
          Reset profile
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="font-display text-xl font-bold">Cognitive development</h2>
          <div className="mt-3 space-y-3">
            {SKILLS.map((s) => (
              <SkillBar key={s} skill={s} value={profile.skills[s]} />
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl font-bold">Skill balance</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skills} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl font-bold">Strengths</h2>
          <ul className="mt-2 space-y-1 text-sm font-semibold">
            {strengths.map((s) => (
              <li key={s.key} className="rounded-lg bg-success/15 px-3 py-2">
                ✅ {s.skill} — {s.value}
              </li>
            ))}
          </ul>
          <h2 className="mt-5 font-display text-xl font-bold">Areas to support</h2>
          <ul className="mt-2 space-y-1 text-sm font-semibold">
            {growth.map((s) => (
              <li key={s.key} className="rounded-lg bg-warning/25 px-3 py-2">
                🌱 {s.skill} — {s.value}
              </li>
            ))}
          </ul>
          {profile.patterns.length ? (
            <>
              <h2 className="mt-5 font-display text-xl font-bold">Observed patterns</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {profile.patterns.map((p) => (
                  <li key={p} className="rounded-lg bg-muted/60 px-3 py-2">
                    🔍 {p}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl font-bold">Performance over sessions</h2>
          {trend.length > 1 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Play a couple of rounds to see the progress curve.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {perGame.map((g) => (
              <Stat
                key={g.game}
                label={GAME_LABELS[g.game]}
                value={g.rounds ? `${g.avg} avg · ${g.rounds}×` : "not played"}
              />
            ))}
          </div>
        </section>

        {/* Brain Boost & Advanced Challenges Section */}
        <section className="panel p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">🎉 Brain Boost & Advanced Challenges</h2>
              <p className="text-sm text-muted-foreground">
                Personalised cognitive boosts unlocked by meeting daily practice goals.
              </p>
            </div>
            <Link
              to="/bonus"
              className="toy-press rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-toy"
            >
              Go to Brain Boost
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Level" value={`Level ${profile.bonus.level}`} />
            <Stat label="Total XP" value={`${profile.bonus.xp} XP`} />
            <Stat label="Badges Unlocked" value={`${profile.bonus.badges.length} / ${BADGES.length}`} />
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Level {profile.bonus.level} Progress</span>
              <span>{250 - xpInLevel} XP to Level {profile.bonus.level + 1}</span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {/* Explainable AI Status Card */}
          <div className="rounded-xl bg-card border border-primary/30 p-4">
            <h3 className="font-display text-sm font-bold uppercase text-primary">
              🤖 Why Challenges Unlock (Explainable AI Engine)
            </h3>
            {offer.unlocked ? (
              <ul className="mt-2 space-y-1 text-sm font-semibold">
                {offer.reasons.map((r) => (
                  <li key={r} className="text-success">✅ {r}</li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2 space-y-1 text-sm font-semibold">
                {offer.blockers.map((b) => (
                  <li key={b} className="text-muted-foreground">❌ {b}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Badges Display */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-muted-foreground mb-2">
              🏆 Badges
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BADGES.map((b) => {
                const unlocked = profile.bonus.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      unlocked
                        ? "bg-card border-primary/40 text-foreground shadow-soft"
                        : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                    }`}
                  >
                    {b.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bonus History */}
          {profile.bonus.history.length > 0 ? (
            <div className="mt-4">
              <h3 className="font-display text-sm font-bold uppercase text-muted-foreground mb-2">
                📜 Recent Boost Sessions
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {[...profile.bonus.history].reverse().slice(0, 5).map((r) => (
                  <div key={r.id} className="rounded-xl bg-muted/40 p-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{BONUS_LABELS[r.game]}</span>
                      <span className="text-primary">Score: {r.performance} · +{r.xp} XP</span>
                    </div>
                    {r.notes.length > 0 ? (
                      <p className="mt-1 text-muted-foreground">⚙️ {r.notes.join(" · ")}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="panel p-5 lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Adaptive engine log</h2>
          {profile.history.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {[...profile.history]
                .reverse()
                .slice(0, 12)
                .map((r) => (
                  <div key={r.id} className="rounded-xl bg-muted/50 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2 font-bold">
                      <span>{GAME_LABELS[r.gameType]}</span>
                      <span className="rounded-full bg-card px-2 py-0.5">
                        score {r.performance}
                      </span>
                      <span className="rounded-full bg-card px-2 py-0.5">{r.adjustment}</span>
                      <span className="text-muted-foreground">
                        {Math.round(r.metrics.accuracy * 100)}% accurate ·{" "}
                        {r.metrics.timeTaken.toFixed(0)}s · {r.metrics.mistakes} mistakes ·{" "}
                        {r.metrics.hintsUsed} hints
                      </span>
                    </div>
                    {r.notes.map((n) => (
                      <p key={n} className="mt-1 text-muted-foreground">
                        ⚙️ {n}
                      </p>
                    ))}
                  </div>
                ))}
            </div>
          )}
          <Link
            to="/"
            className="toy-press mt-4 inline-block rounded-full bg-primary px-5 py-3 font-display font-bold text-primary-foreground shadow-toy"
          >
            Back to games
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
