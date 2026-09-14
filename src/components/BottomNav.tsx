import React from 'react';
import { Home, ArrowLeftRight, Clock, User } from 'lucide-react';
import { motion } from 'motion/react';

export interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingCount = 0,
}) => {
  const navItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
    },
    {
      id: 'transaksi',
      label: 'Transaksi',
      icon: ArrowLeftRight,
    },
    {
      id: 'riwayat',
      label: 'Riwayat',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'akun',
      label: 'Akun',
      icon: User,
    },
  ];

  // Helper to check active state including mapped aliases
  const isCurrentActive = (id: string) => {
    if (id === 'beranda') return activeTab === 'beranda';
    if (id === 'transaksi') return activeTab === 'transaksi';
    if (id === 'riwayat') return activeTab === 'riwayat' || activeTab === 'orders';
    if (id === 'akun') return activeTab === 'akun' || activeTab === 'profile';
    return activeTab === id;
  };

  return (
    <nav
      id="florance-bottom-navigation"
      aria-label="Navigasi Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-transparent px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1">
        {navItems.map((item) => {
          const isActive = isCurrentActive(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer select-none group ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 bg-blue-50/80 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.75px]'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 transition-all ${
                  isActive ? 'font-black tracking-tight' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
