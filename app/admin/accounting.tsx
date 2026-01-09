import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";

export default function AccountingScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "month">(
    "current",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountingData();
  }, [selectedPeriod]);

  const loadAccountingData = async () => {
    try {
      setLoading(true);

      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoading(false);
      setRefreshing(false); // ← NUEVO
    } catch (error) {
      console.error("Error loading accounting:", error);
      setLoading(false);
      setRefreshing(false); // ← NUEVO
    }
  };

  // ← NUEVO
  const onRefresh = () => {
    setRefreshing(true);
    loadAccountingData();
  };

  return (
    <View style={styles.container}>
      <AccountingHeader />

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
        <PeriodSelector
          selected={selectedPeriod}
          onSelect={setSelectedPeriod}
        />
        <FinancialSummarySection period={selectedPeriod} />
        <WorkerPaymentsSection />
        <RecentTransactionsSection />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  HEADER
// ============================================================================
function AccountingHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Contabilidad</Text>
        <Text style={styles.headerSubtitle}>Resumen financiero</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: SELECTOR DE PERÍODO
// ============================================================================
function PeriodSelector({ selected, onSelect }: any) {
  return (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[
          styles.periodButton,
          selected === "current" && styles.periodButtonActive,
        ]}
        onPress={() => onSelect("current")}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.periodButtonText,
            selected === "current" && styles.periodButtonTextActive,
          ]}
        >
          Mes actual
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.periodButton,
          selected === "month" && styles.periodButtonActive,
        ]}
        onPress={() => onSelect("month")}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.periodButtonText,
            selected === "month" && styles.periodButtonTextActive,
          ]}
        >
          Mes completo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// SECCIÓN: RESUMEN FINANCIERO
// ============================================================================
function FinancialSummarySection({ period }: any) {
  const summary = {
    totalRevenue: 450000,
    totalPaid: 320000,
    totalPending: 130000,
    workerPayments: 280000,
    profit: 170000,
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {period === "current" ? "Resumen del mes actual" : "Resumen mensual"}
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryAmount}>
            ${summary.totalRevenue.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Ingresos totales</Text>
        </View>

        <View style={styles.summaryDivider} />

        <SummaryRow
          icon="💰"
          label="Cobrado"
          amount={summary.totalPaid}
          color="#10B981"
        />
        <SummaryRow
          icon="⏳"
          label="Pendiente"
          amount={summary.totalPending}
          color="#F59E0B"
        />
        <SummaryRow
          icon="👥"
          label="Pagos a trabajadores"
          amount={summary.workerPayments}
          color="#EF4444"
          negative
        />

        <View style={styles.summaryDivider} />

        <View style={styles.profitRow}>
          <Text style={styles.profitLabel}>Ganancia neta</Text>
          <Text style={styles.profitAmount}>
            ${summary.profit.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ icon, label, amount, color, negative = false }: any) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryRowLeft}>
        <Text style={styles.summaryRowIcon}>{icon}</Text>
        <Text style={styles.summaryRowLabel}>{label}</Text>
      </View>
      <Text style={[styles.summaryRowAmount, { color }]}>
        {negative && "-"}${amount.toLocaleString()}
      </Text>
    </View>
  );
}

// ============================================================================
// SECCIÓN: PAGOS A TRABAJADORES
// ============================================================================
function WorkerPaymentsSection() {
  const workers = [
    {
      id: "1",
      name: "Carlos González",
      earned: 120000,
      paid: 100000,
      pending: 20000,
      status: "partial",
    },
    {
      id: "2",
      name: "Ana Martínez",
      earned: 90000,
      paid: 90000,
      pending: 0,
      status: "paid",
    },
    {
      id: "3",
      name: "Luis Rodríguez",
      earned: 70000,
      paid: 50000,
      pending: 20000,
      status: "partial",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pagos a trabajadores</Text>

      {workers.map((worker) => (
        <WorkerPaymentCard key={worker.id} worker={worker} />
      ))}
    </View>
  );
}

function WorkerPaymentCard({ worker }: any) {
  const statusConfig = {
    paid: { label: "Pagado", color: "#10B981", icon: "✅" },
    partial: { label: "Pago parcial", color: "#F59E0B", icon: "⏳" },
    pending: { label: "Pendiente", color: "#EF4444", icon: "❌" },
  };

  const config = statusConfig[worker.status as keyof typeof statusConfig];

  return (
    <TouchableOpacity style={styles.workerPaymentCard} activeOpacity={0.7}>
      <View style={styles.workerPaymentInfo}>
        <Text style={styles.workerPaymentName}>{worker.name}</Text>
        <View style={styles.workerPaymentStatus}>
          <Text style={styles.workerPaymentStatusIcon}>{config.icon}</Text>
          <Text
            style={[styles.workerPaymentStatusText, { color: config.color }]}
          >
            {config.label}
          </Text>
        </View>
      </View>

      <View style={styles.workerPaymentAmounts}>
        <Text style={styles.workerPaymentEarned}>
          Ganado: ${worker.earned.toLocaleString()}
        </Text>
        <Text style={styles.workerPaymentPaid}>
          Pagado: ${worker.paid.toLocaleString()}
        </Text>
        {worker.pending > 0 && (
          <Text style={styles.workerPaymentPending}>
            Debe: ${worker.pending.toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// SECCIÓN:  TRANSACCIONES RECIENTES
// ============================================================================
function RecentTransactionsSection() {
  const transactions = [
    {
      id: "1",
      type: "income",
      description: "Pago cita - Juan Pérez",
      amount: 15000,
      date: "Hoy, 14:30",
    },
    {
      id: "2",
      type: "expense",
      description: "Pago a Carlos González",
      amount: 50000,
      date: "Hoy, 10:00",
    },
    {
      id: "3",
      type: "income",
      description: "Pago cita - María López",
      amount: 12000,
      date: "Ayer, 16:45",
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transacciones recientes</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver todas →</Text>
        </TouchableOpacity>
      </View>

      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </View>
  );
}

function TransactionCard({ transaction }: any) {
  const isIncome = transaction.type === "income";

  return (
    <View style={styles.transactionCard}>
      <View
        style={[
          styles.transactionIcon,
          { backgroundColor: isIncome ? "#D1FAE5" : "#FEE2E2" },
        ]}
      >
        <Text style={styles.transactionIconText}>{isIncome ? "📥" : "📤"}</Text>
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          { color: isIncome ? "#10B981" : "#EF4444" },
        ]}
      >
        {isIncome ? "+" : "-"}${transaction.amount.toLocaleString()}
      </Text>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // Period Selector
  periodSelector: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#3B82F6",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },

  // Section
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryRowIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryRowLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  summaryRowAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  profitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  profitAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
  },

  // Worker Payment Card
  workerPaymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workerPaymentInfo: {
    marginBottom: 12,
  },
  workerPaymentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  workerPaymentStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  workerPaymentStatusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  workerPaymentStatusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  workerPaymentAmounts: {
    gap: 4,
  },
  workerPaymentEarned: {
    fontSize: 14,
    color: "#6B7280",
  },
  workerPaymentPaid: {
    fontSize: 14,
    color: "#10B981",
  },
  workerPaymentPending: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },

  // Transaction Card
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
