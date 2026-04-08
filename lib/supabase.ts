import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env file. Falling back to Mock API...');
}

// Export a real client if configured, otherwise a dummy object that prevents crashes
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            setSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
            signUp: async () => ({ data: { user: null, session: null }, error: null }),
            signOut: async () => ({ error: null }),
        },
        storage: {
            from: () => ({
                upload: async () => ({ data: null, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
            }),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        single: async () => ({ data: null, error: null }),
                        then: () => { },
                    }),
                    single: async () => ({ data: null, error: null }),
                }),
                order: () => ({
                    limit: () => ({
                        single: async () => ({ data: null, error: null }),
                    }),
                }),
                single: async () => ({ data: null, error: null }),
            }),
            insert: () => ({
                select: () => ({
                    single: async () => ({ data: null, error: null }),
                }),
            }),
            update: () => ({
                eq: () => ({
                    select: () => ({
                        single: async () => ({ data: null, error: null }),
                    }),
                }),
            }),
        }),
        channel: () => ({
            on: () => ({
                subscribe: () => ({ unsubscribe: () => { } }),
            }),
        }),
    } as any;

