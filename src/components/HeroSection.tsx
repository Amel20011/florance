import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ArrowUpDown,
  Wallet,
  Plus,
  X,
} from 'lucide-react';
import { UserProfile } from '../types.js';
import { AnimatedCounter } from './AnimatedCounter.js';
import { VerifiedBadge } from './VerifiedBadge.js';
import { PromoBannerCarousel } from './PromoBannerCarousel.js';

interface HeroSectionProps {
  currentUser?: UserProfile | null;
  onOpenDeposit?: () => void;
  onViewOrders?: () => void;
  onViewProfile?: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'popular' | 'best_seller' | 'price_low' | 'price_high';
  onSortChange: (sort: 'popular' | 'best_seller' | 'price_low' | 'price_high') => void;
  activeBadgeFilter: 'ALL' | 'Promo' | 'Populer' | 'Terlaris';
  onBadgeFilterChange: (badge: 'ALL' | 'Promo' | 'Populer' | 'Terlaris') => void;
  totalProductsCount: number;
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Produk' },
  { id: 'pulsa', label: 'Pulsa Reguler' },
  { id: 'paket-data', label: 'Paket Data' },
  { id: 'sewa-bot', label: 'Sewa Bot WA' },
  { id: 'bot-whatsapp', label: 'Bot WA Jadi' },
  { id: 'token', label: 'Token PLN & Game' },
  { id: 'layanan', label: 'Layanan Digital' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentUser,
  onOpenDeposit,
  onViewProfile,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  activeBadgeFilter,
  onBadgeFilterChange,
  totalProductsCount,
}) => {
  return (
    <section className="pt-3 pb-2 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        {/* 1. User Account Card at Top */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-blue-200/80 shadow-md shadow-blue-900/5 text-left transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Profile Photo, Name, Verified Badge & Email */}
              <div
                onClick={onViewProfile}
                className="flex items-center gap-3.5 cursor-pointer group select-none min-w-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-600 transition-all shadow-xs"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AKUN PENGGUNA
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {currentUser.name}
                    </h3>
                    {currentUser.isVerified && <VerifiedBadge size="sm" />}
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Saldo & Deposit Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 flex items-center gap-1 sm:justify-end">
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jumlah Saldo:</span>
                  </span>
                  <div className="text-lg sm:text-xl font-black text-blue-700 font-mono tracking-tight flex items-baseline sm:justify-end gap-1">
                    <span>Rp</span>
                    <AnimatedCounter value={currentUser.balance || 0} />
                  </div>
                </div>

                {onOpenDeposit && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenDeposit}
                    className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Deposit</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. 3-Photo Promotional Banner Carousel (Auto-slide 3s) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <PromoBannerCarousel onSelectCategory={onSelectCategory} />
        </motion.div>

        {/* 
          3. Search & Filter Card (Tepat Di Bawah Banner Promosi)
        */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3.5"
        >
          {/* Row 1: Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari pulsa, paket data, sewa bot, token PLN"
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Row 2: Sort Selector (Paling Populer) */}
          <div className="relative w-full">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="w-full pl-11 pr-8 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-600 transition-all"
            >
              <option value="popular">Paling Populer</option>
              <option value="best_seller">Paling Terlaris</option>
              <option value="price_low">Harga Terendah</option>
              <option value="price_high">Harga Tertinggi</option>
            </select>
          </div>

          {/* Row 3: Category Pills (Semua Produk, Pulsa Reguler, Paket Data, ...) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar select-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Row 4: Menampilkan X produk + Filter Tags (Semua, Promo, Terlaris, Populer) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Menampilkan <span className="font-bold text-slate-900">{totalProductsCount}</span> produk
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Filter:</span>
              {(['ALL', 'Promo', 'Terlaris', 'Populer'] as const).map((badge) => (
                <button
                  key={badge}
                  onClick={() => onBadgeFilterChange(badge)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    activeBadgeFilter === badge
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {badge === 'ALL' ? 'Semua' : badge}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
