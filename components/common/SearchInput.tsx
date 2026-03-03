import { BorderRadius, Colors, Shadows, Spacing } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

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
      <FontAwesome5 name="search" size={18} color={Colors.primary} style={styles.icon} />
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
