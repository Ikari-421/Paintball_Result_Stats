import { EmptyState } from "@/components/common/EmptyState";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { FieldCard } from "@/components/field/FieldCard";
import { Colors, Spacing } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function FieldsListScreen() {
  const router = useRouter();
  const { fields, loadFields, isLoading } = useCoreStore();

  useEffect(() => {
    loadFields();
  }, []);

  const getIconColor = (index: number) => {
    return index % 2 === 0 ? Colors.accent : Colors.secondary;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fields" onBack={() => router.push("/menu")} />

      <ScrollView style={styles.content}>
        {fields.map((field, index) => (
          <FieldCard
            key={field.id}
            field={field}
            iconColor={getIconColor(index)}
            onPress={() => router.push(`/field/${field.id}`)}
          />
        ))}

        {fields.length === 0 && !isLoading && (
          <EmptyState message="No fields available" />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="+ Create New Field"
          onPress={() => router.push("/create-field")}
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
