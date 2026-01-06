import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";

export default function WorkersScreen() {
  return (
    <View style={styles.container}>
      <WorkersHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <WorkersStatsSection />
        <WorkersListSection />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN: HEADER
// ============================================================================
function WorkersHeader() {
  return (
    <View style={styles. header}>
      <View>
        <Text style={styles.headerTitle}>Trabajadores</Text>
        <Text style={styles. headerSubtitle}>Gestiona tu equipo</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  ESTADÍSTICAS DE TRABAJADORES
// ============================================================================
function WorkersStatsSection() {
  return (
    <View style={styles.statsSection}>
      <WorkerStatCard
        icon="👥"
        label="Total"
        value="4"
        color="#3B82F6"
      />
      <WorkerStatCard
        icon="✅"
        label="Disponibles"
        value="3"
        color="#10B981"
      />
      <WorkerStatCard
        icon="🔄"
        label="En servicio"
        value="1"
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
function WorkersListSection() {
  const workers = [
    {
      id: "1",
      name: "Carlos González",
      avatar: "👨",
      status: "available",
      todayAppointments: 3,
      completedToday: 1,
      earnings: 45000,
    },
    {
      id:  "2",
      name: "Ana Martínez",
      avatar: "👩",
      status: "busy",
      todayAppointments: 2,
      completedToday: 1,
      earnings: 30000,
    },
    {
      id: "3",
      name: "Luis Rodríguez",
      avatar: "👨",
      status: "available",
      todayAppointments: 1,
      completedToday: 0,
      earnings: 15000,
    },
  ];

  return (
    <View style={styles.workersSection}>
      <Text style={styles. sectionTitle}>Equipo activo</Text>
      {workers.map((worker) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </View>
  );
}

function WorkerCard({ worker }: any) {
  const statusConfig = {
    available: { label: "Disponible", color:  "#10B981", icon: "✅" },
    busy: { label: "En servicio", color: "#F59E0B", icon: "🔄" },
    offline: { label: "No disponible", color: "#6B7280", icon: "⭕" },
  };

  const config = statusConfig[worker.status as keyof typeof statusConfig];

  return (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => router.push(`/(admin)/workers/${worker.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.workerAvatar}>
        <Text style={styles.workerAvatarText}>{worker.avatar}</Text>
      </View>

      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{worker.name}</Text>
        <View style={styles.workerStatus}>
          <Text style={styles. workerStatusIcon}>{config.icon}</Text>
          <Text style={[styles.workerStatusText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>

      <View style={styles.workerStats}>
        <Text style={styles.workerStatsText}>
          {worker.completedToday}/{worker.todayAppointments} citas
        </Text>
        <Text style={styles.workerEarnings}>
          ${worker.earnings.toLocaleString()}
        </Text>
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
    backgroundColor:  "#F9FAFB",
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    padding: 24,
    paddingTop:  60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color:  "#111827",
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
  },
  workerStatusIcon:  {
    fontSize: 12,
    marginRight: 4,
  },
  workerStatusText: {
    fontSize:  13,
    fontWeight: "500",
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
  workerEarnings:  {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  workerArrow: {
    fontSize: 24,
    color: "#D1D5DB",
  },
});
