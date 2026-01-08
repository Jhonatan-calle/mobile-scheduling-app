import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";

export default function RetouchDetailScreen() {
  const { id } = useLocalSearchParams();
  const [retouch, setRetouch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRetouch();
  }, []);

  const loadRetouch = async () => {
    try {
      // Mock: Cargar repaso
      const mockRetouch = {
        id: parseInt(id as string),
        appointment_id: 1,
        worker_id: 1,
        time: new Date().toISOString(),
        address: "Av. Colón 123",
        reason: "Cliente reportó manchas persistentes en el lateral",
        estimate_time: 60,
        status: "pending",
        created_at: new Date().toISOString(),
        appointment: {
          id: 1,
          client: {
            name: "Juan Pérez",
            phone_number: "351 234 5678",
          },
          service_details: "Limpieza de sillón 3 cuerpos",
        },
        worker: {
          id: 1,
          profile: {
            name: "Carlos González",
          },
        },
      };

      setRetouch(mockRetouch);
      setLoading(false);
    } catch (error) {
      console.error("Error loading retouch:", error);
      Alert.alert("Error", "No se pudo cargar el repaso");
      router.back();
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const statusLabels: any = {
      pending: "Pendiente",
      in_progress: "En curso",
      completed: "Completado",
      cancelled: "Cancelado",
    };

    Alert.alert(
      "Cambiar estado",
      `¿Cambiar estado a "${statusLabels[newStatus]}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            // TODO: Actualizar en Supabase
            setRetouch({ ...retouch, status: newStatus });
            Alert.alert("¡Listo!", "Estado actualizado correctamente");
          },
        },
      ]
    );
  };

  if (loading || !retouch) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RetouchHeader retouchId={id as string} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatusSection retouch={retouch} onStatusChange={handleStatusChange} />
        <AppointmentInfoSection retouch={retouch} />
        <RetouchDetailsSection retouch={retouch} />
        <WorkerInfoSection retouch={retouch} />
        <ActionButtonsSection retouch={retouch} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function RetouchHeader({ retouchId }: { retouchId: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Retoque #{retouchId}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ============================================================================
// ESTADO
// ============================================================================
function StatusSection({ retouch, onStatusChange }: any) {
  const statusConfig: any = {
    pending: { label: "Pendiente", color: "#F59E0B", icon: "⏳" },
    in_progress: { label: "En curso", color: "#3B82F6", icon: "🔄" },
    completed: { label: "Completado", color: "#10B981", icon: "✅" },
    cancelled: { label: "Cancelado", color: "#EF4444", icon: "❌" },
  };

  const config = statusConfig[retouch.status];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Estado del Retoque</Text>

      <View style={[styles.statusCard, { borderColor: config.color }]}>
        <Text style={styles.statusIcon}>{config.icon}</Text>
        <Text style={[styles.statusLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>

      <View style={styles.statusActions}>
        {retouch.status === "pending" && (
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: "#3B82F6" }]}
            onPress={() => onStatusChange("in_progress")}
          >
            <Text style={styles.statusButtonText}>Iniciar</Text>
          </TouchableOpacity>
        )}

        {retouch.status === "in_progress" && (
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: "#10B981" }]}
            onPress={() => onStatusChange("completed")}
          >
            <Text style={styles.statusButtonText}>Completar</Text>
          </TouchableOpacity>
        )}

        {(retouch.status === "pending" || retouch.status === "in_progress") && (
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: "#EF4444" }]}
            onPress={() => onStatusChange("cancelled")}
          >
            <Text style={styles.statusButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DE LA CITA ORIGINAL
// ============================================================================
function AppointmentInfoSection({ retouch }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Turno Original</Text>

      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() =>
          router.push(`/admin/appointments/${retouch.appointment_id}`)
        }
        activeOpacity={0.7}
      >
        <View style={styles.appointmentInfo}>
          <InfoRow
            label="Cliente"
            value={retouch.appointment.client.name}
            icon="👤"
          />
          <InfoRow
            label="Servicio"
            value={retouch.appointment.service_details}
            icon="🧹"
          />
          <InfoRow
            label="Teléfono"
            value={retouch.appointment.client.phone_number}
            icon="📞"
          />
        </View>
        <Text style={styles.appointmentArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// DETALLES DEL RETOQUE
// ============================================================================
function RetouchDetailsSection({ retouch }: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Detalles</Text>

      <View style={styles.detailsCard}>
        <InfoRow label="Fecha" value={formatDate(retouch.time)} icon="📅" />
        <InfoRow label="Hora" value={formatTime(retouch.time)} icon="🕐" />
        <InfoRow
          label="Duración estimada"
          value={`${retouch.estimate_time} min`}
          icon="⏱️"
        />
        <InfoRow label="Dirección" value={retouch.address} icon="📍" />

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>📝 Motivo del repaso</Text>
          <Text style={styles.reasonText}>{retouch.reason}</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DEL TRABAJADOR
// ============================================================================
function WorkerInfoSection({ retouch }: any) {
  const getAvatar = (name: string) => {
    if (
      name.toLowerCase().includes("ana") ||
      name.toLowerCase().includes("maría")
    ) {
      return "👩";
    }
    return "👨";
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trabajador Asignado</Text>

      <View style={styles.workerCard}>
        <Text style={styles.workerAvatar}>
          {getAvatar(retouch.worker.profile.name)}
        </Text>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{retouch.worker.profile.name}</Text>
          <Text style={styles.workerNote}>
            💡 El repaso no genera comisión adicional
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// BOTONES DE ACCIÓN
// ============================================================================
function ActionButtonsSection({ retouch }: any) {
  const handleDelete = () => {
    Alert.alert(
      "Eliminar repaso",
      "¿Estás seguro de que deseas eliminar este repaso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // TODO: Eliminar de Supabase
            Alert.alert("¡Eliminado!", "El repaso ha sido eliminado", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>🗑️ Eliminar repaso</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================
function InfoRow({ label, value, icon }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSpacer: {
    width: 60,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Section
  section: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },

  // Status
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Appointment Card
  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 12,
    padding: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentArrow: {
    fontSize: 24,
    color: "#166534",
  },

  // Details Card
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },

  // Reason
  reasonContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE047",
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },

  // Worker Card
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  workerAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  workerNote: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
  },

  // Delete Button
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
});

