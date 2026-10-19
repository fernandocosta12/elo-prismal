// Robô do Ritmo no WhatsApp (WhatsApp Cloud API da Meta).
// O usuário vincula o número pelo app ("VINCULAR CÓDIGO") e depois pode mandar:
//   • foto do prato            → registra a refeição (usa 1 análise de IA do limite diário)
//   • texto ou áudio do que comeu → idem
//   • "água 500" / "bebi 300ml"  → registra água
//   • "peso 82,5"                → registra o peso de hoje
//   • "resumo"                   → como está o dia
//   • "desfazer"                 → apaga a última refeição registrada
// Segurança: só aceita chamadas assinadas pela Meta (X-Hub-Signature-256).
// Custo: só responde a mensagens recebidas (janela de atendimento), nunca envia propaganda.
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k) ?? "";
const GRAPH = `https://graph.facebook.com/${env("WHATSAPP_GRAPH_VERSION") || "v23.0"}`;
const admin: SupabaseClient = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

// ---------- utilidades ----------
const BR_OFFSET = 3 * 3600 * 1000; // Brasília (sem horário de verão)
const todayBR = () => new Date(Date.now() - BR_OFFSET).toISOString().slice(0, 10);
const hourBR = () => new Date(Date.now() - BR_OFFSET).getUTCHours() + new Date(Date.now() - BR_OFFSET).getUTCMinutes() / 60;
const dayStartUTC = (d: string) => `${d}T03:00:00Z`;
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
const num = (s: string) => Number(s.replace(",", "."));

function mealTypeNow() {
  const h = hourBR();
  if (h < 10) return "cafe_da_manha";
  if (h < 11.5) return "lanche_manha";
  if (h < 15) return "almoco";
  if (h < 18.5) return "lanche_tarde";
  if (h < 22) return "jantar";
  return "ceia";
}
const MEAL_LABEL: Record<string, string> = {
  cafe_da_manha: "Café da manhã", lanche_manha: "Lanche da manhã", almoco: "Almoço",
  lanche_tarde: "Lanche da tarde", jantar: "Jantar", ceia: "Ceia",
};

async function hmacOk(raw: string, header: string | null) {
  const secret = env("WHATSAPP_APP_SECRET");
  if (!secret || !header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
  const given = header.slice(7);
  if (given.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

// ---------- WhatsApp ----------
async function send(to: string, body: string) {
  const r = await fetch(`${GRAPH}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: body.slice(0, 4000), preview_url: false } }),
  });
  if (!r.ok) console.error("send error", r.status, await r.text());
}

async function downloadMedia(id: string): Promise<{ b64: string; mime: string; bytes: number }> {
  const auth = { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}` };
  const meta = await fetch(`${GRAPH}/${id}`, { headers: auth }).then((r) => r.json());
  if (!meta?.url) throw new Error("media sem url");
  const res = await fetch(meta.url, { headers: auth });
  if (!res.ok) throw new Error(`media ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { b64: btoa(bin), mime: String(meta.mime_type || "application/octet-stream").split(";")[0], bytes: buf.length };
}

// ---------- IA (Gemini) ----------
const MEAL_SCHEMA = {
  type: "OBJECT",
  properties: {
    meal_name: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, calories: { type: "NUMBER" } },
        required: ["name", "calories"],
      },
    },
    calories: { type: "NUMBER" },
    protein: { type: "NUMBER" },
    carbs: { type: "NUMBER" },
    fats: { type: "NUMBER" },
    portion_size: { type: "STRING" },
    note: { type: "STRING" },
    is_food: { type: "BOOLEAN" },
  },
  required: ["meal_name", "items", "calories", "protein", "carbs", "fats", "is_food"],
};
const MEAL_SYSTEM = `Você é um nutricionista brasileiro. Estime a tabela nutricional da refeição informada.
- Use referências TACO e USDA. Considere o preparo (fritura, molhos, óleo).
- Se a quantidade não for informada, assuma uma porção padrão brasileira e diga isso em "note" (uma frase curta).
- Os totais devem ser a soma dos itens. Calorias em kcal; macros em gramas com 1 casa decimal.
- Se a entrada não for comida, retorne is_food=false com valores zerados.`;

async function gemini(parts: unknown[], opts: { system?: string; schema?: unknown; maxTokens?: number }) {
  const model = env("GEMINI_MODEL") || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env("GEMINI_API_KEY") },
    body: JSON.stringify({
      ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: opts.maxTokens ?? 1200,
        thinkingConfig: { thinkingBudget: 0 },
        ...(opts.schema ? { responseMimeType: "application/json", responseSchema: opts.schema } : {}),
      },
    }),
  });
  if (!r.ok) throw new Error(`gemini ${r.status}: ${await r.text()}`);
  const d = await r.json();
  return String(d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
}

async function transcribe(b64: string, mime: string) {
  const t = await gemini(
    [{ text: "Transcreva este áudio em português do Brasil. Responda só com a transcrição, sem comentários." }, { inline_data: { mime_type: mime, data: b64 } }],
    { maxTokens: 400 },
  );
  return t.trim().slice(0, 600);
}

// ---------- dados do usuário ----------
type Profile = { user_id: string; full_name: string | null; weight: number | null; daily_calories: number | null; daily_protein: number | null };

async function dayTotals(userId: string) {
  const d = todayBR();
  const [meals, water, happy] = await Promise.all([
    admin.from("meal_logs").select("calories, protein").eq("user_id", userId).gte("meal_time", dayStartUTC(d)),
    admin.from("water_logs").select("amount_ml").eq("user_id", userId).eq("date", d),
    admin.from("happy_logs").select("workout_done, nutrition_done, water_done").eq("user_id", userId).eq("date", d).maybeSingle(),
  ]);
  return {
    kcal: (meals.data ?? []).reduce((s, m) => s + Number(m.calories), 0),
    protein: (meals.data ?? []).reduce((s, m) => s + Number(m.protein), 0),
    water: (water.data ?? []).reduce((s, w) => s + Number(w.amount_ml), 0),
    workout: !!happy.data?.workout_done,
    goals: Number(!!happy.data?.workout_done) + Number(!!happy.data?.nutrition_done) + Number(!!happy.data?.water_done),
  };
}
const waterGoal = (p: Profile) => (p.weight ? Math.ceil(Number(p.weight) * 35) : 2000);

// ---------- respostas ----------
const HELP = `*Ritmo no WhatsApp* 💪

📸 *Foto do prato* → registro a refeição
✍️ *Texto ou áudio* do que comeu → ex: "2 ovos, 1 pão e café com leite"
💧 *água 500* → registra 500 ml
⚖️ *peso 82,5* → registra seu peso de hoje
📊 *resumo* → como está seu dia
↩️ *desfazer* → apaga a última refeição

As fotos e descrições usam suas análises de IA do dia.`;

async function handleLink(from: string, code: string) {
  const { data: row } = await admin.from("whatsapp_link_codes").select("user_id, expires_at").eq("code", code.toUpperCase()).maybeSingle();
  if (!row || new Date(row.expires_at) < new Date()) {
    return send(from, "Código inválido ou expirado. Gere um novo no app: *Perfil → WhatsApp*.");
  }
  await admin.from("whatsapp_links").delete().or(`user_id.eq.${row.user_id},phone.eq.${from}`);
  const { error } = await admin.from("whatsapp_links").insert({ user_id: row.user_id, phone: from });
  await admin.from("whatsapp_link_codes").delete().eq("code", code.toUpperCase());
  if (error) {
    console.error("link", error.message);
    return send(from, "Não consegui vincular agora. Tente de novo em instantes.");
  }
  const { data: p } = await admin.from("profiles").select("full_name").eq("user_id", row.user_id).maybeSingle();
  const first = (p?.full_name ?? "").split(" ")[0];
  await send(from, `Pronto${first ? `, ${first}` : ""}! ✅ Seu WhatsApp está ligado ao Ritmo.\n\n${HELP}`);
}

async function summary(from: string, p: Profile) {
  const t = await dayTotals(p.user_id);
  const goal = p.daily_calories ?? 2000;
  const wg = waterGoal(p);
  const left = goal - t.kcal;
  await send(
    from,
    `📊 *Seu dia*\n\n🍽️ ${fmt(t.kcal)} de ${fmt(goal)} kcal${left > 0 ? ` (faltam ${fmt(left)})` : ` (passou ${fmt(-left)})`}\n🥩 Proteína: ${fmt(t.protein)} de ${fmt(p.daily_protein ?? 0)} g\n💧 Água: ${(t.water / 1000).toFixed(1).replace(".", ",")} de ${(wg / 1000).toFixed(1).replace(".", ",")} L\n🏋️ Treino: ${t.workout ? "feito ✅" : "ainda não"}\n\nMetas do dia: ${t.goals}/3`,
  );
}

async function logWater(from: string, p: Profile, ml: number) {
  if (!(ml >= 50 && ml <= 3000)) return send(from, "Me diga a quantidade em ml, entre 50 e 3000. Ex: *água 500*");
  const { error } = await admin.from("water_logs").insert({ user_id: p.user_id, amount_ml: Math.round(ml), date: todayBR() });
  if (error) return send(from, "Não consegui registrar a água agora. Tente de novo.");
  const t = await dayTotals(p.user_id);
  const wg = waterGoal(p);
  const msg = t.water >= wg ? "Meta de água batida! 🎉" : `Faltam ${fmt(wg - t.water)} ml para a meta.`;
  await send(from, `💧 +${fmt(ml)} ml registrados. Hoje: ${fmt(t.water)} de ${fmt(wg)} ml.\n${msg}`);
}

async function logWeight(from: string, p: Profile, kg: number) {
  if (!(kg >= 25 && kg <= 350)) return send(from, "Peso fora do esperado. Ex: *peso 82,5*");
  const { error } = await admin.from("weight_logs").upsert({ user_id: p.user_id, weight: kg, date: todayBR() }, { onConflict: "user_id,date" });
  if (error) return send(from, "Não consegui registrar o peso agora. Tente de novo.");
  await admin.from("profiles").update({ weight: kg }).eq("user_id", p.user_id);
  const diff = p.weight ? kg - Number(p.weight) : 0;
  const trend = p.weight && Math.abs(diff) >= 0.1 ? ` (${diff > 0 ? "+" : ""}${diff.toFixed(1).replace(".", ",")} kg desde o último registro)` : "";
  await send(from, `⚖️ Peso de hoje: *${kg.toString().replace(".", ",")} kg*${trend}.`);
}

async function undoMeal(from: string, p: Profile) {
  const since = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
  const { data } = await admin.from("meal_logs").select("id, meal_name, calories").eq("user_id", p.user_id).gte("created_at", since).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return send(from, "Não achei nenhuma refeição registrada nas últimas horas.");
  await admin.from("meal_logs").delete().eq("id", data.id);
  await send(from, `↩️ Apaguei: ${data.meal_name} (${data.calories} kcal).`);
}

async function logMeal(from: string, p: Profile, input: { text?: string; image?: { b64: string; mime: string } }) {
  if (!env("GEMINI_API_KEY")) return send(from, "A análise por IA ainda não está ativa.");
  const { data: remaining, error: qErr } = await admin.rpc("consume_ai_quota", { _user_id: p.user_id });
  if (qErr) return send(from, "Não consegui verificar seu limite agora. Tente de novo.");
  if (remaining === -1) {
    return send(from, "Você já usou todas as análises por IA de hoje. 😕 Amanhã renova — ou registre manualmente no app.");
  }
  try {
    const parts: unknown[] = [];
    if (input.image) {
      parts.push({ text: `Foto da refeição.${input.text ? ` Observação do usuário: ${input.text}` : " Estime pela imagem."}` });
      parts.push({ inline_data: { mime_type: input.image.mime, data: input.image.b64 } });
    } else {
      parts.push({ text: `Refeição: ${input.text}` });
    }
    const r = JSON.parse(await gemini(parts, { system: MEAL_SYSTEM, schema: MEAL_SCHEMA }));
    if (r.is_food === false) {
      await admin.rpc("refund_ai_quota", { _user_id: p.user_id });
      return send(from, input.image ? "Não reconheci comida nessa foto. 🤔 Tente outra foto ou descreva o prato." : `Não entendi como refeição. Mande *ajuda* para ver o que eu faço.`);
    }
    const r1 = (n: unknown) => Math.round(Number(n || 0) * 10) / 10;
    const type = mealTypeNow();
    const row = {
      user_id: p.user_id,
      meal_name: String(r.meal_name || "Refeição").slice(0, 80),
      meal_type: type,
      calories: Math.round(Number(r.calories || 0)),
      protein: r1(r.protein),
      carbs: r1(r.carbs),
      fats: r1(r.fats),
      portion_size: r.portion_size ? String(r.portion_size).slice(0, 40) : "via WhatsApp",
      meal_time: new Date().toISOString(),
    };
    const { error } = await admin.from("meal_logs").insert(row);
    if (error) throw new Error(error.message);
    const t = await dayTotals(p.user_id);
    const goal = p.daily_calories ?? 2000;
    const items = (Array.isArray(r.items) ? r.items : []).slice(0, 8).map((i: any) => `• ${i.name} — ${fmt(Number(i.calories))} kcal`).join("\n");
    await send(
      from,
      `✅ *${row.meal_name}* (${MEAL_LABEL[type]})\n\n${items}\n\n*${fmt(row.calories)} kcal* · P ${fmt(row.protein)}g · C ${fmt(row.carbs)}g · G ${fmt(row.fats)}g${r.note ? `\n_${String(r.note).slice(0, 160)}_` : ""}\n\nHoje: ${fmt(t.kcal)} de ${fmt(goal)} kcal · ${remaining} análise${remaining === 1 ? "" : "s"} de IA restante${remaining === 1 ? "" : "s"}.\nErrou? Mande *desfazer*.`,
    );
  } catch (e) {
    console.error("logMeal", e);
    await admin.rpc("refund_ai_quota", { _user_id: p.user_id });
    await send(from, "Não consegui analisar agora. Tente de novo em instantes. 🙏");
  }
}

// ---------- roteador ----------
async function route(from: string, p: Profile, text: string) {
  const t = text.trim();
  const low = t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/^(oi|ola|ajuda|menu|help|comandos|\?)\W*$/.test(low)) return send(from, HELP);
  if (/^(resumo|hoje|status|meu dia)\W*$/.test(low)) return summary(from, p);
  if (/^(desfazer|apagar|cancelar)( ultima)?\W*$/.test(low)) return undoMeal(from, p);

  const w = low.match(/^(?:peso|pesei|pesando)\s*:?\s*(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|quilos?)?\W*$/);
  if (w) return logWeight(from, p, num(w[1]));

  const a =
    low.match(/^(?:bebi\s+)?(?:agua|copo d.?agua)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(ml|l|litros?)?\W*$/) ??
    low.match(/^(?:bebi\s+)?(\d+(?:[.,]\d+)?)\s*(ml|l|litros?)\s*(?:de\s+)?(?:agua)?\W*$/);
  if (a) {
    let ml = num(a[1]);
    if ((a[2] && a[2].startsWith("l")) || ml < 10) ml = ml * 1000;
    return logWater(from, p, ml);
  }

  if (low.length < 3) return send(from, HELP);
  return logMeal(from, p, { text: t.slice(0, 600) });
}

async function processMessage(msg: any) {
  const from = String(msg.from ?? "");
  if (!/^[0-9]{8,15}$/.test(from)) return;

  // Ignora repetidas (a Meta reenvia se demorar)
  const { error: dup } = await admin.from("whatsapp_messages").insert({ wa_id: msg.id, phone: from });
  if (dup) return;

  const text: string = msg.text?.body ?? msg.image?.caption ?? "";
  const link = text.trim().match(/^vincular\s+([a-z0-9]{6})\b/i);
  if (link) return handleLink(from, link[1]);

  const { data: l } = await admin.from("whatsapp_links").select("user_id").eq("phone", from).maybeSingle();
  if (!l) {
    return send(from, "Olá! 👋 Eu sou o assistente do *Ritmo*.\n\nPara usar por aqui, abra o app em *Perfil → WhatsApp*, toque em *Gerar código* e me mande a mensagem que aparecer (ex: VINCULAR AB12CD).");
  }
  const { data: p } = await admin.from("profiles").select("user_id, full_name, weight, daily_calories, daily_protein").eq("user_id", l.user_id).maybeSingle();
  if (!p) return send(from, "Termine seu cadastro no app primeiro. 🙂");

  try {
    if (msg.type === "text") return route(from, p as Profile, text);
    if (msg.type === "image") {
      const img = await downloadMedia(msg.image.id);
      if (img.bytes > 8 * 1024 * 1024) return send(from, "Foto muito grande. Tente outra. 🙏");
      return logMeal(from, p as Profile, { text: text || undefined, image: { b64: img.b64, mime: img.mime } });
    }
    if (msg.type === "audio") {
      const au = await downloadMedia(msg.audio.id);
      if (au.bytes > 4 * 1024 * 1024) return send(from, "Áudio muito longo. Mande um áudio curto (até 1 minuto).");
      const said = await transcribe(au.b64, au.mime);
      if (!said) return send(from, "Não consegui entender o áudio. Pode repetir ou escrever?");
      await send(from, `🎙️ Entendi: "${said}"`);
      return route(from, p as Profile, said);
    }
    return send(from, "Por enquanto eu entendo texto, foto e áudio. Mande *ajuda* para ver os comandos.");
  } catch (e) {
    console.error("processMessage", e);
    await send(from, "Tive um problema aqui. Tente de novo em instantes. 🙏");
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Verificação do webhook (feita uma vez pela Meta ao configurar)
  if (req.method === "GET") {
    const ok = url.searchParams.get("hub.mode") === "subscribe" && env("WHATSAPP_VERIFY_TOKEN") && url.searchParams.get("hub.verify_token") === env("WHATSAPP_VERIFY_TOKEN");
    return ok ? new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 }) : new Response("forbidden", { status: 403 });
  }
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const raw = await req.text();
  if (!(await hmacOk(raw, req.headers.get("x-hub-signature-256")))) return new Response("invalid signature", { status: 401 });

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const messages: any[] = [];
  for (const entry of body?.entry ?? []) for (const ch of entry?.changes ?? []) for (const m of ch?.value?.messages ?? []) messages.push(m);

  // Responde 200 na hora e processa em segundo plano (a Meta exige resposta rápida)
  const work = Promise.all(messages.map((m) => processMessage(m).catch((e) => console.error("msg", e))));
  // @ts-ignore EdgeRuntime existe no Supabase
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);
  else await work;
  return new Response("ok", { status: 200 });
});
