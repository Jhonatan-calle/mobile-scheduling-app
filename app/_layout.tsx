import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";


export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#F9FAFB" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      ></Stack>
    </>
  );
}
