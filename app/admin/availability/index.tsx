import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function WorkersAvailabilityScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);

      // Mock:  workers con disponibilidad
      const mockWorkers = [
        {
          id: 1,
          profile: { name: "Carlos González" },
          availability: [
            { day: 1, start: "08:00", end: "20:00", enabled: true }, // Lunes
            { day: 2, start: "08:00", end: "20:00", enabled: true },
            { day: 3, start: "08:00", end: "20:00", enabled:  true },
            { day: 4, start: "08:00", end: "20:00", enabled: true },
            { day: 5, start: "08:00", end: "20:00", enabled: true },
            { day: 6, start:  "09:00", end: "14:00", enabled: true },
            { day: 0, start: "00:00", end: "00:00", enabled: false }, // Domingo
          ],
        },
        {
          id: 2,
          profile: { name: "Ana Martínez" },
          availability: [
            { day: 1, start: "09:00", end: "18:00", enabled: true },
            { day: 2, start: "09:00", end:  "18:00", enabled: true },
            { day: 3, start: "09:00", end: "18:00", enabled: true },
            { day:  4, start: "09:00", end: "18:00", enabled: true },
            { day: 5, start: "09:00", end: "18:00", enabled: true },
            { day: 6, start: "00:00", end: "00:00", enabled: false },
            { day: 0, start: "00:00", end: "00:00", enabled: false },
          ],
        },
        {
          id: 3,
          profile: { name: "Luis Rodríguez" },
          availability: [
            { day:  1, start: "10:00", end: "19:00", enabled: true },
            { day: 2, start: "10:00", end:  "19:00", enabled: true },
            { day: 3, start: "10:00", end: "19:00", enabled: false }, // Miércoles no trabaja
            { day: 4, start: "10:00", end: "19:00", enabled: true },
            { day:  5, start: "10:00", end: "19:00", enabled: true },
            { day: 6, start: "10:00", end: "15:00", enabled: true },
            { day: 0, start: "00:00", end:  "00:00", enabled: false },
          ],
        },
      ];

      setWorkers(mockWorkers);
      setLoading(false);
    } catch (error) {
      console.error("Error loading workers:", error);
      Alert.alert("Error", "No se pudo cargar la disponibilidad");
      setLoading(false);
    }
  };

  const toggleDayAvailability = async (workerId: number, dayIndex: number) => {
    const updatedWorkers = workers.map(worker => {
      if (worker.id === workerId) {
        const updatedAvailability = worker.availability.map((avail: any) => {
          if (avail.day === dayIndex) {
            return { ... avail, enabled: !avail.enabled };
          }
          return avail;
        });
        return { ...worker, availability: updatedAvailability };
      }
      return worker;
    });

    setWorkers(updatedWorkers);

    // TODO: Guardar en Supabase
    // await supabase. from('worker_availability').update({ enabled }).match({ worker_id, day })
  };

  const editTimeSlot = (worker: any, dayIndex: number) => {
    const dayAvail = worker.availability.find((a: any) => a.day === dayIndex);
    
    Alert.alert(
      `Editar ${getDayName(dayIndex)}`,
      `${worker.profile.name}\nHorario actual: ${dayAvail.start} - ${dayAvail.end}`,
      [
        {
          text: "08:00 - 20:00",
          onPress: () => updateTimeSlot(worker.id, dayIndex, "08:00", "20:00"),
        },
        {
          text: "09:00 - 18:00",
          onPress: () => updateTimeSlot(worker.id, dayIndex, "09:00", "18:00"),
        },
        {
          text: "10:00 - 19:00",
          onPress: () => updateTimeSlot(worker.id, dayIndex, "10:00", "19:00"),
        },
        {
          text: "09:00 - 14:00 (Medio día)",
          onPress: () => updateTimeSlot(worker. id, dayIndex, "09:00", "14:00"),
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const updateTimeSlot = async (workerId: number, dayIndex:  number, start: string, end: string) => {
    const updatedWorkers = workers.map(worker => {
      if (worker.id === workerId) {
        const updatedAvailability = worker.availability.map((avail: any) => {
          if (avail.day === dayIndex) {
            return { ... avail, start, end };
          }
          return avail;
        });
        return { ... worker, availability: updatedAvailability };
      }
      return worker;
    });

    setWorkers(updatedWorkers);

    // TODO: Guardar en Supabase
    Alert.alert("Actualizado", `Horario cambiado a ${start} - ${end}`);
  };

  const getDayName = (day: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[day];
  };

  const getAvatar = (name: string) => {
    if (name.toLowerCase().includes("ana") || name.toLowerCase().includes("maría")) {
      return "👩";
    }
    return "👨";
  };

  return (
    <View style={styles.container}>
      <WorkersAvailabilityHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles. loadingContainer}>
            <Text style={styles.loadingText}>Cargando... </Text>
          </View>
        ) : (
          <View style={styles.workersContainer}>
            {workers. map(worker => (
              <WorkerAvailabilityCard
                key={worker. id}
                worker={worker}
                onToggleDay={toggleDayAvailability}
                onEditTimeSlot={editTimeSlot}
                getDayName={getDayName}
                getAvatar={getAvatar}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function WorkersAvailabilityHeader() {
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
        <Text style={styles.headerTitle}>Gestionar Disponibilidad</Text>
        <Text style={styles.headerSubtitle}>Configura horarios por trabajador</Text>
      </View>
    </View>
  );
}

// ============================================================================
// WORKER AVAILABILITY CARD
// ============================================================================
function WorkerAvailabilityCard({ worker, onToggleDay, onEditTimeSlot, getDayName, getAvatar }: any) {
  return (
    <View style={styles.workerCard}>
      <View style={styles.workerHeader}>
        <Text style={styles.workerAvatar}>{getAvatar(worker.profile.name)}</Text>
        <Text style={styles. workerName}>{worker.profile.name}</Text>
      </View>

      <View style={styles. daysContainer}>
        {worker. availability
          .sort((a:  any, b: any) => a.day - b.day)
          .map((dayAvail: any) => (
            <View key={dayAvail.day} style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>{getDayName(dayAvail.day)}</Text>
                {dayAvail.enabled && (
                  <TouchableOpacity
                    onPress={() => onEditTimeSlot(worker, dayAvail.day)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeRange}>
                      {dayAvail.start} - {dayAvail.end} ✏️
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Switch
                value={dayAvail. enabled}
                onValueChange={() => onToggleDay(worker. id, dayAvail.day)}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={dayAvail.enabled ?  "#10B981" : "#F3F4F6"}
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
    backgroundColor:  "#F9FAFB",
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection:  "row",
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
  headerSubtitle:  {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
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

  // Workers
  workersContainer: {
    padding: 16,
  },
  workerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth:  1,
    borderBottomColor: "#F3F4F6",
  },
  workerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  // Days
  daysContainer: {
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
});
