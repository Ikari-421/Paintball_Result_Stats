import { Colors } from "@/constants/theme";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { NextMatchDetails } from "./ScoreValidationModal";

interface OvertimePromptModalProps {
    visible: boolean;
    scoreA: number;
    scoreB: number;
    teamAName: string;
    teamBName: string;
    nextMatchDetails: NextMatchDetails | null;
    onStartOvertime: () => Promise<void>;
    onFinishWithTie: () => Promise<void>;
    onStartNextMatchup: () => void;
    onTechnicalTimeout: () => void;
}

export const OvertimePromptModal = ({
    visible,
    scoreA,
    scoreB,
    teamAName,
    teamBName,
    nextMatchDetails,
    onStartOvertime,
    onFinishWithTie,
    onStartNextMatchup,
    onTechnicalTimeout,
}: OvertimePromptModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset processing when modal opens/closes
    React.useEffect(() => {
        if (visible) {
            setIsProcessing(false);
        }
    }, [visible]);

    const handleSelectOvertime = async () => {
        setIsProcessing(true);
        await onStartOvertime();
        if (nextMatchDetails) {
            onStartNextMatchup();
        } else {
            onTechnicalTimeout(); // Close if no next match since there's nowhere to go
        }
        setIsProcessing(false);
    };

    const handleSelectTie = async () => {
        setIsProcessing(true);
        await onFinishWithTie();
        if (nextMatchDetails) {
            onStartNextMatchup();
        } else {
            onTechnicalTimeout();
        }
        setIsProcessing(false);
    };

    const handleTechnicalTimeout = () => {
        if (isProcessing) return;
        onTechnicalTimeout();
    };

    const renderSelectionPhase = () => (
        <>
            <View style={styles.titleContainer}>
                <Text style={styles.modalTitle}>Time's up - Tie Game</Text>
                <Text style={styles.actionText}>Regulation time ended with a tied score.</Text>
            </View>

            {nextMatchDetails && (
                <View style={styles.nextMatchContainer}>
                    <Text style={styles.nextMatchTitle}>Next Match</Text>
                    <View style={styles.nextMatchTeams}>
                        <Text style={styles.nextMatchTeamName}>{nextMatchDetails.teamAName}</Text>
                        <Text style={styles.nextMatchScore}>{nextMatchDetails.scoreA} - {nextMatchDetails.scoreB}</Text>
                        <Text style={styles.nextMatchTeamName}>{nextMatchDetails.teamBName}</Text>
                    </View>
                    <View style={styles.nextMatchInfo}>
                        <Text style={styles.nextMatchInfoText}>
                            Game Mode: <Text style={{ fontWeight: "bold" }}>{nextMatchDetails.gameModeName}</Text>
                        </Text>
                        <Text style={styles.nextMatchInfoText}>
                            Break Time: <Text style={{ fontWeight: "bold" }}>{nextMatchDetails.breakTimeSeconds}</Text> sec
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalPrimaryButton, isProcessing && { opacity: 0.5 }]}
                    onPress={handleSelectOvertime}
                    disabled={isProcessing}
                >
                    <Text style={styles.modalPrimaryButtonText}>
                        {isProcessing ? "Processing..." : "Go to Overtime"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modalSecondaryButton, isProcessing && { opacity: 0.5 }]}
                    onPress={handleSelectTie}
                    disabled={isProcessing}
                >
                    <Text style={styles.modalSecondaryButtonText}>
                        {isProcessing ? "Processing..." : "Finish with a Tie & Start the next match"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.modalTertiaryButton}
                    onPress={handleTechnicalTimeout}
                    disabled={isProcessing}
                >
                    <Text style={styles.modalTertiaryButtonText}>Technical Timeout</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {renderSelectionPhase()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.error, // Red for Time's up attention in selection phase
        textAlign: "center",
        marginBottom: 16,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    actionText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.secondary,
        textAlign: "center",
        marginTop: 4,
        marginBottom: 16,
    },
    nextMatchContainer: {
        backgroundColor: Colors.background,
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        alignItems: "center",
    },
    nextMatchTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: Colors.primary,
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    nextMatchTeams: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        gap: 12,
    },
    nextMatchTeamName: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        flex: 1,
        textAlign: "center",
    },
    nextMatchScore: {
        fontSize: 24,
        fontWeight: "900",
        color: Colors.text,
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    nextMatchInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        paddingTop: 12,
    },
    nextMatchInfoText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.secondary,
    },
    modalButtons: {
        flexDirection: "column",
        gap: 12,
    },
    modalSecondaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: "center",
        width: '100%',
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    modalSecondaryButtonText: {
        color: Colors.text,
        fontWeight: "700",
        fontSize: 16,
    },
    modalPrimaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: "#FF9500", // Default orange/warning for OT
        alignItems: "center",
        width: '100%',
    },
    modalPrimaryButtonText: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: 16,
        textAlign: "center",
    },
    modalTertiaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "transparent",
        alignItems: "center",
        width: '100%',
        marginTop: 4,
    },
    modalTertiaryButtonText: {
        color: Colors.primary,
        fontWeight: "700",
        fontSize: 15,
        textDecorationLine: "underline",
    },
});
