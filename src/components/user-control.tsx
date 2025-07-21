"use client";
import { dark } from "@clerk/themes";
import { useCustomTheme } from "@/hooks/use-theme";
import { UserButton } from "@clerk/nextjs";

export const UserControl = () => {
  const currentTheme = useCustomTheme();

  return (
    <UserButton
      appearance={{
        baseTheme: currentTheme === "dark" ? dark : undefined,
        elements: {
          userButtonAvatarBox: "w-10 h-10",
          userButtonAvatar: "rounded-full",
          userButtonAction: "hidden",
          userButtonPopoverCard: "bg-background shadow-lg rounded-lg",
        },
      }}
    />
  );
};
