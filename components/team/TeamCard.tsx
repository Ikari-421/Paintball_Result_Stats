import { Avatar } from "@/components/common/Avatar";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { getInitial } from "@/utils/avatarUtils";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TeamCardProps {
  team: { id: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  avatarColor: string;
}

export const TeamCard = ({
  team,
  isSelected,
  onSelect,
  onDelete,
  avatarColor,
}: TeamCardProps) => {
  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <TouchableOpacity style={styles.content} onPress={onSelect}>
        <Avatar initial={getInitial(team.name)} color={avatarColor} />
        <View style={styles.info}>
          <Text style={styles.name}>{team.name}</Text>
        </View>
        {isSelected && <Text style={styles.checkIcon}>✓</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.card,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.subtitle,
    color: Colors.text,
  },
  checkIcon: {
    fontSize: 24,
    color: Colors.primary,
  },
  deleteButton: {
    width: 50,
    height: "100%",
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    fontSize: 20,
  },
});
