import { Alert, Linking, Platform } from "react-native";

export const handleCall = async (dirtyPhoneNumber: string) => {
  const phoneNumber = dirtyPhoneNumber.replace(/\s/g, ""); // Eliminar espacios

  // Limpiar el número (eliminar guiones, paréntesis, etc.)
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  // Formatear según la plataforma
  let phoneUrl = "";
  if (Platform.OS === "android") {
    phoneUrl = `tel:${cleanNumber}`;
  } else if (Platform.OS === "ios") {
    phoneUrl = `tel:${cleanNumber}`; // Cambié telprompt por tel para mayor compatibilidad
  } else {
    phoneUrl = `tel:${cleanNumber}`;
  }

  console.log("Intentando llamar a:", phoneUrl); // Para debug

  try {
    // Primero verificamos si se puede abrir URLs en general
    const canOpen = await Linking.canOpenURL(phoneUrl);

    console.log("¿Puede abrir URL?", canOpen); // Para debug

    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      // Si no puede, mostramos opciones alternativas
      Alert.alert("Llamar ", phoneNumber, [
        {
          text: "Llamar",
          onPress: async () => {
            try {
              // Intentar forzar la apertura
              await Linking.openURL(phoneUrl);
            } catch (err) {
              console.error("Error al forzar llamada:", err);
              // Última opción: abrir el marcador con el número
              Alert.alert(
                "Número de teléfono",
                `Por favor marca manualmente:  ${phoneNumber}`,
              );
            }
          },
        },
        {
          text: "Enviar WhatsApp",
          onPress: () => handleWhatsApp(cleanNumber),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]);
    }
  } catch (error) {
    console.error("Error al intentar llamar:", error);

    // Fallback:  mostrar el número para copiar o usar manualmente
    Alert.alert("Contactar cliente", `Número:  ${phoneNumber}`, [
      {
        text: "Llamar de todas formas",
        onPress: async () => {
          try {
            await Linking.openURL(phoneUrl);
          } catch (err) {
            Alert.alert("Error", "No se pudo abrir el marcador telefónico");
          }
        },
      },
      {
        text: "WhatsApp",
        onPress: () => handleWhatsApp(cleanNumber),
      },
      {
        text: "Cerrar",
        style: "cancel",
      },
    ]);
  }
};

const handleWhatsApp = async (phoneNumber: string) => {
  const whatsappNumber = "+54" + phoneNumber;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      Alert.alert("Error", "WhatsApp no está instalado");
    }
  } catch (error) {
    console.error("Error abriendo WhatsApp:", error);
    Alert.alert("Error", "No se pudo abrir WhatsApp");
  }
};
