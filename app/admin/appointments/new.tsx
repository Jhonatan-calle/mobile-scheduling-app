import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  FlatList,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import {
  createAppointment,
  findOrCreateClient as findOrCreateClientInDb,
  getCurrentProfile,
  getClients,
  getServiceObjectsWithCombos, // <-- reemplaza getServices
  getWorkers,
} from "../../../utils/adminData";
import type {
  ServiceObjectWithCombos,
  AppointmentItem,
} from "../../../utils/adminData";
import { getServiceIcon } from "../../../utils/lookups";

export default function NewAppointmentScreen() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    cost: "",
    date: new Date(),
    time: new Date(),
    estimateTime: "60",
    observaciones: "",
    workerId: "",
    commissionRate: "",
  });

  const [appointmentItems, setAppointmentItems] = useState<AppointmentItem[]>(
    [],
  );
  const [serviceObjects, setServiceObjects] = useState<
    ServiceObjectWithCombos[]
  >([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);

  // Estados para sugerencias de clientes
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  useEffect(() => {
    loadWorkers();
    loadServices();
  }, []);

  const loadWorkers = async () => {
    try {
      setWorkers(await getWorkers());
    } catch (error) {
      console.error("Error loading workers:", error);
    }
  };

  const loadServices = async () => {
    try {
      setServiceObjects(await getServiceObjectsWithCombos());
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  // Buscar clientes por nombre
  const searchClientsByName = async (searchText: string) => {
    if (searchText.trim().length < 2) {
      setClientSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }

    try {
      const clients = await getClients(searchText);
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(searchText.toLowerCase()),
      );

      setClientSuggestions(filtered);
      setShowNameSuggestions(filtered.length > 0);
    } catch (error) {
      console.error("Error searching clients:", error);
    }
  };

  // Buscar clientes por teléfono
  const searchClientsByPhone = async (searchText: string) => {
    if (searchText.trim().length < 3) {
      setClientSuggestions([]);
      setShowPhoneSuggestions(false);
      return;
    }

    try {
      const clients = await getClients(searchText);
      const cleanSearch = searchText.replace(/\s/g, "");
      const filtered = clients.filter((client) =>
        client.phone_number.replace(/\s/g, "").includes(cleanSearch),
      );

      setClientSuggestions(filtered);
      setShowPhoneSuggestions(filtered.length > 0);
    } catch (error) {
      console.error("Error searching clients:", error);
    }
  };

  // Seleccionar un cliente de las sugerencias
  const selectClient = (client: any) => {
    setFormData({
      ...formData,
      customerName: client.name,
      customerPhone: client.phone_number,
    });
    setSelectedClientId(client.id);
    setShowNameSuggestions(false);
    setShowPhoneSuggestions(false);
    setClientSuggestions([]);
  };

  return (
    <View style={styles.container}>
      <NewAppointmentHeader />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomerInfoSection
          formData={formData}
          setFormData={setFormData}
          searchClientsByName={searchClientsByName}
          searchClientsByPhone={searchClientsByPhone}
          clientSuggestions={clientSuggestions}
          showNameSuggestions={showNameSuggestions}
          showPhoneSuggestions={showPhoneSuggestions}
          selectClient={selectClient}
          setShowNameSuggestions={setShowNameSuggestions}
          setShowPhoneSuggestions={setShowPhoneSuggestions}
          selectedClientId={selectedClientId}
        />
        <ServiceInfoSection
          serviceObjects={serviceObjects}
          appointmentItems={appointmentItems}
          setAppointmentItems={setAppointmentItems}
        />
        <DateTimeSection
          formData={formData}
          setFormData={setFormData}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
        />
        <WorkerAssignmentSection
          formData={formData}
          setFormData={setFormData}
          workers={workers}
        />
        <FinancialInfoSection formData={formData} setFormData={setFormData} />
        <ActionButtons
          formData={formData}
          loading={loading}
          setLoading={setLoading}
          selectedClientId={selectedClientId}
          appointmentItems={appointmentItems}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  HEADER
// ============================================================================
function NewAppointmentHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/admin/appointments")}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Nueva Turno</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

// ============================================================================
// SECCIÓN:  INFORMACIÓN DEL CLIENTE CON AUTOCOMPLETADO
// ============================================================================
function CustomerInfoSection({
  formData,
  setFormData,
  searchClientsByName,
  searchClientsByPhone,
  clientSuggestions,
  showNameSuggestions,
  showPhoneSuggestions,
  selectClient,
  setShowNameSuggestions,
  setShowPhoneSuggestions,
  selectedClientId,
}: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👤"
        title="Información del Cliente"
        subtitle="Datos de contacto"
      />

      {selectedClientId && (
        <View style={styles.existingClientBadge}>
          <Text style={styles.existingClientText}>✓ Cliente existente</Text>
        </View>
      )}

      {/* Campo de nombre con sugerencias */}
      <View style={styles.inputWithSuggestions}>
        <Input
          label="Nombre completo *"
          placeholder="Ej: Juan Pérez"
          value={formData.customerName}
          onChangeText={(text) => {
            setFormData({ ...formData, customerName: text });
            searchClientsByName(text);
            if (selectedClientId) setShowNameSuggestions(false); // No mostrar si ya seleccionó uno
          }}
          onFocus={() => {
            if (
              formData.customerName.length >= 2 &&
              clientSuggestions.length > 0
            ) {
              setShowNameSuggestions(true);
            }
          }}
        />

        <ClientSuggestionsList
          suggestions={clientSuggestions}
          show={showNameSuggestions}
          onSelect={selectClient}
          onClose={() => setShowNameSuggestions(false)}
        />
      </View>

      {/* Campo de teléfono con sugerencias */}
      <View style={styles.inputWithSuggestions}>
        <Input
          label="Teléfono *"
          placeholder="Ej: 351 234 5678"
          value={formData.customerPhone}
          onChangeText={(text) => {
            setFormData({ ...formData, customerPhone: text });
            searchClientsByPhone(text);
            if (selectedClientId) setShowPhoneSuggestions(false);
          }}
          keyboardType="phone-pad"
          onFocus={() => {
            if (
              formData.customerPhone.length >= 3 &&
              clientSuggestions.length > 0
            ) {
              setShowPhoneSuggestions(true);
            }
          }}
        />
        <ClientSuggestionsList
          suggestions={clientSuggestions}
          show={showPhoneSuggestions}
          onSelect={selectClient}
          onClose={() => setShowPhoneSuggestions(false)}
        />
      </View>

      <Input
        label="Dirección"
        placeholder="Ej:  Av. Colón 123"
        value={formData.customerAddress}
        onChangeText={(text) =>
          setFormData({ ...formData, customerAddress: text })
        }
        multiline
      />
    </View>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: CLIENT SUGGESTIONS LIST
// ============================================================================
function ClientSuggestionsList({
  suggestions,
  show,
  onSelect,
  onClose,
}: {
  suggestions: any[];
  show: boolean;
  onSelect: (client: any) => void;
  onClose: () => void;
}) {
  if (!show || suggestions.length === 0) return null;

  return (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Clientes encontrados:</Text>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionName}>{item.name}</Text>
              <Text style={styles.suggestionPhone}>{item.phone_number}</Text>
              {item.last_appointment_at && (
                <Text style={styles.suggestionDate}>
                  Última turno:{" "}
                  {new Date(item.last_appointment_at).toLocaleDateString(
                    "es-AR",
                  )}
                </Text>
              )}
            </View>
            <Text style={styles.suggestionArrow}>→</Text>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// SECCIÓN: INFORMACIÓN DEL SERVICIO
// ============================================================================
function ServiceInfoSection({
  serviceObjects,
  appointmentItems,
  setAppointmentItems,
}: {
  serviceObjects: ServiceObjectWithCombos[];
  appointmentItems: AppointmentItem[];
  setAppointmentItems: (items: AppointmentItem[]) => void;
}) {
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);

  const selectedObject = serviceObjects.find((o) => o.id === selectedObjectId);

  const isObjectInItems = (objectId: number) =>
    appointmentItems.some((i) => i.service_object_id === objectId);

  const addItem = (objectId: number, comboId: number | null = null) => {
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
    setAppointmentItems(appointmentItems.filter((_, i) => i !== index));
  };

  const updateItemDetalle = (index: number, detalle: string) => {
    const updated = [...appointmentItems];
    updated[index] = { ...updated[index], description: detalle || null };
    setAppointmentItems(updated);
  };

  const getObjectLabel = (objectId: number) =>
    serviceObjects.find((o) => o.id === objectId)?.objeto ?? "Objeto";

  const getComboLabel = (objectId: number, comboId: number | null) => {
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
            const objectLabel = getObjectLabel(item.service_object_id);
            const comboLabel = getComboLabel(
              item.service_object_id,
              item.service_combo_id,
            );
            return (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <View style={styles.itemCardTitles}>
                    <Text style={styles.itemCardObject}>{objectLabel}</Text>
                    {comboLabel && (
                      <Text style={styles.itemCardCombo}>{comboLabel}</Text>
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
                  onChangeText={(text) => updateItemDetalle(index, text)}
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
                    {getServiceIcon(obj.objeto)}
                  </Text>
                  <Text
                    style={[
                      styles.objectCardName,
                      alreadyAdded && styles.objectCardNameAdded,
                    ]}
                  >
                    {obj.objeto}
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
              {selectedObject?.objeto} — elegí una opción
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
                  <Text style={styles.comboItemName}>{combo.name}</Text>
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
              <Text style={styles.comboItemName}>Sin combo / precio libre</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}


// ============================================================================
// SECCIÓN:  FECHA Y HORA
// ============================================================================
function DateTimeSection({
  formData,
  setFormData,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
}: any) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const durations = [
    { value: "30", label: "30 min" },
    { value: "60", label: "1 hora" },
    { value: "90", label: "1.5 horas" },
    { value: "120", label: "2 horas" },
    { value: "180", label: "3 horas" },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="📅"
        title="Fecha y Hora"
        subtitle="Cuándo se realizará el servicio"
      />

      <Text style={styles.label}>Fecha *</Text>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateTimeIcon}>📅</Text>
        <Text style={styles.dateTimeText}>{formatDate(formData.date)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event,selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) {
              setFormData({ ...formData, date: selectedDate });
            }
          }}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Hora *</Text>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateTimeIcon}>🕐</Text>
        <Text style={styles.dateTimeText}>{formatTime(formData.time)}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={formData.time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selectedTime) => {
            setShowTimePicker(Platform.OS === "ios");
            if (selectedTime) {
              setFormData({ ...formData, time: selectedTime });
            }
          }}
        />
      )}

      <Text style={styles.label}>Duración estimada *</Text>
      <View style={styles.durationGrid}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration.value}
            style={[
              styles.durationChip,
              formData.estimateTime === duration.value &&
                styles.durationChipSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, estimateTime: duration.value })
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationChipText,
                formData.estimateTime === duration.value &&
                  styles.durationChipTextSelected,
              ]}
            >
              {duration.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN: ASIGNACIÓN DE TRABAJADOR
// ============================================================================
function WorkerAssignmentSection({ formData, setFormData, workers }: any) {
  const handleSelectWorker = (worker: any) => {
    setFormData({
      ...formData,
      workerId: worker.id,
      commissionRate: worker.commission_rate.toString(),
    });
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        icon="👥"
        title="Asignar Trabajador"
        subtitle="Selecciona quién realizará el servicio"
      />

      <View style={styles.workersGrid}>
        {workers && workers.length > 0 ? (
          workers.map((worker: any) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              selected={formData.workerId === worker.id}
              onSelect={() => handleSelectWorker(worker)}
            />
          ))
        ) : (
          <Text style={styles.helperText}>Cargando trabajadores...</Text>
        )}
      </View>

      {!formData.workerId && (
        <Text style={styles.helperText}>
          💡 Tip: Al seleccionar un trabajador, se aplicará su comisión por
          defecto
        </Text>
      )}
    </View>
  );
}

function WorkerCard({ worker, selected, onSelect }: any) {
  // Determinar avatar según el nombre
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
    <TouchableOpacity
      style={[styles.workerCard, selected && styles.workerCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.workerCardAvatar}>
        {getAvatar(worker.profile.name)}
      </Text>
      <View style={styles.workerCardInfo}>
        <Text
          style={[
            styles.workerCardName,
            selected && styles.workerCardNameSelected,
          ]}
        >
          {worker.profile.name}
        </Text>
        <Text style={styles.workerCardCommission}>
          Comisión: {worker.commission_rate}%
        </Text>
      </View>
      {selected && (
        <View style={styles.workerCardCheck}>
          <Text style={styles.workerCardCheckIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// INFORMACIÓN FINANCIERA
// ============================================================================
function FinancialInfoSection({ formData, setFormData }: any) {
  return (
    <View style={styles.section}>
      <SectionHeader
        icon="💰"
        title="Información Financiera"
        subtitle="Monto y comisión"
      />

      <Input
        label="Monto a cobrar al cliente *"
        placeholder="$0" // COPILOT, AQUI¡¡ quiero que este sea la suma de los costps de los combos en el ( en el caso que se hayya alejido en un como)
        value={formData.cost}
        onChangeText={(text) => setFormData({ ...formData, cost: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Comisión del trabajador (%)</Text>
      <View style={styles.commissionInputContainer}>
        <TextInput
          style={styles.commissionInput}
          value={formData.commissionRate}
          onChangeText={(text) =>
            setFormData({ ...formData, commissionRate: text })
          }
          keyboardType="numeric"
          maxLength={5}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.commissionPercent}>%</Text>
      </View>

      {formData.cost && formData.commissionRate && (
        <View style={styles.calculationBox}>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Monto total: </Text>
            <Text style={styles.calculationValue}>
              ${parseFloat(formData.cost || "0").toLocaleString("es-AR")}
            </Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>
              Trabajador recibe ({formData.commissionRate}%):
            </Text>
            <Text style={styles.calculationValueHighlight}>
              ${calculateWorkerAmount(formData.cost, formData.commissionRate)}
            </Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Negocio recibe:</Text>
            <Text style={styles.calculationValue}>
              ${calculateBusinessAmount(formData.cost, formData.commissionRate)}
            </Text>
          </View>
        </View>
      )}

      {!formData.commissionRate && formData.workerId && (
        <Text style={styles.warningText}>
          ⚠️ No olvides configurar la comisión del trabajador
        </Text>
      )}
    </View>
  );
}

function calculateWorkerAmount(totalAmount: string, commissionRate: string) {
  const amount = parseFloat(totalAmount) || 0;
  const rate = parseFloat(commissionRate) || 0;
  const workerAmount = (amount * rate) / 100;
  return workerAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function calculateBusinessAmount(totalAmount: string, commissionRate: string) {
  const amount = parseFloat(totalAmount) || 0;
  const rate = parseFloat(commissionRate) || 0;
  const businessAmount = amount - (amount * rate) / 100;
  return businessAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ============================================================================
// SECCIÓN: BOTONES DE ACCIÓN
// ============================================================================
function ActionButtons({
  formData,
  loading,
  setLoading,
  selectedClientId,
  appointmentItems
}: any) {
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      Alert.alert("Error", "El nombre del cliente es requerido");
      return false;
    }
    if (!formData.customerPhone.trim()) {
      Alert.alert("Error", "El teléfono del cliente es requerido");
      return false;
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      Alert.alert("Error", "El monto debe ser mayor a 0");
      return false;
    }
    //TODO: esto pedirlo al marcar como completado
    // if (!formData.workerId) {
    //   Alert.alert("Error", "Debes asignar un trabajador");
    //   return false;
    // }
    if (appointmentItems.length === 0) {
  Alert.alert("Error", "Debes agregar al menos un servicio");
  return false;
}

    return true;
  };

  const resolveClientId = async () => {
    try {
      // Si ya seleccionó un cliente existente, retornar ese ID
      if (selectedClientId) {
        return selectedClientId;
      }

      const client = await findOrCreateClientInDb({
        name: formData.customerName,
        phone_number: formData.customerPhone,
      });

      return client.id;
    } catch (error) {
      console.error("Error in findOrCreateClient:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const clientId = await resolveClientId();
      const profile = await getCurrentProfile();

      const combinedDate = new Date(formData.date);
      combinedDate.setHours(formData.time.getHours());
      combinedDate.setMinutes(formData.time.getMinutes());
      combinedDate.setSeconds(0);

      await createAppointment({
        admin_id: profile?.id,
        worker_id: parseInt(formData.workerId, 10),
        client_id: clientId,
        address: formData.customerAddress || null,
        date: combinedDate.toISOString(),
        estimate_time: parseInt(formData.estimateTime, 10),
        cost: parseFloat(formData.cost),
        commission_rate: parseFloat(formData.commissionRate) || 0,
        notes: formData.observaciones || null,
        payment_method: null,
        items: appointmentItems,
      });

      Alert.alert("¡Éxito!", "El turno ha sido creada correctamente", [
        {
          text: "Ver turnos",
          onPress: () => router.replace("/admin/appointments"),
        },
      ]);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      Alert.alert("Error", "No se pudo crear el turno");
      setLoading(false);
    }
  };

  return (
    <View style={styles.actionsSection}>
      <Button title="Crear Turno" onPress={handleSave} loading={loading} />

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR:  SECTION HEADER
// ============================================================================
function SectionHeader({ icon, title, subtitle }: any) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionHeaderIcon}>{icon}</Text>
        <View>
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSpacer: {
    width: 60,
  },

  // Section
  section: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Existing Client Badge
  existingClientBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  existingClientText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  // Input with Suggestions
  inputWithSuggestions: {
    position: "relative",
    zIndex: 1,
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  suggestionPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  suggestionDate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  suggestionArrow: {
    fontSize: 20,
    color: "#3B82F6",
    marginLeft: 8,
  },
  closeButton: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  closeButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  // Label
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },

  // Service Grid
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  serviceCard: {
    width: "31%",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  serviceCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  serviceCardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  serviceCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  serviceCardNameSelected: {
    color: "#3B82F6",
  },

  // DateTime
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateTimeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#111827",
    textTransform: "capitalize",
  },

  // Duration
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  durationChipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  durationChipTextSelected: {
    color: "#FFFFFF",
  },

  // Workers Grid
  workersGrid: {
    gap: 12,
  },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    position: "relative",
  },
  workerCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  workerCardAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  workerCardInfo: {
    flex: 1,
  },
  workerCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  workerCardNameSelected: {
    color: "#3B82F6",
  },
  workerCardCommission: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500",
  },
  workerCardCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  workerCardCheckIcon: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Commission
  commissionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  commissionInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 12,
  },
  commissionPercent: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  calculationBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: "#166534",
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  calculationValueHighlight: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
  },
  warningText: {
    fontSize: 13,
    color: "#F59E0B",
    marginTop: 8,
    fontStyle: "italic",
  },

  // Helper Text
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },

  // Actions
  actionsSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 32,
  },
  cancelButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },

  // Items agregados
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
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 8,
  },
  itemCardTitles: {
    flex: 1,
  },
  itemCardObject: {
    fontSize: 15,
    fontWeight: "600" as const,
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
    fontWeight: "600" as const,
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

  // Grid de objetos
  objectGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
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
    alignItems: "center" as const,
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
    fontWeight: "600" as const,
    color: "#6B7280",
    textAlign: "center" as const,
  },
  objectCardNameAdded: {
    color: "#065F46",
  },
  objectCardCheck: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 2,
    fontWeight: "bold" as const,
  },

  // Selector de combos
  comboHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    gap: 12,
  },
  comboBack: {
    padding: 4,
  },
  comboBackText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600" as const,
  },
  comboTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
    flex: 1,
  },
  comboList: {
    gap: 8,
    marginBottom: 16,
  },
  comboItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
  },
  comboItemFree: {
    borderStyle: "dashed" as const,
    borderColor: "#D1D5DB",
  },
  comboItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  comboItemName: {
    fontSize: 15,
    fontWeight: "600" as const,
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
    fontWeight: "bold" as const,
    color: "#10B981",
  },
});
