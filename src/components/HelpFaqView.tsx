import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  QrCode,
  Zap,
  Bot,
  ShieldCheck,
  Headphones,
  RotateCw,
} from 'lucide-react';

interface HelpFaqViewProps {
  onOpenCustomerService: () => void;
}

export const HelpFaqView: React.FC<HelpFaqViewProps> = ({
  onOpenCustomerService,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara melakukan pembayaran dengan QRIS Florance?',
      a: 'Pilih produk digital yang Anda inginkan, masukkan nomor tujuan/akun, lalu lanjutkan ke halaman pembayaran. Di halaman pembayaran, scan kode QRIS menggunakan mobile banking (BCA, Mandiri, BRI, BNI, dll) atau e-wallet (GoPay, OVO, Dana, ShopeePay). Pembayaran akan diverifikasi secara otomatis dalam hitungan detik melalui gateway BuatQRIS.',
      icon: QrCode,
    },
    {
      q: 'Berapa lama proses pulsa dan paket data masuk ke nomor tujuan?',
      a: 'Transaksi kami 100% otomatis melalui gateway server-to-server. Begitu status pembayaran QRIS Anda "PAID", pulsa atau kuota internet akan langsung terkirim dalam waktu 5 hingga 30 detik. Anda juga akan menerima nomor SN (Serial Number) resmi provider.',
      icon: Zap,
    },
    {
      q: 'Bagaimana cara menggunakan Sewa Bot WhatsApp atau Bot Jadi?',
      a: 'Untuk Sewa Bot WhatsApp, bot Anda sudah ter-hosting di Cloud Dedicated Florance. Anda hanya perlu scan QR WhatsApp Web pada dashboard bot Anda. Untuk Bot Jadi, Anda akan menerima paket full source code TypeScript (Baileys) beserta lisensi aktivasi dan panduan deploy VPS 1-klik.',
      icon: Bot,
    },
    {
      q: 'Apakah saya bisa top-up saldo dan membayar tanpa scan ulang?',
      a: 'Tentu saja! Florance menyediakan fitur Deposit Saldo Akun. Anda cukup menekan tombol Deposit di navigasi atas, top up via QRIS, dan saldo akun Florance Anda akan bertambah otomatis. Setelah memiliki saldo, Anda bisa checkout produk apapun secara instan dalam 1 klik!',
      icon: ShieldCheck,
    },
    {
      q: 'Bagaimana jika saldo bank sudah terpotong tapi transaksi pending?',
      a: 'Sistem webhook kami memiliki mekanisme auto-retry jika jaringan bank sedang padat. Anda cukup menekan tombol "Saya Sudah Membayar" pada halaman pembayaran atau menghubungi Customer Service kami yang online 24/7 dengan menyertakan nomor invoice.',
      icon: RotateCw,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Pusat Bantuan & FAQ</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Pertanyaan yang Sering Diajukan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Pelajari cara kerja sistem otomatis, verifikasi QRIS, dan panduan layanan digital Florance.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-3 mb-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          const Icon = faq.icon;
          return (
            <div
              key={i}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50"
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Contact CS Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Masih Butuh Bantuan Lain?</h3>
            <p className="text-xs text-slate-600">Tim Customer Care Florance siap melayani kendala Anda 24 jam.</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCustomerService}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
        >
          Hubungi Layanan Bantuan
        </motion.button>
      </div>
    </motion.div>
  );
};
