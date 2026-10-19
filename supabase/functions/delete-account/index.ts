// Exclui a conta do usuário logado e TODOS os dados dele (exigência da App Store e da LGPD).
// Só o próprio usuário consegue excluir a própria conta.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Tabelas com dados do usuário e a coluna que aponta para ele
const USER_TABLES: [string, string][] = [
  ["post_likes", "user_id"],
  ["post_comments", "user_id"],
  ["posts", "user_id"],
  ["follows", "follower_id"],
  ["follows", "following_id"],
  ["club_invites", "invitee_id"],
  ["club_invites", "inviter_id"],
  ["club_join_requests", "user_id"],
  ["club_members", "user_id"],
  ["clubs", "owner_id"],
  ["notifications", "user_id"],
  ["achievements", "user_id"],
  ["happy_logs", "user_id"],
  ["meal_logs", "user_id"],
  ["water_logs", "user_id"],
  ["weight_logs", "user_id"],
  ["run_logs", "user_id"],
  ["fasting_sessions", "user_id"],
  ["workouts", "user_id"],
  ["workout_plans", "user_id"],
  ["ai_usage", "user_id"],
  ["body_measurements", "user_id"],
  ["shopping_items", "user_id"],
  ["meal_plans", "user_id"],
  ["whatsapp_links", "user_id"],
  ["whatsapp_link_codes", "user_id"],
  ["profiles", "user_id"],
];

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

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // 1) Arquivos (foto de perfil e fotos de posts ficam numa pasta com o id do usuário)
  for (const bucket of ["avatars", "posts"]) {
    const { data: files } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
    if (files?.length) {
      await admin.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
    }
  }

  // 2) Dados nas tabelas
  for (const [table, col] of USER_TABLES) {
    const { error } = await admin.from(table).delete().eq(col, userId);
    if (error) {
      console.error("delete-account", table, error.message);
      return json({ error: "Não foi possível excluir todos os dados. Tente de novo." }, 500);
    }
  }

  // 3) Login
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    console.error("delete-account auth", delErr.message);
    return json({ error: "Não foi possível excluir a conta. Tente de novo." }, 500);
  }

  return json({ ok: true });
});
