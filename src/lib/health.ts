// Referências de saúde ("qual seria o ideal") — sempre como orientação geral, não diagnóstico.
// Fontes:
//  - IMC: OMS (18,5–24,9 = peso adequado)
//  - Circunferência da cintura: OMS (homens ≥94 risco aumentado, ≥102 muito aumentado; mulheres ≥80 / ≥88)
//  - Relação cintura/altura: < 0,5 (meta "cintura menor que metade da altura")
//  - Gordura corporal: tabela ACE; estimativa pelo método da Marinha dos EUA (cintura, pescoço, quadril)
//  - Proteína: ISSN 2017 — 1,4 a 2,0 g/kg/dia para quem se exercita
//  - Ritmo de perda de peso: 0,5% a 1% do peso por semana

export type Range = { min: number; max: number };
export type Status = "baixo" | "ideal" | "atencao" | "alto";

export const BMI_BANDS = [
  { max: 18.5, label: "Abaixo do peso", status: "baixo" as Status },
  { max: 25, label: "Peso adequado", status: "ideal" as Status },
  { max: 30, label: "Sobrepeso", status: "atencao" as Status },
  { max: 35, label: "Obesidade grau I", status: "alto" as Status },
  { max: 40, label: "Obesidade grau II", status: "alto" as Status },
  { max: Infinity, label: "Obesidade grau III", status: "alto" as Status },
];

export function bmiOf(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiBand(bmi: number) {
  return BMI_BANDS.find((b) => bmi < b.max) ?? BMI_BANDS[BMI_BANDS.length - 1];
}

// Faixa de peso em que o IMC fica entre 18,5 e 24,9
export function healthyWeightRange(heightCm: number): Range {
  const m2 = (heightCm / 100) ** 2;
  return { min: Math.round(18.5 * m2 * 10) / 10, max: Math.round(24.9 * m2 * 10) / 10 };
}

// Sugestão de meta: se estiver acima da faixa, primeiro passo de 5–10% (mais realista) e o alvo final no topo da faixa.
export function weightGuidance(weightKg: number, heightCm: number) {
  const r = healthyWeightRange(heightCm);
  if (weightKg > r.max) {
    return {
      kind: "perder" as const,
      firstStep: Math.round(weightKg * 0.95 * 10) / 10,
      firstStepLabel: "Primeira meta (−5%)",
      target: r.max,
      toTarget: Math.round((weightKg - r.max) * 10) / 10,
      weeklyMin: Math.round(weightKg * 0.005 * 10) / 10,
      weeklyMax: Math.round(weightKg * 0.01 * 10) / 10,
    };
  }
  if (weightKg < r.min) {
    return { kind: "ganhar" as const, target: r.min, toTarget: Math.round((r.min - weightKg) * 10) / 10 };
  }
  return { kind: "manter" as const, target: weightKg, toTarget: 0 };
}

export function waistRisk(waistCm: number, gender: string | null) {
  const fem = gender === "feminino";
  const [inc, high] = fem ? [80, 88] : [94, 102];
  if (waistCm >= high) return { status: "alto" as Status, label: "Risco muito aumentado", limit: inc };
  if (waistCm >= inc) return { status: "atencao" as Status, label: "Risco aumentado", limit: inc };
  return { status: "ideal" as Status, label: "Dentro do recomendado", limit: inc };
}

export function waistToHeight(waistCm: number, heightCm: number) {
  const ratio = waistCm / heightCm;
  return {
    ratio: Math.round(ratio * 100) / 100,
    status: (ratio < 0.5 ? "ideal" : ratio < 0.6 ? "atencao" : "alto") as Status,
    idealMax: Math.round(heightCm / 2),
  };
}

// Método da Marinha dos EUA (fórmula métrica). Homens: cintura e pescoço. Mulheres: + quadril.
export function bodyFatNavy(p: { gender: string | null; heightCm: number; waistCm: number; neckCm: number; hipCm?: number | null }): number | null {
  const { gender, heightCm: h, waistCm: w, neckCm: n, hipCm } = p;
  if (!h || !w || !n) return null;
  if (gender === "feminino") {
    if (!hipCm || w + hipCm - n <= 0) return null;
    const v = 495 / (1.29579 - 0.35004 * Math.log10(w + hipCm - n) + 0.221 * Math.log10(h)) - 450;
    return isFinite(v) && v > 2 && v < 70 ? Math.round(v * 10) / 10 : null;
  }
  if (w - n <= 0) return null;
  const v = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
  return isFinite(v) && v > 2 && v < 70 ? Math.round(v * 10) / 10 : null;
}

// Faixas ACE
export function bodyFatBands(gender: string | null) {
  const fem = gender === "feminino";
  return fem
    ? [
        { max: 14, label: "Essencial", status: "baixo" as Status },
        { max: 21, label: "Atleta", status: "ideal" as Status },
        { max: 25, label: "Em forma", status: "ideal" as Status },
        { max: 32, label: "Média", status: "atencao" as Status },
        { max: Infinity, label: "Acima do recomendado", status: "alto" as Status },
      ]
    : [
        { max: 6, label: "Essencial", status: "baixo" as Status },
        { max: 14, label: "Atleta", status: "ideal" as Status },
        { max: 18, label: "Em forma", status: "ideal" as Status },
        { max: 25, label: "Média", status: "atencao" as Status },
        { max: Infinity, label: "Acima do recomendado", status: "alto" as Status },
      ];
}

export function bodyFatBand(pct: number, gender: string | null) {
  const bands = bodyFatBands(gender);
  return bands.find((b) => pct < b.max) ?? bands[bands.length - 1];
}

export function idealBodyFat(gender: string | null): Range {
  return gender === "feminino" ? { min: 21, max: 24 } : { min: 14, max: 17 };
}

// Proteína: 1,4–2,0 g/kg (ISSN). Para quem está acima do peso, usa o peso-alvo para não superestimar.
export function proteinRange(weightKg: number, heightCm: number): Range {
  const r = healthyWeightRange(heightCm);
  const ref = weightKg > r.max ? r.max : weightKg;
  return { min: Math.round(ref * 1.4), max: Math.round(ref * 2.0) };
}
