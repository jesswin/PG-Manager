"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import { isDemoMode, DEMO_PG_ID } from "@/lib/demo";
import { useAuth } from "@/store/AuthContext";

const STORAGE_KEY = "pgm_onboarding";

export interface PGProfile {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface OwnerProfile {
  name: string;
  email: string;
  phone: string;
}

interface OnboardingContextType {
  isOnboarded: boolean;
  hydrated: boolean;
  owner: OwnerProfile;
  pgs: PGProfile[];
  activePgId: string;
  activePg: PGProfile | undefined;
  completeOnboarding: (owner: OwnerProfile, pgs: PGProfile[]) => Promise<void>;
  addPg: (pg: Omit<PGProfile, "id">) => Promise<string>;
  switchPg: (id: string) => void;
  updateOwnerProfile: (data: Partial<OwnerProfile>) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [hydrated, setHydrated]       = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [owner, setOwner]             = useState<OwnerProfile>({ name: "", email: "", phone: "" });
  const [pgs, setPgs]                 = useState<PGProfile[]>([]);
  const [activePgId, setActivePgId]   = useState("");

  // ── Load data ────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Demo mode
    if (isDemoMode()) {
      setOwner({ name: "Ramesh Agarwal", phone: "9876543210", email: "demo@pgmanager.app" });
      setPgs([{ id: DEMO_PG_ID, name: "Sunshine PG", address: "123 MG Road", city: "Bangalore" }]);
      setActivePgId(DEMO_PG_ID);
      setIsOnboarded(true);
      setHydrated(true);
      return;
    }

    if (isSupabaseEnabled) {
      // Supabase: data loaded once the user is authenticated
      if (!isAuthenticated || !user) {
        setHydrated(true);
        return;
      }
      loadFromSupabase(user.id);
    } else {
      // localStorage fallback
      loadFromLocalStorage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  async function loadFromSupabase(userId: string) {
    if (!supabase) return;
    const [profileRes, pgsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("pgs").select("*").eq("owner_id", userId).order("created_at"),
    ]);

    if (profileRes.data) {
      setOwner({
        name: profileRes.data.name ?? "",
        email: profileRes.data.email ?? "",
        phone: profileRes.data.phone ?? "",
      });
    }

    if (pgsRes.data && pgsRes.data.length > 0) {
      const mappedPgs = pgsRes.data.map((pg) => ({
        id: pg.id,
        name: pg.name,
        address: pg.address ?? "",
        city: pg.city ?? "",
      }));
      setPgs(mappedPgs);
      setIsOnboarded(true);

      // Restore last active PG from localStorage (cross-session preference)
      const savedActiveId = localStorage.getItem(`pgm_active_pg_${userId}`);
      const validId = mappedPgs.find((p) => p.id === savedActiveId)?.id ?? mappedPgs[0].id;
      setActivePgId(validId);
    }

    setHydrated(true);
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.isOnboarded) setIsOnboarded(true);
        if (data.owner) setOwner(data.owner);
        if (Array.isArray(data.pgs)) setPgs(data.pgs);
        if (data.activePgId) setActivePgId(data.activePgId);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }

  // ── Persist active PG choice ─────────────────────────────────────────────────

  useEffect(() => {
    if (!activePgId || isDemoMode()) return;
    if (isSupabaseEnabled && user?.id) {
      localStorage.setItem(`pgm_active_pg_${user.id}`, activePgId);
    } else if (!isSupabaseEnabled && hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnboarded, owner, pgs, activePgId }));
      } catch { /* ignore */ }
    }
  }, [activePgId, isOnboarded, owner, pgs, hydrated, user?.id]);

  // ── Complete onboarding ───────────────────────────────────────────────────────

  const completeOnboarding = useCallback(async (ownerData: OwnerProfile, pgList: PGProfile[]) => {
    if (supabase && user) {
      // Upsert profile
      await supabase.from("profiles").upsert({
        id: user.id,
        name: ownerData.name,
        phone: ownerData.phone,
        email: ownerData.email,
      });
      // Insert PGs
      const inserts = pgList.map((pg) => ({
        owner_id: user.id,
        name: pg.name,
        address: pg.address,
        city: pg.city,
      }));
      const { data: created } = await supabase.from("pgs").insert(inserts).select();
      if (created && created.length > 0) {
        const mapped = created.map((pg) => ({ id: pg.id, name: pg.name, address: pg.address, city: pg.city }));
        setOwner(ownerData);
        setPgs(mapped);
        setActivePgId(mapped[0].id);
        setIsOnboarded(true);
        return;
      }
    }
    // localStorage fallback
    setOwner(ownerData);
    setPgs(pgList);
    setActivePgId(pgList[0]?.id ?? "");
    setIsOnboarded(true);
  }, [user]);

  // ── Add a new PG ─────────────────────────────────────────────────────────────

  const addPg = useCallback(async (data: Omit<PGProfile, "id">): Promise<string> => {
    if (supabase && user) {
      const { data: created } = await supabase.from("pgs")
        .insert({ owner_id: user.id, name: data.name, address: data.address, city: data.city })
        .select()
        .single();
      if (created) {
        const newPg: PGProfile = { id: created.id, name: created.name, address: created.address, city: created.city };
        setPgs((prev) => [...prev, newPg]);
        return created.id;
      }
    }
    // localStorage fallback
    const id = `pg${Date.now()}`;
    setPgs((prev) => [...prev, { ...data, id }]);
    return id;
  }, [user]);

  // ── Switch active PG ──────────────────────────────────────────────────────────

  const switchPg = useCallback((id: string) => {
    setActivePgId(id);
  }, []);

  // ── Update owner profile ──────────────────────────────────────────────────────

  const updateOwnerProfile = useCallback(async (data: Partial<OwnerProfile>) => {
    const next = { ...owner, ...data };
    setOwner(next);
    if (supabase && user) {
      await supabase.from("profiles").upsert({ id: user.id, ...next });
    }
  }, [owner, user]);

  const activePg = pgs.find((pg) => pg.id === activePgId);

  return (
    <OnboardingContext.Provider value={{
      isOnboarded, hydrated, owner, pgs, activePgId, activePg,
      completeOnboarding, addPg, switchPg, updateOwnerProfile,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be inside OnboardingProvider");
  return ctx;
}
