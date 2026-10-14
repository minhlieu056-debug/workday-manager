import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or runtime localStorage config
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('workday_supabase_url') || '';
  const localKey = localStorage.getItem('workday_supabase_anon_key') || '';

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isConfigured = Boolean(
    url && 
    anonKey && 
    !url.includes('your-project-id') && 
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Không thể khởi tạo Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, key);
    const { error } = await tempClient.from('profiles').select('id').limit(1);
    
    if (error) {
      return { success: false, message: `Lỗi kết nối: ${error.message}` };
    }
    return { success: true, message: 'Kết nối Supabase thành công! Dữ liệu đã sẵn sàng.' };
  } catch (err: any) {
    return { success: false, message: `Không thể kết nối: ${err.message || String(err)}` };
  }
}
