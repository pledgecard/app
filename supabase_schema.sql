-- PledgeCard Uganda Database Schema

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'CREATOR', 'ADMIN')),
    balance DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Campaigns Table
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
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Pledges Table
CREATE TABLE public.pledges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Donations Table
CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('MTN', 'AIRTEL', 'VISA')),
    transaction_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns Policies
CREATE POLICY "Approved campaigns are viewable by everyone." ON public.campaigns FOR SELECT USING (status = 'APPROVED' OR auth.uid() = owner_id);
CREATE POLICY "Creators can create campaigns." ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own campaigns." ON public.campaigns FOR UPDATE USING (auth.uid() = owner_id);

-- Pledges Policies
CREATE POLICY "Users can view own pledges." ON public.pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create pledges." ON public.pledges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donations Policies
CREATE POLICY "Users can view own donations." ON public.donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create donations (webhook/public)." ON public.donations FOR INSERT WITH CHECK (true);

-- Functions & Triggers for Stats updates
CREATE OR REPLACE FUNCTION update_campaign_raised() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.campaigns SET raised_amount = raised_amount + NEW.amount WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_donation_inserted
AFTER INSERT ON public.donations
FOR EACH ROW EXECUTE FUNCTION update_campaign_raised();

CREATE OR REPLACE FUNCTION update_campaign_pledged() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.campaigns SET pledged_amount = pledged_amount + NEW.amount WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pledge_inserted
AFTER INSERT ON public.pledges
FOR EACH ROW EXECUTE FUNCTION update_campaign_pledged();

-- 5. Storage Buckets (Run this if you don't use the UI)
INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-images', 'campaign-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for campaign-images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaign-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'campaign-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
