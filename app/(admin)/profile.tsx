import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../utils/supabase";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ProfileHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileInfoSection />
        <SettingsSection />
        <AboutSection />
        <DangerZoneSection />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// SECCIÓN: HEADER
// ============================================================================
function ProfileHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>👨‍💼</Text>
      </View>
      <Text style={styles.headerName}>Administrador</Text>
      <Text style={styles.headerEmail}>admin@tapizados.com</Text>
    </View>
  );
}

// ============================================================================
// SECCIÓN: INFORMACIÓN DEL PERFIL
// ============================================================================
function ProfileInfoSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información</Text>

      <ProfileMenuItem
        icon="👤"
        label="Editar perfil"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />

      <ProfileMenuItem
        icon="🔔"
        label="Notificaciones"
        badge="3"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />

      <ProfileMenuItem
        icon="🔐"
        label="Cambiar contraseña"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: CONFIGURACIÓN
// ============================================================================
function SettingsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Configuración</Text>

      <ProfileMenuItem
        icon="💼"
        label="Información del negocio"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />

      <ProfileMenuItem
        icon="📊"
        label="Reportes y estadísticas"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />

      <ProfileMenuItem
        icon="⚙️"
        label="Configuración general"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />
    </View>
  );
}

// ============================================================================
// SECCIÓN: ACERCA DE
// ============================================================================
function AboutSection() {
  return (
    <View style={styles.section}>
      <Text style={styles. sectionTitle}>Acerca de</Text>

      <ProfileMenuItem
        icon="ℹ️"
        label="Ayuda y soporte"
        onPress={() => Alert.alert("Soporte", "Contacta con nosotros en soporte@tapizados.com")}
      />

      <ProfileMenuItem
        icon="📄"
        label="Términos y condiciones"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />

      <ProfileMenuItem
        icon="🔒"
        label="Política de privacidad"
        onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
      />

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </View>
    </View>
  );
}

// ============================================================================
// SECCIÓN:  ZONA PELIGROSA
// ============================================================================
function DangerZoneSection() {
  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que deseas cerrar sesión? ",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style:  "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPONENTE: MENU ITEM
// ============================================================================
function ProfileMenuItem({ icon, label, badge, onPress }: any) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuItemIcon}>{icon}</Text>
        <Text style={styles.menuItemLabel}>{label}</Text>
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
  avatar:  {
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
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection:  "row",
    alignItems:  "center",
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: "#111827",
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
});
