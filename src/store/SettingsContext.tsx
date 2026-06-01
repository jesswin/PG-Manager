"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  pgName: string;
  currency: string;
}

interface SettingsContextType {
  razorpay: RazorpayConfig;
  updateRazorpay: (cfg: Partial<RazorpayConfig>) => void;
  isRazorpayConfigured: boolean;
}

const DEFAULT_RAZORPAY: RazorpayConfig = {
  keyId: "",
  keySecret: "",
  businessName: "",
  businessEmail: "",
  businessPhone: "",
  pgName: "PG Manager",
  currency: "INR",
};

const SettingsContext = createContext<SettingsContextType>({
  razorpay: DEFAULT_RAZORPAY,
  updateRazorpay: () => {},
  isRazorpayConfigured: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [razorpay, setRazorpay] = useState<RazorpayConfig>(DEFAULT_RAZORPAY);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pgm_razorpay_config");
      if (saved) setRazorpay({ ...DEFAULT_RAZORPAY, ...JSON.parse(saved) });
    } catch {}
  }, []);

  function updateRazorpay(cfg: Partial<RazorpayConfig>) {
    setRazorpay((prev) => {
      const next = { ...prev, ...cfg };
      localStorage.setItem("pgm_razorpay_config", JSON.stringify(next));
      return next;
    });
  }

  const isRazorpayConfigured = razorpay.keyId.trim().startsWith("rzp_");

  return (
    <SettingsContext.Provider value={{ razorpay, updateRazorpay, isRazorpayConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
