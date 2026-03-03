import { BorderRadius, Colors, Shadows, Spacing } from "@/constants/theme";
import { GameMode } from "@/src/core/domain/GameMode";
import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GameModeCardProps {
  gameMode: GameMode;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const GameModeCard = ({
  gameMode,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: GameModeCardProps) => {
  const formatDetails = () => {
    const parts: string[] = [];

    parts.push(`${gameMode.gameTime.minutes}m`);
    parts.push(gameMode.raceTo.value > 0 ? `Race to ${gameMode.raceTo.value}` : `Time Limit Only`);

    return parts.join(" • ");
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onSelect}
      disabled={!onSelect}
      activeOpacity={onSelect ? 0.7 : 1}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{gameMode.name}</Text>
        <Text style={styles.details}>{formatDetails()}</Text>
      </View>

      {onSelect && (
        <FontAwesome5
          name={isSelected ? "dot-circle" : "circle"}
          size={24}
          color={isSelected ? Colors.primary : Colors.secondary}
          style={!isSelected && styles.iconUnselected}
        />
      )}

      {onEdit && (
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <FontAwesome5 name="pen" size={16} color={Colors.text} />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <FontAwesome5 name="trash" size={16} color={Colors.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    ...Shadows.card,
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  details: {
    fontSize: 14,
    color: Colors.secondary,
  },
  iconUnselected: {
    opacity: 0.3,
  },
  actionButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  actionIcon: {
    fontSize: 16,
  },
});
