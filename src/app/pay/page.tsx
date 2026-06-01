"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { CheckCircle2, CreditCard, Building2, AlertCircle } from "lucide-react";

function PaymentContent() {
  const params = useSearchParams();

  const name = params.get("name") || "";
  const room = params.get("room") || "";
  const amount = Number(params.get("amount") || "0");
  const month = params.get("month") || "";
  const phone = params.get("phone") || "";
  const keyId = params.get("key") || "";
  const pgName = params.get("pg") || "PG Manager";
  const currency = params.get("currency") || "INR";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [paymentId, setPaymentId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValid = name && room && amount > 0 && month && keyId.startsWith("rzp_");

  async function handlePay() {
    setStatus("loading");
    try {
      await openRazorpayCheckout({
        key: keyId,
        amount: amount * 100,
        currency,
        name: pgName,
        description: `Rent for ${month} – Room ${room}`,
        prefill: { name, contact: phone },
        notes: { room, month },
        theme: { color: "#4f46e5" },
        handler: (res) => {
          setPaymentId(res.razorpay_payment_id);
          setStatus("success");
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setStatus("error");
    }
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid Payment Link</h2>
          <p className="text-sm text-gray-500">This payment link is incomplete or has expired. Please contact your PG owner for a new link.</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
          <p className="text-sm text-gray-500 mb-5">Thank you, {name.split(" ")[0]}. Your rent for {month} has been received.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-semibold text-gray-900">₹{amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Month</span>
              <span className="text-gray-700">{month}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Room</span>
              <span className="text-gray-700">{room}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment ID</span>
              <span className="text-xs text-gray-500 font-mono break-all">{paymentId}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">Save this page as a receipt. Payment ID confirms successful transaction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
            <Building2 size={26} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">{pgName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Rent Payment Request</p>
        </div>

        {/* Details card */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Tenant</span>
            <span className="text-sm font-semibold text-gray-900">{name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Room</span>
            <span className="text-sm text-gray-700">Room {room}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Month</span>
            <span className="text-sm text-gray-700">{month}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Amount Due</span>
            <span className="text-xl font-bold text-indigo-600">₹{amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {status === "error" && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={status === "loading"}
          className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait text-sm"
        >
          <CreditCard size={16} />
          {status === "loading" ? "Opening Payment…" : `Pay ₹${amount.toLocaleString("en-IN")}`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Secured by <span className="font-semibold text-[#072654]">Razorpay</span> · UPI, Card, Net Banking, Wallet
        </p>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
