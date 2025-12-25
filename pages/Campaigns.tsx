import React, { useEffect, useState, useMemo } from 'react';
import { ApiService } from '../services/api';
import { Campaign } from '../types';
import { CampaignCard } from '../components/CampaignCard';
import { Search, SlidersHorizontal, ArrowDownWideNarrow, X, LayoutGrid, Heart } from 'lucide-react';

const CATEGORIES = [
  "All", "Business", "Community", "Education", "Medical", "Emergency", "Sports", "Family", "Creative"
];

type SortOption = 'newest' | 'ending_soon' | 'most_funded';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    // Fetch only Approved campaigns for the public page
    ApiService.getCampaigns().then(data => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    // 1. Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory);
    }

    // 2. Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else if (sortBy === 'ending_soon') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else if (sortBy === 'most_funded') {
        const percentA = (a.raisedAmount + a.pledgedAmount) / a.targetAmount;
        const percentB = (b.raisedAmount + b.pledgedAmount) / b.targetAmount;
        return percentB - percentA;
      }
      return 0;
    });

    return result;
  }, [campaigns, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">

      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Discover <span className="text-brand-600">Causes</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Browse through verified campaigns, find a story that resonates with you, and make an impact today through a donation or pledge.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 items-start lg:items-center justify-between sticky top-24 z-30 lg:static">

          {/* Search */}
          <div className="relative w-full lg:w-96 shadow-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-xl font-bold text-gray-700"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters & Sort
          </button>

          {/* Desktop Filters / Sort */}
          <div className={`w-full lg:w-auto flex flex-col lg:flex-row gap-4 ${showMobileFilters ? 'block' : 'hidden lg:flex'}`}>

            {/* Sort Dropdown */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowDownWideNarrow className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full lg:w-auto pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold text-gray-700 cursor-pointer hover:border-brand-300 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="ending_soon">Ending Soon</option>
                <option value="most_funded">Most Funded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories (Horizontal Scroll) */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all transform active:scale-95 ${selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-medium">
              <LayoutGrid className="w-4 h-4" />
              Showing {filteredCampaigns.length} results
            </div>

            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in-up">
                {filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We couldn't find any campaigns matching "{searchQuery}" in {selectedCategory}. Try adjusting your filters.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-6 text-brand-600 font-bold hover:text-brand-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};