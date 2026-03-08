import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import FormContainer from "../../components/FormContainer";
import SocialButton from "../../components/SocialButton";
import { supabase } from "../../supabase/supabase";

// Necesario para que funcione el OAuth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const redirectUrl = Linking.createURL("auth/callback", {
        scheme: "tapizadosrc",
      });

      console.log("🔵 Redirect URL generada:", redirectUrl);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError) {
        console.error("❌ Error OAuth:", oauthError);
        throw oauthError;
      }

      if (!data?.url) {
        throw new Error("No se pudo iniciar el flujo de OAuth.");
      }

      console.log("🔵 URL de Google que se abrirá:", data.url);

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "cancel" || result.type === "dismiss") {
        console.log("⚠️ Usuario canceló el login");
        return;
      }

      if (result.type !== "success") {
        console.error("❌ Error en WebBrowser:", result);
        throw new Error("No se pudo completar la autenticación.");
      }

      console.log("✅ WebBrowser success:", result.url);

      const parsedUrl = Linking.parse(result.url);
      const code =
        typeof parsedUrl.queryParams?.code === "string"
          ? parsedUrl.queryParams.code
          : undefined;

      if (!code) {
        console.error("❌ No hay code en la URL:", parsedUrl);
        throw new Error("No se recibió el código de autenticación.");
      }

      console.log("🔵 Code recibido, intercambiando por sesión...");

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("❌ Error al intercambiar code:", exchangeError);
        throw exchangeError;
      }

      console.log("✅ Sesión creada exitosamente");
      router.replace("/");
    } catch (err) {
      console.error("❌ Error general:", err);
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión con Google";

      setError(message);
      Alert.alert("Error", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    marginBottom: 48,
    alignItems: "center",
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
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
    textAlign: "center",
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
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    textAlign: "center",
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
