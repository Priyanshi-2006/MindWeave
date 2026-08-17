import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, NeedsProfile, Stat } from "@/components/intelliplay/shell";
import { useProfile } from "@/lib/intelliplay/store";
import { evaluateBonus, minutesRemaining, secondsToday, BADGES } from "@/lib/intelliplay/bonus";
import { BONUS_LABELS } from "@/lib/intelliplay/types";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Zone & Controls — MindWeave" },
      {
        name: "description",
        content:
          "Parent controls for screen time limits, bonus challenge toggles, and explainable AI insights.",
      },
    ],
  }),
  component: ParentPage,
});

function ParentPage() {
  const { profile, ready, updateSettings } = useProfile();

  if (!ready) {
    return (
      <AppShell>
        <div className="panel p-8 text-center">Loading…</div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <NeedsProfile />
      </AppShell>
    );
  }

  const offer = evaluateBonus(profile);
  const usedMins = Math.round(secondsToday(profile) / 60);
  const remainingMins = minutesRemaining(profile);

  // XP progress
  const currentXp = profile.bonus.xp;
  const level = profile.bonus.level;
  const xpInLevel = currentXp % 250;
  const xpPct = Math.min(100, Math.round((xpInLevel / 250) * 100));

  return (
    <AppShell>
      <div className="panel animate-pop mb-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold">🛡️ Parent Zone</h1>
          <p className="text-sm text-muted-foreground">
            Manage screen time, toggle bonus challenges, and inspect explainable AI engine logic for {profile.name}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls Panel */}
        <section className="panel space-y-6 p-6">
          <h2 className="font-display text-xl font-bold">⏱️ Screen Time & Settings</h2>

          {/* Daily Limit Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Daily Limit</span>
              <span className="text-primary text-base font-display">
                {profile.settings.dailyLimitMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={profile.settings.dailyLimitMinutes}
              onChange={(e) => updateSettings({ dailyLimitMinutes: Number(e.target.value) })}
              className="w-full accent-[var(--primary)] h-3 rounded-lg"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-semibold">
              <span>15 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Bonus Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
            <div>
              <p className="font-display text-base font-bold">Enable Bonus Challenges</p>
              <p className="text-xs text-muted-foreground">
                Allows unlocked adaptive bonus games after completing daily goals.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ bonusEnabled: !profile.settings.bonusEnabled })}
              className={`toy-press px-4 py-2 rounded-full font-bold text-sm transition-all ${
                profile.settings.bonusEnabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {profile.settings.bonusEnabled ? "Enabled ON" : "Disabled OFF"}
            </button>
          </div>

          {/* Today's Usage Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Time Used Today" value={`${usedMins} min`} />
            <Stat label="Time Remaining" value={`${remainingMins} min`} />
          </div>

          {/* Usage History */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-muted-foreground">
              📅 Recent Playtime History
            </h3>
            {profile.usage.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No recorded sessions yet today.</p>
            ) : (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {[...profile.usage].reverse().map((u) => (
                  <div
                    key={u.date}
                    className="flex justify-between items-center rounded-xl bg-muted/40 px-3 py-2 text-sm font-semibold"
                  >
                    <span>{u.date}</span>
                    <span className="text-primary">{Math.round(u.seconds / 60)} min played</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Explainable AI Status */}
        <section className="panel space-y-6 p-6">
          <h2 className="font-display text-xl font-bold">🤖 Explainable AI Bonus Status</h2>

          <div
            className={`rounded-2xl p-5 border-2 ${
              offer.unlocked
                ? "bg-success/10 border-success/30"
                : "bg-muted/40 border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{offer.unlocked ? "🎉" : "🔒"}</span>
              <h3 className="font-display text-lg font-bold">
                Status: {offer.unlocked ? "UNLOCKED & AVAILABLE" : "LOCKED"}
              </h3>
            </div>

            {offer.unlocked ? (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase text-success">
                  Requirements Fulfilled:
                </p>
                <ul className="mt-1 space-y-1 text-sm font-semibold">
                  {offer.reasons.map((r) => (
                    <li key={r}>✅ {r}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase text-destructive">
                  Remaining Blockers:
                </p>
                <ul className="mt-1 space-y-1 text-sm font-semibold">
                  {offer.blockers.map((b) => (
                    <li key={b}>❌ {b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Gamification Level & XP */}
          <div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="font-display text-base">Level {level} Explorer</span>
              <span className="text-muted-foreground">{currentXp} XP Total</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {250 - xpInLevel} XP to Level {level + 1}
            </p>
          </div>

          {/* Badges Gallery */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-muted-foreground">
              🏆 Earned Badges ({profile.bonus.badges.length} / {BADGES.length})
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {BADGES.map((b) => {
                const unlocked = profile.bonus.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border font-bold text-xs ${
                      unlocked
                        ? "bg-card border-primary/40 text-foreground shadow-soft"
                        : "bg-muted/30 border-transparent text-muted-foreground opacity-60"
                    }`}
                  >
                    <span>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bonus History Table */}
        <section className="panel p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold">📜 Bonus Challenge History</h2>
          {profile.bonus.history.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No bonus challenges completed yet.</p>
          ) : (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {[...profile.bonus.history].reverse().map((r) => (
                <div key={r.id} className="rounded-xl bg-muted/40 p-4 text-sm font-medium">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                    <span className="font-display text-base">
                      {BONUS_LABELS[r.game]}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-card px-2.5 py-1">
                        Score: {r.performance}
                      </span>
                      <span className="rounded-full bg-primary/20 text-primary px-2.5 py-1">
                        +{r.xp} XP
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(r.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {r.notes.length > 0 ? (
                    <div className="mt-2 text-xs text-muted-foreground font-semibold">
                      ⚙️ AI Adaptation: {r.notes.join(" · ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
