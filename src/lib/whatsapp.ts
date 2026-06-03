export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("91") && digits.length === 12 ? digits : `91${digits}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function rentReminderMessage(
  tenantName: string,
  roomNumber: string,
  amount: number,
  month: string,
  dueDate?: string,
): string {
  const due = dueDate
    ? new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  return (
    `Dear ${tenantName},\n\n` +
    `This is a friendly reminder that your rent of *₹${amount.toLocaleString("en-IN")}* for *${month}* (Room ${roomNumber}) is${due ? ` due on *${due}*` : " pending"}.\n\n` +
    `Please make the payment at the earliest to avoid any late fees.\n\n` +
    `Thank you! 🙏\n— PG Manager`
  );
}

/**
 * Reminder message that includes:
 * 1. A tap-to-pay link (opens /pay page with UPI deep-link button)
 * 2. The raw UPI ID + amount as a manual fallback
 * This ensures tenants can always pay even if the link doesn't open.
 */
export function rentReminderWithLink(
  tenantName: string,
  roomNumber: string,
  amount: number,
  month: string,
  paymentLink: string,
  dueDate?: string,
  upiId?: string,
): string {
  const due = dueDate
    ? new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const upiSection = upiId
    ? `\n\n💸 *Or pay directly via UPI:*\nUPI ID: *${upiId}*\nAmount: *₹${amount.toLocaleString("en-IN")}*\nRemarks: Room ${roomNumber} ${month}`
    : "";
  return (
    `Dear ${tenantName},\n\n` +
    `Your rent of *₹${amount.toLocaleString("en-IN")}* for *${month}* (Room ${roomNumber}) is${due ? ` due on *${due}*` : " pending"}.\n\n` +
    `👇 *Tap to pay instantly:*\n${paymentLink}` +
    upiSection +
    `\n\nThank you! 🙏\n— PG Manager`
  );
}
