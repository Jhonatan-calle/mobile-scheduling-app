import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet,
  TextInputProps 
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
}

export default function Input({ 
  label, 
  style,
  ... textInputProps 
}: InputProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          style
        ]}
        placeholderTextColor="#9CA3AF"
        {... textInputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input:  {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
  }
});
