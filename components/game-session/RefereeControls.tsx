import { Colors, Spacing } from "@/constants/theme";
import { ActionButton } from "@/src/presentation/state/GameStateMachine";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RefereeControlsProps {
    actions: ActionButton[];
    onAction: (actionId: string, subType?: string) => void;
}

export const RefereeControls = ({
    actions,
    onAction,
}: RefereeControlsProps) => {
    if (actions.length === 0) return null;

    return (
        <View style={styles.controlsContainer}>
            <View style={styles.controlRow}>
                {actions.map((act, index) => {
                    const btnStyle =
                        act.styleType === "primary" ? styles.primaryButton :
                            act.styleType === "secondary" ? styles.secondaryButton :
                                act.styleType === "danger" ? styles.dangerButton : styles.warningButton;

                    const txtStyle = act.styleType === "warning" || act.styleType === "secondary"
                        ? styles.buttonTextDark
                        : styles.buttonText;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.button, btnStyle]}
                            onPress={() => onAction(act.actionId, act.subType)}
                        >
                            <Text style={[styles.buttonText, txtStyle]}>{act.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    controlsContainer: {
        paddingHorizontal: 16,
        paddingBottom: Spacing.xxxl,
    },
    controlRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
        gap: 12,
        flexWrap: "wrap",
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 100,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
    },
    secondaryButton: {
        backgroundColor: Colors.surface,
    },
    warningButton: {
        backgroundColor: "#FF9500",
    },
    dangerButton: {
        backgroundColor: "#FF3B30",
    },
    buttonTextDark: {
        color: Colors.text,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    refereeTools: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.secondary,
        textTransform: "uppercase",
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    refereeRow: {
        flexDirection: "row",
    },
    refereeButton: {
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginRight: 8,
    },
    refereeButtonText: {
        color: Colors.white,
        fontWeight: "600",
        marginLeft: 6,
    },
});
