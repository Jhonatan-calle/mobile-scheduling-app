import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ListRenderItemInfo,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getClients, ClientFilters } from "../../../utils/adminData";
import { Client } from "../../../utils/types";

const PAGE_SIZE = 50;

const ORDER_OPTIONS: { label: string; value: ClientFilters["orderBy"]; dir: ClientFilters["orderDir"] }[] = [
  { label: "Nombre A-Z", value: "name", dir: "asc" },
  { label: "Nombre Z-A", value: "name", dir: "desc" },
  { label: "Ocurrencias ↑", value: "occurrences", dir: "asc" },
  { label: "Ocurrencias ↓", value: "occurrences", dir: "desc" },
];

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [lastApptFrom, setLastApptFrom] = useState<Date | null>(null);
  const [lastApptTo, setLastApptTo] = useState<Date | null>(null);
  const [lastContFrom, setLastContFrom] = useState<Date | null>(null);
  const [lastContTo, setLastContTo] = useState<Date | null>(null);

  const [orderIndex, setOrderIndex] = useState(0);
  const [showPicker, setShowPicker] = useState<"apptFrom" | "apptTo" | "contFrom" | "contTo" | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const mountedRef = useRef(true);
  const loadIdRef = useRef(0);

  const buildFilters = useCallback((pageNum: number): ClientFilters => {
    const f: ClientFilters = { page: pageNum, pageSize: PAGE_SIZE };
    if (searchText.trim()) f.searchText = searchText.trim();
    if (lastApptFrom) f.lastAppointmentFrom = lastApptFrom.toISOString();
    if (lastApptTo) f.lastAppointmentTo = lastApptTo.toISOString();
    if (lastContFrom) f.lastContactedFrom = lastContFrom.toISOString();
    if (lastContTo) f.lastContactedTo = lastContTo.toISOString();
    const opt = ORDER_OPTIONS[orderIndex];
    f.orderBy = opt.value;
    f.orderDir = opt.dir;
    return f;
  }, [searchText, lastApptFrom, lastApptTo, lastContFrom, lastContTo, orderIndex]);

  const loadClients = useCallback(async () => {
    const id = ++loadIdRef.current;
    setLoading(true);
    setPage(0);
    setHasMore(true);
    try {
      const data = await getClients(buildFilters(0));
      if (!mountedRef.current || id !== loadIdRef.current) return;
      setClients(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error("Error loading clients:", e);
    } finally {
      if (mountedRef.current && id === loadIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [buildFilters]);

  useEffect(() => {
    mountedRef.current = true;
    loadClients();
    return () => { mountedRef.current = false; };
  }, [loadClients]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await getClients(buildFilters(nextPage));
      if (!mountedRef.current) return;
      setClients((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error("Error loading more:", e);
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, loading, buildFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  const clearFilters = () => {
    setLastApptFrom(null);
    setLastApptTo(null);
    setLastContFrom(null);
    setLastContTo(null);
    setOrderIndex(0);
  };

  const hasActiveFilters = lastApptFrom || lastApptTo || lastContFrom || lastContTo || orderIndex !== 0;

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const openPicker = (target: "apptFrom" | "apptTo" | "contFrom" | "contTo") => {
    const current =
      target === "apptFrom" ? lastApptFrom :
      target === "apptTo" ? lastApptTo :
      target === "contFrom" ? lastContFrom :
      lastContTo;
    setPickerDate(current ?? new Date());
    setShowPicker(target);
  };

  const onPickerChange = (_: any, selected?: Date) => {
    if (!selected) { setShowPicker(null); return; }
    setPickerDate(selected);
    if (Platform.OS === "android") {
      if (showPicker === "apptFrom") setLastApptFrom(selected);
      if (showPicker === "apptTo") setLastApptTo(selected);
      if (showPicker === "contFrom") setLastContFrom(selected);
      if (showPicker === "contTo") setLastContTo(selected);
      setShowPicker(null);
    }
  };

  const confirmIOSDate = () => {
    if (showPicker === "apptFrom") setLastApptFrom(pickerDate);
    if (showPicker === "apptTo") setLastApptTo(pickerDate);
    if (showPicker === "contFrom") setLastContFrom(pickerDate);
    if (showPicker === "contTo") setLastContTo(pickerDate);
    setShowPicker(null);
  };

  const renderItem = ({ item }: ListRenderItemInfo<Client>) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/admin/clients/${item.id}`)}
    >
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientPhone}>📱 {item.phone_number}</Text>
        <Text style={styles.clientMeta}>
          📅 {item.last_appointment_at
            ? new Date(item.last_appointment_at).toLocaleDateString("es-AR")
            : "Sin turnos"}
          {"  "}🔄 {item.occurrences ?? 0}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View>
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Último turno</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker("apptFrom")}>
              <Text style={styles.dateButtonText}>{formatDate(lastApptFrom) || "Desde"}</Text>
            </TouchableOpacity>
            <Text style={styles.dateSep}>→</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker("apptTo")}>
              <Text style={styles.dateButtonText}>{formatDate(lastApptTo) || "Hasta"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Último contacto</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker("contFrom")}>
              <Text style={styles.dateButtonText}>{formatDate(lastContFrom) || "Desde"}</Text>
            </TouchableOpacity>
            <Text style={styles.dateSep}>→</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => openPicker("contTo")}>
              <Text style={styles.dateButtonText}>{formatDate(lastContTo) || "Hasta"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Ordenar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.orderRow}>
            {ORDER_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.orderChip, i === orderIndex && styles.orderChipActive]}
                onPress={() => setOrderIndex(i)}
              >
                <Text style={[styles.orderChipText, i === orderIndex && styles.orderChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showPicker && Platform.OS === "ios" && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Text style={styles.iosPickerCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmIOSDate}>
              <Text style={styles.iosPickerConfirm}>OK</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="spinner"
            onChange={onPickerChange}
          />
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.footerText}>Cargando más...</Text>
        </View>
      );
    }
    if (!hasMore && clients.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerText}>Todos los clientes cargados</Text>
        </View>
      );
    }
    return <View style={{ height: 40 }} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.count}>{clients.length} clientes</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar nombre o teléfono..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, hasActiveFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={onPickerChange}
        />
      )}

      {loading && clients.length === 0 ? (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No se encontraron clientes</Text>
            </View>
          }
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  count: {
    fontSize: 14,
    color: "#6B7280",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  clearIcon: {
    fontSize: 16,
    color: "#9CA3AF",
    padding: 4,
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  filterToggleActive: {
    backgroundColor: "#DBEAFE",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filtersPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  dateSep: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  orderRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  orderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  orderChipActive: {
    backgroundColor: "#3B82F6",
  },
  orderChipText: {
    fontSize: 13,
    color: "#374151",
  },
  orderChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  clearBtn: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearBtnText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iosPickerCancel: {
    fontSize: 16,
    color: "#EF4444",
  },
  iosPickerConfirm: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  initialLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  footerEnd: {
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    marginRight: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  cardBody: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  clientMeta: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  chevron: {
    fontSize: 22,
    color: "#9CA3AF",
    marginLeft: 8,
  },
});
