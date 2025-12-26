import React, { useEffect, useState, useMemo } from 'react';
import { ApiService } from '../services/api';
import { Campaign, CampaignStatus } from '../types';
import {
  BarChart3,
  Users,
  Layers,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Wallet,
  Clock,
  ArrowUpRight,
  Activity,
  CreditCard,
  Hand
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalPledged: 0,
    totalUsers: 0,
    totalCampaigns: 0,
    pendingCampaigns: 0
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updatedCampaignTitle, setUpdatedCampaignTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'financials'>('overview');

  const refreshData = async () => {
    setLoading(true);
    const [allCampaigns, adminStats, allDonations, allPledges] = await Promise.all([
      ApiService.getAllCampaigns(),
      ApiService.getAdminStats(),
      ApiService.getAllDonations(),
      ApiService.getAllPledges()
    ]);
    setCampaigns(allCampaigns);
    setStats(adminStats);
    setDonations(allDonations);
    setPledges(allPledges);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshData();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Real-time updates logic (kept from previous version)
  useEffect(() => {
    if (campaigns.length === 0) return;
    const subscriptions = campaigns.map(campaign => {
      return ApiService.subscribeToCampaignUpdates(campaign.id, (payload: any) => {
        if (payload.new) {
          setCampaigns(prev => prev.map(c => c.id === payload.new.id ? { ...c, raisedAmount: Number(payload.new.raised_amount), pledgedAmount: Number(payload.new.pledged_amount), status: payload.new.status } : c));
          setUpdatedCampaignTitle(payload.new.title);
          setShowUpdateNotification(true);
          setTimeout(() => setShowUpdateNotification(false), 4000);
          refreshData(); // Refresh all to get exact stats sync
        }
      });
    });
    return () => subscriptions.forEach(sub => sub.unsubscribe());
  }, [campaigns]);

  const handleStatusUpdate = async (id: string, newStatus: CampaignStatus) => {
    await ApiService.updateCampaignStatus(id, newStatus);
    refreshData();
  };

  const pendingCampaigns = campaigns.filter(c => c.status === CampaignStatus.PENDING);
  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Merge and sort activities for the Feed
  const recentActivity = useMemo(() => {
    const d = donations.map(x => ({ ...x, type: 'donation', date: x.created_at }));
    const p = pledges.map(x => ({ ...x, type: 'pledge', date: x.created_at }));
    return [...d, ...p].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [donations, pledges]);

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-display font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-gray-400 text-xs mt-2 font-medium">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 pt-20">
      {/* update notification toast */}
      {showUpdateNotification && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-brand-100 p-4 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Update Received</p>
              <p className="text-xs text-gray-500 line-clamp-1">{updatedCampaignTitle}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Admin Portal</h1>
              <p className="text-gray-500 text-lg">Detailed overview of platform performance and actions.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              {['overview', 'campaigns'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {tab}
                </button>
              ))}
              <button onClick={refreshData} className="p-2.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border-l border-gray-100 ml-2">
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Raised"
                value={`UGX ${(stats.totalRaised / 1000000).toFixed(1)}M`}
                subtext="+12% from last month"
                icon={Wallet}
                color="text-brand-600"
              />
              <StatCard
                title="Active Pledges"
                value={`UGX ${(stats.totalPledged / 1000000).toFixed(1)}M`}
                subtext={`${stats.pendingCampaigns} campaigns need attention`}
                icon={Hand}
                color="text-accent-600"
              />
              <StatCard
                title="Total Campaigns"
                value={stats.totalCampaigns}
                subtext={`${campaigns.filter(c => c.status === CampaignStatus.APPROVED).length} currently active`}
                icon={BarChart3}
                color="text-brand-700"
              />
              <StatCard
                title="Community"
                value={stats.totalUsers}
                subtext="Registered users"
                icon={Users}
                color="text-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

              {/* Left Column: Action Center & Highlighted Campaigns */}
              <div className="xl:col-span-8 space-y-8">

                {/* Pending Actions */}
                {pendingCampaigns.length > 0 ? (
                  <div className="bg-gradient-to-br from-orange-50 to-white rounded-[2.5rem] p-8 border border-orange-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 rounded-full text-orange-600 animate-pulse">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-display font-bold text-gray-900">Pending Reviews</h2>
                      <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingCampaigns.length}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingCampaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{campaign.category}</span>
                            <span className="text-xs text-gray-400 font-medium">{new Date(campaign.startDate).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{campaign.title}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.description.replace(/<[^>]+>/g, '')}</p>

                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => handleStatusUpdate(campaign.id, CampaignStatus.APPROVED)}
                              className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors"
                            >
                              Approve
                            </button>
                            <Link to={`/campaign/${campaign.id}`} className="px-3 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 text-center py-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-brand-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500">No pending campaigns to review.</p>
                  </div>
                )}

                {/* Quick Campaign List (Preview) */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-bold text-gray-900">Top Performing Campaigns</h2>
                    <button onClick={() => setActiveTab('campaigns')} className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center">
                      View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {campaigns
                      .filter(c => c.status === CampaignStatus.APPROVED)
                      .sort((a, b) => b.raisedAmount - a.raisedAmount)
                      .slice(0, 3)
                      .map(campaign => (
                        <div key={campaign.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                            <img src={campaign.imageUrls?.[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{campaign.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{campaign.category}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span>{Math.round(((campaign.raisedAmount + campaign.pledgedAmount) / campaign.targetAmount) * 100)}% Funded</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-brand-600">UGX {(campaign.raisedAmount / 1000000).toFixed(1)}M</p>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Raised</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Feed */}
              <div className="xl:col-span-4">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm h-full overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Feed</span>
                    </div>
                    <h2 className="text-xl font-display font-bold text-gray-900">Recent Activity</h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px] custom-scrollbar">
                    {recentActivity.map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'donation' ? 'bg-brand-100 text-brand-600' : 'bg-accent-100 text-accent-600'
                          }`}>
                          {item.type === 'donation' ? <CreditCard className="w-5 h-5" /> : <Hand className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 text-sm">
                            <span className="font-bold">{item.donorName || item.pledgerName}</span>
                            <span className="text-gray-500"> {item.type === 'donation' ? 'donated' : 'pledged'} </span>
                            <span className={`font-bold ${item.type === 'donation' ? 'text-brand-600' : 'text-accent-600'}`}>
                              UGX {item.amount.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">to {item.campaignTitle}</p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <div className="text-center py-10 text-gray-400 text-sm">No recent activity</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-gray-900">Campaign Directory</h2>
                <p className="text-gray-500 text-sm mt-1">Manage, approve, or suspend campaigns.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full md:w-80 transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                    <th className="px-8 py-5">Campaign</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Progress</th>
                    <th className="px-6 py-5">Raised</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCampaigns.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-sm">
                            <img src={campaign.imageUrls?.[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{campaign.title}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              {campaign.category} <span className="text-gray-300">•</span> Created {new Date(campaign.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${campaign.status === CampaignStatus.APPROVED ? 'bg-brand-100 text-brand-700' :
                          campaign.status === CampaignStatus.PENDING ? 'bg-accent-100 text-accent-700' :
                            'bg-accent-200 text-accent-800'
                          }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 w-48">
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-900">
                            {Math.round(((campaign.raisedAmount + campaign.pledgedAmount) / campaign.targetAmount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(((campaign.raisedAmount + campaign.pledgedAmount) / campaign.targetAmount) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900 text-sm">UGX {campaign.raisedAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">of {campaign.targetAmount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/campaign/${campaign.id}`} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {campaign.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(campaign.id, CampaignStatus.APPROVED)}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCampaigns.length === 0 && (
              <div className="p-20 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold">No campaigns found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
};