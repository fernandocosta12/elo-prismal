import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tab = (title: string, icon: IconName, iconOn: IconName) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
    <Ionicons name={focused ? iconOn : icon} color={color} size={22} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarStyle: { backgroundColor: colors.bg, borderTopWidth: 0, elevation: 0 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={tab("Hoje", "ellipse-outline", "ellipse")} />
      <Tabs.Screen name="treino" options={tab("Treino", "barbell-outline", "barbell")} />
      <Tabs.Screen name="nutricao" options={tab("Nutrição", "leaf-outline", "leaf")} />
      <Tabs.Screen name="evolucao" options={tab("Evolução", "stats-chart-outline", "stats-chart")} />
      <Tabs.Screen name="perfil" options={tab("Perfil", "person-outline", "person")} />
    </Tabs>
  );
}
