import { Campaign, CampaignStatus, Pledge, PledgeStatus, Donation, User, UserRole } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 'u1', fullName: 'John Doe', email: 'john@example.com', role: UserRole.USER, balance: 500000 },
  { id: 'u2', fullName: 'Sarah K', email: 'sarah@example.com', role: UserRole.CREATOR, balance: 0 },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    ownerId: 'u2',
    title: 'Clean Water for Kla Village',
    description: `<h3>Water is Life</h3>
    <p>We need to build a new borehole for the community. Access to clean water is a fundamental human right, yet the villagers currently walk over 5km every day to fetch water that is often unsafe to drink.</p>
    <blockquote>"Last year alone, we saw 50 cases of typhoid. This borehole will change everything." - Village Elder</blockquote>
    <p>This project will construct a solar-powered borehole that will serve over <strong>300 families</strong>. The funds will be used for:</p>
    <ul>
      <li>Drilling and casing (60%)</li>
      <li>Solar pump installation (30%)</li>
      <li>Community training (10%)</li>
    </ul>
    <p>Your contribution goes directly to materials and labor.</p>`,
    category: 'Community',
    targetAmount: 5000000,
    raisedAmount: 1250000,
    pledgedAmount: 500000,
    imageUrls: [
      'https://picsum.photos/800/400?random=1',
      'https://picsum.photos/800/400?random=11',
      'https://picsum.photos/800/400?random=12'
    ],
    startDate: '2023-10-01',
    endDate: '2024-03-01',
    status: CampaignStatus.APPROVED
  },
  {
    id: 'c2',
    ownerId: 'u2',
    title: 'School Fees for 50 Kids',
    description: `<h3>Education is the Key</h3>
    <p>Help us send 50 underprivileged children to school this term. Many of these children are orphans or come from single-parent households that cannot afford basic tuition.</p>
    <p>With your help, we can cover:</p>
    <ul>
      <li>School fees for the full year</li>
      <li>Two sets of uniforms per child</li>
      <li>Scholastic materials (books, pens, sets)</li>
    </ul>
    <p>Every UGX 50,000 keeps a child in class for a month.</p>`,
    category: 'Education',
    targetAmount: 2000000,
    raisedAmount: 800000,
    pledgedAmount: 100000,
    imageUrls: ['https://picsum.photos/800/400?random=2'],
    startDate: '2023-11-01',
    endDate: '2024-02-15',
    status: CampaignStatus.APPROVED
  },
  {
    id: 'c3',
    ownerId: 'u2',
    title: 'Community Sports Center',
    description: `<p>We want to renovate the local football pitch and build a small community center for the youth.</p>`,
    category: 'Sports',
    targetAmount: 15000000,
    raisedAmount: 0,
    pledgedAmount: 0,
    imageUrls: ['https://picsum.photos/800/400?random=3'],
    startDate: '2023-12-01',
    endDate: '2024-06-01',
    status: CampaignStatus.PENDING
  }
];

let pledges: Pledge[] = [];
let donations: Donation[] = [];
let campaigns = [...MOCK_CAMPAIGNS];

export const MockApi = {
  getCampaigns: async (): Promise<Campaign[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(campaigns.filter(c => c.status === CampaignStatus.APPROVED)), 500);
    });
  },

  getAllCampaigns: async (): Promise<Campaign[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...campaigns]), 500);
    });
  },

  getCampaignById: async (id: string): Promise<Campaign | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(campaigns.find(c => c.id === id)), 300);
    });
  },

  createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    return new Promise((resolve) => {
      const newCampaign: Campaign = {
        id: `c${Date.now()}`,
        ownerId: 'u2', // Hardcoded for demo
        title: campaignData.title || 'Untitled',
        description: campaignData.description || '',
        category: campaignData.category || 'General',
        targetAmount: campaignData.targetAmount || 0,
        raisedAmount: 0,
        pledgedAmount: 0,
        imageUrls: campaignData.imageUrls && campaignData.imageUrls.length > 0
          ? campaignData.imageUrls
          : [`https://picsum.photos/800/400?random=${Date.now()}`],
        startDate: new Date().toISOString(),
        endDate: campaignData.endDate || new Date().toISOString(),
        status: CampaignStatus.PENDING // Default to PENDING for admin approval flow
      };
      campaigns.push(newCampaign);
      setTimeout(() => resolve(newCampaign), 800);
    });
  },

  getUserCampaigns: async (userId: string): Promise<Campaign[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(campaigns.filter(c => c.ownerId === userId)), 500);
    });
  },

  createPledge: async (userId: string, campaignId: string, amount: number, dueDate: string): Promise<Pledge> => {
    return new Promise((resolve) => {
      const newPledge: Pledge = {
        id: `p${Date.now()}`,
        userId,
        campaignId,
        amount,
        dueDate,
        status: PledgeStatus.PENDING,
        createdAt: new Date().toISOString()
      };
      pledges.push(newPledge);

      // Update campaign stats
      const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
      if (campaignIndex > -1) {
        campaigns[campaignIndex].pledgedAmount += amount;
      }

      setTimeout(() => resolve(newPledge), 600);
    });
  },

  createDonation: async (userId: string, campaignId: string, amount: number, method: 'MTN' | 'AIRTEL' | 'VISA'): Promise<Donation> => {
    return new Promise((resolve) => {
      const newDonation: Donation = {
        id: `d${Date.now()}`,
        userId,
        campaignId,
        amount,
        paymentMethod: method,
        createdAt: new Date().toISOString()
      };
      donations.push(newDonation);

      // Update campaign stats
      const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
      if (campaignIndex > -1) {
        campaigns[campaignIndex].raisedAmount += amount;
      }

      setTimeout(() => resolve(newDonation), 600);
    });
  },

  getUserPledges: async (userId: string): Promise<Pledge[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(pledges.filter(p => p.userId === userId)), 400);
    });
  },

  getUserDonations: async (userId: string): Promise<Donation[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(donations.filter(d => d.userId === userId)), 400);
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    return MOCK_USERS[0];
  },

  signUp: async (email: string, password: string, fullName: string) => {
    console.log('Mock Sign Up:', { email, password, fullName });
    return { user: { id: 'mock-id', email } };
  },

  signIn: async (email: string, password: string) => {
    console.log('Mock Sign In:', { email, password });
    return { user: { id: 'u1', email } };
  },

  signInWithGoogle: async () => {
    console.log('Mock Google Sign In');
    return { user: { id: 'u1', email: 'google-user@example.com' } };
  },

  signOut: async () => {
    console.log('Mock Sign Out');
  },

  uploadImage: async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  },

  getAdminStats: async (): Promise<{ totalRaised: number, totalPledged: number, totalUsers: number, totalCampaigns: number, pendingCampaigns: number }> => {
    return new Promise((resolve) => {
      const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
      const totalPledged = campaigns.reduce((acc, c) => acc + c.pledgedAmount, 0);
      const pendingCampaigns = campaigns.filter(c => c.status === CampaignStatus.PENDING).length;
      setTimeout(() => resolve({
        totalRaised,
        totalPledged,
        totalUsers: MOCK_USERS.length,
        totalCampaigns: campaigns.length,
        pendingCampaigns
      }), 500);
    });
  },

  updateCampaignStatus: async (id: string, status: CampaignStatus) => {
    console.log('Mock Update Status:', { id, status });
    return { id, status };
  },

  subscribeToCampaignUpdates: (_campaignId: string, _callback: (payload: any) => void) => {
    console.log('Mock Subscription');
    return { unsubscribe: () => { } };
  },

  subscribeToAllCampaignUpdates: (_callback: (payload: any) => void) => {
    console.log('Mock All Subscription');
    return { unsubscribe: () => { } };
  }
};