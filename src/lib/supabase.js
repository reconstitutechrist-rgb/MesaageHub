import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co'
)

// Create Supabase client (or null if not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Log configuration status in development
if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn(
    '[MessageHub] Supabase not configured. Running in demo mode. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable authentication.'
  )
}

export default supabase
