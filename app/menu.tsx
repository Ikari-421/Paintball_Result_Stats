import { OutlineButton } from "@/components/common/OutlineButton";
import { MenuCard } from "@/components/menu/MenuCard";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.profileIcon}>👤</Text>
      </View>

      <ScrollView style={styles.content}>
        <MenuCard
          title="Fields List"
          subtitle="Manage and monitor active fields"
          icon="🏟️"
          iconColor={Colors.primary}
          onPress={() => router.push("/fields-list")}
        />

        <MenuCard
          title="Create Field"
          subtitle="Setup a new field with matchups"
          icon="➕"
          iconColor={Colors.secondary}
          onPress={() => router.push("/create-field")}
        />

        <MenuCard
          title="Teams"
          subtitle="Manage roster and guest teams"
          icon="👥"
          iconColor={Colors.accent}
          onPress={() => router.push("/teams-list")}
        />

        <MenuCard
          title="Game Mods"
          subtitle="Configure match rules & timers"
          icon="⚙️"
          iconColor={Colors.primary}
          onPress={() => router.push("/game-mods")}
        />

        <MenuCard
          title="History"
          subtitle="View past match results"
          icon="📜"
          iconColor="#ccc"
          onPress={() => {}}
          disabled
        />
      </ScrollView>

      <View style={styles.footer}>
        <OutlineButton
          title="My Profile"
          icon="👤"
          onPress={() => router.push("/profile")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  headerTitle: {
    ...Typography.title,
    color: Colors.primary,
  },
  profileIcon: {
    fontSize: 24,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
