import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  getWorkerById,
  updateWorker,
  archiveWorker,
  deleteWorker,
} from "../../../../utils/adminData";
import { supabase } from "../../../../supabase/supabase";
import Button from "../../../../components/Button";

export default function EditWorkerScreen() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  useEffect(() => {
    loadWorker();
  }, [id]);

  const loadWorker = async () => {
    try {
      setLoading(true);
      const worker = await getWorkerById(parseInt(id as string));
      setName(worker.profile.name);
      setCommissionRate(worker.commission_rate.toString());
      setIsActive((worker as any).is_active ?? true);

      const { data: apptData } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("worker_id", parseInt(id as string));
      const { data: retouchData } = await supabase
        .from("retouches")
        .select("id", { count: "exact", head: true })
        .eq("worker_id", parseInt(id as string));
      setAppointmentsCount((apptData?.length ?? 0) + (retouchData?.length ?? 0));

      setLoading(false);
    } catch (error) {
      console.error("Error loading worker:", error);
      Alert.alert("Error", "No se pudo cargar el trabajador");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del trabajador es requerido");
      return;
    }

    try {
      setSaving(true);
      await updateWorker(parseInt(id as string), {
        name: name.trim(),
        commission_rate: parseFloat(commissionRate) || 0,
      });
      Alert.alert("Éxito", "Trabajador actualizado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating worker:", error);
      Alert.alert("Error", "No se pudo actualizar el trabajador");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = () => {
    Alert.alert(
      "Archivar trabajador",
      "El trabajador dejará de aparecer en los selectores, pero su historial se conservará.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Archivar",
          style: "destructive",
          onPress: async () => {
            try {
              await archiveWorker(parseInt(id as string));
              Alert.alert("Archivado", "Trabajador archivado correctamente", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error("Error archiving worker:", error);
              Alert.alert("Error", "No se pudo archivar el trabajador");
            }
          },
        },
      ],
    );
  };

  const handleUnarchive = async () => {
    try {
      await updateWorker(parseInt(id as string), { is_active: true });
      Alert.alert("Desarchivado", "Trabajador activado nuevamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error unarchiving worker:", error);
      Alert.alert("Error", "No se pudo desarchivar el trabajador");
    }
  };

  const handleDelete = () => {
    if (appointmentsCount > 0) {
      Alert.alert(
        "No se puede eliminar",
        `El trabajador tiene ${appointmentsCount} turno(s) asignado(s). Solo puede archivarse.`,
      );
      return;
    }

    Alert.alert(
      "Eliminar trabajador",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteWorker(parseInt(id as string));
              if (result.deleted) {
                Alert.alert("Eliminado", "Trabajador eliminado correctamente", [
                  { text: "OK", onPress: () => router.back() },
                ]);
              } else {
                Alert.alert("Error", result.reason ?? "No se pudo eliminar");
              }
            } catch (error) {
              console.error("Error deleting worker:", error);
              Alert.alert("Error", "No se pudo eliminar el trabajador");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {!isActive && (
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedBadgeText}>Trabajador Archivado</Text>
            </View>
          )}

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={name}
            onChangeText={setName}
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
            title="Guardar Cambios"
            onPress={handleSave}
            loading={saving}
          />

          {isActive ? (
            <TouchableOpacity
              style={styles.archiveButton}
              onPress={handleArchive}
              activeOpacity={0.8}
            >
              <Text style={styles.archiveButtonText}>Archivar Trabajador</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.unarchiveButton}
              onPress={handleUnarchive}
              activeOpacity={0.8}
            >
              <Text style={styles.unarchiveButtonText}>Desarchivar Trabajador</Text>
            </TouchableOpacity>
          )}

          {appointmentsCount === 0 && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Eliminar Trabajador</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Editar Trabajador</Text>
        <Text style={styles.headerSubtitle}>Modificar datos del trabajador</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
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
  archivedBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  archivedBadgeText: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  actionsSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 32,
    gap: 12,
  },
  archiveButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  archiveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  unarchiveButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  unarchiveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
  },
  deleteButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#991B1B",
  },
});
