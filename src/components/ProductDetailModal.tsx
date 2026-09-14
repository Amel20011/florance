import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Smartphone,
  Wifi,
  Bot,
  Cpu,
  Layers,
  Sparkles,
  Gamepad2,
  Server,
  CreditCard,
  Clock,
  Check,
} from 'lucide-react';
import { Product } from '../types.js';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onOpenBuy?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenBuy,
}) => {
  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-blue-600" />;
      case 'Wifi':
        return <Wifi className="w-6 h-6 text-blue-600" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-blue-600" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-blue-600" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6 text-purple-600" />;
      case 'Server':
        return <Server className="w-6 h-6 text-emerald-600" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6 text-indigo-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-blue-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-blue-600" />;
      default:
        return <Layers className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          id="product-detail-container"
          className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6 text-slate-900"
        >
          {/* Header bar with category badge & close button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                {product.categoryLabel}
              </span>
              {product.badge && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                  {product.badge}
                </span>
              )}
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-xl border ${
                  product.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {product.isAvailable ? 'Tersedia' : 'Habis'}
              </span>
            </div>
            <button
              id="close-product-detail-btn"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Title & Product Info */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                {getIcon(product.iconName)}
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{product.rating}</span>
                  </span>
                  <span>•</span>
                  <span>{product.soldCount.toLocaleString('id-ID')} Terjual</span>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold">Otomatis 24 Jam</span>
                </div>
              </div>
            </div>

            {/* Product Description Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Deskripsi Produk</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p>{product.fullDescription || product.description}</p>
              </div>
            </div>

            {/* Feature Checklist / Keunggulan */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Keunggulan & Fitur Layanan</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Information & Guarantee */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs text-slate-600">
                <p className="font-bold text-slate-900">Garansi Proses Cepat</p>
                <p className="text-[11px] leading-relaxed">
                  Pesanan diproses secara otomatis oleh sistem server 24 jam setelah pembayaran QRIS atau Saldo terkonfirmasi.
                </p>
              </div>
            </div>

            {/* Close Button / Bottom Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

