import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name={icon} color={color} size={size} />,
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.cardBorder },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={tab("Início", "home")} />
      <Tabs.Screen name="treino" options={tab("Treino", "barbell")} />
      <Tabs.Screen name="nutricao" options={tab("Nutrição", "restaurant")} />
      <Tabs.Screen name="perfil" options={tab("Perfil", "person")} />
    </Tabs>
  );
}
