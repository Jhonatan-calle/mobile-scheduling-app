import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const Updates = require("expo-updates");
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert("Actualización", "Descargando nueva versión...");
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Listo",
            "Actualización descargada. ¿Reiniciar ahora?",
            [
              { text: "Ahora", onPress: () => Updates.reloadAsync() },
              { text: "Después", style: "cancel" },
            ]
          );
        }
      } catch (error) {
        console.log("Update check skipped:", error);
      }
    }

    if (!__DEV__) {
      checkForUpdates();
    }
  }, []);

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
