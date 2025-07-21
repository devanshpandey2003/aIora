"use client";

import { dark } from "@clerk/themes";
import { useCustomTheme } from "@/hooks/use-theme";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  const currentTheme = useCustomTheme();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <section className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <SignIn
            appearance={{
              baseTheme: currentTheme === "dark" ? dark : undefined,
              elements: {
                cardBox: "border! shadow-none! rounded-lg!",
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
