import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { createWorker } from "../../../utils/adminData";
import Button from "../../../components/Button";

export default function NewWorkerScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del trabajador es requerido");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "El email del trabajador es requerido");
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setSaving(true);
      await createWorker({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        commission_rate: parseFloat(commissionRate) || 0,
      });

      Alert.alert("Éxito", "Trabajador creado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating worker:", error);
      Alert.alert("Error", "No se pudo crear el trabajador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nuevo Trabajador</Text>
          <Text style={styles.headerSubtitle}>Agregar un trabajador al taller</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Comisión (%)</Text>
          <View style={styles.commissionContainer}>
            <TextInput
              style={styles.commissionInput}
              placeholder="0"
              value={commissionRate}
              onChangeText={setCommissionRate}
              keyboardType="numeric"
            />
            <Text style={styles.commissionSuffix}>%</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Button
            title="Crear Trabajador"
            onPress={handleSave}
            loading={saving}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: "#111827",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  commissionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  commissionInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 14,
  },
  commissionSuffix: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  actionsSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 32,
  },
  cancelButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
});
