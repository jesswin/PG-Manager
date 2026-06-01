import { PaymentStatus, RoomStatus, NoticeStatus } from "@/data/mock";

type BadgeVariant = PaymentStatus | RoomStatus | NoticeStatus;

interface StatusBadgeProps {
  status: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Unpaid: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Partial: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Occupied: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  Vacant: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  Sent: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Draft: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const styles = variantStyles[status] ?? "bg-gray-100 text-gray-600";
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${styles}`}>
      {status}
    </span>
  );
}
