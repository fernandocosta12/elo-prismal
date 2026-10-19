// Componentes visuais básicos (estilo minimalista: sem bordas, superfícies suaves).
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, radius, space, type } from "@/theme";

export function Card({ children, style, onPress }: { children: ReactNode; style?: ViewStyle | ViewStyle[]; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style as any, pressed && { opacity: 0.8 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style as any]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost" | "danger" | "soft";
  style?: ViewStyle;
}) {
  const isOff = disabled || loading;
  const bg =
    variant === "primary" ? colors.primary : variant === "soft" || variant === "outline" ? colors.input : "transparent";
  const fg =
    variant === "primary" ? colors.primaryText : variant === "danger" ? colors.danger : variant === "ghost" ? colors.muted : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isOff}
      style={({ pressed }) => [styles.btn, { backgroundColor: bg }, isOff && { opacity: 0.45 }, pressed && { opacity: 0.75 }, style]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.btnText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: space.sm }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.faint} style={styles.input} {...props} />
    </View>
  );
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
  multi,
}: {
  label: string;
  value: T | T[];
  options: { value: T; label: string }[];
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  const selected = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <View style={{ gap: space.sm }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {options.map((o) => {
          const on = selected(o.value);
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                if (multi && Array.isArray(value)) onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value]);
                else onChange(o.value);
              }}
              style={[styles.pill, on && { backgroundColor: colors.text }]}
            >
              <Text style={[styles.pillText, on && { color: colors.bg, fontWeight: "600" }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Stepper({
  label, value, onChange, min, max, step = 1, unit,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit: string }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 10) / 10));
  return (
    <View style={{ gap: space.sm }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value - step))} hitSlop={8} accessibilityLabel={`Diminuir ${label}`}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>
          {value} <Text style={{ color: colors.muted, fontSize: 15, fontWeight: "500" }}>{unit}</Text>
        </Text>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value + step))} hitSlop={8} accessibilityLabel={`Aumentar ${label}`}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={[type.title, { color: colors.text }]}>{children}</Text>;
}

export function Section({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: space.sm }}>
      <Text style={[type.label, { color: colors.muted }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: any }) {
  return <Text style={[{ color: colors.muted, fontSize: 14, lineHeight: 20 }, style]}>{children}</Text>;
}

export function Bar({ value, color = colors.primary, height = 6 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <View style={{ height, borderRadius: radius.pill, backgroundColor: colors.input, overflow: "hidden" }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: radius.pill }} />
    </View>
  );
}

export const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: space.lg },
  btn: { minHeight: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: space.lg },
  btnText: { fontSize: 16, fontWeight: "600" },
  label: { color: colors.muted, fontSize: 13, fontWeight: "500" },
  input: {
    backgroundColor: colors.input,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: space.lg,
    paddingVertical: 15,
    fontSize: 16,
  },
  pill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.input },
  pillText: { color: colors.text, fontSize: 14 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.input,
    borderRadius: radius.sm,
    padding: space.sm,
  },
  stepBtn: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  stepBtnText: { color: colors.text, fontSize: 22, fontWeight: "500" },
  stepValue: { color: colors.text, fontSize: 22, fontWeight: "700" },
});
