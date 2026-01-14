import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
// import { supabase } from "../utils/supabase";

export default function Index() {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    // const { data: { session } } = await supabase.auth.getSession();
    //
    // if (!session)    //   router.replace("/(auth)/login");
    //   return;
    // }
    //
    // const { data: profile } = await supabase
    //   . from("profiles")
    //   .select("role")
    //   .eq("id", session.user.id)
    //   .single();
    //
    // if (profile?. role === "ADMIN") {
    //   router.replace("/(admin)");
    // } else {
    //   router.replace("/(worker)");
    // }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.replace("/auth/login");
    
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
