import React from 'react';
import { ArrowLeft, Heart, Zap, ShieldCheck, CheckCircle2, ArrowRight, Smartphone, Mail, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const steps = [
  {
    icon: Globe,
    title: "1. Create Your Story",
    description: "Launch your campaign in minutes. Share your vision, set your target, and upload photos to tell your compelling story to the community.",
    details: ["Set a clear goal", "Choose your category", "Add vibrant images"]
  },
  {
    icon: Smartphone,
    title: "2. Receive Support",
    description: "Accept contributions instantly through MTN MoMo, Airtel Money, and Visa. Supporters can donate cash or make pledges to pay later.",
    details: ["Instant Mobile Money", "Automated Pledge Tracking", "Real-time Notifications"]
  },
  {
    icon: ShieldCheck,
    title: "3. Direct Impact",
    description: "Withdraw funds directly to your verified account. Our local team ensures transparency so your community sees the impact you're making.",
    details: ["Verified Withdrawals", "Transparent Reporting", "Community Updates"]
  }
];

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFE] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center text-gray-500 hover:text-brand-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
          <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 tracking-tighter mb-6 relative">
             Fundraising <br /><span className="text-brand-600">Simplified.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            PledgeCard Africa combines localized technology with radical transparency to make fundraising accessible for everyone.
          </p>
        </div>

        {/* Path Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative mb-32">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[15%] left-[10%] right-[10%] h-0.5 bg-brand-100 border-t-2 border-dashed border-brand-200 -z-0"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-brand-500/10 transition-all group">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-lg group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-500">
                <step.icon className="w-10 h-10 text-brand-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                {step.description}
              </p>
              <ul className="space-y-3">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-3 text-sm font-bold text-gray-400 group-hover:text-brand-700 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-brand-300" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Key Features Block */}
        <div className="bg-[#050507] rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden mb-32">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-900/10 blur-[120px] pointer-events-none"></div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-8">
                 <span className="text-brand-400 font-bold uppercase tracking-[0.2em] text-xs">The Advantage</span>
                 <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight">Built for the African Market.</h2>
                 <p className="text-xl text-gray-400 leading-relaxed">
                   We know local context. From Mobile Money integration to localized vetted support, we bridge the gap between global intention and local impact.
                 </p>
                 
                 <div className="space-y-6 pt-4">
                    <div className="flex gap-6 items-start">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Zap className="w-6 h-6 text-brand-400" />
                       </div>
                       <div>
                          <h4 className="font-bold text-lg mb-1">Instant Payouts</h4>
                          <p className="text-gray-500 text-sm">Withdraw your funds to MTN or Airtel Money in hours, not weeks.</p>
                       </div>
                    </div>
                    <div className="flex gap-6 items-start">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Heart className="w-6 h-6 text-brand-400" />
                       </div>
                       <div>
                          <h4 className="font-bold text-lg mb-1">Pledge System</h4>
                          <p className="text-gray-500 text-sm">Enable donors to commit support even when they are awaiting their next paycheck.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="relative">
                 <div className="aspect-square bg-gradient-to-tr from-brand-600 to-brand-400 rounded-[3rem] p-12 flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <ShieldCheck className="w-48 h-48 text-white/20 absolute -right-12 -bottom-12" />
                    <div className="text-center space-y-6">
                       <ShieldCheck className="w-32 h-32 text-white mx-auto shadow-2xl" />
                       <h3 className="text-3xl font-display font-black">100% Secure</h3>
                       <p className="text-brand-100 font-medium">Bank-grade encryption and regional vetting teams ensure your trust is preserved.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
           <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-8">Ready to start?</h2>
           <Link to="/create" className="inline-flex items-center gap-3 px-12 py-5 bg-brand-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all">
              Launch Your Campaign <ArrowRight className="w-6 h-6" />
           </Link>
        </div>
      </div>
    </div>
  );
};
