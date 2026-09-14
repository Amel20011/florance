import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  PackageSearch,
  X,
  Smartphone,
  Wifi,
  Bot,
  Cpu,
  Zap,
  Layers,
} from 'lucide-react';
import { Product } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { PromoBannerCarousel } from './PromoBannerCarousel.js';
import { HorizontalProductRow } from './HorizontalProductRow.js';

interface ProductCatalogProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onBuyNow: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  sortBy?: 'popular' | 'best_seller' | 'price_low' | 'price_high';
  onSortChange?: (sort: 'popular' | 'best_seller' | 'price_low' | 'price_high') => void;
  activeBadgeFilter?: 'ALL' | 'Promo' | 'Populer' | 'Terlaris';
  onBadgeFilterChange?: (badge: 'ALL' | 'Promo' | 'Populer' | 'Terlaris') => void;
  hideControls?: boolean;
  hideTitle?: boolean;
}

const CATEGORY_GROUPS = [
  { id: 'pulsa', label: 'Pulsa Reguler', icon: Smartphone, desc: 'Isi ulang pulsa semua operator Indonesia' },
  { id: 'paket-data', label: 'Paket Data Internet', icon: Wifi, desc: 'Kuota harian, bulanan & unlimited' },
  { id: 'sewa-bot', label: 'Sewa Bot WhatsApp', icon: Bot, desc: 'Sewa cloud bot toko & moderasi grup' },
  { id: 'bot-whatsapp', label: 'Bot WA Jadi (Source Code)', icon: Cpu, desc: 'Full script siap pasang di server VPS' },
  { id: 'token', label: 'Token PLN & Game', icon: Zap, desc: 'Token listrik 24 jam & voucher diamond' },
  { id: 'layanan', label: 'Layanan Digital', icon: Layers, desc: 'Jasa setup server VPS & integrasi QRIS' },
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onBuyNow,
  onViewDetail,
  searchQuery: controlledSearchQuery,
  onSearchChange,
  sortBy: controlledSortBy,
  onSortChange,
  activeBadgeFilter: controlledBadgeFilter,
  onBadgeFilterChange,
  hideControls = false,
  hideTitle = false,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSortBy, setInternalSortBy] = useState<'popular' | 'best_seller' | 'price_low' | 'price_high'>('popular');
  const [internalBadgeFilter, setInternalBadgeFilter] = useState<'ALL' | 'Promo' | 'Populer' | 'Terlaris'>('ALL');

  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;

  const sortBy = controlledSortBy !== undefined ? controlledSortBy : internalSortBy;
  const setSortBy = onSortChange || setInternalSortBy;

  const activeBadgeFilter = controlledBadgeFilter !== undefined ? controlledBadgeFilter : internalBadgeFilter;
  const setActiveBadgeFilter = onBadgeFilterChange || setInternalBadgeFilter;

  const categoryOptions = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'pulsa', label: 'Pulsa Reguler' },
    { id: 'paket-data', label: 'Paket Data' },
    { id: 'sewa-bot', label: 'Sewa Bot WA' },
    { id: 'bot-whatsapp', label: 'Bot WA Jadi' },
    { id: 'token', label: 'Token PLN & Game' },
    { id: 'layanan', label: 'Layanan Digital' },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Strict Category filter
        const matchCategory =
          selectedCategory === 'all' || product.category === selectedCategory;

        // Search query filter
        const matchSearch =
          !searchQuery.trim() ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.variants.some((v) =>
            v.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

        // Badge filter
        const matchBadge =
          activeBadgeFilter === 'ALL' || product.badge === activeBadgeFilter;

        return matchCategory && matchSearch && matchBadge;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.basePrice - b.basePrice;
        if (sortBy === 'price_high') return b.basePrice - a.basePrice;
        if (sortBy === 'best_seller') return b.soldCount - a.soldCount;
        return b.rating - a.rating;
      });
  }, [products, selectedCategory, searchQuery, sortBy, activeBadgeFilter]);

  // Grouping when 'all' is selected and no search is active
  const isGroupedView = selectedCategory === 'all' && !searchQuery.trim() && activeBadgeFilter === 'ALL';

  return (
    <section id="katalog-produk" className={`py-4 sm:py-6 bg-transparent ${hideControls ? 'pt-1' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Section Title (only shown when not hidden) */}
        {!hideTitle && (
          <div className="text-center max-w-xl mx-auto mb-4 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Katalog Resmi Florance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Katalog Produk & Layanan Digital
            </h2>
            <p className="text-xs text-slate-500">
              Pilihan pulsa, paket data, dan sewa bot dengan proses kilat 24 jam.
            </p>
          </div>
        )}

        {/* Controls Bar (only shown if not hideControls) */}
        {!hideControls && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
            {/* Search input */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="catalog-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pulsa, paket data, sewa bot, token PLN..."
                className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-11 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:border-blue-600"
              >
                <option value="popular">Paling Populer</option>
                <option value="best_seller">Paling Terlaris</option>
                <option value="price_low">Harga Terendah</option>
                <option value="price_high">Harga Tertinggi</option>
              </select>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar select-none">
              {categoryOptions.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Active filter summary bar */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div>
                Menampilkan <span className="font-bold text-slate-900">{filteredProducts.length}</span> produk
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 mr-1">Filter:</span>
                {(['ALL', 'Promo', 'Terlaris', 'Populer'] as const).map((badge) => (
                  <button
                    key={badge}
                    onClick={() => setActiveBadgeFilter(badge)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      activeBadgeFilter === badge
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {badge === 'ALL' ? 'Semua' : badge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3-Photo Auto/Manual Carousel Banner (every 3 seconds + smooth horizontal blur) */}
        {!hideControls && (
          <div className="pt-1 pb-2">
            <PromoBannerCarousel onSelectCategory={onSelectCategory} />
          </div>
        )}

        {/* Product Cards Rendering */}
        {filteredProducts.length > 0 ? (
          isGroupedView ? (
            /* Grouped Sections by Category to ensure products are strictly organized in their own places */
            <div className="space-y-6">
              {CATEGORY_GROUPS.map((group) => {
                const groupProducts = filteredProducts.filter((p) => p.category === group.id);
                if (groupProducts.length === 0) return null;
                const Icon = group.icon;

                return (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white shadow-xs">
                        <Icon className="w-4 h-4 text-white shrink-0" />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white">
                          {group.label}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {groupProducts.length} Produk
                      </span>
                    </div>

                    <HorizontalProductRow
                      products={groupProducts}
                      onBuyNow={onBuyNow}
                      onViewDetail={onViewDetail}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single Category / Filtered View: Ultra-Smooth Horizontal Scrollable List */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white shadow-xs">
                  <Smartphone className="w-4 h-4 text-white shrink-0" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white">
                    {categoryOptions.find((c) => c.id === selectedCategory)?.label || 'PRODUK'}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {filteredProducts.length} Produk
                </span>
              </div>

              <HorizontalProductRow
                products={filteredProducts}
                onBuyNow={onBuyNow}
                onViewDetail={onViewDetail}
              />
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl bg-white border border-slate-200 p-8 text-center max-w-md mx-auto my-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <PackageSearch className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Tidak ada produk yang cocok dengan pencarian atau filter kategori saat ini.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
                setActiveBadgeFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

