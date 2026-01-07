import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year:  'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles. greeting}>¡Hola, Admin!</Text>
        <Text style={styles.date}>{today}</Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => router.push("/admin/profile")}
      >
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
    marginTop:  4,
    textTransform: "capitalize",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: 20,
  },
});
