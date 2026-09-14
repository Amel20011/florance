import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  RefreshCw,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter.js';

interface DailyPoint {
  date: string;
  total: number;
  berhasil: number;
  gagal: number;
  omset?: number;
}

interface HourlyPoint {
  time: string;
  total: number;
  berhasil: number;
  gagal: number;
}

interface AnalyticsResponse {
  success: boolean;
  monthLabel: string;
  totalPembelian: number;
  totalBerhasil: number;
  totalGagal: number;
  successRate: number;
  failRate: number;
  totalOmset: number;
  serverTime: string;
  dailyData: DailyPoint[];
  hourlyDataToday: HourlyPoint[];
}

export const RealtimeTransactionChart: React.FC = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'today'>('month');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hiddenSeries, setHiddenSeries] = useState<{ [key: string]: boolean }>({});

  const fetchAnalytics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/analytics/monthly');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn('Gagal memuat analitik transaksi:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, []);

  // Initial fetch and auto-refresh every 12 seconds for live real-time feel
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Fallback data if offline or loading initially
  const defaultDaily: DailyPoint[] = [
    { date: '01 Sep', total: 142, berhasil: 138, gagal: 4, omset: 4250000 },
    { date: '02 Sep', total: 168, berhasil: 162, gagal: 6, omset: 5120000 },
    { date: '03 Sep', total: 155, berhasil: 149, gagal: 6, omset: 4890000 },
    { date: '04 Sep', total: 189, berhasil: 182, gagal: 7, omset: 5780000 },
    { date: '05 Sep', total: 210, berhasil: 204, gagal: 6, omset: 6420000 },
    { date: '06 Sep', total: 195, berhasil: 188, gagal: 7, omset: 6010000 },
    { date: '07 Sep', total: 224, berhasil: 216, gagal: 8, omset: 6890000 },
    { date: '08 Sep', total: 180, berhasil: 174, gagal: 6, omset: 5430000 },
    { date: '09 Sep', total: 205, berhasil: 197, gagal: 8, omset: 6240000 },
    { date: '10 Sep', total: 235, berhasil: 227, gagal: 8, omset: 7150000 },
    { date: '11 Sep', total: 215, berhasil: 207, gagal: 8, omset: 6540000 },
    { date: '12 Sep', total: 248, berhasil: 240, gagal: 8, omset: 7620000 },
    { date: '13 Sep', total: 260, berhasil: 251, gagal: 9, omset: 7980000 },
    { date: '14 Sep (Hari Ini)', total: 194, berhasil: 187, gagal: 7, omset: 5930000 },
  ];

  const chartRaw = data?.dailyData || defaultDaily;
  let activeChartData: Array<{ label: string; total: number; berhasil: number; gagal: number }> = [];

  if (viewMode === 'month') {
    activeChartData = chartRaw.map((d) => ({
      label: d.date,
      total: d.total,
      berhasil: d.berhasil,
      gagal: d.gagal,
    }));
  } else if (viewMode === 'week') {
    activeChartData = chartRaw.slice(-7).map((d) => ({
      label: d.date.replace(' (Hari Ini)', ''),
      total: d.total,
      berhasil: d.berhasil,
      gagal: d.gagal,
    }));
  } else {
    // today hourly
    const hourly = data?.hourlyDataToday || [
      { time: '00:00', total: 12, berhasil: 12, gagal: 0 },
      { time: '03:00', total: 8, berhasil: 8, gagal: 0 },
      { time: '06:00', total: 24, berhasil: 23, gagal: 1 },
      { time: '09:00', total: 42, berhasil: 40, gagal: 2 },
      { time: '12:00', total: 38, berhasil: 37, gagal: 1 },
      { time: '15:00', total: 46, berhasil: 44, gagal: 2 },
      { time: '18:00', total: 35, berhasil: 34, gagal: 1 },
      { time: 'Sekarang', total: 18, berhasil: 17, gagal: 1 },
    ];
    activeChartData = hourly.map((h) => ({
      label: h.time,
      total: h.total,
      berhasil: h.berhasil,
      gagal: h.gagal,
    }));
  }

  const totalPembelian = data?.totalPembelian || chartRaw.reduce((a, b) => a + b.total, 0);
  const totalBerhasil = data?.totalBerhasil || chartRaw.reduce((a, b) => a + b.berhasil, 0);
  const totalGagal = data?.totalGagal || chartRaw.reduce((a, b) => a + b.gagal, 0);
  const totalOmset = data?.totalOmset || chartRaw.reduce((a, b) => a + (b.omset || 0), 0);
  const successRate = data?.successRate || Number(((totalBerhasil / (totalPembelian || 1)) * 100).toFixed(1));
  const failRate = data?.failRate || Number(((totalGagal / (totalPembelian || 1)) * 100).toFixed(1));

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <section
      id="diagram-monitoring-transaksi"
      className="py-12 sm:py-16 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Monitoring Real-Time</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Live 24/7
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Monitoring Pembelian Bulan Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Pantau grafik diagram garis transaksi real-time untuk memonitor jumlah pembelian, transaksi berhasil, dan transaksi gagal di bulan ini.
            </p>
          </div>

          {/* Controls: Filter & Refresh */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode Switcher */}
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs font-bold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setViewMode('today')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'today'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini
              </button>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              title="Perbarui Data Real-Time"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Perbarui</span>
            </button>
          </div>
        </div>

        {/* 3 Key Metric Cards: Total Pembelian, Jumlah Berhasil, Jumlah Gagal (Persis Sesuai IMG_8169.jpeg) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Total Pembelian Bulan Ini (Biru) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-5 sm:p-6 rounded-[32px] bg-[#F4F8FF] border border-[#D3E3FD] shadow-sm flex items-center justify-between transition-all hover:shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-[#334155] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#0066FF] stroke-[2.2]" />
                <span>Total Pembelian Bulan Ini</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight pt-1">
                <AnimatedCounter
                  value={totalPembelian}
                  duration={1600}
                  enableBlur={true}
                  blurMax={3.5}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0052CC] pt-1">
                <TrendingUp className="w-4 h-4 text-[#0052CC] stroke-[2.5]" />
                <span className="flex items-center">
                  <span className="mr-0.5">+</span>
                  <AnimatedCounter
                    value={14.8}
                    decimals={1}
                    duration={1400}
                    enableBlur={true}
                    blurMax={2.5}
                    suffix="%"
                  />
                  <span className="ml-1 font-semibold text-[#0052CC]">tren pembelian naik</span>
                </span>
              </div>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
              <ShoppingBag className="w-7 h-7 stroke-[2.2]" />
            </div>
          </motion.div>

          {/* Card 2: Jumlah Berhasil (Hijau) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="p-5 sm:p-6 rounded-[32px] bg-[#F2FAF6] border border-[#CDEEDF] shadow-sm flex items-center justify-between transition-all hover:shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-[#334155] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00875A] stroke-[2.2]" />
                <span>Jumlah Transaksi Berhasil</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#00875A] font-mono tracking-tight pt-1">
                <AnimatedCounter
                  value={totalBerhasil}
                  duration={1600}
                  enableBlur={true}
                  blurMax={3.5}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold pt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#DDF4EA] text-[#00875A] font-bold text-xs inline-flex items-center">
                  <AnimatedCounter
                    value={successRate}
                    decimals={1}
                    duration={1400}
                    enableBlur={true}
                    blurMax={2.5}
                    suffix="% Sukses"
                  />
                </span>
                <span className="text-slate-400 font-medium text-xs">• Lunas Otomatis</span>
              </div>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00875A] text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/25">
              <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
            </div>
          </motion.div>

          {/* Card 3: Jumlah Gagal (Merah) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="p-5 sm:p-6 rounded-[32px] bg-[#FFF4F5] border border-[#FFD8D8] shadow-sm flex items-center justify-between transition-all hover:shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-[#334155] flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-[#DE350B] stroke-[2.2]" />
                <span>Jumlah Transaksi Gagal</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#DE350B] font-mono tracking-tight pt-1">
                <AnimatedCounter
                  value={totalGagal}
                  duration={1600}
                  enableBlur={true}
                  blurMax={3.5}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold pt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#FFEBE6] text-[#DE350B] font-bold text-xs inline-flex items-center">
                  <AnimatedCounter
                    value={failRate}
                    decimals={1}
                    duration={1400}
                    enableBlur={true}
                    blurMax={2.5}
                    suffix="% Gagal"
                  />
                </span>
                <span className="text-slate-400 font-medium text-xs">• Kedaluwarsa/Batal</span>
              </div>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#DE350B] text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/25">
              <XCircle className="w-7 h-7 stroke-[2.2]" />
            </div>
          </motion.div>
        </div>

        {/* Real-time Line Chart Card */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Diagram Garis Real-Time</span>
                <span className="text-xs font-normal text-slate-400 font-mono">
                  ({viewMode === 'month' ? 'September 2026' : viewMode === 'week' ? '7 Hari Terakhir' : 'Hari Ini'})
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Garis biru (Total Pembelian), garis hijau (Transaksi Berhasil), garis merah (Transaksi Gagal).
              </p>
            </div>

            {/* Quick Interactive Legend Pills */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => toggleSeries('total')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-opacity cursor-pointer ${
                  hiddenSeries['total']
                    ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Total Pembelian</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSeries('berhasil')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-opacity cursor-pointer ${
                  hiddenSeries['berhasil']
                    ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Berhasil</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSeries('gagal')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-opacity cursor-pointer ${
                  hiddenSeries['gagal']
                    ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-500'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Gagal</span>
              </button>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="w-full h-72 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeChartData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalVal = payload.find((p) => p.dataKey === 'total')?.value || 0;
                      const successVal = payload.find((p) => p.dataKey === 'berhasil')?.value || 0;
                      const failVal = payload.find((p) => p.dataKey === 'gagal')?.value || 0;

                      return (
                        <div className="rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200 text-xs space-y-2 min-w-[170px]">
                          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                            {label}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-blue-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <span>Total Pembelian:</span>
                              </span>
                              <span className="font-mono font-black">{totalVal}</span>
                            </div>
                            <div className="flex items-center justify-between text-emerald-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <span>Jumlah Berhasil:</span>
                              </span>
                              <span className="font-mono font-black">{successVal}</span>
                            </div>
                            <div className="flex items-center justify-between text-rose-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                                <span>Jumlah Gagal:</span>
                              </span>
                              <span className="font-mono font-black">{failVal}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend content={() => null} />

                {/* Garis 1: Total Pembelian (Biru) */}
                {!hiddenSeries['total'] && (
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Pembelian"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {/* Garis 2: Jumlah Berhasil (Hijau) */}
                {!hiddenSeries['berhasil'] && (
                  <Line
                    type="monotone"
                    dataKey="berhasil"
                    name="Transaksi Berhasil"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {/* Garis 3: Jumlah Gagal (Merah) */}
                {!hiddenSeries['gagal'] && (
                  <Line
                    type="monotone"
                    dataKey="gagal"
                    name="Transaksi Gagal"
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#e11d48', strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 5, fill: '#e11d48', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time System Status Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>QRIS Gateway SLA: 99.98%</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Kecepatan Proses Rata-rata: 3-5 detik</span>
              </span>
            </div>
            <div className="text-slate-400">
              Sinkronisasi terakhir: {lastUpdated.toLocaleTimeString('id-ID')} WIB
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
