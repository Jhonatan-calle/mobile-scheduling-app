import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import FormContainer from "../../components/FormContainer";
import SocialButton from "../../components/SocialButton";
// import { supabase } from "../../utils/supabase";
// import * as WebBrowser from "expo-web-browser";
// import * as Linking from "expo-linking";

// Necesario para que funcione el OAuth
// WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    // setError(null);
    //
    // try {
    //   const redirectUrl = Linking.createURL("/(auth)/login");
    //
    //   const { data, error } = await supabase. auth.signInWithOAuth({
    //     provider: "google",
    //     options: {
    //       redirectTo: redirectUrl,
    //       skipBrowserRedirect: false,
    //     },
    //   });
    //
    //   if (error) {
    //     setError(error.message);
    //     Alert.alert("Error", error.message);
    //     setGoogleLoading(false);
    //     return;
    //   }
    //
    //   // Abrir navegador para autenticación
    //   if (data?. url) {
    //     const result = await WebBrowser.openAuthSessionAsync(
    //       data.url,
    //       redirectUrl
    //     );
    //
    //     if (result.type === "success") {
    //       // La autenticación fue exitosa
    //       // El listener en _layout.tsx manejará la redirección
    //       console.log("Autenticación exitosa");
    //     } else if (result.type === "cancel") {
    //       Alert.alert("Cancelado", "Inicio de sesión cancelado");
    //     }
    //   }
    // } catch (err) {
    //   console.error("Error con Google:", err);
    //   setError("Error al iniciar sesión con Google");
    //   Alert.alert("Error", "No se pudo iniciar sesión con Google");
    // } finally {
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.replace("/admin");
    setGoogleLoading(false);
    // }
  };

  return (
    <View style={styles. container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.icon}>🧼</Text>
          <Text style={styles.title}>
            Limpieza de Tapizados{"\n"}Río Cuarto
          </Text>
          <Text style={styles.subtitle}>
            Gestiona tus turnos y horarios
          </Text>
        </View>

        {/* Formulario */}
        <FormContainer>
          <Text style={styles.welcomeText}>
            Bienvenido
          </Text>
          <Text style={styles.instructionText}>
            Inicia sesión con tu cuenta de Google para continuar
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <SocialButton
            provider="google"
            onPress={signInWithGoogle}
            loading={googleLoading}
          />

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Solo empleados autorizados pueden acceder
            </Text>
          </View>
        </FormContainer>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al continuar, aceptas nuestros términos y condiciones
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex:  1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    marginBottom: 48,
    alignItems: "center",
  },
  icon:  {
    fontSize: 64,
    marginBottom: 16,
  },
  title:  {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle:  {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign:  "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor:  "#EFF6FF",
    borderRadius:  12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoText: {
    fontSize: 14,
    color:  "#1E40AF",
    textAlign:  "center",
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
