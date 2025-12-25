// Toggle between Mock and Supabase services
import { SupabaseService } from './supabaseService';
import { MockApi } from './mockApi';

const IS_PRODUCTION = import.meta.env.PROD || !!import.meta.env.VITE_SUPABASE_URL;

export const ApiService = IS_PRODUCTION ? SupabaseService : MockApi;

// Re-export getUserCampaigns explicitly for type clarity
export const getUserCampaigns = (userId: string) => ApiService.getUserCampaigns(userId);
