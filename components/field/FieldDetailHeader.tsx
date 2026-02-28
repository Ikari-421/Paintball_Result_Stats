import { Colors, Spacing, Typography } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FieldDetailHeaderProps {
  fieldName: string;
  matchupsCount: number;
  onBack: () => void;
}

export const FieldDetailHeader = ({
  fieldName,
  matchupsCount,
  onBack,
}: FieldDetailHeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{fieldName}</Text>
        <Text style={styles.subtitle}>
          {matchupsCount} MatchUp{matchupsCount !== 1 ? "s" : ""} Scheduled
        </Text>
      </View>
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
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    ...Typography.title,
    color: Colors.primary,
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.secondary,
  },
});
