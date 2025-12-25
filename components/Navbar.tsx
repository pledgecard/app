import React, { useState, useEffect } from 'react';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { User } from '../types';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    ApiService.getCurrentUser().then(setUser);
  }, [location.pathname]);

  const handleLogout = async () => {
    await ApiService.signOut();
    setUser(null);
    setIsProfileOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path
    ? 'text-brand-700 font-semibold bg-brand-50/50'
    : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <img
                src="/logo.png"
                alt="PledgeCard Logo"
                className="h-[44px] w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/campaigns" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/campaigns')}`}>Explore</Link>
            <Link to="/create" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/create')}`}>Start Campaign</Link>
            <Link to="/dashboard" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/admin" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/admin')}`}>Admin</Link>

            <div className="ml-4 pl-4 border-l border-gray-200">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-gray-700 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 hover:shadow-sm transition-all group"
                  >
                    <div className="bg-brand-100 rounded-full p-1 group-hover:bg-brand-200 transition-colors">
                      <UserIcon className="h-3 w-3 text-brand-700" />
                    </div>
                    <span className="text-sm font-bold font-display">{user.fullName}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 py-2 z-50 animate-fade-in-up">
                      <div className="px-5 py-4 border-b border-gray-50 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-accent-600 hover:bg-accent-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/20 transition-all border border-brand-500/10"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div >

      {/* Mobile menu */}
      {
        isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/campaigns" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50 transition-colors">Explore</Link>
              <Link to="/create" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50 transition-colors">Start Campaign</Link>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50 transition-colors">Dashboard</Link>
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50 transition-colors">Admin</Link>

              {!user ? (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-brand-600 text-white px-4 py-4 rounded-2xl text-base font-bold"
                  >
                    Log In / Sign Up
                  </Link>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-accent-600 hover:bg-accent-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </nav >
  );
};