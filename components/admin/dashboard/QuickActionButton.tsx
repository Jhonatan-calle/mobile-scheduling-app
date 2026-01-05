import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface QuickActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress:  () => void;
  color: string;
}

export default function QuickActionButton({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  color 
}: QuickActionButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity:  0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color:  "#111827",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize:  13,
    color: "#6B7280",
  },
  actionArrow: {
    fontSize: 24,
    color: "#D1D5DB",
  },
});
