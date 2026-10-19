import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { calcBMI, getWaterGoalMl } from "@/lib/nutrition";
import { Button, Card, Muted, Title } from "@/components/ui";
import { colors, space } from "@/theme";

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
  const { profile, session, signOut } = useAuth();
  if (!profile) return null;
  const bmi = calcBMI(profile.weight ?? 0, profile.height ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: space.xl * 2 }}>
        <Title>{profile.full_name || "Meu perfil"}</Title>
        <Muted>{session?.user.email}</Muted>

        <Card style={{ gap: space.md }}>
          <Grid
            items={[
              ["Idade", `${profile.age ?? "–"} anos`],
              ["Altura", `${profile.height ?? "–"} cm`],
              ["Peso", `${profile.weight ?? "–"} kg`],
              ["Objetivo", GOAL_LABEL[profile.goal ?? ""] ?? "–"],
            ]}
          />
        </Card>

        <Card style={{ gap: space.md }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 17 }}>Metabolismo e metas</Text>
          <Grid
            items={[
              ["TMB", `${Math.round(profile.bmr ?? 0)} kcal`],
              ["Calorias/dia", `${profile.daily_calories ?? "–"} kcal`],
              ["Proteína", `${Math.round(profile.daily_protein ?? 0)} g`],
              ["Carboidratos", `${Math.round(profile.daily_carbs ?? 0)} g`],
              ["Gorduras", `${Math.round(profile.daily_fats ?? 0)} g`],
              ["Água", `${(getWaterGoalMl(profile.weight) / 1000).toFixed(1)} L`],
            ]}
          />
        </Card>

        {bmi > 0 && (
          <Card style={{ gap: space.xs }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 17 }}>IMC {bmi.toFixed(1)}</Text>
            <Muted>{bmiLabel(bmi)}</Muted>
          </Card>
        )}

        <Button title="Sair da conta" variant="outline" onPress={signOut} />
        <Button
          title="Excluir minha conta"
          variant="danger"
          onPress={() =>
            Alert.alert(
              "Excluir conta",
              "Essa função entra na próxima etapa, antes do envio para a App Store."
            )
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Grid({ items }: { items: [string, string][] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: space.md }}>
      {items.map(([k, v]) => (
        <View key={k} style={{ width: "50%" }}>
          <Muted style={{ fontSize: 13 }}>{k}</Muted>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>{v}</Text>
        </View>
      ))}
    </View>
  );
}
