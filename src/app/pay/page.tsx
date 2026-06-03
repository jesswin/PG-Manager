"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildUpiLink } from "@/lib/upi";
import {
  Building2, CheckCircle2, AlertCircle, Copy, Smartphone, IndianRupee,
} from "lucide-react";

function PaymentContent() {
  const params = useSearchParams();

  const name    = params.get("name") || "";
  const room    = params.get("room") || "";
  const amount  = Number(params.get("amount") || "0");
  const month   = params.get("month") || "";
  const upiId   = params.get("upi") || "";
  const upiName = params.get("upiName") || params.get("pg") || "PG Manager";
  const pgName  = params.get("pg") || "PG Manager";

  const [copied, setCopied] = useState(false);

  const isValid = name && room && amount > 0 && month && upiId.includes("@");

  const upiLink = isValid
    ? buildUpiLink({ upiId, upiName, amount, description: `Room ${room} Rent ${month}` })
    : "";

  function copyUpiId() {
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid Payment Link</h2>
          <p className="text-sm text-gray-500">This link is incomplete or has expired. Please contact your PG owner for a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{pgName}</h1>
          <p className="text-sm text-gray-500 mt-1">Rent Payment</p>
        </div>

        {/* Payment card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-center">
            <p className="text-indigo-200 text-sm mb-1">Amount Due</p>
            <div className="flex items-center justify-center gap-1">
              <IndianRupee size={24} className="text-white" />
              <span className="text-4xl font-extrabold text-white">{amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="px-6 py-4 space-y-3">
            {[
              { label: "Tenant", value: name },
              { label: "Room",   value: `Room ${room}` },
              { label: "Month",  value: month },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pay via UPI button — deep link opens any UPI app */}
        <a
          href={upiLink}
          className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200 mb-3"
        >
          <Smartphone size={20} />
          Open UPI App to Pay
        </a>
        <p className="text-center text-xs text-gray-400 mb-5">
          Opens GPay, PhonePe, Paytm, BHIM or any UPI app installed on your phone
        </p>

        {/* Manual UPI ID */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Or pay manually</p>
          <p className="text-xs text-gray-500 mb-3">Open any UPI app → Send Money → enter this UPI ID:</p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="flex-1 text-sm font-mono font-semibold text-gray-900 truncate">{upiId}</span>
            <button
              onClick={copyUpiId}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${copied ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"}`}
            >
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            After payment, inform your PG owner or show the payment screenshot.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
