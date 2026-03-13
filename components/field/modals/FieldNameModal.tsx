import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";

interface FieldNameModalProps {
    visible: boolean;
    initialName: string;
    onSave: (name: string) => void;
    onClose: () => void;
}

export function FieldNameModal({
    visible,
    initialName,
    onSave,
    onClose,
}: FieldNameModalProps) {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (visible) {
            setName(initialName);
        }
    }, [visible, initialName]);

    const handleSave = () => {
        onSave(name);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>Nom du Terrain</Text>
                    <Text style={styles.subtitle}>
                        Saisissez le nom qui identifiera ce terrain.
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Main Arena"
                        placeholderTextColor={Colors.secondary}
                        autoFocus
                    />

                    <View style={styles.actions}>
                        <OutlineButton
                            title="Cancel"
                            onPress={onClose}
                            style={styles.actionButton}
                        />
                        <PrimaryButton
                            title="Valider"
                            onPress={handleSave}
                            style={styles.actionButton}
                            disabled={!name.trim()}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.xl,
    },
    content: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        width: "100%",
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: Colors.secondary,
        textAlign: "center",
        marginBottom: Spacing.xl,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.1)",
        marginBottom: Spacing.xl,
    },
    actions: {
        flexDirection: "row",
        gap: Spacing.md,
    },
    actionButton: {
        flex: 1,
    },
});
