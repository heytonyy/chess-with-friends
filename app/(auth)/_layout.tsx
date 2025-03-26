import { Stack } from "expo-router";

export default function PlayScreenLayout() {
  return (
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Login", headerShown: false }}
        />
      </Stack>
  );
}
