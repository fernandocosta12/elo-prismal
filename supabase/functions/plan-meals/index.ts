// Monta o cardápio do dia dentro das metas do usuário (calorias e macros) e a lista de compras.
// Mesmas regras de custo da análise de refeição: consome 1 uso do limite diário de IA; devolve se falhar.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MEAL_TYPES = ["cafe_da_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"];

const SCHEMA = {
  type: "OBJECT",
  properties: {
    meals: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          meal_type: { type: "STRING", enum: MEAL_TYPES },
          name: { type: "STRING", description: "Nome curto do prato em pt-BR" },
          items: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                quantity: { type: "STRING", description: "Quantidade caseira e em gramas, ex: '4 col. sopa (100 g)'" },
              },
              required: ["name", "quantity"],
            },
          },
          prep: { type: "STRING", description: "Modo de preparo em 1 ou 2 frases" },
          calories: { type: "NUMBER" },
          protein: { type: "NUMBER" },
          carbs: { type: "NUMBER" },
          fats: { type: "NUMBER" },
        },
        required: ["meal_type", "name", "items", "calories", "protein", "carbs", "fats"],
      },
    },
    shopping: {
      type: "ARRAY",
      description: "Ingredientes somados do dia, sem repetir",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, quantity: { type: "STRING" } },
        required: ["name", "quantity"],
      },
    },
    tip: { type: "STRING", description: "Uma dica curta e prática para o dia" },
  },
  required: ["meals", "shopping"],
};

const SYSTEM = `Você é um nutricionista brasileiro. Monte um cardápio de UM dia com comida brasileira do dia a dia,
fácil de achar no mercado e barata (arroz, feijão, ovos, frango, carne moída, peixe, legumes, frutas, aveia, iogurte, pão, tapioca etc.).
- Respeite a meta diária de calorias com margem de ±5% e chegue perto das metas de proteína, carboidrato e gordura.
- Use as referências TACO para os valores. Calorias em kcal; macros em gramas, 1 casa decimal.
- Quantidades em medida caseira e em gramas.
- Respeite restrições e preferências informadas. Nunca inclua alimentos aos quais a pessoa disse ter restrição.
- Varie em relação a cardápios comuns; não repita a mesma proteína em todas as refeições.
- A lista de compras soma os ingredientes do dia (não liste sal, água ou temperos básicos).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: u, error: uErr } = await userClient.auth.getUser();
  if (uErr || !u?.user) return json({ error: "Faça login novamente." }, 401);
  const userId = u.user.id;

  let body: { preferences?: string; meals?: number } = {};
  try { body = await req.json(); } catch { /* corpo vazio é aceito */ }
  const preferences = String(body.preferences ?? "").trim().slice(0, 300);
  const mealsCount = [3, 4, 5, 6].includes(Number(body.meals)) ? Number(body.meals) : 5;

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "A IA ainda não foi ativada." }, 503);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: p } = await admin
    .from("profiles")
    .select("goal, daily_calories, daily_protein, daily_carbs, daily_fats, dietary_restrictions, gender, age")
    .eq("user_id", userId)
    .maybeSingle();
  if (!p?.daily_calories) return json({ error: "Complete seu perfil primeiro." }, 400);

  const { data: remaining, error: qErr } = await admin.rpc("consume_ai_quota", { _user_id: userId });
  if (qErr) return json({ error: "Não foi possível verificar seu limite. Tente de novo." }, 500);
  if (remaining === -1) return json({ error: "Você usou todos os usos de IA de hoje. Amanhã tem mais.", code: "QUOTA" }, 429);

  const goalTxt: Record<string, string> = {
    perda_de_peso: "emagrecer (priorize saciedade, fibras e proteína)",
    ganho_de_massa: "ganhar massa muscular",
    manutencao: "manter o peso",
    performance: "performance esportiva",
  };
  const restr = Array.isArray(p.dietary_restrictions) && p.dietary_restrictions.length ? p.dietary_restrictions.join(", ") : "nenhuma";
  const prompt = `Objetivo: ${goalTxt[p.goal ?? ""] ?? "saúde"}.
Meta diária: ${p.daily_calories} kcal, proteína ${Math.round(Number(p.daily_protein))} g, carboidratos ${Math.round(Number(p.daily_carbs))} g, gorduras ${Math.round(Number(p.daily_fats))} g.
Número de refeições: ${mealsCount}.
Restrições alimentares: ${restr}.
Preferências do usuário: ${preferences || "nenhuma"}.`;

  const refund = () => admin.rpc("refund_ai_quota", { _user_id: userId });
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 6000,
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!resp.ok) {
      console.error("Gemini error", resp.status, await resp.text());
      await refund();
      return json({ error: resp.status === 429 ? "A IA está ocupada agora. Tente em instantes." : "A IA não respondeu. Tente de novo." }, 502);
    }
    const data = await resp.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const r = JSON.parse(raw);
    const r1 = (n: unknown) => Math.round(Number(n || 0) * 10) / 10;
    const meals = (Array.isArray(r.meals) ? r.meals : []).slice(0, 6).map((m: any) => ({
      meal_type: MEAL_TYPES.includes(m.meal_type) ? m.meal_type : "almoco",
      name: String(m.name || "Refeição").slice(0, 80),
      items: (Array.isArray(m.items) ? m.items : []).slice(0, 12).map((i: any) => ({ name: String(i.name).slice(0, 80), quantity: String(i.quantity ?? "").slice(0, 60) })),
      prep: m.prep ? String(m.prep).slice(0, 300) : null,
      calories: Math.round(Number(m.calories || 0)),
      protein: r1(m.protein),
      carbs: r1(m.carbs),
      fats: r1(m.fats),
    }));
    if (!meals.length) throw new Error("cardápio vazio");
    const plan = {
      meals,
      shopping: (Array.isArray(r.shopping) ? r.shopping : []).slice(0, 40).map((i: any) => ({ name: String(i.name).slice(0, 120), quantity: String(i.quantity ?? "").slice(0, 60) })),
      tip: r.tip ? String(r.tip).slice(0, 200) : null,
      preferences: preferences || null,
      totals: meals.reduce((s: any, m: any) => ({ calories: s.calories + m.calories, protein: r1(s.protein + m.protein), carbs: r1(s.carbs + m.carbs), fats: r1(s.fats + m.fats) }), { calories: 0, protein: 0, carbs: 0, fats: 0 }),
    };
    const today = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // horário de Brasília
    await admin.from("meal_plans").upsert({ user_id: userId, date: today, plan }, { onConflict: "user_id,date" });
    return json({ plan, remaining });
  } catch (e) {
    console.error("plan-meals failure", e);
    await refund();
    return json({ error: "Não consegui montar o cardápio agora. Tente de novo." }, 500);
  }
});
