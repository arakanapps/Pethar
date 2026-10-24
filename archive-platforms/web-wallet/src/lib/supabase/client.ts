import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    'https://uklqksioruxvatwpvopm.supabase.co'

  const key =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    'sb_publishable_rUiqzJYfjRLzNK0d6xyg-g_5Z6WmTya'

  return createBrowserClient(url, key)
}
