import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 15;

export default function WorkerHistoryScreen() {
  const { id } = useLocalSearchParams();
  const [workerName, setWorkerName] = useState("");
  const [allWork, setAllWork] = useState<any[]>([]);
  const [displayedWork, setDisplayedWork] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      if (!refreshing) setLoading(true);

      // TODO: Cargar de Supabase
      const mockWork = generateMockWorkData(50); // 50 items para testing
      
      // Ordenar por fecha descendente
      const sortedWork = mockWork.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setWorkerName("Carlos González"); // TODO: Obtener de Supabase
      setAllWork(sortedWork);
      
      // Primera página
      const firstPage = sortedWork.slice(0, ITEMS_PER_PAGE);
      setDisplayedWork(firstPage);
      setCurrentPage(1);
      setHasMore(sortedWork.length > ITEMS_PER_PAGE);

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading history:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockWorkData = (count:  number) => {
    const work = [];
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(9 + (i % 10), 0, 0, 0);

      const isAppointment = i % 3 !== 0;
      
      work.push({
        id: i + 1,
        type: isAppointment ? "appointment" :  "retouch",
        date: date.toISOString(),
        client: {
          name: `Cliente ${i + 1}`,
          phone: `351 ${Math.floor(Math.random() * 900000 + 100000)}`,
        },
        service: isAppointment 
          ? ["Limpieza de sillón", "Alfombra persa", "Auto completo", "Sillas"][i % 4]
          : `Repaso de ${["sillón", "alfombra", "auto"][i % 3]}`,
        address: `Calle ${i + 1}, ${100 + i}`,
        ...(isAppointment ? {
          cost: 12000 + (i * 500),
          workerEarned: (12000 + (i * 500)) * 0.6,
        } : {
          reason: `Motivo del repaso #${i + 1}`,
          appointmentId: Math.floor(i / 3) + 1,
        }),
        status: "completed",
      });
    }
    
    return work;
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      
      const newItems = allWork.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedWork([...displayedWork, ...newItems]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < allWork.length);
      } else {
        setHasMore(false);
      }

      setLoadingMore(false);
    }, 500);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading) {
    return (
      <View style={styles. container}>
        <HistoryHeader workerName={workerName} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HistoryHeader workerName={workerName} totalItems={allWork.length} />

      <FlatList
        data={displayedWork}
        renderItem={({ item }) => <WorkItem item={item} />}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        
        // Infinite scroll
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        
        // Footer
        ListFooterComponent={() => (
          <>
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingMoreText}>Cargando más...</Text>
              </View>
            )}
            {!hasMore && displayedWork.length > 0 && (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>
                  ✓ Has visto todos los {allWork.length} trabajos
                </Text>
              </View>
            )}
          </>
        )}
        
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No hay historial de trabajos
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function HistoryHeader({ workerName, totalItems }: any) {
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
        <Text style={styles.headerTitle}>Historial de Trabajo</Text>
        <Text style={styles.headerSubtitle}>
          {workerName} {totalItems ?  `• ${totalItems} trabajos` : ""}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// WORK ITEM
// ============================================================================
function WorkItem({ item }: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month:  "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePress = () => {
    if (item.type === "appointment") {
      router.push(`/admin/appointments/${item.id}`);
    } else {
      router.push(`/admin/appointments/retouches/${item.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.workCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.workCardHeader}>
        <View style={styles.workCardType}>
          <Text style={styles.workCardTypeIcon}>
            {item.type === "appointment" ? "📅" : "🔄"}
          </Text>
          <Text style={styles.workCardTypeText}>
            {item.type === "appointment" ? "Turno" : "Repaso"}
          </Text>
        </View>
        <Text style={styles.workCardDate}>
          {formatDate(item. date)}
        </Text>
      </View>

      <View style={styles.workCardBody}>
        <Text style={styles.workCardClient}>
          👤 {item.client.name}
        </Text>
        <Text style={styles.workCardService}>
          🧹 {item.service}
        </Text>
        <Text style={styles.workCardAddress}>
          📍 {item.address}
        </Text>

        {item.type === "retouch" && item.reason && (
          <Text style={styles.workCardReason}>
            💬 {item.reason}
          </Text>
        )}
      </View>

      {item.type === "appointment" && item.cost && (
        <View style={styles.workCardFooter}>
          <View style={styles.workCardAmount}>
            <Text style={styles.workCardAmountLabel}>Total: </Text>
            <Text style={styles.workCardAmountValue}>
              ${item.cost.toLocaleString()}
            </Text>
          </View>
          <View style={styles.workCardAmount}>
            <Text style={styles.workCardAmountLabel}>Ganancia: </Text>
            <Text style={styles.workCardEarned}>
              ${item. workerEarned.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.workCardArrow}>
        <Text style={styles.workCardArrowText}>›</Text>
      </View>
    </TouchableOpacity>
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
    height:  40,
    borderRadius:  20,
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
    fontSize:  13,
    color: "#6B7280",
    marginTop:  2,
  },

  // List
  listContent: {
    padding: 16,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Work Card
  workCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:  0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  workCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  workCardType: {
    flexDirection:  "row",
    alignItems:  "center",
    gap: 6,
  },
  workCardTypeIcon: {
    fontSize:  16,
  },
  workCardTypeText:  {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  workCardDate: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  workCardBody: {
    gap: 6,
    marginBottom: 12,
  },
  workCardClient: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  workCardService: {
    fontSize: 14,
    color: "#374151",
  },
  workCardAddress: {
    fontSize:  13,
    color: "#6B7280",
  },
  workCardReason: {
    fontSize: 12,
    color: "#8B5CF6",
    fontStyle: "italic",
    marginTop: 4,
  },
  workCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  workCardAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  workCardAmountLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  workCardAmountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  workCardEarned: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  workCardArrow: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  workCardArrowText: {
    fontSize: 24,
    color: "#D1D5DB",
  },

  // Loading More
  loadingMoreContainer:  {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize:  14,
    color: "#6B7280",
  },

  // End
  endContainer: {
    padding: 16,
    alignItems: "center",
  },
  endText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // Empty
  emptyContainer: {
    padding: 64,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
