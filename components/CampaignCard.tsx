import React from 'react';
import { Campaign } from '../types';
import { ProgressBar } from './ProgressBar';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const totalCommited = (campaign.raisedAmount || 0) + (campaign.pledgedAmount || 0);
  const percent = Math.round((totalCommited / (campaign.targetAmount || 1)) * 100);
  const coverImage = campaign.imageUrls?.[0] || 'https://picsum.photos/800/400?random=99';

  // Strip HTML tags for preview to avoid showing <h3> etc
  const descriptionPreview = (campaign.description || '').replace(/<[^>]+>/g, '');

  return (
    <Link to={`/campaign/${campaign.id}`} className="block group h-full">
      <div className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col transform hover:-translate-y-1">
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-gray-900/0 transition-colors z-10"></div>
          <img
            src={coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
              {campaign.category}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-display text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-brand-700 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
            {descriptionPreview}
          </p>

          <div className="mt-auto space-y-4">
            <ProgressBar target={campaign.targetAmount} raised={campaign.raisedAmount} pledged={campaign.pledgedAmount} />

            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900 font-display">{percent}%</span>
                  <span className="text-xs text-gray-500 font-medium">funded</span>
                </div>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">
                  UGX {(campaign.raisedAmount || 0).toLocaleString()} <span className="text-gray-400 font-normal">raised</span>
                </p>
              </div>
              <div className="flex items-center text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3 mr-1.5" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};