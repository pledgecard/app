import React, { useEffect, useState } from 'react';
import { CampaignCard } from '../components/CampaignCard';
import { Campaign } from '../types';
import { ApiService } from '../services/api';
import { ArrowRight, ShieldCheck, Zap, Users, Heart, TrendingUp, CheckCircle2, Sprout, Quote, ArrowUpRight, Building, Briefcase, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatAnimation = () => (
  <style>{`
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    @keyframes spin-slow {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    @keyframes blob-bounce {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-pulse-ring { animation: pulse-ring 3s cubic-bezier(0.2, 0, 0.4, 1) infinite; }
    .animate-spin-slow { animation: spin-slow 60s linear infinite; }
    .animate-spin-slower { animation: spin-slow 120s linear infinite reverse; }
    .animate-blob { animation: blob-bounce 20s infinite ease-in-out alternate; }
    .animate-shimmer { animation: shimmer 3s linear infinite; }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-card:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .glow-purple:hover { box-shadow: 0 20px 40px -10px rgba(167, 139, 250, 0.2); border-color: rgba(167, 139, 250, 0.4); }
    .glow-amber:hover { box-shadow: 0 20px 40px -10px rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.4); }
    .glow-blue:hover { box-shadow: 0 20px 40px -10px rgba(56, 189, 248, 0.2); border-color: rgba(56, 189, 248, 0.4); }
    .glow-rose:hover { box-shadow: 0 20px 40px -10px rgba(251, 113, 133, 0.2); border-color: rgba(251, 113, 133, 0.4); }
    .african-pattern {
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
    }
  `}</style>
);

const HeroBubble = ({ img, category, position, delay, progress }: { img: string, category: string, position: string, delay?: string, progress?: number }) => (
  <div className={`absolute ${position} hidden lg:block animate-float z-20`} style={{ animationDelay: delay || '0s' }}>
    <Link to="/campaigns" className="block relative group cursor-pointer transition-transform duration-300 hover:scale-110">
      {/* Pulsing Effect */}
      <div className="absolute inset-0 bg-brand-200 rounded-full animate-pulse-ring opacity-0 group-hover:opacity-40 transition-opacity"></div>

      {/* Label */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-lg whitespace-nowrap z-20 border border-gray-100 transform transition-all group-hover:-translate-y-2 group-hover:text-brand-600 group-hover:border-brand-200">
        {category}
      </div>

      {/* Ring Container */}
      <div className="relative w-32 h-32 rounded-full p-1.5 bg-white shadow-2xl shadow-brand-900/10 group-hover:shadow-brand-500/30 transition-shadow duration-500">
        {/* Progress SVG */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 text-brand-500 transition-all duration-700 ease-out group-hover:text-brand-600" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#f3f4f6" strokeWidth="3" />
          {progress && (
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progress) / 100}
              strokeLinecap="round"
              className="drop-shadow-sm"
            />
          )}
        </svg>

        {/* Image */}
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white relative z-10 group-hover:scale-[0.98] transition-transform duration-500">
          <img src={img} alt={category} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
        </div>
      </div>
    </Link>
  </div>
);

export const Home: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getCampaigns().then(data => {
      setCampaigns(data);
      setLoading(false);
    });

    const subscription = ApiService.subscribeToAllCampaignUpdates((payload: any) => {
      if (payload.new) {
        setCampaigns(prev => prev.map(c =>
          c.id === payload.new.id
            ? {
              ...c,
              raisedAmount: Number(payload.new.raised_amount),
              pledgedAmount: Number(payload.new.pledged_amount),
              status: payload.new.status
            }
            : c
        ));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <FloatAnimation />

      {/* Hero Section */}
      <section className="relative bg-mesh pt-24 pb-32 overflow-hidden border-b border-gray-100">

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-100/10 blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-accent-100/10 blur-[120px] pointer-events-none -z-10"></div>

        {/* Orbit Lines - more subtle */}
        <div className="absolute top-1/2 left-1/2 w-[650px] h-[650px] rounded-full border border-brand-200/20 pointer-events-none hidden lg:block animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full border border-gray-200/20 pointer-events-none hidden lg:block animate-spin-slower"></div>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto pt-10 pb-10">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-50 border border-brand-100 font-bold text-brand-700 tracking-wide text-xs uppercase mb-6 shadow-sm">
              Africa's Trusted Crowdfunding Platform
            </span>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-gray-900 mb-10 leading-[0.95] tracking-tight">
              Empowering <br />
              <span className="text-gradient-premium">
                Africans
              </span> <br />
              fundraise
            </h1>

            <div className="flex justify-center mt-12">
              <Link to="/create" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-brand-600 text-white font-bold text-xl rounded-full shadow-xl shadow-brand-500/30 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-brand-500/50">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer z-0"></div>
                <span className="relative z-10 flex items-center gap-2">Start a Campaign <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></span>
              </Link>
            </div>
          </div>

          <HeroBubble
            category="Medical Care"
            img="/hero/medical.png"
            position="top-[5%] left-[5%] xl:left-[10%]"
            progress={65}
            delay="0s"
          />
          <HeroBubble
            category="Education"
            img="/hero/education.png"
            position="top-[8%] right-[5%] xl:right-[10%]"
            progress={80}
            delay="1.5s"
          />
          <HeroBubble
            category="Clean Water"
            img="/hero/emergency.png"
            position="bottom-[8%] left-[8%] xl:left-[12%]"
            progress={45}
            delay="2.5s"
          />
          <HeroBubble
            category="Local Market"
            img="/hero/business.png"
            position="bottom-[5%] right-[8%] xl:right-[12%]"
            progress={90}
            delay="1s"
          />
          <HeroBubble
            category="Tech Hub"
            img="/hero/cause.png"
            position="top-[40%] left-[-2%] xl:left-[0%]"
            progress={30}
            delay="3.5s"
          />
          <HeroBubble
            category="Wildlife"
            img="/hero/animals.png"
            position="top-[45%] right-[-2%] xl:right-[0%]"
            progress={55}
            delay="4s"
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative pl-6 md:pl-0">
              <h3 className="text-3xl font-display font-bold text-gray-900 leading-tight">
                Over <span className="text-brand-600 bg-brand-50 px-2 rounded-lg">UGX 10 million</span> raised across 8 African countries.*
              </h3>
              <div className="absolute left-0 md:-left-6 top-2 bottom-2 w-1.5 bg-gradient-to-b from-brand-300 to-brand-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-gray-500 text-lg leading-relaxed">
                From Kampala to Lagos, our platform connects those who need support with those willing to give — making crowdfunding accessible, secure, and transparent across the continent.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 border-y border-gray-100 bg-white/50 backdrop-blur-sm py-8 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee items-center gap-12 text-gray-400 font-bold tracking-widest uppercase text-sm">
            {['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Mbale', 'Masaka', 'Lira', 'Hoima', 'Fort Portal', 'Wakiso', 'Mukono', 'Iganga', 'Tororo', 'Soroti', 'Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Arua', 'Mbale', 'Masaka'].map((district, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                {district}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative py-20 bg-brand-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-brand-800/30 rounded-full blur-3xl transform rotate-12 mix-blend-screen"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[150%] bg-brand-950/50 rounded-full blur-3xl transform -rotate-12"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">10M+</h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">UGX Raised</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">15k+</h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">Active Users</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">200+</h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">Verified Campaigns</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">8</h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">African Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why PledgeCard Section — Bento Editorial Layout */}
      <section className="py-28 bg-[#0d0d14] relative overflow-hidden">
        
        {/* === BACKGROUND IMAGE LAYERS === */}

        {/* Base photo — African community / market scene */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2072&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
          }}
        ></div>

        {/* Soft grain / noise overlay for texture */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.04] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '128px',
          }}
        ></div>

        {/* Dark gradient overlay — bottom-heavy so content remains readable */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: 'linear-gradient(165deg, rgba(13,13,20,0.88) 0%, rgba(13,13,20,0.75) 45%, rgba(13,13,20,0.96) 100%)' }}
        ></div>

        {/* Brand colour split — left violet bleed */}
        <div className="absolute top-0 left-0 w-1/3 h-full z-[2] pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(109,40,217,0.18), transparent)' }}
        ></div>

        {/* Accent amber glow — top-right corner */}
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full blur-[140px] z-[2] pointer-events-none bg-accent-500/20"></div>

        {/* === CONTENT === */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Label + Heading */}
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-accent-400 mb-5 opacity-90">Why PledgeCard?</span>
            <h2 className="text-5xl md:text-6xl font-display font-black text-white leading-[1.05] tracking-tight">
              Built for Africa.<br />
              <span className="text-brand-300">Trusted by thousands.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Hero Card — Instant Mobile Money */}
            <div className="lg:col-span-5 bg-gray-900 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[420px] group">
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-accent-500/20 border border-accent-400/30 text-accent-400 flex items-center justify-center mb-10">
                  <Zap className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-display font-black text-white mb-4 tracking-tight leading-tight">
                  Instant Mobile<br />Money Payments
                </h3>
                <p className="text-gray-400 leading-relaxed text-[15px] max-w-xs">
                  Direct MTN & Airtel integration. Contributions reach the beneficiary's wallet in real-time — no bank account needed.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-10">
                <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-300 uppercase tracking-widest">MTN MoMo</div>
                <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-300 uppercase tracking-widest">Airtel Money</div>
                <div className="ml-auto w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Right Column — 2 stacked cards */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Social Pledges — glass card */}
              <div className="rounded-[2.5rem] p-9 flex flex-col justify-between group hover:border-white/20 transition-all duration-500 min-h-[200px] relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-400/20 border border-brand-300/20 text-brand-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-black text-white mb-3 tracking-tight">Social Pledges</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Commit now, fulfill later. Automated reminders keep everyone accountable without the awkward follow-ups.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Smart Reminders Active</span>
                </div>
              </div>

              {/* 100% Verified */}
              <div className="bg-brand-600 rounded-[2.5rem] p-9 flex flex-col justify-between group hover:bg-brand-700 transition-all duration-500 min-h-[200px] relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-display font-black text-white mb-3 tracking-tight">100% Verified</h3>
                  <p className="text-brand-100/80 text-sm leading-relaxed">
                    Every campaign is vetted by our on-the-ground teams across Africa before going live.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
                  <span className="text-[10px] font-black text-brand-200 uppercase tracking-widest">Vetted by ground teams</span>
                </div>
              </div>

              {/* Full-width stat bar — glass */}
              <div className="md:col-span-2 rounded-[2.5rem] px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-6"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {[
                  { value: '10M+', label: 'UGX Raised', color: 'text-accent-400' },
                  { value: '200+', label: 'Verified Campaigns', color: 'text-white' },
                  { value: '15k+', label: 'Active Supporters', color: 'text-white' },
                  { value: '8', label: 'African Countries', color: 'text-white' },
                ].map((stat, i) => (
                  <div key={i} className={`text-center ${i !== 0 ? 'md:border-l md:border-white/10 md:pl-8' : ''}`}>
                    <p className={`text-3xl font-display font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-32 bg-[#050507] relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-15 mix-blend-screen pointer-events-none grayscale brightness-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block py-1.5 px-5 rounded-full bg-brand-950/40 border border-brand-800/50 text-brand-400 font-bold tracking-widest uppercase text-[10px] mb-6 backdrop-blur-md">
              The PledgeCard Advantage
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight">What We Offer</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-regular">
              Experience a new standard of fundraising with tools designed for high impact, deep transparency, and localized accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Personal Fundraising", desc: "Empower individuals to overcome medical emergencies and education needs.", glowClass: "glow-purple", iconColor: "text-brand-400", iconBg: "bg-brand-500/10", badge: "Popular" },
              { icon: Building, title: "Pledgecard Pro", desc: "Institutional-grade tools optimized for NGOs to maximize their global reach.", glowClass: "glow-amber", iconColor: "text-accent-400", iconBg: "bg-accent-500/10", badge: "Enterprise" },
              { icon: Briefcase, title: "CSR Management", desc: "Sophisticated corporate solutions to align business values with social impact.", glowClass: "glow-blue", iconColor: "text-brand-400", iconBg: "bg-brand-500/10" },
              { icon: Calendar, title: "Event Fundraising", desc: "Seamless integration for galas and sporting events with live tracking.", glowClass: "glow-rose", iconColor: "text-accent-400", iconBg: "bg-accent-500/10" }
            ].map((service, idx) => (
              <div key={idx} className={`group glass-card ${service.glowClass} p-10 rounded-[2.5rem] flex flex-col items-start h-full relative overflow-hidden transition-all duration-500`}>
                {service.badge && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-white tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    {service.badge}
                  </div>
                )}
                <div className={`relative mb-8 w-16 h-16 flex items-center justify-center rounded-2xl ${service.iconBg} border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className={`w-8 h-8 ${service.iconColor} relative z-10`} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold font-display text-white mb-4 transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-[15px] leading-relaxed font-medium">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-16">Make an Impact in 3 Steps</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10 border-t-2 border-dashed border-gray-300"></div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-brand-200">
                <Heart className="w-10 h-10 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3 text-gray-900">1. Choose a Cause</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">Browse verified campaigns from health to education.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-brand-200">
                <TrendingUp className="w-10 h-10 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3 text-gray-900">2. Pledge or Donate</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">Send money instantly via MM or promise to pay later.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-brand-200">
                <CheckCircle2 className="w-10 h-10 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3 text-gray-900">3. See the Change</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">Get updates and photos when the project is completed.</p>
            </div>
          </div>
          
          <div className="mt-16">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-brand-600 font-bold hover:gap-3 transition-all">
               Detailed breakdown of how it works <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section id="campaigns" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Featured Campaigns</h2>
              <p className="text-gray-600">Support verified causes making a real difference.</p>
            </div>
            <Link to="/campaigns" className="text-brand-700 font-semibold flex items-center hover:text-brand-800 transition-colors bg-brand-50 px-5 py-2.5 rounded-full border border-brand-100 hover:border-brand-200 shadow-sm">
              View all campaigns <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[450px] bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {campaigns.slice(0, 3).map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-900 rounded-[3rem] p-8 md:p-16 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-800 rounded-full -ml-16 -mb-16 opacity-50 blur-2xl"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-800/80 border border-brand-700 text-brand-300 text-sm font-medium backdrop-blur-sm">
                  <Sprout className="w-4 h-4" /> Success Story
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                  "Our cooperative grew from 20 to 150 women."
                </h2>
                <p className="text-brand-100 text-lg leading-relaxed">
                  The Namayingo Women's Cooperative raised UGX 45M, purchased modern farming equipment, and now supply produce to markets across Uganda and Kenya.
                </p>

                <div className="h-px bg-brand-800 w-full my-6"></div>

                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-brand-200 border-2 border-brand-500 overflow-hidden shadow-lg">
                    <img src="/success-stories/mary_profile.png" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Sarah A.</p>
                    <p className="text-brand-400 text-sm">Cooperative Chairperson, Namayingo</p>
                  </div>
                </div>
              </div>
              <div className="relative mt-8 lg:mt-0">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-brand-700/30 transform rotate-2 hover:rotate-0 transition-all duration-700">
                  <img src="/success-stories/borehole_success.png" alt="Success Story" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Quote className="w-8 h-8 text-brand-200 absolute top-4 right-4" />
                  <p className="text-gray-900 font-bold text-2xl font-display mb-1">UGX 45M</p>
                  <p className="text-gray-500 text-sm font-medium">Raised in 6 weeks</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 text-center">
            <Link to="/stories" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-brand-600 transition-colors">
               Explore more success stories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};