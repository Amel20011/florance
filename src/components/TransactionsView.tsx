import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  Search,
  AlertTriangle,
  QrCode,
  Smartphone,
  Wifi,
  Zap,
  Bot,
  Layers,
  Cpu,
  ShieldCheck,
  RefreshCw,
  X,
  ArrowUpDown,
  PackageSearch,
} from 'lucide-react';
import { Product, Order, UserProfile } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { HorizontalProductRow } from './HorizontalProductRow.js';

interface TransactionsViewProps {
  products: Product[];
  currentUser: UserProfile | null;
  onSelectProduct: (product: Product) => void;
  onViewDetail?: (product: Product) => void;
  onOpenDeposit?: () => void;
  onViewHistory?: () => void;
  onPayPendingOrder: (order: Order) => void;
  initialCategory?: string;
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

const CATEGORY_GROUPS = [
  { id: 'pulsa', label: 'Pulsa Reguler', icon: Smartphone, desc: 'Isi ulang pulsa semua operator Indonesia' },
  { id: 'paket-data', label: 'Paket Data Internet', icon: Wifi, desc: 'Kuota harian, bulanan & unlimited' },
  { id: 'sewa-bot', label: 'Sewa Bot WhatsApp', icon: Bot, desc: 'Sewa cloud bot toko & moderasi grup' },
  { id: 'bot-whatsapp', label: 'Bot WA Jadi (Source Code)', icon: Cpu, desc: 'Full script siap pasang di server VPS' },
  { id: 'token', label: 'Token PLN & Game', icon: Zap, desc: 'Token listrik 24 jam & voucher diamond' },
  { id: 'layanan', label: 'Layanan Digital', icon: Layers, desc: 'Jasa setup server VPS & integrasi QRIS' },
];

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  products,
  currentUser,
  onSelectProduct,
  onViewDetail = onSelectProduct,
  onPayPendingOrder,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'best_seller' | 'price_low' | 'price_high'>('popular');
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<'ALL' | 'Promo' | 'Populer' | 'Terlaris'>('ALL');

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchResult, setSearchResult] = useState<Order | null | 'NOT_FOUND'>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Sync initial category if changed
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch pending orders
  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const url = currentUser?.id ? `/api/orders?userId=${currentUser.id}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const unpaids = data.orders.filter((o: Order) => o.paymentStatus === 'PENDING');
        setPendingOrders(unpaids);
      }
    } catch {
      // ignore
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [currentUser?.id]);

  const handleCancelPending = async (order: Order) => {
    const confirmCancel = window.confirm(`Batalkan pembayaran untuk invoice ${order.invoice}?`);
    if (!confirmCancel) return;

    try {
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: order.gatewayTransactionId,
          order_id: order.id,
          invoice: order.invoice,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setPendingOrders((prev) => prev.filter((o) => o.id !== order.id && o.invoice !== order.invoice));
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  // Search invoice
  const handleSearchInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInvoice.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/orders/check-status?invoice=${encodeURIComponent(searchInvoice.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSearchResult(data.order);
      } else {
        setSearchResult('NOT_FOUND');
      }
    } catch {
      setSearchResult('NOT_FOUND');
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Strict category isolation
        const matchCategory =
          selectedCategory === 'all' || product.category === selectedCategory;

        const matchSearch =
          !searchQuery.trim() ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.variants.some((v) =>
            v.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

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

  // Check if grouped layout applies
  const isGroupedView = selectedCategory === 'all' && !searchQuery.trim() && activeBadgeFilter === 'ALL';

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      {/* 1. Header Transaksi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <ArrowLeftRight className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              Halaman Transaksi
            </h1>
            <p className="text-xs text-slate-500">
              Pilih dan beli pulsa, kuota data, sewa bot, atau token secara instan
            </p>
          </div>
        </div>
      </div>

      {/* 2. Form Cek Status Invoice Transaksi */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Cek Status Invoice / Transaksi
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          Masukkan nomor invoice (contoh: FLR-2026...) untuk memeriksa status pembayaran secara langsung.
        </p>

        <form onSubmit={handleSearchInvoice} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Nomor Invoice, misal: FLR-..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchInvoice.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            {isSearching ? 'Memeriksa...' : 'Cek Status'}
          </button>
        </form>

        {searchResult === 'NOT_FOUND' && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            Nomor invoice tidak ditemukan. Pastikan nomor invoice sudah benar.
          </div>
        )}

        {searchResult && searchResult !== 'NOT_FOUND' && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-700">
                {searchResult.invoice}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  searchResult.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : searchResult.paymentStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {searchResult.paymentStatus === 'PAID'
                  ? 'Lunas & Sukses'
                  : searchResult.paymentStatus === 'PENDING'
                  ? 'Menunggu Pembayaran'
                  : searchResult.paymentStatus}
              </span>
            </div>
            <div className="text-xs text-slate-600 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Produk:</span>
                <span className="font-semibold text-slate-800">{searchResult.productName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tujuan:</span>
                <span className="font-semibold text-slate-800">{searchResult.targetAccount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total:</span>
                <span className="font-bold text-blue-700 font-mono">
                  Rp {searchResult.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Waktu:</span>
                <span>{new Date(searchResult.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {searchResult.paymentStatus === 'PENDING' && (
              <button
                onClick={() => onPayPendingOrder(searchResult)}
                className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Bayar Transaksi Ini Sekarang</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Transaksi Menunggu Pembayaran (Pending Orders Alert) */}
      {pendingOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-amber-50/80 border border-amber-200 p-4 sm:p-5 shadow-xs space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
              <span>Ada {pendingOrders.length} Transaksi Menunggu Pembayaran</span>
            </div>
            <button
              onClick={fetchPending}
              disabled={loadingPending}
              className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPending ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Perbarui</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      {order.invoice}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                      Menunggu QRIS
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{order.productName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Tujuan: {order.targetAccount}
                  </p>
                  <p className="text-xs sm:text-sm font-black text-blue-700 font-mono mt-1">
                    Rp {order.amount.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCancelPending(order)}
                    title="Batalkan transaksi ini"
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={() => onPayPendingOrder(order)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Bayar (QRIS)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 4. Search, Filter & Category Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3.5"
      >
        {/* Row 1: Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="transaction-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pulsa, paket data, sewa bot, token PLN..."
            className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
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

        {/* Row 2: Sort Selector */}
        <div className="relative w-full">
          <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            id="transaction-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-11 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer focus:bg-white focus:border-blue-600 transition-all"
          >
            <option value="popular">Paling Populer</option>
            <option value="best_seller">Paling Terlaris</option>
            <option value="price_low">Harga Terendah</option>
            <option value="price_high">Harga Tertinggi</option>
          </select>
        </div>

        {/* Row 3: Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar select-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
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

        {/* Row 4: Menampilkan X produk + Filter Tags */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{filteredProducts.length}</span> produk
            {selectedCategory !== 'all' && (
              <span>
                {' '}
                kategori <strong className="text-blue-600">{selectedCategory}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Filter:</span>
            {(['ALL', 'Promo', 'Terlaris', 'Populer'] as const).map((badge) => (
              <button
                key={badge}
                onClick={() => setActiveBadgeFilter(badge)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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
      </motion.div>

      {/* 5. Product Cards Grid in Transaksi */}
      {filteredProducts.length > 0 ? (
        isGroupedView ? (
          /* Strictly Grouped View when "Semua Produk" is selected */
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
                    onBuyNow={onSelectProduct}
                    onViewDetail={onViewDetail}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Specific Category / Filtered View (e.g. Pulsa only, or Sewa Bot only) */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white shadow-xs">
                <Smartphone className="w-4 h-4 text-white shrink-0" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white">
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'PRODUK'}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {filteredProducts.length} Produk
              </span>
            </div>

            <HorizontalProductRow
              products={filteredProducts}
              onBuyNow={onSelectProduct}
              onViewDetail={onViewDetail}
            />
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setActiveBadgeFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </motion.div>
      )}

      {/* 6. Panduan Transaksi Aman */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>
          Semua transaksi dienkripsi dan diproses otomatis oleh payment gateway QRIS resmi berstandar Bank Indonesia (ASPI).
        </span>
      </div>
    </div>
  );
};

