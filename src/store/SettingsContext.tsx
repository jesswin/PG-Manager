"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ── UPI Configuration ─────────────────────────────────────────────────────────
// Simple: owner just provides their UPI ID — no account/API setup needed.

export interface UpiConfig {
  upiId: string;    // e.g. "9876543210@paytm" or "business@icici"
  upiName: string;  // display name tenants see when paying, e.g. "Sunshine PG"
  enabled: boolean;
}

const DEFAULT_UPI: UpiConfig = {
  upiId: "",
  upiName: "",
  enabled: false,
};

// ── Notification Preferences ──────────────────────────────────────────────────
// Emails and SMS are sent from the platform admin's account (env vars on server).
// Owners only control WHEN reminders go out — not HOW they're sent.

export interface NotificationPrefs {
  autoSendEnabled: boolean;  // auto-send reminders on app open
  daysBeforeDue: number;     // days before due date to send reminder
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  autoSendEnabled: true,
  daysBeforeDue: 3,
};

// ── Room Configuration ────────────────────────────────────────────────────────

export const DEFAULT_FLOORS    = ["Ground Floor", "Floor 1", "Floor 2", "Floor 3"];
export const DEFAULT_ROOM_TYPES = ["Single", "Double", "Triple"];
const ROOM_CONFIG_KEY = "pgm_room_config";

// ── Context type ──────────────────────────────────────────────────────────────

interface SettingsContextType {
  upi: UpiConfig;
  updateUpi: (cfg: Partial<UpiConfig>) => void;
  isUpiConfigured: boolean;
  notifPrefs: NotificationPrefs;
  updateNotifPrefs: (prefs: Partial<NotificationPrefs>) => void;
  floors: string[];
  roomTypes: string[];
  addFloor: (floor: string) => void;
  removeFloor: (floor: string) => void;
  addRoomType: (type: string) => void;
  removeRoomType: (type: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  upi: DEFAULT_UPI,
  updateUpi: () => {},
  isUpiConfigured: false,
  notifPrefs: DEFAULT_NOTIFICATION_PREFS,
  updateNotifPrefs: () => {},
  floors: DEFAULT_FLOORS,
  roomTypes: DEFAULT_ROOM_TYPES,
  addFloor: () => {},
  removeFloor: () => {},
  addRoomType: () => {},
  removeRoomType: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [upi, setUpi]             = useState<UpiConfig>(DEFAULT_UPI);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [floors, setFloors]       = useState<string[]>(DEFAULT_FLOORS);
  const [roomTypes, setRoomTypes] = useState<string[]>(DEFAULT_ROOM_TYPES);

  useEffect(() => {
    try {
      const savedUpi = localStorage.getItem("pgm_upi_config");
      if (savedUpi) setUpi({ ...DEFAULT_UPI, ...JSON.parse(savedUpi) });

      const savedNotif = localStorage.getItem("pgm_notif_prefs");
      if (savedNotif) setNotifPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(savedNotif) });

      const savedRoom = localStorage.getItem(ROOM_CONFIG_KEY);
      if (savedRoom) {
        const rc = JSON.parse(savedRoom);
        if (Array.isArray(rc.floors) && rc.floors.length)    setFloors(rc.floors);
        if (Array.isArray(rc.roomTypes) && rc.roomTypes.length) setRoomTypes(rc.roomTypes);
      }
    } catch { /* ignore */ }
  }, []);

  function updateUpi(cfg: Partial<UpiConfig>) {
    setUpi((prev) => {
      const next = { ...prev, ...cfg };
      localStorage.setItem("pgm_upi_config", JSON.stringify(next));
      return next;
    });
  }

  function updateNotifPrefs(prefs: Partial<NotificationPrefs>) {
    setNotifPrefs((prev) => {
      const next = { ...prev, ...prefs };
      localStorage.setItem("pgm_notif_prefs", JSON.stringify(next));
      return next;
    });
  }

  function saveRoomConfig(f: string[], t: string[]) {
    try { localStorage.setItem(ROOM_CONFIG_KEY, JSON.stringify({ floors: f, roomTypes: t })); } catch { /* ignore */ }
  }

  function addFloor(floor: string) {
    const v = floor.trim();
    if (!v || floors.includes(v)) return;
    const next = [...floors, v];
    setFloors(next); saveRoomConfig(next, roomTypes);
  }
  function removeFloor(floor: string) {
    const next = floors.filter((f) => f !== floor);
    setFloors(next); saveRoomConfig(next, roomTypes);
  }
  function addRoomType(type: string) {
    const v = type.trim();
    if (!v || roomTypes.includes(v)) return;
    const next = [...roomTypes, v];
    setRoomTypes(next); saveRoomConfig(floors, next);
  }
  function removeRoomType(type: string) {
    const next = roomTypes.filter((t) => t !== type);
    setRoomTypes(next); saveRoomConfig(floors, next);
  }

  const isUpiConfigured = upi.enabled && upi.upiId.trim().length > 3 && upi.upiId.includes("@");

  return (
    <SettingsContext.Provider value={{
      upi, updateUpi, isUpiConfigured,
      notifPrefs, updateNotifPrefs,
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
