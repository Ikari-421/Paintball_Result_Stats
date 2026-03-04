import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ScoreBoardProps {
    teamAName: string;
    teamBName: string;
    scoreA: number;
    scoreB: number;
    gameModeName?: string;
}

export const ScoreBoard = ({
    teamAName,
    teamBName,
    scoreA,
    scoreB,
    gameModeName,
}: ScoreBoardProps) => {
    return (
        <View style={styles.scoreContainer}>
            <View style={styles.scoreMainRow}>
                <View style={styles.teamScore}>
                    <Text style={styles.teamName}>{teamAName}</Text>
                    <Text style={styles.scoreText}>{scoreA}</Text>
                </View>

                <View style={styles.centerScoreInfo}>
                    <View style={styles.vsBadge}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                </View>

                <View style={styles.teamScore}>
                    <Text style={styles.teamName}>{teamBName}</Text>
                    <Text style={styles.scoreText}>{scoreB}</Text>
                </View>
            </View>
            {gameModeName && (
                <Text style={[styles.gameModeTextInline, { color: "#95cbbc" }]}>
                    {gameModeName}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    scoreContainer: {
        padding: 16,
        paddingTop: 0,
    },
    scoreMainRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    teamScore: {
        flex: 1,
        alignItems: "center",
    },
    teamName: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.white,
        marginBottom: 4,
        opacity: 0.9,
        textAlign: "center",
    },
    scoreText: {
        fontSize: 54,
        fontWeight: "800",
        color: Colors.white,
        fontVariant: ["tabular-nums"],
    },
    centerScoreInfo: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        marginTop: 12,
    },
    vsBadge: {
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    vsText: {
        color: "#000",
        fontWeight: "800",
        fontSize: 14,
        fontStyle: "italic",
    },
    gameModeTextInline: {
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});
