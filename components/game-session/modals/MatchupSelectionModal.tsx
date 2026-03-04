import { Colors } from "@/constants/theme";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MatchupSelectionModalProps {
    visible: boolean;
    teamAName: string;
    teamBName: string;
    onSelectWinner: (teamId: "A" | "B" | "DRAW") => void;
    onCancel: () => void;
}

export const MatchupSelectionModal = ({
    visible,
    teamAName,
    teamBName,
    onSelectWinner,
    onCancel,
}: MatchupSelectionModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>End of Round</Text>
                    <Text style={styles.modalDescription}>
                        Select the winner of this round
                    </Text>

                    <View style={styles.matchupOptions}>
                        <TouchableOpacity
                            style={[styles.matchupOptionButton, { backgroundColor: Colors.primary }]}
                            onPress={() => onSelectWinner("A")}
                        >
                            <Text style={styles.matchupOptionText}>{teamAName}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.matchupOptionButton, { backgroundColor: Colors.secondary }]}
                            onPress={() => onSelectWinner("DRAW")}
                        >
                            <Text style={styles.matchupOptionText}>Draw / No Winner</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.matchupOptionButton, { backgroundColor: Colors.primary }]}
                            onPress={() => onSelectWinner("B")}
                        >
                            <Text style={styles.matchupOptionText}>{teamBName}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 14,
        color: Colors.secondary,
        marginBottom: 24,
    },
    matchupOptions: {
        gap: 12,
        marginBottom: 24,
    },
    matchupOptionButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: "center",
    },
    matchupOptionText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "700",
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderRadius: 16,
    },
    secondaryButtonText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: "600",
    },
});
