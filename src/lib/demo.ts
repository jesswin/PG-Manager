export const DEMO_MODE_KEY = "pgm_demo_mode";
export const DEMO_PG_ID    = "pg_demo";

export function isDemoMode(): boolean {
  try { return localStorage.getItem(DEMO_MODE_KEY) === "true"; }
  catch { return false; }
}

export function enterDemoMode(): void {
  localStorage.setItem(DEMO_MODE_KEY, "true");
}

/** Clears all demo keys so the user returns to a clean state. */
export function exitDemoMode(): void {
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem("pgm_onboarding");
  localStorage.removeItem("pgm_pg_data");
  localStorage.removeItem("pgm_auth_remember");
  sessionStorage.clear();
}
