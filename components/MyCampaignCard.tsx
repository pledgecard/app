import React from 'react';
import { Campaign, CampaignStatus } from '../types';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, Trophy, Eye, Edit2 } from 'lucide-react';

interface MyCampaignCardProps {
  campaign: Campaign;
  isPending?: boolean;
}

export const MyCampaignCard: React.FC<MyCampaignCardProps> = ({ campaign, isPending = false }) => {
  const total = campaign.raisedAmount + campaign.pledgedAmount;
  const percent = Math.round((total / campaign.targetAmount) * 100);
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  const getStatusBadge = () => {
    switch (campaign.status) {
      case CampaignStatus.PENDING:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-2 border-amber-200 rounded-full animate-pulse-soft">
            <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Awaiting Approval</span>
          </div>
        );
      case CampaignStatus.APPROVED:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 border-2 border-brand-200 rounded-full">
            <CheckCircle className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">Live & Active</span>
          </div>
        );
      case CampaignStatus.SUSPENDED:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-2 border-gray-300 rounded-full">
            <AlertTriangle className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Suspended</span>
          </div>
        );
      case CampaignStatus.COMPLETED:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border-2 border-purple-200 rounded-full">
            <Trophy className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Completed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1
        ${isPending
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300 hover:shadow-amber-200 shadow-lg'
          : 'bg-white border-2 border-gray-100 hover:border-brand-200 hover:shadow-brand-200 shadow-lg'
        }
      `}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={campaign.imageUrls?.[0] || 'https://picsum.photos/800/400?random=99'}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-10">
          {getStatusBadge()}
        </div>
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
            {campaign.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-700 transition-colors">
          {campaign.title}
        </h3>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-900">{percent}% funded</span>
            <span className="text-xs text-gray-500">{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPending
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-brand-500 to-brand-600'
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600">
              <span className="font-bold text-gray-900">UGX {total.toLocaleString()}</span> raised
            </span>
            <span className="text-gray-500">of {campaign.targetAmount.toLocaleString()} goal</span>
          </div>
        </div>

        {/* Info Message for Pending */}
        {isPending && (
          <div className="mb-4 p-3 bg-amber-100/50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 font-medium flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Your campaign is under review. We'll notify you once it's approved!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to={`/campaign/${campaign.id}`}
            className="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          {isPending && (
            <Link
              to={`/create`}
              state={{ editMode: true, campaignId: campaign.id }}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
