import React from 'react';
import { ArrowLeft, Quote, Heart, TrendingUp, Sprout, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stories = [
  {
    id: 1,
    title: "Namayingo Women's Cooperative Expansion",
    category: "Agriculture",
    raised: "45,000,000",
    time: "6 weeks",
    description: "The cooperative grew from 20 to 150 women. They raised capital to expand their agricultural business, purchased modern farming equipment, and now supply produce to markets across Uganda and Kenya.",
    image: "/success-stories/borehole_success.png",
    author: "Sarah A.",
    role: "Cooperative Chairperson",
    authorImg: "/success-stories/mary_profile.png",
    stat: "150+ Women Empowered"
  },
  {
    id: 2,
    title: "Solar Power for Gulu Community School",
    category: "Education",
    raised: "12,500,000",
    time: "3 weeks",
    description: "A community school in Gulu was struggling with power outages, affecting evening classes. Within 3 weeks, donors from 4 countries funded a complete solar system, now providing light to 400+ students.",
    image: "https://images.unsplash.com/photo-1509091308420-2953c0a0136d?q=80&w=2070&auto=format&fit=crop",
    author: "James O.",
    role: "Headmaster",
    authorImg: "/success-stories/mary_profile.png",
    stat: "400 Students Impacted"
  },
  {
    id: 3,
    title: "Emergency Surgery for Baby Ethan",
    category: "Medical",
    raised: "8,200,000",
    time: "4 days",
    description: "When Baby Ethan needed urgent cardiac surgery, the community rallied in record time. The platform's instant mobile money integration allowed funds to reach the hospital within hours.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop",
    author: "Mercy K.",
    role: "Mother",
    authorImg: "/success-stories/mary_profile.png",
    stat: "100% Funded in 4 Days"
  }
];

export const SuccessStories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFE] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center text-gray-500 hover:text-brand-600 font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
          <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 tracking-tighter mb-6 relative">
             Changed <span className="text-brand-600">Lives.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Explore the real-world impact of your generosity. Every story here represents a community transformed through collective action.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="space-y-24">
          {stories.map((story, idx) => (
            <div 
              key={story.id} 
              className={`flex flex-col lg:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Image Side */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="absolute -inset-4 bg-brand-100/50 rounded-[3rem] blur-2xl group-hover:bg-brand-200/50 transition-colors opacity-0 group-hover:opacity-100 duration-500"></div>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-700 group-hover:scale-[1.02]">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Floating Stat */}
                  <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-500">
                    <p className="text-2xl font-black text-brand-600 leading-none">{story.stat}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{story.category}</p>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-bold uppercase tracking-widest">
                  <Sprout className="w-4 h-4" /> Successful Project
                </div>
                
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight tracking-tight">
                  {story.title}
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed font-regular">
                  {story.description}
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Raised</p>
                    <p className="text-2xl font-black text-gray-900">UGX {story.raised}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-2xl font-black text-gray-900">{story.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <div className="h-14 w-14 rounded-full bg-brand-200 border-2 border-white overflow-hidden shadow-lg">
                    <img src={story.authorImg} alt={story.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-lg leading-none">{story.author}</p>
                    <p className="text-brand-600 text-sm font-medium mt-1 uppercase tracking-wide">{story.role}</p>
                  </div>
                  <Quote className="w-10 h-10 text-brand-100 ml-auto opacity-50" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-32 text-center bg-brand-900 rounded-[3rem] p-16 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Your story starts here.</h2>
              <p className="text-xl text-brand-200/80 max-w-2xl mx-auto">
                Join thousands of others making a real difference in communities across Africa.
              </p>
              <button 
                onClick={() => navigate('/create')}
                className="bg-white text-brand-900 px-10 py-4 rounded-2xl font-black text-lg hover:bg-brand-50 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Start Your Campaign
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
