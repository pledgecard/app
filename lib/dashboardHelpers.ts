import { Donation, Pledge, PledgeStatus } from '../types';

// Level threshold system (cumulative amounts in UGX)
const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Bronze Supporter', minAmount: 0 },
  { level: 2, name: 'Silver Supporter', minAmount: 100000 },
  { level: 3, name: 'Gold Supporter', minAmount: 500000 },
  { level: 4, name: 'Platinum Supporter', minAmount: 1000000 },
  { level: 5, name: 'Diamond Supporter', minAmount: 2000000 },
  { level: 6, name: 'Legacy Supporter', minAmount: 5000000 },
  { level: 7, name: 'Champion Supporter', minAmount: 10000000 },
];

export interface DashboardMetrics {
  accountAgeWeeks: number;
  uniqueCategories: number;
  topCategory: string | null;
  currentLevel: number;
  currentLevelName: string;
  progressToNextLevel: number;
  nextLevelName: string;
  monthlyGrowthPercentage: number;
}

/**
 * Calculate account age in weeks from user creation date
 */
export const calculateAccountAgeWeeks = (userCreatedAt: string): number => {
  const now = new Date();
  const created = new Date(userCreatedAt);
  const diffMs = now.getTime() - created.getTime();
  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, weeks); // Minimum 1 week
};

/**
 * Extract unique categories from donations and pledges
 * Returns categories mapped by name with total amounts
 */
export const getCategoryBreakdown = (
  donations: Donation[],
  pledges: Pledge[]
): Map<string, number> => {
  const categoryMap = new Map<string, number>();

  // Process donations
  donations.forEach(donation => {
    const category = (donation as any).campaigns?.category;
    if (category) {
      categoryMap.set(category, (categoryMap.get(category) || 0) + donation.amount);
    }
  });

  // Process pledges (only count fulfilled pledges for impact)
  pledges.forEach(pledge => {
    if (pledge.status === PledgeStatus.FULFILLED) {
      const category = (pledge as any).campaigns?.category;
      if (category) {
        categoryMap.set(category, (categoryMap.get(category) || 0) + pledge.amount);
      }
    }
  });

  return categoryMap;
};

/**
 * Get top category by total amount
 */
export const getTopCategory = (
  donations: Donation[],
  pledges: Pledge[]
): { category: string | null; uniqueCount: number } => {
  const categoryMap = getCategoryBreakdown(donations, pledges);

  if (categoryMap.size === 0) {
    return { category: null, uniqueCount: 0 };
  }

  // Sort by amount descending
  const sortedCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1]);

  return {
    category: sortedCategories[0][0],
    uniqueCount: categoryMap.size
  };
};

/**
 * Calculate user level based on total impact (donations + fulfilled pledges)
 */
export const calculateUserLevel = (
  donations: Donation[],
  pledges: Pledge[]
): { currentLevel: number; levelName: string; progress: number; nextLevelName: string } => {
  // Calculate total impact
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const fulfilledPledges = pledges
    .filter(p => p.status === PledgeStatus.FULFILLED)
    .reduce((sum, p) => sum + p.amount, 0);
  const totalImpact = totalDonations + fulfilledPledges;

  // Find current level
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalImpact >= LEVEL_THRESHOLDS[i].minAmount) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || currentLevel;
    }
  }

  // Calculate progress to next level
  let progress = 0;
  if (nextLevel !== currentLevel) {
    const range = nextLevel.minAmount - currentLevel.minAmount;
    const currentInRange = totalImpact - currentLevel.minAmount;
    progress = Math.min(100, Math.max(0, (currentInRange / range) * 100));
  } else {
    progress = 100; // Max level achieved
  }

  return {
    currentLevel: currentLevel.level,
    levelName: currentLevel.name,
    progress: Math.round(progress),
    nextLevelName: nextLevel.name
  };
};

/**
 * Calculate month-over-month growth percentage
 */
export const calculateMonthlyGrowth = (
  donations: Donation[],
  pledges: Pledge[]
): number => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Calculate this month's impact
  const thisMonthDonations = donations
    .filter(d => new Date(d.createdAt) >= thisMonthStart)
    .reduce((sum, d) => sum + d.amount, 0);

  const thisMonthPledges = pledges
    .filter(p => new Date(p.createdAt) >= thisMonthStart && p.status === PledgeStatus.FULFILLED)
    .reduce((sum, p) => sum + p.amount, 0);

  const thisMonthImpact = thisMonthDonations + thisMonthPledges;

  // Calculate last month's impact
  const lastMonthDonations = donations
    .filter(d => {
      const date = new Date(d.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    })
    .reduce((sum, d) => sum + d.amount, 0);

  const lastMonthPledges = pledges
    .filter(p => {
      const date = new Date(p.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd && p.status === PledgeStatus.FULFILLED;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const lastMonthImpact = lastMonthDonations + lastMonthPledges;

  // Calculate growth percentage
  if (lastMonthImpact === 0) {
    return thisMonthImpact > 0 ? 100 : 0;
  }

  const growth = ((thisMonthImpact - lastMonthImpact) / lastMonthImpact) * 100;
  return Math.round(growth);
};

/**
 * Calculate all dashboard metrics at once
 */
export const calculateAllMetrics = (
  userCreatedAt: string,
  donations: Donation[],
  pledges: Pledge[]
): DashboardMetrics => {
  const accountAgeWeeks = calculateAccountAgeWeeks(userCreatedAt);
  const { category: topCategory, uniqueCount: uniqueCategories } = getTopCategory(donations, pledges);
  const { currentLevel, levelName: currentLevelName, progress: progressToNextLevel, nextLevelName } = calculateUserLevel(donations, pledges);
  const monthlyGrowthPercentage = calculateMonthlyGrowth(donations, pledges);

  return {
    accountAgeWeeks,
    uniqueCategories,
    topCategory,
    currentLevel,
    currentLevelName,
    progressToNextLevel,
    nextLevelName,
    monthlyGrowthPercentage
  };
};
