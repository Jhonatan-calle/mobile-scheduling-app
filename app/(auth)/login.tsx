import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Input from "../../components/input.tsx";
import Button from "../../components/button.tsx";
import FormContainer from "../../components/formContainer.tsx";
// import { supabase } from "../../utils/supabase.ts";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    // setError(null);
    setLoading(true);
    //
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });
    //
    // if (error) {
    //   setError(error.message);
    //   setLoading(false);
    //   return;
    // }
    //
    // const userId = data.user?.id;
    // if (!userId) {
    //   setError("Usuario inválido");
    //   setLoading(false);
    //   return;
    // }
    //
    // const { data: profile, error: profileError } = await supabase
    //   .from("profiles")
    //   .select("role")
    //   .eq("id", userId)
    //   .single();
    //
    // if (profileError) {
    //   setError("No se pudo obtener el perfil");
    //   setLoading(false);
    //   return;
    // }
    //
    // if (profile.role === "ADMIN") {
    //   router.replace("/admin");
    // } else {
    //   router.replace("/worker");
    // }
    //
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Limpieza de Tapizados Río Cuarto</Text>
          <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>
        </View>

        <FormContainer>
          <Input
            label="Email"
            placeholder="correo@ejemplo. com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Button title="Ingresar" onPress={signIn} loading={loading} />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => {
              /* Navegar a recuperar contraseña */
            }}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </FormContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
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
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
});
