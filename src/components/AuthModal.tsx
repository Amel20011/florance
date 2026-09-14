import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, KeyRound, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Clock, Edit3, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneSentTo, setPhoneSentTo] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(300); // 5 minutes

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setOtp('');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== 'otp' || expiryCountdown <= 0) return;
    const timer = setInterval(() => {
      setExpiryCountdown((prev) => {
        if (prev <= 1) {
          setErrorMessage('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, expiryCountdown]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanPhone = phone.trim();
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMessage('Harap masukkan nomor WhatsApp yang valid (contoh: 08123456789).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || data.error || 'Gagal mengirim kode OTP WhatsApp.');
        setIsLoading(false);
        return;
      }

      setPhoneSentTo(cleanPhone);
      setStep('otp');
      setOtp('');
      setResendCooldown(60);
      setExpiryCountdown(300);
      setSuccessMessage('Kode OTP 6 digit telah dikirim ke nomor WhatsApp Anda via FlowKirim.');
    } catch (err) {
      console.error('Send OTP Error:', err);
      setErrorMessage('Terjadi kendala koneksi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMessage('Kode OTP harus 6 digit angka.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneSentTo,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || data.error || 'Verifikasi gagal atau kode kedaluwarsa.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Verifikasi berhasil! Mengalihkan...');
      if (data.token) {
        localStorage.setItem('florance_jwt', data.token);
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setErrorMessage('Gagal memverifikasi OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
            {step === 'phone' ? <Phone className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {step === 'phone' ? 'Masuk dengan WhatsApp OTP' : 'Verifikasi Kode OTP WhatsApp'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 'phone'
              ? 'Masukkan nomor WhatsApp aktif Anda untuk menerima 6 digit kode masuk'
              : `Kode telah dikirim ke nomor ${phoneSentTo}`}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: PHONE */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Nomor WhatsApp (Contoh: 08123456789)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Kirim Kode OTP WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {phoneSentTo}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setErrorMessage(null);
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ubah</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kode OTP (6 Digit)
                </label>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(expiryCountdown)}
                </span>
              </div>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-mono text-2xl font-bold tracking-[0.4em] text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6 || expiryCountdown <= 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verifikasi & Masuk</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Belum terima pesan?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={() => handleSendOtp()}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>
                  {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang'}
                </span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
