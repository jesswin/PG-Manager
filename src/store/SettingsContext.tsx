"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ── Razorpay ────────────────────────────────────────────────────────────────

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  pgName: string;
  currency: string;
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

// ── Notifications ────────────────────────────────────────────────────────────

export interface NotificationConfig {
  emailEnabled: boolean;
  resendApiKey: string;       // resend.com API key
  fromName: string;           // e.g. "Sunshine PG"
  smsEnabled: boolean;
  smsWebhookUrl: string;      // POST endpoint (Twilio, MSG91, WATI, custom…)
  smsApiKey: string;          // Bearer token for the webhook
  daysBeforeDue: number;      // how many days ahead to send reminder (default 3)
  autoSendEnabled: boolean;   // auto-send on app load when due date is near
}

export const DEFAULT_NOTIFICATIONS: NotificationConfig = {
  emailEnabled: false,
  resendApiKey: "",
  fromName: "",
  smsEnabled: false,
  smsWebhookUrl: "",
  smsApiKey: "",
  daysBeforeDue: 3,
  autoSendEnabled: true,
};

// ── Context ──────────────────────────────────────────────────────────────────

interface SettingsContextType {
  razorpay: RazorpayConfig;
  updateRazorpay: (cfg: Partial<RazorpayConfig>) => void;
  isRazorpayConfigured: boolean;
  notifications: NotificationConfig;
  updateNotifications: (cfg: Partial<NotificationConfig>) => void;
  isEmailConfigured: boolean;
  isSmsConfigured: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  razorpay: DEFAULT_RAZORPAY,
  updateRazorpay: () => {},
  isRazorpayConfigured: false,
  notifications: DEFAULT_NOTIFICATIONS,
  updateNotifications: () => {},
  isEmailConfigured: false,
  isSmsConfigured: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [razorpay, setRazorpay] = useState<RazorpayConfig>(DEFAULT_RAZORPAY);
  const [notifications, setNotifications] = useState<NotificationConfig>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    try {
      const savedRazorpay = localStorage.getItem("pgm_razorpay_config");
      if (savedRazorpay) setRazorpay({ ...DEFAULT_RAZORPAY, ...JSON.parse(savedRazorpay) });

      const savedNotif = localStorage.getItem("pgm_notification_config");
      if (savedNotif) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(savedNotif) });
    } catch {}
  }, []);

  function updateRazorpay(cfg: Partial<RazorpayConfig>) {
    setRazorpay((prev) => {
      const next = { ...prev, ...cfg };
      localStorage.setItem("pgm_razorpay_config", JSON.stringify(next));
      return next;
    });
  }

  function updateNotifications(cfg: Partial<NotificationConfig>) {
    setNotifications((prev) => {
      const next = { ...prev, ...cfg };
      localStorage.setItem("pgm_notification_config", JSON.stringify(next));
      return next;
    });
  }

  const isRazorpayConfigured = razorpay.keyId.trim().startsWith("rzp_");
  const isEmailConfigured = notifications.emailEnabled && notifications.resendApiKey.trim().length > 10;
  const isSmsConfigured = notifications.smsEnabled && notifications.smsWebhookUrl.trim().startsWith("http");

  return (
    <SettingsContext.Provider value={{
      razorpay, updateRazorpay, isRazorpayConfigured,
      notifications, updateNotifications, isEmailConfigured, isSmsConfigured,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
