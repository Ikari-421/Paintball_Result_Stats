import { GameStatus } from "@/src/core/domain/GameStatus";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

export interface MatchStatusBadgeProps {
    status: GameStatus | string;
    isTimeStopped?: boolean;
    style?: ViewStyle;
    showDot?: boolean;
}

export const MatchStatusBadge = ({
    status,
    isTimeStopped = false,
    style,
    showDot = true,
}: MatchStatusBadgeProps) => {
    const getStatusConfig = () => {
        if (status === GameStatus.NOT_STARTED) {
            return { color: "#FF3B30", text: "NOT STARTED" };
        }
        if (status === GameStatus.FINISHED) {
            return { color: "#FF3B30", text: "FINISHED" };
        }
        if (isTimeStopped || status === "TIME_STOPPED" || status === GameStatus.BREAK) {
            return { color: "#FF9500", text: "TIME STOPPED" };
        }
        if (status === GameStatus.OVERTIME) {
            return { color: "#34C759", text: "OVERTIME" };
        }
        return { color: "#34C759", text: "RUNNING" };
    };

    const config = getStatusConfig();

    return (
        <View style={[styles.container, style]}>
            {showDot && (
                <View style={[styles.dot, { backgroundColor: config.color }]} />
            )}
            <Text style={[styles.text, { color: config.color }]}>
                {config.text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    text: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});
