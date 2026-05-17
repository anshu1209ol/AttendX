import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynhyopxrrpiqiqeljkqy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaHlvcHhycnBpcWlxZWxqa3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDI3NTcsImV4cCI6MjA5MDQ3ODc1N30.QcwlTtNegZPbi5DjEQcaRlbkw0d662LyguHx6XuNMvM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
