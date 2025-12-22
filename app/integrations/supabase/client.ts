
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://biczbxmaisdxpcbplddr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_G_5RZYmomd6zB_uFbRCDtw_rBflTxYk";

// Import the supabase client like this:
// import { supabase } from "@/app/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== '' && SUPABASE_PUBLISHABLE_KEY !== '';
};
