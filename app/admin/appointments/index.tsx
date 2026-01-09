import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { AppointmentPreviewCard } from "../../../components/admin/dashboard";

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">(
    "upcoming",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"general" | "date">("general"); // ← NUEVO
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ← NUEVO

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
          client: {
            id: 1,
            name: "Juan Pérez",
            phone_number: "351 234 5678",
            last_appointment_at: "2024-01-15T10:00:00Z",
          },
          worker: {
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
          id: 2,
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
          has_retouches: false,
          paid_to_worker: false,
          payment_method: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 3,
            name: "Roberto García",
            phone_number: "351 678 9012",
            last_appointment_at: null,
          },
          worker: {
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 4,
            name: "Laura Fernández",
            phone_number: "351 789 0123",
            last_appointment_at: "2023-12-20T16:00:00Z",
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
          id: 5,
          admin_id: 1,
          worker_id: 1,
          client_id: 1,
          service: "cortinas",
          service_details: "Limpieza de cortinas blackout",
          address: "Av. Colón 123",
          date: (() => {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            d.setHours(10, 0, 0, 0);
            return d.toISOString();
          })(),
          estimate_time: 90,
          cost: 10000,
          commission_rate: 60,
          status: "completed",
          has_retouches: false,
          paid_to_worker: true,
          payment_method: "transferencia",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 1,
            name: "Juan Pérez",
            phone_number: "351 234 5678",
            last_appointment_at: "2024-01-15T10:00:00Z",
          },
          worker: {
            id: 1,
            profile_id: 1,
            commission_rate: 60,
            profile: {
              id: 1,
              name: "Carlos González",
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
          time: (() => {
            const d = new Date();
            d.setHours(11, 30, 0, 0);
            return d.toISOString();
          })(),
          address: "Av. Colón 123",
          reason: "Cliente reportó manchas persistentes",
          estimate_time: 60,
          status: "pending",
          created_at: new Date().toISOString(),
          appointment: {
            id: 1,
            client: {
              id: 1,
              name: "Juan Pérez",
            },
            service_details: "Limpieza de sillón 3 cuerpos",
          },
          worker: {
            id: 1,
            profile: {
              id: 1,
              name: "Carlos González",
            },
          },
        },
        {
          id: 2,
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
        id: apt.id.toString(),
        type: "appointment",
        time: new Date(apt.date).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: formatDateLabel(new Date(apt.date)),
        dateForSearch: new Date(apt.date).toLocaleDateString("es-AR"), // ← NUEVO para búsqueda
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
        type: "retouch",
        time: new Date(retouch.time).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: formatDateLabel(new Date(retouch.time)),
        dateForSearch: new Date(retouch.time).toLocaleDateString("es-AR"), // ← NUEVO
        customer: retouch.appointment.client.name,
        service: `🔄 Repaso:  ${retouch.appointment.service_details}`,
        worker: retouch.worker.profile.name,
        status: mapStatus(retouch.status),
        amount: 0,
        rawDate: new Date(retouch.time),
        reason: retouch.reason,
      }));

      // Combinar y ordenar por fecha
      const allItems = [
        ...transformedAppointments,
        ...transformedRetouches,
      ].sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

      setItems(allItems);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading items:", error);
      setLoading(false);
      setRefreshing(false);
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

    if (compareDate.getTime() === today.getTime()) return "Hoy";
    if (compareDate.getTime() === tomorrow.getTime()) return "Mañana";
    if (compareDate.getTime() === yesterday.getTime()) return "Ayer";

    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    });
  };

  const mapStatus = (status: string) => {
    const statusMap: any = {
      pending: "pending",
      in_progress: "in-progress",
      completed: "completed",
      cancelled: "cancelled",
    };
    return statusMap[status] || "pending";
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  return (
    <View style={styles.container}>
      <AppointmentsHeader />

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
        <SearchAndFilterSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          filter={filter}
          setFilter={setFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          items={items}
        />
        <ItemsList
          filter={filter}
          timeFilter={timeFilter}
          searchQuery={searchQuery}
          searchType={searchType}
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
        <Text style={styles.headerTitle}>Citas y Repasos</Text>
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
  searchType,
  setSearchType,
  filter,
  setFilter,
  timeFilter,
  setTimeFilter,
  items,
}: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingItems = items.filter((item: any) => item.rawDate >= today);
  const pastItems = items.filter((item: any) => item.rawDate < today);

  const countByStatus = {
    all: items.length,
    pending: items.filter((a: any) => a.status === "pending").length,
    completed: items.filter((a: any) => a.status === "completed").length,
  };

  const countByTime = {
    all: items.length,
    upcoming: upcomingItems.length,
    past: pastItems.length,
  };

  return (
    <View style={styles.searchSection}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={
            searchType === "general"
              ? "Buscar por cliente, servicio..."
              : "Buscar por fecha (ej: 15/1 o Hoy)"
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selector de tipo de búsqueda */}
      <View style={styles.searchTypeSelector}>
        <TouchableOpacity
          style={[
            styles.searchTypeButton,
            searchType === "general" && styles.searchTypeButtonActive,
          ]}
          onPress={() => {
            setSearchType("general");
            setSearchQuery("");
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.searchTypeText,
              searchType === "general" && styles.searchTypeTextActive,
            ]}
          >
            👤 Cliente/Servicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.searchTypeButton,
            searchType === "date" && styles.searchTypeButtonActive,
          ]}
          onPress={() => {
            setSearchType("date");
            setSearchQuery("");
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.searchTypeText,
              searchType === "date" && styles.searchTypeTextActive,
            ]}
          >
            📅 Fecha
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de tiempo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <FilterChip
          label="Próximas"
          active={timeFilter === "upcoming"}
          onPress={() => setTimeFilter("upcoming")}
          count={countByTime.upcoming}
          color="#3B82F6"
        />
        <FilterChip
          label="Pasadas"
          active={timeFilter === "past"}
          onPress={() => setTimeFilter("past")}
          count={countByTime.past}
          color="#6B7280"
        />
        <FilterChip
          label="Todas"
          active={timeFilter === "all"}
          onPress={() => setTimeFilter("all")}
          count={countByTime.all}
          color="#8B5CF6"
        />
      </ScrollView>

      {/* Filtros de estado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <FilterChip
          label="Todos los estados"
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
// SECCIÓN:  LISTA DE ITEMS (Appointments + Retouches)
// ============================================================================
function ItemsList({
  filter,
  timeFilter,
  searchQuery,
  searchType,
  items,
  loading,
}: any) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredItems = items.filter((item: any) => {
    // Filtro de estado
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && item.status === "pending") ||
      (filter === "completed" && item.status === "completed");

    // Filtro de tiempo (próximas/pasadas)
    const matchesTimeFilter =
      timeFilter === "all" ||
      (timeFilter === "upcoming" && item.rawDate >= today) ||
      (timeFilter === "past" && item.rawDate < today);

    // Búsqueda
    let matchesSearch = true;
    if (searchQuery !== "") {
      if (searchType === "general") {
        // Búsqueda por cliente o servicio
        matchesSearch =
          item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.service.toLowerCase().includes(searchQuery.toLowerCase());
      } else if (searchType === "date") {
        // Búsqueda por fecha
        const searchLower = searchQuery.toLowerCase();

        // Permitir búsqueda por "hoy", "mañana", "ayer"
        if (searchLower.includes("hoy") || searchLower.includes("today")) {
          matchesSearch = item.date === "Hoy";
        } else if (
          searchLower.includes("mañana") ||
          searchLower.includes("tomorrow")
        ) {
          matchesSearch = item.date === "Mañana";
        } else if (
          searchLower.includes("ayer") ||
          searchLower.includes("yesterday")
        ) {
          matchesSearch = item.date === "Ayer";
        } else {
          // Búsqueda por fecha numérica
          matchesSearch = item.dateForSearch.includes(searchQuery);
        }
      }
    }

    return matchesFilter && matchesTimeFilter && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((groups: any, item: any) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  // Ordenar las fechas para mostrar próximas primero si timeFilter = "upcoming"
  const sortedDates = Object.keys(groupedItems).sort((a, b) => {
    const dateA = groupedItems[a][0].rawDate;
    const dateB = groupedItems[b][0].rawDate;

    if (timeFilter === "upcoming") {
      return dateA - dateB; // Ascendente (más cercanas primero)
    } else if (timeFilter === "past") {
      return dateB - dateA; // Descendente (más recientes primero)
    }
    return dateA - dateB; // Por defecto ascendente
  });

  return (
    <View style={styles.appointmentsList}>
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedItems[date].map((item: any) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                onPress={() => {
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
        <EmptyState searchQuery={searchQuery} searchType={searchType} />
      )}
    </View>
  );
}

function EmptyState({ searchQuery, searchType }: any) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{searchQuery ? "🔍" : "📭"}</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No se encontraron resultados" : "No hay citas"}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? searchType === "date"
            ? "Intenta con otra fecha (ej: 15/1, Hoy, Mañana)"
            : "Intenta con otros términos de búsqueda"
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
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },

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
  clearIcon: {
    fontSize: 18,
    color: "#9CA3AF",
    paddingHorizontal: 8,
  },

  // Selector de tipo de búsqueda
  searchTypeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchTypeButtonActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  searchTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  searchTypeTextActive: {
    color: "#3B82F6",
  },

  filtersContainer: {
    flexDirection: "row",
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 32,
  },

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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
