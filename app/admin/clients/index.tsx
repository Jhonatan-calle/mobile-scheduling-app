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

type OrderField = "name" | "occurrences" | "last_contacted_at" | "last_appointment_at";

const ORDER_CHIPS: { label: string; field: OrderField }[] = [
  { label: "Nombre", field: "name" },
  { label: "Ocurrencias", field: "occurrences" },
  { label: "Últ. turno", field: "last_appointment_at" },
  { label: "Últ. contacto", field: "last_contacted_at" },
];

const DATE_FIELD_OPTIONS: { label: string; value: DateFilter["field"] }[] = [
  { label: "Último turno", value: "last_appointment_at" },
  { label: "Último contacto", value: "last_contacted_at" },
];

interface DateFilter {
  id: string;
  field: "last_appointment_at" | "last_contacted_at";
  from: Date | null;
  to: Date | null;
}

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [order, setOrder] = useState<{ field: OrderField; asc: boolean } | null>(null);
  const [dateFilters, setDateFilters] = useState<DateFilter[]>([]);

  const [showPicker, setShowPicker] = useState<{ id: string; bound: "from" | "to" } | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const mountedRef = useRef(true);
  const loadIdRef = useRef(0);
  const dateIdCounter = useRef(0);

  const usedDateFields = new Set(dateFilters.map((d) => d.field));
  const availableDateFields = DATE_FIELD_OPTIONS.filter((o) => !usedDateFields.has(o.value));

  const buildFilters = useCallback((pageNum: number): ClientFilters => {
    const f: ClientFilters = { page: pageNum, pageSize: PAGE_SIZE };
    if (searchText.trim()) f.searchText = searchText.trim();

    for (const df of dateFilters) {
      if (df.field === "last_appointment_at") {
        if (df.from) f.lastAppointmentFrom = df.from.toISOString();
        if (df.to) f.lastAppointmentTo = df.to.toISOString();
      } else {
        if (df.from) f.lastContactedFrom = df.from.toISOString();
        if (df.to) f.lastContactedTo = df.to.toISOString();
      }
    }

    if (order) {
      f.orderBy = order.field;
      f.orderDir = order.asc ? "asc" : "desc";
    } else {
      f.orderBy = "name";
      f.orderDir = "asc";
    }

    return f;
  }, [searchText, dateFilters, order]);

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

  const handleOrderPress = (field: OrderField) => {
    if (!order || order.field !== field) {
      setOrder({ field, asc: true });
    } else if (order.asc) {
      setOrder({ field, asc: false });
    } else {
      setOrder(null);
    }
  };

  const addDateFilter = (field: DateFilter["field"]) => {
    const id = String(++dateIdCounter.current);
    setDateFilters((prev) => [...prev, { id, field, from: null, to: null }]);
  };

  const removeDateFilter = (id: string) => {
    setDateFilters((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDateFilter = (id: string, updates: Partial<DateFilter>) => {
    setDateFilters((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
  };

  const openDatePicker = (id: string, bound: "from" | "to") => {
    const df = dateFilters.find((d) => d.id === id);
    setPickerDate(df?.[bound] ?? new Date());
    setShowPicker({ id, bound });
  };

  const onPickerChange = (_: any, selected?: Date) => {
    if (!selected || !showPicker) { setShowPicker(null); return; }
    setPickerDate(selected);
    if (Platform.OS === "android") {
      if (showPicker.bound === "from") {
        updateDateFilter(showPicker.id, { from: selected });
      } else {
        updateDateFilter(showPicker.id, { to: selected });
      }
      setShowPicker(null);
    }
  };

  const confirmIOSDate = () => {
    if (!showPicker) return;
    if (showPicker.bound === "from") {
      updateDateFilter(showPicker.id, { from: pickerDate });
    } else {
      updateDateFilter(showPicker.id, { to: pickerDate });
    }
    setShowPicker(null);
  };

  const hasActiveFilters = order !== null || dateFilters.length > 0;

  const formatDateLabel = (d: Date | null) =>
    d ? d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const activePicker = showPicker ? dateFilters.find((d) => d.id === showPicker.id) : null;

  const getOrderDisplay = (field: OrderField) => {
    if (!order || order.field !== field) return null;
    return order.asc ? "↑" : "↓";
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
          <Text style={styles.filterSectionTitle}>Ordenar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ORDER_CHIPS.map((chip) => {
              const dir = getOrderDisplay(chip.field);
              const active = order?.field === chip.field;
              return (
                <TouchableOpacity
                  key={chip.field}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => handleOrderPress(chip.field)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {chip.label} {dir ?? ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {dateFilters.length > 0 && (
            <View style={styles.dateFiltersSection}>
              <Text style={styles.filterSectionTitle}>Rangos de fecha</Text>
              {dateFilters.map((df) => {
                const fieldLabel = DATE_FIELD_OPTIONS.find((o) => o.value === df.field)?.label ?? df.field;
                return (
                  <View key={df.id} style={styles.dateFilterRow}>
                    <TouchableOpacity
                      style={styles.dateFilterRemove}
                      onPress={() => removeDateFilter(df.id)}
                    >
                      <Text style={styles.dateFilterRemoveText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.dateFilterFieldLabel}>{fieldLabel}</Text>
                    <TouchableOpacity
                      style={styles.datePill}
                      onPress={() => openDatePicker(df.id, "from")}
                    >
                      <Text style={styles.datePillText}>
                        {formatDateLabel(df.from) || "Desde"}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dateSep}>→</Text>
                    <TouchableOpacity
                      style={styles.datePill}
                      onPress={() => openDatePicker(df.id, "to")}
                    >
                      <Text style={styles.datePillText}>
                        {formatDateLabel(df.to) || "Hasta"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {!usedDateFields.has("last_appointment_at") && (
            <TouchableOpacity
              style={styles.addRangeBtn}
              onPress={() => addDateFilter("last_appointment_at")}
            >
              <Text style={styles.addRangeBtnText}>
                + Agregar rango de último turno
              </Text>
            </TouchableOpacity>
          )}
          {!usedDateFields.has("last_contacted_at") && (
            <TouchableOpacity
              style={styles.addRangeBtn}
              onPress={() => addDateFilter("last_contacted_at")}
            >
              <Text style={styles.addRangeBtnText}>
                + Agregar rango de último contacto
              </Text>
            </TouchableOpacity>
          )}

          {/* iOS picker inline */}
          {showPicker && Platform.OS === "ios" && activePicker && (
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
          onPress={() => {
            setShowFilters(!showFilters);
            setShowPicker(null);
          }}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Android picker */}
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
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  chipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dateFiltersSection: {
    marginTop: 16,
  },
  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  dateFilterRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  dateFilterRemoveText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "bold",
  },
  dateFilterFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    minWidth: 80,
  },
  datePill: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  datePillText: {
    fontSize: 13,
    color: "#374151",
  },
  dateSep: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  addRangeBtn: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
  },
  addRangeBtnText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
  iosPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 12,
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
