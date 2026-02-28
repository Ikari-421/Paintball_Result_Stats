import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  initial: string;
  color: string;
  size?: number;
}

export const Avatar = ({ initial, color, size = 40 }: AvatarProps) => {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size * 0.45 }]}>
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "800",
  },
});
