import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View
} from "react-native";

interface SocialButtonProps extends TouchableOpacityProps {
  provider: "google";
  loading?: boolean;
}

export default function SocialButton({ 
  provider,
  loading = false,
  style,
  disabled,
  ... props 
}: SocialButtonProps) {
  
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        (loading || disabled) && styles.buttonDisabled,
        style
      ]}
      disabled={loading || disabled}
      activeOpacity={0.8}
      {... props}
    >
      {loading ? (
        <ActivityIndicator color="#1F2937" />
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔍</Text>
          </View>
          <Text style={styles. text}>
            Continuar con Google
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:  "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  icon:  {
    fontSize: 22,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
});
