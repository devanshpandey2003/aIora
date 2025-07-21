// contexts/TierContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TierType = "free" | "premium";

type TierContextType = {
  tier: TierType;
  setTier: (tier: TierType) => void;
  toggleTier: () => void; // Helper function to toggle between tiers
};

const TierContext = createContext<TierContextType | undefined>(undefined);

export const TierProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<TierType>("free");

  const toggleTier = () => {
    setTier((prev) => (prev === "free" ? "premium" : "free"));
  };

  return (
    <TierContext.Provider value={{ tier, setTier, toggleTier }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error("useTier must be used within a TierProvider");
  }
  return context;
};

// Export the type for use in other components
export type { TierType };
