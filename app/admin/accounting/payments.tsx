import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function PaymentsScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  // ← NUEVO: Estados para modal de pago
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    loadPayments();
  }, [selectedMonth]);

  const loadPayments = async () => {
    try {
      if (! refreshing) setLoading(true);

      // Mock data - TODO: Cargar de Supabase
      const mockWorkers = [
        {
          id: 1,
          name: "Carlos González",
          phone: "351 234 5678",
          totalEarned: 270000,
          totalPaid: 270000,
          pending: 0,
          appointments: 42,
          retouches: 5,
        },
        {
          id:  2,
          name: "Ana Martínez",
          phone: "351 456 7890",
          totalEarned: 150000,
          totalPaid:  100000,
          pending: 50000,
          appointments: 28,
          retouches: 3,
        },
        {
          id: 3,
          name: "Luis Rodríguez",
          phone: "351 678 9012",
          totalEarned: 90000,
          totalPaid: 90000,
          pending: 0,
          appointments: 18,
          retouches: 4,
        },
      ];

      setWorkers(mockWorkers);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading payments:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  // ← ACTUALIZADO: Ahora abre el modal
  const handleRegisterPayment = (worker: any) => {
    if (worker. pending === 0) {
      Alert.alert("Info", "Este trabajador no tiene deuda pendiente");
      return;
    }

    setSelectedWorker(worker);
    setPaymentAmount(worker.pending.toString()); // Pre-llenar con monto total
    setPaymentModalVisible(true);
  };

  // ← NUEVO: Confirmar pago con monto personalizado
  const handleConfirmPayment = async () => {
    const amount = parseFloat(paymentAmount);

    // Validaciones
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }

    if (amount > selectedWorker.pending) {
      Alert.alert(
        "Error",
        `El monto no puede ser mayor a la deuda ($${selectedWorker.pending. toLocaleString()})`
      );
      return;
    }

    try {
      // TODO: Actualizar en Supabase
      // await supabase
      //   .from('workers')
      //   .update({ 
      //     totalPaid:  selectedWorker.totalPaid + amount,
      //     pending:  selectedWorker.pending - amount 
      //   })
      //   .eq('id', selectedWorker.id);

      console.log("Registrando pago:", {
        workerId: selectedWorker.id,
        amount,
        remaining: selectedWorker.pending - amount,
      });

      setPaymentModalVisible(false);
      setPaymentAmount("");
      setSelectedWorker(null);

      const remainingDebt = selectedWorker.pending - amount;
      
      Alert.alert(
        "Pago Registrado",
        `Se registró el pago de $${amount. toLocaleString()} a ${selectedWorker.name}.\n\n${
          remainingDebt > 0
            ? `Saldo pendiente: $${remainingDebt.toLocaleString()}`
            : "✓ Deuda saldada"
        }`
      );

      loadPayments();
    } catch (error) {
      console.error("Error registering payment:", error);
      Alert.alert("Error", "No se pudo registrar el pago");
    }
  };

  // ← NUEVO: Atajos rápidos para montos comunes
  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round(selectedWorker.pending * percentage);
    setPaymentAmount(amount.toString());
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
    );
  };

  const isFutureMonth = () => {
    const now = new Date();
    return selectedMonth > now;
  };

  const getTotalPending = () => {
    return workers.reduce((sum, w) => sum + w.pending, 0);
  };

  const getTotalPaid = () => {
    return workers.reduce((sum, w) => sum + w.totalPaid, 0);
  };

  if (loading) {
    return (
      <View style={styles. container}>
        <PaymentsHeader totalPending={0} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando... </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PaymentsHeader totalPending={getTotalPending()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Month Selector */}
        <View style={styles.section}>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => changeMonth("prev")}
              activeOpacity={0.7}
            >
              <Text style={styles.monthButtonText}>← Anterior</Text>
            </TouchableOpacity>

            <View style={styles.monthDisplay}>
              <Text style={styles.monthText}>{formatMonth(selectedMonth)}</Text>
              {isCurrentMonth() && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Actual</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.monthButton,
                isFutureMonth() && styles.monthButtonDisabled,
              ]}
              onPress={() => changeMonth("next")}
              disabled={isFutureMonth()}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  isFutureMonth() && styles.monthButtonTextDisabled,
                ]}
              >
                Siguiente →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="💵"
              label="Total Pagado"
              value={`$${getTotalPaid().toLocaleString()}`}
              color="#10B981"
            />
            <SummaryCard
              icon="⏳"
              label="Pendiente"
              value={`$${getTotalPending().toLocaleString()}`}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Workers List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajadores</Text>

          {workers.map((worker) => (
            <WorkerPaymentCard
              key={worker.id}
              worker={worker}
              onRegisterPayment={handleRegisterPayment}
            />
          ))}
        </View>
      </ScrollView>

      {/* ← NUEVO: Modal de Pago */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Pago</Text>
            <Text style={styles.modalSubtitle}>
              {selectedWorker?.name}
            </Text>

            <View style={styles.modalDebtInfo}>
              <Text style={styles.modalDebtLabel}>Deuda total:</Text>
              <Text style={styles.modalDebtValue}>
                ${selectedWorker?.pending.toLocaleString()}
              </Text>
            </View>

            {/* Input de monto */}
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Monto a pagar:</Text>
              <View style={styles.modalAmountInput}>
                <Text style={styles.modalCurrencySymbol}>$</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  autoFocus
                />
              </View>
            </View>

            {/* Atajos rápidos */}
            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsLabel}>Atajos: </Text>
              <View style={styles.quickAmountsRow}>
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => handleQuickAmount(0.25)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => handleQuickAmount(0.5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles. quickAmountText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles. quickAmountButton}
                  onPress={() => handleQuickAmount(0.75)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>75%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAmountButton, styles. quickAmountButtonFull]}
                  onPress={() => handleQuickAmount(1)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickAmountText, styles.quickAmountTextFull]}>
                    Total
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botones */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setPaymentAmount("");
                  setSelectedWorker(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmPayment}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function PaymentsHeader({ totalPending }: any) {
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
        <Text style={styles.headerTitle}>Pagos a Trabajadores</Text>
        <Text style={styles.headerSubtitle}>
          Pendiente: ${totalPending.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// SUMMARY CARD
// ============================================================================
function SummaryCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <View>
        <Text style={styles. summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// WORKER PAYMENT CARD
// ============================================================================
function WorkerPaymentCard({ worker, onRegisterPayment }: any) {
  const isPending = worker.pending > 0;

  return (
    <View style={styles.workerCard}>
      <View style={styles.workerCardHeader}>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker. name}</Text>
          <Text style={styles.workerPhone}>📞 {worker.phone}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isPending ? styles.statusBadgePending : styles.statusBadgePaid,
          ]}
        >
          <Text
            style={[
              styles. statusText,
              isPending ? styles. statusTextPending : styles.statusTextPaid,
            ]}
          >
            {isPending ? "Pendiente" : "Al día"}
          </Text>
        </View>
      </View>

      <View style={styles. workerCardBody}>
        <View style={styles.workerStats}>
          <View style={styles.workerStat}>
            <Text style={styles.workerStatLabel}>Ganado</Text>
            <Text style={styles.workerStatValue}>
              ${worker.totalEarned.toLocaleString()}
            </Text>
          </View>

          <View style={styles.workerStat}>
            <Text style={styles.workerStatLabel}>Pagado</Text>
            <Text style={[styles.workerStatValue, { color:  "#10B981" }]}>
              ${worker.totalPaid.toLocaleString()}
            </Text>
          </View>

          <View style={styles.workerStat}>
            <Text style={styles.workerStatLabel}>Debe</Text>
            <Text style={[styles.workerStatValue, { color: "#EF4444" }]}>
              ${worker.pending.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.workerWork}>
          <Text style={styles.workerWorkText}>
            📅 {worker.appointments} turnos • 🔄 {worker.retouches} repasos
          </Text>
        </View>
      </View>

      {isPending && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => onRegisterPayment(worker)}
          activeOpacity={0.8}
        >
          <Text style={styles.payButtonText}>💵 Registrar Pago</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:  "#F9FAFB",
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
    fontSize:  14,
    color: "#F59E0B",
    marginTop: 2,
    fontWeight: "600",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText:  {
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

  // Month Selector
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical:  8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  monthButtonDisabled: {
    opacity: 0.5,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  monthButtonTextDisabled: {
    color: "#9CA3AF",
  },
  monthDisplay: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "capitalize",
  },
  currentBadge: {
    backgroundColor:  "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryIcon: {
    fontSize: 32,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // Worker Card
  workerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:  0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  workerPhone: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge:  {
    paddingHorizontal: 12,
    paddingVertical:  6,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgePaid: {
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontSize:  12,
    fontWeight: "600",
  },
  statusTextPending:  {
    color: "#F59E0B",
  },
  statusTextPaid: {
    color: "#10B981",
  },

  // Worker Card Body
  workerCardBody: {
    gap: 12,
  },
  workerStats: {
    flexDirection:  "row",
    justifyContent: "space-between",
  },
  workerStat:  {
    alignItems: "center",
  },
  workerStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom:  4,
  },
  workerStatValue: {
    fontSize:  16,
    fontWeight: "bold",
    color: "#111827",
  },
  workerWork: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  workerWorkText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },

  // Pay Button
  payButton: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  payButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // ← NUEVO: Modal
  modalOverlay: {
    flex: 1,
    backgroundColor:  "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle:  {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  modalDebtInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalDebtLabel: {
    fontSize:  14,
    color: "#92400E",
    fontWeight: "600",
  },
  modalDebtValue: {
    fontSize: 18,
    fontWeight: "bold",
    color:  "#92400E",
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalAmountInput:  {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  modalCurrencySymbol: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6B7280",
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 12,
  },
  quickAmountsContainer: {
    marginBottom: 24,
  },
  quickAmountsLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom:  8,
  },
  quickAmountsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickAmountButtonFull: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  quickAmountTextFull: {
    color: "#1E40AF",
  },
  modalButtons: {
    flexDirection:  "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor:  "#F3F4F6",
    borderRadius: 12,
    paddingVertical:  14,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color:  "#374151",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor:  "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
