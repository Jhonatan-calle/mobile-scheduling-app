import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { AppointmentPreviewCard } from "../../../components/admin/dashboard";

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Datos mock con la estructura real de la BD
      const mockAppointments = [
        {
          id: 1,
          admin_id: 1,
          worker_id: 1,
          client_id: 1,
          service: "sillones",
          service_details: "Limpieza de sillón 3 cuerpos",
          address: "Av. Colón 123",
          date: new Date().toISOString(), // Hoy a las 09:00
          estimate_time:  120, // minutos
          cost:  15000,
          commission_rate:  60,
          status: "pending",
          has_retouches:  false,
          paid_to_worker: false,
          payment_method: null,
          created_at: new Date().toISOString(),
          updated_at:  new Date().toISOString(),
          // Datos relacionados (JOIN)
          client: {
            id: 1,
            name:  "Juan Pérez",
            phone: "351 234 5678",
            address:  "Av. Colón 123",
          },
          worker: {
            id: 1,
            name: "Carlos González",
            phone: "351 345 6789",
            commission_rate: 60,
          },
        },
        {
          id:  2,
          admin_id: 1,
          worker_id: 2,
          client_id: 2,
          service: "alfombra",
          service_details: "Limpieza de alfombra persa grande",
          address: "San Martín 456",
          date: (() => {
            const d = new Date();
            d.setHours(14, 0, 0, 0);
            return d.toISOString();
          })(),
          estimate_time: 90,
          cost: 12000,
          commission_rate: 55,
          status: "in_progress",
          has_retouches: false,
          paid_to_worker: false,
          payment_method: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 2,
            name: "María López",
            phone: "351 456 7890",
            address:  "San Martín 456",
          },
          worker: {
            id: 2,
            name: "Ana Martínez",
            phone: "351 567 8901",
            commission_rate: 55,
          },
        },
        {
          id: 3,
          admin_id: 1,
          worker_id: 1,
          client_id: 3,
          service: "auto",
          service_details: "Limpieza completa de tapizado de auto",
          address: "Belgrano 789",
          date: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(10, 0, 0, 0);
            return d.toISOString();
          })(),
          estimate_time: 180,
          cost: 25000,
          commission_rate: 60,
          status: "pending",
          has_retouches:  false,
          paid_to_worker: false,
          payment_method: null,
          created_at: new Date().toISOString(),
          updated_at:  new Date().toISOString(),
          client: {
            id: 3,
            name:  "Roberto García",
            phone: "351 678 9012",
            address: "Belgrano 789",
          },
          worker: {
            id: 1,
            name: "Carlos González",
            phone: "351 345 6789",
            commission_rate: 60,
          },
        },
        {
          id: 4,
          admin_id: 1,
          worker_id: 2,
          client_id: 4,
          service: "sillas",
          service_details: "6 sillas de comedor",
          address: "Rivadavia 321",
          date: (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            d.setHours(16, 0, 0, 0);
            return d.toISOString();
          })(),
          estimate_time: 60,
          cost: 8000,
          commission_rate: 55,
          status: "completed",
          has_retouches: false,
          paid_to_worker: true,
          payment_method: "efectivo",
          created_at:  new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 4,
            name: "Laura Fernández",
            phone: "351 789 0123",
            address: "Rivadavia 321",
          },
          worker: {
            id: 2,
            name: "Ana Martínez",
            phone: "351 567 8901",
            commission_rate: 55,
          },
        },
      ];

      // Transformar al formato que espera el componente
      const transformedAppointments = mockAppointments.map((apt) => ({
        id: apt.id. toString(),
        time: new Date(apt.date).toLocaleTimeString('es-AR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: formatDateLabel(new Date(apt.date)),
        customer: apt.client.name,
        service: apt.service_details,
        worker: apt.worker.name,
        status: mapStatus(apt.status),
        amount: apt.cost,
        rawDate: new Date(apt.date),
      }));

      setAppointments(transformedAppointments);
      setLoading(false);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setLoading(false);
    }
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate. getTime() === today.getTime()) return "Hoy";
    if (compareDate.getTime() === tomorrow.getTime()) return "Mañana";
    if (compareDate.getTime() === yesterday.getTime()) return "Ayer";

    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const mapStatus = (status:  string) => {
    // Mapear estados de BD a estados del componente
    const statusMap:  any = {
      'pending': 'pending',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'cancelled':  'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  return (
    <View style={styles.container}>
      <AppointmentsHeader />
      
      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        <SearchAndFilterSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
          appointments={appointments}
        />
        <AppointmentsList 
          filter={filter} 
          searchQuery={searchQuery}
          appointments={appointments}
          loading={loading}
        />
      </ScrollView>

      <FloatingAddButton />
    </View>
  );
}

// ============================================================================
// SECCIÓN: HEADER
// ============================================================================
function AppointmentsHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles. headerTitle}>Citas</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus appointments</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: BÚSQUEDA Y FILTROS
// ============================================================================
function SearchAndFilterSection({ searchQuery, setSearchQuery, filter, setFilter, appointments }: any) {
  const countByStatus = {
    all: appointments.length,
    pending: appointments.filter((a: any) => a.status === 'pending').length,
    completed: appointments.filter((a: any) => a.status === 'completed').length,
  };

  return (
    <View style={styles.searchSection}>
      {/* Barra de búsqueda */}
      <View style={styles. searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles. searchInput}
          placeholder="Buscar por cliente, servicio..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <FilterChip
          label="Todas"
          active={filter === "all"}
          onPress={() => setFilter("all")}
          count={countByStatus.all}
        />
        <FilterChip
          label="Pendientes"
          active={filter === "pending"}
          onPress={() => setFilter("pending")}
          count={countByStatus.pending}
          color="#F59E0B"
        />
        <FilterChip
          label="Completadas"
          active={filter === "completed"}
          onPress={() => setFilter("completed")}
          count={countByStatus.completed}
          color="#10B981"
        />
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, active, onPress, count, color = "#3B82F6" }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && { backgroundColor: color + "20", borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, active && { color }]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// SECCIÓN:  LISTA DE CITAS
// ============================================================================
function AppointmentsList({ filter, searchQuery, appointments, loading }: any) {
  if (loading) {
    return (
      <View style={styles. loadingContainer}>
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </View>
    );
  }

  // Filtrar citas
  const filteredAppointments = appointments.filter((apt: any) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && apt.status === "pending") ||
      (filter === "completed" && apt.status === "completed");

    const matchesSearch =
      searchQuery === "" ||
      apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Agrupar por fecha
  const groupedAppointments = filteredAppointments.reduce((groups: any, apt: any) => {
    const date = apt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {});

  return (
    <View style={styles.appointmentsList}>
      {Object. keys(groupedAppointments).length > 0 ? (
        Object.keys(groupedAppointments).map((date) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedAppointments[date]. map((apt: any) => (
              <TouchableOpacity
                key={apt.id}
                onPress={() => router.push(`/(admin)/appointments/${apt.id}`)}
                activeOpacity={0.7}
              >
                <AppointmentPreviewCard
                  time={apt.time}
                  customer={apt.customer}
                  service={apt.service}
                  worker={apt.worker}
                  status={apt.status}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
    </View>
  );
}

function EmptyState({ searchQuery }: any) {
  return (
    <View style={styles. emptyState}>
      <Text style={styles.emptyIcon}>
        {searchQuery ? "🔍" : "📭"}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No se encontraron resultados" : "No hay citas"}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Intenta con otros términos de búsqueda"
          : "Crea tu primera cita para comenzar"}
      </Text>
    </View>
  );
}

// ============================================================================
// BOTÓN FLOTANTE
// ============================================================================
function FloatingAddButton() {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push("/(admin)/(appointments)/new")}
      activeOpacity={0.8}
    >
      <Text style={styles.fabIcon}>+</Text>
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
    borderBottomWidth:  1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize:  14,
    color: "#6B7280",
    marginTop:  4,
  },

  // Search Section
  searchSection: {
    padding: 16,
    backgroundColor:  "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  // Filters
  filtersContainer: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipText:  {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  // Appointments List
  appointmentsList: {
    padding: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
    marginBottom: 12,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
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

  // FAB
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
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
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
