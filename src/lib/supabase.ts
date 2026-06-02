import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client — null when env vars aren't set (local dev without Supabase).
 * All code that uses Supabase must guard against null.
 */
export const supabase = url && key ? createClient(url, key) : null;

/** True when Supabase env vars are present and the client is initialised. */
export const isSupabaseEnabled = Boolean(supabase);

// ── Database row types (snake_case mirrors the Postgres columns) ──────────────

export interface DbProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface DbPg {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  created_at: string;
}

export interface DbTenant {
  id: string;
  pg_id: string;
  name: string;
  phone: string;
  email: string;
  room_number: string;
  rent_amount: number;
  move_in_date: string;
  payment_status: string;
  avatar: string;
  emergency_contact: string;
  emergency_phone: string;
  id_proof_type: string;
  id_proof_number: string;
  occupation: string;
  rent_due_day: number;
  security_deposit: number;
  advance_paid: number;
  food_preference: string;
  amenities: string[];
  notes: string;
}

export interface DbRoom {
  id: string;
  pg_id: string;
  number: string;
  floor: number;
  type: string;
  status: string;
  tenant_id: string | null;
  tenant_name: string | null;
  rent_amount: number;
  amenities: string[];
}

export interface DbPayment {
  id: string;
  pg_id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  month: string;
}

export interface DbNotice {
  id: string;
  pg_id: string;
  title: string;
  message: string;
  recipient: string;
  recipient_id: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
}
