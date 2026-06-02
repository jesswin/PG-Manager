"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type PlanId = "free" | "monthly" | "quarterly";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  color: string;
  badge: string;
  maxPgs: number;      // max PG properties — this is the key plan differentiator
  maxRooms: number;    // total rooms across all PGs
  maxTenants: number;  // always Infinity — tenants are unlimited on all plans
  features: {
    whatsappIndividual: boolean;
    whatsappBulk: boolean;
    notices: boolean;
    exportCsv: boolean;
    dueReminders: boolean;
    prioritySupport: boolean;
    moveOutModule: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    color: "gray",
    badge: "bg-gray-100 text-gray-600",
    maxPgs: 1,
    maxRooms: 10,
    maxTenants: Infinity,
    features: {
      whatsappIndividual: false,
      whatsappBulk: false,
      notices: false,
      exportCsv: false,
      dueReminders: false,
      prioritySupport: false,
      moveOutModule: true,   // available on all plans
    },
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: 499,
    period: "per month",
    color: "indigo",
    badge: "bg-indigo-100 text-indigo-700",
    maxPgs: 3,
    maxRooms: 50,
    maxTenants: Infinity,
    features: {
      whatsappIndividual: true,
      whatsappBulk: false,
      notices: true,
      exportCsv: true,
      dueReminders: true,
      prioritySupport: false,
      moveOutModule: true,
    },
  },
  quarterly: {
    id: "quarterly",
    name: "Quarterly",
    price: 1199,
    period: "per quarter",
    color: "purple",
    badge: "bg-purple-100 text-purple-700",
    maxPgs: Infinity,
    maxRooms: Infinity,
    maxTenants: Infinity,
    features: {
      whatsappIndividual: true,
      whatsappBulk: true,
      notices: true,
      exportCsv: true,
      dueReminders: true,
      prioritySupport: true,
      moveOutModule: true,
    },
  },
};

interface PlanContextType {
  plan: Plan;
  setPlan: (id: PlanId) => void;
  can: (feature: keyof Plan["features"]) => boolean;
  withinLimit: (what: "pgs" | "rooms", count: number) => boolean;
}

const PlanContext = createContext<PlanContextType | null>(null);
const PLAN_STORAGE_KEY = "pgm_plan_id";

export function PlanProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState<PlanId>("free");
  const plan = PLANS[planId];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved && Object.keys(PLANS).includes(saved)) setPlanId(saved as PlanId);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PLAN_STORAGE_KEY, planId); }
    catch { /* ignore */ }
  }, [planId]);

  function can(feature: keyof Plan["features"]): boolean {
    return plan.features[feature];
  }

  function withinLimit(what: "pgs" | "rooms", count: number): boolean {
    const limit = what === "pgs" ? plan.maxPgs : plan.maxRooms;
    return count < limit;
  }

  return (
    <PlanContext.Provider value={{ plan, setPlan: (id) => setPlanId(id), can, withinLimit }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be inside PlanProvider");
  return ctx;
}
