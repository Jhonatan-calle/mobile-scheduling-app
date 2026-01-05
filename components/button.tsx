import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps 
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({ 
  title, 
  loading = false,
  variant = "primary",
  style,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        styles[variant],
        (loading || disabled) && styles.buttonDisabled,
        style
      ]}
      disabled={loading || disabled}
      activeOpacity={0.8}
      {... props}
    >
      {loading ?  (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.buttonText, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primary: {
    backgroundColor: "#3B82F6",
  },
  secondary: {
    backgroundColor: "#6B7280",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  buttonDisabled: {
    backgroundColor: "#93C5FD",
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#3B82F6",
  },
});
