import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Muted } from "./ui";
import { colors, space } from "@/theme";

export function EmBreve({ title, icon, text }: { title: string; icon: any; text: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl, gap: space.md }}>
        <Ionicons name={icon} size={48} color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>{title}</Text>
        <Muted style={{ textAlign: "center" }}>{text}</Muted>
      </View>
    </SafeAreaView>
  );
}
