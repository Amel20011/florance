import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, ArrowRight, ShieldCheck, QrCode, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types.js';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onDepositCreated: (paymentData: any) => void;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 200000, 500000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDepositCreated,
}) => {
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    setError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmount(raw);
    const num = parseInt(raw, 10) || 0;
    setAmount(num);
    setError(null);
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 5000) {
      setError('Nominal deposit minimal adalah Rp 5.000');
      return;
    }
    if (amount > 10000000) {
      setError('Nominal deposit maksimal adalah Rp 10.000.000');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/deposit/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat QRIS deposit');
      }

      onDepositCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Deposit Saldo Akun</h3>
              <p className="text-xs text-slate-500">
                Top up saldo Florance menggunakan sistem QRIS Otomatis BuatQRIS.
              </p>
            </div>
          </div>

          {/* Current Balance Bar */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between mb-6">
            <div>
              <span className="text-xs text-blue-800 font-medium block">Saldo Saat Ini</span>
              <span className="text-lg font-extrabold text-blue-900">
                Rp {(currentUser.balance || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
                Akun Terverifikasi
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateDeposit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Pilih Nominal Cepat
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_AMOUNTS.map((val) => {
                  const isSelected = amount === val;
                  return (
                    <motion.button
                      type="button"
                      key={val}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectPreset(val)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      Rp {val.toLocaleString('id-ID')}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Atau Masukkan Nominal Sendiri (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="50000"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimal deposit Rp 5.000 • Tanpa biaya admin
              </span>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Menghubungi Gateway BuatQRIS...</span>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Lanjutkan Pembayaran QRIS (Rp {amount.toLocaleString('id-ID')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verifikasi otomatis 24 Jam via API BuatQRIS</span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
