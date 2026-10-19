// Analisa uma refeição por texto ou foto e devolve a tabela nutricional.
// Regras de custo: só usuários logados; cada análise consome 1 uso do limite diário
// (gratuito: 3/dia, premium: 30/dia, configurável na tabela ai_limits).
// Se a IA falhar, o uso é devolvido.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // ~4 MB depois de comprimida no celular

const SCHEMA = {
  type: "OBJECT",
  properties: {
    meal_name: { type: "STRING", description: "Nome curto da refeição em pt-BR" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Alimento com a porção, ex: '2 ovos mexidos'" },
          grams: { type: "NUMBER" },
          calories: { type: "NUMBER" },
          protein: { type: "NUMBER" },
          carbs: { type: "NUMBER" },
          fats: { type: "NUMBER" },
        },
        required: ["name", "calories", "protein", "carbs", "fats"],
      },
    },
    calories: { type: "NUMBER" },
    protein: { type: "NUMBER" },
    carbs: { type: "NUMBER" },
    fats: { type: "NUMBER" },
    portion_size: { type: "STRING", description: "Resumo da porção total, ex: '≈ 350 g'" },
    note: { type: "STRING", description: "Uma frase curta: suposições feitas ou observação nutricional" },
    is_food: { type: "BOOLEAN", description: "false se a entrada não descreve comida" },
  },
  required: ["meal_name", "items", "calories", "protein", "carbs", "fats", "is_food"],
};

const SYSTEM = `Você é um nutricionista brasileiro. Estime a tabela nutricional da refeição informada.
- Use referências TACO (Tabela Brasileira de Composição de Alimentos) e USDA.
- Considere o preparo (fritura, molhos, óleo) quando aparecer.
- Se a quantidade não for informada, assuma uma porção padrão brasileira e diga isso em "note".
- Os totais (calories, protein, carbs, fats) devem ser a soma dos itens.
- Calorias em kcal; proteína, carboidratos e gorduras em gramas. Arredonde para 1 casa decimal.
- Se a entrada não for comida, retorne is_food=false com valores zerados.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  // 1) Quem está pedindo? Só usuários logados.
  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Faça login novamente." }, 401);
  const userId = userData.user.id;

  // 2) Valida a entrada antes de gastar qualquer coisa
  let body: { mode?: string; text?: string; imageBase64?: string; mimeType?: string; grams?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Pedido inválido." }, 400);
  }
  const mode = body.mode === "photo" ? "photo" : "text";
  const text = (body.text ?? "").trim().slice(0, 600);
  if (mode === "text" && text.length < 2) return json({ error: "Descreva o que você comeu." }, 400);
  if (mode === "photo") {
    if (!body.imageBase64) return json({ error: "Envie uma foto da refeição." }, 400);
    if (body.imageBase64.length * 0.75 > MAX_IMAGE_BYTES) return json({ error: "Foto muito grande. Tente de novo." }, 413);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "A análise por IA ainda não foi ativada. Use o registro manual por enquanto." }, 503);

  // 3) Consome 1 uso do limite diário (atômico no banco)
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: remaining, error: quotaErr } = await admin.rpc("consume_ai_quota", { _user_id: userId });
  if (quotaErr) return json({ error: "Não foi possível verificar seu limite. Tente de novo." }, 500);
  if (remaining === -1) {
    return json({ error: "Você usou todas as análises por IA de hoje. Amanhã tem mais — ou registre manualmente.", code: "QUOTA" }, 429);
  }

  // 4) Chama a IA
  const parts: unknown[] = [];
  if (mode === "photo") {
    const grams = Number(body.grams) > 0 ? Math.round(Number(body.grams)) : null;
    parts.push({
      text:
        (grams ? `O prato inteiro pesa cerca de ${grams} g. Calcule para esse peso total.` : "Peso não informado: estime pela imagem.") +
        (text ? `\nObservação do usuário: ${text}` : ""),
    });
    parts.push({ inline_data: { mime_type: body.mimeType || "image/jpeg", data: body.imageBase64 } });
  } else {
    parts.push({ text: `Refeição: ${text}` });
  }

  const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
        },
      }),
    });

    if (!resp.ok) {
      console.error("Gemini error", resp.status, await resp.text());
      await admin.rpc("refund_ai_quota", { _user_id: userId });
      if (resp.status === 429) return json({ error: "A IA está ocupada agora. Tente em instantes." }, 503);
      return json({ error: "A IA não respondeu. Tente de novo." }, 502);
    }

    const data = await resp.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const result = JSON.parse(raw);

    if (result.is_food === false) {
      await admin.rpc("refund_ai_quota", { _user_id: userId });
      return json({ error: "Não reconheci comida aí. Tente descrever de outro jeito." }, 422);
    }

    const r1 = (n: unknown) => Math.round(Number(n || 0) * 10) / 10;
    return json({
      meal_name: String(result.meal_name || "Refeição").slice(0, 80),
      items: Array.isArray(result.items) ? result.items.slice(0, 20) : [],
      calories: Math.round(Number(result.calories || 0)),
      protein: r1(result.protein),
      carbs: r1(result.carbs),
      fats: r1(result.fats),
      portion_size: result.portion_size ?? null,
      note: result.note ?? null,
      remaining,
    });
  } catch (e) {
    console.error("analyze-meal failure", e);
    await admin.rpc("refund_ai_quota", { _user_id: userId });
    return json({ error: "Não consegui analisar agora. Tente de novo." }, 500);
  }
});
