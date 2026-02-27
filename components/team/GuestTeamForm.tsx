import { SecondaryButton } from "@/components/common/SecondaryButton";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface GuestTeamFormProps {
  onSubmit: (name: string, isGuest: boolean) => Promise<void>;
}

export const GuestTeamForm = ({ onSubmit }: GuestTeamFormProps) => {
  const [guestTeamName, setGuestTeamName] = useState("");

  const handleSubmit = async () => {
    if (guestTeamName.trim()) {
      await onSubmit(guestTeamName.trim(), true);
      setGuestTeamName("");
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Or Add a Guest Team</Text>
      <TextInput
        style={styles.input}
        placeholder="Guest team name"
        value={guestTeamName}
        onChangeText={setGuestTeamName}
        textAlign="center"
      />
      <SecondaryButton title="Add Guest Team" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xxl,
    ...Shadows.card,
  },
  title: {
    ...Typography.caption,
    color: Colors.text,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
});
