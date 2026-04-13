import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { createExpense } from "../../../../utils/adminData";
import { EXPENSE_CATEGORIES } from "../../../../utils/lookups";

const CATEGORIES = Object.entries(EXPENSE_CATEGORIES).map(([id, config]) => ({
  id,
  ...config,
}));

export default function NewExpenseScreen() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validaciones
    if (!category) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }

    if (!description. trim()) {
      Alert.alert("Error", "Ingresa una descripción");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }

    try {
      setSaving(true);
      await createExpense({
        category,
        description: description.trim(),
        amount: parseFloat(amount),
        date: new Date().toISOString(),
      });

      Alert.alert("Éxito", "Gasto registrado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving expense:", error);
      Alert.alert("Error", "No se pudo guardar el gasto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <NewExpenseHeader />

      <ScrollView style={styles. content} showsVerticalScrollIndicator={false}>
        {/* Categoría */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat. id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonActive,
                  { borderColor: cat.color },
                ]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.id && { color: cat.color },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Nafta para camioneta"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Monto */}
        <View style={styles. section}>
          <Text style={styles.label}>Monto *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles. saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar Gasto"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function NewExpenseHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles. backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Nuevo Gasto</Text>
        <Text style={styles.headerSubtitle}>Registrar gasto del negocio</Text>
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
    flex:  1,
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
    height: 40,
    borderRadius: 20,
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
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Section
  section: {
    padding: 16,
    backgroundColor:  "#FFFFFF",
    marginBottom: 8,
  },
  label: {
    fontSize:  14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  // Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryButton: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    minHeight: 80,
  },

  // Amount
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  currencySymbol:  {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 16,
  },

  // Save Button
  saveButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: "center",
  },
  saveButtonDisabled:  {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
