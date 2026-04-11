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
import {
  DashboardHeader,
  StatCard,
  QuickActionButton,
  AppointmentPreviewCard,
} from "../../../components/admin/dashboard";
import { getAdminDashboardData, DashboardStats } from "../../../utils/database";

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    monthlyRevenue: 0,
    completedToday: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const { stats, todayAppointments } = await getAdminDashboardData();
      setStats(stats);
      setTodayAppointments(todayAppointments);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <View style={styles.container}>
      <DashboardHeader />
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
        <StatsSection stats={stats} />
        <QuickActionsSection />
        <TodayAppointmentsSection
          appointments={todayAppointments}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  ESTADÍSTICAS
// ============================================================================
function StatsSection({ stats }: any) {
  return (
    <View style={styles.statsGrid}>
      <StatCard
        icon="📅"
        label="Turnos Hoy"
        value={stats.todayAppointments}
        color="#3B82F6"
      />
      <StatCard
        icon="⏳"
        label="Pendientes"
        value={stats.pendingAppointments}
        color="#F59E0B"
      />
      <StatCard
        icon="✅"
        label="Completadas"
        value={stats.completedToday}
        color="#10B981"
      />
      <StatCard
        icon="💰"
        label="Ingresos Mes"
        value={`$${stats.monthlyRevenue.toLocaleString()}`}
        color="#8B5CF6"
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: ACCIONES RÁPIDAS
// ============================================================================
function QuickActionsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

      <QuickActionButton
        icon="➕"
        title="Nuevo Turno"
        subtitle="Agendar nuevo servicio"
        onPress={() => router.push("/admin/appointments/new")}
        color="#3B82F6"
      />

      <QuickActionButton
        icon="📋"
        title="Ver Todas los turnos"
        subtitle="Gestionar appointments"
        onPress={() => router.push("/admin/appointments")}
        color="#10B981"
      />

      <QuickActionButton
        icon="👥"
        title="Gestionar Trabajadores"
        subtitle="Ver disponibilidad y asignaciones"
        onPress={() => router.push("/admin/availability")}
        color="#F59E0B"
      />

      <QuickActionButton
        icon="📊"
        title="Contabilidad"
        subtitle="Resumen mensual y pagos"
        onPress={() => router.push("/admin/accounting")}
        color="#8B5CF6"
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: CITAS DE HOY
// ============================================================================
function TodayAppointmentsSection({ appointments, loading }: any) {
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Turnos de Hoy</Text>
        <Text style={styles.loadingText}>Cargando... </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Turnos de Hoy</Text>
        <TouchableOpacity onPress={() => router.push("/admin/appointments")}>
          <Text style={styles.seeAll}>Ver todas →</Text>
        </TouchableOpacity>
      </View>

      {appointments.length > 0 ? (
        appointments.map((appointment: any) => (
          <TouchableOpacity
            key={appointment.id}
            onPress={() => router.push(`/admin/appointments/${appointment.id}`)}
            activeOpacity={0.7}
          >
            <AppointmentPreviewCard
              date={appointment.date}
              customer={appointment.customer}
              service={appointment.service}
              worker={appointment.worker}
              status={appointment.status}
              paymentMethod={appointment.paymentMethod}
            />
          </TouchableOpacity>
        ))
      ) : (
        <EmptyAppointments />
      )}
    </View>
  );
}

function EmptyAppointments() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>No hay turnos programados para hoy</Text>
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

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
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

  // Loading
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 32,
  },

  // Empty State
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
