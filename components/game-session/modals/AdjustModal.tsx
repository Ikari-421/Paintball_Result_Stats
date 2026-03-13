import { Colors } from "@/constants/theme";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface AdjustModalProps {
    visible: boolean;
    initialSeconds: number;
    onConfirm: (seconds: number, reason: string) => void;
    onCancel: () => void;
}

export const AdjustModal = ({
    visible,
    initialSeconds,
    onConfirm,
    onCancel,
}: AdjustModalProps) => {
    const [minutes, setMinutes] = useState(() => Math.floor(initialSeconds / 60));
    const [seconds, setSeconds] = useState(() => initialSeconds % 60);
    const [reason, setReason] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setMinutes(Math.floor(initialSeconds / 60));
            setSeconds(initialSeconds % 60);
            setReason("");
        }
    }, [visible, initialSeconds]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adjust Time</Text>
                    <Text style={styles.modalDescription}>
                        Select the new time and provide a reason for this adjustment.
                    </Text>

                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerColumn}>
                            <Text style={styles.label}>Minutes</Text>
                            <Picker
                                selectedValue={minutes}
                                onValueChange={(itemValue) => setMinutes(itemValue)}
                                style={styles.picker}
                            >
                                {Array.from({ length: 90 }, (_, i) => (
                                    <Picker.Item key={i} label={i.toString().padStart(2, "0")} value={i} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.pickerSeparator}>:</Text>

                        <View style={styles.pickerColumn}>
                            <Text style={styles.label}>Seconds</Text>
                            <Picker
                                selectedValue={seconds}
                                onValueChange={(itemValue) => setSeconds(itemValue)}
                                style={styles.picker}
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <Picker.Item key={i} label={i.toString().padStart(2, "0")} value={i} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.labelLeft}>Reason (Required)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={reason}
                            onChangeText={setReason}
                            placeholder="e.g., Referee decision, penalty..."
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                !reason && styles.buttonDisabled,
                            ]}
                            disabled={!reason}
                            onPress={() => onConfirm(minutes * 60 + seconds, reason)}
                        >
                            <Text style={styles.primaryButtonText}>Apply</Text>
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
        marginBottom: 16,
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    pickerColumn: {
        flex: 1,
        alignItems: "center",
    },
    picker: {
        width: 100,
        height: 150,
    },
    pickerSeparator: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text,
        marginHorizontal: 8,
        marginTop: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.secondary,
        marginBottom: 8,
        textTransform: "uppercase",
        textAlign: "center",
    },
    labelLeft: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.secondary,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 8,
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },
    secondaryButtonText: {
        color: Colors.secondary,
        fontWeight: "600",
    },
    primaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },
    primaryButtonText: {
        color: Colors.white,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
