import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
const serviceKey = env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    throw new Error("FATAL ERROR: Supabase URL and/or Service Role Key are not defined in your .env file for server-side operations.");
}


// This admin client uses a PRIVATE environment variable and is ONLY for server-side use.
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceKey,
  { auth: { persistSession: false } }
);