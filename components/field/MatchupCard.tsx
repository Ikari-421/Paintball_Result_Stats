import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface MatchupCardProps {
  teamAName: string;
  teamBName: string;
  isActive?: boolean;
  onPress: () => void;
  onDelete?: () => void;
}

export const MatchupCard = ({ 
  teamAName, 
  teamBName, 
  isActive = false, 
  onPress,
  onDelete 
}: MatchupCardProps) => {
  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.teamsContainer}>
          <Text style={[styles.teamName, isActive && styles.teamNameActive]}>
            {teamAName}
          </Text>
          <View style={[styles.vsBadge, isActive && styles.vsBadgeActive]}>
            <Text style={[styles.vsText, isActive && styles.vsTextActive]}>VS</Text>
          </View>
          <Text style={[styles.teamName, isActive && styles.teamNameActive]}>
            {teamBName}
          </Text>
        </View>
        <Text style={styles.icon}>
          {isActive ? '▶️' : '🕐'}
        </Text>
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
    opacity: 0.6,
  },
  cardActive: {
    opacity: 1,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  teamsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    flex: 1,
    textAlign: 'center',
    ...Typography.subtitle,
    color: Colors.text,
  },
  teamNameActive: {
    fontWeight: '700',
  },
  vsBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
  },
  vsBadgeActive: {
    backgroundColor: Colors.background,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  vsTextActive: {
    fontSize: 14,
    fontWeight: '800',
  },
  icon: {
    fontSize: 24,
    marginLeft: Spacing.md,
  },
  deleteButton: {
    width: 50,
    height: '100%',
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 20,
  },
});
