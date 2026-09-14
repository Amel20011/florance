import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  XCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePaymentStatus } from '../hooks/usePaymentStatus.js';

interface PaymentQrisViewProps {
  paymentData: {
    transaction_id: string;
    invoice: string;
    amount: number;
    adminFee?: number;
    totalAmount: number;
    qrUrl: string;
    qrDataUrl?: string;
    expiredAt: string;
    productName: string;
    variantName: string;
    targetAccount?: string;
    status: string;
    paidWithBalance?: boolean;
  };
  onPaymentSuccess: (order: any) => void;
  onCancelPayment: () => void;
}

export const PaymentQrisView: React.FC<PaymentQrisViewProps> = ({
  paymentData,
  onPaymentSuccess,
  onCancelPayment,
}) => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  // Hook for secure server-side periodic polling to BuatQRIS API
  const {
    status: paymentStatus,
    isSuccess,
    isExpired,
    isFailed,
    isChecking,
    checkNow,
    cancelPayment,
  } = usePaymentStatus(paymentData.transaction_id, {
    intervalMs: 3000,
    enabled: !paymentData.paidWithBalance,
    onSuccess: (data) => {
      onPaymentSuccess({ ...paymentData, ...data, paymentStatus: 'PAID' });
    },
  });

  const handleCancelPayment = async () => {
    if (isSuccess) return;
    const confirmCancel = window.confirm('Apakah Anda yakin ingin membatalkan transaksi pembayaran ini?');
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      await cancelPayment('Dibatalkan oleh pembeli di halaman QRIS.');
    } finally {
      setIsCancelling(false);
      onCancelPayment();
    }
  };

  // If already paid with balance, instantly notify success
  useEffect(() => {
    if (paymentData.paidWithBalance || paymentData.status === 'paid' || paymentData.status === 'success') {
      onPaymentSuccess({ ...paymentData, paymentStatus: 'PAID' });
    }
  }, [paymentData, onPaymentSuccess]);

  // Countdown timer
  useEffect(() => {
    if (isSuccess) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess]);

  // Format countdown minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, type: 'invoice' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'invoice') {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 20 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      <div
        id="qris-payment-card"
        className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden text-slate-900"
      >
        {/* Top Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-200 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>FLORANCE DIGITAL STORE</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isSuccess
              ? 'Pembayaran Berhasil Dikonfirmasi!'
              : isExpired
              ? 'Pembayaran Kedaluwarsa'
              : isFailed
              ? 'Pembayaran Gagal'
              : 'Menunggu Pembayaran QRIS'}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {paymentData.productName} • {paymentData.variantName}
          </p>

          {/* Status Pill with countdown */}
          <div className="mt-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold shadow-xs">
            {!isSuccess && !isExpired && !isFailed && (
              <>
                <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Polling Otomatis Gateway Aktif</span>
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-slate-700 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatTime(timeLeftSeconds)}</span>
                </span>
              </>
            )}
            {isSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transaksi Sukses & Terverifikasi</span>
              </span>
            )}
            {isExpired && (
              <span className="flex items-center gap-1.5 text-red-600 font-bold">
                <XCircle className="w-4 h-4" />
                <span>Waktu Pembayaran Habis</span>
              </span>
            )}
            {isFailed && (
              <span className="flex items-center gap-1.5 text-red-600 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Pembayaran Dibatalkan / Gagal</span>
              </span>
            )}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-6">
          {/* Big QR Code Card */}
          <div className="p-4 rounded-3xl bg-white border-2 border-blue-100 shadow-md flex flex-col items-center justify-center relative max-w-[280px] sm:max-w-[320px] w-full">
            {paymentData.qrDataUrl ? (
              <img
                src={paymentData.qrDataUrl}
                alt="QRIS BuatQris Code"
                className="w-full aspect-square object-contain rounded-xl"
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-800 bg-slate-50 rounded-xl p-4 text-center">
                <QrCode className="w-16 h-16 text-blue-600 mb-2" />
                <p className="text-xs font-mono break-all text-slate-500">{paymentData.qrUrl}</p>
              </div>
            )}

            {/* QRIS & GPN Branding footer */}
            <div className="mt-2 pt-2 border-t border-slate-100 w-full flex items-center justify-between px-2 text-[10px] font-black text-slate-700 tracking-wider">
              <span>QRIS</span>
              <span className="text-blue-600">GPN</span>
              <span>BUATQRIS</span>
            </div>
          </div>

          {/* Amount & Invoice Breakdown */}
          <div className="w-full space-y-3">
            {/* Total Amount Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Total Tagihan
                </span>
                <span className="text-2xl font-black text-blue-700 font-mono tracking-tight">
                  Rp {paymentData.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(paymentData.totalAmount.toString(), 'amount')
                }
                className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
              >
                {copiedAmount ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Invoice Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Nomor Invoice</span>
                <span className="font-mono font-bold text-slate-800">
                  {paymentData.invoice}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(paymentData.invoice, 'invoice')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedInvoice ? (
                  <span className="text-emerald-600">Tersalin</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QRIS Instructions */}
          <div className="w-full text-center space-y-1 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-semibold text-slate-800">
              Buka BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, Dana, ShopeePay, lalu scan QR di atas.
            </p>
            <p className="text-[11px] text-slate-500">
              Gateway BuatQRIS dipantau secara otomatis (real-time polling) oleh sistem Florance setiap beberapa detik tanpa perlu unggah struk manual.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="btn-already-paid"
              onClick={() => checkNow(true)}
              disabled={isChecking || isCancelling}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Menghubungi Server BuatQRIS...' : 'Cek Status Sekarang'}</span>
            </motion.button>

            {!isSuccess && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                id="btn-cancel-payment"
                type="button"
                onClick={handleCancelPayment}
                disabled={isCancelling || isChecking}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className={`w-4 h-4 ${isCancelling ? 'animate-spin' : 'text-rose-500'}`} />
                <span>{isCancelling ? 'Membatalkan Transaksi...' : 'Batalkan Pembayaran'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
