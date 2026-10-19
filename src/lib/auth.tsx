import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  activity_level: string | null;
  goal: string | null;
  sport_focus: string | null;
  fitness_level: string | null;
  use_fasting: boolean | null;
  onboarding_completed: boolean | null;
  bmr: number | null;
  daily_calories: number | null;
  daily_protein: number | null;
  daily_carbs: number | null;
  daily_fats: number | null;
  dietary_restrictions: string[] | null;
  injuries: string | null;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// O banco devolve campos numéricos (numeric) como texto; aqui viram número.
function normalize(p: any): Profile {
  const num = (v: any) => (v === null || v === undefined ? null : Number(v));
  return {
    ...p,
    weight: num(p.weight),
    bmr: num(p.bmr),
    daily_calories: num(p.daily_calories),
    daily_protein: num(p.daily_protein),
    daily_carbs: num(p.daily_carbs),
    daily_fats: num(p.daily_fats),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) console.warn("Erro ao carregar perfil:", error.message);
    setProfile(data ? normalize(data) : null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s) await loadProfile(s.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ loading, session, profile, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
