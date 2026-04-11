import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
export default function Index() {
  return (
    <View style={styles.container}>
      <Text>vista administrador de perfiles aun no implementada</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Volver</Text>
      </TouchableOpacity>
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
