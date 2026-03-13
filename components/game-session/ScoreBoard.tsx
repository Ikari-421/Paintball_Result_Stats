import { Colors } from "@/constants/theme";
import { GameStatus } from "@/src/core/domain/GameStatus";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ScoreBoardProps {
    teamAName: string;
    teamBName: string;
    scoreA: number;
    scoreB: number;
    gameModeName?: string;
    status?: GameStatus;
    areSidesSwapped?: boolean;
}

export const ScoreBoard = ({
    teamAName,
    teamBName,
    scoreA,
    scoreB,
    gameModeName,
    status,
    areSidesSwapped = false,
}: ScoreBoardProps) => {
    const isFinished = status === GameStatus.FINISHED;
    const leftTeamName = areSidesSwapped ? teamBName : teamAName;
    const rightTeamName = areSidesSwapped ? teamAName : teamBName;
    const leftScore = areSidesSwapped ? scoreB : scoreA;
    const rightScore = areSidesSwapped ? scoreA : scoreB;

    return (
        <View style={isFinished ? styles.finishedContainer : styles.scoreContainer}>
            {isFinished && (
                <Text style={styles.finishedLabel}>MATCH FINISHED</Text>
            )}
            <View style={styles.scoreMainRow}>
                <View style={styles.teamScore}>
                    <Text style={isFinished ? styles.teamNameDark : styles.teamName}>{leftTeamName}</Text>
                    <Text style={isFinished ? styles.scoreTextDark : styles.scoreText}>{leftScore}</Text>
                </View>

                <View style={styles.centerScoreInfo}>
                    <View style={styles.vsBadge}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                </View>

                <View style={styles.teamScore}>
                    <Text style={isFinished ? styles.teamNameDark : styles.teamName}>{rightTeamName}</Text>
                    <Text style={isFinished ? styles.scoreTextDark : styles.scoreText}>{rightScore}</Text>
                </View>
            </View>
            {gameModeName && (
                <Text style={styles.gameModeContainer}>
                    <Text style={[styles.gameModePrefix, { color: isFinished ? Colors.primary : "#95cbbc" }]}>
                        Game mode :{" "}
                    </Text>
                    <Text style={[styles.gameModeValue, { color: isFinished ? Colors.primary : "#95cbbc" }]}>
                        {gameModeName}
                    </Text>
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    scoreContainer: {
        padding: 12,
        marginTop: 8,
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
        fontSize: 72,
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
    gameModeContainer: {
        textAlign: "center",
        marginTop: 4,
    },
    gameModePrefix: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "none",
    },
    gameModeValue: {
        fontSize: 14,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    finishedContainer: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 3,
        borderColor: Colors.error,
    },
    finishedLabel: {
        color: Colors.error,
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 2,
    },
    teamNameDark: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 4,
        textAlign: "center",
    },
    scoreTextDark: {
        fontSize: 72,
        fontWeight: "800",
        color: Colors.text,
        fontVariant: ["tabular-nums"],
    },
});
