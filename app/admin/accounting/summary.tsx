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

export default function SummaryScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadSummary();
  }, [selectedMonth]);

  const loadSummary = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Mock data - TODO: Cargar de Supabase
      const mockSummary = {
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),

        // Ingresos
        income: {
          appointments: 680000,
          retouches: 0, // Los repasos no generan ingreso
          total: 680000,
        },
        appointmentDetails: {
          total: 68,
          completed: 65,
          pending: 3,
          cancelled: 0,
        },
        retouchDetails: {
          total: 12,
          completed: 10,
          pending: 2,
        },

        // Egresos - Salarios
        salaries: {
          workers: [
            { name: "Carlos González", earned: 270000, paid: 270000, pending: 0 },
            { name: "Ana Martínez", earned: 150000, paid: 100000, pending: 50000 },
            { name: "Luis Rodríguez", earned:  90000, paid: 90000, pending: 0 },
          ],
          totalEarned: 510000,
          totalPaid:  460000,
          totalPending: 50000,
        },

        // Egresos - Gastos
        expenses: {
          byCategory: {
            fuel: 45000,
            advertising: 35000,
            supplies: 50000,
            maintenance: 25000,
            other: 25000,
          },
          total: 180000,
        },

        // Resultados
        grossProfit: 170000, // Ingresos - Salarios Pagados
        netProfit: -10000,   // Ingresos - Salarios Pagados - Gastos
        theoreticalProfit: 40000, // Ingresos - Salarios Ganados (incluye pendientes)
      };

      setSummary(mockSummary);
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
      year:  "numeric",
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

  if (loading) {
    return (
      <View style={styles. container}>
        <SummaryHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SummaryHeader />

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
                <View style={styles. currentBadge}>
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

        {/* Profit Overview */}
        <ProfitOverviewSection summary={summary} />

        {/* Income Detail */}
        <IncomeSection income={summary.income} details={summary.appointmentDetails} retouches={summary.retouchDetails} />

        {/* Salaries Detail */}
        <SalariesSection salaries={summary.salaries} />

        {/* Expenses Detail */}
        <ExpensesSection expenses={summary.expenses} />

        {/* Final Balance */}
        <FinalBalanceSection summary={summary} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function SummaryHeader() {
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
        <Text style={styles.headerTitle}>Desglose Detallado</Text>
        <Text style={styles.headerSubtitle}>Análisis completo</Text>
      </View>
    </View>
  );
}

// ============================================================================
// PROFIT OVERVIEW
// ============================================================================
function ProfitOverviewSection({ summary }:  any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resumen Financiero</Text>

      <View style={styles.profitGrid}>
        <ProfitCard
          label="Ganancia Neta Real"
          value={summary.netProfit}
          sublabel={`Ingresos - Salarios Pagados - Gastos`}
          isPrimary
        />
        <ProfitCard
          label="Ganancia Teórica"
          value={summary.theoreticalProfit}
          sublabel={`Incluye salarios pendientes`}
        />
      </View>
    </View>
  );
}

function ProfitCard({ label, value, sublabel, isPrimary }: any) {
  const color = value >= 0 ? "#10B981" : "#EF4444";
  const bgColor = value >= 0 ?  "#F0FDF4" : "#FEE2E2";
  const borderColor = value >= 0 ?  "#86EFAC" : "#FCA5A5";

  return (
    <View
      style={[
        styles. profitCard,
        { backgroundColor: bgColor, borderColor:  borderColor },
        isPrimary && styles.profitCardPrimary,
      ]}
    >
      <Text style={[styles.profitCardLabel, { color }]}>{label}</Text>
      <Text style={[styles.profitCardValue, { color }]}>
        ${Math.abs(value).toLocaleString()}
      </Text>
      {value < 0 && <Text style={[styles.profitCardValue, { color }]}>(pérdida)</Text>}
      <Text style={[styles.profitCardSublabel, { color }]}>{sublabel}</Text>
    </View>
  );
}

// ============================================================================
// INCOME SECTION
// ============================================================================
function IncomeSection({ income, details, retouches }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles. sectionTitle}>📈 Ingresos</Text>

      <View style={styles. amountCard}>
        <Text style={styles.amountLabel}>Total Ingresos</Text>
        <Text style={styles.amountValue}>
          ${income.total.toLocaleString()}
        </Text>
      </View>

      <View style={styles.detailsList}>
        <DetailRow
          label="Turnos completados"
          value={`${details.completed} turnos`}
          amount={income.appointments}
        />
        <DetailRow
          label="Repasos completados"
          value={`${retouches.completed} repasos`}
          amount={0}
          note="Sin cargo"
        />
      </View>

      <View style={styles.statsRow}>
        <StatItem label="Pendientes" value={details.pending} color="#F59E0B" />
        <StatItem label="Cancelados" value={details.cancelled} color="#EF4444" />
      </View>
    </View>
  );
}

// ============================================================================
// SALARIES SECTION
// ============================================================================
function SalariesSection({ salaries }:  any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👥 Salarios</Text>

      <View style={styles. amountCard}>
        <Text style={styles.amountLabel}>Total Pagado</Text>
        <Text style={[styles.amountValue, { color: "#EF4444" }]}>
          -${salaries.totalPaid.toLocaleString()}
        </Text>
      </View>

      <View style={styles. detailsList}>
        {salaries.workers.map((worker: any, index: number) => (
          <View key={index} style={styles. workerRow}>
            <View style={styles.workerRowLeft}>
              <Text style={styles.workerRowName}>{worker.name}</Text>
              <Text style={styles. workerRowAmount}>
                Ganado: ${worker.earned.toLocaleString()}
              </Text>
            </View>
            <View style={styles.workerRowRight}>
              <Text style={styles.workerRowPaid}>
                Pagado: ${worker.paid.toLocaleString()}
              </Text>
              {worker.pending > 0 && (
                <Text style={styles.workerRowPending}>
                  Debe:  ${worker.pending.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {salaries.totalPending > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles. warningText}>
            Hay ${salaries.totalPending. toLocaleString()} pendiente de pago
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// EXPENSES SECTION
// ============================================================================
function ExpensesSection({ expenses }: any) {
  const categoryLabels:  any = {
    fuel: { icon: "⛽", label: "Nafta" },
    advertising: { icon:  "📢", label: "Publicidad" },
    supplies: { icon: "🧴", label: "Insumos" },
    maintenance:  { icon: "🔧", label: "Mantenimiento" },
    other: { icon:  "📦", label: "Otros" },
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💰 Gastos</Text>

      <View style={styles. amountCard}>
        <Text style={styles.amountLabel}>Total Gastos</Text>
        <Text style={[styles. amountValue, { color: "#EF4444" }]}>
          -${expenses.total. toLocaleString()}
        </Text>
      </View>

      <View style={styles.detailsList}>
        {Object.entries(expenses.byCategory).map(([category, amount]:  any) => {
          const config = categoryLabels[category];
          return (
            <DetailRow
              key={category}
              icon={config.icon}
              label={config.label}
              amount={amount}
            />
          );
        })}
      </View>
    </View>
  );
}

// ============================================================================
// FINAL BALANCE
// ============================================================================
function FinalBalanceSection({ summary }: any) {
  const balance = summary.income.total - summary.salaries.totalPaid - summary. expenses.total;
  const balanceColor = balance >= 0 ? "#10B981" : "#EF4444";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💵 Balance Final</Text>

      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Ingresos</Text>
          <Text style={[styles.balanceValue, { color: "#10B981" }]}>
            +${summary.income.total.toLocaleString()}
          </Text>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Salarios Pagados</Text>
          <Text style={[styles.balanceValue, { color: "#EF4444" }]}>
            -${summary.salaries.totalPaid.toLocaleString()}
          </Text>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Gastos</Text>
          <Text style={[styles. balanceValue, { color: "#EF4444" }]}>
            -${summary.expenses. total.toLocaleString()}
          </Text>
        </View>

        <View style={styles.balanceDivider} />

        <View style={styles.balanceRow}>
          <Text style={styles.balanceTotalLabel}>Balance Neto</Text>
          <Text style={[styles.balanceTotalValue, { color: balanceColor }]}>
            ${balance.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function DetailRow({ icon, label, value, amount, note }: any) {
  return (
    <View style={styles.detailRow}>
      <View style={styles. detailLeft}>
        {icon && <Text style={styles.detailIcon}>{icon}</Text>}
        <View>
          <Text style={styles. detailLabel}>{label}</Text>
          {value && <Text style={styles.detailValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.detailRight}>
        {amount !== undefined && (
          <Text style={styles.detailAmount}>
            ${amount.toLocaleString()}
          </Text>
        )}
        {note && <Text style={styles.detailNote}>{note}</Text>}
      </View>
    </View>
  );
}

function StatItem({ label, value, color }: any) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statItemValue}>{value}</Text>
      <Text style={[styles.statItemLabel, { color }]}>{label}</Text>
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
    borderBottomWidth:  1,
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
  headerSubtitle:  {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
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
  monthButton:  {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  monthButtonDisabled:  {
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
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical:  2,
    borderRadius:  8,
    marginTop:  4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Profit Grid
  profitGrid: {
    gap: 12,
  },
  profitCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  profitCardPrimary: {
    borderWidth: 3,
  },
  profitCardLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  profitCardValue: {
    fontSize:  32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profitCardSublabel: {
    fontSize: 12,
    marginTop: 4,
  },

  // Amount Card
  amountCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  // Details List
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  detailValue: {
    fontSize:  12,
    color: "#6B7280",
    marginTop: 2,
  },
  detailRight: {
    alignItems: "flex-end",
  },
  detailAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  detailNote: {
    fontSize: 11,
    color: "#10B981",
    fontStyle: "italic",
    marginTop: 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
  },

  // Worker Row
  workerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  workerRowLeft: {
    flex: 1,
  },
  workerRowName:  {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  workerRowAmount:  {
    fontSize: 12,
    color: "#6B7280",
  },
  workerRowRight: {
    alignItems: "flex-end",
  },
  workerRowPaid: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 2,
  },
  workerRowPending: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
  },

  // Warning Box
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
    flex: 1,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: "#F9FAFB",
    borderRadius:  16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent:  "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  balanceDivider: {
    height:  2,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  balanceTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  balanceTotalValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
});
