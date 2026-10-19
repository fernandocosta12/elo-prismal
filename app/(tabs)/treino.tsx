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
  findExercise,
  formatPace,
  searchExercises,
  workoutTitle,
  type Exercise,
  type ExerciseTemplate,
  type MuscleGroup,
} from "@/lib/exercises";
import { suggestWorkout } from "@/lib/suggest";
import { ExerciseAnimation, ExerciseDetail } from "@/components/ExerciseMedia";
import { Button, Card, Field, Muted, Section, Title, styles as ui } from "@/components/ui";
import { colors, radius, space, type } from "@/theme";

type Workout = {
  id: string;
  title: string;
  exercises: Exercise[];
  completed: boolean | null;
  scheduled_date: string | null;
};
type Run = { id: string; date: string; distance_km: number; duration_min: number; pace_sec_per_km: number | null };

export default function Treino() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const [today, setToday] = useState<Workout | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    if (!userId) return;
    const todayStr = toISODate();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const [w, h, r] = await Promise.all([
      supabase
        .from("workouts")
        .select("id, title, exercises, completed, scheduled_date")
        .eq("user_id", userId)
        .eq("scheduled_date", todayStr)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workouts")
        .select("id, title, exercises, completed, scheduled_date")
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

  const suggestion = useMemo(
    () => (profile ? suggestWorkout(profile, history.slice(0, 4).map((h) => h.title), offset) : null),
    [profile, history, offset]
  );

  // ---------- ações ----------
  const saveExercises = async (exercises: Exercise[]) => {
    if (!today) return;
    setToday({ ...today, exercises });
    const { error } = await supabase.from("workouts").update({ exercises }).eq("id", today.id);
    if (error) {
      Alert.alert("Não foi possível salvar", error.message);
      load();
    }
  };

  const createWorkout = async (title: string, exercises: Exercise[]) => {
    if (!userId) return;
    const { error } = await supabase.from("workouts").insert({
      user_id: userId,
      title,
      exercises,
      scheduled_date: toISODate(),
      completed: false,
    });
    if (error) return Alert.alert("Não foi possível criar o treino", error.message);
    load();
  };

  const addFromPicker = async (picked: ExerciseTemplate[], t: MuscleGroup | "livre" | null) => {
    setPickerOpen(false);
    const ex: Exercise[] = picked.map((p) => ({ name: p.name, sets: p.sets, reps: p.reps, rest: p.rest, notes: "", done: false }));
    if (today) return saveExercises([...today.exercises, ...ex]);
    createWorkout(workoutTitle(t), ex);
  };

  const setCompleted = async (completed: boolean) => {
    if (!today) return;
    setSaving(true);
    const { error } = await supabase.from("workouts").update({ completed }).eq("id", today.id);
    setSaving(false);
    if (error) return Alert.alert("Não foi possível salvar", error.message);
    setToday({ ...today, completed });
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
        contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: space.xxl * 2 }}
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
          // ---------- Treino de hoje ----------
          <View style={{ gap: space.md }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={[type.h2, { color: colors.text }]}>{today.title}</Text>
                <Muted>{today.completed ? "Concluído ✓" : `${doneCount} de ${today.exercises.length} feitos`}</Muted>
              </View>
              <Pressable onPress={deleteWorkout} hitSlop={10} accessibilityLabel="Apagar treino de hoje">
                <Ionicons name="trash-outline" size={20} color={colors.faint} />
              </Pressable>
            </View>

            {today.exercises.map((e, i) => (
              <ExerciseRow
                key={`${e.name}-${i}`}
                ex={e}
                onToggle={() => saveExercises(today.exercises.map((x, idx) => (idx === i ? { ...x, done: !x.done } : x)))}
                onOpen={() => setDetail(e.name)}
                onRemove={today.completed ? undefined : () => saveExercises(today.exercises.filter((_, idx) => idx !== i))}
              />
            ))}

            {!today.completed ? (
              <>
                <Button title="Adicionar exercício" variant="soft" onPress={() => setPickerOpen(true)} />
                <Button title="Concluir treino" onPress={() => setCompleted(true)} loading={saving} disabled={!today.exercises.length} />
              </>
            ) : (
              <Button title="Marcar como não concluído" variant="ghost" onPress={() => setCompleted(false)} loading={saving} />
            )}
          </View>
        ) : (
          // ---------- Sugestão do dia ----------
          suggestion && (
            <View style={{ gap: space.md }}>
              <Section
                right={
                  <Pressable onPress={() => setOffset((o) => o + 1)} hitSlop={10} accessibilityLabel="Trocar sugestão">
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>Trocar</Text>
                  </Pressable>
                }
              >
                Sugestão para hoje
              </Section>
              <Text style={[type.h2, { color: colors.text, fontSize: 22 }]}>{suggestion.title}</Text>
              <Muted>{suggestion.why}</Muted>
              {suggestion.exercises.map((e) => (
                <ExerciseRow key={e.name} ex={e} onOpen={() => setDetail(e.name)} />
              ))}
              <Button title="Começar este treino" onPress={() => createWorkout(suggestion.title, suggestion.exercises)} />
              <Button title="Montar do meu jeito" variant="ghost" onPress={() => setPickerOpen(true)} />
            </View>
          )
        )}

        {/* ---------- Corrida ---------- */}
        <Section>Corrida</Section>
        <Card style={{ gap: space.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={[type.big, { color: colors.text, fontSize: 28 }]}>
              {weekKm.toFixed(1)} <Text style={{ fontSize: 15, color: colors.muted, fontWeight: "500" }}>km na semana</Text>
            </Text>
          </View>
          <Muted>
            {todayRun
              ? `Hoje: ${todayRun.distance_km.toFixed(2)} km · ${Math.round(todayRun.duration_min)} min · ${formatPace(todayRun.pace_sec_per_km)}`
              : "Nenhuma corrida hoje."}
          </Muted>
          <Button title="Registrar corrida" variant="soft" onPress={() => setRunOpen(true)} style={{ marginTop: space.sm }} />
        </Card>

        {/* ---------- Histórico ---------- */}
        {history.length > 0 && (
          <>
            <Section>Anteriores</Section>
            <View style={{ gap: space.sm }}>
              {history.map((w) => (
                <View key={w.id} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.sm }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: w.completed ? colors.primary : colors.faint }} />
                  <Text style={{ color: colors.text, flex: 1 }}>{w.title}</Text>
                  <Muted style={{ fontSize: 13 }}>{formatDate(w.scheduled_date)}</Muted>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <ExercisePicker visible={pickerOpen} appending={!!today} onClose={() => setPickerOpen(false)} onConfirm={addFromPicker} onOpen={setDetail} />
      <ExerciseDetail name={detail} onClose={() => setDetail(null)} />
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

// Linha de exercício: miniatura animada (toque abre o "como fazer"), nome, séries e marcação
function ExerciseRow({ ex, onToggle, onOpen, onRemove }: { ex: Exercise; onToggle?: () => void; onOpen: () => void; onRemove?: () => void }) {
  const tpl = findExercise(ex.name);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: colors.card, borderRadius: radius.md, padding: space.sm, paddingRight: space.lg }}>
      <Pressable onPress={onOpen} accessibilityLabel={`Como fazer ${ex.name}`}>
        <ExerciseAnimation ex={tpl} size={64} rounded={radius.sm} />
      </Pressable>
      <Pressable onPress={onOpen} style={{ flex: 1 }}>
        <Text style={{ color: ex.done ? colors.muted : colors.text, fontWeight: "600", textDecorationLine: ex.done ? "line-through" : "none" }}>
          {ex.name}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
          {ex.sets}x {ex.reps}
          {ex.rest && ex.rest !== "0" ? ` · ${ex.rest}s` : ""}
          {tpl ? "  ·  Como fazer" : ""}
        </Text>
      </Pressable>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remover ${ex.name}`}>
          <Ionicons name="close" size={18} color={colors.faint} />
        </Pressable>
      )}
      {onToggle && (
        <Pressable onPress={onToggle} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: !!ex.done }} accessibilityLabel={`Feito: ${ex.name}`}>
          <Ionicons name={ex.done ? "checkmark-circle" : "ellipse-outline"} size={28} color={ex.done ? colors.primary : colors.faint} />
        </Pressable>
      )}
    </View>
  );
}

// ---------- Escolher exercícios ----------
function ExercisePicker({
  visible,
  appending,
  onClose,
  onConfirm,
  onOpen,
}: {
  visible: boolean;
  appending: boolean;
  onClose: () => void;
  onConfirm: (picked: ExerciseTemplate[], t: MuscleGroup | "livre" | null) => void;
  onOpen: (name: string) => void;
}) {
  const [group, setGroup] = useState<MuscleGroup | "livre">("fullbody");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<ExerciseTemplate[]>([]);
  const [customName, setCustomName] = useState("");
  const list = useMemo(() => searchExercises(query, group), [query, group]);
  const isPicked = (n: string) => picked.some((p) => p.name === n);
  const toggle = (e: ExerciseTemplate) => setPicked((prev) => (isPicked(e.name) ? prev.filter((p) => p.name !== e.name) : [...prev, e]));
  const close = () => {
    setPicked([]);
    setQuery("");
    onClose();
  };
  const addCustom = () => {
    const n = customName.trim();
    if (!n || isPicked(n)) return;
    setPicked((p) => [...p, { name: n, groups: [], sets: 3, reps: "10", rest: "60", equip: "corpo", img: null, steps: [] }]);
    setCustomName("");
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.xl, paddingBottom: space.md }}>
          <Text style={[type.h2, { color: colors.text, fontSize: 20 }]}>{appending ? "Adicionar exercícios" : "Montar treino"}</Text>
          <Pressable onPress={close} hitSlop={10} accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color={colors.muted} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: space.xl, gap: space.md }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {WORKOUT_TYPES.map((t) => {
              const on = t.id === group;
              return (
                <Pressable key={t.id} onPress={() => setGroup(t.id)} style={[ui.pill, on && { backgroundColor: colors.text }]}>
                  <Text style={[ui.pillText, on && { color: colors.bg, fontWeight: "600" }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar exercício" placeholderTextColor={colors.faint} style={ui.input} autoCorrect={false} />
        </View>
        <FlatList
          data={list}
          keyExtractor={(e) => e.name}
          contentContainerStyle={{ padding: space.xl, gap: space.sm, paddingBottom: 170 }}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          ListFooterComponent={
            <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg, alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <Field label="Não está na lista?" value={customName} onChangeText={setCustomName} placeholder="Nome do exercício" />
              </View>
              <Button title="Incluir" variant="soft" onPress={addCustom} />
            </View>
          }
          renderItem={({ item }) => {
            const on = isPicked(item.name);
            return (
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: on ? colors.primarySoft : colors.card, borderRadius: radius.md, padding: space.sm, paddingRight: space.lg }}>
                <Pressable onPress={() => onOpen(item.name)} accessibilityLabel={`Como fazer ${item.name}`}>
                  <ExerciseAnimation ex={item} size={56} rounded={radius.sm} playing={false} />
                </Pressable>
                <Pressable onPress={() => toggle(item)} style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>
                    {item.sets}x {item.reps}
                  </Text>
                </Pressable>
                <Pressable onPress={() => toggle(item)} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={item.name}>
                  <Ionicons name={on ? "checkmark-circle" : "add-circle-outline"} size={26} color={on ? colors.primary : colors.faint} />
                </Pressable>
              </View>
            );
          }}
        />
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: space.xl, backgroundColor: colors.bg }}>
          <Button
            title={picked.length ? `${appending ? "Adicionar" : "Criar treino com"} ${picked.length} exercício${picked.length > 1 ? "s" : ""}` : "Escolha os exercícios"}
            disabled={!picked.length}
            onPress={() => {
              onConfirm(picked, group);
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
          <Text style={[type.h2, { color: colors.text, fontSize: 20 }]}>Registrar corrida</Text>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Field label="Distância (km)" value={km} onChangeText={setKm} keyboardType="decimal-pad" placeholder="5" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Tempo (min)" value={min} onChangeText={setMin} keyboardType="decimal-pad" placeholder="30" />
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
