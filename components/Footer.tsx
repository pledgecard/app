import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight, Heart } from 'lucide-react';

interface FooterLinkProps {
  to: string;
}

const FooterLink: React.FC<PropsWithChildren<FooterLinkProps>> = ({ to, children }) => (
  <li>
    <Link to={to} className="text-gray-400 hover:text-brand-300 transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200">
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a
    href={href}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 hover:scale-110 hover:border-brand-500/30"
  >
    {icon}
  </a>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f0421] text-white pt-24 pb-12 relative overflow-hidden mt-auto">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-900 to-transparent opacity-50"></div>

      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-brand-500/20 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="PledgeCard Logo"
                className="h-[48px] w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Bridging the intention-action gap across Africa — democratizing access to financial resources through secure, transparent crowdfunding.
            </p>
            <div className="flex gap-4">
              <SocialIcon href="#" icon={<Facebook size={18} />} />
              <SocialIcon href="#" icon={<Twitter size={18} />} />
              <SocialIcon href="#" icon={<Instagram size={18} />} />
              <SocialIcon href="#" icon={<Linkedin size={18} />} />
            </div>
          </div>

          {/* Column 2: Discover */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Discover</h3>
            <ul className="space-y-4">
              <FooterLink to="/campaigns">All Campaigns</FooterLink>
              <FooterLink to="/campaigns?cat=medical">Medical Fundraisers</FooterLink>
              <FooterLink to="/campaigns?cat=education">Education</FooterLink>
              <FooterLink to="/campaigns?cat=emergency">Emergency Relief</FooterLink>
              <FooterLink to="/campaigns?cat=business">Small Business</FooterLink>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Resources</h3>
            <ul className="space-y-4">
              <FooterLink to="/how-it-works">How it Works</FooterLink>
              <FooterLink to="/pricing">Pricing & Fees</FooterLink>
              <FooterLink to="/trust">Trust & Safety</FooterLink>
              <FooterLink to="/stories">Success Stories</FooterLink>
              <FooterLink to="/help">Help Center</FooterLink>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest success stories and platform updates delivered to your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-white text-sm placeholder-gray-500 transition-all hover:bg-white/10"
                />
              </div>
              <button className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20">
                Subscribe <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Pledgecard Africa. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
