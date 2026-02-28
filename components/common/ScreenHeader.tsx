import { Colors, Spacing, Typography } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const ScreenHeader = ({
  title,
  onBack,
  rightElement,
}: ScreenHeaderProps) => {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      <Text style={styles.title}>{title}</Text>
      {rightElement || <View style={{ width: 24 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: Colors.primary,
  },
  title: {
    ...Typography.title,
    color: Colors.primary,
  },
});
