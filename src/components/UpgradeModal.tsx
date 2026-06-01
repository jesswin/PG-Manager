"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { Lock, Zap, CheckCircle2 } from "lucide-react";
import { PLANS, PlanId } from "@/store/PlanContext";

interface Props {
  open: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: PlanId;
}

export default function UpgradeModal({ open, onClose, featureName, requiredPlan }: Props) {
  const router = useRouter();
  const plan = PLANS[requiredPlan];

  const highlights: Record<PlanId, string[]> = {
    free: [],
    monthly: [
      "WhatsApp individual reminders",
      "Send & manage notices",
      "Export payments as CSV",
      "Due date reminder panel",
      "Up to 20 tenants & 30 rooms",
    ],
    quarterly: [
      "Everything in Monthly",
      "Bulk WhatsApp — send all reminders at once",
      "Unlimited tenants & rooms",
      "Priority support",
      "Save 20% vs monthly billing",
    ],
  };

  return (
    <Modal open={open} onClose={onClose} title="Upgrade Required" size="sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-indigo-500" />
        </div>

        <p className="text-sm text-gray-500 mb-1">This feature is locked</p>
        <p className="text-base font-semibold text-gray-900 mb-1">{featureName}</p>
        <p className="text-xs text-gray-400 mb-5">
          Available on the{" "}
          <span className={`font-semibold ${plan.color === "purple" ? "text-purple-600" : "text-indigo-600"}`}>
            {plan.name}
          </span>{" "}
          plan and above.
        </p>

        <div className={`rounded-xl border p-4 mb-5 text-left ${requiredPlan === "quarterly" ? "border-purple-200 bg-purple-50" : "border-indigo-200 bg-indigo-50"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-bold ${requiredPlan === "quarterly" ? "text-purple-700" : "text-indigo-700"}`}>
              {plan.name} Plan
            </span>
            <span className={`text-sm font-bold ${requiredPlan === "quarterly" ? "text-purple-700" : "text-indigo-700"}`}>
              ₹{plan.price.toLocaleString("en-IN")}
              <span className="text-xs font-normal opacity-70 ml-1">{plan.period}</span>
            </span>
          </div>
          <ul className="space-y-2">
            {highlights[requiredPlan].map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 size={14} className={`shrink-0 mt-0.5 ${requiredPlan === "quarterly" ? "text-purple-500" : "text-indigo-500"}`} />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { onClose(); router.push("/pricing"); }}
            className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${requiredPlan === "quarterly" ? "bg-purple-600 hover:bg-purple-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            <Zap size={15} /> View Plans
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
            Later
          </button>
        </div>
      </div>
    </Modal>
  );
}
