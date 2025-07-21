import { useTheme } from "next-themes";

export const useCustomTheme = () => {
  const { theme, systemTheme } = useTheme();

  if (theme === "dark") {
    return theme;
  }
  return systemTheme;
};
