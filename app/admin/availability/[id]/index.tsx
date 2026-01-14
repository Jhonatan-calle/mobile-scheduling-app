import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from "react-native";
import { handleCall } from "@/utils/contact";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [worker, setWorker] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkerData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockWorker = {
        id: parseInt(id as string),
        profile: {
          id: 1,
          name: "Carlos González",
          phone: "3584800460",
        },
        commission_rate: 60,
        availability: [
          { day: 1, start: "08:00", end: "20:00", enabled: true },
          { day: 2, start: "08:00", end: "20:00", enabled: true },
          { day: 3, start: "08:00", end: "20:00", enabled: true },
          { day: 4, start: "08:00", end: "20:00", enabled: true },
          { day: 5, start: "08:00", end: "20:00", enabled: true },
          { day: 6, start: "09:00", end: "14:00", enabled: true },
          { day: 0, start: "00:00", end: "00:00", enabled: false },
        ],
        monthStats: {
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear(),
          totalAppointments: 45,
          totalRetouches: 8,
          completedAppointments: 42,
          pendingAppointments: 3,
          totalEarned: 270000,
          totalGenerated: 450000,
          averagePerAppointment: 6000,
          appointmentsByService: {
            sillones: 20,
            alfombra: 12,
            auto: 8,
            sillas: 5,
          },
        },
      };

      setWorker(mockWorker);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading worker:", error);
      Alert.alert("Error", "No se pudo cargar la información");
      setLoading(false);
      setRefreshing(false);
    }
  });

  useEffect(() => {
    loadWorkerData();
  }, [selectedMonth, refreshing]);

  const toggleDayAvailability = async (dayIndex: number) => {
    const updatedAvailability = worker.availability.map((avail: any) => {
      if (avail.day === dayIndex) {
        return { ...avail, enabled: !avail.enabled };
      }
      return avail;
    });

    setWorker({ ...worker, availability: updatedAvailability });
  };

  const editTimeSlot = (dayIndex: number) => {
    const dayAvail = worker.availability.find((a: any) => a.day === dayIndex);

    Alert.alert(
      `Editar ${getDayName(dayIndex)}`,
      `Horario actual: ${dayAvail.start} - ${dayAvail.end}`,
      [
        {
          text: "08:00 - 20:00",
          onPress: () => updateTimeSlot(dayIndex, "08:00", "20:00"),
        },
        {
          text: "09:00 - 18:00",
          onPress: () => updateTimeSlot(dayIndex, "09:00", "18:00"),
        },
        {
          text: "10:00 - 19:00",
          onPress: () => updateTimeSlot(dayIndex, "10:00", "19:00"),
        },
        {
          text: "09:00 - 14:00 (Medio día)",
          onPress: () => updateTimeSlot(dayIndex, "09:00", "14:00"),
        },
        { text: "Cancelar", style: "cancel" },
      ],
    );
  };

  const updateTimeSlot = async (
    dayIndex: number,
    start: string,
    end: string,
  ) => {
    const updatedAvailability = worker.availability.map((avail: any) => {
      if (avail.day === dayIndex) {
        return { ...avail, start, end };
      }
      return avail;
    });

    setWorker({ ...worker, availability: updatedAvailability });
    Alert.alert("Actualizado", `Horario cambiado a ${start} - ${end}`);
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

  const getDayName = (day: number) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[day];
  };

  const getAvatar = (name: string) => {
    if (
      name.toLowerCase().includes("ana") ||
      name.toLowerCase().includes("maría")
    ) {
      return "👩";
    }
    return "👨";
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading || !worker) {
    return (
      <View style={styles.container}>
        <WorkerDetailHeader workerId={id as string} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando... </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WorkerDetailHeader workerId={id as string} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
            }}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        <WorkerInfoSection worker={worker} getAvatar={getAvatar} />

        <AvailabilitySection
          availability={worker.availability}
          onToggleDay={toggleDayAvailability}
          onEditTimeSlot={editTimeSlot}
          getDayName={getDayName}
        />

        <MonthSelectorSection
          selectedMonth={selectedMonth}
          onChangeMonth={changeMonth}
          formatMonth={formatMonth}
        />

        <MonthStatsSection stats={worker.monthStats} />

        <WorkHistoryPreviewSection workerId={id} stats={worker.monthStats} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function WorkerDetailHeader({ workerId }: { workerId: string }) {
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
        <Text style={styles.headerTitle}>Detalles del Trabajador</Text>
        <Text style={styles.headerSubtitle}>Estadísticas y disponibilidad</Text>
      </View>
    </View>
  );
}

// ============================================================================
// INFORMACIÓN DEL TRABAJADOR
// ============================================================================
function WorkerInfoSection({ worker, getAvatar }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.workerInfoCard}>
        <Text style={styles.workerAvatar}>
          {getAvatar(worker.profile.name)}
        </Text>
        <View style={styles.workerDetails}>
          <Text style={styles.workerName}>{worker.profile.name}</Text>
          <Text style={styles.workerContact}>📞 {worker.profile.phone}</Text>
        </View>
      </View>

      {/* Botones de contacto rápido */}
      <View style={styles.contactButtons}>
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton]}
          onPress={() => handleCall(worker.profile.phone)}
          activeOpacity={0.7}
        >
          <Text style={styles.contactButtonIcon}>📞</Text>
          <Text style={styles.contactButtonText}>Llamar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// SELECTOR DE MES
// ============================================================================
function MonthSelectorSection({
  selectedMonth,
  onChangeMonth,
  formatMonth,
}: any) {
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
    <View style={styles.section}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => onChangeMonth("prev")}
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
          onPress={() => onChangeMonth("next")}
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
  );
}

// ============================================================================
// ESTADÍSTICAS DEL MES
// ============================================================================
function MonthStatsSection({ stats }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Estadísticas del Mes</Text>

      <View style={styles.statsGrid}>
        <StatCard
          icon="💰"
          label="Ganancia"
          value={`$${stats.totalEarned.toLocaleString()}`}
          color="#10B981"
        />
        <StatCard
          icon="💼"
          label="Generado"
          value={`$${stats.totalGenerated.toLocaleString()}`}
          color="#3B82F6"
        />
        <StatCard
          icon="📅"
          label="Citas"
          value={stats.totalAppointments}
          color="#8B5CF6"
        />
        <StatCard
          icon="🔄"
          label="Repasos"
          value={stats.totalRetouches}
          color="#F59E0B"
        />
        <StatCard
          icon="✅"
          label="Completadas"
          value={stats.completedAppointments}
          color="#10B981"
        />
        <StatCard
          icon="⏳"
          label="Pendientes"
          value={stats.pendingAppointments}
          color="#F59E0B"
        />
      </View>

      <View style={styles.averageCard}>
        <Text style={styles.averageLabel}>Promedio por cita</Text>
        <Text style={styles.averageValue}>
          ${stats.averagePerAppointment.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ============================================================================
// DESGLOSE POR SERVICIO
// ============================================================================
function WorkHistoryPreviewSection({ workerId, stats }: any) {
  return (
    <TouchableOpacity
      style={styles.viewHistoryButton}
      onPress={() => router.push(`/admin/availability/${workerId}/history`)} //aqui creo hay que pasarle que trabajador
      activeOpacity={0.8}
    >
      <Text style={styles.viewHistoryButtonIcon}>📊</Text>
      <Text style={styles.viewHistoryButtonText}>Ver Historial Completo</Text>
      <Text style={styles.viewHistoryButtonArrow}>→</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// DISPONIBILIDAD
// ============================================================================
function AvailabilitySection({
  availability,
  onToggleDay,
  onEditTimeSlot,
  getDayName,
}: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📅 Disponibilidad Semanal</Text>

      <View style={styles.availabilityList}>
        {availability
          .sort((a: any, b: any) => a.day - b.day)
          .map((dayAvail: any) => (
            <View key={dayAvail.day} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>{getDayName(dayAvail.day)}</Text>
                {dayAvail.enabled && (
                  <TouchableOpacity
                    onPress={() => onEditTimeSlot(dayAvail.day)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeRange}>
                      {dayAvail.start} - {dayAvail.end} ✏️
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Switch
                value={dayAvail.enabled}
                onValueChange={() => onToggleDay(dayAvail.day)}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={dayAvail.enabled ? "#10B981" : "#F3F4F6"}
              />
            </View>
          ))}
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
    borderBottomWidth: 1,
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
  headerSubtitle: {
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
  loadingText: {
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

  // Worker Info
  workerInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  workerAvatar: {
    fontSize: 64,
    marginRight: 16,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  workerContact: {
    fontSize: 14,
    color: "#3B82F6",
    marginBottom: 4,
    fontWeight: "600",
  },
  // Contact Buttons
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  callButton: {
    backgroundColor: "#10B981",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  contactButtonIcon: {
    fontSize: 18,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Month Selector
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  averageCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  averageLabel: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#166534",
  },

  // Service Breakdown
  serviceList: {
    gap: 16,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  serviceBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  serviceBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  serviceCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  // Availability
  availabilityList: {
    gap: 12,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  historyPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  previewStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewIcon: {
    fontSize: 32,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  previewLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  viewHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  viewHistoryButtonIcon: {
    fontSize: 20,
  },
  viewHistoryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  viewHistoryButtonArrow: {
    fontSize: 20,
    color: "#FFFFFF",
  },
});
