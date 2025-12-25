import React, { useEffect, useState } from 'react';
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
  Clock
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updatedCampaignTitle, setUpdatedCampaignTitle] = useState('');

  const refreshData = async () => {
    setLoading(true);
    const [allCampaigns, adminStats] = await Promise.all([
      ApiService.getAllCampaigns(),
      ApiService.getAdminStats()
    ]);
    setCampaigns(allCampaigns);
    setStats(adminStats);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Refresh data when tab becomes visible (e.g., switching back to admin tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Real-time updates for all campaigns
  useEffect(() => {
    if (campaigns.length === 0) return;

    // Subscribe to updates for all campaigns
    const subscriptions = campaigns.map(campaign => {
      return ApiService.subscribeToCampaignUpdates(campaign.id, (payload: any) => {
        if (payload.new) {
          console.log('AdminDashboard: Campaign update received:', payload);
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

          // Update stats as well
          setStats(prevStats => {
            const newTotalRaised = prevStats.totalRaised +
              (Number(payload.new.raised_amount) - campaigns.find(c => c.id === payload.new.id)?.raisedAmount || 0);
            const newTotalPledged = prevStats.totalPledged +
              (Number(payload.new.pledged_amount) - campaigns.find(c => c.id === payload.new.id)?.pledgedAmount || 0);

            return {
              ...prevStats,
              totalRaised: newTotalRaised,
              totalPledged: newTotalPledged
            };
          });

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
  }, [campaigns]);

  const handleStatusUpdate = async (id: string, newStatus: CampaignStatus) => {
    await ApiService.updateCampaignStatus(id, newStatus);
    refreshData(); // Reload data to update UI
  };

  const pendingCampaigns = campaigns.filter(c => c.status === CampaignStatus.PENDING);
  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.APPROVED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">Active</span>;
      case CampaignStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case CampaignStatus.SUSPENDED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">Suspended</span>;
      case CampaignStatus.COMPLETED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Real-time Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-400 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Campaign Updated!</p>
              <p className="text-sm text-gray-600">
                "{updatedCampaignTitle}" just received activity
              </p>
            </div>
            <button
              onClick={() => setShowUpdateNotification(false)}
              className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-500 mt-1">Manage campaigns, approvals, and platform performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Last updated: Just now</span>
            <button onClick={refreshData} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-brand-600">
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Raised"
            value={`UGX ${(stats.totalRaised / 1000000).toFixed(1)}M`}
            icon={<Wallet className="w-6 h-6 text-brand-600" />}
            bg="bg-brand-50"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingCampaigns.toString()}
            icon={<AlertCircle className="w-6 h-6 text-accent-600" />}
            bg="bg-accent-50"
            alert={stats.pendingCampaigns > 0}
          />
          <StatCard
            title="Active Campaigns"
            value={stats.totalCampaigns.toString()}
            icon={<BarChart3 className="w-6 h-6 text-brand-600" />}
            bg="bg-brand-50"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={<Users className="w-6 h-6 text-brand-600" />}
            bg="bg-brand-50"
          />
        </div>

        {/* Pending Actions */}
        {pendingCampaigns.length > 0 && (
          <div className="mb-10 animate-fade-in-up">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500"></span>
              </span>
              Pending Approvals ({pendingCampaigns.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCampaigns.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-2xl p-6 shadow-sm border border-accent-100 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">{campaign.category}</span>
                    <span className="text-xs text-gray-400">{new Date(campaign.startDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-3">
                    {campaign.description.replace(/<[^>]+>/g, '')}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-50">
                    <Link to={`/campaign/${campaign.id}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                      <Eye className="w-4 h-4 mr-1" /> Review
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, CampaignStatus.SUSPENDED)}
                        className="p-2 rounded-lg hover:bg-accent-50 text-accent-600 transition-colors border border-gray-100 hover:border-accent-100" title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, CampaignStatus.APPROVED)}
                        className="px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Campaigns Table */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold font-display text-gray-900">All Campaigns</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-64"
                />
              </div>
              <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-900">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Raised</th>
                  <th className="px-6 py-4">Pledged</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCampaigns.map(campaign => {
                  const percent = Math.round(((campaign.raisedAmount + campaign.pledgedAmount) / campaign.targetAmount) * 100);
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                            <img src={campaign.imageUrls?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{campaign.title}</p>
                            <p className="text-xs text-gray-500">Created by Sarah K.</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{campaign.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">UGX {campaign.raisedAmount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Donated</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-accent-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">UGX {campaign.pledgedAmount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Pledged</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">{percent}%</span>
                            <span className="text-gray-400">Target</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link to={`/campaign/${campaign.id}`} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {campaign.status !== CampaignStatus.APPROVED && (
                            <button
                              onClick={() => handleStatusUpdate(campaign.id, CampaignStatus.APPROVED)}
                              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {campaign.status === CampaignStatus.APPROVED && (
                            <button
                              onClick={() => handleStatusUpdate(campaign.id, CampaignStatus.SUSPENDED)}
                              className="p-1.5 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors" title="Suspend"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredCampaigns.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No campaigns found matching your search.
              </div>
            )}
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

const StatCard = ({ title, value, icon, bg, alert = false }: { title: string, value: string, icon: React.ReactNode, bg: string, alert?: boolean }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center ${alert ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}>
    <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mr-4 shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-gray-900 font-display">{value}</p>
    </div>
  </div>
);