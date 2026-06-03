"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
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
  const { user, isAuthenticated } = useAuth();

  const [upi, setUpi]             = useState<UpiConfig>(DEFAULT_UPI);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [floors, setFloors]       = useState<string[]>(DEFAULT_FLOORS);
  const [roomTypes, setRoomTypes] = useState<string[]>(DEFAULT_ROOM_TYPES);

  // ── Load settings ────────────────────────────────────────────────────────────

  useEffect(() => {
    // Always load room config from localStorage (device-specific)
    try {
      const savedRoom = localStorage.getItem(ROOM_CONFIG_KEY);
      if (savedRoom) {
        const rc = JSON.parse(savedRoom);
        if (Array.isArray(rc.floors) && rc.floors.length) setFloors(rc.floors);
        if (Array.isArray(rc.roomTypes) && rc.roomTypes.length) setRoomTypes(rc.roomTypes);
      }
    } catch { /* ignore */ }

    if (isSupabaseEnabled && supabase && isAuthenticated && user) {
      // Load UPI + notif prefs from Supabase — synced across devices
      loadFromSupabase(user.id);
    } else {
      // Local mode: read from localStorage
      loadFromLocalStorage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  async function loadFromSupabase(userId: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("owner_settings")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();

    if (data) {
      setUpi({
        upiId: data.upi_id ?? "",
        upiName: data.upi_name ?? "",
        enabled: !!(data.upi_id && data.upi_id.includes("@")),
      });
      setNotifPrefs({
        autoSendEnabled: data.notif_auto_send ?? true,
        daysBeforeDue: data.notif_days_before_due ?? 3,
      });
    } else {
      // No DB row yet — check localStorage as migration fallback
      loadFromLocalStorage(false);
    }
  }

  function loadFromLocalStorage(setRoomConfigToo = true) {
    try {
      const savedUpi = localStorage.getItem("pgm_upi_config");
      if (savedUpi) setUpi({ ...DEFAULT_UPI, ...JSON.parse(savedUpi) });

      const savedNotif = localStorage.getItem("pgm_notif_prefs");
      if (savedNotif) setNotifPrefs({ ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(savedNotif) });
    } catch { /* ignore */ }
  }

  // ── Update UPI ───────────────────────────────────────────────────────────────

  function updateUpi(cfg: Partial<UpiConfig>) {
    setUpi((prev) => {
      const next = { ...prev, ...cfg, enabled: !!(cfg.upiId ?? prev.upiId)?.includes("@") };
      // Always save to localStorage as offline backup
      localStorage.setItem("pgm_upi_config", JSON.stringify(next));
      // Save to Supabase (persists across devices/deployments)
      if (supabase && user) {
        supabase.from("owner_settings").upsert({
          owner_id: user.id,
          upi_id: next.upiId,
          upi_name: next.upiName,
          updated_at: new Date().toISOString(),
        }).then(() => {}, () => {});
      }
      return next;
    });
  }

  // ── Update notification prefs ─────────────────────────────────────────────────

  function updateNotifPrefs(prefs: Partial<NotificationPrefs>) {
    setNotifPrefs((prev) => {
      const next = { ...prev, ...prefs };
      localStorage.setItem("pgm_notif_prefs", JSON.stringify(next));
      if (supabase && user) {
        supabase.from("owner_settings").upsert({
          owner_id: user.id,
          notif_auto_send: next.autoSendEnabled,
          notif_days_before_due: next.daysBeforeDue,
          updated_at: new Date().toISOString(),
        }).then(() => {}, () => {});
      }
      return next;
    });
  }

  // ── Room config (localStorage only — device preference) ────────────────────

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
