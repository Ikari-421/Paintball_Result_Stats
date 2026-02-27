import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Colors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push("/menu");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons
          name="basketball-outline"
          size={80}
          color={Colors.primary}
          style={styles.icon}
        />
        <Text style={styles.title}>ScoreBoard</Text>
        <Text style={styles.subtitle}>The ultimate game manager.</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Get Started" onPress={handleGetStarted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.8,
    textAlign: "center",
  },
  footer: {
    width: "100%",
    paddingBottom: Spacing.xxl,
  },
});
