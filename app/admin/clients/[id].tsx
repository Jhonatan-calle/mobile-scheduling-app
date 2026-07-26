import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getClientAppointments,
  updateClient,
} from "../../../utils/adminData";
import {
  getAppointmentStatusConfigByKey,
  getAppointmentStatusKey,
  getAppointmentStatusConfig,
  getPaymentMethodConfig,
} from "../../../utils/lookups";
import { handleCall, handleWhatsApp } from "../../../utils/contact";
import { supabase } from "../../../supabase/supabase";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", Number(id))
        .single();
      setClient(clientData);
      setEditName(clientData?.name ?? "");

      const appts = await getClientAppointments(Number(id));
      setAppointments(appts);
    } catch (e) {
      console.error("Error loading client:", e);
    } finally {
      setLoading(false);
    }
  };

  const markContacted = async () => {
    if (!client) return;
    try {
      const now = new Date().toISOString();
      await updateClient(client.id, { last_contacted_at: now } as any);
      setClient({ ...client, last_contacted_at: now });
      Alert.alert("Listo", "Contacto registrado");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el contacto");
    }
  };

  const saveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }
    try {
      setSaving(true);
      await updateClient(client.id, { name: trimmed });
      setClient({ ...client, name: trimmed });
      setEditModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el nombre");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const pickItemsLabel = (items: any[]) => {
    if (!items || items.length === 0) return "Servicio";
    return items
      .map((item: any) => {
        const objeto =
          item.service_combo?.service_object?.name ??
          item.service_combo?.object_combos?.[0]?.service_object?.name ??
          "Objeto";
        const combo = item.service_combo?.name;
        const cantidad = item.cantidad ?? 1;
        const suffix = cantidad > 1 ? ` x${cantidad}` : "";
        return combo ? `${objeto} (${combo}${suffix})` : `${objeto}${suffix}`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cliente no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* Client header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {client.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.clientName}>{client.name}</Text>
            <TouchableOpacity
              onPress={() => {
                setEditName(client.name);
                setEditModalVisible(true);
              }}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.clientPhone}>📱 {client.phone_number}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#D1FAE5" }]}
            onPress={() => handleCall(client.phone_number)}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={[styles.actionLabel, { color: "#065F46" }]}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#DBEAFE" }]}
            onPress={() => handleWhatsApp(client.phone_number)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={[styles.actionLabel, { color: "#1E40AF" }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#FEF3C7" }]}
            onPress={markContacted}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={[styles.actionLabel, { color: "#92400E" }]}>Contactado</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <InfoRow label="Último turno" value={formatDate(client.last_appointment_at)} />
          <InfoRow label="Último contacto" value={formatDate(client.last_contacted_at)} />
          <InfoRow label="Ocurrencias" value={String(client.occurrences ?? 0)} />
        </View>

        {/* Appointments */}
        <Text style={styles.sectionTitle}>
          Turnos ({appointments.length})
        </Text>

        {appointments.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin turnos registrados</Text>
          </View>
        ) : (
          appointments.map((apt) => {
            const statusKey = getAppointmentStatusKey(apt.status);
            const config = getAppointmentStatusConfigByKey(statusKey);
            const payment = getPaymentMethodConfig(apt.payment_method);
            return (
              <TouchableOpacity
                key={apt.id}
                style={styles.apptCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/admin/appointments/${apt.id}`)}
              >
                <View style={styles.apptHeader}>
                  <Text style={styles.apptDate}>{formatDateTime(apt.date)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: config.color + "20" }]}>
                    <Text style={styles.statusIcon}>{config.icon}</Text>
                  </View>
                </View>
                <Text style={styles.apptService}>{pickItemsLabel(apt.items ?? [])}</Text>
                <View style={styles.apptFooter}>
                  <Text style={styles.apptWorker}>
                    👤 {apt.worker?.profile?.name ?? "Sin asignar"}
                  </Text>
                  <View style={styles.apptRight}>
                    {payment && <Text style={styles.paymentIcon}>{payment.icon}</Text>}
                    <Text style={styles.apptAmount}>
                      ${apt.cost ? Number(apt.cost).toLocaleString("es-AR") : "0"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit name modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre del cliente"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, saving && styles.modalSaveBtnDisabled]}
                onPress={saveName}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>
                  {saving ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  backBtn: {
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  headerCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  editIcon: {
    fontSize: 20,
  },
  clientPhone: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  apptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  apptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  apptDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statusIcon: {
    fontSize: 14,
  },
  apptService: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  apptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  apptWorker: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  apptRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentIcon: {
    fontSize: 14,
  },
  apptAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  modalSaveBtnDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
