// "Seus números ideais": onde você está e qual seria o ideal (IMC, peso, cintura, gordura, proteína, água).
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/dates";
import { getWaterGoalMl } from "@/lib/nutrition";
import {
  BMI_BANDS,
  bmiBand,
  bmiOf,
  bodyFatBand,
  bodyFatNavy,
  healthyWeightRange,
  idealBodyFat,
  proteinRange,
  waistRisk,
  waistToHeight,
  weightGuidance,
  type Status,
} from "@/lib/health";
import { Button, Card, Field, Muted, Section } from "@/components/ui";
import { colors, radius, space, type } from "@/theme";

type Measure = { date: string; waist_cm: number | null; hip_cm: number | null; neck_cm: number | null };

const statusColor = (s: Status) =>
  s === "ideal" ? colors.success : s === "atencao" ? colors.carbs : s === "alto" ? colors.danger : colors.water;

export default function Ideais() {
  const { profile, session } = useAuth();
  const router = useRouter();
  const userId = session?.user.id;
  const [m, setM] = useState<Measure | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("body_measurements")
      .select("date, waist_cm, hip_cm, neck_cm")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    setM(
      data
        ? { date: data.date, waist_cm: data.waist_cm != null ? Number(data.waist_cm) : null, hip_cm: data.hip_cm != null ? Number(data.hip_cm) : null, neck_cm: data.neck_cm != null ? Number(data.neck_cm) : null }
        : null
    );
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!profile) return null;
  const weight = profile.weight ?? 0;
  const height = profile.height ?? 0;
  const gender = profile.gender;
  const bmi = bmiOf(weight, height);
  const band = bmiBand(bmi);
  const range = healthyWeightRange(height);
  const guide = weightGuidance(weight, height);
  const prot = proteinRange(weight, height);
  const fat = m?.waist_cm && m?.neck_cm ? bodyFatNavy({ gender, heightCm: height, waistCm: m.waist_cm, neckCm: m.neck_cm, hipCm: m.hip_cm }) : null;
  const fatIdeal = idealBodyFat(gender);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: space.lg, paddingBottom: 0 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, gap: space.lg, paddingBottom: space.xxl * 2 }}>
        <View style={{ gap: 4 }}>
          <Text style={[type.title, { color: colors.text }]}>Seus números</Text>
          <Muted>Onde você está hoje e qual seria o ideal para o seu corpo.</Muted>
        </View>

        {/* IMC */}
        <Section>IMC</Section>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
            <Text style={[type.big, { color: colors.text }]}>{bmi ? bmi.toFixed(1) : "–"}</Text>
            <Text style={{ color: statusColor(band.status), fontWeight: "600" }}>{band.label}</Text>
          </View>
          <BmiScale bmi={bmi} />
          <Muted style={{ fontSize: 13 }}>Ideal: entre 18,5 e 24,9.</Muted>
        </Card>

        {/* Peso */}
        <Section>Peso ideal para {height} cm</Section>
        <Card style={{ gap: space.md }}>
          <Text style={[type.big, { color: colors.text, fontSize: 28 }]}>
            {range.min.toFixed(1)} – {range.max.toFixed(1)} <Text style={{ fontSize: 15, color: colors.muted, fontWeight: "500" }}>kg</Text>
          </Text>
          <Muted>Hoje você está com {weight} kg.</Muted>
          {guide.kind === "perder" && (
            <View style={{ gap: space.sm }}>
              <Row label={guide.firstStepLabel} value={`${guide.firstStep} kg`} />
              <Row label="Para chegar à faixa ideal" value={`−${guide.toTarget} kg`} />
              <Row label="Ritmo saudável" value={`${guide.weeklyMin}–${guide.weeklyMax} kg/semana`} />
            </View>
          )}
          {guide.kind === "ganhar" && <Row label="Para chegar à faixa ideal" value={`+${guide.toTarget} kg`} />}
          {guide.kind === "manter" && <Text style={{ color: colors.success, fontWeight: "600" }}>Você está dentro da faixa ideal.</Text>}
        </Card>

        {/* Cintura */}
        <Section right={<LinkText onPress={() => setOpen(true)}>{m ? "Atualizar" : "Medir"}</LinkText>}>Cintura</Section>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : m?.waist_cm ? (
          <Card style={{ gap: space.md }}>
            {(() => {
              const r = waistRisk(m.waist_cm!, gender);
              const wh = waistToHeight(m.waist_cm!, height);
              return (
                <>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
                    <Text style={[type.big, { color: colors.text }]}>{m.waist_cm}</Text>
                    <Muted>cm</Muted>
                    <Text style={{ color: statusColor(r.status), fontWeight: "600" }}>{r.label}</Text>
                  </View>
                  <Row label="Ideal" value={`abaixo de ${Math.min(r.limit, wh.idealMax)} cm`} />
                  <Row label="Cintura ÷ altura" value={`${wh.ratio.toFixed(2)} (ideal < 0,50)`} color={statusColor(wh.status)} />
                </>
              );
            })()}
          </Card>
        ) : (
          <Card onPress={() => setOpen(true)} style={{ gap: space.sm }}>
            <Text style={{ color: colors.text, fontWeight: "600" }}>Meça sua cintura</Text>
            <Muted>A gordura na barriga diz mais sobre a saúde do que o peso sozinho. Leva 1 minuto com uma fita métrica.</Muted>
          </Card>
        )}

        {/* Gordura corporal */}
        <Section>Gordura corporal (estimada)</Section>
        <Card style={{ gap: space.md }}>
          {fat ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
                <Text style={[type.big, { color: colors.text }]}>{fat}%</Text>
                <Text style={{ color: statusColor(bodyFatBand(fat, gender).status), fontWeight: "600" }}>{bodyFatBand(fat, gender).label}</Text>
              </View>
              <Row label="Faixa ideal" value={`${fatIdeal.min}–${fatIdeal.max}%`} />
              <Muted style={{ fontSize: 12 }}>Estimativa pelo método da Marinha dos EUA (cintura, pescoço{gender === "feminino" ? " e quadril" : ""}). Bioimpedância ou DEXA são mais precisos.</Muted>
            </>
          ) : (
            <>
              <Row label="Faixa ideal" value={`${fatIdeal.min}–${fatIdeal.max}%`} />
              <Muted>Informe cintura, pescoço{gender === "feminino" ? " e quadril" : ""} para estimarmos a sua.</Muted>
              <Button title="Informar medidas" variant="soft" onPress={() => setOpen(true)} />
            </>
          )}
        </Card>

        {/* Metas diárias ideais */}
        <Section>Por dia</Section>
        <Card style={{ gap: space.md }}>
          <Row label="Proteína ideal" value={`${prot.min}–${prot.max} g`} />
          <Row label="Sua meta atual de proteína" value={`${Math.round(profile.daily_protein ?? 0)} g`} />
          <Row label="Água" value={`${(getWaterGoalMl(weight) / 1000).toFixed(1)} L`} />
          <Row label="Sono" value="7 a 9 horas" />
          <Row label="Fibras" value="25 a 30 g" />
        </Card>

        <Muted style={{ fontSize: 12 }}>
          Referências: OMS (IMC e cintura), ACE (gordura corporal), ISSN (proteína: 1,4–2,0 g/kg). São orientações gerais para adultos e não
          substituem avaliação com médico ou nutricionista. Não se aplicam a gestantes, menores de 18 anos e atletas com muita massa muscular (no caso do IMC).
        </Muted>
      </ScrollView>

      <MeasureModal
        visible={open}
        initial={m}
        female={gender === "feminino"}
        onClose={() => setOpen(false)}
        onSave={async (v) => {
          if (!userId) return;
          const { error } = await supabase
            .from("body_measurements")
            .upsert({ user_id: userId, date: toISODate(), ...v }, { onConflict: "user_id,date" });
          if (error) return Alert.alert("Não foi possível salvar", error.message);
          setOpen(false);
          load();
        }}
      />
    </SafeAreaView>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
      <Text style={{ color: colors.muted, flex: 1 }}>{label}</Text>
      <Text style={{ color: color ?? colors.text, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

function LinkText({ children, onPress }: { children: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <Text style={{ color: colors.primary, fontWeight: "600" }}>{children}</Text>
    </Pressable>
  );
}

// Régua do IMC de 15 a 40 com as faixas coloridas e um marcador
function BmiScale({ bmi }: { bmi: number }) {
  const MIN = 15;
  const MAX = 40;
  const pos = Math.max(0, Math.min(1, (bmi - MIN) / (MAX - MIN)));
  let prev = MIN;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 8, flexDirection: "row", borderRadius: radius.pill, overflow: "hidden" }}>
        {BMI_BANDS.slice(0, 5).map((b) => {
          const end = Math.min(b.max === Infinity ? MAX : b.max, MAX);
          const w = (end - prev) / (MAX - MIN);
          prev = end;
          return <View key={b.label} style={{ flex: w, backgroundColor: statusColor(b.status), opacity: 0.85 }} />;
        })}
      </View>
      {bmi > 0 && (
        <View style={{ height: 10 }}>
          <View style={{ position: "absolute", left: `${pos * 100}%`, marginLeft: -5, width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: colors.text }} />
        </View>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {["15", "18,5", "25", "30", "35", "40"].map((l) => (
          <Text key={l} style={{ color: colors.faint, fontSize: 10 }}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

function MeasureModal({
  visible,
  initial,
  female,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: Measure | null;
  female: boolean;
  onClose: () => void;
  onSave: (v: { waist_cm: number | null; hip_cm: number | null; neck_cm: number | null }) => Promise<void>;
}) {
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [busy, setBusy] = useState(false);
  const num = (s: string) => {
    const n = Number(s.replace(",", "."));
    return n > 0 ? n : null;
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        setWaist(initial?.waist_cm ? String(initial.waist_cm) : "");
        setNeck(initial?.neck_cm ? String(initial.neck_cm) : "");
        setHip(initial?.hip_cm ? String(initial.hip_cm) : "");
      }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose} />
        <View style={{ backgroundColor: colors.card, padding: space.xl, gap: space.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
          <Text style={[type.h2, { color: colors.text, fontSize: 20 }]}>Suas medidas (cm)</Text>
          <Muted style={{ fontSize: 13 }}>
            Cintura: na altura do umbigo, ao final de uma expiração normal. Pescoço: logo abaixo do pomo de adão.
            {female ? " Quadril: na parte mais larga do glúteo." : ""}
          </Muted>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Field label="Cintura" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" placeholder="85" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pescoço" value={neck} onChangeText={setNeck} keyboardType="decimal-pad" placeholder="38" />
            </View>
            {female && (
              <View style={{ flex: 1 }}>
                <Field label="Quadril" value={hip} onChangeText={setHip} keyboardType="decimal-pad" placeholder="100" />
              </View>
            )}
          </View>
          <Button
            title="Salvar"
            loading={busy}
            disabled={!num(waist)}
            onPress={async () => {
              setBusy(true);
              await onSave({ waist_cm: num(waist), neck_cm: num(neck), hip_cm: female ? num(hip) : null });
              setBusy(false);
            }}
          />
          <Button title="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
