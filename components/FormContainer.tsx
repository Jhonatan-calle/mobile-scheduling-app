import { View, StyleSheet, ViewProps } from "react-native";

interface FormContainerProps extends ViewProps {
  children: React.ReactNode;
}

export default function FormContainer({ 
  children, 
  style,
  ...props 
}: FormContainerProps) {
  return (
    <View style={[styles.formContainer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
