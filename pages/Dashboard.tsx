import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { Donation, Pledge, PledgeStatus, User, Campaign, CampaignStatus } from '../types';
import { Clock, CheckCircle, TrendingUp, ArrowRight, Plus, Rocket, Hourglass } from 'lucide-react';
import { MyCampaignCard } from '../components/MyCampaignCard';
import { calculateAllMetrics, DashboardMetrics } from '../lib/dashboardHelpers';

const SkeletonLoader: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 animate-pulse">
    <div className="h-10 w-64 bg-gray-200 rounded-xl mb-10"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="h-40 bg-gray-200 rounded-[2.5rem]"></div>
      <div className="h-40 bg-gray-200 rounded-[2.5rem]"></div>
      <div className="h-40 bg-gray-200 rounded-[2.5rem]"></div>
    </div>
    <div className="space-y-4">
      <div className="h-24 bg-gray-100 rounded-3xl"></div>
      <div className="h-24 bg-gray-100 rounded-3xl"></div>
      <div className="h-24 bg-gray-100 rounded-3xl"></div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState(false);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updatedCampaignTitle, setUpdatedCampaignTitle] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retry logic for OAuth session timing issues
        let currentUser = null;
        let retries = 0;
        const maxRetries = 3;

        while (!currentUser && retries < maxRetries) {
          currentUser = await ApiService.getCurrentUser();
          if (!currentUser && retries < maxRetries - 1) {
            console.log(`Waiting for session... (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
          } else {
            break;
          }
        }

        if (!currentUser) {
          console.log('No user session found after retries, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('User session established:', currentUser.email);
        setUser(currentUser);

        const [pData, dData, cData] = await Promise.all([
          ApiService.getUserPledges(currentUser.id),
          ApiService.getUserDonations(currentUser.id),
          ApiService.getUserCampaigns(currentUser.id)
        ]);
        setPledges(pData);
        setDonations(dData);
        setCampaigns(cData);

        // Calculate dashboard metrics
        if (currentUser.createdAt && dData && pData) {
          const calculatedMetrics = calculateAllMetrics(currentUser.createdAt, dData, pData);
          setMetrics(calculatedMetrics);
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        // Check for 406 (Not Acceptable) or 404 which indicates missing tables
        if (
          error.message?.includes('406') ||
          error.message?.includes('404') ||
          error.code === '42P01' || // Undefined table
          JSON.stringify(error).includes('406')
        ) {
          console.warn('Database setup issue detected');
          setSetupError(true);
          setLoading(false);
          return;
        }
        navigate('/login');
      } finally {
        // Only stop loading if we aren't showing the setup error (which handles its own loading state implied)
        if (!setupError) setLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Real-time updates for campaigns
  useEffect(() => {
    if (!user || campaigns.length === 0) return;

    // Subscribe to updates for each of the user's campaigns
    const subscriptions = campaigns.map(campaign => {
      return ApiService.subscribeToCampaignUpdates(campaign.id, (payload: any) => {
        if (payload.new) {
          console.log('Dashboard: Campaign update received:', payload);
          setCampaigns(prevCampaigns =>
            prevCampaigns.map(c =>
              c.id === payload.new.id
                ? {
                    ...c,
                    raisedAmount: Number(payload.new.raised_amount),
                    pledgedAmount: Number(payload.new.pledged_amount),
                    status: payload.new.status
                  }
                : c
            )
          );

          // Show notification
          setUpdatedCampaignTitle(payload.new.title);
          setShowUpdateNotification(true);
          setTimeout(() => setShowUpdateNotification(false), 4000);
        }
      });
    });

    // Cleanup all subscriptions
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user, campaigns]);


  if (loading) return <SkeletonLoader />;

  if (setupError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-24">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-brand-600 px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-xl text-2xl">🛠️</span>
                System Check: Setup Required
              </h1>
              <p className="text-brand-100 mt-2 font-medium">We detected a configuration issue with your database.</p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="bg-amber-50 border-l-8 border-amber-500 p-6 rounded-r-xl">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-amber-900">Database Tables Missing (Error 406/404)</h3>
                  <div className="mt-2 text-amber-800 font-medium">
                    <p>The application connected successfully, but the required tables (<code className="bg-amber-100 px-1 rounded text-amber-900 border border-amber-200">profiles</code>, <code className="bg-amber-100 px-1 rounded text-amber-900 border border-amber-200">campaigns</code>) were not found.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">How to Fix This (One-Time Setup)</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 font-medium">
                <li>Go to your <a href="https://supabase.com/dashboard/project/bsaxglwfolqpzdgfqgke/sql" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline decoration-2 underline-offset-2">Supabase SQL Editor</a>.</li>
                <li>Click <strong>New Query</strong>.</li>
                <li>Copy the code below and paste it into the editor.</li>
                <li>Click <strong>Run</strong>.</li>
                <li>Come back here and refresh the page.</li>
              </ol>
            </div>

            <div className="relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigator.clipboard.writeText(`
-- 1. DROP EVERYTHING (Clean Slate)
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.pledges CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE PROFILES
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'USER',
    balance DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. CREATE CAMPAIGNS
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    target_amount DECIMAL NOT NULL,
    raised_amount DECIMAL DEFAULT 0,
    pledged_amount DECIMAL DEFAULT 0,
    image_urls TEXT[] DEFAULT '{}',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaigns viewable by everyone" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Users can create" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 4. CREATE PLEDGES
CREATE TABLE public.pledges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own pledges" ON public.pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create pledges" ON public.pledges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
                  `)}
                  className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-md transition-all active:scale-95"
                >
                  Copy Script
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-2xl text-xs sm:text-sm overflow-x-auto font-mono h-80 shadow-inner border border-gray-800">
                {`-- 1. DROP EVERYTHING (Clean Slate)
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.pledges CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE PROFILES
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'USER',
    balance DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ... (Rest of tables included in copy button) ...`}
              </pre>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2"
              >
                I've User The Script - Try Again <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const totalDonated = donations.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPledged = pledges.filter(p => p.status === PledgeStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0);

  const activities = [
    ...donations.map(d => ({ ...d, type: 'DONATION' })),
    ...pledges.map(p => ({ ...p, type: 'PLEDGE' }))
  ].sort((a, b) => {
    // Get valid date for sorting (use createdAt for donations, dueDate for pledges)
    const dateA = a.type === 'DONATION' ? (a.createdAt || 0) : (a.dueDate || 0);
    const dateB = b.type === 'DONATION' ? (b.createdAt || 0) : (b.dueDate || 0);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <>
      {/* Real-time Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-brand-400 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-600 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Campaign Updated!</p>
              <p className="text-sm text-gray-600">
                "{updatedCampaignTitle}" just received a new donation or pledge
              </p>
            </div>
            <button
              onClick={() => setShowUpdateNotification(false)}
              className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#FDFCFE] py-10 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="relative mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-100/50 rounded-full blur-3xl"></div>
            <h1 className="text-5xl font-display font-black text-gray-900 tracking-tighter relative">
              Hello, <span className="text-brand-600">{user?.fullName?.split(' ')[0] || 'Friend'}!</span>
            </h1>
            <p className="text-gray-500 mt-3 font-medium text-lg max-w-md leading-relaxed">
              Your impact matters. You've personally helped raise <span className="text-gray-900 font-bold">UGX {totalDonated.toLocaleString()}</span> for causes that change lives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/campaigns')}
              className="bg-white border-2 border-brand-100 text-brand-700 px-6 py-3 rounded-2xl font-bold hover:bg-brand-50 hover:border-brand-200 transition-all flex items-center gap-2 group shadow-sm"
            >
              Explore New Causes <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Contribution Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-brand-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-brand-200/50 group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-brand-100 font-bold uppercase tracking-[0.2em] text-xs mb-4 opacity-80">Accumulated Impact</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium opacity-70">UGX</span>
                  <span className="text-6xl font-black font-display tracking-tight leading-none">
                    {totalDonated.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-brand-200" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Donations</p>
                    <p className="font-bold text-lg leading-none">{donations.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-brand-200" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Pending Pledges</p>
                    <p className="font-bold text-lg leading-none">{pledges.filter(p => p.status === PledgeStatus.PENDING).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Support Card */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-4">Active Commitments</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-medium text-gray-400">UGX</span>
                <span className="text-4xl font-bold text-gray-900 font-display">
                  {totalPledged.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-4 font-medium leading-relaxed">
                Money you've pledged but haven't fulfilled yet. These help organizers plan their budget.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-none">Impact Growth</p>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {metrics?.monthlyGrowthPercentage !== undefined ? (
                    metrics.monthlyGrowthPercentage >= 0 ? (
                      <>Up {metrics.monthlyGrowthPercentage}% this month</>
                    ) : (
                      <>Down {Math.abs(metrics.monthlyGrowthPercentage)}% this month</>
                    )
                  ) : (
                    <>--%</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Campaigns Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-black text-gray-900 tracking-tighter">My Campaigns</h2>
              <p className="text-gray-500 mt-1">Manage and track your fundraising campaigns</p>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30"
            >
              <Plus className="w-5 h-5" />
              Create New Campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Rocket className="w-12 h-12 text-brand-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Ready to make a difference?</h3>
              <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed mb-8">
                Start your first fundraising campaign and bring your vision to life.
              </p>
              <button
                onClick={() => navigate('/create')}
                className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <>
              {/* Pending Campaigns Section */}
              {campaigns.filter(c => c.status === CampaignStatus.PENDING).length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Hourglass className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-gray-900">
                        Pending Approval <span className="text-amber-600">({campaigns.filter(c => c.status === CampaignStatus.PENDING).length})</span>
                      </h3>
                      <p className="text-sm text-gray-500">These campaigns are under review</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns
                      .filter(c => c.status === CampaignStatus.PENDING)
                      .map(campaign => (
                        <MyCampaignCard key={campaign.id} campaign={campaign} isPending={true} />
                      ))}
                  </div>
                </div>
              )}

              {/* Active Campaigns Section */}
              {campaigns.filter(c => c.status === CampaignStatus.APPROVED || c.status === CampaignStatus.COMPLETED).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-100 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-gray-900">
                        Active Campaigns <span className="text-brand-600">({campaigns.filter(c => c.status === CampaignStatus.APPROVED || c.status === CampaignStatus.COMPLETED).length})</span>
                      </h3>
                      <p className="text-sm text-gray-500">Your live and completed campaigns</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns
                      .filter(c => c.status === CampaignStatus.APPROVED || c.status === CampaignStatus.COMPLETED)
                      .map(campaign => (
                        <MyCampaignCard key={campaign.id} campaign={campaign} isPending={false} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-3xl font-display font-black text-gray-900 tracking-tighter">Your Activity</h2>
              <button className="text-brand-600 font-bold text-sm hover:underline">View All History</button>
            </div>

            <div className="space-y-6">
              {activities.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-200">
                  <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Clock className="w-10 h-10 text-brand-300" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Ready to make a difference?</h3>
                  <p className="text-gray-500 max-w-xs mx-auto text-lg leading-relaxed mb-8">
                    Your contribution timeline is empty. Every journey starts with a single step!
                  </p>
                  <button
                    onClick={() => navigate('/campaigns')}
                    className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 active:scale-95"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                activities.map((item: any) => (
                  <div key={item.id} className="group relative bg-white hover:bg-brand-50/20 p-8 rounded-[2rem] border border-gray-100 hover:border-brand-100 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-brand-500/5">
                    <div className="flex items-start gap-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${item.type === 'DONATION' ? 'bg-brand-50 text-brand-600' : 'bg-brand-50 text-brand-600'}`}>
                        {item.type === 'DONATION' ? <CheckCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40">
                              {item.type} • {
                                item.type === 'DONATION'
                                  ? (item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent')
                                  : (item.dueDate ? new Date(item.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent')
                              }
                            </p>
                            <p className="font-black text-2xl text-gray-900 tracking-tight leading-tight">
                              UGX {item.amount.toLocaleString()}
                            </p>
                          </div>
                          {item.type === 'PLEDGE' && (
                            <span className={`text-[10px] px-4 py-1.5 rounded-full uppercase font-black tracking-widest border shadow-sm ${item.status === PledgeStatus.FULFILLED ? 'bg-brand-50 text-brand-700 border-brand-100' :
                              item.status === PledgeStatus.PENDING ? 'bg-accent-50 text-accent-700 border-accent-100' :
                                'bg-gray-50 text-gray-700 border-gray-100'
                              }`}>
                              {item.status}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-500 font-medium text-lg leading-relaxed">
                          {item.type === 'DONATION' ? 'Contributed to ' : 'Committed for '}
                          <span className="text-gray-900 font-bold group-hover:text-brand-600 transition-colors">
                            {item.campaigns?.title || `Campaign #${item.campaignId}`}
                          </span>
                        </p>

                        {item.type === 'PLEDGE' && item.status === PledgeStatus.PENDING && (
                          <div className="mt-8">
                            <button className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 text-sm flex items-center gap-2">
                              Fulfill This Pledge <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-brand-50/50 rounded-[2.5rem] p-8 border border-brand-100/50">
              <h4 className="text-xl font-black text-gray-900 mb-6">Your Community Impact</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <p className="text-sm font-medium text-gray-600">
                    You've supported <span className="text-gray-900 font-black">{metrics?.uniqueCategories || 0} different categories</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Active for <span className="text-gray-900 font-black">{metrics?.accountAgeWeeks || 1} weeks</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Top category: <span className="text-gray-900 font-black">{metrics?.topCategory || 'None yet'}</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-brand-100/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-black uppercase text-brand-600 tracking-wider">
                    Level {metrics?.currentLevel || 1} {metrics?.currentLevelName || 'Supporter'}
                  </p>
                  <p className="text-xs font-bold text-gray-400">
                    {metrics?.progressToNextLevel === 100
                      ? 'Max Level!'
                      : `${metrics?.progressToNextLevel || 0}% to Level ${metrics?.currentLevel ? metrics.currentLevel + 1 : 2}`
                    }
                  </p>
                </div>
                <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics?.progressToNextLevel || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg shadow-gray-200/50">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Security Notice</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                PledgeCard uses bank-grade encryption for all Ugandan transactions. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Custom Animations */}
    <style>{`
      @keyframes slide-in-right {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.5s ease-out forwards;
      }
    `}</style>
    </>
  );
};