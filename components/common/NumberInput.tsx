import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface NumberInputProps {
  label: string;
  sublabel: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isHighlighted?: boolean;
}

export const NumberInput = ({
  label,
  sublabel,
  value,
  onChangeText,
  placeholder,
  isHighlighted = false,
}: NumberInputProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sublabel}>{sublabel}</Text>
      </View>
      <TextInput
        style={[styles.input, isHighlighted && styles.inputHighlighted]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={Colors.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  sublabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    width: 80,
  },
  inputHighlighted: {
    borderColor: Colors.accent,
    color: Colors.accent,
  },
});
