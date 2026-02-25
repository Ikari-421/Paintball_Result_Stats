import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { AppColors } from "@/constants/AppColors";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const handleNavigateToMenu = () => {
    router.push("/menu");
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.welcomeText}>
          Welcome
        </ThemedText>

        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={handleNavigateToMenu}>
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.basicLink}>Basic link</ThemedText>
          <TouchableOpacity onPress={handleNavigateToMenu}>
            <ThemedText style={styles.credentialsLink}>
              Divers credentials
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: AppSpacing.huge,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: AppSpacing.xxxl,
  },
  logo: {
    width: 200,
    height: 200,
    backgroundColor: AppColors.primary,
    borderRadius: AppBorderRadius.lg,
  },
  footer: {
    alignItems: "center",
    gap: AppSpacing.md,
  },
  basicLink: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  credentialsLink: {
    fontSize: 16,
    color: AppColors.link,
    textDecorationLine: "underline",
  },
});
