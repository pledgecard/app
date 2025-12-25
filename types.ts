export enum UserRole {
  GUEST = 'GUEST',
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN'
}

export enum CampaignStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED'
}

export enum PledgeStatus {
  PENDING = 'PENDING',
  DUE = 'DUE',
  FULFILLED = 'FULFILLED',
  EXPIRED = 'EXPIRED'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  balance: number; // For demo purposes
}

export interface Campaign {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  pledgedAmount: number;
  imageUrls: string[];
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  // Organizer details
  organizerName?: string;
  organizerPhone?: string;
  organizerLocation?: string;
  relationship?: string;
  beneficiaryName?: string;
}

export interface Pledge {
  id: string;
  userId: string;
  campaignId: string;
  amount: number;
  dueDate: string;
  status: PledgeStatus;
  createdAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  campaignId: string;
  amount: number;
  paymentMethod: 'MTN' | 'AIRTEL' | 'VISA';
  createdAt: string;
}