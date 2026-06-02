/** Returns array of month labels like ["June 2026", "May 2026", ...] for the last `count` months. */
export function getRecentMonths(count = 8): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
  }
  return months;
}

/** "June 2026" — the running calendar month. */
export function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** "May 2026" — one month prior (where most recent completed payments land). */
export function getPreviousMonthLabel(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Given "June 2026", returns "2026-06-05" (5th of that month as the due date). */
export function monthLabelToDueDate(monthLabel: string): string {
  const d = new Date(`${monthLabel} 1`);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-05`;
}
