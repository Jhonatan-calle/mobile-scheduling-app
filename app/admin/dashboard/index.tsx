import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  DashboardHeader,
  StatCard,
  QuickActionButton,
  AppointmentPreviewCard,
} from "../../../components/admin/dashboard";

export default function AdminHome() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    monthlyRevenue: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Mock:  Estructura real con relaciones
      const mockAppointments = [
        {
          id: 1,
          date: new Date().toISOString(), // Hoy 09: 00
          cost: 15000,
          status: "pending",
          payment_method: "cash",
          client:  {
            id: 1,
            name: "Juan Pérez",
            phone_number: "351 234 5678",
          },
          worker: {
            id: 1,
            profile: {
              id: 1,
              name:  "Carlos González",
            },
          },
          service: "sillones",
          service_details: "Limpieza de sillón 3 cuerpos",
        },
        {
          id: 2,
          date: (() => {
            const d = new Date();
            d.setHours(14, 0, 0, 0);
            return d.toISOString();
          })(),
          cost: 12000,
          status: "in_progress",
          payment_method: null,
          client: {
            id: 2,
            name: "María López",
            phone_number: "351 456 7890",
          },
          worker: {
            id:  2,
            profile: {
              id: 2,
              name: "Ana Martínez",
            },
          },
          service: "alfombra",
          service_details: "Limpieza de alfombra persa",
        },
      ];

      // Calcular estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayApts = mockAppointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate. getTime() === today.getTime();
      });

      const pendingApts = mockAppointments.filter(
        (apt) => apt.status === "pending"
      );

      const completedToday = todayApts.filter(
        (apt) => apt.status === "completed"
      ).length;

      // Mock: Revenue del mes (vendría de month_summaries)
      const monthlyRevenue = 450000;

      setStats({
        todayAppointments: todayApts.length,
        pendingAppointments: pendingApts.length,
        completedToday,
        monthlyRevenue,
      });

      // Transformar turno de hoy
      const transformedAppointments = todayApts. map((apt) => ({
        id: apt.id. toString(),
        time: new Date(apt.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        customer: apt.client.name,
        service: apt.service_details,
        worker: apt.worker.profile.name,
        status: apt.status === "in_progress" ? "in-progress" : apt.status,
        paymentMethod: apt.payment_method,
      }));

      setTodayAppointments(transformedAppointments);
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <DashboardHeader />

      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
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
        onPress={() => router.push("/admin/workers")}
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
      <View style={styles. section}>
        <Text style={styles.sectionTitle}>Turnos de Hoy</Text>
        <Text style={styles.loadingText}>Cargando... </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Turnos de Hoy</Text>
        <TouchableOpacity
          onPress={() => router.push("/admin/appointments")}
        >
          <Text style={styles.seeAll}>Ver todas →</Text>
        </TouchableOpacity>
      </View>

      {appointments.length > 0 ? (
        appointments.map((appointment: any) => (
          <TouchableOpacity
            key={appointment.id}
            onPress={() =>
              router.push(`/admin/appointments/${appointment.id}`)
            }
            activeOpacity={0.7}
          >
            <AppointmentPreviewCard
              time={appointment.time}
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
      <Text style={styles.emptyText}>
        No hay turnos programados para hoy
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
    justifyContent:  "space-between",
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
    textAlign:  "center",
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
    shadowOpacity:  0.05,
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
    textAlign:  "center",
  },
});
