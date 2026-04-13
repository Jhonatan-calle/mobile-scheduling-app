import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMonthlySummary } from "../../../utils/adminData";

export default function AccountingScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [currentMonth]);

  const loadSummary = async () => {
    try {
      if (! refreshing) setLoading(true);
      setSummary(await getMonthlySummary(currentMonth));
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading summary:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSummary();
  };

  const changeMonth = (direction:  "prev" | "next") => {
    const newDate = new Date(currentMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
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
      currentMonth.getMonth() === now.getMonth() &&
      currentMonth.getFullYear() === now.getFullYear()
    );
  };

  const isFutureMonth = () => {
    const now = new Date();
    return currentMonth > now;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AccountingHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando... </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        {/* Selector de Mes */}
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
              <Text style={styles.monthText}>{formatMonth(currentMonth)}</Text>
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

        {/* Resumen Principal */}
        <ProfitSummarySection summary={summary} />

        {/* Tarjetas de Acceso Rápido */}
        <QuickAccessSection />

        {/* Desglose Rápido */}
        <BreakdownSection summary={summary} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function AccountingHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles. headerTitle}>Contabilidad</Text>
        <Text style={styles.headerSubtitle}>Control financiero</Text>
      </View>
    </View>
  );
}

// ============================================================================
// RESUMEN DE GANANCIAS
// ============================================================================
function ProfitSummarySection({ summary }: any) {
  const profitColor = summary. netProfit >= 0 ? "#10B981" : "#EF4444";

  return (
    <View style={styles.section}>
      <View style={styles.profitCard}>
        <Text style={styles.profitLabel}>Ganancia Neta</Text>
        <Text style={[styles.profitValue, { color: profitColor }]}>
          ${summary.netProfit.toLocaleString()}
        </Text>
        <View style={styles.profitBreakdown}>
          <Text style={styles.profitBreakdownText}>
            Ingresos: ${summary.totalIncome.toLocaleString()}
          </Text>
          <Text style={styles.profitBreakdownText}>
            Salarios: -${summary.totalSalaries. toLocaleString()}
          </Text>
          <Text style={styles.profitBreakdownText}>
            Gastos: -${summary.totalExpenses.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatMiniCard
          icon="📅"
          label="Turnos"
          value={summary.totalAppointments}
          color="#3B82F6"
        />
        <StatMiniCard
          icon="🔄"
          label="Repasos"
          value={summary. totalRetouches}
          color="#F59E0B"
        />
      </View>
    </View>
  );
}

function StatMiniCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.statMini, { borderLeftColor: color }]}>
      <Text style={styles.statMiniIcon}>{icon}</Text>
      <View>
        <Text style={styles. statMiniValue}>{value}</Text>
        <Text style={styles.statMiniLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// ACCESO RÁPIDO
// ============================================================================
function QuickAccessSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gestión</Text>

      <View style={styles.quickAccessGrid}>
        <QuickAccessCard
          icon="💰"
          title="Gastos"
          subtitle="Registrar gastos"
          color="#EF4444"
          onPress={() => router.push("/admin/accounting/expenses")}
        />
        <QuickAccessCard
          icon="💵"
          title="Pagos"
          subtitle="Estado de pagos"
          color="#10B981"
          onPress={() => router.push("/admin/accounting/payments")}
        />
        <QuickAccessCard
          icon="📊"
          title="Desglose"
          subtitle="Ver detalle"
          color="#8B5CF6"
          onPress={() => router.push("/admin/accounting/summary")}
        />
      </View>
    </View>
  );
}

function QuickAccessCard({ icon, title, subtitle, color, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.quickAccessCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.quickAccessIcon}>{icon}</Text>
      <View style={styles.quickAccessContent}>
        <Text style={styles. quickAccessTitle}>{title}</Text>
        <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.quickAccessArrow}>›</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// DESGLOSE RÁPIDO
// ============================================================================
function BreakdownSection({ summary }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Desglose de Gastos</Text>

      <View style={styles.expensesList}>
        <ExpenseRow icon="⛽" label="Nafta" amount={summary.expenses.fuel} />
        <ExpenseRow icon="📢" label="Publicidad" amount={summary.expenses. advertising} />
        <ExpenseRow icon="🧴" label="Insumos" amount={summary.expenses.supplies} />
        <ExpenseRow icon="🔧" label="Mantenimiento" amount={summary.expenses.maintenance} />
        <ExpenseRow icon="📦" label="Otros" amount={summary.expenses.other} />
      </View>

      <TouchableOpacity
        style={styles.addExpenseButton}
        onPress={() => router.push("/admin/accounting/expenses/new")}
        activeOpacity={0.8}
      >
        <Text style={styles.addExpenseButtonText}>+ Agregar Gasto</Text>
      </TouchableOpacity>
    </View>
  );
}

function ExpenseRow({ icon, label, amount }:  any) {
  return (
    <View style={styles.expenseRow}>
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseIcon}>{icon}</Text>
        <Text style={styles.expenseLabel}>{label}</Text>
      </View>
      <Text style={styles.expenseAmount}>
        ${amount.toLocaleString()}
      </Text>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet. create({
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
    color:  "#6B7280",
    marginTop: 4,
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
    borderRadius:  8,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "capitalize",
  },
  currentBadge: {
    backgroundColor:  "#10B981",
    paddingHorizontal: 8,
    paddingVertical:  2,
    borderRadius: 8,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Profit Card
  profitCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#86EFAC",
  },
  profitLabel: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
  },
  profitBreakdown: {
    gap: 4,
  },
  profitBreakdownText: {
    fontSize: 13,
    color: "#166534",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statMini: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statMiniIcon: {
    fontSize: 24,
  },
  statMiniValue:  {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  statMiniLabel: {
    fontSize:  11,
    color: "#6B7280",
  },

  // Quick Access
  quickAccessGrid: {
    gap: 12,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:  0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  quickAccessContent: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  quickAccessArrow: {
    fontSize: 24,
    color: "#D1D5DB",
  },

  // Expenses
  expensesList: {
    gap: 12,
    marginBottom: 16,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expenseIcon: {
    fontSize: 24,
  },
  expenseLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  expenseAmount: {
    fontSize:  15,
    fontWeight: "600",
    color: "#EF4444",
  },

  // Add Expense Button
  addExpenseButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  addExpenseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
