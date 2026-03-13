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
          title="Tournaments"
          subtitle="Manage active tournaments and fields"
          icon="🏆"
          iconColor={Colors.primary}
          onPress={() => router.push("/tournament/tournaments-list" as any)}
        />
        <MenuCard
          title="Teams"
          subtitle="Manage roster and guest teams"
          icon="👥"
          iconColor={Colors.accent}
          onPress={() => router.push("/team/teams-list")}
        />

        <MenuCard
          title="Game Modes"
          subtitle="Configure match rules & timers"
          icon="⚙️"
          iconColor={Colors.primary}
          onPress={() => router.push("/gamemode/game-modes-list")}
        />

        <MenuCard
          title="Past Tournaments"
          subtitle="View past tournament results"
          icon="📜"
          iconColor="#ccc"
          onPress={() => { }}
          disabled
        />
      </ScrollView>


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
    paddingBottom: Spacing.xxxl,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
