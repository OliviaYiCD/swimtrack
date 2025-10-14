// lib/supabaseServer.js
import { cookies } from 'next/headers';
import { createServerClient, createBrowserClient } from '@supabase/ssr';

export async function getSupabaseServer() {
  // Client: return a browser Supabase instance (no cookies API).
  if (typeof window !== 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  // Server: use async cookies() correctly.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...(options || {}) });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...(options || {}), maxAge: 0 });
        },
      },
    }
  );
}