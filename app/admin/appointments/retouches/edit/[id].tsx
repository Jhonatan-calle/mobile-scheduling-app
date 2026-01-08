import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditRetouchScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retouch, setRetouch] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    workerId: 0,
    date: new Date(),
    time: new Date(),
    address: "",
    reason: "",
    estimateTime: "60",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadRetouchData();
    loadWorkers();
  }, []);

  const loadRetouchData = async () => {
    try {
      setLoading(true);
      
      // Mock:  Cargar datos del repaso
      const mockRetouch = {
        id:  parseInt(id as string),
        appointment_id: 1,
        worker_id: 1,
        time: new Date().toISOString(),
        address: "Av. Colón 123",
        reason: "Cliente reportó manchas persistentes en el lateral",
        estimate_time: 60,
        status: "pending",
        appointment:  {
          id: 1,
          client:  {
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

      const retouchDate = new Date(mockRetouch.time);
      
      setRetouch(mockRetouch);
      setFormData({
        workerId:  mockRetouch.worker_id,
        date: retouchDate,
        time: retouchDate,
        address: mockRetouch.address,
        reason: mockRetouch.reason,
        estimateTime: mockRetouch.estimate_time. toString(),
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading retouch:", error);
      Alert.alert("Error", "No se pudo cargar el repaso");
      router.back();
    }
  };

  const loadWorkers = async () => {
    try {
      // Mock: workers
      const mockWorkers = [
        {
          id: 1,
          profile: { id: 1, name: "Carlos González" },
          commission_rate: 60,
        },
        {
          id: 2,
          profile: { id: 2, name: "Ana Martínez" },
          commission_rate: 55,
        },
      ];

      setWorkers(mockWorkers);
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const validateForm = () => {
    if (!formData.workerId) {
      Alert.alert("Error", "Debes seleccionar un trabajador");
      return false;
    }
    if (!formData.address. trim()) {
      Alert.alert("Error", "Debes ingresar una dirección");
      return false;
    }
    if (!formData.reason.trim()) {
      Alert.alert("Error", "Debes ingresar el motivo del repaso");
      return false;
    }
    if (!formData.estimateTime || parseInt(formData.estimateTime) <= 0) {
      Alert.alert("Error", "El tiempo estimado debe ser mayor a 0");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      // Combinar fecha y hora
      const combinedDateTime = new Date(formData.date);
      combinedDateTime.setHours(formData.time.getHours());
      combinedDateTime.setMinutes(formData.time.getMinutes());

      const updateData = {
        worker_id: formData.workerId,
        time: combinedDateTime. toISOString(),
        address: formData.address,
        reason: formData.reason,
        estimate_time: parseInt(formData.estimateTime),
      };

      // TODO: Actualizar en Supabase
      // await supabase.from('retouches').update(updateData).eq('id', id)

      console.log("Datos actualizados:", updateData);

      Alert.alert("¡Éxito!", "Repaso actualizado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving retouch:", error);
      Alert.alert("Error", "No se pudo actualizar el repaso");
    } finally {
      setSaving(false);
    }
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
      <EditRetouchHeader />

      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        <AppointmentInfoSection retouch={retouch} />
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
          loading={saving}
          onCancel={() => router.back()}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function EditRetouchHeader() {
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
        <Text style={styles.headerTitle}>Editar Repaso</Text>
        <Text style={styles.headerSubtitle}>Modifica los datos del servicio</Text>
      </View>
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DE LA CITA
// ============================================================================
function AppointmentInfoSection({ retouch }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="📋"
        title="Turno Original"
        subtitle="Información del servicio base"
      />

      <View style={styles.appointmentCard}>
        <View style={styles.appointmentRow}>
          <Text style={styles.appointmentLabel}>Cliente</Text>
          <Text style={styles.appointmentValue}>
            {retouch. appointment.client.name}
          </Text>
        </View>
        <View style={styles.appointmentRow}>
          <Text style={styles.appointmentLabel}>Servicio</Text>
          <Text style={styles. appointmentValue}>
            {retouch.appointment.service_details}
          </Text>
        </View>
        <View style={styles.appointmentRow}>
          <Text style={styles.appointmentLabel}>Teléfono</Text>
          <Text style={styles.appointmentValue}>
            {retouch.appointment.client.phone_number}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// MOTIVO DEL REPASO
// ============================================================================
function RetouchReasonSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="📝"
        title="Motivo del Repaso"
        subtitle="Describe la razón del servicio adicional"
      />

      <TextInput
        style={styles. textArea}
        placeholder="Ej: Cliente reportó manchas persistentes..."
        value={formData.reason}
        onChangeText={(text) => setFormData({ ...formData, reason: text })}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
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
}: any) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month:  "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setFormData({ ...formData, time: selectedTime });
    }
  };

  return (
    <View style={styles. section}>
      <SectionHeader
        icon="📅"
        title="Fecha y Hora"
        subtitle="Programa cuándo se realizará el repaso"
      />

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateTimeIcon}>📅</Text>
          <View style={styles.dateTimeInfo}>
            <Text style={styles.dateTimeLabel}>Fecha</Text>
            <Text style={styles.dateTimeValue}>{formatDate(formData.date)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateTimeIcon}>🕐</Text>
          <View style={styles.dateTimeInfo}>
            <Text style={styles.dateTimeLabel}>Hora</Text>
            <Text style={styles.dateTimeValue}>{formatTime(formData.time)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === "ios" ?  "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
          is24Hour={true}
        />
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>⏱️ Duración estimada (minutos)</Text>
        <TextInput
          style={styles. input}
          placeholder="60"
          value={formData.estimateTime}
          onChangeText={(text) =>
            setFormData({ ...formData, estimateTime: text })
          }
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

// ============================================================================
// TRABAJADOR
// ============================================================================
function WorkerSection({ formData, setFormData, workers }: any) {
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
        icon="👷"
        title="Trabajador"
        subtitle="Selecciona quién realizará el repaso"
      />

      <View style={styles. workersList}>
        {workers.map((worker: any) => (
          <TouchableOpacity
            key={worker.id}
            style={[
              styles.workerCard,
              formData.workerId === worker.id && styles.workerCardSelected,
            ]}
            onPress={() => setFormData({ ...formData, workerId: worker.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.workerAvatar}>
              {getAvatar(worker.profile.name)}
            </Text>
            <View style={styles.workerInfo}>
              <Text style={styles. workerName}>{worker.profile.name}</Text>
              <Text style={styles.workerNote}>Sin comisión adicional</Text>
            </View>
            {formData.workerId === worker. id && (
              <Text style={styles.workerCheck}>✓</Text>
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
      <SectionHeader
        icon="📍"
        title="Dirección"
        subtitle="Ubicación donde se realizará el repaso"
      />

      <TextInput
        style={styles.input}
        placeholder="Ej: Av. Colón 123"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
      />
    </View>
  );
}

// ============================================================================
// BOTONES DE ACCIÓN
// ============================================================================
function ActionButtons({ onSave, loading, onCancel }:  any) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Guardando..." : "💾 Guardar Cambios"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles. cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================
function SectionHeader({ icon, title, subtitle }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
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
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height:  40,
    borderRadius:  20,
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
    fontSize:  13,
    color: "#6B7280",
    marginTop:  2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize:  16,
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
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionHeaderText:  {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Appointment Card
  appointmentCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding:  16,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  appointmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  appointmentLabel: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },
  appointmentValue: {
    fontSize:  14,
    color: "#166534",
    fontWeight: "600",
  },

  // Inputs
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding:  14,
    fontSize: 16,
    color: "#111827",
    minHeight: 100,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  // Date Time
  dateTimeContainer: {
    gap: 12,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize:  12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    textTransform: "capitalize",
  },

  // Workers
  workersList: {
    gap: 12,
  },
  workerCard: {
    flexDirection:  "row",
    alignItems:  "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  workerCardSelected: {
    backgroundColor: "#DBEAFE",
    borderColor:  "#3B82F6",
  },
  workerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize:  16,
    fontWeight: "600",
    color: "#111827",
  },
  workerNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop:  2,
  },
  workerCheck: {
    fontSize: 24,
    color: "#3B82F6",
  },

  // Action Buttons
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor:  "#93C5FD",
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
