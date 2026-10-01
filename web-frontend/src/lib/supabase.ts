import { createClient } from "@supabase/supabase-js";

/* ============================================================
   ENVIRONMENT VARIABLES
============================================================ */

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

/* ============================================================
   VALIDATION
============================================================ */

if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL is missing. Add it to your web .env file."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY is missing. Add it to your web .env file."
  );
}

/* ============================================================
   SUPABASE CLIENT
============================================================ */

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      /*
       * Browser session will remain available
       * after page refresh / browser restart.
       */
      persistSession: true,

      /*
       * Automatically refresh expired access tokens.
       */
      autoRefreshToken: true,

      /*
       * Web browser storage.
       */
      storage: window.localStorage,

      /*
       * IMPORTANT FOR WEB OAUTH
       *
       * Google / Facebook:
       *
       * Supabase
       *   ↓
       * OAuth provider
       *   ↓
       * redirect back to Web
       *   ↓
       * Supabase detects session from URL
       */
      detectSessionInUrl: true,
    },
  }
);