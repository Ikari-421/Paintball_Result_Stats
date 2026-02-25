import { ThemedText } from "@/components/themed-text";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBackButton = true,
  onBack,
  rightComponent,
}: ScreenHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ThemedText style={styles.backText}>←</ThemedText>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>

      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  placeholder: {
    width: 34,
  },
});
