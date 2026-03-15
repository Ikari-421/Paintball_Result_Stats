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
    onTechnicalTimeout,
}: OvertimePromptModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedOption, setSelectedOption] = useState<"TIE" | "OVERTIME">("OVERTIME");

    // Reset state when modal opens
    React.useEffect(() => {
        if (visible) {
            setIsProcessing(false);
            setSelectedOption("OVERTIME");
        }
    }, [visible]);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            if (selectedOption === "OVERTIME") {
                await onStartOvertime();
            } else {
                await onFinishWithTie();
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.modalTitle}>Regulation Time Over</Text>
                        <View style={styles.scoreRow}>
                            <Text style={styles.scoreText}>{teamAName} {scoreA} - {scoreB} {teamBName}</Text>
                        </View>
                        <Text style={styles.actionText}>The match ended in a tie. What's next?</Text>
                    </View>

                    <View style={styles.selectionContainer}>
                        <TouchableOpacity
                            style={[styles.optionCard, selectedOption === "OVERTIME" && styles.optionCardSelected]}
                            onPress={() => setSelectedOption("OVERTIME")}
                        >
                            <View style={[styles.radio, selectedOption === "OVERTIME" && styles.radioSelected]}>
                                {selectedOption === "OVERTIME" && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Enable Overtime</Text>
                                <Text style={styles.optionDescription}>A Golden Point will be played later</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionCard, selectedOption === "TIE" && styles.optionCardSelected]}
                            onPress={() => setSelectedOption("TIE")}
                        >
                            <View style={[styles.radio, selectedOption === "TIE" && styles.radioSelected]}>
                                {selectedOption === "TIE" && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>End as Tie</Text>
                                <Text style={styles.optionDescription}>Finish match with current scores</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {nextMatchDetails && (
                        <View style={styles.nextMatchContainer}>
                            <Text style={styles.nextMatchTitle}>Next Matchup</Text>
                            <View style={styles.nextMatchTeams}>
                                <Text style={styles.nextMatchTeamName}>{nextMatchDetails.teamAName}</Text>
                                <Text style={styles.nextMatchScore}>{nextMatchDetails.scoreA} - {nextMatchDetails.scoreB}</Text>
                                <Text style={styles.nextMatchTeamName}>{nextMatchDetails.teamBName}</Text>
                            </View>
                            <View style={styles.nextMatchInfo}>
                                <Text style={styles.nextMatchInfoText}>
                                    Break Time: <Text style={{ fontWeight: "bold" }}>{nextMatchDetails.breakTimeSeconds}</Text> sec
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalPrimaryButton, isProcessing && { opacity: 0.7 }]}
                            onPress={handleConfirm}
                            disabled={isProcessing}
                        >
                            <Text style={styles.modalPrimaryButtonText}>
                                {isProcessing ? "Processing..." : (nextMatchDetails ? "Validate & Start Next Break" : "Validate Result")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalTertiaryButton}
                            onPress={onTechnicalTimeout}
                            disabled={isProcessing}
                        >
                            <Text style={styles.modalTertiaryButtonText}>Technical Timeout (Wait)</Text>
                        </TouchableOpacity>
                    </View>
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
    titleContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.error,
        textAlign: "center",
        marginBottom: 8,
    },
    scoreRow: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: Colors.surface,
        borderRadius: 8,
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.secondary,
        textAlign: "center",
    },
    selectionContainer: {
        gap: 12,
        marginBottom: 24,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        borderWidth: 2,
        borderColor: "transparent",
    },
    optionCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.secondary,
        marginRight: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    radioSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text,
    },
    optionDescription: {
        fontSize: 12,
        color: Colors.secondary,
    },
    nextMatchContainer: {
        backgroundColor: Colors.background,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        alignItems: "center",
    },
    nextMatchTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: Colors.primary,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    nextMatchTeams: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        gap: 8,
    },
    nextMatchTeamName: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.text,
        flex: 1,
        textAlign: "center",
    },
    nextMatchScore: {
        fontSize: 16,
        fontWeight: "900",
        color: Colors.text,
        backgroundColor: Colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    nextMatchInfo: {
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        paddingTop: 8,
        alignItems: "center",
    },
    nextMatchInfoText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.secondary,
    },
    modalButtons: {
        gap: 12,
    },
    modalPrimaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: "center",
    },
    modalPrimaryButtonText: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
    modalTertiaryButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    modalTertiaryButtonText: {
        color: Colors.primary,
        fontWeight: "700",
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
