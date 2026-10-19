// Meta de calorias que se ajusta sozinha (como o MacroFactor):
// compara o que você comeu com o que a balança mostrou e estima seu gasto real.
//   gasto real ≈ média ingerida − (variação de peso em kg × 7.700 kcal) / dias
import { supabase } from "./supabase";
import { toISODate } from "./dates";
import type { Profile } from "./auth";
import { ACTIVITY_MULTIPLIERS, calcBMR, goalFactor, splitMacros, type ActivityLevel } from "./nutrition";

const WINDOW = 28; // dias analisados
const NEED_LOGGED_DAYS = 10;
const NEED_WEIGH_INS = 3;
const NEED_SPAN = 14;
const KCAL_PER_KG = 7700;

export type AdaptiveResult =
  | { ready: false; loggedDays: number; weighIns: number; spanDays: number; need: { loggedDays: number; weighIns: number; spanDays: number } }
  | {
      ready: true;
      tdee: number; // gasto real estimado
      formulaTdee: number; // o que a fórmula previa
      avgIntake: number;
      weeklyChangeKg: number; // tendência (negativo = perdendo)
      suggested: ReturnType<typeof splitMacros>;
      current: number;
      loggedDays: number;
    };

// Regressão linear simples: kg por dia
function slope(points: { x: number; y: number }[]) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0, den = 0;
  for (const p of points) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  return den ? num / den : 0;
}

export function formulaTdee(p: Profile) {
  if (!p.age || !p.height || !p.weight) return 0;
  return Math.round(calcBMR(p.age, p.gender ?? "outro", p.height, p.weight) * (ACTIVITY_MULTIPLIERS[(p.activity_level ?? "moderado") as ActivityLevel] ?? 1.45));
}

export async function computeAdaptive(userId: string, p: Profile): Promise<AdaptiveResult> {
  const start = new Date();
  start.setDate(start.getDate() - WINDOW);
  const fromISO = toISODate(start);
  const today = toISODate();

  const [meals, weights] = await Promise.all([
    supabase.from("meal_logs").select("calories, meal_time").eq("user_id", userId).gte("meal_time", new Date(`${fromISO}T00:00:00`).toISOString()),
    supabase.from("weight_logs").select("weight, date").eq("user_id", userId).gte("date", fromISO).order("date"),
  ]);

  // Calorias por dia (hoje fica de fora: o dia ainda não acabou)
  const byDay: Record<string, number> = {};
  for (const m of meals.data ?? []) {
    const d = toISODate(new Date(m.meal_time));
    if (d !== today) byDay[d] = (byDay[d] ?? 0) + Number(m.calories);
  }
  // Dias com pouco registro (menos de 40% da meta) provavelmente estão incompletos
  const minDay = (p.daily_calories ?? 2000) * 0.4;
  const logged = Object.values(byDay).filter((v) => v >= minDay);

  const w = (weights.data ?? []).map((r) => ({ date: r.date as string, y: Number(r.weight) }));
  const t0 = w.length ? new Date(`${w[0].date}T12:00:00`).getTime() : 0;
  const pts = w.map((r) => ({ x: (new Date(`${r.date}T12:00:00`).getTime() - t0) / 86400000, y: r.y }));
  const spanDays = pts.length ? Math.round(pts[pts.length - 1].x) : 0;

  const need = { loggedDays: NEED_LOGGED_DAYS, weighIns: NEED_WEIGH_INS, spanDays: NEED_SPAN };
  if (logged.length < NEED_LOGGED_DAYS || pts.length < NEED_WEIGH_INS || spanDays < NEED_SPAN) {
    return { ready: false, loggedDays: logged.length, weighIns: pts.length, spanDays, need };
  }

  const avgIntake = logged.reduce((s, v) => s + v, 0) / logged.length;
  const kgPerDay = slope(pts);
  const formula = formulaTdee(p);
  let tdee = avgIntake - kgPerDay * KCAL_PER_KG;
  // Limites de segurança contra dados estranhos: no máximo ±35% da fórmula
  if (formula) tdee = Math.min(formula * 1.35, Math.max(formula * 0.65, tdee));
  tdee = Math.round(tdee / 10) * 10;

  return {
    ready: true,
    tdee,
    formulaTdee: formula,
    avgIntake: Math.round(avgIntake),
    weeklyChangeKg: Math.round(kgPerDay * 7 * 100) / 100,
    suggested: splitMacros(tdee * goalFactor(p.goal), p.goal, p.gender),
    current: p.daily_calories ?? 0,
    loggedDays: logged.length,
  };
}

export async function applyAdaptive(userId: string, s: ReturnType<typeof splitMacros>) {
  const { error } = await supabase
    .from("profiles")
    .update({ daily_calories: s.dailyCalories, daily_protein: s.dailyProtein, daily_carbs: s.dailyCarbs, daily_fats: s.dailyFats })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
