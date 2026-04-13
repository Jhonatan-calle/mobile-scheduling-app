import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import { createRetouch, getAppointmentById, getWorkers } from "../../../../utils/adminData";

export default function NewRetouchScreen() {
  const { appointmentId } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    reason: "",
    date: new Date(),
    time: new Date(),
    estimateTime: "60",
    workerId: "",
    address: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    loadAppointment();
    loadWorkers();
  }, []);

  const loadAppointment = async () => {
    try {
      const appointmentData = await getAppointmentById(parseInt(appointmentId as string));
      setAppointment(appointmentData);
      
      // Pre-llenar datos
      setFormData({
        ... formData,
        workerId: String(appointmentData.worker_id),
        address: appointmentData.address || "",
      });
    } catch (error) {
      console.error("Error loading appointment:", error);
      Alert.alert("Error", "No se pudo cargar el turno");
    }
  };

  const loadWorkers = async () => {
    try {
      setWorkers(await getWorkers());
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const validateForm = () => {
    if (!formData.reason. trim()) {
      Alert.alert("Error", "Debes especificar el motivo del repaso");
      return false;
    }
    if (!formData.workerId) {
      Alert.alert("Error", "Debes asignar un trabajador");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Combinar fecha y hora
      const combinedDate = new Date(formData.date);
      combinedDate.setHours(formData.time.getHours());
      combinedDate.setMinutes(formData.time.getMinutes());
      combinedDate.setSeconds(0);

      const retouchData = {
        appointment_id: parseInt(appointmentId as string),
        worker_id: parseInt(formData.workerId),
        time: combinedDate. toISOString(),
        address: formData.address,
        reason: formData.reason,
        estimate_time: parseInt(formData.estimateTime),
        status: "pending",
        created_at: new Date().toISOString(),
      };

      console.log("📋 Datos del repaso a guardar:", retouchData);

      await createRetouch({
        appointment_id: parseInt(appointmentId as string),
        worker_id: parseInt(formData.workerId),
        time: combinedDate.toISOString(),
        address: formData.address,
        reason: formData.reason,
        estimate_time: parseInt(formData.estimateTime),
      });

      Alert.alert("¡Éxito!", "El repaso ha sido creado correctamente", [
        {
          text: "Ver turno",
          onPress: () => router.back(),
        },
      ]);
    } catch (error:  any) {
      console.error("Error creating retouch:", error);
      Alert.alert("Error", "No se pudo crear el repaso");
      setLoading(false);
    }
  };

  if (!appointment) {
    return (
      <View style={styles. loadingContainer}>
        <Text style={styles.loadingText}>Cargando... </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RetouchHeader />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppointmentInfoSection appointment={appointment} />
        <RetouchReasonSection formData={formData} setFormData={setFormData} />
        <DateTimeSection
          formData={formData}
          setFormData={setFormData}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
        />
        <WorkerSection
          formData={formData}
          setFormData={setFormData}
          workers={workers}
        />
        <AddressSection formData={formData} setFormData={setFormData} />
        <ActionButtons
          onSave={handleSave}
          loading={loading}
          onCancel={() => router.back()}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function RetouchHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Nuevo Retoque</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DE LA CITA ORIGINAL
// ============================================================================
function AppointmentInfoSection({ appointment }:  any) {
  return (
    <View style={styles.section}>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Turno Original</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{appointment.client.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Servicio:</Text>
          <Text style={styles.infoValue}>{appointment.service_details}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trabajador original:</Text>
          <Text style={styles.infoValue}>
            {appointment.worker.profile.name}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// MOTIVO DEL RETOQUE
// ============================================================================
function RetouchReasonSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="📝"
        title="Motivo del Retoque"
        subtitle="¿Por qué se necesita el repaso?"
      />

      <Input
        label="Descripción *"
        placeholder="Ej: Cliente reportó manchas persistentes en el lateral"
        value={formData.reason}
        onChangeText={(text) => setFormData({ ... formData, reason: text })}
        multiline
        numberOfLines={3}
        style={{ height: 80, textAlignVertical: "top" }}
      />
    </View>
  );
}

// ============================================================================
// FECHA Y HORA
// ============================================================================
function DateTimeSection({
  formData,
  setFormData,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
}:  any) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month:  "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const durations = [
    { value: "30", label: "30 min" },
    { value: "60", label: "1 hora" },
    { value: "90", label: "1. 5 horas" },
    { value: "120", label:  "2 horas" },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="📅"
        title="Fecha y Hora"
        subtitle="Cuándo se realizará el repaso"
      />

      <Text style={styles.label}>Fecha *</Text>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateTimeIcon}>📅</Text>
        <Text style={styles.dateTimeText}>{formatDate(formData.date)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) {
              setFormData({ ...formData, date: selectedDate });
            }
          }}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Hora *</Text>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateTimeIcon}>🕐</Text>
        <Text style={styles.dateTimeText}>{formatTime(formData. time)}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display={Platform.OS === "ios" ?  "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === "ios");
            if (selectedTime) {
              setFormData({ ... formData, time: selectedTime });
            }
          }}
        />
      )}

      <Text style={styles.label}>Duración estimada *</Text>
      <View style={styles.durationGrid}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration.value}
            style={[
              styles.durationChip,
              formData.estimateTime === duration.value &&
                styles.durationChipSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, estimateTime: duration. value })
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles. durationChipText,
                formData. estimateTime === duration.value &&
                  styles.durationChipTextSelected,
              ]}
            >
              {duration.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// TRABAJADOR
// ============================================================================
function WorkerSection({ formData, setFormData, workers }:  any) {
  const getAvatar = (name: string) => {
    if (
      name. toLowerCase().includes("ana") ||
      name.toLowerCase().includes("maría")
    ) {
      return "👩";
    }
    return "👨";
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👥"
        title="Trabajador Asignado"
        subtitle="Quién realizará el repaso"
      />

      <View style={styles.workersGrid}>
        {workers. map((worker:  any) => (
          <TouchableOpacity
            key={worker.id}
            style={[
              styles.workerCard,
              formData. workerId === worker.id. toString() &&
                styles.workerCardSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, workerId: worker.id.toString() })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.workerAvatar}>
              {getAvatar(worker.profile.name)}
            </Text>
            <Text
              style={[
                styles. workerName,
                formData.workerId === worker.id. toString() &&
                  styles. workerNameSelected,
              ]}
            >
              {worker.profile.name}
            </Text>
            {formData.workerId === worker.id.toString() && (
              <View style={styles.workerCheck}>
                <Text style={styles.workerCheckIcon}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// DIRECCIÓN
// ============================================================================
function AddressSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader icon="📍" title="Dirección" subtitle="Dónde se realizará" />

      <Input
        label="Dirección"
        placeholder="Ej: Av. Colón 123"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
      />

      <Text style={styles.helperText}>
        💡 Por defecto se usa la misma dirección del turno original
      </Text>
    </View>
  );
}

// ============================================================================
// BOTONES DE ACCIÓN
// ============================================================================
function ActionButtons({ onSave, loading, onCancel }:  any) {
  return (
    <View style={styles.actionsSection}>
      <Button title="Crear Retoque" onPress={onSave} loading={loading} />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR
// ============================================================================
function SectionHeader({ icon, title, subtitle }: any) {
  return (
    <View style={styles. sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionHeaderIcon}>{icon}</Text>
        <View>
          <Text style={styles. sectionHeaderTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles. sectionHeaderSubtitle}>{subtitle}</Text>
          )}
        </View>
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
    fontSize:  16,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderIcon:  {
    fontSize: 24,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize:  18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop:  2,
  },

  // Info Card
  infoCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#166534",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },

  // Label
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },

  // DateTime
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateTimeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#111827",
    textTransform: "capitalize",
  },

  // Duration
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical:  8,
    borderRadius:  20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  durationChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  durationChipTextSelected: {
    color: "#FFFFFF",
  },

  // Workers
  workersGrid: {
    gap: 12,
  },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    position: "relative",
  },
  workerCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  workerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  workerNameSelected: {
    color: "#3B82F6",
  },
  workerCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  workerCheckIcon:  {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Helper Text
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },

  // Actions
  actionsSection: {
    padding: 16,
    backgroundColor:  "#FFFFFF",
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
