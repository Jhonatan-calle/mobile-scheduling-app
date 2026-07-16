import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert } from "react-native";
import * as Updates from "expo-updates";

export default function RootLayout() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
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
        console.log("Error checking updates:", error);
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
