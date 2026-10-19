// Componentes visuais básicos reaproveitados em todas as telas.
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
import { colors, radius, space } from "@/theme";

export function Card({ children, style, onPress }: { children: ReactNode; style?: ViewStyle; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
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
  variant?: "primary" | "outline" | "ghost" | "danger";
  style?: ViewStyle;
}) {
  const isOff = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isOff}
      style={({ pressed }) => [
        styles.btn,
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "outline" && { borderWidth: 1, borderColor: colors.primary },
        variant === "danger" && { borderWidth: 1, borderColor: colors.danger },
        isOff && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.primaryText : colors.primary} />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "primary" && { color: colors.primaryText },
            variant === "outline" && { color: colors.primary },
            variant === "ghost" && { color: colors.muted },
            variant === "danger" && { color: colors.danger },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#777" style={styles.input} {...props} />
    </View>
  );
}

// Lista de opções em "pílulas" — substitui os selects e radios da versão web.
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
                if (multi && Array.isArray(value)) {
                  onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value]);
                } else onChange(o.value);
              }}
              style={[styles.pill, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={[styles.pillText, on && { color: colors.primaryText, fontWeight: "700" }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Seletor numérico com botões − e + (mais confortável que slider no celular).
export function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 10) / 10));
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value - step))} hitSlop={8}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>
          {value} <Text style={{ color: colors.muted, fontSize: 16 }}>{unit}</Text>
        </Text>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value + step))} hitSlop={8}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: any }) {
  return <Text style={[{ color: colors.muted, fontSize: 14 }, style]}>{children}</Text>;
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: space.lg,
  },
  btn: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  btnText: { fontSize: 16, fontWeight: "600", color: colors.text },
  label: { color: colors.muted, fontSize: 14, fontWeight: "500" },
  input: {
    backgroundColor: colors.input,
    color: colors.text,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.input,
  },
  pillText: { color: colors.text, fontSize: 14 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.input,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: space.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: colors.primary, fontSize: 24, fontWeight: "600" },
  stepValue: { color: colors.text, fontSize: 22, fontWeight: "700" },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" },
});
