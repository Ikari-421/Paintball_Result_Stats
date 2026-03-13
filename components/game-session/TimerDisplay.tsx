import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { Colors } from "@/constants/theme";
import { GameStatus } from "@/src/core/domain/GameStatus";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TimerDisplayProps {
    status: GameStatus;
    isTimeStopped: boolean;
    formattedTime: string;
    activeTimerType?: "game" | "break" | "overtime" | null;
}

export const TimerDisplay = ({
    status,
    isTimeStopped,
    formattedTime,
    activeTimerType,
}: TimerDisplayProps) => {
    const getTimerBorderColor = () => {
        switch (status) {
            case GameStatus.NOT_STARTED:
            case GameStatus.FINISHED:
                return Colors.secondary;
            case GameStatus.BREAK:
                return "#FF9500"; // Orange
            case GameStatus.RUNNING:
            case GameStatus.OVERTIME:
                if (isTimeStopped) return "#FF9500"; // Orange
                return "#34C759"; // Green
            default:
                return "transparent";
        }
    };

    const borderColor = getTimerBorderColor();

    return (
        <View style={[styles.timerContainer, { borderColor }]}>
            {activeTimerType && (
                <Text style={styles.timerTypeLabel}>
                    {activeTimerType === "game" && "GAME TIME"}
                    {activeTimerType === "break" && "BREAK TIME"}
                    {activeTimerType === "overtime" && "OVERTIME"}
                </Text>
            )}
            <View style={styles.timeRow}>
                <Text style={styles.timerText}>{formattedTime}</Text>
            </View>
            <MatchStatusBadge
                status={status}
                isTimeStopped={isTimeStopped}
                style={{ marginTop: 4 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
        alignItems: "center",
        marginBottom: 24,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 3,
    },
    timerText: {
        fontSize: 72,
        fontWeight: "800",
        color: Colors.text,
        fontVariant: ["tabular-nums"],
        letterSpacing: -2,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    timerTypeLabel: {
        marginBottom: 4,
        fontSize: 18,
        fontWeight: "800",
        color: Colors.primary,
        textTransform: "uppercase",
        letterSpacing: 2,
    },
});
