import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Headphones,
  X,
  Send,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface CustomerServiceChatProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

interface CSMessage {
  id: string;
  sender: 'cs' | 'user';
  text: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

const ADMIN_WA_NUMBER = '6285182359268';
const ADMIN_WA_LINK = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent('Halo Admin Florance, saya butuh bantuan terkait transaksi saya.')}`;

export const CustomerServiceChat: React.FC<CustomerServiceChatProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<CSMessage[]>([
    {
      id: 'cs-welcome',
      sender: 'cs',
      text: 'Halo! 👋 Selamat datang di Florance Care 24 Jam. Ada yang bisa kami bantu seputar transaksi, pulsa, sewa bot WhatsApp, top up saldo, atau status pembayaran Anda?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      actionUrl: ADMIN_WA_LINK,
      actionLabel: 'Hubungi Admin via WhatsApp',
    },
  ]);
  const [isReplying, setIsReplying] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickInquiries = [
    'Cek Status QRIS',
    'Bantuan Sewa Bot',
    'Hubungi Admin WhatsApp',
    'Deposit Saldo',
  ];

  const handleSend = async (text: string) => {
    const q = text.trim();
    if (!q) return;

    const userMsg: CSMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsReplying(true);

    // Extract invoice pattern like FLR-2026...
    const invoiceMatch = q.match(/FLR-[\w-]+/i);
    let replyText = '';
    let actionUrl: string | undefined;
    let actionLabel: string | undefined;

    if (invoiceMatch) {
      const invoiceCode = invoiceMatch[0].toUpperCase();
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(invoiceCode)}`);
        const data = await res.json();
        if (data.success && data.order) {
          const ord = data.order;
          const statusText =
            ord.paymentStatus === 'PAID'
              ? '✅ LUNAS (PAID) - Produk / Layanan telah aktif'
              : ord.paymentStatus === 'PENDING'
              ? '⏳ MENUNGGU PEMBAYARAN (PENDING)'
              : '❌ GAGAL / KEDALUWARSA';

          replyText = `Status Invoice ${invoiceCode}:\n• Produk: ${ord.productName} (${ord.variantName})\n• Total: Rp ${ord.totalAmount.toLocaleString('id-ID')}\n• Status: ${statusText}\n• Tujuan: ${ord.targetAccount}`;
        } else {
          replyText = `Nomor invoice ${invoiceCode} sedang dalam antrean atau belum terdaftar. Anda juga dapat langsung menghubungkan invoice ini ke WhatsApp Admin kami:`;
          actionUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(`Halo Admin Florance, mohon cek invoice ${invoiceCode}`)}`;
          actionLabel = 'Hubungi Admin di WhatsApp (6285182359268)';
        }
      } catch {
        replyText = `Tidak dapat memuat invoice ${invoiceCode} saat ini. Silakan hubungi Admin WhatsApp langsung untuk verifikasi instan.`;
        actionUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(`Halo Admin Florance, tolong verifikasi transaksi invoice: ${invoiceCode}`)}`;
        actionLabel = 'Chat Admin WhatsApp (6285182359268)';
      }
    } else if (q.includes('Admin') || q.includes('WhatsApp') || q.includes('WA') || q.includes('6285182359268')) {
      replyText = `Untuk berbicara langsung dengan Admin Tim Operasional Florance 24 Jam, silakan klik tombol WhatsApp resmi di bawah ini (+62 851-8235-9268):`;
      actionUrl = ADMIN_WA_LINK;
      actionLabel = 'Klik Chat Admin (6285182359268)';
    } else if (q.includes('QRIS') || q.includes('Status') || q.includes('Deposit')) {
      replyText =
        'Jika pembayaran QRIS Anda sudah terdebet di mobile banking / e-wallet, gateway kami memvalidasi dalam 5-30 detik. Silakan masukkan nomor invoice transaksi (contoh: FLR-...) atau hubungi admin di WhatsApp.';
      actionUrl = ADMIN_WA_LINK;
      actionLabel = 'Hubungi Admin WhatsApp';
    } else if (q.includes('Bot')) {
      replyText =
        'Untuk sewa bot WhatsApp maupun bot jadi, server dan lisensi berjalan otomatis setelah status PAID. Butuh panduan pairing nomor WhatsApp? Admin siap memandu via WhatsApp:';
      actionUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent('Halo Admin, saya butuh panduan sewa bot WhatsApp Florance.')}`;
      actionLabel = 'Panduan Bot via WhatsApp';
    } else {
      replyText =
        'Pesan Anda diterima. Anda dapat memasukkan nomor invoice Anda (FLR-...) untuk pengecekan instan atau langsung menghubungi Admin kami via WhatsApp.';
      actionUrl = ADMIN_WA_LINK;
      actionLabel = 'Chat Admin WhatsApp (+62 851-8235-9268)';
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `cs-${Date.now()}`,
          sender: 'cs',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          actionUrl,
          actionLabel,
        },
      ]);
      setIsReplying(false);
    }, 600);
  };

  return (
    <>
      {/* Floating CS Button (Bottom Left) */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40"
        >
          <button
            id="open-cs-chat-button"
            onClick={onOpen}
            className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <Headphones className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse" />
            </div>
            <span className="hidden sm:inline">Florance Care (24/7)</span>
            <span className="sm:hidden font-medium">Bantuan CS</span>
          </button>
        </motion.div>
      )}

      {/* Floating Chat Modal Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-50 w-[92vw] sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px] text-slate-900 dark:text-white"
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <span>Florance Customer Care</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-blue-100">Aktif 24 Jam • WhatsApp 6285182359268</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/70 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    {m.actionUrl && (
                      <a
                        href={m.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{m.actionLabel || 'Hubungi WhatsApp'}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isReplying && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 p-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[10px]">CS sedang mencari data...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick chips */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickInquiries.map((inq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(inq)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-700 border border-slate-200 dark:border-slate-700 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {inq}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Tulis pesan atau invoice (FLR-...)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 text-xs text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

