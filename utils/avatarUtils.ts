import { AvatarColors } from "@/constants/theme";

export const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const getAvatarColor = (index: number): string => {
  return AvatarColors[index % AvatarColors.length];
};
