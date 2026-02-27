import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

interface ScreenContainerProps {
  children: React.ReactNode;
}

export function ScreenContainer({ children }: ScreenContainerProps) {
  return <ThemedView style={styles.container}>{children}</ThemedView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
});
