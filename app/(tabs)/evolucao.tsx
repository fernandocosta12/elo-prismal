// Painel de evolução: consistência, peso, calorias, água e treinos ao longo do tempo.
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/dates";
import { getWaterGoalMl } from "@/lib/nutrition";
import { getLevel } from "@/lib/levels";
import { Card, Muted, Section, Title } from "@/components/ui";
import { colors, radius, space, type } from "@/theme";

type Period = 7 | 30;
type DayVal = { date: string; value: number };

function lastDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(toISODate(d));
  }
  return out;
}

const dayLabel = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return n <= 7 ? date.toLocaleDateString("pt-BR", { weekday: "narrow" }).toUpperCase() : String(d);
};

export default function Evolucao() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const [period, setPeriod] = useState<Period>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<{
    days: string[];
    calories: DayVal[];
    water: DayVal[];
    weight: DayVal[];
    happy: Record<string, number>;
    happyTotal: number;
    streak: number;
    workouts: number;
    runKm: number;
  } | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const days = lastDays(period);
    const from = days[0];
    const fromTs = new Date(`${from}T00:00:00`).toISOString();
    const heat = lastDays(35);

    const [meals, water, weight, happy, allHappy, workouts, runs, streak] = await Promise.all([
      supabase.from("meal_logs").select("calories, meal_time").eq("user_id", userId).gte("meal_time", fromTs),
      supabase.from("water_logs").select("amount_ml, date").eq("user_id", userId).gte("date", from),
      supabase.from("weight_logs").select("weight, date").eq("user_id", userId).gte("date", lastDays(90)[0]).order("date"),
      supabase.from("happy_logs").select("date, workout_done, nutrition_done, water_done").eq("user_id", userId).gte("date", heat[0]),
      supabase.from("happy_logs").select("date", { count: "exact", head: true }).eq("user_id", userId).or("workout_done.eq.true,nutrition_done.eq.true,water_done.eq.true"),
      supabase.from("workouts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("completed", true).gte("scheduled_date", from),
      supabase.from("run_logs").select("distance_km").eq("user_id", userId).gte("date", from),
      supabase.rpc("get_happy_streak", { _user_id: userId }),
    ]);

    const sumBy = (rows: any[] | null, key: (r: any) => string, val: (r: any) => number) => {
      const m: Record<string, number> = {};
      for (const r of rows ?? []) m[key(r)] = (m[key(r)] ?? 0) + val(r);
      return m;
    };
    const calMap = sumBy(meals.data, (r) => toISODate(new Date(r.meal_time)), (r) => Number(r.calories));
    const waterMap = sumBy(water.data, (r) => r.date, (r) => Number(r.amount_ml));
    const happyMap: Record<string, number> = {};
    for (const h of happy.data ?? []) happyMap[h.date] = Number(h.workout_done) + Number(h.nutrition_done) + Number(h.water_done);

    setData({
      days,
      calories: days.map((d) => ({ date: d, value: calMap[d] ?? 0 })),
      water: days.map((d) => ({ date: d, value: waterMap[d] ?? 0 })),
      weight: (weight.data ?? []).map((w: any) => ({ date: w.date, value: Number(w.weight) })),
      happy: happyMap,
      happyTotal: allHappy.count ?? 0,
      streak: typeof streak.data === "number" ? streak.data : 0,
      workouts: workouts.count ?? 0,
      runKm: (runs.data ?? []).reduce((s: number, r: any) => s + Number(r.distance_km), 0),
    });
    setLoading(false);
  }, [userId, period]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!profile) return null;
  const goalKcal = profile.daily_calories ?? 2000;
  const waterGoal = getWaterGoalMl(profile.weight);

  const avg = (arr: DayVal[]) => {
    const withData = arr.filter((d) => d.value > 0);
    return withData.length ? withData.reduce((s, d) => s + d.value, 0) / withData.length : 0;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: space.xxl * 2 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Title>Evolução</Title>
          <View style={{ flexDirection: "row", backgroundColor: colors.card, borderRadius: radius.pill, padding: 3 }}>
            {([7, 30] as Period[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: period === p ? colors.input : "transparent" }}
                accessibilityRole="button"
                accessibilityState={{ selected: period === p }}
              >
                <Text style={{ color: period === p ? colors.text : colors.muted, fontWeight: "600", fontSize: 13 }}>{p} dias</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loading || !data ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            {/* Números principais */}
            <View style={{ flexDirection: "row", gap: space.sm }}>
              <Stat value={`${data.streak}`} label="dias seguidos" />
              <Stat value={`${data.workouts}`} label="treinos" />
              <Stat value={`${data.runKm.toFixed(1)}`} label="km corridos" />
            </View>

            {/* Consistência */}
            <Section right={<Text style={{ color: getLevel(data.happyTotal).color, fontWeight: "600", fontSize: 13 }}>{getLevel(data.happyTotal).name}</Text>}>
              Consistência · 5 semanas
            </Section>
            <Card>
              <Heatmap map={data.happy} />
              <View style={{ flexDirection: "row", gap: space.lg, marginTop: space.md }}>
                {[0, 1, 2, 3].map((n) => (
                  <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: heatColor(n) }} />
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{n === 0 ? "nada" : `${n}/3`}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Peso */}
            <Section>Peso · 90 dias</Section>
            <Card style={{ gap: space.md }}>
              {data.weight.length < 2 ? (
                <Muted>Registre seu peso na tela Início por alguns dias para ver a evolução aqui.</Muted>
              ) : (
                <>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
                    <Text style={[type.big, { color: colors.text }]}>{data.weight[data.weight.length - 1].value.toFixed(1)}</Text>
                    <Muted>kg</Muted>
                    <WeightDelta first={data.weight[0].value} last={data.weight[data.weight.length - 1].value} />
                  </View>
                  <Bars values={data.weight.map((w) => w.value)} color={colors.text} relative />
                </>
              )}
            </Card>

            {/* Calorias */}
            <Section>Calorias</Section>
            <Card style={{ gap: space.md }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
                <Text style={[type.big, { color: colors.text }]}>{Math.round(avg(data.calories))}</Text>
                <Muted>kcal/dia em média · meta {goalKcal}</Muted>
              </View>
              <Bars values={data.calories.map((d) => d.value)} labels={data.days.map((d) => dayLabel(d, period))} goal={goalKcal} color={colors.primary} />
            </Card>

            {/* Água */}
            <Section>Água</Section>
            <Card style={{ gap: space.md }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
                <Text style={[type.big, { color: colors.text }]}>{(avg(data.water) / 1000).toFixed(1)}</Text>
                <Muted>L/dia em média · meta {(waterGoal / 1000).toFixed(1)} L</Muted>
              </View>
              <Bars values={data.water.map((d) => d.value)} labels={data.days.map((d) => dayLabel(d, period))} goal={waterGoal} color={colors.water} />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: space.lg }}>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700", letterSpacing: -0.6 }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function WeightDelta({ first, last }: { first: number; last: number }) {
  const d = last - first;
  if (Math.abs(d) < 0.05) return <Muted>estável</Muted>;
  return (
    <Text style={{ color: colors.muted, fontSize: 14 }}>
      {d > 0 ? "+" : "−"}
      {Math.abs(d).toFixed(1)} kg no período
    </Text>
  );
}

// Gráfico de barras simples. "goal" desenha uma linha de meta; "relative" usa a faixa min–max (bom para peso).
function Bars({ values, labels, goal, color, relative }: { values: number[]; labels?: string[]; goal?: number; color: string; relative?: boolean }) {
  const H = 110;
  const max = Math.max(...values, goal ?? 0, 1);
  const min = relative ? Math.min(...values) : 0;
  const range = relative ? Math.max(max - min, 0.5) : max;
  const h = (v: number) => (relative ? 12 + ((v - min) / range) * (H - 12) : (v / range) * H);
  const showLabels = labels && labels.length <= 31;
  return (
    <View>
      <View style={{ height: H, flexDirection: "row", alignItems: "flex-end", gap: values.length > 14 ? 2 : 6 }}>
        {goal !== undefined && (
          <View style={{ position: "absolute", left: 0, right: 0, bottom: (goal / range) * H, height: 1, backgroundColor: colors.faint }} />
        )}
        {values.map((v, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: v > 0 ? Math.max(3, h(v)) : 3,
              borderRadius: 3,
              backgroundColor: v > 0 ? color : colors.input,
              opacity: goal !== undefined && v > goal * 1.1 ? 0.55 : 1,
            }}
          />
        ))}
      </View>
      {showLabels && (
        <View style={{ flexDirection: "row", gap: values.length > 14 ? 2 : 6, marginTop: 6 }}>
          {labels!.map((l, i) => (
            <Text key={i} style={{ flex: 1, textAlign: "center", color: colors.faint, fontSize: 10 }}>
              {values.length > 14 && i % 5 !== 0 ? "" : l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const heatColor = (n: number) => (n <= 0 ? colors.input : n === 1 ? "rgba(230,195,92,0.3)" : n === 2 ? "rgba(230,195,92,0.6)" : colors.primary);

// 5 semanas em colunas (seg → dom), como um calendário de hábitos
function Heatmap({ map }: { map: Record<string, number> }) {
  const days = lastDays(35);
  const weeks: string[][] = [];
  for (let i = 0; i < 5; i++) weeks.push(days.slice(i * 7, i * 7 + 7));
  return (
    <View style={{ gap: 6 }}>
      {weeks.map((w, wi) => (
        <View key={wi} style={{ flexDirection: "row", gap: 6 }}>
          {w.map((d) => (
            <View key={d} style={{ flex: 1, aspectRatio: 1, borderRadius: 6, backgroundColor: heatColor(map[d] ?? 0) }} accessibilityLabel={`${d}: ${map[d] ?? 0} de 3`} />
          ))}
        </View>
      ))}
    </View>
  );
}
