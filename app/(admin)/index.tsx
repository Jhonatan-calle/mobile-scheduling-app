import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  DashboardHeader,
  StatCard,
  QuickActionButton,
  AppointmentPreviewCard,
} from "../../components/admin/dashboard";

export default function AdminHome() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Aquí cargarías las estadísticas reales desde Supabase
    // Por ahora datos de ejemplo
    setStats({
      todayAppointments: 5,
      pendingAppointments: 12,
      completedToday:  3,
      monthlyRevenue: 45000,
    });
  };

  return (
    <View style={styles.container}>
      <DashboardHeader />

      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        <StatsSection stats={stats} />
        <QuickActionsSection />
        <TodayAppointmentsSection />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  ESTADÍSTICAS
// ============================================================================
function StatsSection({ stats }:  any) {
  return (
    <View style={styles.statsGrid}>
      <StatCard
        icon="📅"
        label="Citas Hoy"
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
// SECCIÓN:  ACCIONES RÁPIDAS
// ============================================================================
function QuickActionsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

      <QuickActionButton
        icon="➕"
        title="Nueva Cita"
        subtitle="Agendar nuevo servicio"
        onPress={() => router.push("/(admin)/appointments/new")}
        color="#3B82F6"
      />

      <QuickActionButton
        icon="📋"
        title="Ver Todas las Citas"
        subtitle="Gestionar appointments"
        onPress={() => router.push("/(admin)/appointments")}
        color="#10B981"
      />

      <QuickActionButton
        icon="👥"
        title="Gestionar Trabajadores"
        subtitle="Ver disponibilidad y asignaciones"
        onPress={() => router.push("/(admin)/workers")}
        color="#F59E0B"
      />

      <QuickActionButton
        icon="📊"
        title="Contabilidad"
        subtitle="Resumen mensual y pagos"
        onPress={() => router.push("/(admin)/accounting")}
        color="#8B5CF6"
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: CITAS DE HOY
// ============================================================================
function TodayAppointmentsSection() {
  // Datos de ejemplo - en el futuro vendrían de Supabase
  const todayAppointments = [
    {
      id: "1",
      time: "09:00",
      customer: "Juan Pérez",
      service: "Limpieza de sillón 3 cuerpos",
      worker: "Carlos González",
      status: "pending" as const,
    },
    {
      id: "2",
      time: "14:00",
      customer: "María López",
      service: "Limpieza de alfombra",
      worker: "Ana Martínez",
      status: "in-progress" as const,
    },
  ];

  return (
    <View style={styles. section}>
      <View style={styles.sectionHeader}>
        <Text style={styles. sectionTitle}>Citas de Hoy</Text>
        <TouchableOpacity onPress={() => router.push("/(admin)/appointments")}>
          <Text style={styles.seeAll}>Ver todas →</Text>
        </TouchableOpacity>
      </View>

      {todayAppointments.length > 0 ? (
        todayAppointments.map((appointment) => (
          <AppointmentPreviewCard
            key={appointment.id}
            time={appointment.time}
            customer={appointment.customer}
            service={appointment.service}
            worker={appointment.worker}
            status={appointment.status}
          />
        ))
      ) : (
        <EmptyAppointments />
      )}
    </View>
  );
}

// Componente auxiliar para estado vacío
function EmptyAppointments() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>No hay citas programadas para hoy</Text>
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
  
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  
  // Section
  section: {
    padding:  16,
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
  seeAll:  {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight:  "600",
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
    textAlign: "center",
  },
});
