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
import Button from "../../../components/Button";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);

      // Mock:  Estructura real completa
      const mockAppointment = {
        id: 1,
        admin_id: 1,
        worker_id: 1,
        client_id: 1,
        service:  "sillones",
        service_details: "Limpieza de sillón 3 cuerpos",
        address: "Av. Colón 123",
        date: new Date().toISOString(), // timestamp con fecha y hora
        estimate_time: 120, // minutos
        cost: 15000.00,
        commission_rate: 60.00,
        status: "pending", // 'pending' | 'in_progress' | 'completed' | 'cancelled'
        has_retouches: false,
        paid_to_worker: false,
        payment_method: "cash", // 'cash' | 'transfer' | 'debit' | 'credit' | 'mercadopago' | 'other' | null
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Relaciones (JOINs)
        client:  {
          id: 1,
          name: "Juan Pérez",
          phone_number: "351 234 5678",
          last_appointment_at: "2024-01-15T10:00:00Z",
        },
        worker: {
          id:  1,
          profile_id: 1,
          commission_rate: 60.00,
          profile:  {
            id: 1,
            name: "Carlos González",
          },
        },
      };

      setAppointment(mockAppointment);
      setLoading(false);
    } catch (error) {
      console.error("Error loading appointment:", error);
      Alert.alert("Error", "No se pudo cargar la cita");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles. loadingContainer}>
        <Text style={styles.loadingText}>Cargando... </Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles. errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Cita no encontrada</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppointmentDetailHeader appointmentId={id as string} />

      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        <StatusSection appointment={appointment} onUpdate={loadAppointment} />
        <CustomerInfoSection appointment={appointment} />
        <ServiceInfoSection appointment={appointment} />
        <WorkerInfoSection appointment={appointment} />
        <FinancialInfoSection appointment={appointment} />
        <PaymentStatusSection
          appointment={appointment}
          onUpdate={loadAppointment}
        />
        <ActionButtonsSection
          appointment={appointment}
          onUpdate={loadAppointment}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  HEADER
// ============================================================================
function AppointmentDetailHeader({ appointmentId }: { appointmentId:  string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Cita #{appointmentId}</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          Alert.alert("Editar", "Funcionalidad disponible próximamente")
        }
      >
        <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  ESTADO DE LA CITA
// ============================================================================
function StatusSection({ appointment, onUpdate }: any) {
  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "#F59E0B",
      icon: "⏳",
      bgColor: "#FEF3C7",
    },
    in_progress: {
      label: "En curso",
      color: "#3B82F6",
      icon: "🔄",
      bgColor: "#DBEAFE",
    },
    completed: {
      label: "Completada",
      color: "#10B981",
      icon: "✅",
      bgColor: "#D1FAE5",
    },
    cancelled: {
      label: "Cancelada",
      color: "#EF4444",
      icon:  "❌",
      bgColor: "#FEE2E2",
    },
  };

  const config = statusConfig[appointment.status as keyof typeof statusConfig];

  const handleStatusChange = async (newStatus: string) => {
    Alert.alert(
      "Cambiar estado",
      `¿Cambiar estado a "${statusConfig[newStatus as keyof typeof statusConfig]. label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            // TODO: Actualizar en Supabase
            // await supabase
            //   .from('appointments')
            //   .update({ status: newStatus, updated_at: new Date().toISOString() })
            //   .eq('id', appointment.id);
            
            console.log("Actualizando estado a:", newStatus);
            Alert.alert("Éxito", "Estado actualizado");
            onUpdate();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Text style={styles.statusIcon}>{config.icon}</Text>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>

      {appointment.status !== "completed" && appointment.status !== "cancelled" && (
        <View style={styles. statusActions}>
          {appointment.status === "pending" && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: "#DBEAFE" }]}
              onPress={() => handleStatusChange("in_progress")}
            >
              <Text style={[styles.statusButtonText, { color: "#3B82F6" }]}>
                Marcar en curso
              </Text>
            </TouchableOpacity>
          )}
          {(appointment.status === "pending" ||
            appointment.status === "in_progress") && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: "#D1FAE5" }]}
              onPress={() => handleStatusChange("completed")}
            >
              <Text style={[styles. statusButtonText, { color: "#10B981" }]}>
                Marcar completada
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// SECCIÓN: INFORMACIÓN DEL CLIENTE
// ============================================================================
function CustomerInfoSection({ appointment }: any) {
  const handleCall = () => {
    Alert.alert(
      "Llamar al cliente",
      appointment.client. phone_number,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Llamar",
          onPress: () => {
            // TODO:  Integrar con Linking para abrir el teléfono
            // Linking.openURL(`tel:${appointment.client.phone_number}`);
            console.log("Llamando a:", appointment.client.phone_number);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <SectionTitle icon="👤" title="Cliente" />

      <InfoRow label="Nombre" value={appointment. client.name} />
      <InfoRow label="Teléfono" value={appointment.client. phone_number} icon="📱" />
      <InfoRow label="Dirección" value={appointment.address || "No especificada"} icon="📍" />

      <TouchableOpacity style={styles.actionLink} onPress={handleCall}>
        <Text style={styles.actionLinkText}>📞 Llamar al cliente</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// SECCIÓN: INFORMACIÓN DEL SERVICIO
// ============================================================================
function ServiceInfoSection({ appointment }: any) {
  const serviceNames:  any = {
    auto:  "🚗 Auto",
    sillones: "🛋️ Sillones",
    sillas: "🪑 Sillas",
    alfombra: "🧶 Alfombra",
    colchon: "🛏️ Colchón",
    otro: "📦 Otro",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month:  "long",
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
      <SectionTitle icon="🧼" title="Servicio" />

      <InfoRow
        label="Tipo"
        value={serviceNames[appointment.service] || appointment.service}
      />
      <InfoRow label="Detalles" value={appointment.service_details || "Sin detalles"} />
      <InfoRow label="Fecha programada" value={formatDate(appointment.date)} />
      <InfoRow label="Hora" value={formatTime(appointment.date)} />
      <InfoRow
        label="Duración estimada"
        value={`${appointment.estimate_time} minutos`}
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: TRABAJADOR ASIGNADO
// ============================================================================
function WorkerInfoSection({ appointment }: any) {
  const handleReassign = () => {
    Alert.alert(
      "Reasignar trabajador",
      "Esta funcionalidad estará disponible próximamente"
    );
  };

  // Determinar avatar según el nombre
  const getAvatar = (name: string) => {
    if (name.toLowerCase().includes("ana") || name.toLowerCase().includes("maría")) {
      return "👩";
    }
    return "👨";
  };

  return (
    <View style={styles.section}>
      <SectionTitle icon="👥" title="Trabajador Asignado" />

      {appointment.worker && appointment.worker.profile ? (
        <>
          <View style={styles.workerInfo}>
            <Text style={styles. workerAvatar}>
              {getAvatar(appointment.worker.profile.name)}
            </Text>
            <View>
              <Text style={styles. workerName}>{appointment.worker.profile.name}</Text>
              <Text style={styles.workerCommission}>
                Comisión: {appointment.worker.commission_rate}%
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionLink} onPress={handleReassign}>
            <Text style={styles.actionLinkText}>🔄 Reasignar trabajador</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles. noDataText}>No hay trabajador asignado</Text>
          <TouchableOpacity style={styles.actionLink} onPress={handleReassign}>
            <Text style={styles.actionLinkText}>➕ Asignar trabajador</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ============================================================================
// SECCIÓN: INFORMACIÓN FINANCIERA
// ============================================================================
function FinancialInfoSection({ appointment }: any) {
  const workerAmount = (appointment.cost * appointment.commission_rate) / 100;
  const businessAmount = appointment.cost - workerAmount;

  const paymentMethodNames: any = {
    cash:  { name: "Efectivo", icon:  "💵" },
    transfer: { name: "Transferencia", icon:  "🏦" },
    debit: { name: "Débito", icon: "💳" },
    credit: { name: "Crédito", icon: "💳" },
    mercadopago: { name: "Mercado Pago", icon: "📱" },
    other: { name: "Otro", icon:  "💰" },
  };

  const paymentMethod = appointment.payment_method
    ? paymentMethodNames[appointment.payment_method]
    :  null;

  return (
    <View style={styles.section}>
      <SectionTitle icon="💰" title="Información Financiera" />

      <View style={styles.financialCard}>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Monto total: </Text>
          <Text style={styles.financialValue}>
            ${appointment.cost.toLocaleString("es-AR")}
          </Text>
        </View>

        {paymentMethod && (
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Método de pago:</Text>
            <View style={styles.paymentMethodBadge}>
              <Text style={styles.paymentMethodBadgeIcon}>
                {paymentMethod.icon}
              </Text>
              <Text style={styles. paymentMethodBadgeText}>
                {paymentMethod.name}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.financialDivider} />

        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>
            Trabajador ({appointment.commission_rate}%):
          </Text>
          <Text style={[styles.financialValue, styles.financialHighlight]}>
            ${workerAmount.toLocaleString("es-AR")}
          </Text>
        </View>

        <View style={styles. financialRow}>
          <Text style={styles.financialLabel}>Negocio:</Text>
          <Text style={styles.financialValue}>
            ${businessAmount.toLocaleString("es-AR")}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: ESTADO DE PAGOS
// ============================================================================
function PaymentStatusSection({ appointment, onUpdate }: any) {
  const changePaymentMethod = () => {
    const paymentMethods = [
      { id: "cash", name: "Efectivo 💵" },
      { id: "transfer", name: "Transferencia 🏦" },
      { id: "debit", name:  "Débito 💳" },
      { id: "credit", name: "Crédito 💳" },
      { id: "mercadopago", name: "Mercado Pago 📱" },
      { id: "other", name:  "Otro 💰" },
    ];

    Alert.alert("Cambiar método de pago", "Selecciona el nuevo método", [
      ... paymentMethods.map((method) => ({
        text: method.name,
        onPress: async () => {
          // TODO: Actualizar en Supabase
          // await supabase
          //   .from('appointments')
          //   .update({ payment_method: method.id, updated_at: new Date().toISOString() })
          //   .eq('id', appointment. id);
          
          console. log("Cambiando método de pago a:", method.id);
          Alert.alert("Éxito", `Método cambiado a ${method.name}`);
          onUpdate();
        },
      })),
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const toggleWorkerPayment = async () => {
    Alert.alert(
      appointment.paid_to_worker ? "Marcar como no pagado" : "Marcar como pagado",
      `¿${appointment.paid_to_worker ?  "No" : ""} se ha pagado al trabajador? `,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            // TODO: Actualizar en Supabase
            // await supabase
            //   .from('appointments')
            //   .update({ 
            //     paid_to_worker: !appointment.paid_to_worker,
            //     updated_at: new Date().toISOString()
            //   })
            //   .eq('id', appointment. id);
            
            console. log("Cambiando paid_to_worker a:", !appointment.paid_to_worker);
            Alert.alert("Éxito", "Estado de pago actualizado");
            onUpdate();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <SectionTitle icon="���" title="Estado de Pagos" />

      {/* Método de pago */}
      <View style={styles.paymentMethodSection}>
        <Text style={styles.paymentMethodLabel}>Método de pago:</Text>
        {appointment.payment_method ? (
          <View style={styles.paymentMethodDisplay}>
            <View style={styles.paymentMethodBadgeLarge}>
              <Text style={styles.paymentMethodBadgeIcon}>
                {
                  {
                    cash: "💵",
                    transfer: "🏦",
                    debit: "💳",
                    credit: "💳",
                    mercadopago: "📱",
                    other: "💰",
                  }[appointment.payment_method]
                }
              </Text>
              <Text style={styles.paymentMethodBadgeText}>
                {
                  {
                    cash:  "Efectivo",
                    transfer: "Transferencia",
                    debit: "Débito",
                    credit: "Crédito",
                    mercadopago: "Mercado Pago",
                    other: "Otro",
                  }[appointment.payment_method]
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changePaymentMethodButton}
              onPress={changePaymentMethod}
            >
              <Text style={styles.changePaymentMethodText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addPaymentMethodButton}
            onPress={changePaymentMethod}
          >
            <Text style={styles.addPaymentMethodText}>
              ➕ Agregar método de pago
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pago al trabajador */}
      <PaymentStatusCard
        label="Pago al trabajador"
        paid={appointment.paid_to_worker}
        onToggle={toggleWorkerPayment}
      />
    </View>
  );
}

function PaymentStatusCard({ label, paid, onToggle }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        paid ? styles.paymentCardPaid : styles.paymentCardPending,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.paymentCardContent}>
        <Text style={styles.paymentCardIcon}>{paid ? "✅" :  "⏳"}</Text>
        <View style={styles.paymentCardInfo}>
          <Text style={styles.paymentCardLabel}>{label}</Text>
          <Text
            style={[
              styles. paymentCardStatus,
              paid
                ? styles.paymentCardStatusPaid
                : styles.paymentCardStatusPending,
            ]}
          >
            {paid ? "Pagado" : "Pendiente"}
          </Text>
        </View>
      </View>
      <Text style={styles.paymentCardArrow}>›</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// SECCIÓN: BOTONES DE ACCIÓN
// ============================================================================
function ActionButtonsSection({ appointment, onUpdate }: any) {
  const handleDelete = () => {
    Alert.alert(
      "Eliminar cita",
      "¿Estás seguro que deseas eliminar esta cita?  Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // TODO: Eliminar de Supabase
            // await supabase. from('appointments').delete().eq('id', appointment.id);
            
            console.log("Eliminando cita:", appointment.id);
            Alert.alert("Eliminada", "La cita ha sido eliminada", [
              {
                text: "OK",
                onPress: () => router.replace("/(admin)/(appointments)"),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleToggleRetouches = () => {
    Alert.alert(
      appointment.has_retouches ? "Quitar retoques" : "Marcar con retoques",
      `¿${appointment.has_retouches ?  "Ya no" : ""} requiere retoques?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text:  "Confirmar",
          onPress: async () => {
            // TODO:  Actualizar en Supabase
            // await supabase
            //   .from('appointments')
            //   .update({ 
            //     has_retouches: !appointment.has_retouches,
            //     updated_at: new Date().toISOString()
            //   })
            //   .eq('id', appointment.id);
            
            console.log("Cambiando has_retouches a:", !appointment.has_retouches);
            Alert.alert("Actualizado", "Estado de retoques actualizado");
            onUpdate();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      {/* Botón de retoques */}
      <TouchableOpacity
        style={[
          styles.retouchButton,
          appointment.has_retouches && styles.retouchButtonActive,
        ]}
        onPress={handleToggleRetouches}
      >
        <Text
          style={[
            styles. retouchButtonText,
            appointment.has_retouches && styles.retouchButtonTextActive,
          ]}
        >
          {appointment.has_retouches ?  "✓ Requiere retoques" : "Marcar retoques"}
        </Text>
      </TouchableOpacity>

      {/* Botón eliminar */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>🗑️ Eliminar cita</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================
function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitleIcon}>{icon}</Text>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value, icon }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <View style={styles.infoValueContainer}>
        {icon && <Text style={styles. infoIcon}>{icon}</Text>}
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
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 20,
  },

  // Section
  section: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleIcon:  {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical:  8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical:  10,
    borderRadius: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "flex-end",
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textAlign: "right",
    flexShrink: 1,
  },

  // Worker Info
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 12,
  },
  workerAvatar:  {
    fontSize: 32,
    marginRight: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  workerCommission: {
    fontSize:  13,
    color: "#10B981",
    fontWeight: "500",
  },

  // Financial Card
  financialCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  financialRow: {
    flexDirection: "row",
    justifyContent:  "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: "#166534",
  },
  financialValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  financialHighlight: {
    color: "#10B981",
    fontWeight: "bold",
  },
  financialDivider: {
    height: 1,
    backgroundColor: "#86EFAC",
    marginVertical: 8,
  },

  // Payment Method
  paymentMethodSection: {
    marginBottom: 16,
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  paymentMethodDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical:  6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paymentMethodBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical:  10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paymentMethodBadgeIcon: {
    fontSize:  16,
    marginRight:  8,
  },
  paymentMethodBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  changePaymentMethodButton: {
    paddingHorizontal: 16,
    paddingVertical:  8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  changePaymentMethodText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  addPaymentMethodButton: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addPaymentMethodText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  // Payment Card
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  paymentCardPaid: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  paymentCardPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  paymentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentCardInfo: {
    flex: 1,
  },
  paymentCardLabel:  {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  paymentCardStatus:  {
    fontSize: 13,
    fontWeight: "500",
  },
  paymentCardStatusPaid: {
    color: "#10B981",
  },
  paymentCardStatusPending: {
    color: "#F59E0B",
  },
  paymentCardArrow: {
    fontSize: 24,
    color: "#D1D5DB",
  },

  // Retouch Button
  retouchButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  retouchButtonActive:  {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  retouchButtonText: {
    fontSize:  16,
    fontWeight: "600",
    color: "#6B7280",
  },
  retouchButtonTextActive: {
    color: "#F59E0B",
  },

  // Action Link
  actionLink: {
    padding: 12,
    alignItems: "center",
  },
  actionLinkText:  {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight:  "600",
  },

  // Delete Button
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding:  16,
    alignItems:  "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },

  // No Data
  noDataText: {
    fontSize: 14,
    color:  "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },

  // Loading & Error
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
  errorContainer: {
    flex: 1,
    justifyContent:  "center",
    alignItems:  "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 24,
  },
});
