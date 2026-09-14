import React from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Wifi,
  Bot,
  Cpu,
  Zap,
  Layers,
  Gamepad2,
  Server,
  CreditCard,
  ShieldCheck,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types.js';

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuyNow,
  onViewDetail,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'Wifi':
        return <Wifi className="w-4 h-4 text-blue-600" />;
      case 'Bot':
        return <Bot className="w-4 h-4 text-blue-600" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-blue-600" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-4 h-4 text-purple-600" />;
      case 'Server':
        return <Server className="w-4 h-4 text-emerald-600" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      default:
        return <Layers className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeStyle = (badge?: string | null) => {
    switch (badge) {
      case 'Promo':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Terlaris':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Populer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const minPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col justify-between w-full h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 p-3.5 sm:p-4 text-left transform-gpu hover:-translate-y-1 will-change-transform select-none"
    >
      {/* Top Header: Icon & Status Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {getIcon(product.iconName)}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {product.badge && (
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-0.5 ${getBadgeStyle(
                  product.badge
                )}`}
              >
                {product.badge === 'Terlaris' && <Flame className="w-2.5 h-2.5 text-amber-500" />}
                {product.badge}
              </span>
            )}
            <span
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                product.isAvailable
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}
            >
              {product.isAvailable ? 'Tersedia' : 'Habis'}
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Product Short Description */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
          {product.shortDescription}
        </p>
      </div>

      {/* Price & Actions Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">
              Mulai dari
            </span>
            <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-400 font-mono">
              Rp {minPrice.toLocaleString('id-ID')}
            </span>
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-lg">
            {product.variants.length} Varian
          </span>
        </div>

        {/* Compact Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(product);
            }}
            className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all text-center cursor-pointer"
          >
            Detail
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            className="w-full py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Beli</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

