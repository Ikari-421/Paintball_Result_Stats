import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CreateTournamentScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const { createTournament, isLoading } = useCoreStore();

    const handleCreate = async () => {
        if (!name.trim() || !location.trim() || !startDate || !endDate) {
            Alert.alert("Missing information", "Please fill all fields");
            return;
        }

        if (endDate < startDate) {
            Alert.alert("Invalid date", "End date cannot be before start date");
            return;
        }

        try {
            await createTournament(name.trim(), location.trim(), startDate, endDate);
            router.back();
        } catch (error) {
            Alert.alert("Error", (error as Error).message);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Create Tournament" onBack={() => router.back()} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Tournament Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Summer Cup 2024"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#999"
                            autoFocus
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Paris Arena"
                            value={location}
                            onChangeText={setLocation}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
                            <Text style={{ color: startDate ? Colors.text : "#999" }}>
                                {startDate ? startDate.toLocaleDateString() : "Select Start Date"}
                            </Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                onChange={(event, selectedDate) => {
                                    setShowStartPicker(false);
                                    if (event.type === "set" && selectedDate) {
                                        setStartDate(selectedDate);
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
                            <Text style={{ color: endDate ? Colors.text : "#999" }}>
                                {endDate ? endDate.toLocaleDateString() : "Select End Date"}
                            </Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate || startDate || new Date()}
                                mode="date"
                                minimumDate={startDate || undefined}
                                onChange={(event, selectedDate) => {
                                    setShowEndPicker(false);
                                    if (event.type === "set" && selectedDate) {
                                        setEndDate(selectedDate);
                                    }
                                }}
                            />
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Create Tournament"
                    onPress={handleCreate}
                    disabled={!name.trim() || !location.trim() || !startDate || !endDate || isLoading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
    },
    formSection: {
        marginBottom: Spacing.xl,
    },
    label: {
        ...Typography.body,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: 12,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: "#eee",
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
});
