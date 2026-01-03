import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { supabase } from "../../utils/supabase.tsx";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Usuario inválido");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      setError("No se pudo obtener el perfil");
      return;
    }

    if (profile.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/worker");
    }
  };

  return (
    <View>
      <Text>Login</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Ingresar" onPress={signIn} />

      {error && <Text>{error}</Text>}
    </View>
  );
}
