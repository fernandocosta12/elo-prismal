// Cardápio do dia (IA) e lista de mercado
import { supabase } from "./supabase";
import { toISODate } from "./dates";

export type PlanMeal = {
  meal_type: string;
  name: string;
  items: { name: string; quantity: string }[];
  prep: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};
export type MealPlan = {
  meals: PlanMeal[];
  shopping: { name: string; quantity: string }[];
  tip: string | null;
  preferences: string | null;
  totals: { calories: number; protein: number; carbs: number; fats: number };
};

export async function getTodayPlan(userId: string): Promise<MealPlan | null> {
  const { data } = await supabase.from("meal_plans").select("plan").eq("user_id", userId).eq("date", toISODate()).maybeSingle();
  return (data?.plan as MealPlan) ?? null;
}

export async function generatePlan(preferences: string, meals: number): Promise<MealPlan> {
  const { data, error } = await supabase.functions.invoke("plan-meals", { body: { preferences, meals } });
  if (error) {
    let msg = "Não consegui montar o cardápio agora. Tente de novo.";
    try {
      const ctx: any = (error as any).context;
      const body = ctx?.json ? await ctx.json() : null;
      if (body?.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  return (data as { plan: MealPlan }).plan;
}

export type ShoppingItem = { id: string; name: string; quantity: string | null; checked: boolean };

export async function listShopping(userId: string): Promise<ShoppingItem[]> {
  const { data } = await supabase
    .from("shopping_items")
    .select("id, name, quantity, checked")
    .eq("user_id", userId)
    .order("checked")
    .order("created_at");
  return (data ?? []) as ShoppingItem[];
}

export async function addShopping(userId: string, items: { name: string; quantity?: string | null }[]) {
  const rows = items
    .map((i) => ({ user_id: userId, name: i.name.trim().slice(0, 120), quantity: i.quantity?.trim().slice(0, 60) || null }))
    .filter((i) => i.name);
  if (!rows.length) return;
  const { error } = await supabase.from("shopping_items").insert(rows);
  if (error) throw new Error(error.message);
}
