import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  ShieldCheck,
  Package,
  LogOut,
  Wallet,
  PlusCircle,
  ArrowLeftRight,
  Headphones,
  ExternalLink,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { UserProfile } from '../types.js';
import { VerifiedBadge } from './VerifiedBadge.js';
import { AccountVerificationModal } from './AccountVerificationModal.js';
import { AnimatedCounter } from './AnimatedCounter.js';
import { ThemeLampToggle } from './ThemeLampToggle.js';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onViewOrders: () => void;
  onViewTransactions?: () => void;
  onOpenDeposit?: () => void;
  onOpenCS?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onViewOrders,
  onViewTransactions,
  onOpenDeposit,
  onOpenCS,
  onUpdateUser,
}) => {
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akun Pengguna Florance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Silakan masuk menggunakan Email OTP untuk mengakses saldo, riwayat transaksi otomatis, dan promo eksklusif.
          </p>
        </div>
        <button
          onClick={onOpenLogin}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
        >
          Masuk dengan Email OTP
        </button>

        {/* Theme Toggle even when logged out */}
        <div className="pt-4 text-left">
          <ThemeLampToggle />
        </div>
      </div>
    );
  }

  // Default portrait fallback if avatar is default
  const displayAvatar = currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
  const displayBio = currentUser.bio || 'A Product Designer focused on intuitive user experiences.';
  const isVerified = Boolean(currentUser.isVerified);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-md sm:max-w-lg mx-auto px-4 py-6 sm:py-10 space-y-5"
    >
      {/* 
        Aesthetic Apple/Instagram Portrait Profile Card
      */}
      <div
        id="profile-portrait-hero-card"
        className="relative w-full rounded-[36px] overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl shadow-slate-950/30 group"
      >
        {/* Full Height Portrait Photo */}
        <div className="relative aspect-[3.7/4.4] w-full overflow-hidden bg-slate-900">
          <img
            src={displayAvatar}
            alt={currentUser.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top Quick Status Pill */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentUser.provider === 'apple' ? 'Apple ID' : 'Google Account'}</span>
            </span>

            <button
              onClick={() => setVerificationModalOpen(true)}
              id="btn-open-edit-profile"
              className="px-3 py-1.5 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/30 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
          </div>

          {/* 
            Smooth Dark Gradient Overlay at Bottom of Portrait
          */}
          <div className="absolute inset-x-0 bottom-0 pt-28 pb-6 px-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col justify-end text-left">
            {/* User Name & Verified Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                {currentUser.name}
              </h1>

              <VerifiedBadge size="lg" showTooltip={true} />
            </div>

            {/* Subtitle / Bio text */}
            <p className="text-sm sm:text-base text-slate-200/90 font-normal mt-1 leading-snug line-clamp-2 drop-shadow-xs">
              {displayBio}
            </p>

            <p className="text-[11px] font-mono text-slate-400 mt-2">
              {currentUser.email} • ID: {currentUser.id}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Akun Florance Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Saldo Akun Florance
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight flex items-baseline gap-1">
              <span>Rp</span>
              <AnimatedCounter value={currentUser.balance || 0} />
            </div>
          </div>
        </div>

        {onOpenDeposit && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenDeposit}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Isi Saldo</span>
          </motion.button>
        )}
      </div>

      {/* Tombol Lampu — Theme Mode Switcher Card (User Request) */}
      <ThemeLampToggle />

      {/* Quick Menu Navigators */}
      <div className="grid grid-cols-2 gap-3">
        {onViewTransactions && (
          <button
            onClick={onViewTransactions}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 text-left transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 group-hover:bg-blue-600 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors flex items-center justify-center mb-2.5">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Menu Transaksi
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Beli produk & bayar tagihan
            </p>
          </button>
        )}

        <button
          onClick={onViewOrders}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 text-left transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 group-hover:bg-blue-600 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors flex items-center justify-center mb-2.5">
            <Package className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Riwayat Pesanan
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Lihat status & bukti transaksi
          </p>
        </button>
      </div>

      {/* Security & Customer Service */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 text-xs transition-colors">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Status Keamanan</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> OAuth 2.0 & Enkripsi Aktif
          </span>
        </div>

        {onOpenCS && (
          <button
            onClick={onOpenCS}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-left cursor-pointer transition-colors"
          >
            <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2">
              <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Bantuan & Layanan CS 24 Jam</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Log Out Button */}
      <div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 text-red-700 dark:text-red-300 font-bold text-xs flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/60 cursor-pointer transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </motion.button>
      </div>

      {/* Interactive Verification & Profile Edit Modal */}
      <AccountVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
        }}
      />
    </motion.div>
  );
};

