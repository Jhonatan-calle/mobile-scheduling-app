import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "../supabase/supabase";

export default function Index() {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // por ahora entra por aqui
      router.replace("/auth/login");
      return;
    }

    //TODO: esto hay que adaptarlo a la estructura real de la base de datos
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error) {
      router.replace("/auth/login");
      return;
    }

    if (profile?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/worker");
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
});
