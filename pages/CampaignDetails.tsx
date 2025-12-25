import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Campaign, CampaignStatus } from '../types';
import { ApiService } from '../services/api';
import { ProgressBar } from '../components/ProgressBar';
import { Calendar, CheckCircle, Share2, AlertCircle, Phone, CreditCard, ArrowLeft, Heart, MessageCircle, Users, Clock } from 'lucide-react';
import { PaymentSimulation } from '../components/PaymentSimulation';

export const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STORY' | 'UPDATES' | 'COMMUNITY'>('STORY');
  const [heroImage, setHeroImage] = useState<string>('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'DONATE' | 'PLEDGE'>('DONATE');
  const [amount, setAmount] = useState<string>('');
  const [pledgeDate, setPledgeDate] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSimulation, setShowSimulation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'AIRTEL'>('MTN');

  // Real-time update feedback
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updateType, setUpdateType] = useState<'DONATION' | 'PLEDGE' | null>(null);
  const [highlightField, setHighlightField] = useState<'raised' | 'pledged' | null>(null);

  useEffect(() => {
    if (id) {
      ApiService.getCampaignById(id).then(data => {
        setCampaign(data);
        if (data && data.imageUrls && data.imageUrls.length > 0) {
          setHeroImage(data.imageUrls[0]);
        }
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const subscription = ApiService.subscribeToCampaignUpdates(id, (payload: any) => {
      console.log('Real-time update received:', payload);
      if (payload.new) {
        const oldRaised = campaign?.raisedAmount || 0;
        const oldPledged = campaign?.pledgedAmount || 0;
        const newRaised = Number(payload.new.raised_amount);
        const newPledged = Number(payload.new.pledged_amount);

        // Detect what type of update occurred
        if (newRaised > oldRaised) {
          setUpdateType('DONATION');
          setHighlightField('raised');
        } else if (newPledged > oldPledged) {
          setUpdateType('PLEDGE');
          setHighlightField('pledged');
        }

        // Show notification
        setShowUpdateNotification(true);
        setTimeout(() => setShowUpdateNotification(false), 4000);

        // Clear highlight after animation
        setTimeout(() => setHighlightField(null), 2000);

        // Update campaign data
        setCampaign(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            raisedAmount: newRaised,
            pledgedAmount: newPledged,
            status: payload.new.status
          };
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id, campaign]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    const user = await ApiService.getCurrentUser();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (mode === 'DONATE') {
      setShowModal(false);
      setShowSimulation(true);
      return;
    }

    setProcessing(true);
    try {
      await ApiService.createPledge(user.id, campaign.id, Number(amount), pledgeDate);
      setSuccessMsg(`Pledge recorded! We will remind you on ${new Date(pledgeDate).toLocaleDateString()} to fulfill your promise.`);

      const updated = await ApiService.getCampaignById(campaign.id);
      if (updated) setCampaign(updated);

      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg('');
        setAmount('');
        setPledgeDate('');
        setProcessing(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!campaign) return;

    // Check user authentication
    const user = await ApiService.getCurrentUser();
    if (!user) {
      alert('Please log in to make a donation');
      navigate('/login');
      return;
    }

    try {
      // Create donation - database trigger will update campaign raised_amount
      // Real-time subscription will automatically update the UI
      await ApiService.createDonation(user.id, campaign.id, Number(amount), paymentMethod);

      // Close simulation after showing success briefly
      setTimeout(() => {
        setShowSimulation(false);
        setAmount('');
      }, 2000);
    } catch (err: any) {
      console.error('Donation failed:', err);
      // Show user-friendly error message
      const errorMessage = err?.message || 'Failed to process donation. Please try again.';
      alert(`Error: ${errorMessage}`);
      setShowSimulation(false);
    }
  };

  const openModal = (actionMode: 'DONATE' | 'PLEDGE') => {
    setMode(actionMode);
    setShowModal(true);
    setSuccessMsg('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading campaign...</div>;
  if (!campaign) return <div className="min-h-screen flex items-center justify-center text-gray-500">Campaign not found</div>;

  const total = campaign.raisedAmount + campaign.pledgedAmount;
  const percent = Math.round((total / campaign.targetAmount) * 100);
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const displayImage = heroImage || campaign.imageUrls?.[0] || 'https://picsum.photos/800/400';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Real-time Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
          <div className={`bg-white rounded-2xl shadow-2xl border-2 p-4 flex items-center gap-3 ${
            updateType === 'DONATION'
              ? 'border-brand-400'
              : 'border-accent-400'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              updateType === 'DONATION'
                ? 'bg-brand-100'
                : 'bg-accent-100'
            }`}>
              {updateType === 'DONATION' ? (
                <CheckCircle className="w-6 h-6 text-brand-600 animate-pulse" />
              ) : (
                <Clock className="w-6 h-6 text-accent-600 animate-pulse" />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {updateType === 'DONATION' ? 'New Donation!' : 'New Pledge!'}
              </p>
              <p className="text-sm text-gray-600">
                {updateType === 'DONATION'
                  ? 'Someone just donated to this campaign'
                  : 'Someone just pledged to support this campaign'
                }
              </p>
            </div>
            <button
              onClick={() => setShowUpdateNotification(false)}
              className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Containerized Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200 bg-gray-900">
          <img src={displayImage} alt={campaign.title} className="w-full h-full object-cover transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>

          {/* Category Badge Floating */}
          <div className="absolute top-6 left-6">
            <span className="bg-white/95 backdrop-blur text-gray-900 text-sm px-4 py-2 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
              {campaign.category}
            </span>
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {campaign.imageUrls && campaign.imageUrls.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto py-2 px-1 scrollbar-hide">
            {campaign.imageUrls.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setHeroImage(img)}
                className={`relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${displayImage === img ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content Column */}
          <div className="lg:col-span-8">

            {/* Header Text */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4 text-brand-600 font-medium text-sm">
                {campaign.status === CampaignStatus.APPROVED && (
                  <span className="flex items-center bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Verified Campaign
                  </span>
                )}
                <span className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-1.5" /> {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">{campaign.title}</h1>

              <div className="flex items-center gap-4 py-6 border-y border-gray-200">
                <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg border-2 border-white shadow-sm">
                  SK
                </div>
                <div>
                  <p className="text-gray-900 font-bold">Sarah K.</p>
                  <p className="text-gray-500 text-sm">Organizer • Kampala, UG</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('STORY')}
                className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors ${activeTab === 'STORY' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Story
              </button>
              <button
                onClick={() => setActiveTab('UPDATES')}
                className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors ${activeTab === 'UPDATES' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Updates <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">0</span>
              </button>
              <button
                onClick={() => setActiveTab('COMMUNITY')}
                className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors ${activeTab === 'COMMUNITY' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Community
              </button>
            </div>

            {/* Content Area */}
            <div className="prose prose-lg prose-headings:font-display prose-headings:font-bold prose-purple max-w-none text-gray-600 leading-relaxed min-h-[300px] prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto prose-blockquote:border-l-brand-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
              {activeTab === 'STORY' && (
                <div
                  className="animate-fade-in-up"
                  dangerouslySetInnerHTML={{ __html: campaign.description }}
                />
              )}
              {activeTab === 'UPDATES' && (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No updates yet. Check back soon!</p>
                </div>
              )}
              {activeTab === 'COMMUNITY' && (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Be the first to leave a comment with your donation!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <p className="text-4xl font-display font-bold text-gray-900">
                      {total.toLocaleString()}
                    </p>
                    <span className="text-gray-500 font-medium">UGX</span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-3 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{percent}% funded</span>
                    <span className="font-semibold text-gray-700">{campaign.targetAmount.toLocaleString()} UGX goal</span>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Funding Breakdown</h4>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between transition-all duration-500 ${highlightField === 'raised' ? 'bg-brand-50 -mx-2 px-2 py-1 rounded-lg scale-105' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${highlightField === 'raised' ? 'bg-brand-500 scale-110' : 'bg-brand-100'}`}>
                          <CheckCircle className={`w-4 h-4 transition-all ${highlightField === 'raised' ? 'text-white animate-bounce' : 'text-brand-600'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Donated</span>
                      </div>
                      <span className={`text-sm font-bold transition-all ${highlightField === 'raised' ? 'text-brand-600 text-lg' : 'text-gray-900'}`}>
                        UGX {campaign.raisedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between transition-all duration-500 ${highlightField === 'pledged' ? 'bg-accent-50 -mx-2 px-2 py-1 rounded-lg scale-105' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${highlightField === 'pledged' ? 'bg-accent-500 scale-110' : 'bg-accent-100'}`}>
                          <Clock className={`w-4 h-4 transition-all ${highlightField === 'pledged' ? 'text-white animate-bounce' : 'text-accent-600'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Pledged</span>
                      </div>
                      <span className={`text-sm font-bold transition-all ${highlightField === 'pledged' ? 'text-accent-600 text-lg' : 'text-gray-900'}`}>
                        UGX {campaign.pledgedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Total</span>
                        <span className="text-lg font-black text-brand-600">UGX {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => openModal('DONATE')}
                    className="w-full bg-brand-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Donate Now <Heart className="w-5 h-5 fill-white/20" />
                  </button>
                  <button
                    onClick={() => openModal('PLEDGE')}
                    className="w-full bg-accent-50 text-accent-700 border border-accent-200 font-bold text-lg py-4 rounded-xl hover:bg-accent-100 transition-all active:scale-[0.98]"
                  >
                    Pledge for Later
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 128 donors</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> 54 shares</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 items-start">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Guaranteed Safe</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your donation is protected by the PledgeCard Guarantee. We ensure funds reach the intended cause.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up relative z-10">

            {/* Modal Header */}
            <div className={`p-8 text-center ${mode === 'DONATE' ? 'bg-gradient-to-b from-brand-50 to-white' : 'bg-gradient-to-b from-accent-50 to-white'}`}>
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-sm border ${mode === 'DONATE' ? 'bg-white border-brand-100 text-brand-600' : 'bg-white border-accent-100 text-accent-600'}`}>
                {mode === 'DONATE' ? <CreditCard className="w-7 h-7" /> : <Calendar className="w-7 h-7" />}
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">
                {mode === 'DONATE' ? 'Make a Donation' : 'Create a Pledge'}
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                {mode === 'DONATE'
                  ? 'Your contribution will be transferred immediately via Mobile Money.'
                  : 'Commit now, pay later. We’ll send you a reminder.'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-8 pb-8 pt-2">
              {successMsg ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <CheckCircle className="w-10 h-10 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 leading-relaxed">{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleAction} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Amount (UGX)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">UGX</span>
                      <input
                        type="number"
                        required
                        min="500"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-lg font-bold text-gray-900 transition-all"
                        placeholder="50,000"
                      />
                    </div>
                  </div>

                  {mode === 'PLEDGE' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Payment Date</label>
                      <input
                        type="date"
                        required
                        value={pledgeDate}
                        onChange={e => setPledgeDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none font-medium text-gray-900 transition-all"
                      />
                    </div>
                  )}

                  {mode === 'DONATE' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setPaymentMethod('MTN')}
                        className={`p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer relative transition-all border-2 ${paymentMethod === 'MTN' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 bg-gray-50'}`}
                      >
                        {paymentMethod === 'MTN' && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full"></div>}
                        <Phone className={`w-5 h-5 mb-2 ${paymentMethod === 'MTN' ? 'text-brand-600' : 'text-gray-400'}`} />
                        <span className={`text-xs font-bold ${paymentMethod === 'MTN' ? 'text-brand-900' : 'text-gray-500'}`}>MTN MoMo</span>
                      </div>
                      <div
                        onClick={() => setPaymentMethod('AIRTEL')}
                        className={`p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer relative transition-all border-2 ${paymentMethod === 'AIRTEL' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 bg-gray-50'}`}
                      >
                        {paymentMethod === 'AIRTEL' && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full"></div>}
                        <Phone className={`w-5 h-5 mb-2 ${paymentMethod === 'AIRTEL' ? 'text-brand-600' : 'text-gray-400'}`} />
                        <span className={`text-xs font-bold ${paymentMethod === 'AIRTEL' ? 'text-brand-900' : 'text-gray-500'}`}>Airtel Money</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className={`flex-1 px-4 py-3.5 text-white font-bold rounded-xl shadow-lg transform active:scale-[0.98] transition-all ${mode === 'DONATE' ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25' : 'bg-accent-600 hover:bg-accent-700 shadow-accent-500/25'
                        }`}
                    >
                      {processing ? 'Processing...' : (mode === 'DONATE' ? 'Pay Now' : 'Confirm Pledge')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Payment Simulation Overlay */}
      {showSimulation && (
        <PaymentSimulation
          amount={Number(amount)}
          method={paymentMethod}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowSimulation(false)}
        />
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};