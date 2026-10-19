// Busca alimentos embalados pelo código de barras na Open Food Facts (base aberta e gratuita).
export type Product = {
  code: string;
  name: string;
  brand: string | null;
  servingGrams: number | null;
  per100: { calories: number; protein: number; carbs: number; fats: number };
};

export async function lookupBarcode(code: string): Promise<Product | null> {
  const clean = code.replace(/\D/g, "");
  if (clean.length < 8) throw new Error("Código inválido. Confira os números embaixo das barras.");
  const fields = "product_name,product_name_pt,brands,serving_quantity,nutriments";
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=${fields}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Não consegui consultar agora. Tente de novo.");
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments ?? {};
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  let kcal = num(n["energy-kcal_100g"]);
  if (!kcal && n["energy_100g"]) kcal = num(n["energy_100g"]) / 4.184; // kJ → kcal
  return {
    code: clean,
    name: String(p.product_name_pt || p.product_name || "Produto").trim().slice(0, 70),
    brand: p.brands ? String(p.brands).split(",")[0].trim() : null,
    servingGrams: num(p.serving_quantity) || null,
    per100: { calories: kcal, protein: num(n.proteins_100g), carbs: num(n.carbohydrates_100g), fats: num(n.fat_100g) },
  };
}

export function forGrams(p: Product, grams: number) {
  const f = grams / 100;
  const r1 = (v: number) => Math.round(v * f * 10) / 10;
  return {
    calories: Math.round(p.per100.calories * f),
    protein: r1(p.per100.protein),
    carbs: r1(p.per100.carbs),
    fats: r1(p.per100.fats),
  };
}
