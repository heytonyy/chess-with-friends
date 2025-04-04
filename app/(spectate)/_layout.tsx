import { Stack } from "expo-router";
import { GameProvider } from "@/context/GameContext";

export default function PlayScreenLayout() {
  return (
    <GameProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Spectate", headerShown: false }}
        />
      </Stack>
    </GameProvider>
  );
}
