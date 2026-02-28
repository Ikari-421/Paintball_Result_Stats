import { BorderRadius, Colors, Shadows, Spacing } from "@/constants/theme";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: Spacing.xl,
  },
  icon: {
    position: "absolute",
    left: 14,
    top: 14,
    fontSize: 20,
    color: Colors.primary,
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingLeft: 44,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
});
