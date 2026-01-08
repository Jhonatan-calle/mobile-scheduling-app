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
  const [items, setItems] = useState<any[]>([]); // ← Cambiado de appointments a items
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);

      // Mock:  Estructura real con appointments
      const mockAppointments = [
        {
          id: 1,
          admin_id: 1,
          worker_id: 1,
          client_id: 1,
          service: "sillones",
          service_details: "Limpieza de sillón 3 cuerpos",
          address: "Av. Colón 123",
          date: new Date().toISOString(),
          estimate_time: 120,
          cost: 15000,
          commission_rate: 60,
          status: "pending",
          has_retouches: false,
          paid_to_worker: false,
          payment_method: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client:  {
            id: 1,
            name: "Juan Pérez",
            phone_number: "351 234 5678",
            last_appointment_at: "2024-01-15T10:00:00Z",
          },
          worker: {
            id: 1,
            profile_id: 1,
            commission_rate: 60,
            profile:  {
              id: 1,
              name: "Carlos González",
            },
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
          commission_rate:  55,
          status: "in_progress",
          has_retouches: false,
          paid_to_worker: false,
          payment_method: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id:  2,
            name: "María López",
            phone_number: "351 456 7890",
            last_appointment_at: "2024-01-10T14:00:00Z",
          },
          worker: {
            id: 2,
            profile_id: 2,
            commission_rate: 55,
            profile: {
              id: 2,
              name: "Ana Martínez",
            },
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
          date:  (() => {
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
          updated_at: new Date().toISOString(),
          client: {
            id:  3,
            name: "Roberto García",
            phone_number: "351 678 9012",
            last_appointment_at: null,
          },
          worker:  {
            id: 1,
            profile_id: 1,
            commission_rate: 60,
            profile: {
              id: 1,
              name: "Carlos González",
            },
          },
        },
        {
          id: 4,
          admin_id: 1,
          worker_id: 2,
          client_id:  4,
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
          has_retouches:  false,
          paid_to_worker: true,
          payment_method: "efectivo",
          created_at:  new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 4,
            name: "Laura Fernández",
            phone_number:  "351 789 0123",
            last_appointment_at: "2023-12-20T16:00:00Z",
          },
          worker: {
            id: 2,
            profile_id: 2,
            commission_rate: 55,
            profile: {
              id:  2,
              name: "Ana Martínez",
            },
          },
        },
      ];

      // Mock:  Estructura de retouches (repasos)
      const mockRetouches = [
        {
          id: 1,
          appointment_id: 1,
          worker_id: 1,
          time:  (() => {
            const d = new Date();
            d.setHours(11, 30, 0, 0);
            return d.toISOString();
          })(),
          address: "Av. Colón 123",
          reason: "Cliente reportó manchas persistentes",
          estimate_time: 60,
          status: "pending",
          created_at: new Date().toISOString(),
          // Relaciones
          appointment: {
            id: 1,
            client:  {
              id: 1,
              name: "Juan Pérez",
            },
            service_details: "Limpieza de sillón 3 cuerpos",
          },
          worker: {
            id: 1,
            profile:  {
              id: 1,
              name: "Carlos González",
            },
          },
        },
        {
          id:  2,
          appointment_id: 4,
          worker_id: 2,
          time: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(15, 0, 0, 0);
            return d.toISOString();
          })(),
          address: "Rivadavia 321",
          reason: "Verificar resultado final",
          estimate_time: 45,
          status: "pending",
          created_at: new Date().toISOString(),
          appointment: {
            id: 4,
            client: {
              id: 4,
              name: "Laura Fernández",
            },
            service_details: "6 sillas de comedor",
          },
          worker: {
            id: 2,
            profile: {
              id: 2,
              name: "Ana Martínez",
            },
          },
        },
      ];

      // Transformar appointments
      const transformedAppointments = mockAppointments.map((apt) => ({
        id: apt.id. toString(),
        type: "appointment", // ← NUEVO:  identificador de tipo
        time: new Date(apt.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: formatDateLabel(new Date(apt.date)),
        customer: apt.client.name,
        service: apt.service_details,
        worker: apt.worker.profile.name,
        status: mapStatus(apt.status),
        amount: apt.cost,
        rawDate: new Date(apt.date),
      }));

      // Transformar retouches
      const transformedRetouches = mockRetouches.map((retouch) => ({
        id: retouch.id.toString(),
        type: "retouch", // ← NUEVO: identificador de tipo
        time: new Date(retouch.time).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: formatDateLabel(new Date(retouch.time)),
        customer: retouch.appointment.client.name,
        service: `🔄 Repaso:  ${retouch.appointment.service_details}`, // ← Indicador visual
        worker: retouch.worker.profile.name,
        status: mapStatus(retouch. status),
        amount: 0, // Los repasos no tienen costo
        rawDate: new Date(retouch.time),
        reason: retouch.reason, // Info adicional
      }));

      // Combinar y ordenar por fecha
      const allItems = [...transformedAppointments, ...transformedRetouches]. sort(
        (a, b) => a.rawDate.getTime() - b.rawDate.getTime()
      );

      setItems(allItems);
      setLoading(false);
    } catch (error) {
      console.error("Error loading items:", error);
      setLoading(false);
    }
  };

  const formatDateLabel = (date:  Date) => {
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

    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month:  "short",
    });
  };

  const mapStatus = (status: string) => {
    const statusMap:  any = {
      pending: "pending",
      in_progress: "in-progress",
      completed: "completed",
      cancelled: "cancelled",
    };
    return statusMap[status] || "pending";
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
          items={items}
        />
        <ItemsList
          filter={filter}
          searchQuery={searchQuery}
          items={items}
          loading={loading}
        />
      </ScrollView>

      <FloatingAddButton />
    </View>
  );
}

// ============================================================================
// SECCIÓN:  HEADER
// ============================================================================
function AppointmentsHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles. headerTitle}>Turnos y Repasos</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus servicios</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: BÚSQUEDA Y FILTROS
// ============================================================================
function SearchAndFilterSection({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  items,
}: any) {
  const countByStatus = {
    all: items.length,
    pending: items.filter((a: any) => a.status === "pending").length,
    completed: items.filter((a: any) => a.status === "completed").length,
  };

  return (
    <View style={styles.searchSection}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles. searchInput}
          placeholder="Buscar por cliente, servicio..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

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
        styles. filterChip,
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
// SECCIÓN:  LISTA DE ITEMS (Appointments + Retouches)
// ============================================================================
function ItemsList({ filter, searchQuery, items, loading }: any) {
  if (loading) {
    return (
      <View style={styles. loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const filteredItems = items.filter((item: any) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && item. status === "pending") ||
      (filter === "completed" && item.status === "completed");

    const matchesSearch =
      searchQuery === "" ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.service.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((groups: any, item: any) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <View style={styles.appointmentsList}>
      {Object.keys(groupedItems).length > 0 ? (
        Object.keys(groupedItems).map((date) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedItems[date].map((item: any) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                onPress={() => {
                  // ← AQUÍ LA LÓGICA DE NAVEGACIÓN
                  if (item.type === "appointment") {
                    router.push(`/admin/appointments/${item.id}`);
                  } else if (item.type === "retouch") {
                    router.push(`/admin/appointments/retouches/${item.id}`);
                  }
                }}
                activeOpacity={0.7}
              >
                <AppointmentPreviewCard
                  time={item.time}
                  customer={item.customer}
                  service={item.service}
                  worker={item.worker}
                  status={item.status}
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
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{searchQuery ? "🔍" : "📭"}</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No se encontraron resultados" : "No hay turnos"}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Intenta con otros términos de búsqueda"
          : "Crea tu primera turno para comenzar"}
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
      onPress={() => router.push("/admin/appointments/new")}
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
    flex:  1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },

  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor:  "#FFFFFF",
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

  searchSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding:  12,
    marginBottom:  12,
  },
  searchIcon: {
    fontSize:  20,
    marginRight:  8,
  },
  searchInput: {
    flex:  1,
    fontSize: 16,
    color: "#111827",
  },

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
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  appointmentsList:  {
    padding: 16,
  },
  dateHeader:  {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
    marginBottom: 12,
  },

  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },

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
    fontSize:  18,
    fontWeight:  "bold",
    color: "#111827",
    marginBottom:  8,
  },
  emptyText: {
    fontSize: 14,
    color:  "#6B7280",
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom:  24,
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
  fabIcon:  {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
