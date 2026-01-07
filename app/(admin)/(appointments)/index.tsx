import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { AppointmentPreviewCard } from "../../../components/admin/dashboard";

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      <AppointmentsHeader />
      
      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        <SearchAndFilterSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />
        <AppointmentsList filter={filter} searchQuery={searchQuery} />
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
        <Text style={styles. headerTitle}>Citas</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus appointments</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: BÚSQUEDA Y FILTROS
// ============================================================================
function SearchAndFilterSection({ searchQuery, setSearchQuery, filter, setFilter }: any) {
  return (
    <View style={styles.searchSection}>
      {/* Barra de búsqueda */}
      <View style={styles. searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
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
          count={12}
        />
        <FilterChip
          label="Pendientes"
          active={filter === "pending"}
          onPress={() => setFilter("pending")}
          count={8}
          color="#F59E0B"
        />
        <FilterChip
          label="Completadas"
          active={filter === "completed"}
          onPress={() => setFilter("completed")}
          count={4}
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
// SECCIÓN:  LISTA DE CITAS
// ============================================================================
function AppointmentsList({ filter, searchQuery }:  any) {
  // Datos de ejemplo - en producción vendrían de Supabase
  const appointments = [
    {
      id: "1",
      time: "09:00",
      date: "Hoy",
      customer: "Juan Pérez",
      service: "Limpieza de sillón 3 cuerpos",
      worker: "Carlos González",
      status: "pending" as const,
      amount: 15000,
    },
    {
      id:  "2",
      time: "14:00",
      date: "Hoy",
      customer: "María López",
      service: "Limpieza de alfombra",
      worker: "Ana Martínez",
      status: "in-progress" as const,
      amount: 12000,
    },
    {
      id: "3",
      time: "10:00",
      date: "Mañana",
      customer: "Roberto García",
      service: "Limpieza de tapizado completo",
      worker: "Carlos González",
      status: "pending" as const,
      amount:  25000,
      paymentMethod: "transfer",
    },
    {
      id: "4",
      time: "16:00",
      date: "Ayer",
      customer: "Laura Fernández",
      service: "Limpieza de sillas",
      worker: "Ana Martínez",
      status: "completed" as const,
      amount: 8000,
      paymentMethod: "cash",
    },
  ];

  // Filtrar citas
  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && apt.status === "pending") ||
      (filter === "completed" && apt.status === "completed");

    const matchesSearch =
      searchQuery === "" ||
      apt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchQuery. toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Agrupar por fecha
  const groupedAppointments = filteredAppointments.reduce((groups:  any, apt) => {
    const date = apt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {});

  return (
    <View style={styles.appointmentsList}>
      {Object.keys(groupedAppointments).length > 0 ? (
        Object.keys(groupedAppointments).map((date) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedAppointments[date]. map((apt:  any) => (
              <TouchableOpacity
                key={apt.id}
                onPress={() => router.push(`/(admin)/(appointments)/${apt.id}`)}
                activeOpacity={0.7}
              >
                <AppointmentPreviewCard
                  time={apt.time}
                  customer={apt.customer}
                  service={apt.service}
                  worker={apt.worker}
                  status={apt.status}
                  paymentMethod={apt.paymentMethod}
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
      <Text style={styles. emptyIcon}>
        {searchQuery ? "🔍" : "📭"}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No se encontraron resultados" : "No hay citas"}
      </Text>
      <Text style={styles. emptyText}>
        {searchQuery
          ? "Intenta con otros términos de búsqueda"
          :  "Crea tu primera cita para comenzar"}
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

  // Search Section
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

  // Filters
  filtersContainer: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical:  8,
    borderRadius:  20,
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
  fabIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
