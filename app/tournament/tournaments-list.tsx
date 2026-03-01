import { EmptyState } from "@/components/common/EmptyState";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { Colors, Spacing } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function TournamentsListScreen() {
    const router = useRouter();
    const { tournaments, loadTournaments, isLoading } = useCoreStore();

    useEffect(() => {
        loadTournaments();
    }, []);

    const getIconColor = (index: number) => {
        return index % 2 === 0 ? Colors.accent : Colors.secondary;
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Tournaments" onBack={() => router.push("/menu")} />

            <ScrollView style={styles.content}>
                {tournaments.map((tournament, index) => (
                    <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        iconColor={getIconColor(index)}
                        onPress={() => router.push(`/tournament/${tournament.id}` as any)}
                    />
                ))}

                {tournaments.length === 0 && !isLoading && (
                    <EmptyState message="No tournaments available" />
                )}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="+ Create New Tournament"
                    onPress={() => router.push("/tournament/create-tournament" as any)}
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
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
});
