"use client";

import { usePlan, PLANS, PlanId } from "@/store/PlanContext";
import { ToastContainer, useToast } from "@/components/Toast";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CheckCircle2, Lock, Zap, Shield, Star, Crown } from "lucide-react";

const FEATURE_ROWS: { label: string; key: keyof typeof PLANS["free"]["features"] | "maxTenants" | "maxRooms" }[] = [
  { label: "Max Tenants", key: "maxTenants" },
  { label: "Max Rooms", key: "maxRooms" },
  { label: "WhatsApp Individual Reminder", key: "whatsappIndividual" },
  { label: "Due Reminder Panel", key: "dueReminders" },
  { label: "Bulk WhatsApp (Send All)", key: "whatsappBulk" },
  { label: "Notices (Compose & Send)", key: "notices" },
  { label: "Export Payments as CSV", key: "exportCsv" },
  { label: "Priority Support", key: "prioritySupport" },
];

function featureValue(plan: typeof PLANS["free"], key: string): string | boolean {
  if (key === "maxTenants") return plan.maxTenants === Infinity ? "Unlimited" : String(plan.maxTenants);
  if (key === "maxRooms") return plan.maxRooms === Infinity ? "Unlimited" : String(plan.maxRooms);
  return (plan.features as any)[key] as boolean;
}

const planIcons: Record<PlanId, React.ReactNode> = {
  free: <Shield size={22} className="text-gray-500" />,
  monthly: <Zap size={22} className="text-indigo-600" />,
  quarterly: <Crown size={22} className="text-purple-600" />,
};

const planStyles: Record<PlanId, { card: string; btn: string; badge: string; popular?: boolean }> = {
  free: {
    card: "border-gray-200",
    btn: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    badge: "bg-gray-100 text-gray-500",
  },
  monthly: {
    card: "border-indigo-300 shadow-indigo-100 shadow-lg",
    btn: "bg-indigo-600 text-white hover:bg-indigo-700",
    badge: "bg-indigo-100 text-indigo-700",
    popular: true,
  },
  quarterly: {
    card: "border-purple-300 shadow-purple-100 shadow-lg",
    btn: "bg-purple-600 text-white hover:bg-purple-700",
    badge: "bg-purple-100 text-purple-700",
  },
};

export default function PricingPage() {
  const { plan: currentPlan, setPlan } = usePlan();
  const { toasts, addToast, dismiss } = useToast();

  function activate(id: PlanId) {
    if (id === currentPlan.id) return;
    setPlan(id);
    addToast(`${PLANS[id].name} plan activated!${id !== "free" ? " All features unlocked." : ""}`);
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Pricing" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Choose a plan that fits your PG. Upgrade or downgrade anytime. Currently on{" "}
          <span className="font-semibold text-indigo-600">{currentPlan.name}</span> plan.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          const style = planStyles[id];
          const isActive = currentPlan.id === id;

          return (
            <div key={id} className={`relative bg-white rounded-2xl border-2 ${style.card} p-6 flex flex-col transition-all`}>
              {style.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star size={11} fill="white" /> Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.badge}`}>
                  {planIcons[id]}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{p.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>{p.id}</span>
                </div>
              </div>

              <div className="mb-6">
                {p.price === 0 ? (
                  <p className="text-3xl font-bold text-gray-900">Free</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">₹{p.price.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.period}</p>
                  </>
                )}
                {id === "quarterly" && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">Save ₹298 vs monthly</p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {FEATURE_ROWS.map(({ label, key }) => {
                  const val = featureValue(p, key);
                  const isString = typeof val === "string";
                  const enabled = isString ? true : val as boolean;
                  return (
                    <li key={key} className="flex items-center gap-2.5 text-sm">
                      {enabled ? (
                        <CheckCircle2 size={15} className={id === "quarterly" ? "text-purple-500 shrink-0" : "text-indigo-500 shrink-0"} />
                      ) : (
                        <Lock size={15} className="text-gray-300 shrink-0" />
                      )}
                      <span className={enabled ? "text-gray-700" : "text-gray-400"}>
                        {label}{isString ? <span className="font-semibold ml-1">{val}</span> : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={() => activate(id)}
                disabled={isActive}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${style.btn} ${isActive ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isActive ? "✓ Current Plan" : id === "free" ? "Downgrade to Free" : `Activate ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Full Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</th>
                {(Object.keys(PLANS) as PlanId[]).map((id) => (
                  <th key={id} className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide ${
                    currentPlan.id === id ? "text-indigo-600" : "text-gray-500"
                  }`}>
                    {PLANS[id].name}
                    {currentPlan.id === id && <span className="ml-1 text-[10px] normal-case">(active)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {FEATURE_ROWS.map(({ label, key }) => (
                <tr key={key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-700 font-medium">{label}</td>
                  {(Object.keys(PLANS) as PlanId[]).map((id) => {
                    const val = featureValue(PLANS[id], key);
                    const isString = typeof val === "string";
                    const enabled = isString ? true : val as boolean;
                    return (
                      <td key={id} className="px-4 py-3 text-center">
                        {isString ? (
                          <span className="font-semibold text-gray-800">{val}</span>
                        ) : enabled ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                        ) : (
                          <Lock size={15} className="text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Plans are simulated for demo purposes. No actual payment is charged.
      </p>
    </div>
  );
}
