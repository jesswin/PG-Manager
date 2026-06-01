export function whatsappUrl(phone: string, message: string): string {
  // Normalize to Indian international format: strip non-digits, prepend 91 if needed
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("91") && digits.length === 12 ? digits : `91${digits}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function rentReminderMessage(tenantName: string, roomNumber: string, amount: number, month: string, dueDate?: string): string {
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

export function rentReminderWithLink(
  tenantName: string,
  roomNumber: string,
  amount: number,
  month: string,
  paymentLink: string,
  dueDate?: string,
): string {
  const due = dueDate
    ? new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  return (
    `Dear ${tenantName},\n\n` +
    `Your rent of *₹${amount.toLocaleString("en-IN")}* for *${month}* (Room ${roomNumber}) is${due ? ` due on *${due}*` : " pending"}.\n\n` +
    `💳 *Pay instantly here:*\n${paymentLink}\n\n` +
    `Supports UPI, Card, Net Banking & Wallet.\n\n` +
    `Thank you! 🙏\n— PG Manager`
  );
}
