import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../../utils/supabase";
import { useState, useEffect } from "react";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "WORKER";
  hasWorkerProfile?: boolean;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [addProfileModalVisible, setAddProfileModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Mock data - reemplazar con la llamada real a Supabase
      const mockProfile: Profile = {
        id: "1",
        name: "Administrador",
        email: "admin@tapizados.com",
        role: "ADMIN",
        hasWorkerProfile: true, // Verificar si también existe en la tabla workers
      };

      // Implementación real (descomentar cuando esté listo):
      /*
      const { data:  { user } } = await supabase. auth.getUser();
      
      if (! user) {
        router.replace("/(auth)/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Verificar si también es worker
      const { data: workerData } = await supabase
        . from("workers")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      setProfile({
        ... profileData,
        hasWorkerProfile: !!workerData,
      });
      */

      setProfile(mockProfile);
      setNewName(mockProfile.name);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleEditName = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    try {
      // Mock - reemplazar con la llamada real
      /*
      const { data:  { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ name: newName. trim() })
        .eq("id", user.id);

      if (error) throw error;
      */

      setProfile((prev) => (prev ? { ...prev, name: newName.trim() } : null));
      setEditNameModalVisible(false);
      Alert.alert("Éxito", "Nombre actualizado correctamente");
    } catch (error) {
      console.error("Error updating name:", error);
      Alert.alert("Error", "No se pudo actualizar el nombre");
    }
  };

  const handleSwitchToWorker = () => {
    Alert.alert(
      "Cambiar a vista de trabajador",
      "¿Deseas cambiar a tu perfil de trabajador?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cambiar",
          onPress: () => {
            router.replace("/worker");
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileHeader profile={profile} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileInfoSection
          profile={profile}
          onEditName={() => setEditNameModalVisible(true)}
          onSwitchToWorker={handleSwitchToWorker}
        />
        <ManagementSection
          onAddProfile={() => setAddProfileModalVisible(true)}
        />
        <DangerZoneSection onLogout={handleLogout} />
      </ScrollView>

      {/* Modal para editar nombre */}
      <EditNameModal
        visible={editNameModalVisible}
        name={newName}
        onChangeName={setNewName}
        onSave={handleEditName}
        onCancel={() => {
          setEditNameModalVisible(false);
          setNewName(profile.name);
        }}
      />

      {/* Modal para agregar perfil */}
      <AddProfileModal
        visible={addProfileModalVisible}
        onClose={() => setAddProfileModalVisible(false)}
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN:  HEADER
// ============================================================================
function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>
          {profile.role === "ADMIN" ? "👨‍💼" : "👷"}
        </Text>
      </View>
      <Text style={styles.headerName}>{profile.name}</Text>
      <Text style={styles.headerEmail}>{profile.email}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>
          {profile.role === "ADMIN" ? "Administrador" : "Trabajador"}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  INFORMACIÓN DEL PERFIL
// ============================================================================
function ProfileInfoSection({
  profile,
  onEditName,
  onSwitchToWorker,
}: {
  profile: Profile;
  onEditName: () => void;
  onSwitchToWorker: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mi Perfil</Text>

      <ProfileMenuItem icon="✏️" label="Editar nombre" onPress={onEditName} />

      {profile.hasWorkerProfile && profile.role === "ADMIN" && (
        <ProfileMenuItem
          icon="🔄"
          label="Cambiar a vista de trabajador"
          onPress={onSwitchToWorker}
        />
      )}
    </View>
  );
}

// ============================================================================
// SECCIÓN: GESTIÓN
// ============================================================================
function ManagementSection({ onAddProfile }: { onAddProfile: () => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>

      <ProfileMenuItem
        icon="➕"
        label="Agregar nuevo perfil"
        subtitle="Crear admin o trabajador"
        onPress={onAddProfile}
      />

      <ProfileMenuItem
        icon="👥"
        label="Ver todos los perfiles"
        onPress={() => router.push("/admin/profiles")}
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN:  ZONA PELIGROSA
// ============================================================================
function DangerZoneSection({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
      <View style={styles.versionContainer}>
        {/* TODO: Obtener versión dinámica */}
        <Text style={styles.versionText}>Versión 1.0.0</Text>
        versión dinámica
      </View>
    </View>
  );
}

// ============================================================================
// COMPONENTE: MENU ITEM
// ============================================================================
function ProfileMenuItem({
  icon,
  label,
  subtitle,
  badge,
  onPress,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuItemIcon}>{icon}</Text>
        <View style={styles.menuItemTextContainer}>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={styles.menuItemArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// MODAL: EDITAR NOMBRE
// ============================================================================
function EditNameModal({
  visible,
  name,
  onChangeName,
  onSave,
  onCancel,
}: {
  visible: boolean;
  name: string;
  onChangeName: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Nombre</Text>

          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={onChangeName}
            placeholder="Ingresa tu nombre"
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onCancel}
            >
              <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={onSave}
            >
              <Text style={styles.modalButtonTextSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// MODAL: AGREGAR PERFIL
// ============================================================================
function AddProfileModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [profileType, setProfileType] = useState<"ADMIN" | "WORKER">("WORKER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commissionRate, setCommissionRate] = useState("60");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      // Mock - reemplazar con la llamada real
      /*
      // 1. Crear usuario en auth
      const { data: authData, error:  authError } = await supabase. auth.admin.createUser({
        email: email. trim(),
        email_confirm:  true,
        user_metadata: {
          name:  name.trim(),
        },
      });

      if (authError) throw authError;

      // 2. Crear perfil
      const { error:  profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          name: name.trim(),
        });

      if (profileError) throw profileError;

      // 3. Si es ADMIN, crear en tabla admins
      if (profileType === 'ADMIN') {
        const { error: adminError } = await supabase
          .from("admins")
          .insert({
            id: authData.user.id,
          });

        if (adminError) throw adminError;
      }

      // 4. Si es WORKER, crear en tabla workers
      if (profileType === 'WORKER') {
        const { error: workerError } = await supabase
          .from("workers")
          .insert({
            profile_id: authData.user. id,
            commission_rate:  parseFloat(commissionRate),
          });

        if (workerError) throw workerError;
      }
      */

      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        "Éxito",
        `${profileType === "ADMIN" ? "Administrador" : "Trabajador"} creado correctamente`,
      );

      setName("");
      setEmail("");
      setCommissionRate("60");
      onClose();
    } catch (error) {
      console.error("Error creating profile:", error);
      Alert.alert("Error", "No se pudo crear el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentLarge}>
          <Text style={styles.modalTitle}>Nuevo Perfil</Text>

          {/* Selector de tipo */}
          <View style={styles.profileTypeContainer}>
            <TouchableOpacity
              style={[
                styles.profileTypeButton,
                profileType === "WORKER" && styles.profileTypeButtonActive,
              ]}
              onPress={() => setProfileType("WORKER")}
            >
              <Text
                style={[
                  styles.profileTypeButtonText,
                  profileType === "WORKER" &&
                    styles.profileTypeButtonTextActive,
                ]}
              >
                👷 Trabajador
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.profileTypeButton,
                profileType === "ADMIN" && styles.profileTypeButtonActive,
              ]}
              onPress={() => setProfileType("ADMIN")}
            >
              <Text
                style={[
                  styles.profileTypeButtonText,
                  profileType === "ADMIN" && styles.profileTypeButtonTextActive,
                ]}
              >
                👨‍💼 Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={setName}
            placeholder="Nombre completo"
          />

          <TextInput
            style={styles.modalInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {profileType === "WORKER" && (
            <View>
              <Text style={styles.inputLabel}>Comisión (%)</Text>
              <TextInput
                style={styles.modalInput}
                value={commissionRate}
                onChangeText={setCommissionRate}
                placeholder="60"
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Botones */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonTextSave}>Crear</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Header
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },

  // Section
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },

  // Menu Item
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    color: "#111827",
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  menuItemArrow: {
    fontSize: 24,
    color: "#D1D5DB",
  },

  // Version
  versionContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  versionText: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalContentLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonSave: {
    backgroundColor: "#3B82F6",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Profile Type Selector
  profileTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  profileTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  profileTypeButtonActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  profileTypeButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
  profileTypeButtonTextActive: {
    color: "#1E40AF",
    fontWeight: "600",
  },
});
