// Cálculo nutricional — fórmula Mifflin-St Jeor (1990), igual ao app original.

export type Gender = "masculino" | "feminino" | "outro";
export type ActivityLevel = "sedentario" | "leve" | "moderado" | "intenso" | "muito_intenso";
export type Goal = "perda_de_peso" | "ganho_de_massa" | "manutencao" | "performance";

// Multiplicadores conservadores (a maioria das pessoas superestima a própria atividade).
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.35,
  moderado: 1.45,
  intenso: 1.5,
  muito_intenso: 1.65,
};

export function calcBMR(age: number, gender: string, height: number, weight: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "masculino") return base + 5;
  if (gender === "feminino") return base - 161;
  return base + (5 - 161) / 2; // "outro": média
}

export function calcMacros(
  age: number,
  gender: string,
  height: number,
  weight: number,
  activityLevel: string,
  goal: string
) {
  const bmr = calcBMR(age, gender, height, weight);
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel as ActivityLevel] ?? 1.45);

  // Perda: déficit de 25% (~0,5 kg/semana). Ganho: superávit de 10%. Demais: manutenção.
  let dailyCalories: number, p: number, c: number, f: number;
  if (goal === "perda_de_peso") {
    dailyCalories = tdee * 0.75;
    p = 0.4; c = 0.3; f = 0.3;
  } else if (goal === "ganho_de_massa") {
    dailyCalories = tdee * 1.1;
    p = 0.3; c = 0.4; f = 0.3;
  } else {
    dailyCalories = tdee;
    p = 0.25; c = 0.45; f = 0.3;
  }

  // Piso de segurança para não recomendar metas abaixo do mínimo saudável
  const minFloor = gender === "feminino" ? 1200 : 1500;
  if (dailyCalories < minFloor) dailyCalories = minFloor;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  return {
    bmr: round2(bmr),
    tdee: Math.round(tdee),
    dailyCalories: Math.round(dailyCalories),
    dailyProtein: round2((dailyCalories * p) / 4),
    dailyCarbs: round2((dailyCalories * c) / 4),
    dailyFats: round2((dailyCalories * f) / 9),
  };
}

export function getWaterGoalMl(weightKg: number | string | null | undefined): number {
  const w = typeof weightKg === "string" ? parseFloat(weightKg) : weightKg;
  if (!w || w <= 0) return 2000;
  return Math.ceil(w * 35);
}

export function calcBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}
