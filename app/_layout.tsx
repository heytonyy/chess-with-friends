import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import useColorScheme from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AppLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e5e5e5",
          },
          tabBarActiveTintColor: "#4A90E2",
          tabBarInactiveTintColor: "#8E8E93",
        }}
      >
        <Tabs.Screen
          name="(play)"
          options={{
            title: "Play",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="chess-pawn"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="(spectate)"
          options={{
            title: "Spectate",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="eye" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(auth)"
          options={{
            href: null, // This hides the auth tab from the tab bar
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
