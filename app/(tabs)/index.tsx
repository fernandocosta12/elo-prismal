import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useToday } from "@/lib/useToday";
import { supabase } from "@/lib/supabase";
import { getWaterGoalMl } from "@/lib/nutrition";
import { longDatePtBR, toISODate } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { Bar, Button, Card, Muted, Section, Stepper } from "@/components/ui";
import { colors, radius, space, type } from "@/theme";

export default function Home() {
  const { profile, session, refreshProfile } = useAuth();
  const userId = session?.user.id;
  const t = useToday(userId);
  const router = useRouter();
  const [weightOpen, setWeightOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
  const firstName = (profile.full_name ?? "").split(" ")[0] || "você";
  const doneCount = Number(t.happy.workout) + Number(t.happy.nutrition) + Number(t.happy.water);

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
              await t.refresh();
              setRefreshing(false);
            }}
          />
        }
      >
        {/* Cabeçalho */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <Pressable onPress={() => router.push("/perfil")} accessibilityLabel="Abrir perfil">
            <Avatar uri={profile.avatar_url} name={profile.full_name} size={44} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Muted style={{ fontSize: 13 }}>{longDatePtBR()}</Muted>
            <Text style={[type.h2, { color: colors.text, fontSize: 20 }]}>Olá, {firstName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>🔥 {t.streak}</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>{t.streak === 1 ? "dia" : "dias"}</Text>
          </View>
        </View>

        {/* Hoje: 3 metas */}
        <View style={{ marginTop: space.md, gap: space.md }}>
          <Text style={[type.big, { color: colors.text }]}>
            {doneCount}
            <Text style={{ color: colors.faint }}>/3</Text>
          </Text>
          <Muted style={{ marginTop: -space.sm }}>
            {doneCount === 3 ? "Dia completo. Muito bem!" : "metas cumpridas hoje"}
          </Muted>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <Goal done={t.happy.workout} label="Treino" onPress={() => router.push("/treino")} />
            <Goal done={t.happy.nutrition} label="Alimentação" onPress={() => router.push("/nutricao")} />
            <Goal done={t.happy.water} label="Água" />
          </View>
        </View>

        {/* Calorias */}
        <Card onPress={() => router.push("/nutricao")} style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ color: colors.muted }}>Calorias</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {remaining >= 0 ? `${Math.round(remaining)} restantes` : `${Math.round(-remaining)} acima`}
            </Text>
          </View>
          <Text style={[type.big, { color: colors.text, fontSize: 30 }]}>
            {Math.round(t.calories)} <Text style={{ fontSize: 15, color: colors.muted, fontWeight: "500" }}>/ {goalKcal} kcal</Text>
          </Text>
          <Bar value={t.calories / goalKcal} />
        </Card>

        {/* Água */}
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ color: colors.muted }}>Água</Text>
            {t.waterEntries.length > 0 && (
              <Pressable onPress={undoWater} hitSlop={10} accessibilityLabel="Desfazer último registro de água">
                <Text style={{ color: colors.muted, fontSize: 13 }}>Desfazer</Text>
              </Pressable>
            )}
          </View>
          <Text style={[type.big, { color: colors.text, fontSize: 30 }]}>
            {(t.waterMl / 1000).toFixed(2)} <Text style={{ fontSize: 15, color: colors.muted, fontWeight: "500" }}>/ {(waterGoal / 1000).toFixed(1)} L</Text>
          </Text>
          <Bar value={t.waterMl / waterGoal} color={colors.water} />
          <View style={{ flexDirection: "row", gap: space.sm }}>
            {[200, 300, 500].map((ml) => (
              <Pressable
                key={ml}
                onPress={() => addWater(ml)}
                style={({ pressed }) => [{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: radius.sm, backgroundColor: colors.input }, pressed && { opacity: 0.7 }]}
                accessibilityLabel={`Adicionar ${ml} mililitros`}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>+{ml} ml</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: space.sm }}>
          <Card onPress={() => setWeightOpen(true)} style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.muted }}>Peso</Text>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>
              {t.weightToday !== null ? `${t.weightToday.toFixed(1)} kg` : "Registrar"}
            </Text>
          </Card>
          <Card onPress={() => router.push("/treino")} style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.muted }}>Treino</Text>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }} numberOfLines={2}>
              {t.workout ? (t.workout.completed ? `✓ ${t.workout.title}` : t.workout.title) : "Ver sugestão"}
            </Text>
          </Card>
        </View>

        <Section>
          <Text onPress={() => router.push("/evolucao")}>Ver minha evolução →</Text>
        </Section>
      </ScrollView>

      <WeightModal
        visible={weightOpen}
        initial={t.weightToday ?? profile.weight ?? 70}
        onClose={() => setWeightOpen(false)}
        onSave={async (kg) => {
          if (!userId) return;
          const { error } = await supabase.from("weight_logs").upsert({ user_id: userId, weight: kg, date: toISODate() }, { onConflict: "user_id,date" });
          if (error) return Alert.alert("Não foi possível salvar", error.message);
          await supabase.from("profiles").update({ weight: kg }).eq("user_id", userId);
          setWeightOpen(false);
          await Promise.all([t.refresh(), refreshProfile()]);
        }}
      />
    </SafeAreaView>
  );
}

function Goal({ done, label, onPress }: { done: boolean; label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.sm, backgroundColor: done ? colors.primarySoft : colors.card }}
      accessibilityLabel={`${label}: ${done ? "cumprido" : "pendente"}`}
    >
      <Ionicons name={done ? "checkmark-circle" : "ellipse-outline"} size={18} color={done ? colors.primary : colors.faint} />
      <Text style={{ color: done ? colors.text : colors.muted, fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function WeightModal({ visible, initial, onClose, onSave }: { visible: boolean; initial: number; onClose: () => void; onSave: (kg: number) => Promise<void> }) {
  const [kg, setKg] = useState(initial);
  const [saving, setSaving] = useState(false);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={() => setKg(initial)}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose} />
      <View style={{ backgroundColor: colors.card, padding: space.xl, gap: space.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
        <Text style={[type.h2, { color: colors.text, fontSize: 20 }]}>Peso de hoje</Text>
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
