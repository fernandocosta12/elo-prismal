import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { dayBounds } from "@/lib/dates";
import {
  MEAL_TYPES,
  analyzeMeal,
  getQuota,
  guessMealType,
  mealTypeLabel,
  type MealAnalysis,
  type QuotaStatus,
} from "@/lib/meals";
import { Button, Card, Choice, Field, Muted, Title, styles as ui } from "@/components/ui";
import { colors, radius, space } from "@/theme";

type Meal = {
  id: string;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion_size: string | null;
  meal_time: string;
};

type Mode = null | "text" | "photo" | "manual";

export default function Nutricao() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<Mode>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { start, end } = dayBounds();
    const [m, q] = await Promise.all([
      supabase
        .from("meal_logs")
        .select("id, meal_name, meal_type, calories, protein, carbs, fats, portion_size, meal_time")
        .eq("user_id", userId)
        .gte("meal_time", start)
        .lte("meal_time", end)
        .order("meal_time"),
      getQuota(),
    ]);
    setMeals(
      ((m.data ?? []) as any[]).map((r) => ({
        ...r,
        protein: Number(r.protein),
        carbs: Number(r.carbs),
        fats: Number(r.fats),
      }))
    );
    setQuota(q);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!profile) return null;

  const tot = meals.reduce(
    (s, m) => ({ kcal: s.kcal + m.calories, p: s.p + m.protein, c: s.c + m.carbs, f: s.f + m.fats }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
  const goal = {
    kcal: profile.daily_calories ?? 2000,
    p: profile.daily_protein ?? 0,
    c: profile.daily_carbs ?? 0,
    f: profile.daily_fats ?? 0,
  };

  const remove = (m: Meal) =>
    Alert.alert("Apagar refeição?", m.meal_name, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await supabase.from("meal_logs").delete().eq("id", m.id);
          load();
        },
      },
    ]);

  const grouped = MEAL_TYPES.map((t) => ({ ...t, items: meals.filter((m) => m.meal_type === t.value) })).filter(
    (g) => g.items.length
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: space.xl * 2 }}
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
        <Title>Nutrição</Title>

        {/* Resumo do dia */}
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text style={{ color: colors.text, fontSize: 34, fontWeight: "800" }}>{Math.round(tot.kcal)}</Text>
            <Muted>/ {goal.kcal} kcal</Muted>
          </View>
          <Bar value={tot.kcal / goal.kcal} />
          <View style={{ flexDirection: "row", gap: space.md }}>
            <MacroBar label="Proteína" v={tot.p} g={goal.p} color="#E57373" />
            <MacroBar label="Carbo" v={tot.c} g={goal.c} color="#FFB74D" />
            <MacroBar label="Gordura" v={tot.f} g={goal.f} color="#81C784" />
          </View>
        </Card>

        {/* Adicionar */}
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <AddBtn icon="camera" label="Foto" onPress={() => setMode("photo")} />
            <AddBtn icon="chatbubble-ellipses" label="Descrever" onPress={() => setMode("text")} />
            <AddBtn icon="create" label="Manual" onPress={() => setMode("manual")} />
          </View>
          {quota && (
            <Muted style={{ fontSize: 13, textAlign: "center" }}>
              {quota.remaining > 0
                ? `Análises por IA hoje: ${quota.remaining} de ${quota.limit} restantes`
                : `Você usou as ${quota.limit} análises por IA de hoje. O registro manual continua liberado.`}
            </Muted>
          )}
        </View>

        {/* Refeições do dia */}
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : grouped.length === 0 ? (
          <Card>
            <Muted style={{ textAlign: "center" }}>Nenhuma refeição registrada hoje.</Muted>
          </Card>
        ) : (
          grouped.map((g) => (
            <View key={g.value} style={{ gap: space.sm }}>
              <Text style={{ color: colors.muted, fontWeight: "700", textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>
                {g.label}
              </Text>
              {g.items.map((m) => (
                <Card key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "600" }} numberOfLines={2}>
                      {m.meal_name}
                    </Text>
                    <Muted style={{ fontSize: 12 }}>
                      P {Math.round(m.protein)}g · C {Math.round(m.carbs)}g · G {Math.round(m.fats)}g
                      {m.portion_size ? ` · ${m.portion_size}` : ""}
                    </Muted>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: "800" }}>{m.calories} kcal</Text>
                  <Pressable onPress={() => remove(m)} hitSlop={10} accessibilityLabel={`Apagar ${m.meal_name}`}>
                    <Ionicons name="trash-outline" size={18} color={colors.muted} />
                  </Pressable>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <AddMealModal
        mode={mode}
        userId={userId}
        quota={quota}
        onClose={() => setMode(null)}
        onSaved={() => {
          setMode(null);
          load();
        }}
      />
    </SafeAreaView>
  );
}

function AddBtn({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          alignItems: "center",
          gap: 6,
          paddingVertical: space.lg,
          borderRadius: radius.md,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={{ color: colors.text, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function Bar({ value, color = colors.primary }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.input, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color }} />
    </View>
  );
}

function MacroBar({ label, v, g, color }: { label: string; v: number; g: number; color: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Muted style={{ fontSize: 12 }}>{label}</Muted>
      <Text style={{ color: colors.text, fontWeight: "700" }}>
        {Math.round(v)}
        <Text style={{ color: colors.muted, fontWeight: "400" }}>/{Math.round(g)}g</Text>
      </Text>
      <Bar value={g ? v / g : 0} color={color} />
    </View>
  );
}

// ---------- Modal de adicionar refeição ----------

type Draft = {
  meal_name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  portion_size: string;
};

const emptyDraft: Draft = { meal_name: "", calories: "", protein: "", carbs: "", fats: "", portion_size: "" };

function AddMealModal({
  mode,
  userId,
  quota,
  onClose,
  onSaved,
}: {
  mode: Mode;
  userId?: string;
  quota: QuotaStatus | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState("");
  const [grams, setGrams] = useState("");
  const [photo, setPhoto] = useState<{ uri: string; base64: string; mime: string } | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [mealType, setMealType] = useState<string>(guessMealType());
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setText("");
    setGrams("");
    setPhoto(null);
    setAnalysis(null);
    setDraft(emptyDraft);
    setMealType(guessMealType());
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const noQuota = quota !== null && quota.remaining <= 0;
  const showForm = mode === "manual" || analysis !== null;

  const pickPhoto = async (source: "camera" | "library") => {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert("Permissão necessária", "Libere o acesso nas Configurações do iPhone para usar essa função.");
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], base64: true, quality: 0.4, allowsEditing: false };
    const res = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const a = res.assets[0];
    if (a.base64!.length * 0.75 > 4 * 1024 * 1024) {
      return Alert.alert("Foto muito grande", "Tente outra foto ou tire uma nova pelo app.");
    }
    setPhoto({ uri: a.uri, base64: a.base64!, mime: a.mimeType ?? "image/jpeg" });
  };

  const runAnalysis = async () => {
    setBusy(true);
    try {
      const r =
        mode === "photo"
          ? await analyzeMeal({
              mode: "photo",
              imageBase64: photo!.base64,
              mimeType: photo!.mime,
              grams: Number(grams) || undefined,
              text: text || undefined,
            })
          : await analyzeMeal({ mode: "text", text });
      setAnalysis(r);
      setDraft({
        meal_name: r.meal_name,
        calories: String(r.calories),
        protein: String(r.protein),
        carbs: String(r.carbs),
        fats: String(r.fats),
        portion_size: r.portion_size ?? "",
      });
    } catch (e: any) {
      Alert.alert("Não deu certo", e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!userId) return;
    const num = (s: string) => Number(String(s).replace(",", ".")) || 0;
    if (!draft.meal_name.trim()) return Alert.alert("Dê um nome para a refeição");
    if (num(draft.calories) <= 0) return Alert.alert("Informe as calorias");
    setBusy(true);
    const { error } = await supabase.from("meal_logs").insert({
      user_id: userId,
      meal_name: draft.meal_name.trim().slice(0, 80),
      meal_type: mealType,
      calories: Math.round(num(draft.calories)),
      protein: num(draft.protein),
      carbs: num(draft.carbs),
      fats: num(draft.fats),
      portion_size: draft.portion_size.trim() || null,
      meal_time: new Date().toISOString(),
    });
    setBusy(false);
    if (error) return Alert.alert("Não foi possível salvar", error.message);
    reset();
    onSaved();
  };

  const title = mode === "photo" ? "Refeição por foto" : mode === "text" ? "Descrever refeição" : "Registro manual";

  return (
    <Modal visible={mode !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.lg }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>{title}</Text>
          <Pressable onPress={close} hitSlop={10} accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          {/* Etapa 1: entrada para a IA */}
          {!showForm && noQuota && (
            <Card style={{ gap: space.md }}>
              <Text style={{ color: colors.text }}>Você já usou as {quota?.limit} análises por IA de hoje.</Text>
              <Muted>Amanhã o limite renova. Enquanto isso, registre manualmente.</Muted>
            </Card>
          )}

          {!showForm && !noQuota && mode === "text" && (
            <>
              <Muted>Escreva o que comeu, com as quantidades se souber.</Muted>
              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                placeholder="Ex: 2 ovos mexidos, 1 pão francês com manteiga e 1 café com leite"
                placeholderTextColor="#777"
                style={[ui.input, { minHeight: 110, textAlignVertical: "top" }]}
                maxLength={600}
              />
              <Button title="Calcular tabela nutricional" onPress={runAnalysis} loading={busy} disabled={text.trim().length < 2} />
            </>
          )}

          {!showForm && !noQuota && mode === "photo" && (
            <>
              {photo ? (
                <Image source={{ uri: photo.uri }} style={{ width: "100%", aspectRatio: 1, borderRadius: radius.md }} />
              ) : (
                <View style={{ flexDirection: "row", gap: space.sm }}>
                  <Button title="Tirar foto" onPress={() => pickPhoto("camera")} style={{ flex: 1 }} />
                  <Button title="Da galeria" variant="outline" onPress={() => pickPhoto("library")} style={{ flex: 1 }} />
                </View>
              )}
              <Field label="Peso do prato em gramas (opcional, melhora a precisão)" value={grams} onChangeText={setGrams} keyboardType="number-pad" placeholder="Ex: 350" />
              <Field label="Observação (opcional)" value={text} onChangeText={setText} placeholder="Ex: frango grelhado, arroz integral" />
              {photo && (
                <>
                  <Button title="Analisar foto" onPress={runAnalysis} loading={busy} />
                  <Button title="Trocar foto" variant="ghost" onPress={() => setPhoto(null)} />
                </>
              )}
            </>
          )}

          {/* Etapa 2: conferir e salvar */}
          {showForm && (
            <>
              {analysis && (
                <Card style={{ gap: space.sm }}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>O que a IA encontrou</Text>
                  {analysis.items.map((it, i) => (
                    <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
                      <Text style={{ color: colors.text, flex: 1 }}>{it.name}</Text>
                      <Muted>{Math.round(it.calories)} kcal</Muted>
                    </View>
                  ))}
                  {analysis.note ? <Muted style={{ fontSize: 13, marginTop: 4 }}>{analysis.note}</Muted> : null}
                  <Muted style={{ fontSize: 12 }}>Valores estimados. Ajuste abaixo se precisar.</Muted>
                </Card>
              )}

              <Field label="Nome da refeição" value={draft.meal_name} onChangeText={(v) => setDraft({ ...draft, meal_name: v })} placeholder="Ex: Prato feito" />
              <Choice label="Refeição" value={mealType} onChange={setMealType} options={MEAL_TYPES.map((m) => ({ value: m.value, label: m.label }))} />
              <View style={{ flexDirection: "row", gap: space.sm }}>
                <View style={{ flex: 1 }}>
                  <Field label="Calorias (kcal)" value={draft.calories} onChangeText={(v) => setDraft({ ...draft, calories: v })} keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Porção" value={draft.portion_size} onChangeText={(v) => setDraft({ ...draft, portion_size: v })} placeholder="Ex: 300 g" />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: space.sm }}>
                <View style={{ flex: 1 }}>
                  <Field label="Proteína (g)" value={draft.protein} onChangeText={(v) => setDraft({ ...draft, protein: v })} keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Carbo (g)" value={draft.carbs} onChangeText={(v) => setDraft({ ...draft, carbs: v })} keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Gordura (g)" value={draft.fats} onChangeText={(v) => setDraft({ ...draft, fats: v })} keyboardType="decimal-pad" />
                </View>
              </View>
              <Button title={`Salvar em ${mealTypeLabel(mealType)}`} onPress={save} loading={busy} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
