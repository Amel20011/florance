import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types.js';

interface LoginGateProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  // Step: 'phone' | 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Input states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneSentTo, setPhoneSentTo] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Timers
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [expiryCountdown, setExpiryCountdown] = useState<number>(300);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // OTP Expiry countdown timer
  useEffect(() => {
    if (step !== 'otp' || expiryCountdown <= 0) return;
    const timer = setInterval(() => {
      setExpiryCountdown((prev) => {
        if (prev <= 1) {
          setErrorMessage('Kode OTP telah kedaluwarsa. Silakan klik Kirim Ulang Kode.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, expiryCountdown]);

  // Focus OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP to WhatsApp
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanPhone = phone.trim();
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

    if (!cleanPhone) {
      setErrorMessage('Harap masukkan nomor WhatsApp Anda.');
      return;
    }

    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Format nomor WhatsApp tidak valid (contoh: 08123456789).');
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
        setErrorMessage(data.message || data.error || 'Gagal mengirim kode OTP WhatsApp. Silakan coba kembali.');
        setIsLoading(false);
        return;
      }

      setPhoneSentTo(cleanPhone);
      setStep('otp');
      setOtp('');
      setResendCooldown(60);
      setExpiryCountdown(300);
      setSuccessMessage('Kode verifikasi 6 digit telah dikirim ke nomor WhatsApp Anda via FlowKirim.');
    } catch (err) {
      console.error('Send OTP Error:', err);
      setErrorMessage('Terjadi kendala koneksi ke server saat mengirim OTP WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMessage('Harap masukkan 6 digit kode OTP dengan lengkap.');
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
        setErrorMessage(data.message || data.error || 'Kode OTP tidak valid atau telah kedaluwarsa.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Verifikasi WhatsApp berhasil! Mengalihkan ke dashboard...');

      // Save token if available
      if (data.token) {
        localStorage.setItem('florance_jwt', data.token);
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 600);
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setErrorMessage('Gagal memverifikasi kode OTP ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch back to phone editing
  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-emerald-600/10 selection:text-emerald-700 relative overflow-hidden transition-colors">
      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              FLORANCE
            </h1>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Digital Store & Services
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Autentikasi WhatsApp OTP FlowKirim</span>
        </div>
      </motion.header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 transition-colors"
        >
          {/* Header Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-xs">
              {step === 'phone' ? (
                <Phone className="w-7 h-7" />
              ) : (
                <KeyRound className="w-7 h-7" />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 'phone' ? 'Masuk dengan WhatsApp OTP' : 'Masukkan Kode OTP'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {step === 'phone'
                ? 'Masukkan nomor WhatsApp aktif Anda untuk menerima kode masuk'
                : 'Kode verifikasi 6 digit telah dikirim ke WhatsApp Anda'}
            </p>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 mb-5 flex items-start gap-2.5 text-left"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 mb-5 flex items-center gap-2.5 text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="flex-1">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: PHONE INPUT */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="phone-input"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Nomor WhatsApp (Contoh: 08123456789)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                id="btn-send-otp"
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
              </motion.button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Kode OTP 6 digit aman dikirim via WhatsApp menggunakan API FlowKirim. Tanpa kata sandi yang rumit.
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: OTP INPUT & VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Target Phone Card */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Nomor WhatsApp Tujuan</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">
                      {phoneSentTo}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-edit-phone"
                  onClick={handleBackToPhone}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Ubah</span>
                </button>
              </div>

              {/* 6 Digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="otp-input"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Kode OTP (6 Digit)
                  </label>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>Berlaku: {formatTime(expiryCountdown)}</span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    ref={otpInputRef}
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      if (val.length === 6) {
                        setErrorMessage(null);
                      }
                    }}
                    placeholder="123456"
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-mono text-2xl font-bold tracking-[0.4em] sm:tracking-[0.6em] text-emerald-600 dark:text-emerald-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Verification Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                id="btn-verify-otp"
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
              </motion.button>

              {/* Resend OTP Section */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Belum menerima pesan WhatsApp?</span>
                <button
                  type="button"
                  id="btn-resend-otp"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 disabled:no-underline flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {resendCooldown > 0
                      ? `Kirim Ulang (${resendCooldown}s)`
                      : 'Kirim Ulang Kode'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Security Assurance Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sesi Server-Side & Cookie HTTP-Only Aman</span>
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© 2026 FLORANCE Digital Services. Autentikasi WhatsApp OTP & Transaksi Realtime.</p>
      </footer>
    </div>
  );
};
