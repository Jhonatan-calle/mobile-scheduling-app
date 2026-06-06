import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SectionHeader } from "./SectionHeader";
import { getServiceIcon } from "../utils/lookups";
import type {
  ServiceObjectWithCombos,
  AppointmentItem,
} from "../utils/types";

export function ServiceInfoSection({
  serviceObjects,
  appointmentItems,
  setAppointmentItems,
  initialItems,
}: {
  serviceObjects: ServiceObjectWithCombos[];
  appointmentItems: AppointmentItem[];
  setAppointmentItems: (items: AppointmentItem[]) => void;
  initialItems?: AppointmentItem[];
}) {
  const [selectedObjectId, setSelectedObjectId] = useState<
    number | null
  >(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (initialItems && !seeded) {
      setAppointmentItems(initialItems);
      setSeeded(true);
    }
  }, [initialItems, seeded, setAppointmentItems]);

  const selectedObject = serviceObjects.find(
    (o) => o.id === selectedObjectId,
  );

  const isObjectInItems = (objectId: number) =>
    appointmentItems.some((i) => i.service_object_id === objectId);

  const addItem = (
    objectId: number,
    comboId: number | null = null,
  ) => {
    // Evitar duplicar el mismo objeto+combo
    const exists = appointmentItems.some(
      (i) =>
        i.service_object_id === objectId &&
        (i.service_combo_id ?? null) === comboId,
    );
    if (exists) return;

    setAppointmentItems([
      ...appointmentItems,
      {
        service_object_id: objectId,
        service_combo_id: comboId,
        description: null,
      },
    ]);
    setSelectedObjectId(null);
  };

  const removeItem = (index: number) => {
    setAppointmentItems(
      appointmentItems.filter((_, i) => i !== index),
    );
  };

  const updateItemDetalle = (index: number, detalle: string) => {
    const updated = [...appointmentItems];
    updated[index] = {
      ...updated[index],
      description: detalle || null,
    };
    setAppointmentItems(updated);
  };

  const getObjectLabel = (objectId: number) =>
    serviceObjects.find((o) => o.id === objectId)?.name ?? "Objeto";

  const getComboLabel = (
    objectId: number,
    comboId: number | null,
  ) => {
    if (!comboId) return null;
    const obj = serviceObjects.find((o) => o.id === objectId);
    return obj?.combos.find((c) => c.id === comboId)?.name ?? null;
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="🧼"
        title="Servicios"
        subtitle="Qué se va a limpiar"
      />

      {/* Items ya agregados */}
      {appointmentItems.length > 0 && (
        <View style={styles.itemsList}>
          {appointmentItems.map((item, index) => {
            const objectLabel = getObjectLabel(
              item.service_object_id,
            );
            const comboLabel = getComboLabel(
              item.service_object_id,
              item.service_combo_id,
            );
            return (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <View style={styles.itemCardTitles}>
                    <Text style={styles.itemCardObject}>
                      {objectLabel}
                    </Text>
                    {comboLabel && (
                      <Text style={styles.itemCardCombo}>
                        {comboLabel}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    style={styles.itemRemoveBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.itemRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.itemDetalleInput}
                  placeholder="Detalle opcional "
                  placeholderTextColor="#9CA3AF"
                  value={item.description ?? ""}
                  onChangeText={(text) =>
                    updateItemDetalle(index, text)
                  }
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Selector de objeto */}
      {selectedObjectId === null ? (
        <>
          <Text style={styles.label}>
            {appointmentItems.length === 0
              ? "¿Qué se va a limpiar? *"
              : "Agregar otro objeto"}
          </Text>
          <View style={styles.objectGrid}>
            {serviceObjects.map((obj) => {
              const alreadyAdded = isObjectInItems(obj.id);
              return (
                <TouchableOpacity
                  key={obj.id}
                  style={[
                    styles.objectCard,
                    alreadyAdded && styles.objectCardAdded,
                  ]}
                  onPress={() => {
                    if (obj.combos.length === 0) {
                      // Sin combos → agregar directo
                      addItem(obj.id, null);
                    } else {
                      setSelectedObjectId(obj.id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.objectCardIcon}>
                    {getServiceIcon(obj.name)}
                  </Text>
                  <Text
                    style={[
                      styles.objectCardName,
                      alreadyAdded && styles.objectCardNameAdded,
                    ]}
                  >
                    {obj.name}
                  </Text>
                  {alreadyAdded && (
                    <Text style={styles.objectCardCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : (
        /* Selector de combo */
        <View>
          <View style={styles.comboHeader}>
            <TouchableOpacity
              onPress={() => setSelectedObjectId(null)}
              style={styles.comboBack}
              activeOpacity={0.7}
            >
              <Text style={styles.comboBackText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.comboTitle}>
              {selectedObject?.name} — elegí una opción
            </Text>
          </View>

          <View style={styles.comboList}>
            {selectedObject?.combos.map((combo) => (
              <TouchableOpacity
                key={combo.id}
                style={styles.comboItem}
                onPress={() => addItem(selectedObject.id, combo.id)}
                activeOpacity={0.7}
              >
                <View style={styles.comboItemInfo}>
                  <Text style={styles.comboItemName}>
                    {combo.name}
                  </Text>
                  {combo.description && (
                    <Text style={styles.comboItemDesc}>
                      {combo.description}
                    </Text>
                  )}
                </View>
                {combo.precio != null && (
                  <Text style={styles.comboItemPrice}>
                    ${combo.precio.toLocaleString("es-AR")}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Opción sin combo */}
            <TouchableOpacity
              style={[styles.comboItem, styles.comboItemFree]}
              onPress={() => addItem(selectedObject!.id, null)}
              activeOpacity={0.7}
            >
              <Text style={styles.comboItemName}>
                Sin combo / precio libre
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },
  itemsList: {
    gap: 8,
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderRadius: 12,
    padding: 12,
  },
  itemCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemCardTitles: {
    flex: 1,
  },
  itemCardObject: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  itemCardCombo: {
    fontSize: 13,
    color: "#3B82F6",
    marginTop: 2,
  },
  itemRemoveBtn: {
    padding: 4,
    marginLeft: 8,
  },
  itemRemoveText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  itemDetalleInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
  },
  objectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  objectCard: {
    width: "31%",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  objectCardAdded: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  objectCardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  objectCardName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  objectCardNameAdded: {
    color: "#065F46",
  },
  objectCardCheck: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 2,
    fontWeight: "bold",
  },
  comboHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  comboBack: {
    padding: 4,
  },
  comboBackText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  comboTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  comboList: {
    gap: 8,
    marginBottom: 16,
  },
  comboItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  comboItemFree: {
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
  },
  comboItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  comboItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  comboItemDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 17,
  },
  comboItemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#10B981",
  },
});
