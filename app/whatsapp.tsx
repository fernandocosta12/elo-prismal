// Ligar o WhatsApp à conta: registrar refeições, água e peso conversando com o Ritmo.
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Linking, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Screen } from "@/components/Screen";
import { Button, Card, Muted, Section } from "@/components/ui";
import { colors, radius, space } from "@/theme";

const EXAMPLES: [string, string, string][] = [
  ["camera-outline", "Foto do prato", "Registro a refeição com calorias e macros"],
  ["mic-outline", "Áudio ou texto", "“Almocei arroz, feijão e um bife”"],
  ["water-outline", "água 500", "Registra 500 ml de água"],
  ["scale-outline", "peso 82,5", "Registra o peso de hoje"],
  ["stats-chart-outline", "resumo", "Como está o seu dia"],
  ["arrow-undo-outline", "desfazer", "Apaga a última refeição"],
];

const maskPhone = (p: string) => (p.length > 6 ? `+${p.slice(0, 2)} (${p.slice(2, 4)}) •••••-${p.slice(-4)}` : p);

export default function WhatsApp() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const [botNumber, setBotNumber] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [l, s] = await Promise.all([
      supabase.from("whatsapp_links").select("phone").eq("user_id", userId).maybeSingle(),
      supabase.from("app_settings").select("value").eq("key", "whatsapp_number").maybeSingle(),
    ]);
    setPhone(l.data?.phone ?? null);
    setBotNumber(s.data?.value?.replace(/\D/g, "") || null);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const genCode = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("whatsapp_create_link_code");
    setBusy(false);
    if (error) return Alert.alert("Não deu certo", "Tente de novo em instantes.");
    setCode(String(data));
  };

  const openChat = (text?: string) => {
    if (!botNumber) return;
    const url = `https://wa.me/${botNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
    Linking.openURL(url);
  };

  const unlink = () =>
    Alert.alert("Desligar o WhatsApp?", "Você pode ligar de novo quando quiser.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desligar",
        style: "destructive",
        onPress: async () => {
          await supabase.from("whatsapp_links").delete().eq("user_id", userId!);
          setCode(null);
          load();
        },
      },
    ]);

  return (
    <Screen title="WhatsApp" subtitle="Registre refeições, água e peso mandando mensagem, sem abrir o app.">
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : phone ? (
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>WhatsApp ligado</Text>
              <Muted>{maskPhone(phone)}</Muted>
            </View>
          </View>
          {botNumber && <Button title="Abrir conversa com o Ritmo" onPress={() => openChat()} />}
          <Button title="Desligar" variant="ghost" onPress={unlink} />
        </Card>
      ) : (
        <Card style={{ gap: space.md }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>Ligar meu WhatsApp</Text>
          {!code ? (
            <>
              <Muted>Gere um código e mande para o Ritmo pelo WhatsApp. Leva 10 segundos.</Muted>
              <Button title="Gerar código" onPress={genCode} loading={busy} />
            </>
          ) : (
            <>
              <View style={{ alignItems: "center", paddingVertical: space.md, backgroundColor: colors.input, borderRadius: radius.md }}>
                <Muted style={{ fontSize: 12 }}>Mande esta mensagem</Muted>
                <Text selectable style={{ color: colors.primary, fontSize: 28, fontWeight: "800", letterSpacing: 2, marginTop: 4 }}>
                  VINCULAR {code}
                </Text>
                <Muted style={{ fontSize: 12, marginTop: 4 }}>Vale por 15 minutos</Muted>
              </View>
              {botNumber ? (
                <Button title="Abrir WhatsApp e enviar" onPress={() => openChat(`VINCULAR ${code}`)} />
              ) : (
                <Muted style={{ textAlign: "center" }}>O número do Ritmo no WhatsApp ainda está sendo configurado. Volte em breve.</Muted>
              )}
              <Button title="Já enviei" variant="ghost" onPress={load} />
            </>
          )}
        </Card>
      )}

      <Section>O que você pode mandar</Section>
      <Card style={{ gap: space.md }}>
        {EXAMPLES.map(([icon, title, sub]) => (
          <View key={title} style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
            <Ionicons name={icon as any} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>{title}</Text>
              <Muted style={{ fontSize: 13 }}>{sub}</Muted>
            </View>
          </View>
        ))}
      </Card>
      <Muted style={{ fontSize: 12, textAlign: "center" }}>
        Fotos, áudios e descrições usam suas análises de IA do dia. Água, peso e resumo são ilimitados.
      </Muted>
    </Screen>
  );
}
