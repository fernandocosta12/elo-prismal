import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/dates";
import {
  WORKOUT_TYPES,
  formatPace,
  searchExercises,
  workoutTitle,
  type Exercise,
  type ExerciseTemplate,
  type MuscleGroup,
} from "@/lib/exercises";
import { Button, Card, Field, Muted, Title, styles as ui } from "@/components/ui";
import { colors, radius, space } from "@/theme";

type Workout = {
  id: string;
  title: string;
  exercises: Exercise[];
  completed: boolean | null;
  scheduled_date: string | null;
  duration: number | null;
};

type Run = { id: string; date: string; distance_km: number; duration_min: number; pace_sec_per_km: number | null };

export default function Treino() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [today, setToday] = useState<Workout | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const todayStr = toISODate();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const [w, h, r] = await Promise.all([
      supabase
        .from("workouts")
        .select("id, title, exercises, completed, scheduled_date, duration")
        .eq("user_id", userId)
        .eq("scheduled_date", todayStr)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workouts")
        .select("id, title, exercises, completed, scheduled_date, duration")
        .eq("user_id", userId)
        .lt("scheduled_date", todayStr)
        .order("scheduled_date", { ascending: false })
        .limit(10),
      supabase
        .from("run_logs")
        .select("id, date, distance_km, duration_min, pace_sec_per_km")
        .eq("user_id", userId)
        .gte("date", toISODate(weekAgo))
        .order("date", { ascending: false }),
    ]);

    setToday((w.data as Workout) ?? null);
    setHistory((h.data as Workout[]) ?? []);
    setRuns(((r.data ?? []) as any[]).map((x) => ({ ...x, distance_km: Number(x.distance_km), duration_min: Number(x.duration_min) })));
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ---------- ações do treino de hoje ----------

  const saveExercises = async (exercises: Exercise[]) => {
    if (!today) return;
    setToday({ ...today, exercises }); // atualiza a tela na hora
    const { error } = await supabase.from("workouts").update({ exercises }).eq("id", today.id);
    if (error) {
      Alert.alert("Não foi possível salvar", error.message);
      load();
    }
  };

  const toggleDone = (i: number) => {
    if (!today) return;
    const ex = today.exercises.map((e, idx) => (idx === i ? { ...e, done: !e.done } : e));
    saveExercises(ex);
  };

  const removeExercise = (i: number) => {
    if (!today) return;
    saveExercises(today.exercises.filter((_, idx) => idx !== i));
  };

  const setCompleted = async (completed: boolean) => {
    if (!today) return;
    setSaving(true);
    const { error } = await supabase.from("workouts").update({ completed }).eq("id", today.id);
    setSaving(false);
    if (error) return Alert.alert("Não foi possível salvar", error.message);
    setToday({ ...today, completed });
  };

  const createOrAppend = async (picked: ExerciseTemplate[], type: MuscleGroup | "livre" | null) => {
    if (!userId || picked.length === 0) return;
    const newEx: Exercise[] = picked.map((p) => ({ name: p.name, sets: p.sets, reps: p.reps, rest: p.rest, notes: "", done: false }));
    setPickerOpen(false);
    if (today) {
      await saveExercises([...today.exercises, ...newEx]);
      return;
    }
    const { error } = await supabase.from("workouts").insert({
      user_id: userId,
      title: workoutTitle(type),
      exercises: newEx,
      scheduled_date: toISODate(),
      completed: false,
    });
    if (error) return Alert.alert("Não foi possível criar o treino", error.message);
    load();
  };

  const deleteWorkout = () => {
    if (!today) return;
    Alert.alert("Apagar o treino de hoje?", today.title, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("workouts").delete().eq("id", today.id);
          if (error) return Alert.alert("Não foi possível apagar", error.message);
          load();
        },
      },
    ]);
  };

  const weekKm = runs.reduce((s, r) => s + r.distance_km, 0);
  const todayRun = runs.find((r) => r.date === toISODate());
  const doneCount = today?.exercises.filter((e) => e.done).length ?? 0;

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
        <Title>Treino</Title>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : today ? (
          <Card style={{ gap: space.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>{today.title}</Text>
                <Muted>
                  {today.completed ? "✓ Concluído" : `${doneCount} de ${today.exercises.length} exercícios feitos`}
                </Muted>
              </View>
              <Pressable onPress={deleteWorkout} hitSlop={10} accessibilityLabel="Apagar treino de hoje">
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            </View>

            {today.exercises.length === 0 && <Muted>Sem exercícios. Adicione abaixo.</Muted>}
            {today.exercises.map((e, i) => (
              <View key={`${e.name}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                <Pressable
                  onPress={() => toggleDone(i)}
                  hitSlop={8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!e.done }}
                  accessibilityLabel={e.name}
                >
                  <Ionicons
                    name={e.done ? "checkmark-circle" : "ellipse-outline"}
                    size={28}
                    color={e.done ? colors.primary : colors.muted}
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: e.done ? colors.muted : colors.text,
                      fontWeight: "600",
                      textDecorationLine: e.done ? "line-through" : "none",
                    }}
                  >
                    {e.name}
                  </Text>
                  <Muted style={{ fontSize: 12 }}>
                    {e.sets}x {e.reps}
                    {e.rest && e.rest !== "0" ? ` · descanso ${e.rest}s` : ""}
                  </Muted>
                </View>
                {!today.completed && (
                  <Pressable onPress={() => removeExercise(i)} hitSlop={8} accessibilityLabel={`Remover ${e.name}`}>
                    <Ionicons name="close" size={18} color={colors.muted} />
                  </Pressable>
                )}
              </View>
            ))}

            {!today.completed ? (
              <>
                <Button title="+ Adicionar exercício" variant="outline" onPress={() => setPickerOpen(true)} />
                <Button title="Concluir treino" onPress={() => setCompleted(true)} loading={saving} disabled={today.exercises.length === 0} />
              </>
            ) : (
              <Button title="Marcar como não concluído" variant="ghost" onPress={() => setCompleted(false)} loading={saving} />
            )}
          </Card>
        ) : (
          <Card style={{ gap: space.md, alignItems: "center" }}>
            <Ionicons name="barbell" size={36} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 17 }}>Nenhum treino hoje</Text>
            <Muted style={{ textAlign: "center" }}>Monte seu treino escolhendo os exercícios.</Muted>
            <Button title="Montar treino de hoje" onPress={() => setPickerOpen(true)} style={{ alignSelf: "stretch" }} />
          </Card>
        )}

        {/* Corrida */}
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>Corrida</Text>
            <Ionicons name="walk" size={22} color={colors.primary} />
          </View>
          {todayRun ? (
            <Muted>
              Hoje: {todayRun.distance_km.toFixed(2)} km em {Math.round(todayRun.duration_min)} min · {formatPace(todayRun.pace_sec_per_km)}
            </Muted>
          ) : (
            <Muted>Nenhuma corrida hoje.</Muted>
          )}
          <Muted>Últimos 7 dias: {weekKm.toFixed(1)} km</Muted>
          <Button title="Registrar corrida" variant="outline" onPress={() => setRunOpen(true)} />
        </Card>

        {/* Histórico */}
        {history.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Text style={{ color: colors.muted, fontWeight: "700", textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>
              Treinos anteriores
            </Text>
            {history.map((w) => (
              <Card key={w.id} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md }}>
                <Ionicons
                  name={w.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={w.completed ? colors.primary : colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{w.title}</Text>
                  <Muted style={{ fontSize: 12 }}>
                    {formatDate(w.scheduled_date)} · {Array.isArray(w.exercises) ? w.exercises.length : 0} exercícios
                  </Muted>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <ExercisePicker visible={pickerOpen} appending={!!today} onClose={() => setPickerOpen(false)} onConfirm={createOrAppend} />
      <RunModal
        visible={runOpen}
        onClose={() => setRunOpen(false)}
        onSave={async (km, min) => {
          if (!userId) return;
          const { error } = await supabase.from("run_logs").insert({
            user_id: userId,
            date: toISODate(),
            distance_km: km,
            duration_min: min,
            pace_sec_per_km: Math.round((min * 60) / km),
          });
          if (error) return Alert.alert("Não foi possível salvar", error.message);
          setRunOpen(false);
          load();
        }}
      />
    </SafeAreaView>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

// ---------- Escolher exercícios ----------

function ExercisePicker({
  visible,
  appending,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  appending: boolean;
  onClose: () => void;
  onConfirm: (picked: ExerciseTemplate[], type: MuscleGroup | "livre" | null) => void;
}) {
  const [type, setType] = useState<MuscleGroup | "livre">("fullbody");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<ExerciseTemplate[]>([]);
  const [customName, setCustomName] = useState("");

  const list = useMemo(() => searchExercises(query, type), [query, type]);
  const isPicked = (n: string) => picked.some((p) => p.name === n);
  const toggle = (e: ExerciseTemplate) =>
    setPicked((prev) => (isPicked(e.name) ? prev.filter((p) => p.name !== e.name) : [...prev, e]));

  const addCustom = () => {
    const n = customName.trim();
    if (!n || isPicked(n)) return;
    setPicked((p) => [...p, { name: n, groups: [], sets: 3, reps: "10", rest: "60" }]);
    setCustomName("");
  };

  const close = () => {
    setPicked([]);
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.lg }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>{appending ? "Adicionar exercícios" : "Montar treino"}</Text>
          <Pressable onPress={close} hitSlop={10} accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color={colors.muted} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {WORKOUT_TYPES.map((t) => {
              const on = t.id === type;
              return (
                <Pressable key={t.id} onPress={() => setType(t.id)} style={[ui.pill, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={[ui.pillText, on && { color: colors.primaryText, fontWeight: "700" }]}>
                    {t.emoji} {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar exercício"
            placeholderTextColor="#777"
            style={ui.input}
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={list}
          keyExtractor={(e) => e.name}
          contentContainerStyle={{ padding: space.lg, gap: space.sm, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Muted>Nenhum exercício encontrado. Adicione um com o seu nome abaixo.</Muted>}
          ListFooterComponent={
            <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.md, alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <Field label="Exercício que não está na lista" value={customName} onChangeText={setCustomName} placeholder="Ex: Remada na máquina" />
              </View>
              <Button title="Incluir" variant="outline" onPress={addCustom} />
            </View>
          }
          renderItem={({ item }) => {
            const on = isPicked(item.name);
            return (
              <Pressable
                onPress={() => toggle(item)}
                style={[
                  { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md, borderRadius: radius.sm, borderWidth: 1 },
                  on ? { borderColor: colors.primary, backgroundColor: "rgba(212,175,55,0.12)" } : { borderColor: colors.cardBorder, backgroundColor: colors.card },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                <Ionicons name={on ? "checkmark-circle" : "add-circle-outline"} size={24} color={on ? colors.primary : colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{item.name}</Text>
                  <Muted style={{ fontSize: 12 }}>
                    {item.sets}x {item.reps}
                  </Muted>
                </View>
              </Pressable>
            );
          }}
        />

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: space.lg,
            paddingBottom: space.xl,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          <Button
            title={picked.length ? `${appending ? "Adicionar" : "Criar treino com"} ${picked.length} exercício${picked.length > 1 ? "s" : ""}` : "Escolha os exercícios"}
            disabled={!picked.length}
            onPress={() => {
              onConfirm(picked, type);
              setPicked([]);
              setQuery("");
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- Registrar corrida ----------

function RunModal({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (km: number, min: number) => Promise<void> }) {
  const [km, setKm] = useState("");
  const [min, setMin] = useState("");
  const [busy, setBusy] = useState(false);
  const kmN = Number(km.replace(",", "."));
  const minN = Number(min.replace(",", "."));
  const valid = kmN > 0 && kmN < 200 && minN > 0 && minN < 1440;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose} />
        <View style={{ backgroundColor: colors.card, padding: space.xl, gap: space.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>Registrar corrida</Text>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Field label="Distância (km)" value={km} onChangeText={setKm} keyboardType="decimal-pad" placeholder="5" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Tempo (minutos)" value={min} onChangeText={setMin} keyboardType="decimal-pad" placeholder="30" />
            </View>
          </View>
          {valid && <Muted>Ritmo: {formatPace((minN * 60) / kmN)}</Muted>}
          <Button
            title="Salvar"
            disabled={!valid}
            loading={busy}
            onPress={async () => {
              setBusy(true);
              await onSave(kmN, minN);
              setBusy(false);
              setKm("");
              setMin("");
            }}
          />
          <Button title="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
