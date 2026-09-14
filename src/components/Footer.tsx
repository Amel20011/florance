import React from 'react';
import { ShieldCheck, Heart, Sparkles, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenCustomerService: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCustomerService,
}) => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('beranda')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/30">
                F
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                FLORANCE
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed text-xs">
              "Semua Kebutuhan Digital, Dalam Satu Tempat." Menyediakan pulsa, paket data, sewa bot WhatsApp, bot jadi, token PLN, dan layanan digital dengan gateway QRIS BuatQRIS otomatis 24 jam.
            </p>

            <div className="flex items-center gap-4 pt-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>BuatQRIS Verified Merchant</span>
              </span>
            </div>
          </div>

          {/* Column 2: Produk Unggulan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Produk Digital
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('pulsa')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Pulsa All Operator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('paket-data')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Paket Data & Kuota
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sewa-bot')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Sewa Bot WhatsApp
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bot-whatsapp')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Bot WhatsApp Jadi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('token')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Token PLN & Game
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Bantuan & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Bantuan
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenCustomerService}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Customer Service (Live Chat)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bantuan')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Cara Pembayaran QRIS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('orders')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Cek Status Pesanan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bantuan')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  FAQ & Pertanyaan Umum
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legalitas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Legal & Ketentuan
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('bantuan')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bantuan')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Syarat & Ketentuan Layanan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bantuan')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Kebijakan Pengembalian Dana
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bantuan')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Keamanan Sistem (Security)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-500 text-[11px]">
          <p>© 2026 FLORANCE. Semua Hak Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span>Sistem Otomatis 24 Jam</span>
            <span>•</span>
            <span>BuatQRIS Gateway Real-Time</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
