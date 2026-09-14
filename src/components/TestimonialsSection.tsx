import React from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Rian Pratama',
      role: 'Owner Olshop Fashion',
      product: 'Sewa Bot WhatsApp Pro',
      comment:
        'Sewa bot WA di Florance beneran bikin orderan auto-balas 24 jam lancar. Server stabil gak pernah mati, bayar QRIS langsung aktif detik itu juga.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dimas Wicaksono',
      role: 'Software Developer',
      product: 'Source Code Bot WhatsApp Baileys',
      comment:
        'Source code sangat bersih, rapi, dan mudah dikembangkan. Dokumentasi instalasi di VPS sangat jelas dan langsung jalan tanpa bug.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Siti Rahmawati',
      role: 'Pelanggan Pulsa & Token PLN',
      product: 'Token Listrik PLN Prabayar',
      comment:
        'Beli token listrik jam 2 dini hari pas meteran bunyi, bayar via QRIS BCA langsung keluar 20 digit nomor stroomnya. Top Up Saldo juga praktis!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Ulasan Pengguna Terverifikasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Apa Kata Mereka Tentang Florance?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ribuan pengguna mempercayakan pembelian produk dan kebutuhan digital mereka setiap hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 flex flex-col justify-between space-y-4 transition-all shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              {/* User meta */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                    <p className="text-[10px] text-slate-500">{rev.role}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
