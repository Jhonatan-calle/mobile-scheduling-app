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
import * as Clipboard from 'expo-clipboard';

export default function AvailabilityScreen() {
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);

      // Generar los próximos 7 días
      const days = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // Mock:  Obtener citas del día
        const appointments = await getAppointmentsForDate(date);
        
        // Generar slots disponibles (8: 00 - 20:00)
        const slots = generateAvailableSlots(date, appointments);
        
        days.push({
          date,
          dayName: formatDayName(date),
          fullDate: formatFullDate(date),
          slots,
          appointments,
        });
      }

      setAvailabilityData(days);
      setLoading(false);
    } catch (error) {
      console.error("Error loading availability:", error);
      Alert.alert("Error", "No se pudo cargar la disponibilidad");
      setLoading(false);
    }
  };

  const getAppointmentsForDate = async (date: Date) => {
    // Mock:  Simular citas existentes
    const dayOfWeek = date.getDay();
    
    // Más citas en días laborales
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return []; // Fin de semana sin citas
    }

    return [
      { time: "09:00", duration: 120 },
      { time: "14:00", duration: 90 },
      { time: "17:00", duration: 60 },
    ];
  };

  const generateAvailableSlots = (date: Date, appointments: any[]) => {
    const slots = [];
    const workStart = 8;
    const workEnd = 20;
    const slotDuration = 60; // minutos

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Verificar si el slot está ocupado
        const isOccupied = appointments.some(apt => {
          const [aptHour, aptMinute] = apt.time.split(':').map(Number);
          const aptStart = aptHour * 60 + aptMinute;
          const aptEnd = aptStart + apt.duration;
          const slotStart = hour * 60 + minute;
          
          return slotStart >= aptStart && slotStart < aptEnd;
        });

        if (!isOccupied) {
          slots.push(slotTime);
        }
      }
    }

    return slots;
  };

  const formatDayName = (date:  Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((compareDate. getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";

    return date.toLocaleDateString("es-AR", { weekday: "long" });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month:  "long",
    });
  };

  const toggleSlot = (dayIndex: number, slot: string) => {
    const slotId = `${dayIndex}-${slot}`;
    
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const generateMessage = () => {
    if (selectedSlots.length === 0) {
      Alert.alert("Aviso", "Selecciona al menos un horario disponible");
      return;
    }

    // Agrupar slots por día
    const slotsByDay:  { [key: number]: string[] } = {};
    
    selectedSlots.forEach(slotId => {
      const [dayIndex, slot] = slotId.split('-');
      const dayIdx = parseInt(dayIndex);
      
      if (!slotsByDay[dayIdx]) {
        slotsByDay[dayIdx] = [];
      }
      slotsByDay[dayIdx].push(slot);
    });

    // Generar mensaje
    let message = "📅 *Horarios Disponibles*\n\n";
    
    Object.keys(slotsByDay).sort().forEach(dayIdx => {
      const day = availabilityData[parseInt(dayIdx)];
      const slots = slotsByDay[parseInt(dayIdx)].sort();
      
      message += `*${day.dayName}* (${formatShortDate(day.date)})\n`;
      slots.forEach(slot => {
        message += `  ✓ ${slot}hs\n`;
      });
      message += '\n';
    });

    message += "¿Cuál te viene mejor?  😊";

    return message;
  };

  const formatShortDate = (date: Date) => {
    return date. toLocaleDateString("es-AR", {
      day: "numeric",
      month:  "short",
    });
  };

  const copyToClipboard = async () => {
    const message = generateMessage();
    
    if (message) {
      try {
        await Clipboard.setStringAsync(message);
        Alert.alert(
          "✅ Copiado",
          "Mensaje copiado al portapapeles.\nAhora puedes pegarlo en WhatsApp.",
          [
            { text: "OK" }
          ]
        );
      } catch (error) {
        Alert.alert("Error", "No se pudo copiar al portapapeles");
      }
    }
  };

  const selectAllDay = (dayIndex: number) => {
    const day = availabilityData[dayIndex];
    const daySlots = day.slots. map((slot: string) => `${dayIndex}-${slot}`);
    
    // Verificar si ya están todos seleccionados
    const allSelected = daySlots.every((slotId: string) => selectedSlots.includes(slotId));
    
    if (allSelected) {
      // Deseleccionar todos del día
      setSelectedSlots(selectedSlots.filter(s => ! s.startsWith(`${dayIndex}-`)));
    } else {
      // Seleccionar todos del día
      const newSelected = [... selectedSlots];
      daySlots.forEach((slotId: string) => {
        if (!newSelected.includes(slotId)) {
          newSelected.push(slotId);
        }
      });
      setSelectedSlots(newSelected);
    }
  };

  const clearSelection = () => {
    setSelectedSlots([]);
  };

  return (
    <View style={styles.container}>
      <AvailabilityHeader />

      <View style={styles.toolbar}>
        <View style={styles.toolbarInfo}>
          <Text style={styles.toolbarTitle}>
            {selectedSlots.length} horarios seleccionados
          </Text>
          <Text style={styles.toolbarSubtitle}>
            Toca los horarios para seleccionar
          </Text>
        </View>
        
        {selectedSlots.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSelection}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
          </View>
        ) : (
          <View style={styles. daysContainer}>
            {availabilityData.map((day, dayIndex) => (
              <DayCard
                key={dayIndex}
                day={day}
                dayIndex={dayIndex}
                selectedSlots={selectedSlots}
                onToggleSlot={toggleSlot}
                onSelectAll={selectAllDay}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {selectedSlots.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Vista previa:</Text>
            <ScrollView style={styles.preview} nestedScrollEnabled>
              <Text style={styles.previewText}>{generateMessage()}</Text>
            </ScrollView>
          </View>
          
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyToClipboard}
            activeOpacity={0.8}
          >
            <Text style={styles.copyButtonIcon}>📋</Text>
            <Text style={styles.copyButtonText}>Copiar Mensaje</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function AvailabilityHeader() {
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
        <Text style={styles.headerTitle}>Horarios Disponibles</Text>
        <Text style={styles.headerSubtitle}>Próximos 7 días</Text>
      </View>
      <View style={styles.whatsappIcon}>
        <Text style={styles.whatsappEmoji}>💬</Text>
      </View>
    </View>
  );
}

// ============================================================================
// DAY CARD
// ============================================================================
function DayCard({ day, dayIndex, selectedSlots, onToggleSlot, onSelectAll }: any) {
  const daySlots = day.slots.map((slot: string) => `${dayIndex}-${slot}`);
  const selectedCount = daySlots.filter((slotId: string) => selectedSlots.includes(slotId)).length;
  const allSelected = selectedCount === day.slots.length && day.slots.length > 0;

  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Text style={styles. dayName}>{day.dayName}</Text>
          <Text style={styles.dayDate}>{day.fullDate}</Text>
        </View>
        
        {day.slots.length > 0 && (
          <TouchableOpacity
            style={[styles.selectAllButton, allSelected && styles.selectAllButtonActive]}
            onPress={() => onSelectAll(dayIndex)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectAllButtonText}>
              {allSelected ? `✓ Todos (${selectedCount})` : `Seleccionar todos (${day.slots.length})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {day.slots.length > 0 ?  (
        <View style={styles.slotsContainer}>
          {day.slots.map((slot: string) => {
            const slotId = `${dayIndex}-${slot}`;
            const isSelected = selectedSlots.includes(slotId);

            return (
              <TouchableOpacity
                key={slot}
                style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                onPress={() => onToggleSlot(dayIndex, slot)}
                activeOpacity={0.7}
              >
                <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>
                  {slot}
                </Text>
                {isSelected && <Text style={styles.slotCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles. noSlotsContainer}>
          <Text style={styles.noSlotsText}>😔 No hay horarios disponibles</Text>
        </View>
      )}
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
    backgroundColor:  "#F3F4F6",
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
    marginTop:  2,
  },
  whatsappIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
  },
  whatsappEmoji: {
    fontSize: 20,
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor:  "#E5E7EB",
  },
  toolbarInfo: {
    flex: 1,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  toolbarSubtitle: {
    fontSize: 12,
    color:  "#6B7280",
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical:  8,
    borderRadius:  8,
    backgroundColor: "#FEE2E2",
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
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

  // Days
  daysContainer: {
    padding: 16,
  },
  dayCard: {
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
  dayHeader: {
    flexDirection: "row",
    justifyContent:  "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "capitalize",
  },
  dayDate: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    textTransform: "capitalize",
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical:  6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectAllButtonActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  selectAllButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  // Slots
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotChip:  {
    paddingHorizontal: 14,
    paddingVertical:  10,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    borderWidth:  2,
    borderColor: "#86EFAC",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  slotChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  slotTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  slotTimeSelected: {
    color: "#FFFFFF",
  },
  slotCheck: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  noSlotsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noSlotsText:  {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth:  1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    paddingBottom: 24,
  },
  previewContainer: {
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  preview:  {
    maxHeight: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewText: {
    fontSize:  13,
    color: "#374151",
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  copyButtonIcon: {
    fontSize: 20,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
