// Shared Supabase client, used for real user sign-up/sign-in. The URL and
// anon key are public client keys (see .env.example) — safe to ship in the
// bundle; access control is enforced by Postgres row-level security.
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
