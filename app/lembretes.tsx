// Lembretes de água, refeições, treino e pesagem.
import { useEffect, useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_REMINDERS, loadReminders, remindersSupported, saveReminders, type ReminderSettings, type Time } from "@/lib/reminders";
import { Screen } from "@/components/Screen";
import { Button, Card, Muted } from "@/components/ui";
import { colors, radius, space } from "@/theme";

const fmt = (t: Time) => `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`;
const shift = (t: Time, min: number): Time => {
  const total = (t.h * 60 + t.m + min + 1440) % 1440;
  return { h: Math.floor(total / 60), m: total % 60 };
};

export default function Lembretes() {
  const [s, setS] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadReminders().then(setS);
  }, []);

  const set = (next: ReminderSettings) => {
    setS(next);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const ok = await saveReminders(s);
      setDirty(false);
      if (!ok) Alert.alert("Notificações bloqueadas", "Libere as notificações do app nos Ajustes do iPhone para receber os lembretes.");
      else Alert.alert("Lembretes salvos", remindersSupported ? "Pronto! Você vai receber os avisos nos horários escolhidos." : "As preferências ficaram salvas.");
    } catch (e: any) {
      Alert.alert("Não deu certo", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Lembretes" subtitle="Avisos no celular para não esquecer o básico.">
      {!remindersSupported && (
        <Card style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
          <Ionicons name="information-circle-outline" size={22} color={colors.water} />
          <Muted style={{ flex: 1 }}>
            No navegador o iPhone não permite avisos agendados. Os lembretes funcionam no app instalado (pelo Expo Go agora, e pela App Store
            quando publicarmos). Você já pode deixar tudo configurado aqui.
          </Muted>
        </Card>
      )}

      <Block icon="water-outline" title="Água" on={s.water.on} onToggle={(on) => set({ ...s, water: { ...s.water, on } })}>
        <Row label="Das">
          <Hour value={s.water.start} onChange={(start) => set({ ...s, water: { ...s.water, start: Math.min(start, s.water.end) } })} />
        </Row>
        <Row label="Até">
          <Hour value={s.water.end} onChange={(end) => set({ ...s, water: { ...s.water, end: Math.max(end, s.water.start) } })} />
        </Row>
        <Row label="A cada">
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[1, 2, 3].map((n) => (
              <Pill key={n} on={s.water.every === n} label={`${n}h`} onPress={() => set({ ...s, water: { ...s.water, every: n } })} />
            ))}
          </View>
        </Row>
      </Block>

      <Block icon="restaurant-outline" title="Refeições" on={s.meals.on} onToggle={(on) => set({ ...s, meals: { ...s.meals, on } })}>
        {(
          [
            ["cafe", "Café da manhã"],
            ["almoco", "Almoço"],
            ["lanche", "Lanche"],
            ["jantar", "Jantar"],
          ] as const
        ).map(([k, label]) => (
          <Row key={k} label={label}>
            <Clock value={s.meals[k]} onChange={(t) => set({ ...s, meals: { ...s.meals, [k]: t } })} />
          </Row>
        ))}
      </Block>

      <Block icon="barbell-outline" title="Treino" on={s.workout.on} onToggle={(on) => set({ ...s, workout: { ...s.workout, on } })}>
        <Row label="Todo dia às">
          <Clock value={s.workout.time} onChange={(time) => set({ ...s, workout: { ...s.workout, time } })} />
        </Row>
      </Block>

      <Block icon="scale-outline" title="Pesagem semanal" on={s.weigh.on} onToggle={(on) => set({ ...s, weigh: { ...s.weigh, on } })}>
        <Row label="Segunda às">
          <Clock value={s.weigh.time} onChange={(time) => set({ ...s, weigh: { ...s.weigh, time } })} />
        </Row>
        <Muted style={{ fontSize: 12 }}>Pesar toda semana deixa sua meta de calorias mais precisa.</Muted>
      </Block>

      <Button title="Salvar lembretes" onPress={save} loading={saving} disabled={!dirty} />
    </Screen>
  );
}

function Block({ icon, title, on, onToggle, children }: { icon: any; title: string; on: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <Card style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <Ionicons name={icon} size={22} color={on ? colors.primary : colors.muted} />
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", flex: 1 }}>{title}</Text>
        <Switch value={on} onValueChange={onToggle} trackColor={{ true: colors.primary, false: colors.input }} thumbColor="#fff" />
      </View>
      {on && <View style={{ gap: space.sm }}>{children}</View>}
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Muted>{label}</Muted>
      {children}
    </View>
  );
}

function Pill({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: on ? colors.primary : colors.input }}
    >
      <Text style={{ color: on ? colors.primaryText : colors.text, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function Adjust({ text, onMinus, onPlus }: { text: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Pressable onPress={onMinus} hitSlop={8} style={{ padding: 6, borderRadius: radius.sm, backgroundColor: colors.input }} accessibilityLabel="Mais cedo">
        <Ionicons name="remove" size={16} color={colors.text} />
      </Pressable>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", minWidth: 56, textAlign: "center", fontVariant: ["tabular-nums"] }}>{text}</Text>
      <Pressable onPress={onPlus} hitSlop={8} style={{ padding: 6, borderRadius: radius.sm, backgroundColor: colors.input }} accessibilityLabel="Mais tarde">
        <Ionicons name="add" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

const Clock = ({ value, onChange }: { value: Time; onChange: (t: Time) => void }) => (
  <Adjust text={fmt(value)} onMinus={() => onChange(shift(value, -15))} onPlus={() => onChange(shift(value, 15))} />
);

const Hour = ({ value, onChange }: { value: number; onChange: (h: number) => void }) => (
  <Adjust text={`${String(value).padStart(2, "0")}:00`} onMinus={() => onChange(Math.max(5, value - 1))} onPlus={() => onChange(Math.min(23, value + 1))} />
);
