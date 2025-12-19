import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "transparentModal",
        animation: "fade",
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen name="log-activity" />
      <Stack.Screen name="upgrade" />
      <Stack.Screen name="reward-detail" />
      <Stack.Screen name="badge-detail" />
      <Stack.Screen name="reset-challenge" />
      <Stack.Screen name="giveaway" />
    </Stack>
  );
}
