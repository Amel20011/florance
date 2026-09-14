import React from 'react';
import { motion } from 'motion/react';
import { Tag, Sparkles, ArrowRight, Flame, Clock } from 'lucide-react';
import { Product } from '../types.js';

interface PromoSectionProps {
  onSelectProduct: (product: Product) => void;
  promoProducts: Product[];
}

export const PromoSection: React.FC<PromoSectionProps> = ({
  onSelectProduct,
  promoProducts,
}) => {
  return (
    <section className="py-14 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-blue-600 p-8 sm:p-10 relative overflow-hidden shadow-lg shadow-blue-600/10"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white">
                <Flame className="w-4 h-4 text-amber-300" />
                <span>PENAWARAN SPESIAL TERBATAS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Promo Produk Digital Terlaris
              </h2>

              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Nikmati penawaran eksklusif Florance: diskon sewa bot WhatsApp cloud, kuota internet jumbo, dan pulsa dengan harga hemat serta proses kilat 24 jam.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-blue-200 font-semibold pt-1">
                <Clock className="w-4 h-4" />
                <span>Promo otomatis terapkan saat checkout</span>
              </div>
            </div>

            {/* Promo Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promoProducts.slice(0, 2).map((prod) => (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectProduct(prod)}
                  className="cursor-pointer group p-5 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Flash Promo
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{prod.categoryLabel}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {prod.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {prod.shortDescription}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Harga Promo:</span>
                      <span className="text-base font-black text-blue-700 font-mono">
                        Rp {prod.basePrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
