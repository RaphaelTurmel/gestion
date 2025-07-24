import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("FATAL ERROR: Supabase URL and Anon Key are not defined in your .env file. The application cannot start.");
}

// This client uses PUBLIC environment variables and is safe to use in the browser.
export const supabase = createClient(
    supabaseUrl, 
    supabaseAnonKey
);