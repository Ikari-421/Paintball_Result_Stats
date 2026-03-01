import {
    BorderRadius,
    Colors,
    Shadows,
    Spacing,
    Typography,
} from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TournamentCardProps {
    tournament: {
        id: string;
        name: string;
        location: string;
        startDate: Date;
    };
    iconColor: string;
    onPress: () => void;
}

export const TournamentCard = ({ tournament, iconColor, onPress }: TournamentCardProps) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color: iconColor }]}>🏆</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{tournament.name}</Text>
                <Text style={styles.status}>
                    {tournament.location} • {tournament.startDate.toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.chevronContainer}>
                <Text style={styles.chevronIcon}>›</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.lg,
        ...Shadows.card,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        fontSize: 32,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    status: {
        ...Typography.small,
        color: Colors.text,
        opacity: 0.7,
    },
    chevronContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
    chevronIcon: {
        fontSize: 24,
        color: Colors.primary,
    },
});
