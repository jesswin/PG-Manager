"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type PlanId = "free" | "monthly" | "quarterly";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;        // INR
  period: string;
  color: string;
  badge: string;
  maxTenants: number;   // Infinity = unlimited
  maxRooms: number;
  features: {
    whatsappIndividual: boolean;
    whatsappBulk: boolean;
    notices: boolean;
    exportCsv: boolean;
    dueReminders: boolean;
    prioritySupport: boolean;
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
    maxTenants: 5,
    maxRooms: 10,
    features: {
      whatsappIndividual: false,
      whatsappBulk: false,
      notices: false,
      exportCsv: false,
      dueReminders: false,
      prioritySupport: false,
    },
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: 499,
    period: "per month",
    color: "indigo",
    badge: "bg-indigo-100 text-indigo-700",
    maxTenants: 20,
    maxRooms: 30,
    features: {
      whatsappIndividual: true,
      whatsappBulk: false,
      notices: true,
      exportCsv: true,
      dueReminders: true,
      prioritySupport: false,
    },
  },
  quarterly: {
    id: "quarterly",
    name: "Quarterly",
    price: 1199,
    period: "per quarter",
    color: "purple",
    badge: "bg-purple-100 text-purple-700",
    maxTenants: Infinity,
    maxRooms: Infinity,
    features: {
      whatsappIndividual: true,
      whatsappBulk: true,
      notices: true,
      exportCsv: true,
      dueReminders: true,
      prioritySupport: true,
    },
  },
};

interface PlanContextType {
  plan: Plan;
  setPlan: (id: PlanId) => void;
  can: (feature: keyof Plan["features"]) => boolean;
  withinLimit: (what: "tenants" | "rooms", count: number) => boolean;
}

const PlanContext = createContext<PlanContextType | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState<PlanId>("free");
  const plan = PLANS[planId];

  function can(feature: keyof Plan["features"]): boolean {
    return plan.features[feature];
  }

  function withinLimit(what: "tenants" | "rooms", count: number): boolean {
    const limit = what === "tenants" ? plan.maxTenants : plan.maxRooms;
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
