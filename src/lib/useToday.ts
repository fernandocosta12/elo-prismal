import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { dayBounds, toISODate } from "./dates";

export type HappyToday = { workout: boolean; nutrition: boolean; water: boolean };

export type TodayData = {
  loading: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterMl: number;
  waterEntries: { id: string; amount_ml: number }[];
  weightToday: number | null;
  workout: { id: string; title: string; completed: boolean | null } | null;
  happy: HappyToday;
  happyTotal: number;
  streak: number;
  refresh: () => Promise<void>;
};

// Sequência de dias com pelo menos 1 item cumprido (mesma regra do app original).
// Se hoje ainda não pontuou, a sequência conta a partir de ontem.
function calcStreak(dates: Set<string>): number {
  const d = new Date();
  if (!dates.has(toISODate(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dates.has(toISODate(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function useToday(userId: string | undefined): TodayData {
  const [state, setState] = useState<Omit<TodayData, "refresh">>({
    loading: true,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    waterMl: 0,
    waterEntries: [],
    weightToday: null,
    workout: null,
    happy: { workout: false, nutrition: false, water: false },
    happyTotal: 0,
    streak: 0,
  });

  const refresh = useCallback(async () => {
    if (!userId) return;
    const today = toISODate();
    const { start, end } = dayBounds();

    const [meals, water, weight, workout, happy] = await Promise.all([
      supabase.from("meal_logs").select("calories, protein, carbs, fats").eq("user_id", userId).gte("meal_time", start).lte("meal_time", end),
      supabase.from("water_logs").select("id, amount_ml").eq("user_id", userId).eq("date", today).order("created_at"),
      supabase.from("weight_logs").select("weight").eq("user_id", userId).eq("date", today).maybeSingle(),
      supabase
        .from("workouts")
        .select("id, title, completed")
        .eq("user_id", userId)
        .eq("scheduled_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("happy_logs").select("date, workout_done, nutrition_done, water_done").eq("user_id", userId).order("date", { ascending: false }),
    ]);

    const sum = (rows: any[] | null, k: string) => (rows ?? []).reduce((s, r) => s + Number(r[k] ?? 0), 0);
    const logs = happy.data ?? [];
    const earned = new Set(logs.filter((l) => l.workout_done || l.nutrition_done || l.water_done).map((l) => l.date as string));
    const todayLog = logs.find((l) => l.date === today);

    setState({
      loading: false,
      calories: sum(meals.data, "calories"),
      protein: sum(meals.data, "protein"),
      carbs: sum(meals.data, "carbs"),
      fats: sum(meals.data, "fats"),
      waterMl: sum(water.data, "amount_ml"),
      waterEntries: (water.data ?? []) as any,
      weightToday: weight.data ? Number(weight.data.weight) : null,
      workout: (workout.data as any) ?? null,
      happy: {
        workout: !!todayLog?.workout_done,
        nutrition: !!todayLog?.nutrition_done,
        water: !!todayLog?.water_done,
      },
      happyTotal: earned.size,
      streak: calcStreak(earned),
    });
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
