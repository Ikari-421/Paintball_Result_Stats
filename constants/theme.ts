export const Colors = {
  text: "#152b42",
  background: "#EBF2FA",
  primary: "#2c4b5c",
  secondary: "#95cbbc",
  accent: "#5FC2BA",
  danger: "#FFCDD2",
  white: "#fff",
  border: "rgba(0, 0, 0, 0.05)",
  shadow: "#000",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 60,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 20,
};

export const Typography = {
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  small: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const AvatarColors = ["#2c4b5c", "#95cbbc", "#5FC2BA"];
