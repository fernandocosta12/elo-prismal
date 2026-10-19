import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { calcMacros, getWaterGoalMl } from "@/lib/nutrition";
import { Button, Card, Choice, Field, Muted, Stepper, Title } from "@/components/ui";
import { colors, radius, space } from "@/theme";

const ACTIVITY = [
  { value: "sedentario", label: "Sedentário" },
  { value: "leve", label: "Leve · 1-3x/sem" },
  { value: "moderado", label: "Moderado · 3-5x/sem" },
  { value: "intenso", label: "Intenso · 6-7x/sem" },
  { value: "muito_intenso", label: "Atleta · 2x/dia" },
];
const GOALS = [
  { value: "perda_de_peso", label: "Emagrecer" },
  { value: "ganho_de_massa", label: "Ficar forte" },
  { value: "manutencao", label: "Manter" },
  { value: "performance", label: "Performance" },
];
const SPORTS = [
  { value: "musculacao", label: "🏋️ Musculação" },
  { value: "corrida", label: "🏃 Corrida" },
  { value: "luta", label: "🥊 Luta" },
  { value: "crossfit", label: "🤸 Funcional" },
  { value: "ciclismo", label: "🚴 Ciclismo" },
  { value: "outro", label: "✨ Outro" },
];
const EQUIPMENT = [
  { value: "peso_corporal", label: "Só peso do corpo" },
  { value: "basico", label: "Halteres e faixas" },
  { value: "completo", label: "Academia completa" },
];
const DIET = [
  { value: "vegetariano", label: "Vegetariano" },
  { value: "vegano", label: "Vegano" },
  { value: "sem_lactose", label: "Sem lactose" },
  { value: "sem_gluten", label: "Sem glúten" },
  { value: "low_carb", label: "Low carb" },
  { value: "diabetes", label: "Diabetes" },
];

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const { session, refreshProfile, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState({
    fullName: "",
    age: 25,
    gender: "masculino",
    height: 170,
    weight: 70,
    activityLevel: "moderado",
    goal: "perda_de_peso",
    sportFocus: "musculacao",
    equipment: "peso_corporal",
    useFasting: "nao",
    dietaryRestrictions: [] as string[],
    injuries: "",
  });
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const macros = useMemo(
    () => calcMacros(d.age, d.gender, d.height, d.weight, d.activityLevel, d.goal),
    [d.age, d.gender, d.height, d.weight, d.activityLevel, d.goal]
  );

  const next = () => {
    if (step === 1 && !d.fullName.trim()) return Alert.alert("Como podemos te chamar?");
    setStep(step + 1);
  };

  const finish = async () => {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: d.fullName.trim(),
        age: d.age,
        gender: d.gender,
        height: d.height,
        weight: d.weight,
        activity_level: d.activityLevel,
        goal: d.goal,
        sport_focus: d.sportFocus,
        fitness_level: d.equipment,
        use_fasting: d.useFasting === "sim",
        dietary_restrictions: d.dietaryRestrictions.length ? d.dietaryRestrictions : null,
        injuries: d.injuries.trim() || null,
        bmr: macros.bmr,
        daily_calories: macros.dailyCalories,
        daily_protein: macros.dailyProtein,
        daily_carbs: macros.dailyCarbs,
        daily_fats: macros.dailyFats,
        onboarding_completed: true,
      })
      .eq("user_id", session.user.id);
    setSaving(false);
    if (error) return Alert.alert("Não foi possível salvar", error.message);
    await refreshProfile(); // o roteador leva para o app sozinho
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: space.xl, paddingTop: space.md }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: i < step ? colors.primary : colors.card }}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <>
              <Title>Vamos começar</Title>
              <Muted>Com esses dados calculamos seu metabolismo e suas metas diárias.</Muted>
              <Field label="Seu nome" value={d.fullName} onChangeText={(t) => set("fullName", t)} placeholder="Como quer ser chamado" />
              <Stepper label="Idade" value={d.age} onChange={(v) => set("age", v)} min={14} max={90} unit="anos" />
              <Choice
                label="Sexo biológico (usado no cálculo do metabolismo)"
                value={d.gender}
                onChange={(v) => set("gender", v)}
                options={[
                  { value: "masculino", label: "Masculino" },
                  { value: "feminino", label: "Feminino" },
                  { value: "outro", label: "Prefiro não dizer" },
                ]}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Title>Seu corpo e sua rotina</Title>
              <Stepper label="Altura" value={d.height} onChange={(v) => set("height", v)} min={100} max={230} unit="cm" />
              <Stepper label="Peso atual" value={d.weight} onChange={(v) => set("weight", v)} min={30} max={250} step={0.5} unit="kg" />
              <Choice label="Quanto você treina por semana?" value={d.activityLevel} onChange={(v) => set("activityLevel", v)} options={ACTIVITY} />
            </>
          )}

          {step === 3 && (
            <>
              <Title>Objetivo e preferências</Title>
              <Choice label="Seu objetivo" value={d.goal} onChange={(v) => set("goal", v)} options={GOALS} />
              <Choice label="Esporte principal" value={d.sportFocus} onChange={(v) => set("sportFocus", v)} options={SPORTS} />
              <Choice label="Equipamento disponível" value={d.equipment} onChange={(v) => set("equipment", v)} options={EQUIPMENT} />
              <Choice
                label="Quer usar jejum intermitente?"
                value={d.useFasting}
                onChange={(v) => set("useFasting", v)}
                options={[
                  { value: "nao", label: "Não" },
                  { value: "sim", label: "Sim" },
                ]}
              />
              <Choice label="Restrições alimentares" value={d.dietaryRestrictions} onChange={(v) => set("dietaryRestrictions", v)} options={DIET} multi />
              <Field
                label="Lesões ou áreas a evitar (opcional)"
                value={d.injuries}
                onChangeText={(t) => set("injuries", t)}
                placeholder="Ex: dor no joelho direito"
                multiline
              />
            </>
          )}

          {step === 4 && (
            <>
              <Title>Seu plano, {d.fullName.split(" ")[0]}</Title>
              <Card style={{ gap: space.md }}>
                <Row label="Metabolismo em repouso (TMB)" value={`${Math.round(macros.bmr)} kcal`} />
                <Row label="Gasto diário estimado" value={`${macros.tdee} kcal`} />
                <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
                <Text style={{ color: colors.muted, fontSize: 14 }}>Para o seu objetivo, coma por dia:</Text>
                <Text style={{ color: colors.primary, fontSize: 36, fontWeight: "800" }}>{macros.dailyCalories} kcal</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Macro label="Proteína" g={macros.dailyProtein} />
                  <Macro label="Carbo" g={macros.dailyCarbs} />
                  <Macro label="Gordura" g={macros.dailyFats} />
                </View>
                <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
                <Row label="Meta de água" value={`${(getWaterGoalMl(d.weight) / 1000).toFixed(1)} L`} />
              </Card>
              <Muted style={{ fontSize: 12 }}>
                Estimativas para orientação geral, não substituem acompanhamento com nutricionista ou médico.
              </Muted>
            </>
          )}
        </ScrollView>

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: space.lg,
            paddingBottom: space.xl,
            flexDirection: "row",
            gap: space.md,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          {step > 1 ? (
            <Button title="Voltar" variant="outline" onPress={() => setStep(step - 1)} style={{ flex: 1 }} />
          ) : (
            <Button title="Sair" variant="ghost" onPress={signOut} style={{ flex: 1 }} />
          )}
          {step < TOTAL_STEPS ? (
            <Button title="Próximo" onPress={next} style={{ flex: 2 }} />
          ) : (
            <Button title="Começar" onPress={finish} loading={saving} style={{ flex: 2 }} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

function Macro({ label, g }: { label: string; g: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>{Math.round(g)}g</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
