export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("91") && digits.length === 12 ? digits : `91${digits}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

/** Plain reminder — no payment info at all. */
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
 * Reminder with UPI payment info.
 * - paymentLink: optional — shows a tap-to-pay web link
 * - upiId: optional — shows the raw UPI ID for direct payment
 * At least one should be provided; both together give tenants two ways to pay.
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

  const linkSection = paymentLink
    ? `\n\n👇 *Tap to pay:*\n${paymentLink}`
    : "";

  const upiSection = upiId
    ? `\n\n💸 *Or pay directly via UPI:*\nUPI ID: *${upiId}*\nAmount: *₹${amount.toLocaleString("en-IN")}*\nRemarks: Room ${roomNumber} ${month}`
    : "";

  return (
    `Dear ${tenantName},\n\n` +
    `Your rent of *₹${amount.toLocaleString("en-IN")}* for *${month}* (Room ${roomNumber}) is${due ? ` due on *${due}*` : " pending"}.` +
    linkSection +
    upiSection +
    `\n\nThank you! 🙏\n— PG Manager`
  );
}
