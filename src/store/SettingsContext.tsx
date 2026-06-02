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

// ── Room Configuration ───────────────────────────────────────────────────────

export const DEFAULT_FLOORS = ["Ground Floor", "Floor 1", "Floor 2", "Floor 3"];
export const DEFAULT_ROOM_TYPES = ["Single", "Double", "Triple"];
const ROOM_CONFIG_KEY = "pgm_room_config";

// ── Context ──────────────────────────────────────────────────────────────────

interface SettingsContextType {
  razorpay: RazorpayConfig;
  updateRazorpay: (cfg: Partial<RazorpayConfig>) => void;
  isRazorpayConfigured: boolean;
  notifications: NotificationConfig;
  updateNotifications: (cfg: Partial<NotificationConfig>) => void;
  isEmailConfigured: boolean;
  isSmsConfigured: boolean;
  // Room config
  floors: string[];
  roomTypes: string[];
  addFloor: (floor: string) => void;
  removeFloor: (floor: string) => void;
  addRoomType: (type: string) => void;
  removeRoomType: (type: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  razorpay: DEFAULT_RAZORPAY,
  updateRazorpay: () => {},
  isRazorpayConfigured: false,
  notifications: DEFAULT_NOTIFICATIONS,
  updateNotifications: () => {},
  isEmailConfigured: false,
  isSmsConfigured: false,
  floors: DEFAULT_FLOORS,
  roomTypes: DEFAULT_ROOM_TYPES,
  addFloor: () => {},
  removeFloor: () => {},
  addRoomType: () => {},
  removeRoomType: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [razorpay, setRazorpay] = useState<RazorpayConfig>(DEFAULT_RAZORPAY);
  const [notifications, setNotifications] = useState<NotificationConfig>(DEFAULT_NOTIFICATIONS);
  const [floors, setFloors] = useState<string[]>(DEFAULT_FLOORS);
  const [roomTypes, setRoomTypes] = useState<string[]>(DEFAULT_ROOM_TYPES);

  useEffect(() => {
    try {
      const savedRazorpay = localStorage.getItem("pgm_razorpay_config");
      if (savedRazorpay) setRazorpay({ ...DEFAULT_RAZORPAY, ...JSON.parse(savedRazorpay) });

      const savedNotif = localStorage.getItem("pgm_notification_config");
      if (savedNotif) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(savedNotif) });

      const savedRoomConfig = localStorage.getItem(ROOM_CONFIG_KEY);
      if (savedRoomConfig) {
        const rc = JSON.parse(savedRoomConfig);
        if (Array.isArray(rc.floors) && rc.floors.length) setFloors(rc.floors);
        if (Array.isArray(rc.roomTypes) && rc.roomTypes.length) setRoomTypes(rc.roomTypes);
      }
    } catch {}
  }, []);

  function saveRoomConfig(f: string[], t: string[]) {
    try { localStorage.setItem(ROOM_CONFIG_KEY, JSON.stringify({ floors: f, roomTypes: t })); } catch {}
  }

  function addFloor(floor: string) {
    const trimmed = floor.trim();
    if (!trimmed || floors.includes(trimmed)) return;
    const next = [...floors, trimmed];
    setFloors(next);
    saveRoomConfig(next, roomTypes);
  }

  function removeFloor(floor: string) {
    const next = floors.filter((f) => f !== floor);
    setFloors(next);
    saveRoomConfig(next, roomTypes);
  }

  function addRoomType(type: string) {
    const trimmed = type.trim();
    if (!trimmed || roomTypes.includes(trimmed)) return;
    const next = [...roomTypes, trimmed];
    setRoomTypes(next);
    saveRoomConfig(floors, next);
  }

  function removeRoomType(type: string) {
    const next = roomTypes.filter((t) => t !== type);
    setRoomTypes(next);
    saveRoomConfig(floors, next);
  }

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
      floors, roomTypes, addFloor, removeFloor, addRoomType, removeRoomType,
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
