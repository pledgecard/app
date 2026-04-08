import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { Donation, Pledge, PledgeStatus, User, Campaign, CampaignStatus } from '../types';
import { 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Rocket, 
  Hourglass, 
  Wallet, 
  CreditCard,
  ShieldCheck,
  Calendar,
  ChevronRight,
  TrendingDown,
  Award
} from 'lucide-react';
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

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:border-brand-200 transition-all duration-500">
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-[0.03] rounded-bl-[5rem] group-hover:scale-110 transition-transform duration-700`}></div>
    <div className="relative z-10">
      <div className={`w-14 h-14 rounded-2xl ${colorClass.replace('bg-', 'bg-opacity-10 text-')} flex items-center justify-center mb-6`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-gray-900 font-display tracking-tight">{value}</h3>
        {subValue && <span className="text-gray-400 font-semibold text-xs">{subValue}</span>}
      </div>
      {trend && (
        <div className={`mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
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
        let currentUser = await ApiService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        const [pData, dData, cData] = await Promise.all([
          ApiService.getUserPledges(currentUser.id),
          ApiService.getUserDonations(currentUser.id),
          ApiService.getUserCampaigns(currentUser.id)
        ]);
        setPledges(pData);
        setDonations(dData);
        setCampaigns(cData);

        if (currentUser.createdAt) {
          const calculatedMetrics = calculateAllMetrics(currentUser.createdAt, dData, pData);
          setMetrics(calculatedMetrics);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        if (error.message?.includes('406') || error.message?.includes('404')) {
          setSetupError(true);
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <SkeletonLoader />;

  const totalDonated = donations.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPledged = pledges.filter(p => p.status === PledgeStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0);

  const activities = [
    ...donations.map(d => ({ ...d, type: 'DONATION' })),
    ...pledges.map(p => ({ ...p, type: 'PLEDGE' }))
  ].sort((a, b) => {
    const dateA = a.type === 'DONATION' ? (a.createdAt || 0) : (a.createdAt || 0);
    const dateB = b.type === 'DONATION' ? (b.createdAt || 0) : (b.createdAt || 0);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="min-h-screen bg-[#fafbff] py-10 pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-100 rounded-full blur-[80px] opacity-60"></div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter leading-none relative">
              Welcome back, <br />
              <span className="text-brand-600">{user?.fullName?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-gray-400 mt-4 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button
               onClick={() => navigate('/create')}
               className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-3 hover:translate-y-[-2px] active:translate-y-0"
             >
               <Plus className="w-5 h-5" />
               New Campaign
             </button>
          </div>
        </div>

        {/* Stats Grid - High Professionalism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <StatCard 
            title="Total Impact"
            value={`UGX ${totalDonated.toLocaleString()}`}
            subValue="Donated"
            icon={Wallet}
            colorClass="bg-brand-600"
            trend={metrics?.monthlyGrowthPercentage}
          />
          <StatCard 
            title="Active Pledges"
            value={`UGX ${totalPledged.toLocaleString()}`}
            subValue="Future"
            icon={Hourglass}
            colorClass="bg-amber-500"
          />
          <StatCard 
            title="Projects Supported"
            value={donations.length + pledges.length}
            subValue="Causes"
            icon={Rocket}
            colorClass="bg-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* My Campaigns */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-brand-600" />
                  My Campaigns
                </h2>
                <Link to="/campaigns" className="text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors flex items-center gap-1">
                  View Public Grid <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {campaigns.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-10 h-10 text-brand-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No active campaigns yet</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8 font-medium">
                    Turn your vision into reality. Start a fundraising campaign for your community.
                  </p>
                  <button 
                    onClick={() => navigate('/create')}
                    className="bg-brand-50 text-brand-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-100 transition-all"
                  >
                    Get Started Today
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {campaigns.map(campaign => (
                    <MyCampaignCard key={campaign.id} campaign={campaign} isPending={campaign.status === CampaignStatus.PENDING} />
                  ))}
                </div>
              )}
            </section>

            {/* Activity Feed */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-brand-600" />
                  Recent Activity
                </h2>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                {activities.length === 0 ? (
                  <div className="p-16 text-center">
                    <p className="text-gray-400 font-medium">No activity to show yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {activities.map((item: any) => (
                      <div key={item.id} className="p-8 hover:bg-gray-50/50 transition-colors flex items-center gap-6 group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'DONATION' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'}`}>
                          {item.type === 'DONATION' ? <CreditCard className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                              {item.type === 'DONATION' ? 'Donation Sent' : 'Future Pledge Made'}
                            </h4>
                            <span className="text-sm font-black text-gray-900">UGX {item.amount.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-400 font-medium line-clamp-1">
                            Toward <span className="text-gray-600 font-bold">{(item as any).campaigns?.title || 'Unknown Campaign'}</span>
                          </p>
                        </div>
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${item.status === PledgeStatus.FULFILLED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                             {item.status || 'Success'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activities.length > 0 && (
                  <button className="w-full py-6 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors border-t border-gray-50">
                    Download Transaction History
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Impact Level Card */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-50 rounded-full blur-3xl"></div>
              <div className="relative z-10 text-center">
                 <div className="w-20 h-20 bg-brand-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-200">
                    <Award className="w-10 h-10 text-white" />
                 </div>
                 <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-2">{metrics?.currentLevelName || 'Supporter'}</p>
                 <h3 className="text-2xl font-black text-gray-900 font-display mb-6">Level {metrics?.currentLevel || 1}</h3>
                 
                 <div className="mb-8">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                       <span>Progress</span>
                       <span>{metrics?.progressToNextLevel || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                         style={{ width: `${metrics?.progressToNextLevel || 0}%` }}
                       ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3 font-medium">UGX {(LEVEL_THRESHOLDS.find(l => l.level === (metrics?.currentLevel || 1) + 1)?.minAmount || 0).toLocaleString()} more for next rank</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Category</p>
                       <p className="text-xs font-bold text-gray-900 truncate">{metrics?.topCategory || 'None'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active for</p>
                       <p className="text-xs font-bold text-gray-900">{metrics?.accountAgeWeeks || 1} Weeks</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
               <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
               <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                     <ShieldCheck className="w-5 h-5 text-brand-400" />
                  </div>
                  <h4 className="text-lg font-bold mb-3">Security Verified</h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    All disbursements are processed through 256-bit encrypted gateways. Your platform security is our top priority.
                  </p>
               </div>
            </div>

            {/* Quick Actions */}
            <div className="p-2">
              <Link to="/campaigns" className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-brand-200 shadow-sm transition-all group">
                <span className="font-bold text-gray-900">Browse Campaigns</span>
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Bronze Supporter', minAmount: 0 },
  { level: 2, name: 'Silver Supporter', minAmount: 100000 },
  { level: 3, name: 'Gold Supporter', minAmount: 500000 },
  { level: 4, name: 'Platinum Supporter', minAmount: 1000000 },
  { level: 5, name: 'Diamond Supporter', minAmount: 2000000 },
  { level: 6, name: 'Legacy Supporter', minAmount: 5000000 },
  { level: 7, name: 'Champion Supporter', minAmount: 10000000 },
];