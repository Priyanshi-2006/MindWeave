import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createProfile,
  migrateProfile,
  processRound,
  type Diagnostics,
} from "./engine";
import { processBonusRound, todayKey, type BonusMetrics } from "./bonus";
import type {
  BonusGameType,
  BonusResult,
  ChildProfile,
  GameType,
  ParentSettings,
  RoundMetrics,
  RoundResult,
} from "./types";

const KEY = "mindweave.profile.v1";
const LEGACY_KEY = "intelliplay.profile.v1";
const AUTH_KEY = "mindweave.auth.v1";

type Ctx = {
  profile: ChildProfile | null;
  ready: boolean;
  isAuthenticated: boolean;
  lastResult: RoundResult | null;
  start: (name: string, age: number, avatar?: string) => void;
  setAvatar: (avatar: string) => void;
  finishAssessment: (skills: Partial<ChildProfile["skills"]>) => void;
  submitRound: (
    game: GameType,
    metrics: RoundMetrics,
    diag?: Diagnostics,
  ) => RoundResult;
  submitBonus: (game: BonusGameType, metrics: BonusMetrics) => BonusResult;
  dismissBonus: () => void;
  updateSettings: (patch: Partial<ParentSettings>) => void;
  reset: () => void;
  login: (identifier: string) => void;
  signup: (fullName: string, identifier: string) => void;
  logout: () => void;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [ready, setReady] = useState(false);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);

  useEffect(() => {
    try {
      const isAuth = window.localStorage.getItem(AUTH_KEY) === "true";
      setIsAuthenticated(isAuth);
      const raw =
        window.localStorage.getItem(KEY) ??
        window.localStorage.getItem(LEGACY_KEY);
      if (raw) setProfile(migrateProfile(JSON.parse(raw) as ChildProfile));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (profile) window.localStorage.setItem(KEY, JSON.stringify(profile));
    else {
      window.localStorage.removeItem(KEY);
      window.localStorage.removeItem(LEGACY_KEY);
    }
  }, [profile, ready]);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated) {
      window.localStorage.setItem(AUTH_KEY, "true");
    } else {
      window.localStorage.removeItem(AUTH_KEY);
    }
  }, [isAuthenticated, ready]);

  const start = useCallback(
    (name: string, age: number, avatar = "fox") =>
      setProfile({ ...createProfile(name, age), avatar }),
    [],
  );

  const setAvatar = useCallback(
    (avatar: string) => setProfile((p) => (p ? { ...p, avatar } : p)),
    [],
  );

  const finishAssessment = useCallback(
    (skills: Partial<ChildProfile["skills"]>) => {
      setProfile((p) =>
        p
          ? {
              ...p,
              assessmentDone: true,
              skills: { ...p.skills, ...skills },
            }
          : p,
      );
    },
    [],
  );

  const submitRound = useCallback(
    (game: GameType, metrics: RoundMetrics, diag: Diagnostics = {}) => {
      if (!profile) throw new Error("No profile");
      const { profile: next, result } = processRound(
        profile,
        game,
        metrics,
        diag,
      );
      setProfile(next);
      setLastResult(result);
      return result;
    },
    [profile],
  );

  const submitBonus = useCallback(
    (game: BonusGameType, metrics: BonusMetrics) => {
      if (!profile) throw new Error("No profile");
      const { profile: next, result } = processBonusRound(
        profile,
        game,
        metrics,
      );
      setProfile(next);
      return result;
    },
    [profile],
  );

  const dismissBonus = useCallback(() => {
    setProfile((p) =>
      p ? { ...p, bonus: { ...p.bonus, dismissedOn: todayKey() } } : p,
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<ParentSettings>) => {
    setProfile((p) =>
      p ? { ...p, settings: { ...p.settings, ...patch } } : p,
    );
  }, []);

  const reset = useCallback(() => setProfile(null), []);

  const login = useCallback((identifier: string) => {
    setIsAuthenticated(true);
    try {
      window.localStorage.setItem(AUTH_KEY, "true");
    } catch {
      /* ignore */
    }
    setProfile((prev) => {
      if (prev) return prev;
      const name = identifier.trim().split("@")[0] || "Player";
      return { ...createProfile(name, 9), avatar: "fox" };
    });
  }, []);

  const signup = useCallback((fullName: string, _identifier: string) => {
    const name = fullName.trim() || "Player";
    setProfile((prev) => prev ?? { ...createProfile(name, 9), avatar: "fox" });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      isAuthenticated,
      lastResult,
      start,
      setAvatar,
      finishAssessment,
      submitRound,
      submitBonus,
      dismissBonus,
      updateSettings,
      reset,
      login,
      signup,
      logout,
    }),
    [
      profile,
      ready,
      isAuthenticated,
      lastResult,
      start,
      setAvatar,
      finishAssessment,
      submitRound,
      submitBonus,
      dismissBonus,
      updateSettings,
      reset,
      login,
      signup,
      logout,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
