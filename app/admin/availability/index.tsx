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

export default function WorkersScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Mock:  Datos de trabajadores
      const mockWorkers = [
        {
          id: 1,
          profile: {
            id: 1,
            name: "Carlos González",
          },
          commission_rate: 60,
          status: "available",
          todayAppointments: 3,
          completedToday: 2,
          currentAppointment: {
            client: "Juan Pérez",
            service: "Limpieza de sillón",
          },
        },
        {
          id: 2,
          profile: {
            id: 2,
            name: "Ana Martínez",
          },
          commission_rate: 55,
          status: "busy",
          todayAppointments: 2,
          completedToday: 2,
          currentAppointment: null,
        },
        {
          id: 3,
          profile: {
            id: 3,
            name: "Luis Rodríguez",
          },
          commission_rate: 50,
          status: "available",
          todayAppointments: 4,
          completedToday: 1,
          currentAppointment: {
            client: "María López",
            service: "Limpieza de auto",
          },
        },
      ];

      setWorkers(mockWorkers);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading workers:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkers();
  };

  const availableWorkers = workers.filter(
    (w) => w.status === "available",
  ).length;

  return (
    <View style={styles.container}>
      <WorkersHeader />

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
        <WorkersListSection workers={workers} loading={loading} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function WorkersHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Trabajadores</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu equipo</Text>
      </View>
    </View>
  );
}

// ============================================================================
// LISTA DE TRABAJADORES
// ============================================================================
function WorkersListSection({ workers, loading }: any) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando trabajadores...</Text>
      </View>
    );
  }

  if (workers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No hay trabajadores</Text>
        <Text style={styles.emptyText}>
          Agrega trabajadores para comenzar a gestionar tu equipo
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.workersSection}>
      <Text style={styles.sectionTitle}>Equipo de Trabajo</Text>
      {workers.map((worker: any) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </View>
  );
}

function WorkerCard({ worker }: any) {
  const getAvatar = (name: string) => {
    if (
      name.toLowerCase().includes("ana") ||
      name.toLowerCase().includes("maría")
    ) {
      return "👩";
    }
    return "👨";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "#10B981";
      case "busy":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "busy":
        return "Ocupado";
      default:
        return "Inactivo";
    }
  };

  return (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => {
        router.push(`/admin/availability/${worker.id}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.workerCardHeader}>
        <Text style={styles.workerAvatar}>
          {getAvatar(worker.profile.name)}
        </Text>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker.profile.name}</Text>
          <Text style={styles.workerCommission}>
            Comisión: {worker.commission_rate}%
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(worker.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(worker.status) },
            ]}
          >
            {getStatusLabel(worker.status)}
          </Text>
        </View>
      </View>

      <View style={styles.workerCardBody}>
        <View style={styles.workerStat}>
          <Text style={styles.workerStatLabel}>Hoy</Text>
          <Text style={styles.workerStatValue}>
            {worker.completedToday}/{worker.todayAppointments} Turnos
          </Text>
        </View>

        {worker.currentAppointment && (
          <View style={styles.currentAppointment}>
            <Text style={styles.currentAppointmentLabel}>🔄 En curso: </Text>
            <Text style={styles.currentAppointmentText}>
              {worker.currentAppointment.client} -{" "}
              {worker.currentAppointment.service}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.workerCardFooter}>
        <Text style={styles.viewDetailsText}>Ver detalles →</Text>
      </View>
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

  // Stats Section
  statsSection: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Loading
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
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

  // Worker Card
  workerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  workerAvatar: {
    fontSize: 40,
    marginRight: 12,
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
  workerCommission: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Worker Card Body
  workerCardBody: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  workerStat: {
    marginBottom: 8,
  },
  workerStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  workerStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  currentAppointment: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  currentAppointmentLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  currentAppointmentText: {
    fontSize: 13,
    color: "#78350F",
  },

  // Worker Card Footer
  workerCardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    marginTop: 12,
    alignItems: "flex-end",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
});
