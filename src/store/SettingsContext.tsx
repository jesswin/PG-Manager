"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/AuthContext";

// ── UPI Configuration ─────────────────────────────────────────────────────────

export interface UpiConfig {
  upiId: string;
  upiName: string;
  enabled: boolean;
}

const DEFAULT_UPI: UpiConfig = { upiId: "", upiName: "", enabled: false };

// ── Notification Preferences ──────────────────────────────────────────────────

export interface NotificationPrefs {
  autoSendEnabled: boolean;
  daysBeforeDue: number;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  autoSendEnabled: true,
  daysBeforeDue: 3,
};

// ── Room Configuration ────────────────────────────────────────────────────────

export const DEFAULT_FLOORS     = ["Ground Floor", "Floor 1", "Floor 2", "Floor 3"];
export const DEFAULT_ROOM_TYPES = ["Single", "Double", "Triple"];
const ROOM_CONFIG_KEY = "pgm_room_config";

// ── Context type ──────────────────────────────────────────────────────────────

interface SettingsContextType {
  upi: UpiConfig;
  updateUpi: (cfg: Partial<UpiConfig>) => Promise<void>;
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
  updateUpi: async () => {},
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
  const { user } = useAuth();

  const [upi, setUpi]               = useState<UpiConfig>(DEFAULT_UPI);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [floors, setFloors]         = useState<string[]>(DEFAULT_FLOORS);
  const [roomTypes, setRoomTypes]   = useState<string[]>(DEFAULT_ROOM_TYPES);

  // ── Load settings when user changes ─────────────────────────────────────────
  // Priority: Supabase user_metadata → localStorage fallback
  useEffect(() => {
    // Room config is always device-local
    try {
      const savedRoom = localStorage.getItem(ROOM_CONFIG_KEY);
      if (savedRoom) {
        const rc = JSON.parse(savedRoom);
        if (Array.isArray(rc.floors) && rc.floors.length) setFloors(rc.floors);
        if (Array.isArray(rc.roomTypes) && rc.roomTypes.length) setRoomTypes(rc.roomTypes);
      }
    } catch { /* ignore */ }

    if (user?.user_metadata) {
      // Supabase: read from auth user_metadata (no extra table needed)
      const meta = user.user_metadata;
      if (meta.upi_id) {
        setUpi({
          upiId:   meta.upi_id   ?? "",
          upiName: meta.upi_name ?? "",
          enabled: !!(meta.upi_id?.includes("@")),
        });
      } else {
        // No Supabase metadata yet — try localStorage migration
        loadUpiFromLocalStorage();
      }
      if (meta.notif_auto_send !== undefined || meta.notif_days_before_due !== undefined) {
        setNotifPrefs({
          autoSendEnabled: meta.notif_auto_send    ?? true,
          daysBeforeDue:   meta.notif_days_before_due ?? 3,
        });
      } else {
        loadNotifFromLocalStorage();
      }
    } else {
      // No Supabase user — use localStorage only
      loadUpiFromLocalStorage();
      loadNotifFromLocalStorage();
    }
  }, [user?.id, user?.user_metadata?.upi_id]); // re-run when UPI saved

  function loadUpiFromLocalStorage() {
    try {
      const saved = localStorage.getItem("pgm_upi_config");
      if (saved) setUpi({ ...DEFAULT_UPI, ...JSON.parse(saved) });
    } catch { /* ignore */ }
  }

  function loadNotifFromLocalStorage() {
    try {
      const saved = localStorage.getItem("pgm_notif_prefs");
      if (saved) setNotifPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(saved) });
    } catch { /* ignore */ }
  }

  // ── Update UPI ───────────────────────────────────────────────────────────────

  const updateUpi = async (cfg: Partial<UpiConfig>) => {
    const next: UpiConfig = {
      ...upi,
      ...cfg,
      enabled: !!(cfg.upiId ?? upi.upiId)?.includes("@"),
    };
    setUpi(next);

    // Always save locally
    localStorage.setItem("pgm_upi_config", JSON.stringify(next));

    // Save to Supabase user_metadata (syncs across ALL devices + deployments)
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: { upi_id: next.upiId, upi_name: next.upiName },
        });
      } catch { /* ignore — localStorage is the fallback */ }
    }
  };

  // ── Update notification prefs ─────────────────────────────────────────────────

  const updateNotifPrefs = (prefs: Partial<NotificationPrefs>) => {
    const next = { ...notifPrefs, ...prefs };
    setNotifPrefs(next);
    localStorage.setItem("pgm_notif_prefs", JSON.stringify(next));
    if (supabase) {
      supabase.auth.updateUser({
        data: {
          notif_auto_send:       next.autoSendEnabled,
          notif_days_before_due: next.daysBeforeDue,
        },
      }).then(() => {}, () => {});
    }
  };

  // ── Room config (localStorage only) ──────────────────────────────────────────

  function saveRoomConfig(f: string[], t: string[]) {
    try { localStorage.setItem(ROOM_CONFIG_KEY, JSON.stringify({ floors: f, roomTypes: t })); } catch { /* ignore */ }
  }
  function addFloor(floor: string) {
    const v = floor.trim();
    if (!v || floors.includes(v)) return;
    const next = [...floors, v]; setFloors(next); saveRoomConfig(next, roomTypes);
  }
  function removeFloor(floor: string) {
    const next = floors.filter((f) => f !== floor); setFloors(next); saveRoomConfig(next, roomTypes);
  }
  function addRoomType(type: string) {
    const v = type.trim();
    if (!v || roomTypes.includes(v)) return;
    const next = [...roomTypes, v]; setRoomTypes(next); saveRoomConfig(floors, next);
  }
  function removeRoomType(type: string) {
    const next = roomTypes.filter((t) => t !== type); setRoomTypes(next); saveRoomConfig(floors, next);
  }

  const isUpiConfigured = upi.upiId.trim().length > 3 && upi.upiId.includes("@");

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
