import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWorkers } from "../../../utils/adminData";

export default function WorkersListScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkers = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getWorkers();
      setWorkers(data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading workers:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  const getAvatar = (name: string) => {
    if (
      name.toLowerCase().includes("ana") ||
      name.toLowerCase().includes("maría")
    ) {
      return "👩";
    }
    return "👨";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Trabajadores</Text>
          <Text style={styles.headerSubtitle}>Estadísticas e historial</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/availability/new")}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando trabajadores...</Text>
          </View>
        ) : workers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Sin trabajadores</Text>
            <Text style={styles.emptyText}>
              No hay trabajadores registrados
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {workers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={styles.workerCard}
                onPress={() =>
                  router.push(`/admin/availability/${worker.id}`)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.workerAvatar}>
                  {getAvatar(worker.profile.name)}
                </Text>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>
                    {worker.profile.name}
                  </Text>
                  <Text style={styles.workerCommission}>
                    Comisión: {worker.commission_rate}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() =>
                    router.push(`/admin/availability/${worker.id}/edit`)
                  }
                  activeOpacity={0.6}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingTop: 16,
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
  list: {
    padding: 16,
    gap: 12,
  },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workerAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  workerCommission: {
    fontSize: 13,
    color: "#6B7280",
  },
  arrow: {
    fontSize: 24,
    color: "#D1D5DB",
    marginLeft: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  editIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  editIcon: {
    fontSize: 14,
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
});
