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
  CaregiverSettings,
  CareLevel,
  PatientProfile,
  RoundMetrics,
  RoundResult,
  SeniorAccessibilitySettings,
} from "./types";
import { auth } from "../firebase";
import { signOut as firebaseSignOut, type User } from "firebase/auth";
import {
  fetchProfile,
  saveProfile,
  submitRoundToServer,
  submitBonusToServer,
} from "./serverFunctions";

const KEY = "mindweave.patient.v2";
const LEGACY_KEY = "mindweave.profile.v1";
const ANCIENT_KEY = "intelliplay.profile.v1";
const ACC_KEY = "mindweave.accessibility.v1";

const defaultAcc: SeniorAccessibilitySettings = {
  fontSize: "medium",
  highContrast: false,
  voiceGuidance: true,
  speechRate: 0.85,
  simplifiedControls: false,
};

function getInitialAccessibility(): SeniorAccessibilitySettings {
  if (typeof window === "undefined") return defaultAcc;
  try {
    const raw = window.localStorage.getItem(ACC_KEY);
    if (raw) return { ...defaultAcc, ...JSON.parse(raw) };
  } catch {}
  return defaultAcc;
}

type Ctx = {
  profile: PatientProfile | null;
  accessibility: SeniorAccessibilitySettings;
  ready: boolean;
  isAuthenticated: boolean;
  lastResult: RoundResult | null;
  idToken: string | null;
  user: User | null;
  start: (name: string, age: number, avatar?: string, careLevel?: CareLevel) => Promise<void>;
  setAvatar: (avatar: string) => Promise<void>;
  finishAssessment: (skills: Partial<PatientProfile["skills"]>) => Promise<void>;
  submitRound: (game: GameType, metrics: RoundMetrics, diag?: Diagnostics) => Promise<RoundResult>;
  submitBonus: (game: BonusGameType, metrics: BonusMetrics) => Promise<BonusResult>;
  dismissBonus: () => Promise<void>;
  updateSettings: (patch: Partial<CaregiverSettings>) => Promise<void>;
  updateAccessibility: (patch: Partial<SeniorAccessibilitySettings>) => Promise<void>;
  updateCareLevel: (careLevel: CareLevel) => Promise<void>;
  reset: () => Promise<void>;
  signOut: () => Promise<void>;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [accessibility, setAccessibility] = useState<SeniorAccessibilitySettings>(getInitialAccessibility);
  const [ready, setReady] = useState(false);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Sync DOM classes whenever accessibility state changes (globally across the entire app)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;

    if (accessibility.highContrast) {
      html.classList.add("high-contrast", "dark");
    } else {
      html.classList.remove("high-contrast", "dark");
    }

    html.classList.remove("font-size-medium", "font-size-large", "font-size-extra-large");
    html.classList.add(`font-size-${accessibility.fontSize}`);
  }, [accessibility.highContrast, accessibility.fontSize]);

  // Sync accessibility with profile when profile is loaded
  useEffect(() => {
    if (profile?.accessibility) {
      setAccessibility((prev) => {
        const next = { ...prev, ...profile.accessibility };
        try {
          window.localStorage.setItem(ACC_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [profile?.accessibility]);

  // Monitor auth state and sync with Firestore or fallback to LocalStorage
  useEffect(() => {
    return auth.onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          
          // Fetch from Firestore
          const dbProfile = await fetchProfile({ data: token });
          if (dbProfile) {
            setProfile(dbProfile);
          } else {
            // DB has no profile yet: check local storage to migrate it
            const raw =
              window.localStorage.getItem(KEY) ??
              window.localStorage.getItem(LEGACY_KEY) ??
              window.localStorage.getItem(ANCIENT_KEY);
            if (raw) {
              const localProfile = migrateProfile(JSON.parse(raw) as PatientProfile);
              setProfile(localProfile);
              await saveProfile({ data: { idToken: token, profile: localProfile } });
            } else {
              setProfile(null);
            }
          }
        } catch (e) {
          console.error("Error syncing profile with database:", e);
        }
      } else {
        // Logged out / Anonymous mode: load from LocalStorage
        setUser(null);
        setIdToken(null);
        try {
          const raw =
            window.localStorage.getItem(KEY) ??
            window.localStorage.getItem(LEGACY_KEY) ??
            window.localStorage.getItem(ANCIENT_KEY);
          if (raw) setProfile(migrateProfile(JSON.parse(raw) as PatientProfile));
          else setProfile(null);
        } catch {
          setProfile(null);
        }
      }
      setReady(true);
    });
  }, []);

  // Update local storage backup (only when operating in offline/anonymous mode)
  useEffect(() => {
    if (!ready || idToken) return;
    if (profile) {
      window.localStorage.setItem(KEY, JSON.stringify(profile));
    } else {
      window.localStorage.removeItem(KEY);
      window.localStorage.removeItem(LEGACY_KEY);
    }
  }, [profile, ready, idToken]);

  // Helper to update local state and database profile at the same time
  const updateProfile = useCallback(
    async (updater: (prev: PatientProfile | null) => PatientProfile | null) => {
      let next: PatientProfile | null = null;
      setProfile((prev) => {
        next = updater(prev);
        return next;
      });
      // Perform database write after the react state update transaction
      if (idToken) {
        // Wait a tick for the callback closure variable to be populated
        setTimeout(async () => {
          if (next !== undefined) {
            try {
              await saveProfile({ data: { idToken, profile: next } });
            } catch (err) {
              console.error("Failed to save profile updates to database:", err);
            }
          }
        }, 0);
      }
    },
    [idToken]
  );

  const start = useCallback(
    async (name: string, age: number, avatar = "p1", careLevel: CareLevel = "guided") => {
      const next = { ...createProfile(name, age, careLevel), avatar };
      setProfile(next);
      if (idToken) {
        await saveProfile({ data: { idToken, profile: next } });
      }
    },
    [idToken]
  );

  const setAvatar = useCallback(
    async (avatar: string) => {
      await updateProfile((p) => (p ? { ...p, avatar } : p));
    },
    [updateProfile]
  );

  const finishAssessment = useCallback(
    async (skills: Partial<PatientProfile["skills"]>) => {
      await updateProfile((p) =>
        p ? { ...p, assessmentDone: true, skills: { ...p.skills, ...skills } } : p
      );
    },
    [updateProfile]
  );

  const submitRound = useCallback(
    async (game: GameType, metrics: RoundMetrics, diag: Diagnostics = {}) => {
      if (!profile) throw new Error("No profile active");

      if (idToken) {
        try {
          // Submit to database -> updates server engine and registers database log
          const { nextProfile, result } = await submitRoundToServer({
            data: { idToken, game, metrics, diag },
          });
          setProfile(nextProfile);
          setLastResult(result);
          return result;
        } catch (err) {
          console.error("Server round submission failed, falling back to local engine:", err);
          // Fallback to local adaptive engine processing
          const { profile: next, result } = processRound(profile, game, metrics, diag);
          setProfile(next);
          setLastResult(result);
          return result;
        }
      } else {
        // Fallback to local adaptive engine processing
        const { profile: next, result } = processRound(profile, game, metrics, diag);
        setProfile(next);
        setLastResult(result);
        return result;
      }
    },
    [profile, idToken]
  );

  const submitBonus = useCallback(
    async (game: BonusGameType, metrics: BonusMetrics) => {
      if (!profile) throw new Error("No profile active");

      if (idToken) {
        try {
          // Submit to database -> updates server engine and registers database log
          const { nextProfile, result } = await submitBonusToServer({
            data: { idToken, game, metrics },
          });
          setProfile(nextProfile);
          return result;
        } catch (err) {
          console.error("Server bonus submission failed, falling back to local engine:", err);
          // Fallback to local adaptive engine processing
          const { profile: next, result } = processBonusRound(profile, game, metrics);
          setProfile(next);
          return result;
        }
      } else {
        // Fallback to local adaptive engine processing
        const { profile: next, result } = processBonusRound(profile, game, metrics);
        setProfile(next);
        return result;
      }
    },
    [profile, idToken]
  );

  const dismissBonus = useCallback(async () => {
    await updateProfile((p) => (p ? { ...p, bonus: { ...p.bonus, dismissedOn: todayKey() } } : p));
  }, [updateProfile]);

  const updateSettings = useCallback(
    async (patch: Partial<CaregiverSettings>) => {
      await updateProfile((p) => (p ? { ...p, settings: { ...p.settings, ...patch } } : p));
    },
    [updateProfile]
  );

  const updateAccessibility = useCallback(
    async (patch: Partial<SeniorAccessibilitySettings>) => {
      setAccessibility((prev) => {
        const next = { ...prev, ...patch };
        try {
          window.localStorage.setItem(ACC_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      if (profile) {
        await updateProfile((p) =>
          p ? { ...p, accessibility: { ...p.accessibility, ...patch } } : p
        );
      }
    },
    [profile, updateProfile]
  );

  const updateCareLevel = useCallback(
    async (careLevel: CareLevel) => {
      await updateProfile((p) => (p ? { ...p, careLevel } : p));
    },
    [updateProfile]
  );

  const reset = useCallback(async () => {
    setProfile(null);
    if (idToken) {
      await saveProfile({ data: { idToken, profile: null } });
    }
  }, [idToken]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setIdToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      accessibility,
      ready,
      isAuthenticated: !!user,
      lastResult,
      idToken,
      user,
      start,
      setAvatar,
      finishAssessment,
      submitRound,
      submitBonus,
      dismissBonus,
      updateSettings,
      updateAccessibility,
      updateCareLevel,
      reset,
      signOut,
    }),
    [
      profile,
      accessibility,
      ready,
      user,
      lastResult,
      idToken,
      start,
      setAvatar,
      finishAssessment,
      submitRound,
      submitBonus,
      dismissBonus,
      updateSettings,
      updateAccessibility,
      updateCareLevel,
      reset,
      signOut,
    ]
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
