import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Lightbulb, Sparkles, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface ThemeLampToggleProps {
  variant?: 'card' | 'compact' | 'pill';
}

export const ThemeLampToggle: React.FC<ThemeLampToggleProps> = ({ variant = 'card' }) => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        aria-label={isDark ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
        title={isDark ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}
        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shadow-xs ${
          isDark
            ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700/80'
            : 'bg-white hover:bg-slate-50 text-amber-500 border-slate-200'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-300 fill-amber-300/20" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        )}
      </motion.button>
    );
  }

  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Terang</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Gelap</span>
        </button>
      </div>
    );
  }

  // Full Rich Card Variant for Profile/Akun page
  return (
    <div
      id="florance-theme-lamp-card"
      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-y-4"
    >
      {/* Header with Lamp Icon & Details */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              isDark
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30 shadow-lg shadow-amber-400/10'
                : 'bg-amber-50 text-amber-500 border-amber-200'
            }`}
          >
            <Lightbulb
              className={`w-6 h-6 transition-transform ${
                isDark ? 'fill-amber-300/40 text-amber-300 scale-110' : 'text-amber-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Tombol Lampu
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isDark ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Tema Tampilan Website
            </h3>
          </div>
        </div>

        {/* Interactive Quick Toggle Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Ubah tema website"
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isDark ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <span className="sr-only">Toggle theme</span>
          <span
            className={`pointer-events-none flex items-center justify-center h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isDark ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            )}
          </span>
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Ubah tampilan website secara menyeluruh dari Terang (Light) ke Gelap (Dark Mode) atau sebaliknya dengan nyaman dan seimbang.
      </p>

      {/* 2-Option Selector Grid (Terang vs Gelap) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Light Option Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme('light')}
          className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
            !isDark
              ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-600 fill-amber-500/30" />
            </div>
            {!isDark && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mode Terang</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Bersih, cerah, dan kontras tinggi
            </p>
          </div>
        </motion.button>

        {/* Dark Option Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme('dark')}
          className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
            isDark
              ? 'bg-blue-950/70 border-blue-500 text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-300 fill-indigo-300/30" />
            </div>
            {isDark && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mode Gelap</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Nyaman untuk mata di malam hari
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
