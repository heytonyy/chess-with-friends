import { Stack } from "expo-router";
// import { GameProvider } from "../context/GameContext";

export default function PlayScreenLayout() {
  return (
    <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Play", headerShown: false }}
        />
    </Stack>
  );
}
