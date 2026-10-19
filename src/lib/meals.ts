import { supabase } from "./supabase";

export const MEAL_TYPES = [
  { value: "cafe_da_manha", label: "Café da manhã" },
  { value: "lanche_manha", label: "Lanche da manhã" },
  { value: "almoco", label: "Almoço" },
  { value: "lanche_tarde", label: "Lanche da tarde" },
  { value: "jantar", label: "Jantar" },
  { value: "ceia", label: "Ceia" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["value"];

export function mealTypeLabel(v: string) {
  return MEAL_TYPES.find((m) => m.value === v)?.label ?? v;
}

// Sugere o tipo de refeição pelo horário
export function guessMealType(d = new Date()): MealType {
  const h = d.getHours();
  if (h < 10) return "cafe_da_manha";
  if (h < 11.5) return "lanche_manha";
  if (h < 15) return "almoco";
  if (h < 18.5) return "lanche_tarde";
  if (h < 22) return "jantar";
  return "ceia";
}

export type MealAnalysis = {
  meal_name: string;
  items: { name: string; grams?: number; calories: number; protein: number; carbs: number; fats: number }[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion_size: string | null;
  note: string | null;
  remaining: number;
};

export type QuotaStatus = { plan: "free" | "premium"; limit: number; used: number; remaining: number };

export async function getQuota(): Promise<QuotaStatus | null> {
  const { data, error } = await supabase.rpc("ai_quota_status");
  if (error) return null;
  return data as QuotaStatus;
}

// Chama a função do servidor. Lança erro com mensagem já em português.
export async function analyzeMeal(input: {
  mode: "text" | "photo";
  text?: string;
  imageBase64?: string;
  mimeType?: string;
  grams?: number;
}): Promise<MealAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-meal", { body: input });
  if (error) {
    // Tenta ler a mensagem que o servidor mandou
    let msg = "Não consegui analisar agora. Tente de novo.";
    try {
      const ctx: any = (error as any).context;
      const body = ctx?.json ? await ctx.json() : null;
      if (body?.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  return data as MealAnalysis;
}
