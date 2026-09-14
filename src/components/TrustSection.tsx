import React from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  ShieldCheck,
  Zap,
  Headphones,
  CheckCircle2,
  Server,
  Sparkles,
} from 'lucide-react';

export const TrustSection: React.FC = () => {
  const points = [
    {
      icon: QrCode,
      title: 'Pembayaran QRIS BuatQRIS Otomatis',
      desc: 'Mendukung semua bank nasional (BCA, Mandiri, BRI, BNI) dan e-wallet (GoPay, OVO, Dana, ShopeePay) dengan verifikasi instan.',
    },
    {
      icon: ShieldCheck,
      title: 'Transaksi Aman & Terenkripsi',
      desc: 'Sistem proteksi server-side dengan verifikasi tanda tangan digital untuk menjamin keaslian dan keamanan pesanan.',
    },
    {
      icon: Zap,
      title: 'Proses Kilat 5-30 Detik',
      desc: 'Pengisian pulsa, kuota data, token PLN, voucher game, dan bot diproses otomatis oleh gateway tanpa jeda manual.',
    },
    {
      icon: Headphones,
      title: 'Customer Service 24/7',
      desc: 'Tim bantuan responsif yang selalu siap mendampingi kendala transaksi Anda setiap saat melalui live chat verified.',
    },
    {
      icon: Server,
      title: 'Produk Digital Lengkap',
      desc: 'Mulai dari all-operator seluler, server sewa bot WhatsApp cloud, hingga script bot siap pakai dengan update berkala.',
    },
    {
      icon: CheckCircle2,
      title: 'Garansi Transaksi Sukses',
      desc: 'Jaminan transaksi berhasil atau dana dikembalikan secara transparan jika terjadi kendala pada jaringan provider.',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Kualitas & Keandalan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Kenapa Memilih Florance?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Solusi toko digital terpercaya dengan standar kenyamanan tinggi dan kecepatan proses transaksi otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{pt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pt.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
