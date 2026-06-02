"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

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
  completeOnboarding: (owner: OwnerProfile, pgs: PGProfile[]) => void;
  addPg: (pg: Omit<PGProfile, "id">) => string;
  switchPg: (id: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);
const STORAGE_KEY = "pgm_onboarding";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [owner, setOwner] = useState<OwnerProfile>({ name: "", email: "", phone: "" });
  const [pgs, setPgs] = useState<PGProfile[]>([]);
  const [activePgId, setActivePgId] = useState("");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnboarded, owner, pgs, activePgId }));
    } catch { /* ignore */ }
  }, [hydrated, isOnboarded, owner, pgs, activePgId]);

  const completeOnboarding = useCallback((ownerData: OwnerProfile, pgList: PGProfile[]) => {
    setOwner(ownerData);
    setPgs(pgList);
    setActivePgId(pgList[0]?.id ?? "");
    setIsOnboarded(true);
  }, []);

  const addPg = useCallback((data: Omit<PGProfile, "id">) => {
    const id = `pg${Date.now()}`;
    const newPg: PGProfile = { ...data, id };
    setPgs((prev) => [...prev, newPg]);
    return id;
  }, []);

  const switchPg = useCallback((id: string) => {
    setActivePgId(id);
  }, []);

  const activePg = pgs.find((pg) => pg.id === activePgId);

  return (
    <OnboardingContext.Provider value={{
      isOnboarded, hydrated, owner, pgs, activePgId, activePg,
      completeOnboarding, addPg, switchPg,
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
