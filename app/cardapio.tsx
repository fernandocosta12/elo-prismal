// Cardápio do dia montado pela IA dentro das suas metas, com lista de compras.
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getQuota, mealTypeLabel, type QuotaStatus } from "@/lib/meals";
import { addShopping, generatePlan, getTodayPlan, type MealPlan, type PlanMeal } from "@/lib/plan";
import { Screen } from "@/components/Screen";
import { Button, Card, Choice, Muted, Section, styles as ui } from "@/components/ui";
import { colors, space } from "@/theme";

export default function Cardapio() {
  const { session, profile } = useAuth();
  const router = useRouter();
  const userId = session?.user.id;
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState("");
  const [count, setCount] = useState("5");
  const [logged, setLogged] = useState<Record<number, boolean>>({});
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [p, q] = await Promise.all([getTodayPlan(userId), getQuota()]);
    setPlan(p);
    setQuota(q);
    if (p?.preferences) setPrefs(p.preferences);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const noQuota = quota !== null && quota.remaining <= 0;

  const generate = async () => {
    setBusy(true);
    try {
      const p = await generatePlan(prefs, Number(count));
      setPlan(p);
      setLogged({});
      setShowForm(false);
      setQuota(await getQuota());
    } catch (e: any) {
      Alert.alert("Não deu certo", e.message);
    } finally {
      setBusy(false);
    }
  };

  const logMeal = async (m: PlanMeal, i: number) => {
    if (!userId) return;
    const { error } = await supabase.from("meal_logs").insert({
      user_id: userId,
      meal_name: m.name,
      meal_type: m.meal_type,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fats: m.fats,
      portion_size: "Cardápio do dia",
      meal_time: new Date().toISOString(),
    });
    if (error) return Alert.alert("Não foi possível registrar", error.message);
    setLogged({ ...logged, [i]: true });
  };

  const toShopping = async () => {
    if (!userId || !plan) return;
    try {
      await addShopping(userId, plan.shopping);
      Alert.alert("Lista de mercado", `${plan.shopping.length} itens adicionados.`, [
        { text: "Ok" },
        { text: "Ver lista", onPress: () => router.push("/mercado") },
      ]);
    } catch (e: any) {
      Alert.alert("Não deu certo", e.message);
    }
  };

  if (!profile) return null;

  const form = (
    <Card style={{ gap: space.md }}>
      <Text style={{ color: colors.text, fontWeight: "600" }}>Do que você gosta?</Text>
      <TextInput
        value={prefs}
        onChangeText={setPrefs}
        multiline
        maxLength={300}
        placeholder="Ex: sem lactose, não gosto de peixe, café da manhã rápido, marmita para o almoço"
        placeholderTextColor={colors.faint}
        style={[ui.input, { minHeight: 80, textAlignVertical: "top" }]}
      />
      <Choice label="Refeições no dia" value={count} onChange={setCount} options={["3", "4", "5", "6"].map((v) => ({ value: v, label: v }))} />
      {noQuota ? (
        <Muted>Você já usou os {quota?.limit} usos de IA de hoje. Amanhã renova.</Muted>
      ) : (
        <>
          <Button title={plan ? "Gerar outro cardápio" : "Montar meu cardápio"} onPress={generate} loading={busy} />
          {quota && <Muted style={{ fontSize: 12, textAlign: "center" }}>Usa 1 dos {quota.remaining} usos de IA restantes hoje.</Muted>}
        </>
      )}
      {busy && <Muted style={{ fontSize: 12, textAlign: "center" }}>Montando… leva uns 10 segundos.</Muted>}
    </Card>
  );

  return (
    <Screen title="Cardápio do dia" subtitle={`Montado para a sua meta de ${profile.daily_calories} kcal.`}>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : !plan ? (
        form
      ) : (
        <>
          <Card style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <Text style={{ color: colors.text, fontSize: 30, fontWeight: "800" }}>{plan.totals.calories}</Text>
              <Muted>kcal no dia</Muted>
            </View>
            <Muted style={{ fontSize: 13 }}>
              Proteína {Math.round(plan.totals.protein)} g · Carbo {Math.round(plan.totals.carbs)} g · Gordura {Math.round(plan.totals.fats)} g
            </Muted>
            {plan.tip ? <Text style={{ color: colors.text, marginTop: 4 }}>💡 {plan.tip}</Text> : null}
          </Card>

          {plan.meals.map((m, i) => (
            <Card key={i} style={{ gap: space.sm }}>
              <Muted style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: "700" }}>{mealTypeLabel(m.meal_type)}</Muted>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", flex: 1 }}>{m.name}</Text>
                <Text style={{ color: colors.primary, fontWeight: "800" }}>{m.calories} kcal</Text>
              </View>
              {m.items.map((it, j) => (
                <Text key={j} style={{ color: colors.text }}>
                  • {it.name} <Text style={{ color: colors.muted }}>— {it.quantity}</Text>
                </Text>
              ))}
              {m.prep ? <Muted style={{ fontSize: 13 }}>{m.prep}</Muted> : null}
              <Muted style={{ fontSize: 12 }}>
                P {Math.round(m.protein)}g · C {Math.round(m.carbs)}g · G {Math.round(m.fats)}g
              </Muted>
              <Button
                title={logged[i] ? "Registrado ✓" : "Comi isso"}
                variant="soft"
                disabled={logged[i]}
                onPress={() => logMeal(m, i)}
              />
            </Card>
          ))}

          {plan.shopping.length > 0 && (
            <Button title={`Adicionar ${plan.shopping.length} ingredientes à lista de mercado`} variant="outline" onPress={toShopping} />
          )}

          <Section>Quer outro?</Section>
          {showForm ? form : <Button title="Gerar outro cardápio" variant="ghost" onPress={() => setShowForm(true)} />}
          <Muted style={{ fontSize: 12, textAlign: "center" }}>
            Sugestão gerada por IA com base nas suas metas. Não substitui um nutricionista.
          </Muted>
        </>
      )}
    </Screen>
  );
}
