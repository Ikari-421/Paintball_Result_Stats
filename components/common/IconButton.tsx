import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface IconButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton = ({ 
  title, 
  icon, 
  onPress, 
  variant = 'primary',
  disabled, 
  style 
}: IconButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'accent':
        return styles.buttonAccent;
      case 'outline':
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.text;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonAccent: {
    backgroundColor: Colors.accent,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    ...Typography.subtitle,
    color: Colors.white,
  },
  textOutline: {
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
