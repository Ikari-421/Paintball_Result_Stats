import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { FieldListItem } from "@/components/field/FieldListItem";
import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { Field } from "@/types";
import { router } from "expo-router";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

const MOCK_FIELDS: Field[] = [
  { id: "1", name: "Name field 1" },
  { id: "2", name: "Name field 2" },
  { id: "3", name: "Name field 3" },
];

export default function FieldsListScreen() {
  const handleFieldPress = (fieldId: string) => {
    router.push(`/field/${fieldId}`);
  };

  const handleLogin = () => {
    console.log("Login");
  };

  const handleMenu = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Main" />

      <View style={styles.loginSection}>
        <AppButton
          title="Login"
          onPress={handleLogin}
          variant="primary"
          style={styles.loginButton}
        />
        <TouchableOpacity style={styles.iconButton} onPress={handleMenu}>
          <ThemedText style={styles.iconText}>☰</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText type="subtitle" style={styles.subtitle}>
        Field List
      </ThemedText>

      <FlatList
        data={MOCK_FIELDS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FieldListItem
            field={item}
            onPress={() => handleFieldPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

      <ThemedText style={styles.footerText}>Or No fields available</ThemedText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: AppSpacing.md,
    marginBottom: AppSpacing.xxl,
  },
  loginButton: {
    paddingVertical: AppSpacing.md,
    paddingHorizontal: AppSpacing.xxl,
  },
  iconButton: {
    backgroundColor: "#A1CEDC",
    width: 40,
    height: 40,
    borderRadius: AppBorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
    color: "#000",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: AppSpacing.xl,
  },
  listContainer: {
    paddingHorizontal: AppSpacing.xl,
    gap: AppSpacing.md,
  },
  footerText: {
    textAlign: "center",
    marginTop: AppSpacing.xl,
    marginBottom: AppSpacing.xl,
    fontSize: 14,
    fontStyle: "italic",
  },
});
