import { Stack } from "expo-router";

export default function AccountingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="expenses" />
      <Stack.Screen name="expenses/new" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
