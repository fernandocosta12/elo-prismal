import { Image, Text, View } from "react-native";
import { colors } from "@/theme";

export function Avatar({ uri, name, size = 44 }: { uri?: string | null; name?: string | null; size?: number }) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.input,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel={name ? `Foto de ${name}` : "Foto de perfil"}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text style={{ color: colors.muted, fontWeight: "600", fontSize: size * 0.36 }}>{initials || "•"}</Text>
      )}
    </View>
  );
}
