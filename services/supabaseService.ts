import { supabase } from '../lib/supabase';
import { Campaign, CampaignStatus, Pledge, Donation, User, UserRole, PledgeStatus } from '../types';

export const SupabaseService = {
    // Campaigns
    getCampaigns: async (): Promise<Campaign[]> => {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('status', CampaignStatus.APPROVED)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(c => ({
            ...c,
            raisedAmount: Number(c.raised_amount) || 0,
            pledgedAmount: Number(c.pledged_amount) || 0,
            targetAmount: Number(c.target_amount) || 0,
            imageUrls: c.image_urls || [],
            startDate: c.start_date,
            endDate: c.end_date,
            ownerId: c.owner_id,
            // Organizer details
            organizerName: c.organizer_name,
            organizerPhone: c.organizer_phone,
            organizerLocation: c.organizer_location,
            relationship: c.relationship,
            beneficiaryName: c.beneficiary_name
        })) as Campaign[];
    },

    getAllCampaigns: async (): Promise<Campaign[]> => {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(c => ({
            ...c,
            raisedAmount: Number(c.raised_amount) || 0,
            pledgedAmount: Number(c.pledged_amount) || 0,
            targetAmount: Number(c.target_amount) || 0,
            imageUrls: c.image_urls || [],
            startDate: c.start_date,
            endDate: c.end_date,
            ownerId: c.owner_id,
            // Organizer details
            organizerName: c.organizer_name,
            organizerPhone: c.organizer_phone,
            organizerLocation: c.organizer_location,
            relationship: c.relationship,
            beneficiaryName: c.beneficiary_name
        })) as Campaign[];
    },

    getCampaignById: async (id: string): Promise<Campaign | null> => {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        if (!data) return null;
        return {
            ...data,
            raisedAmount: Number(data.raised_amount) || 0,
            pledgedAmount: Number(data.pledged_amount) || 0,
            targetAmount: Number(data.target_amount) || 0,
            imageUrls: data.image_urls || [],
            startDate: data.start_date,
            endDate: data.end_date,
            ownerId: data.owner_id,
            // Organizer details
            organizerName: data.organizer_name,
            organizerPhone: data.organizer_phone,
            organizerLocation: data.organizer_location,
            relationship: data.relationship,
            beneficiaryName: data.beneficiary_name
        } as Campaign;
    },

    createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('campaigns')
            .insert([{
                owner_id: user.id,
                title: campaignData.title,
                description: campaignData.description,
                category: campaignData.category,
                target_amount: campaignData.targetAmount,
                image_urls: campaignData.imageUrls || [],
                end_date: campaignData.endDate,
                status: CampaignStatus.PENDING,
                // Organizer details
                organizer_name: campaignData.organizerName,
                organizer_phone: campaignData.organizerPhone,
                organizer_location: campaignData.organizerLocation,
                relationship: campaignData.relationship,
                beneficiary_name: campaignData.beneficiaryName
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Campaign;
    },

    getUserCampaigns: async (userId: string): Promise<Campaign[]> => {
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(c => ({
            ...c,
            raisedAmount: Number(c.raised_amount) || 0,
            pledgedAmount: Number(c.pledged_amount) || 0,
            targetAmount: Number(c.target_amount) || 0,
            imageUrls: c.image_urls || [],
            startDate: c.start_date,
            endDate: c.end_date,
            ownerId: c.owner_id,
            // Organizer details
            organizerName: c.organizer_name,
            organizerPhone: c.organizer_phone,
            organizerLocation: c.organizer_location,
            relationship: c.relationship,
            beneficiaryName: c.beneficiary_name
        })) as Campaign[];
    },

    // Pledges
    createPledge: async (userId: string, campaignId: string, amount: number, dueDate: string): Promise<Pledge> => {
        const { data, error } = await supabase
            .from('pledges')
            .insert([{
                user_id: userId,
                campaign_id: campaignId,
                amount,
                due_date: dueDate,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Pledge;
    },

    getUserPledges: async (userId: string): Promise<Pledge[]> => {
        const { data, error } = await supabase
            .from('pledges')
            .select('*, campaigns(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data as Pledge[];
    },

    // Donations
    createDonation: async (userId: string, campaignId: string, amount: number, method: string): Promise<Donation> => {
        // Generate unique transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const { data, error } = await supabase
            .from('donations')
            .insert([{
                user_id: userId,
                campaign_id: campaignId,
                amount,
                payment_method: method,
                transaction_id: transactionId
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Donation;
    },

    getUserDonations: async (userId: string): Promise<Donation[]> => {
        const { data, error } = await supabase
            .from('donations')
            .select('*, campaigns(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data as Donation[];
    },

    getAllDonations: async () => {
        const { data, error } = await supabase
            .from('donations')
            .select(`
                *,
                profiles (full_name),
                campaigns (title)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(d => ({
            ...d,
            donorName: d.profiles?.full_name || 'Anonymous',
            campaignTitle: d.campaigns?.title || 'Unknown Campaign'
        }));
    },

    getAllPledges: async () => {
        const { data, error } = await supabase
            .from('pledges')
            .select(`
                *,
                profiles (full_name),
                campaigns (title)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(p => ({
            ...p,
            pledgerName: p.profiles?.full_name || 'Anonymous',
            campaignTitle: p.campaigns?.title || 'Unknown Campaign'
        }));
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !data) return null;
        return {
            ...data,
            fullName: data.full_name,
            balance: Number(data.balance) || 0,
            role: data.role || 'USER'
        } as User;
    },

    signUp: async (email: string, password: string, fullName: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
        if (error) throw error;

        // Profile is handled by a trigger in a real app, 
        // but let's ensure it exists if the trigger isn't set up yet.
        if (data.user) {
            await supabase.from('profiles').insert([{
                id: data.user.id,
                full_name: fullName,
                email: email,
                role: 'USER'
            }]);
        }
        return data;
    },

    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/',
            },
        });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    uploadImage: async (file: File): Promise<string> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `campaigns/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('campaign-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('campaign-images')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // Admin Stats
    getAdminStats: async () => {
        const { data: campaigns } = await supabase.from('campaigns').select('raised_amount, pledged_amount, status');
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        if (!campaigns) return { totalRaised: 0, totalPledged: 0, totalUsers: 0, totalCampaigns: 0, pendingCampaigns: 0 };

        return {
            totalRaised: campaigns.reduce((acc, c) => acc + (Number(c.raised_amount) || 0), 0),
            totalPledged: campaigns.reduce((acc, c) => acc + (Number(c.pledged_amount) || 0), 0),
            totalUsers: userCount || 0,
            totalCampaigns: campaigns.length,
            pendingCampaigns: campaigns.filter(c => c.status === CampaignStatus.PENDING).length
        };
    },

    updateCampaignStatus: async (id: string, status: CampaignStatus) => {
        const { data, error } = await supabase
            .from('campaigns')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    subscribeToCampaignUpdates: (campaignId: string, callback: (payload: any) => void) => {
        return supabase
            .channel(`campaign-${campaignId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'campaigns',
                    filter: `id=eq.${campaignId}`
                },
                callback
            )
            .subscribe();
    },

    subscribeToAllCampaignUpdates: (callback: (payload: any) => void) => {
        return supabase
            .channel('public-campaigns')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'campaigns'
                },
                callback
            )
            .subscribe();
    }
};
