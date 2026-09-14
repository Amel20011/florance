import React from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  Wifi,
  Bot,
  Cpu,
  Zap,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { ProductCategory } from '../types.js';

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    {
      id: 'pulsa' as ProductCategory,
      name: 'Pulsa Reguler',
      icon: Smartphone,
      badge: 'Semua Operator',
      count: 'Telkomsel, Indosat, XL, Tri',
      desc: 'Isi ulang pulsa reguler otomatis 24 jam.',
    },
    {
      id: 'paket-data' as ProductCategory,
      name: 'Paket Data',
      icon: Wifi,
      badge: 'Kuota Jumbo',
      count: 'Harian, Mingguan, & Bulanan',
      desc: 'Internet booster & kuota data aktif kilat.',
    },
    {
      id: 'sewa-bot' as ProductCategory,
      name: 'Sewa Bot WhatsApp',
      icon: Bot,
      badge: 'Dedicated Cloud',
      count: 'Toko, Admin, & Komunitas',
      desc: 'Otomatisasi pesan WA 24/7 anti-banned.',
    },
    {
      id: 'bot-whatsapp' as ProductCategory,
      name: 'Bot WhatsApp Jadi',
      icon: Cpu,
      badge: 'Full Source Code',
      count: 'TypeScript + Baileys Multi-Device',
      desc: 'Script bot siap pakai di VPS Anda.',
    },
    {
      id: 'token' as ProductCategory,
      name: 'Token & Voucher',
      icon: Zap,
      badge: '20 Digit Instan',
      count: 'Listrik PLN & Voucher Game',
      desc: 'Token PLN Prabayar langsung terbit.',
    },
    {
      id: 'layanan' as ProductCategory,
      name: 'Layanan Digital',
      icon: Layers,
      badge: 'Setup Kilat',
      count: 'VPS, Domain, & API QRIS',
      desc: 'Jasa konfigurasi server & integrasi sistem.',
    },
  ];

  return (
    <section id="kategori-unggulan" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Kategori Terpilih
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Produk Unggulan Florance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Pilih kategori digital yang Anda butuhkan untuk proses pemesanan otomatis instan.
            </p>
          </div>

          {/* Quick Filter Reset */}
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4 self-start md:self-auto cursor-pointer"
            >
              Tampilkan Semua Kategori
            </button>
          )}
        </div>

        {/* 6 Category Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                id={`category-card-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`group cursor-pointer relative rounded-3xl p-6 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {cat.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
                  <p className="text-[11px] text-blue-600 font-semibold pt-1">{cat.count}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
