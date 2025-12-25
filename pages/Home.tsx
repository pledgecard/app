import React, { useEffect, useState } from 'react';
import { CampaignCard } from '../components/CampaignCard';
import { Campaign } from '../types';
import { ApiService } from '../services/api';
import { ArrowRight, ShieldCheck, Zap, Users, Heart, TrendingUp, CheckCircle2, Sprout, Quote, ArrowUpRight } from 'lucide-react';
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
      <section className="relative bg-white pt-24 pb-32 overflow-hidden border-b border-gray-100">

        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-100/40 via-purple-50/30 to-transparent rounded-full blur-[80px] animate-blob pointer-events-none -z-10"></div>

        {/* Orbit Lines */}
        <div className="absolute top-1/2 left-1/2 w-[650px] h-[650px] rounded-full border border-dashed border-brand-100/60 pointer-events-none hidden lg:block animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full border border-dashed border-gray-100/60 pointer-events-none hidden lg:block animate-spin-slower"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto pt-10 pb-10">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-50 border border-brand-100 font-bold text-brand-700 tracking-wide text-xs uppercase mb-6 shadow-sm">
              #1 crowdfunding platform in Uganda
            </span>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-gray-900 mb-10 leading-[0.95] tracking-tight">
              Helping <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700 relative inline-block">
                Ugandans
                {/* Creative Underline */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10 opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
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

          {/* Orbiting Bubbles */}

          {/* Top Left - Medical */}
          <HeroBubble
            category="Medical Care"
            img="/hero/medical.png"
            position="top-[5%] left-[5%] xl:left-[10%]"
            progress={65}
            delay="0s"
          />
          {/* Top Right - Education */}
          <HeroBubble
            category="Education"
            img="/hero/education.png"
            position="top-[8%] right-[5%] xl:right-[10%]"
            progress={80}
            delay="1.5s"
          />
          {/* Bottom Left - Emergency */}
          <HeroBubble
            category="Clean Water"
            img="/hero/emergency.png"
            position="bottom-[8%] left-[8%] xl:left-[12%]"
            progress={45}
            delay="2.5s"
          />
          {/* Bottom Right - Business */}
          <HeroBubble
            category="Local Market"
            img="/hero/business.png"
            position="bottom-[5%] right-[8%] xl:right-[12%]"
            progress={90}
            delay="1s"
          />

          {/* Middle Leftish - Tech Hub */}
          <HeroBubble
            category="Tech Hub"
            img="/hero/cause.png"
            position="top-[40%] left-[-2%] xl:left-[0%]"
            progress={30}
            delay="3.5s"
          />
          {/* Middle Rightish - Wildlife */}
          <HeroBubble
            category="Wildlife"
            img="/hero/animals.png"
            position="top-[45%] right-[-2%] xl:right-[0%]"
            progress={55}
            delay="4s"
          />
        </div>

        {/* Bottom Stats Text */}
        <div className="max-w-6xl mx-auto px-6 mt-16 md:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative pl-6 md:pl-0">
              <h3 className="text-3xl font-display font-bold text-gray-900 leading-tight">
                More than <span className="text-brand-600 bg-brand-50 px-2 rounded-lg">UGX 500 million</span> is raised every week on PledgeCard.*
              </h3>
              {/* Decorative line */}
              <div className="absolute left-0 md:-left-6 top-2 bottom-2 w-1.5 bg-gradient-to-b from-brand-300 to-brand-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-gray-500 text-lg leading-relaxed">
                Get started in just a few minutes — with helpful new tools, it’s easier than ever to pick the perfect title, write a compelling story, and share it with the world.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Impact Stats */}
      <section className="relative py-20 bg-brand-900 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-brand-800/30 rounded-full blur-3xl transform rotate-12 mix-blend-screen"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[150%] bg-brand-950/50 rounded-full blur-3xl transform -rotate-12"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                500M+
              </h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">
                UGX Raised
              </p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                1.2k
              </h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">
                Pledges Made
              </p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                100%
              </h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">
                Verified Campaigns
              </p>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-brand-800/40 rounded-2xl border border-brand-700/50 text-brand-300 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-brand-700/50 transition-all duration-300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                50+
              </h3>
              <p className="text-brand-200/80 text-sm font-bold uppercase tracking-widest">
                Communities Helped
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Why <span className="text-brand-600 relative">
                PledgeCard?
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              We bridge the gap between intention and action with technology built specifically for the Ugandan context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Mobile Money",
                desc: "Seamless integration with MTN & Airtel allows your donations to reach beneficiaries in seconds, not days.",
                color: "bg-accent-50 text-accent-600"
              },
              {
                icon: Users,
                title: "Social Pledges",
                desc: "Not ready to pay? Make a commitment now and we'll send you friendly reminders to fulfill your promise later.",
                color: "bg-brand-50 text-brand-600"
              },
              {
                icon: ShieldCheck,
                title: "100% Verified",
                desc: "Every campaign is vetted by our ground team to ensure your money goes to the right place, every time.",
                color: "bg-brand-50 text-brand-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-3xl ${feature.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0`}>
                    <feature.icon className="h-10 w-10" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 font-display mb-4">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-lg mb-6">{feature.desc}</p>

                  <div className="flex items-center text-sm font-bold uppercase tracking-wider text-gray-300 group-hover:text-brand-600 transition-colors">
                    Learn more <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Make an Impact in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
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
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-800 rounded-full -ml-16 -mb-16 opacity-50 blur-2xl"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-800/80 border border-brand-700 text-brand-300 text-sm font-medium backdrop-blur-sm">
                  <Sprout className="w-4 h-4" /> Success Story
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                  "The new borehole changed our lives."
                </h2>
                <p className="text-brand-100 text-lg leading-relaxed">
                  Before the campaign, women in Kalangala walked 5km daily for water. Thanks to 450 pledges and donations, the village now has a solar-powered water pump.
                </p>

                <div className="h-px bg-brand-800 w-full my-6"></div>

                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-brand-200 border-2 border-brand-500 overflow-hidden shadow-lg">
                    <img src="https://picsum.photos/100/100?random=50" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Mary N.</p>
                    <p className="text-brand-400 text-sm">Community Leader, Kalangala</p>
                  </div>
                </div>
              </div>
              <div className="relative mt-8 lg:mt-0">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-brand-700/30 transform rotate-2 hover:rotate-0 transition-all duration-700">
                  <img src="https://picsum.photos/800/600?random=60" alt="Success Story" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <Quote className="w-8 h-8 text-brand-200 absolute top-4 right-4" />
                  <p className="text-gray-900 font-bold text-2xl font-display mb-1">UGX 12M</p>
                  <p className="text-gray-500 text-sm font-medium">Raised in just 3 weeks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};