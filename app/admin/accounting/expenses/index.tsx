import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth]);

  const loadExpenses = async () => {
    try {
      if (! refreshing) setLoading(true);

      // Mock data - TODO: Cargar de Supabase
      const mockExpenses = [
        {
          id:  1,
          category: "fuel",
          description: "Nafta para camioneta",
          amount: 15000,
          date: "2024-01-15T10:00:00Z",
          createdBy: "Admin",
        },
        {
          id:  2,
          category: "advertising",
          description: "Facebook Ads - Enero",
          amount: 20000,
          date: "2024-01-10T09:00:00Z",
          createdBy: "Admin",
        },
        {
          id: 3,
          category: "supplies",
          description: "Productos de limpieza",
          amount: 25000,
          date: "2024-01-12T14:30:00Z",
          createdBy: "Admin",
        },
        {
          id:  4,
          category: "fuel",
          description: "Nafta",
          amount: 18000,
          date: "2024-01-18T11:00:00Z",
          createdBy: "Admin",
        },
        {
          id:  5,
          category: "maintenance",
          description: "Service camioneta",
          amount: 35000,
          date: "2024-01-20T16:00:00Z",
          createdBy: "Admin",
        },
        {
          id: 6,
          category: "advertising",
          description: "Instagram Ads",
          amount: 15000,
          date: "2024-01-22T10:00:00Z",
          createdBy: "Admin",
        },
        {
          id: 7,
          category:  "other",
          description: "Gastos varios",
          amount: 12000,
          date: "2024-01-25T13:00:00Z",
          createdBy: "Admin",
        },
      ];

      // Ordenar por fecha descendente
      const sorted = mockExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setExpenses(sorted);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading expenses:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  const handleDeleteExpense = (expense: any) => {
    Alert.alert(
      "Eliminar Gasto",
      `¿Eliminar "${expense.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // TODO: Eliminar de Supabase
            console.log("Eliminando gasto:", expense. id);
            Alert.alert("Eliminado", "Gasto eliminado correctamente");
            loadExpenses();
          },
        },
      ]
    );
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
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

  return (
    <View style={styles.container}>
      <ExpensesHeader totalExpenses={getTotalExpenses()} />

      {/* Month Selector */}
      <View style={styles.monthSection}>
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
                styles. monthButtonText,
                isFutureMonth() && styles.monthButtonTextDisabled,
              ]}
            >
              Siguiente →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={expenses}
        renderItem={({ item }) => (
          <ExpenseCard expense={item} onDelete={handleDeleteExpense} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles. emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No hay gastos registrados</Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/admin/accounting/expenses/new")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function ExpensesHeader({ totalExpenses }: any) {
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
        <Text style={styles.headerTitle}>Gastos</Text>
        <Text style={styles. headerSubtitle}>
          Total: ${totalExpenses. toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// EXPENSE CARD
// ============================================================================
function ExpenseCard({ expense, onDelete }: any) {
  const categoryConfig:  any = {
    fuel: { icon: "⛽", label: "Nafta", color: "#EF4444" },
    advertising: { icon: "📢", label: "Publicidad", color: "#8B5CF6" },
    supplies: { icon: "🧴", label: "Insumos", color: "#3B82F6" },
    maintenance: { icon: "🔧", label: "Mantenimiento", color: "#F59E0B" },
    other:  { icon: "📦", label: "Otros", color: "#6B7280" },
  };

  const config = categoryConfig[expense.category] || categoryConfig.other;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month:  "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.expenseCard}>
      <View style={styles.expenseCardHeader}>
        <View style={styles.expenseCategory}>
          <Text style={styles.expenseCategoryIcon}>{config.icon}</Text>
          <Text style={[styles.expenseCategoryText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
      </View>

      <Text style={styles.expenseDescription}>{expense.description}</Text>

      <View style={styles.expenseCardFooter}>
        <Text style={styles.expenseAmount}>
          ${expense.amount.toLocaleString()}
        </Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(expense)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
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
    backgroundColor:  "#F9FAFB",
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
    fontSize:  14,
    color: "#EF4444",
    marginTop: 2,
    fontWeight: "600",
  },

  // Month Selector
  monthSection: {
    padding: 16,
    backgroundColor:  "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "capitalize",
  },
  currentBadge: {
    backgroundColor: "#10B981",
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

  // List
  listContent: {
    padding: 16,
  },

  // Expense Card
  expenseCard: {
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
  expenseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expenseCategory: {
    flexDirection:  "row",
    alignItems:  "center",
    gap: 8,
  },
  expenseCategoryIcon: {
    fontSize: 20,
  },
  expenseCategoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  expenseDate: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  expenseDescription: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
  },
  expenseCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  expenseAmount:  {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical:  6,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
  },

  // Empty State
  emptyContainer: {
    padding: 64,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom:  20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize:  32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
