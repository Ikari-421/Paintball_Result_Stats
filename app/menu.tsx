import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function MenuScreen() {
  const handleNavigateToFieldsList = () => {
    router.push("/fields-list");
  };

  const handleNavigateToCreateField = () => {
    router.push("/create-field");
  };

  const handleNavigateToGameMods = () => {
    router.push("/game-mods");
  };

  const handleNavigateToHistory = () => {
    router.push("/history");
  };

  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  return (
    <ScreenContainer>
      <ThemedText type="title" style={styles.menuText}>
        Menu
      </ThemedText>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.buttonsContainer}>
        <AppButton
          title="Fields List"
          onPress={handleNavigateToFieldsList}
          variant="secondary"
        />
        <AppButton
          title="Create Field"
          onPress={handleNavigateToCreateField}
          variant="secondary"
        />
        <AppButton
          title="Game Mods"
          onPress={handleNavigateToGameMods}
          variant="secondary"
        />
        <AppButton
          title="History"
          onPress={handleNavigateToHistory}
          variant="secondary"
        />
      </View>

      <View style={styles.footer}>
        <AppButton
          title="My profile"
          onPress={handleNavigateToProfile}
          variant="accent"
          style={styles.profileButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  menuText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: AppSpacing.xl,
    marginTop: AppSpacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: AppSpacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: "#A1CEDC",
    borderRadius: AppBorderRadius.lg,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: AppSpacing.lg,
    paddingHorizontal: AppSpacing.xl,
  },
  footer: {
    marginTop: AppSpacing.xl,
    alignItems: "center",
    paddingHorizontal: AppSpacing.xl,
  },
  profileButton: {
    paddingVertical: 12,
    paddingHorizontal: AppSpacing.xxl,
  },
});
