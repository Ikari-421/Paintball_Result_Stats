import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function MenuScreen() {
  return (
    <ScreenContainer>
      <ThemedText type="title" style={styles.menuText}>
        Menu Principal
      </ThemedText>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.buttonsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Configuration
        </ThemedText>

        <AppButton
          title="Équipes"
          onPress={() => router.push("/teams-list")}
          variant="secondary"
        />
        <AppButton
          title="Terrains"
          onPress={() => router.push("/fields-list")}
          variant="secondary"
        />
        <AppButton
          title="Modes de Jeu"
          onPress={() => router.push("/game-mods")}
          variant="secondary"
        />

        <ThemedText
          type="subtitle"
          style={[styles.sectionTitle, { marginTop: 24 }]}
        >
          Autres
        </ThemedText>

        <AppButton
          title="Historique"
          onPress={() => router.push("/history")}
          variant="secondary"
        />
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Mon Profil"
          onPress={() => router.push("/profile")}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: AppSpacing.sm,
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
