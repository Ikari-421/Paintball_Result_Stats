import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function CreateFieldScreen() {
  const [fieldName, setFieldName] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleCreate = () => {
    console.log("Create field:", fieldName);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ThemedText style={styles.backText}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Create field
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Create field
        </ThemedText>

        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Field name</ThemedText>
          <TextInput
            style={styles.input}
            value={fieldName}
            onChangeText={setFieldName}
            placeholder="Enter field name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.vsSection}>
          <View style={styles.vsRow}>
            <TextInput
              style={styles.vsInput}
              placeholder="Team"
              placeholderTextColor="#999"
            />
            <ThemedText style={styles.vsText}>VS</ThemedText>
            <TextInput
              style={styles.vsInput}
              placeholder="Team"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.addButton}>
              <ThemedText style={styles.addButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <ThemedText style={styles.createButtonText}>Create</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  inputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: "#000",
  },
  vsSection: {
    marginBottom: 30,
  },
  vsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  vsInput: {
    flex: 1,
    backgroundColor: "#A1CEDC",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 14,
    color: "#000",
  },
  vsText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FFD700",
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  createButton: {
    backgroundColor: "#FFB8A0",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
