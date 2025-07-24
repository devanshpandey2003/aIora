"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type TierType = "free" | "premium";

type TierContextType = {
  tier: TierType;
  setTier: (tier: TierType) => void;
  toggleTier: () => void; // Helper function to toggle between tiers
};

const TierContext = createContext<TierContextType | undefined>(undefined);

export const TierProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTierState] = useState<TierType>("free");

  // Load tier from localStorage on mount
  useEffect(() => {
    const storedTier =
      typeof window !== "undefined" ? localStorage.getItem("tier") : null;
    if (storedTier === "free" || storedTier === "premium") {
      setTierState(storedTier);
    }
  }, []);

  // Save tier to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tier", tier);
    }
  }, [tier]);

  const setTier = (newTier: TierType) => {
    setTierState(newTier);
  };

  const toggleTier = () => {
    setTierState((prev) => (prev === "free" ? "premium" : "free"));
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
