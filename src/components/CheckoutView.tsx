import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductVariant, UserProfile } from '../types.js';

interface CheckoutViewProps {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  targetAccount: string;
  currentUser: UserProfile | null;
  onBack: () => void;
  onPaymentCreated: (paymentData: any) => void;
  onOpenDeposit?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  product,
  variant,
  quantity,
  targetAccount,
  currentUser,
  onBack,
  onPaymentCreated,
  onOpenDeposit,
}) => {
  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'SALDO'>('QRIS');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = variant.price * quantity;
  const adminFee = 0; // QRIS promo fee
  const total = subtotal + adminFee;
  const userBalance = currentUser?.balance || 0;
  const hasEnoughBalance = userBalance >= total;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap Anda.');
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      setErrorMessage('Harap masukkan alamat email yang valid.');
      return;
    }
    if (!targetAccount.trim()) {
      setErrorMessage(`Harap lengkapi ${product.targetFieldLabel}.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (paymentMethod === 'SALDO') {
        if (!currentUser) {
          throw new Error('Harap login terlebih dahulu untuk menggunakan saldo akun.');
        }
        if (!hasEnoughBalance) {
          throw new Error('Saldo akun tidak mencukupi untuk melakukan pembayaran ini.');
        }

        const res = await fetch('/api/payment/pay-with-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            variantId: variant.id,
            quantity,
            targetAccount,
            userId: currentUser.id,
            userName: buyerName.trim(),
            userEmail: buyerEmail.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal memproses pembayaran dengan saldo.');
        }

        // Format into standard payment created object to show completed status
        onPaymentCreated({
          success: true,
          transaction_id: data.order.gatewayTransactionId,
          order_id: data.order.id,
          invoice: data.order.invoice,
          amount: data.order.amount,
          adminFee: 0,
          totalAmount: data.order.totalAmount,
          qrUrl: '',
          qrDataUrl: '',
          expiredAt: data.order.expiredAt,
          productName: data.order.productName,
          variantName: data.order.variantName,
          targetAccount: data.order.targetAccount,
          status: 'paid',
          paidWithBalance: true,
        });
      } else {
        // QRIS via BuatQRIS API
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            variantId: variant.id,
            quantity,
            targetAccount,
            buyerName: buyerName.trim(),
            buyerEmail: buyerEmail.trim(),
            buyerPhone: buyerPhone.trim(),
            userId: currentUser?.id || 'guest',
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal memproses pembayaran QRIS. Silakan coba lagi.');
        }

        onPaymentCreated(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan koneksi ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog Produk</span>
      </motion.button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Checkout Pesanan Digital
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Selesaikan detail pembayaran dengan sistem QRIS BuatQRIS instan dan otomatis.
        </p>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Buyer & Order Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Details Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Detail Produk & Tujuan</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">
                    {product.categoryLabel}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{product.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{variant.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-mono">
                    {quantity}x @ Rp {variant.price.toLocaleString('id-ID')}
                  </span>
                  <p className="text-sm font-black text-blue-700 mt-0.5">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Target Account Badge */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{product.targetFieldLabel}:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {targetAccount}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Information Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Informasi Pembeli
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-semibold text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Bukti Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Method & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Method Selector */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Metode Pembayaran
            </h3>

            <div className="space-y-3">
              {/* Option 1: QRIS Instant via BuatQRIS */}
              <div
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'QRIS'
                    ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      QR
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">QRIS BuatQRIS Real-Time</h4>
                      <p className="text-[11px] text-slate-500">BCA, Mandiri, BRI, GoPay, OVO, DANA</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'QRIS'}
                    onChange={() => setPaymentMethod('QRIS')}
                    className="accent-blue-600 w-4 h-4"
                  />
                </div>
              </div>

              {/* Option 2: Saldo Akun Florance */}
              <div
                onClick={() => setPaymentMethod('SALDO')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'SALDO'
                    ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Saldo Akun Florance</h4>
                      <p className="text-[11px] text-slate-500">
                        Saldo Anda: <strong className="text-slate-900">Rp {userBalance.toLocaleString('id-ID')}</strong>
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'SALDO'}
                    onChange={() => setPaymentMethod('SALDO')}
                    className="accent-blue-600 w-4 h-4"
                  />
                </div>

                {paymentMethod === 'SALDO' && !hasEnoughBalance && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                    <span>Saldo tidak cukup (Kurang Rp {(total - userBalance).toLocaleString('id-ID')})</span>
                    {onOpenDeposit && (
                      <button
                        type="button"
                        onClick={onOpenDeposit}
                        className="px-2 py-1 rounded bg-amber-600 text-white font-bold text-[10px]"
                      >
                        + Deposit
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ringkasan Pembayaran
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({quantity}x item)</span>
                <span className="font-mono font-semibold text-slate-900">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan & Gateway</span>
                <span className="font-semibold text-emerald-600">Gratis (Rp 0)</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
                <span className="text-xl font-black text-blue-700 font-mono">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || (paymentMethod === 'SALDO' && !hasEnoughBalance)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Menghubungi Server...</span>
              ) : paymentMethod === 'SALDO' ? (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Bayar Langsung dengan Saldo</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Bayar Sekarang dengan QRIS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Dienkripsi & Terproteksi BuatQRIS API</span>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
