import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  disabled?: boolean;
}

export const MenuCard = ({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  disabled,
}: MenuCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: Colors.background }]}
      >
        <Text style={[styles.icon, { color: disabled ? "#ccc" : iconColor }]}>
          {icon}
        </Text>
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    ...Shadows.card,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.subtitle,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.small,
    color: Colors.text,
    opacity: 0.7,
  },
});
