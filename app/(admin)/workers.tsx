import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function WorkersScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);

      // Mock: Estructura real con profiles
      const mockWorkers = [
        {
          id: 1,
          profile_id: 1,
          commission_rate: 60.0,
          profile: {
            id: 1,
            name: "Carlos González",
          },
          // Stats calculadas
          stats: {
            todayAppointments: 3,
            completedToday: 1,
            monthEarnings: 120000,
            monthPaid: 100000,
            monthPending: 20000,
            status: "busy", // 'available' | 'busy' | 'offline'
          },
        },
        {
          id: 2,
          profile_id: 2,
          commission_rate:  55.0,
          profile: {
            id: 2,
            name: "Ana Martínez",
          },
          stats: {
            todayAppointments: 2,
            completedToday: 1,
            monthEarnings: 90000,
            monthPaid:  90000,
            monthPending:  0,
            status: "available",
          },
        },
        {
          id: 3,
          profile_id: 3,
          commission_rate:  50.0,
          profile: {
            id: 3,
            name: "Luis Rodríguez",
          },
          stats: {
            todayAppointments: 1,
            completedToday:  0,
            monthEarnings: 70000,
            monthPaid:  50000,
            monthPending:  20000,
            status: "available",
          },
        },
      ];

      setWorkers(mockWorkers);
      setLoading(false);
    } catch (error) {
      console.error("Error loading workers:", error);
      setLoading(false);
    }
  };

  const totalWorkers = workers.length;
  const availableWorkers = workers.filter(
    (w) => w.stats.status === "available"
  ).length;
  const busyWorkers = workers.filter((w) => w.stats.status === "busy").length;

  return (
    <View style={styles.container}>
      <WorkersHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <WorkersStatsSection
          total={totalWorkers}
          available={availableWorkers}
          busy={busyWorkers}
        />
        <WorkersListSection workers={workers} loading={loading} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN: HEADER
// ============================================================================
function WorkersHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles. headerTitle}>Trabajadores</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu equipo</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: ESTADÍSTICAS
// ============================================================================
function WorkersStatsSection({ total, available, busy }: any) {
  return (
    <View style={styles.statsSection}>
      <WorkerStatCard icon="👥" label="Total" value={total} color="#3B82F6" />
      <WorkerStatCard
        icon="✅"
        label="Disponibles"
        value={available}
        color="#10B981"
      />
      <WorkerStatCard
        icon="🔄"
        label="En servicio"
        value={busy}
        color="#F59E0B"
      />
    </View>
  );
}

function WorkerStatCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.workerStatCard, { borderLeftColor: color }]}>
      <Text style={styles.workerStatIcon}>{icon}</Text>
      <Text style={styles.workerStatValue}>{value}</Text>
      <Text style={styles.workerStatLabel}>{label}</Text>
    </View>
  );
}

// ============================================================================
// SECCIÓN: LISTA DE TRABAJADORES
// ============================================================================
function WorkersListSection({ workers, loading }: any) {
  if (loading) {
    return (
      <View style={styles.workersSection}>
        <Text style={styles.loadingText}>Cargando trabajadores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.workersSection}>
      <Text style={styles.sectionTitle}>Equipo activo</Text>
      {workers.map((worker: any) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </View>
  );
}

function WorkerCard({ worker }: any) {
  const statusConfig = {
    available: { label: "Disponible", color:  "#10B981", icon: "✅" },
    busy: { label: "En servicio", color: "#F59E0B", icon: "🔄" },
    offline:  { label: "No disponible", color: "#6B7280", icon: "⭕" },
  };

  const config = statusConfig[worker.stats. status as keyof typeof statusConfig];

  const getAvatar = (name: string) => {
    if (
      name.toLowerCase().includes("ana") ||
      name.toLowerCase().includes("maría")
    ) {
      return "👩";
    }
    return "👨";
  };

  const handlePress = () => {
    Alert.alert(
      worker.profile.name,
      `Comisión: ${worker.commission_rate}%\nGanado este mes: $${worker.stats.monthEarnings.toLocaleString()}\nPagado:  $${worker.stats.monthPaid.toLocaleString()}\nPendiente: $${worker.stats.monthPending. toLocaleString()}`
    );
  };

  return (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.workerAvatar}>
        <Text style={styles.workerAvatarText}>
          {getAvatar(worker.profile.name)}
        </Text>
      </View>

      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{worker.profile.name}</Text>
        <View style={styles.workerStatus}>
          <Text style={styles.workerStatusIcon}>{config.icon}</Text>
          <Text style={[styles.workerStatusText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.workerCommission}>
          Comisión: {worker.commission_rate}%
        </Text>
      </View>

      <View style={styles.workerStats}>
        <Text style={styles.workerStatsText}>
          {worker.stats.completedToday}/{worker.stats.todayAppointments} citas
        </Text>
        <Text style={styles.workerEarnings}>
          ${worker.stats.monthEarnings.toLocaleString()}
        </Text>
        {worker.stats.monthPending > 0 && (
          <Text style={styles. workerPending}>
            Debe:  ${worker.stats.monthPending. toLocaleString()}
          </Text>
        )}
      </View>

      <Text style={styles.workerArrow}>›</Text>
    </TouchableOpacity>
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
  content:  {
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
  headerSubtitle:  {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // Stats Section
  statsSection: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  workerStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workerStatIcon: {
    fontSize:  24,
    marginBottom: 8,
  },
  workerStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  workerStatLabel: {
    fontSize:  12,
    color: "#6B7280",
    marginTop:  4,
  },

  // Workers Section
  workersSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 32,
  },

  // Worker Card
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workerAvatarText: {
    fontSize: 28,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  workerStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  workerStatusIcon: {
    fontSize:  12,
    marginRight: 4,
  },
  workerStatusText: {
    fontSize:  13,
    fontWeight: "500",
  },
  workerCommission:  {
    fontSize: 12,
    color: "#6B7280",
  },
  workerStats: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  workerStatsText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  workerEarnings: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 2,
  },
  workerPending: {
    fontSize:  12,
    fontWeight: "600",
    color: "#EF4444",
  },
  workerArrow:  {
    fontSize: 24,
    color: "#D1D5DB",
  },
});
