import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import {
  ArrowRight,
  Upload,
  X,
  MapPin,
  Calendar,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

// Steps definition
const STEPS = ['Basics', 'Organizer', 'Goal', 'Media', 'Story'];

const CATEGORIES = [
  "Business", "Community", "Competitions", "Creative",
  "Education", "Emergencies", "Environment", "Events", "Faith",
  "Family", "Funerals & Memorials", "Introduction/Wedding", "Medical", "Monthly Bills",
  "Other", "Sports", "Travel", "Volunteer", "Wishes"
];

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    country: 'Uganda',
    zip: '',
    category: '',
    // Organizer details
    organizerName: '',
    organizerPhone: '',
    organizerLocation: '',
    relationship: '',
    beneficiaryName: '',
    // Campaign details
    targetAmount: '',
    endDate: '',
    imageUrls: [] as string[],
    title: '',
    description: ''
  });

  // Calculate Progress
  const progress = (currentStep / STEPS.length) * 100;

  // Check auth on mount
  useEffect(() => {
    ApiService.getCurrentUser().then(user => {
      if (!user) {
        navigate('/login', { state: { from: { pathname: '/create' } } });
      } else {
        // Pre-fill organizer name with user's name
        setFormData(prev => ({ ...prev, organizerName: user.fullName || '' }));
      }
    });

    const date = new Date();
    date.setDate(date.getDate() + 30);
    setFormData(prev => ({ ...prev, endDate: date.toISOString().split('T')[0] }));
  }, [navigate]);

  const handleNext = () => {
    // Basic Validation before moving forward
    if (currentStep === 1 && !formData.category) return alert("Please select a category.");
    if (currentStep === 2 && !formData.organizerName) return alert("Please enter the organizer name.");
    if (currentStep === 3 && (!formData.targetAmount || !formData.endDate)) return alert("Please set a goal and duration.");
    if (currentStep === 4 && formData.imageUrls.length === 0) return alert("Please upload a cover photo.");

    if (currentStep < STEPS.length) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return alert("Please complete your story.");

    setSubmitting(true);
    await ApiService.createCampaign({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      targetAmount: Number(formData.targetAmount),
      endDate: formData.endDate,
      imageUrls: formData.imageUrls,
      // Organizer details
      organizerName: formData.organizerName,
      organizerPhone: formData.organizerPhone,
      organizerLocation: formData.organizerLocation,
      relationship: formData.relationship,
      beneficiaryName: formData.beneficiaryName
    });
    setSubmitting(false);
    navigate('/dashboard'); // Redirect to dashboard or home
  };

  // Image Handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      try {
        const publicUrl = await ApiService.uploadImage(file);
        setFormData(prev => ({ ...prev, imageUrls: [publicUrl, ...prev.imageUrls].slice(0, 4) }));
      } catch (err) {
        alert("Failed to upload image. Please try again.");
        console.error(err);
      } finally {
        setUploadingImage(false);
      }
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  // --- Render Steps ---

  const renderStep1_Basics = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Let's start with the basics</h2>
        <p className="text-gray-500">Where are you raising funds and who is it for?</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Location</label>
            <div className="relative">
              <MapPin className="absolute top-3.5 left-4 w-5 h-5 text-gray-400" />
              <select className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none appearance-none">
                <option>Uganda</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Postal Code / City</label>
            <input
              type="text"
              placeholder="e.g. Kampala"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block text-center">What best describes your campaign?</label>

          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                className={`px-5 py-2.5 rounded-full border transition-all duration-200 font-medium text-sm ${formData.category === cat
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2_Organizer = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Organizer Details</h2>
        <p className="text-gray-500">Tell us about yourself and the beneficiary</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Organizer Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Organizer Name *</label>
          <input
            type="text"
            value={formData.organizerName}
            onChange={(e) => setFormData(prev => ({ ...prev, organizerName: e.target.value }))}
            placeholder="Your full name"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Phone Number (for Mobile Money)</label>
          <input
            type="tel"
            value={formData.organizerPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, organizerPhone: e.target.value }))}
            placeholder="e.g. 0772 123 456"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <p className="text-xs text-gray-500">We'll use this to verify donations and send payment confirmations</p>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Location/District</label>
          <select
            value={formData.organizerLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, organizerLocation: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">Select your location</option>
            <option value="Kampala">Kampala</option>
            <option value="Wakiso">Wakiso</option>
            <option value="Mukono">Mukono</option>
            <option value="Mbarara">Mbarara</option>
            <option value="Gulu">Gulu</option>
            <option value="Lira">Lira</option>
            <option value="Jinja">Jinja</option>
            <option value="Mbale">Mbale</option>
            <option value="Arua">Arua</option>
            <option value="Soroti">Soroti</option>
            <option value="Fort Portal">Fort Portal</option>
            <option value="Masaka">Masaka</option>
            <option value="Mubende">Mubende</option>
            <option value="Entebbe">Entebbe</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Relationship to Beneficiary */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Relationship to Beneficiary</label>
          <select
            value={formData.relationship}
            onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">Select relationship</option>
            <option value="I am the beneficiary">I am the beneficiary</option>
            <option value="Family member">Family member</option>
            <option value="Friend">Friend</option>
            <option value="Neighbor">Neighbor</option>
            <option value="Colleague">Colleague</option>
            <option value="NGO volunteer">NGO volunteer</option>
            <option value="Community leader">Community leader</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Beneficiary Name (if different from organizer) */}
        {formData.relationship && formData.relationship !== 'I am the beneficiary' && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Beneficiary Name</label>
            <input
              type="text"
              value={formData.beneficiaryName}
              onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
              placeholder="Name of the person you're raising funds for"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        )}

        {/* Info Box */}
        <div className="bg-brand-50 p-4 rounded-xl flex gap-3 items-start">
          <Lightbulb className="w-5 h-5 shrink-0 text-brand-600 mt-0.5" />
          <p className="text-sm text-brand-900 leading-relaxed">
            <strong>Why we need this:</strong> Donors want to know who is organizing the campaign and their relationship to the beneficiary. This builds trust and credibility.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3_Goal = () => (
    <div className="space-y-8 animate-fade-in-up text-center">
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Set your fundraising goal</h2>
        <p className="text-gray-500">How much do you aim to raise?</p>
      </div>

      <div className="max-w-md mx-auto relative">
        <span className="absolute top-1/2 -translate-y-1/2 left-4 text-4xl font-bold text-gray-300">UGX</span>
        <input
          type="number"
          autoFocus
          value={formData.targetAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
          placeholder="0"
          className="w-full pl-24 pr-4 py-4 text-5xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-brand-500 outline-none transition-colors placeholder-gray-200 text-right"
        />
      </div>

      <div className="max-w-md mx-auto pt-8 text-left space-y-4">
        <label className="block text-sm font-bold text-gray-700">When should this campaign end?</label>
        <div className="relative">
          <Calendar className="absolute top-3.5 left-4 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={formData.endDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <div className="bg-brand-50 p-4 rounded-xl flex gap-3 items-start text-sm text-brand-800">
          <Lightbulb className="w-5 h-5 shrink-0" />
          <p><strong>Tip:</strong> Campaigns with realistic goals and deadlines tend to raise more money. You can always edit this later.</p>
        </div>
      </div>
    </div>
  );

  const renderStep4_Media = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Add a cover photo</h2>
        <p className="text-gray-500">A high-quality photo will tell your story better than words.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {formData.imageUrls.length > 0 ? (
          <div className="space-y-4">
            {/* Main Hero Image */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-gray-200 group">
              <img src={formData.imageUrls[0]} className="w-full h-full object-cover" alt="Main cover" />
              <button
                onClick={() => removeImage(0)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-accent-600 hover:bg-accent-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {formData.imageUrls.slice(1).map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
                  <button
                    onClick={() => removeImage(idx + 1)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ))}

              {/* Add More Button */}
              {formData.imageUrls.length < 4 && (
                <label className={`w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all text-gray-400 hover:text-brand-600 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Add</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        ) : (
          <label className={`block w-full aspect-video border-4 border-dashed border-gray-200 rounded-3xl hover:border-brand-300 hover:bg-brand-50 transition-all cursor-pointer group ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-brand-600">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              </div>
              <span className="font-bold text-lg">{uploadingImage ? 'Uploading...' : 'Drag or drop a photo here'}</span>
              {!uploadingImage && <span className="text-sm font-medium mt-1">or click to browse</span>}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );

  const renderStep5_Story = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Tell your story</h2>
        <p className="text-gray-500">What are you raising money for and why does it matter?</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Campaign Title</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Help the Village Build a Well"
            className="w-full px-4 py-4 text-xl font-bold font-display bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Description</label>
          <RichTextEditor
            value={formData.description}
            onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
            className="min-h-[400px]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header / Progress */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 h-16">
        <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <X className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {currentStep} of {STEPS.length}</span>
              <p className="text-sm font-bold text-gray-900">{STEPS[currentStep - 1]}</p>
            </div>
          </div>

          {/* Logo placeholder for center */}
          <div className="font-display font-bold text-xl text-brand-600 hidden md:block">
            PledgeCard
          </div>

          <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && renderStep1_Basics()}
          {currentStep === 2 && renderStep2_Organizer()}
          {currentStep === 3 && renderStep3_Goal()}
          {currentStep === 4 && renderStep4_Media()}
          {currentStep === 5 && renderStep5_Story()}
        </div>
      </main>

      {/* Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-full font-bold text-gray-600 transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100'}`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="px-10 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold shadow-lg shadow-brand-500/20 transform active:scale-95 transition-all flex items-center gap-2"
          >
            {currentStep === STEPS.length ? (submitting ? 'Launching...' : 'Complete Campaign') : 'Continue'}
            {!submitting && currentStep !== STEPS.length && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};