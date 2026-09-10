import { PostgrestClient } from "@supabase/postgrest-js";
import { StorageClient } from "@supabase/storage-js";

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
async function getAccessToken(): Promise<string | null> {
  try {
    return (await (window as unknown as ClerkWindow).Clerk?.session?.getToken()) ?? null;
  } catch {
    return null;
  }
}

// This app only ever calls .from()/.rpc() (PostgREST) and .storage -- never
// Supabase Auth, Realtime, or Edge Functions. @supabase/supabase-js bundles
// all of those unconditionally (its GoTrueClient import alone is the single
// largest dependency in the build), so this composes just the two pieces we
// actually use directly, replicating supabase-js's own header logic for
// apikey/Authorization -- see its fetchWithAuth in dist/index.mjs.
async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (!headers.has("apikey")) headers.set("apikey", key);
  if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token ?? key}`);
  return fetch(input, { ...init, headers });
}

const rest = new PostgrestClient(new URL("rest/v1", url).href, { schema: "public", fetch: fetchWithAuth });
const storage = new StorageClient(new URL("storage/v1", url).href, {}, fetchWithAuth);

export const supabase = {
  from: rest.from.bind(rest),
  rpc: rest.rpc.bind(rest),
  storage,
};
