import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Package,
  Home,
  ShieldCheck,
  Zap,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Order } from '../types.js';

interface PaymentSuccessViewProps {
  order: Order;
  onGoHome: () => void;
  onViewOrders: () => void;
}

export const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({
  order,
  onGoHome,
  onViewOrders,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  const copyText = (text: string, type: 'key' | 'invoice') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    }
  };

  const isDeposit = order.productId === 'deposit';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-10"
    >
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden text-slate-900">
        {/* Success Header Banner */}
        <div className="bg-blue-50/60 p-8 text-center border-b border-slate-200 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30"
          >
            {isDeposit ? <Wallet className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-xs font-bold text-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDeposit ? 'DEPOSIT BERHASIL DIKREDITKAN' : 'PEMBAYARAN TERVERIFIKASI'}</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isDeposit ? 'Top Up Saldo Sukses!' : 'Pembayaran Berhasil!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Terima kasih telah bertransaksi di FLORANCE Digital Store.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 shadow-xs">
            <span>Invoice: {order.invoice}</span>
            <button
              onClick={() => copyText(order.invoice, 'invoice')}
              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
            >
              {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Fulfillment Deliverable Box */}
        <div className="p-6 sm:p-8 space-y-6">
          {order.fulfillmentData && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hasil Pengiriman & Aktivasi
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Instant Fulfilled
                </span>
              </div>

              {/* License or Stroom Token */}
              {order.fulfillmentData.licenseKey && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Token / License Key:
                    </span>
                    <p className="text-base font-extrabold text-blue-700 font-mono tracking-wider truncate">
                      {order.fulfillmentData.licenseKey}
                    </p>
                  </div>
                  <button
                    onClick={() => copyText(order.fulfillmentData!.licenseKey!, 'key')}
                    className="py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Serial Number */}
              {order.fulfillmentData.snNumber && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Nomor Seri (SN) / Referensi:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {order.fulfillmentData.snNumber}
                  </span>
                </div>
              )}

              {/* Instructions */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 mb-1">Panduan Penggunaan:</p>
                <p>{order.fulfillmentData.instructions}</p>
              </div>
            </div>
          )}

          {/* Transaction Summary Card */}
          <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Ringkasan Transaksi
            </h4>
            <div className="flex justify-between text-slate-600">
              <span>Produk</span>
              <span className="font-semibold text-slate-900">{order.productName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Varian / Paket</span>
              <span className="font-semibold text-slate-900">{order.variantName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Akun / Nomor Tujuan</span>
              <span className="font-mono font-bold text-slate-900">{order.targetAccount}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Metode Pembayaran</span>
              <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Dibayar</span>
              <span className="text-blue-700 font-mono font-black">
                Rp {order.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewOrders}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Lihat Riwayat Pesanan</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Belanja Produk Lain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Bukti pembayaran resmi telah dicatat ke database Florance</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
