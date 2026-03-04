import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { Colors } from "@/constants/theme";
import { GameStatus } from "@/src/core/domain/GameStatus";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TimerDisplayProps {
    status: GameStatus;
    isTimeStopped: boolean;
    formattedTime: string;
    onAdjustTime?: () => void;
}

export const TimerDisplay = ({
    status,
    isTimeStopped,
    formattedTime,
    onAdjustTime,
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
            <MatchStatusBadge
                status={status}
                isTimeStopped={isTimeStopped}
                style={{ marginTop: 0, marginBottom: 8 }}
            />
            <View style={styles.timeRow}>
                <Text style={styles.timerText}>{formattedTime}</Text>
            </View>
            {onAdjustTime && (
                <TouchableOpacity onPress={onAdjustTime} style={styles.adjustLink}>
                    <Text style={styles.adjustLinkText}>Adjust time</Text>
                </TouchableOpacity>
            )}
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
    adjustLink: {
        marginTop: 4,
        padding: 4,
    },
    adjustLinkText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
