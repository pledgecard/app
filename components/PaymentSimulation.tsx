import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';

interface PaymentSimulationProps {
    amount: number;
    method: 'MTN' | 'AIRTEL';
    onSuccess: () => void;
    onCancel: () => void;
}

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({ amount, method, onSuccess, onCancel }) => {
    const [step, setStep] = useState<'INITIAL' | 'PROCESSING' | 'CONFIRMING' | 'SUCCESS'>('INITIAL');
    const [phone, setPhone] = useState('');

    const brandColor = method === 'MTN' ? 'bg-[#FFCC00] text-black' : 'bg-[#ED1C24] text-white';
    const brandName = method === 'MTN' ? 'MTN MoMo' : 'Airtel Money';

    const startPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        setStep('PROCESSING');

        // Simulate network delay
        setTimeout(() => {
            setStep('CONFIRMING');
        }, 2000);
    };

    const confirmPayment = () => {
        setStep('PROCESSING');
        setTimeout(() => {
            setStep('SUCCESS');
            setTimeout(onSuccess, 2000);
        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative">

                {/* Close Button (only at start) */}
                {step === 'INITIAL' && (
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                        <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                )}

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${brandColor}`}>
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-xl text-gray-900">{brandName}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mobile Payment</p>
                        </div>
                    </div>

                    {step === 'INITIAL' && (
                        <div className="animate-fade-in-up">
                            <div className="mb-8">
                                <p className="text-gray-500 font-medium mb-1">Paying Amount</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-display font-bold text-gray-900">UGX {amount.toLocaleString()}</h2>
                                </div>
                            </div>

                            <form onSubmit={startPayment} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input
                                            type="tel"
                                            required
                                            autoFocus
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="07XX XXX XXX"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-xl text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="bg-brand-50 p-4 rounded-2xl flex gap-3 items-center">
                                    <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                                    <p className="text-xs font-medium text-brand-800">Your payment is secured and encrypted via standard mobile money protocols.</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2 group"
                                >
                                    Pay Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'PROCESSING' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Processing Payment</h3>
                            <p className="text-gray-500">Wait a moment, we're reaching your provider...</p>
                        </div>
                    )}

                    {step === 'CONFIRMING' && (
                        <div className="animate-fade-in-up py-4">
                            <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden mb-8">
                                {/* Notification bubble simulation */}
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 animate-bounce">
                                    <p className="text-xs font-bold text-brand-300 uppercase mb-1">Incoming USSD Prompt</p>
                                    <p className="text-sm font-medium leading-relaxed">
                                        "Do you want to pay UGX {amount.toLocaleString()} to PLEDGECARD? Enter PIN to confirm."
                                    </p>
                                </div>
                                <div className="mt-8 space-y-4">
                                    <button
                                        onClick={confirmPayment}
                                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        Confirm (Enter PIN)
                                    </button>
                                    <button
                                        onClick={onCancel}
                                        className="w-full bg-transparent border border-white/20 text-white/60 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-400 font-medium italic">
                                * This is a simulation. In production, this prompt appears directly on your phone screen.
                            </p>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-24 h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-100 animate-bounce">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Payment Successful!</h2>
                            <p className="text-gray-500 leading-relaxed max-w-[240px]">
                                Your contribution of UGX {amount.toLocaleString()} has been received. Thank you!
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
