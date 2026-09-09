import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.");
}

type ClerkWindow = { Clerk?: { session?: { getToken: () => Promise<string | null> } } };

// When Clerk is configured, this hands Clerk's session token to every
// PostgREST/Storage request; Supabase's Third-Party Auth integration then
// verifies it and exposes the Clerk user id via auth.jwt() for RLS. When
// Clerk isn't configured, window.Clerk is undefined and every request stays
// anonymous, exactly as before this bridge existed.
export const supabase = createClient(url, key, {
  accessToken: async () => {
    try {
      return (await (window as unknown as ClerkWindow).Clerk?.session?.getToken()) ?? null;
    } catch {
      return null;
    }
  },
});
