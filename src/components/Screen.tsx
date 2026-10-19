// Tela empilhada com botão de voltar, título e subtítulo.
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Muted } from "./ui";
import { colors, space, type } from "@/theme";

export function Screen({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.lg, paddingTop: space.sm }}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} hitSlop={12} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        {right}
      </View>
      <ScrollView
        contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, gap: space.lg, paddingBottom: space.xxl * 2 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 4 }}>
          <Text style={[type.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Muted>{subtitle}</Muted> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
