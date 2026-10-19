import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useToday } from "@/lib/useToday";
import { supabase } from "@/lib/supabase";
import { getWaterGoalMl } from "@/lib/nutrition";
import { getLevel, getNextLevel } from "@/lib/levels";
import { longDatePtBR, toISODate } from "@/lib/dates";
import { Button, Card, Muted, Stepper } from "@/components/ui";
import { colors, radius, space } from "@/theme";

export default function Home() {
  const { profile, session, refreshProfile } = useAuth();
  const userId = session?.user.id;
  const t = useToday(userId);
  const router = useRouter();
  const [weightOpen, setWeightOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Atualiza sempre que a pessoa volta para esta aba
  useFocusEffect(
    useCallback(() => {
      t.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t.refresh])
  );

  if (!profile) return null;

  const goalKcal = profile.daily_calories ?? 2000;
  const remaining = goalKcal - t.calories;
  const waterGoal = getWaterGoalMl(profile.weight);
  const level = getLevel(t.happyTotal);
  const nextLevel = getNextLevel(t.happyTotal);
  const firstName = (profile.full_name ?? "").split(" ")[0] || "você";

  const addWater = async (ml: number) => {
    if (!userId) return;
    const { error } = await supabase.from("water_logs").insert({ user_id: userId, amount_ml: ml, date: toISODate() });
    if (error) return Alert.alert("Não foi possível registrar", error.message);
    t.refresh();
  };

  const undoWater = async () => {
    const last = t.waterEntries[t.waterEntries.length - 1];
    if (!last) return;
    await supabase.from("water_logs").delete().eq("id", last.id);
    t.refresh();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await t.refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: space.xl * 2 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Cabeçalho */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Olá, {firstName}!</Text>
            <Muted>{longDatePtBR()}</Muted>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{t.streak}</Text>
          </View>
        </View>

        {/* Happy do dia */}
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Seu dia</Text>
            <Text style={{ color: level.color, fontWeight: "700" }}>
              {level.name} · {t.happyTotal} {t.happyTotal === 1 ? "dia" : "dias"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <Check done={t.happy.workout} label="Treino" icon="barbell" />
            <Check done={t.happy.nutrition} label="Alimentação" icon="restaurant" />
            <Check done={t.happy.water} label="Água" icon="water" />
          </View>
          <Muted style={{ fontSize: 13 }}>
            {t.streak > 0
              ? `${t.streak} ${t.streak === 1 ? "dia seguido" : "dias seguidos"} cumprindo sua rotina.`
              : "Cumpra pelo menos um item hoje para começar sua sequência."}
            {nextLevel ? ` Faltam ${nextLevel.min - t.happyTotal} para ${nextLevel.name}.` : ""}
          </Muted>
        </Card>

        {/* Calorias */}
        <Card onPress={() => router.push("/nutricao")} style={{ gap: space.sm }}>
          <CardHeader title="Calorias" icon="restaurant" />
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text style={{ color: colors.text, fontSize: 34, fontWeight: "800" }}>{Math.round(t.calories)}</Text>
            <Muted>/ {goalKcal} kcal</Muted>
          </View>
          <Progress value={t.calories / goalKcal} />
          <Muted>{remaining >= 0 ? `${Math.round(remaining)} kcal restantes` : `${Math.round(-remaining)} kcal acima da meta`}</Muted>
        </Card>

        {/* Água */}
        <Card style={{ gap: space.sm }}>
          <CardHeader title="Água" icon="water" color={colors.water} />
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text style={{ color: colors.text, fontSize: 34, fontWeight: "800" }}>{(t.waterMl / 1000).toFixed(2)}L</Text>
            <Muted>/ {(waterGoal / 1000).toFixed(1)} L</Muted>
          </View>
          <Progress value={t.waterMl / waterGoal} color={colors.water} />
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.xs }}>
            {[200, 300, 500].map((ml) => (
              <Pressable key={ml} onPress={() => addWater(ml)} style={pillBtn}>
                <Text style={{ color: colors.text, fontWeight: "600" }}>+{ml} ml</Text>
              </Pressable>
            ))}
            {t.waterEntries.length > 0 && (
              <Pressable onPress={undoWater} style={[pillBtn, { flex: 0, paddingHorizontal: 14 }]} accessibilityLabel="Desfazer último registro de água">
                <Ionicons name="arrow-undo" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: space.md }}>
          {/* Peso */}
          <Card onPress={() => setWeightOpen(true)} style={{ flex: 1, gap: space.sm }}>
            <CardHeader title="Peso hoje" icon="scale" />
            {t.weightToday !== null ? (
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>{t.weightToday.toFixed(1)} kg</Text>
            ) : (
              <Text style={{ color: colors.primary, fontWeight: "600" }}>Registrar</Text>
            )}
          </Card>

          {/* Treino */}
          <Card onPress={() => router.push("/treino")} style={{ flex: 1, gap: space.sm }}>
            <CardHeader title="Treino" icon="barbell" />
            {t.workout ? (
              <>
                <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>{t.workout.title}</Text>
                <Muted>{t.workout.completed ? "✓ Concluído" : "Pendente"}</Muted>
              </>
            ) : (
              <Muted>Nenhum treino hoje</Muted>
            )}
          </Card>
        </View>
      </ScrollView>

      <WeightModal
        visible={weightOpen}
        initial={t.weightToday ?? profile.weight ?? 70}
        onClose={() => setWeightOpen(false)}
        onSave={async (kg) => {
          if (!userId) return;
          const { error } = await supabase
            .from("weight_logs")
            .upsert({ user_id: userId, weight: kg, date: toISODate() }, { onConflict: "user_id,date" });
          if (error) return Alert.alert("Não foi possível salvar", error.message);
          // Mantém o peso do perfil atualizado (usado na meta de água e nos cálculos)
          await supabase.from("profiles").update({ weight: kg }).eq("user_id", userId);
          setWeightOpen(false);
          await Promise.all([t.refresh(), refreshProfile()]);
        }}
      />
    </SafeAreaView>
  );
}

const pillBtn = {
  flex: 1,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  paddingVertical: 12,
  borderRadius: radius.sm,
  backgroundColor: colors.input,
  borderWidth: 1,
  borderColor: colors.cardBorder,
};

function CardHeader({ title, icon, color = colors.primary }: { title: string; icon: any; color?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: colors.muted, fontWeight: "600" }}>{title}</Text>
      <Ionicons name={icon} size={20} color={color} />
    </View>
  );
}

function Progress({ value, color = colors.primary }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.input, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: radius.pill }} />
    </View>
  );
}

function Check({ done, label, icon }: { done: boolean; label: string; icon: any }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        gap: 6,
        paddingVertical: space.md,
        borderRadius: radius.sm,
        backgroundColor: done ? "rgba(212,175,55,0.15)" : colors.input,
        borderWidth: 1,
        borderColor: done ? colors.primary : colors.cardBorder,
      }}
    >
      <Ionicons name={done ? "checkmark-circle" : icon} size={24} color={done ? colors.primary : colors.muted} />
      <Text style={{ color: done ? colors.text : colors.muted, fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

function WeightModal({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: number;
  onClose: () => void;
  onSave: (kg: number) => Promise<void>;
}) {
  const [kg, setKg] = useState(initial);
  const [saving, setSaving] = useState(false);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={() => setKg(initial)}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose} />
      <View style={{ backgroundColor: colors.card, padding: space.xl, gap: space.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>Registrar peso de hoje</Text>
        <Stepper label="Peso" value={kg} onChange={setKg} min={30} max={250} step={0.1} unit="kg" />
        <Button
          title="Salvar"
          loading={saving}
          onPress={async () => {
            setSaving(true);
            await onSave(kg);
            setSaving(false);
          }}
        />
        <Button title="Cancelar" variant="ghost" onPress={onClose} />
      </View>
    </Modal>
  );
}
