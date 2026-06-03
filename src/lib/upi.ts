/** Builds a UPI deep-link that opens any UPI app (GPay, PhonePe, Paytm, etc.) */
export function buildUpiLink(opts: {
  upiId: string;
  upiName: string;
  amount: number;
  description: string;
}): string {
  const params = new URLSearchParams({
    pa: opts.upiId,
    pn: opts.upiName,
    am: String(opts.amount),
    cu: "INR",
    tn: opts.description,
  });
  return `upi://pay?${params.toString()}`;
}

/** Builds the /pay page URL that tenants click in WhatsApp. */
export function buildUpiPayPageUrl(opts: {
  tenantName: string;
  roomNumber: string;
  amount: number;
  month: string;
  phone: string;
  upiId: string;
  upiName: string;
  pgName: string;
}): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams({
    name: opts.tenantName,
    room: opts.roomNumber,
    amount: String(opts.amount),
    month: opts.month,
    phone: opts.phone,
    upi: opts.upiId,
    upiName: opts.upiName,
    pg: opts.pgName,
  });
  return `${base}/pay?${params.toString()}`;
}
