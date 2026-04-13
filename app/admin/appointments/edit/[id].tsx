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
import {
  getAppointmentById,
  getServices,
  getWorkers,
  updateAppointment,
  updateClient,
} from "../../../../utils/adminData";
import { getServiceIcon } from "../../../../utils/lookups";

export default function EditAppointmentScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    serviceDetails: "",
    workerId: 0,
    date: new Date(),
    time: new Date(),
    estimateTime: "120",
    address: "",
    cost: "",
    commissionRate: "60",
    paymentMethod: null as string | null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadAppointmentData();
    loadWorkers();
    loadServices();
  }, []);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      const appointmentData = await getAppointmentById(id as string);
      const appointmentDate = new Date(appointmentData.date);

      setAppointment(appointmentData);
      setFormData({
        clientName: appointmentData.client?.name ?? "",
        clientPhone: appointmentData.client?.phone_number ?? "",
        service: String(appointmentData.service ?? ""),
        serviceDetails: appointmentData.service_details ?? "",
        workerId: appointmentData.worker_id,
        date: appointmentDate,
        time: appointmentDate,
        estimateTime: (appointmentData.estimate_time ?? 120).toString(),
        address: appointmentData.address ?? "",
        cost: (appointmentData.cost ?? 0).toString(),
        commissionRate: (appointmentData.commission_rate ?? 0).toString(),
        paymentMethod: appointmentData.payment_method,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading appointment:", error);
      Alert.alert("Error", "No se pudo cargar el turno");
      router.back();
    }
  };

  const loadWorkers = async () => {
    try {
      setWorkers(await getWorkers());
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const loadServices = async () => {
    try {
      setServices(await getServices());
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const validateForm = () => {
    if (!formData.clientName. trim()) {
      Alert.alert("Error", "Debes ingresar el nombre del cliente");
      return false;
    }
    if (!formData.clientPhone.trim()) {
      Alert.alert("Error", "Debes ingresar el teléfono del cliente");
      return false;
    }
    if (!formData.service) {
      Alert.alert("Error", "Debes seleccionar un tipo de servicio");
      return false;
    }
    if (! formData.serviceDetails.trim()) {
      Alert.alert("Error", "Debes ingresar los detalles del servicio");
      return false;
    }
    if (!formData.workerId) {
      Alert.alert("Error", "Debes seleccionar un trabajador");
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Debes ingresar una dirección");
      return false;
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      Alert.alert("Error", "El costo debe ser mayor a 0");
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
        service: parseInt(formData.service, 10),
        service_details: formData.serviceDetails,
        worker_id:  formData.workerId,
        date: combinedDateTime.toISOString(),
        estimate_time:  parseInt(formData.estimateTime),
        address: formData.address,
        cost: parseFloat(formData. cost),
        commission_rate:  parseFloat(formData.commissionRate),
        payment_method:  formData.paymentMethod,
      };

      await updateAppointment(id as string, updateData as any);
      if (appointment?.client_id) {
        await updateClient(appointment.client_id, {
          name: formData.clientName,
          phone_number: formData.clientPhone,
        });
      }

      Alert.alert("¡Éxito!", "Turno actualizado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving appointment:", error);
      Alert.alert("Error", "No se pudo actualizar el turno");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !appointment) {
    return (
      <View style={styles. loadingContainer}>
        <Text style={styles.loadingText}>Cargando... </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EditAppointmentHeader />

      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        <CustomerInfoSection formData={formData} setFormData={setFormData} />
        <ServiceInfoSection
          formData={formData}
          setFormData={setFormData}
          services={services}
        />
        <DateTimeSection
          formData={formData}
          setFormData={setFormData}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
        />
        <WorkerAssignmentSection
          formData={formData}
          setFormData={setFormData}
          workers={workers}
        />
        <FinancialInfoSection formData={formData} setFormData={setFormData} />
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
function EditAppointmentHeader() {
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
        <Text style={styles.headerTitle}>Editar Turno</Text>
        <Text style={styles.headerSubtitle}>Modifica los datos del servicio</Text>
      </View>
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DEL CLIENTE
// ============================================================================
function CustomerInfoSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👤"
        title="Información del Cliente"
        subtitle="Datos de contacto"
      />

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          value={formData.clientName}
          onChangeText={(text) => setFormData({ ...formData, clientName: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={styles. input}
          placeholder="351 234 5678"
          value={formData.clientPhone}
          onChangeText={(text) => setFormData({ ...formData, clientPhone: text })}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DEL SERVICIO
// ============================================================================
function ServiceInfoSection({ formData, setFormData, services }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="🧹"
        title="Tipo de Servicio"
        subtitle="Selecciona el servicio a realizar"
      />

      <View style={styles.servicesGrid}>
        {services.map((service: any) => (
          <ServiceTypeCard
            key={service.id}
            service={service}
            selected={formData.service === String(service.id)}
            onSelect={() => setFormData({ ...formData, service: String(service.id) })}
          />
        ))}
      </View>

      <View style={styles. inputGroup}>
        <Text style={styles.inputLabel}>Detalles del servicio</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ej: Limpieza de sillón 3 cuerpos..."
          value={formData.serviceDetails}
          onChangeText={(text) =>
            setFormData({ ...formData, serviceDetails: text })
          }
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>📍 Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Av. Colón 123"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />
      </View>
    </View>
  );
}

function ServiceTypeCard({ service, selected, onSelect }: any) {
  return (
    <TouchableOpacity
      style={[styles.serviceCard, selected && styles. serviceCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.serviceIcon}>{getServiceIcon(service.objeto || service.description)}</Text>
      <Text style={styles. serviceLabel}>{service.description || service.objeto}</Text>
      {selected && <Text style={styles. serviceCheck}>✓</Text>}
    </TouchableOpacity>
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

  const onDateChange = (event: any, selectedDate?:  Date) => {
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
        subtitle="Programa cuándo se realizará el servicio"
      />

      <View style={styles. dateTimeContainer}>
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
          <Text style={styles. dateTimeIcon}>🕐</Text>
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
          style={styles.input}
          placeholder="120"
          value={formData. estimateTime}
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
// ASIGNACIÓN DE TRABAJADOR
// ============================================================================
function WorkerAssignmentSection({ formData, setFormData, workers }:  any) {
  const handleSelectWorker = (worker: any) => {
    setFormData({
      ...formData,
      workerId: worker.id,
      commissionRate: worker.commission_rate. toString(),
    });
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👷"
        title="Asignar Trabajador"
        subtitle="Selecciona quién realizará el servicio"
      />

      <View style={styles. workersList}>
        {workers.map((worker:  any) => (
          <WorkerCard
            key={worker. id}
            worker={worker}
            selected={formData.workerId === worker.id}
            onSelect={() => handleSelectWorker(worker)}
          />
        ))}
      </View>
    </View>
  );
}

function WorkerCard({ worker, selected, onSelect }: any) {
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
    <TouchableOpacity
      style={[styles.workerCard, selected && styles.workerCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.workerAvatar}>{getAvatar(worker.profile.name)}</Text>
      <View style={styles.workerInfo}>
        <Text style={styles. workerName}>{worker.profile.name}</Text>
        <Text style={styles.workerCommission}>
          Comisión: {worker.commission_rate}%
        </Text>
      </View>
      {selected && <Text style={styles. workerCheck}>✓</Text>}
    </TouchableOpacity>
  );
}

// ============================================================================
// INFORMACIÓN FINANCIERA
// ============================================================================
function FinancialInfoSection({ formData, setFormData }: any) {
  const calculateWorkerAmount = (totalAmount: string, commissionRate: string) => {
    const total = parseFloat(totalAmount) || 0;
    const rate = parseFloat(commissionRate) || 0;
    return (total * rate) / 100;
  };

  const calculateBusinessAmount = (totalAmount: string, commissionRate: string) => {
    const total = parseFloat(totalAmount) || 0;
    const workerAmount = calculateWorkerAmount(totalAmount, commissionRate);
    return total - workerAmount;
  };

  const workerAmount = calculateWorkerAmount(formData.cost, formData. commissionRate);
  const businessAmount = calculateBusinessAmount(formData.cost, formData.commissionRate);

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="💰"
        title="Información Financiera"
        subtitle="Configura el costo y comisión"
      />

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>💵 Costo total del servicio</Text>
        <TextInput
          style={styles. input}
          placeholder="15000"
          value={formData.cost}
          onChangeText={(text) => setFormData({ ...formData, cost: text })}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>📊 Comisión del trabajador (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="60"
          value={formData. commissionRate}
          onChangeText={(text) =>
            setFormData({ ...formData, commissionRate: text })
          }
          keyboardType="numeric"
        />
      </View>

      {formData.cost && formData.commissionRate && (
        <View style={styles.financialSummary}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>💼 Pago al trabajador: </Text>
            <Text style={styles.financialValue}>
              ${workerAmount.toLocaleString()} ({formData.commissionRate}%)
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>🏢 Ganancia del negocio:</Text>
            <Text style={styles.financialValue}>
              ${businessAmount.toLocaleString()} ({100 - parseFloat(formData.commissionRate)}%)
            </Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>💳 Método de pago (opcional)</Text>
        <View style={styles.paymentMethodsRow}>
          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              formData.paymentMethod === "cash" && styles.paymentMethodButtonActive,
            ]}
            onPress={() => setFormData({ ... formData, paymentMethod: "cash" })}
            activeOpacity={0.7}
          >
            <Text style={styles.paymentMethodIcon}>💵</Text>
            <Text style={styles.paymentMethodText}>Efectivo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              formData.paymentMethod === "transfer" && styles.paymentMethodButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, paymentMethod: "transfer" })}
            activeOpacity={0.7}
          >
            <Text style={styles.paymentMethodIcon}>🏦</Text>
            <Text style={styles.paymentMethodText}>Transferencia</Text>
          </TouchableOpacity>

          {formData.paymentMethod && (
            <TouchableOpacity
              style={styles.paymentMethodClear}
              onPress={() => setFormData({ ...formData, paymentMethod: null })}
              activeOpacity={0.7}
            >
              <Text style={styles.paymentMethodClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// BOTONES DE ACCIÓN
// ============================================================================
function ActionButtons({ onSave, loading, onCancel }: any) {
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
    fontSize:  13,
    color: "#6B7280",
    marginTop: 2,
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
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionSubtitle:  {
    fontSize: 13,
    color: "#6B7280",
    marginTop:  2,
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input:  {
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
    borderRadius:  12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    minHeight: 80,
  },

  // Services Grid
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  serviceCard: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  serviceCardSelected: {
    backgroundColor: "#DBEAFE",
    borderColor:  "#3B82F6",
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  serviceCheck: {
    position: "absolute",
    top:  4,
    right: 4,
    fontSize: 16,
    color: "#3B82F6",
  },

  // Date Time
  dateTimeContainer: {
    gap: 12,
    marginBottom: 16,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  workerCardSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  workerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  workerCommission:  {
    fontSize: 13,
    color: "#6B7280",
    marginTop:  2,
  },
  workerCheck: {
    fontSize: 24,
    color: "#3B82F6",
  },

  // Financial
  financialSummary: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding:  16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },
  financialValue: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "700",
  },

  // Payment Methods
  paymentMethodsRow: {
    flexDirection:  "row",
    gap: 12,
  },
  paymentMethodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  paymentMethodButtonActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  paymentMethodIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  paymentMethodText: {
    fontSize:  14,
    fontWeight: "600",
    color: "#111827",
  },
  paymentMethodClear: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentMethodClearText:  {
    fontSize: 18,
    color: "#DC2626",
  },

  // Action Buttons
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding:  16,
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
