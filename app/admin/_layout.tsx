import { Tabs } from "expo-router";
import { Text, Platform } from "react-native";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 88,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs. Screen
        name="dashboard"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Citas",
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workers"
        options={{
          title: "Trabajadores",
          tabBarIcon: ({ color }) => <TabIcon emoji="👥" color={color} />,
        }}
      />
      <Tabs.Screen
        name="accounting"
        options={{
          title: "Contabilidad",
          tabBarIcon: ({ color }) => <TabIcon emoji="💰" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }:  { emoji: string; color: string }) {
  return (
    <Text style={{ fontSize: 24, opacity: color === "#3B82F6" ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}
