import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { supabase } from "../../../utils/supabase";

export default function NewAppointmentScreen() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    service: "",
    serviceDetails: "",
    amount: "",
    date: new Date(),
    time: new Date(),
    duration: "60", // en minutos
    notes: "",
    workerId: "",
    commissionRate: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);

  // Cargar trabajadores con sus comisiones
  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const mockWorkers = [
        {
          id: "1",
          name: "Carlos González",
          avatar: "👨",
          available: true,
          defaultCommissionRate: 60,
        },
        {
          id: "2",
          name: "Ana Martínez",
          avatar: "👩",
          available: true,
          defaultCommissionRate: 55,
        },
        {
          id: "3",
          name: "Luis Rodríguez",
          avatar: "👨",
          available: true,
          defaultCommissionRate: 50,
        },
      ];

      setWorkers(mockWorkers);
    } catch (error) {
      console.error("Error loading workers:", error);
      Alert.alert("Error", "No se pudieron cargar los trabajadores");
    }
  };

  return (
    <View style={styles.container}>
      <NewAppointmentHeader />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomerInfoSection formData={formData} setFormData={setFormData} />
        <ServiceInfoSection formData={formData} setFormData={setFormData} />
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
          formData={formData}
          loading={loading}
          setLoading={setLoading}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  HEADER
// ============================================================================
function NewAppointmentHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Nueva Cita</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ============================================================================
// SECCIÓN:  INFORMACIÓN DEL CLIENTE
// ============================================================================
function CustomerInfoSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👤"
        title="Información del Cliente"
        subtitle="Datos de contacto"
      />

      <Input
        label="Nombre completo *"
        placeholder="Ej: Juan Pérez"
        value={formData.customerName}
        onChangeText={(text) =>
          setFormData({ ...formData, customerName: text })
        }
      />

      <Input
        label="Teléfono *"
        placeholder="Ej: 351 234 5678"
        value={formData.customerPhone}
        onChangeText={(text) =>
          setFormData({ ...formData, customerPhone: text })
        }
        keyboardType="phone-pad"
      />

      <Input
        label="Dirección"
        placeholder="Ej:  Av. Colón 123"
        value={formData.customerAddress}
        onChangeText={(text) =>
          setFormData({ ...formData, customerAddress: text })
        }
        multiline
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: INFORMACIÓN DEL SERVICIO
// ============================================================================
function ServiceInfoSection({ formData, setFormData }: any) {
  const serviceTypes = [
    { id: "auto", name: "Auto", icon: "🚗" },
    { id: "sillones", name: "Sillones", icon: "🛋️" },
    { id: "sillas", name: "Sillas", icon: "🪑" },
    { id: "alfombra", name: "Alfombra", icon: "🧶" },
    { id: "colchon", name: "Colchón", icon: "🛏️" },
    { id: "otro", name: "Otro", icon: "📦" },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="🧼"
        title="Servicio"
        subtitle="Descripción del trabajo"
      />

      <Text style={styles.label}>Tipo de servicio *</Text>
      <View style={styles.serviceGrid}>
        {serviceTypes.map((service) => (
          <ServiceTypeCard
            key={service.id}
            service={service}
            selected={formData.service === service.id}
            onSelect={() => {
              setFormData({
                ...formData,
                service: service.id,
              });
            }}
          />
        ))}
      </View>

      {/* Campo de cantidad y características */}
      <Input
        label="Cantidad y/o características"
        placeholder="Ej: 3 sillones de 2 cuerpos, tela clara"
        value={formData.serviceDetails}
        onChangeText={(text) =>
          setFormData({ ...formData, serviceDetails: text })
        }
        multiline
        numberOfLines={2}
      />

      <Input
        label="Monto a cobrar *"
        placeholder="$0"
        value={formData.amount}
        onChangeText={(text) => setFormData({ ...formData, amount: text })}
        keyboardType="numeric"
      />
    </View>
  );
}

function ServiceTypeCard({ service, selected, onSelect }: any) {
  return (
    <TouchableOpacity
      style={[styles.serviceCard, selected && styles.serviceCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.serviceCardIcon}>{service.icon}</Text>
      <Text
        style={[
          styles.serviceCardName,
          selected && styles.serviceCardNameSelected,
        ]}
      >
        {service.name}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// SECCIÓN: FECHA Y HORA
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
      year: "numeric",
      month: "long",
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
    { value: "90", label: "1.5 horas" },
    { value: "120", label: "2 horas" },
    { value: "180", label: "3 horas" },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="📅"
        title="Fecha y Hora"
        subtitle="Cuándo se realizará el servicio"
      />

      {/* Fecha */}
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

      {/* Hora */}
      <Text style={styles.label}>Hora *</Text>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateTimeIcon}>🕐</Text>
        <Text style={styles.dateTimeText}>{formatTime(formData.time)}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === "ios");
            if (selectedTime) {
              setFormData({ ...formData, time: selectedTime });
            }
          }}
        />
      )}

      {/* Duración estimada */}
      <Text style={styles.label}>Duración estimada *</Text>
      <View style={styles.durationGrid}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration.value}
            style={[
              styles.durationChip,
              formData.duration === duration.value &&
                styles.durationChipSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, duration: duration.value })
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationChipText,
                formData.duration === duration.value &&
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
// SECCIÓN: ASIGNACIÓN DE TRABAJADOR
// ============================================================================
function WorkerAssignmentSection({ formData, setFormData, workers }: any) {
  const handleSelectWorker = (worker: any) => {
    setFormData({
      ...formData,
      workerId: worker.id,
      commissionRate: worker.defaultCommissionRate.toString(), // ← Auto-llenar
    });
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👥"
        title="Asignar Trabajador"
        subtitle="Opcional - puedes asignarlo después"
      />

      <View style={styles.workersGrid}>
        {workers && workers.length > 0 ? (
          workers.map((worker: any) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              selected={formData.workerId === worker.id}
              onSelect={() => handleSelectWorker(worker)}
            />
          ))
        ) : (
          <Text style={styles.helperText}>Cargando trabajadores...</Text>
        )}
      </View>

      {!formData.workerId && (
        <Text style={styles.helperText}>
          💡 Tip: Al seleccionar un trabajador, se aplicará su comisión por
          defecto
        </Text>
      )}
    </View>
  );
}


function WorkerCard({ worker, selected, onSelect }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.workerCard,
        selected && styles.workerCardSelected,
        !worker.available && styles.workerCardDisabled,
      ]}
      onPress={worker.available ? onSelect : undefined}
      activeOpacity={0.7}
      disabled={!worker.available}
    >
      <Text style={styles.workerCardAvatar}>{worker.avatar}</Text>
      <View style={styles.workerCardInfo}>
        <Text
          style={[
            styles.workerCardName,
            selected && styles.workerCardNameSelected,
            !worker.available && styles.workerCardNameDisabled,
          ]}
        >
          {worker.name}
        </Text>
        {!worker.available && (
          <Text style={styles.workerCardStatus}>No disponible</Text>
        )}
      </View>
      {selected && (
        <View style={styles.workerCardCheck}>
          <Text style={styles.workerCardCheckIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
//  INFORMACIÓN FINANCIERA
// ============================================================================
function FinancialInfoSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="💰"
        title="Información Financiera"
        subtitle="Monto y comisión"
      />

      <Input
        label="Monto a cobrar al cliente *"
        placeholder="$0"
        value={formData.amount}
        onChangeText={(text) => setFormData({ ...formData, amount: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Comisión del trabajador (%)</Text>
      <View style={styles.commissionInputContainer}>
        <TextInput
          style={styles.commissionInput}
          value={formData.commissionRate}
          onChangeText={(text) =>
            setFormData({ ...formData, commissionRate: text })
          }
          keyboardType="numeric"
          maxLength={3}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.commissionPercent}>%</Text>
      </View>

      {formData.amount && formData.commissionRate && (
        <View style={styles.calculationBox}>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Monto total: </Text>
            <Text style={styles.calculationValue}>
              ${parseFloat(formData.amount || "0").toLocaleString("es-AR")}
            </Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles. calculationLabel}>
              Trabajador recibe ({formData.commissionRate}%):
            </Text>
            <Text style={styles.calculationValueHighlight}>
              ${calculateWorkerAmount(formData.amount, formData.commissionRate)}
            </Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Negocio recibe:</Text>
            <Text style={styles.calculationValue}>
              ${calculateBusinessAmount(formData.amount, formData.commissionRate)}
            </Text>
          </View>
        </View>
      )}

      {! formData.commissionRate && formData.workerId && (
        <Text style={styles.warningText}>
          ⚠️ No olvides configurar la comisión del trabajador
        </Text>
      )}
    </View>
  );
}

// Funciones auxiliares para cálculos
function calculateWorkerAmount(totalAmount: string, commissionRate: string) {
  const amount = parseFloat(totalAmount) || 0;
  const rate = parseFloat(commissionRate) || 0;
  const workerAmount = (amount * rate) / 100;
  return workerAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function calculateBusinessAmount(totalAmount: string, commissionRate: string) {
  const amount = parseFloat(totalAmount) || 0;
  const rate = parseFloat(commissionRate) || 0;
  const businessAmount = amount - (amount * rate) / 100;
  return businessAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits:  0,
  });
}

// ============================================================================
// SECCIÓN: BOTONES DE ACCIÓN
// ============================================================================

function ActionButtons({ formData, loading, setLoading }: any) {
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      Alert.alert("Error", "El nombre del cliente es requerido");
      return false;
    }
    if (!formData.customerPhone.trim()) {
      Alert.alert("Error", "El teléfono del cliente es requerido");
      return false;
    }
    if (!formData.service) {
      Alert.alert("Error", "Debes seleccionar un tipo de servicio");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "El monto debe ser mayor a 0");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Aquí guardarías en Supabase
      // const { data, error } = await supabase. from('appointments').insert([{
      //   customer_name: formData.customerName,
      //   customer_phone: formData.customerPhone,
      //   customer_address: formData.customerAddress,
      //   service_type: formData.service,
      //   amount: parseFloat(formData.amount),
      //   date: formData.date,
      //   time: formData.time,
      //   duration: parseInt(formData.duration),
      //   notes: formData.notes,
      //   worker_id: formData.workerId || null,
      //   status: 'pending'
      // }]);

      // Simulación
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("¡Éxito!", "La cita ha sido creada correctamente", [
        {
          text: "Ver citas",
          onPress: () => router.replace("/(admin)/appointments"),
        },
        {
          text: "Crear otra",
          onPress: () => {
            // Resetear formulario
            setLoading(false);
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cita");
      setLoading(false);
    }
  };

  return (
    <View style={styles.actionsSection}>
      <Button title="Crear Cita" onPress={handleSave} loading={loading} />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR:  SECTION HEADER
// ============================================================================
function SectionHeader({ icon, title, subtitle }: any) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionHeaderIcon}>{icon}</Text>
        <View>
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text>
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
  sectionHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Label
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },

  // Service Grid
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  serviceCard: {
    width: "31%",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  serviceCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  serviceCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 4,
  },
  serviceCardNameSelected: {
    color: "#3B82F6",
  },
  serviceCardPrice: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  serviceCardPriceSelected: {
    color: "#3B82F6",
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
    paddingVertical: 8,
    borderRadius: 20,
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

  // Workers Grid
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
  workerCardDisabled: {
    opacity: 0.5,
  },
  workerCardAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  workerCardInfo: {
    flex: 1,
  },
  workerCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  workerCardNameSelected: {
    color: "#3B82F6",
  },
  workerCardNameDisabled: {
    color: "#9CA3AF",
  },
  workerCardCommission: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500",
  },
  workerCardStatus: {
    fontSize: 12,
    color: "#EF4444",
  },
  workerCardCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  workerCardCheckIcon: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  commissionInfo: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  commissionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 12,
  },
  commissionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86EFAC",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  commissionInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 12,
  },
  commissionPercent: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  commissionHelper: {
    fontSize: 13,
    color: "#166534",
    fontStyle: "italic",
  },
  // Helper Text
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },

  // Actions
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
