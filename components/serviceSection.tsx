import { useState } from "react";
import { View } from "react-native";
import { SectionHeader } from "./SectionHeader";

export function ServiceInfoSection({
  serviceObjects,
  appointmentItems,
  setAppointmentItems,
}: {
  serviceObjects: ServiceObjectCombos[];
  appointmentItems: AppointmentItem[];
  setAppointmentItems: (items: AppointmentItem[]) => void;
}) {
  const [selectedObjectId, setSelectedObjectId] = useState<
    number | null
  >(null);

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

const styles = {
}
