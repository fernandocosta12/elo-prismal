// Cartão "Meta inteligente": estima o gasto real pelo peso + alimentação e sugere a nova meta.
import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { applyAdaptive, computeAdaptive, type AdaptiveResult } from "@/lib/adaptive";
import { Bar, Button, Card, Muted } from "./ui";
import { colors, space } from "@/theme";

export function AdaptiveCard() {
  const { session, profile, refreshProfile } = useAuth();
  const userId = session?.user.id;
  const [r, setR] = useState<AdaptiveResult | null>(null);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (userId && profile) computeAdaptive(userId, profile).then(setR).catch(() => setR(null));
    }, [userId, profile])
  );

  if (!r || !profile) return null;

  if (!r.ready) {
    const parts = [
      Math.min(1, r.loggedDays / r.need.loggedDays),
      Math.min(1, r.weighIns / r.need.weighIns),
      Math.min(1, r.spanDays / r.need.spanDays),
    ];
    const pct = (parts[0] + parts[1] + parts[2]) / 3;
    return (
      <Card style={{ gap: space.sm }}>
        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>Meta inteligente</Text>
        <Muted style={{ fontSize: 13 }}>
          Comparando o que você come com o que a balança mostra, o app descobre quanto você realmente gasta e ajusta sua meta.
        </Muted>
        <Bar value={pct} />
        <Muted style={{ fontSize: 12 }}>
          Faltam: {Math.max(0, r.need.loggedDays - r.loggedDays)} dias com refeições registradas · {Math.max(0, r.need.weighIns - r.weighIns)} pesagens ·{" "}
          {Math.max(0, r.need.spanDays - r.spanDays)} dias entre a primeira e a última pesagem
        </Muted>
      </Card>
    );
  }

  const diff = r.suggested.dailyCalories - r.current;
  const trend =
    Math.abs(r.weeklyChangeKg) < 0.05
      ? "peso estável"
      : `${r.weeklyChangeKg > 0 ? "+" : ""}${r.weeklyChangeKg.toFixed(2).replace(".", ",")} kg/semana`;

  const apply = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      await applyAdaptive(userId, r.suggested);
      await refreshProfile();
      Alert.alert("Meta atualizada", `Sua nova meta é ${r.suggested.dailyCalories} kcal por dia.`);
    } catch (e: any) {
      Alert.alert("Não deu certo", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ gap: space.md }}>
      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>Meta inteligente</Text>
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Num label="Seu gasto real" value={`${r.tdee}`} />
        <Num label="A fórmula dizia" value={`${r.formulaTdee}`} muted />
        <Num label="Tendência" value={trend} small />
      </View>
      <Muted style={{ fontSize: 13 }}>
        Média de {r.avgIntake} kcal por dia em {r.loggedDays} dias registrados.
      </Muted>
      {Math.abs(diff) >= 100 ? (
        <>
          <Text style={{ color: colors.text }}>
            Para o seu objetivo, o ideal agora é <Text style={{ color: colors.primary, fontWeight: "800" }}>{r.suggested.dailyCalories} kcal</Text> por dia (
            {diff > 0 ? "+" : ""}
            {diff} da meta atual).
          </Text>
          <Button title={`Atualizar meta para ${r.suggested.dailyCalories} kcal`} onPress={apply} loading={busy} />
        </>
      ) : (
        <Text style={{ color: colors.success }}>Sua meta de {r.current} kcal está certa para o seu objetivo. Continue assim.</Text>
      )}
    </Card>
  );
}

function Num({ label, value, muted, small }: { label: string; value: string; muted?: boolean; small?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Muted style={{ fontSize: 12 }}>{label}</Muted>
      <Text style={{ color: muted ? colors.muted : colors.text, fontSize: small ? 14 : 20, fontWeight: "700", marginTop: 2 }}>
        {value}
        {!small && <Text style={{ fontSize: 12, fontWeight: "400", color: colors.muted }}> kcal</Text>}
      </Text>
    </View>
  );
}
