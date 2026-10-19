import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { calcBMI, getWaterGoalMl } from "@/lib/nutrition";
import { pickAvatar, uploadAvatar } from "@/lib/avatar";
import { Avatar } from "@/components/Avatar";
import { Button, Card, Muted, Section } from "@/components/ui";
import { colors, radius, space, type } from "@/theme";

const GOAL_LABEL: Record<string, string> = {
  perda_de_peso: "Emagrecer",
  ganho_de_massa: "Ficar forte",
  manutencao: "Manter",
  performance: "Performance",
};

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso saudável";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidade";
}

export default function Perfil() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  if (!profile) return null;
  const bmi = calcBMI(profile.weight ?? 0, profile.height ?? 0);

  const changePhoto = async (source: "camera" | "library") => {
    if (!session) return;
    try {
      const img = await pickAvatar(source);
      if (!img) return;
      setUploading(true);
      await uploadAvatar(session.user.id, img);
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Foto de perfil", e.message);
    } finally {
      setUploading(false);
    }
  };

  const askPhoto = () => {
    // No navegador, só existe a opção de escolher arquivo/foto
    if (Platform.OS === "web") return changePhoto("library");
    Alert.alert("Foto de perfil", undefined, [
      { text: "Tirar foto", onPress: () => changePhoto("camera") },
      { text: "Escolher da galeria", onPress: () => changePhoto("library") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const doDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.functions.invoke("delete-account", { body: {} });
    setDeleting(false);
    if (error) return Alert.alert("Não foi possível excluir", "Tente de novo em instantes.");
    Alert.alert("Conta excluída", "Seus dados foram apagados.");
    await signOut();
  };

  const confirmDelete = () =>
    Alert.alert("Excluir sua conta?", "Todos os seus dados serão apagados para sempre. Isso não pode ser desfeito.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar",
        style: "destructive",
        onPress: () =>
          Alert.alert("Tem certeza?", "Última confirmação: excluir a conta agora.", [
            { text: "Não", style: "cancel" },
            { text: "Excluir definitivamente", style: "destructive", onPress: doDelete },
          ]),
      },
    ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: space.xxl * 2 }}>
        {/* Foto e nome */}
        <View style={{ alignItems: "center", gap: space.md, paddingVertical: space.lg }}>
          <Pressable onPress={askPhoto} accessibilityRole="button" accessibilityLabel="Alterar foto de perfil">
            <Avatar uri={profile.avatar_url} name={profile.full_name} size={104} />
            <View
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: colors.bg,
              }}
            >
              {uploading ? <ActivityIndicator size="small" color={colors.primaryText} /> : <Ionicons name="camera" size={16} color={colors.primaryText} />}
            </View>
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={[type.title, { color: colors.text, fontSize: 24 }]}>{profile.full_name || "Meu perfil"}</Text>
            <Muted>{session?.user.email}</Muted>
          </View>
        </View>

        <Section>Você</Section>
        <Card>
          <Grid
            items={[
              ["Idade", `${profile.age ?? "–"} anos`],
              ["Altura", `${profile.height ?? "–"} cm`],
              ["Peso", `${profile.weight ?? "–"} kg`],
              ["Objetivo", GOAL_LABEL[profile.goal ?? ""] ?? "–"],
            ]}
          />
        </Card>

        <Section>Metas diárias</Section>
        <Card>
          <Grid
            items={[
              ["Calorias", `${profile.daily_calories ?? "–"} kcal`],
              ["Metabolismo", `${Math.round(profile.bmr ?? 0)} kcal`],
              ["Proteína", `${Math.round(profile.daily_protein ?? 0)} g`],
              ["Carboidratos", `${Math.round(profile.daily_carbs ?? 0)} g`],
              ["Gorduras", `${Math.round(profile.daily_fats ?? 0)} g`],
              ["Água", `${(getWaterGoalMl(profile.weight) / 1000).toFixed(1)} L`],
            ]}
          />
        </Card>

        <Card onPress={() => router.push("/ideais")} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>Seus números ideais</Text>
            <Muted style={{ fontSize: 13 }}>
              {bmi > 0 ? `IMC ${bmi.toFixed(1)} · ${bmiLabel(bmi)} · ` : ""}peso, cintura e gordura ideais
            </Muted>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.faint} />
        </Card>

        <View style={{ gap: space.sm, marginTop: space.lg }}>
          <Button title="Sair da conta" variant="soft" onPress={signOut} />
          <Button title="Excluir minha conta" variant="danger" onPress={confirmDelete} loading={deleting} />
          <Muted style={{ fontSize: 12, textAlign: "center" }}>Excluir a conta apaga para sempre seus dados e histórico.</Muted>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Grid({ items }: { items: [string, string][] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: space.lg }}>
      {items.map(([k, v]) => (
        <View key={k} style={{ width: "50%" }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{k}</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginTop: 2 }}>{v}</Text>
        </View>
      ))}
    </View>
  );
}
