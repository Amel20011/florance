import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  User,
  ShoppingBag,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  ShieldCheck,
  Wallet,
  Plus,
} from 'lucide-react';
import { UserProfile } from '../types.js';
import { AnimatedCounter } from './AnimatedCounter.js';
import { VerifiedBadge } from './VerifiedBadge.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenDeposit: () => void;
  pendingOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenDeposit,
  pendingOrdersCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'transaksi', label: 'Transaksi' },
    { id: 'riwayat', label: 'Riwayat' },
    { id: 'produk', label: 'Katalog' },
    { id: 'bantuan', label: 'Bantuan' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            id="florance-brand-logo"
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              FLORANCE
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/90 shadow-xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Authentication */}
          <div className="hidden sm:flex items-center gap-3">
            {/* User Balance & Deposit Button */}
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
                <Wallet className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left leading-tight">
                  <span className="text-[10px] text-slate-500 block font-medium">Saldo</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    <AnimatedCounter prefix="Rp " value={currentUser.balance || 0} />
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenDeposit}
                  className="ml-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Deposit</span>
                </motion.button>
              </div>
            )}

            {/* Orders shortcut badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="nav-btn-orders"
              onClick={() => setActiveTab('orders')}
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
              title="Pesanan Saya"
            >
              <Package className="w-5 h-5" />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
                  {pendingOrdersCount}
                </span>
              )}
            </motion.button>

            {currentUser ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="nav-btn-profile-dropdown"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs transition-all text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-xl object-cover ring-1 ring-blue-200"
                  />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                  {currentUser.isVerified && <VerifiedBadge size="sm" />}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </motion.button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      id="nav-profile-dropdown-menu"
                      className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-slate-800"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400">Masuk sebagai</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {currentUser.name}
                          </p>
                          {currentUser.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {currentUser.email}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] bg-blue-50 text-blue-800 px-2 py-1 rounded-lg">
                          <span>Saldo:</span>
                          <span className="font-bold font-mono">
                            Rp {(currentUser.balance || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onOpenDeposit();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Deposit Saldo QRIS</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('orders');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-blue-600" />
                        <span>Pesanan Saya</span>
                        {pendingOrdersCount > 0 && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                            {pendingOrdersCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Profil & Keamanan</span>
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          onLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Masuk Akun
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200 py-4 space-y-3 bg-white"
            >
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-blue-300"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Akun Pengguna
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-blue-700 border border-blue-200">
                      Aktif
                    </span>
                  </div>

                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        Jumlah Saldo:
                      </span>
                      <span className="text-sm font-black text-blue-700 font-mono">
                        <AnimatedCounter prefix="Rp " value={currentUser.balance || 0} />
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onOpenDeposit();
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Deposit Saldo</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {currentUser && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>Pesanan ({pendingOrdersCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
