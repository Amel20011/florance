import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Search,
  RotateCw,
  QrCode,
  Sparkles,
  Radio,
  Zap,
} from 'lucide-react';
import { Order, PaymentStatus } from '../types.js';

interface OrdersViewProps {
  userId?: string;
  onPayPendingOrder: (order: Order) => void;
  onViewOrderSuccess: (order: Order) => void;
}

type FilterStatusType = 'ALL' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export const OrdersView: React.FC<OrdersViewProps> = ({
  userId,
  onPayPendingOrder,
  onViewOrderSuccess,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState<FilterStatusType>('ALL');
  const [searchInvoice, setSearchInvoice] = useState('');
  const [checkingOrdersMap, setCheckingOrdersMap] = useState<Record<string, boolean>>({});
  const [cancellingOrdersMap, setCancellingOrdersMap] = useState<Record<string, boolean>>({});
  const [recentlyUpdatedMap, setRecentlyUpdatedMap] = useState<Record<string, 'SUCCESS' | 'FAILED' | 'PROCESSING'>>({});

  const ordersRef = useRef<Order[]>([]);
  ordersRef.current = orders;

  // Initial Full Fetch of Orders
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsSyncing(true);

    try {
      const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (!silent) setIsLoading(false);
      setIsSyncing(false);
    }
  }, [userId]);

  // Cancel order handler
  const handleCancelOrder = async (order: Order) => {
    const orderKey = order.id || order.invoice;
    const confirmCancel = window.confirm(`Apakah Anda yakin ingin membatalkan pembayaran pesanan ${order.invoice}?`);
    if (!confirmCancel) return;

    setCancellingOrdersMap((prev) => ({ ...prev, [orderKey]: true }));
    try {
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: order.gatewayTransactionId,
          order_id: order.id,
          invoice: order.invoice,
          reason: 'Dibatalkan oleh pembeli di riwayat pesanan.',
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id || o.invoice === order.invoice || o.gatewayTransactionId === order.gatewayTransactionId
              ? { ...o, paymentStatus: 'FAILED', fulfillmentStatus: 'FAILED' }
              : o
          )
        );
        setRecentlyUpdatedMap((prev) => ({ ...prev, [orderKey]: 'FAILED' }));
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setCancellingOrdersMap((prev) => ({ ...prev, [orderKey]: false }));
    }
  };

  // Function to fetch and update an individual order status from the server in real-time
  const fetchIndividualOrderStatus = useCallback(async (order: Order, manual = false) => {
    const orderKey = order.id || order.invoice;
    if (manual) {
      setCheckingOrdersMap((prev) => ({ ...prev, [orderKey]: true }));
    }

    try {
      // 1. Try checking via live payment status endpoint if gatewayTransactionId exists
      const targetQuery = order.gatewayTransactionId || order.invoice || order.id;
      const statusRes = await fetch(`/api/payment/status?transaction_id=${encodeURIComponent(targetQuery)}`);
      const statusData = await statusRes.json();

      let updatedStatus: PaymentStatus = order.paymentStatus;
      let fulfillmentData = order.fulfillmentData;
      let fulfillmentStatus = order.fulfillmentStatus;
      let paidAt = order.paidAt;

      if (statusData && statusData.success) {
        const rawStatus = (statusData.status || '').toUpperCase();
        if (rawStatus === 'PAID' || rawStatus === 'SUCCESS') {
          updatedStatus = 'PAID';
        } else if (rawStatus === 'FAILED') {
          updatedStatus = 'FAILED';
        } else if (rawStatus === 'EXPIRED') {
          updatedStatus = 'EXPIRED';
        } else if (rawStatus === 'PENDING') {
          updatedStatus = 'PENDING';
        }

        if (statusData.fulfillmentData) {
          fulfillmentData = statusData.fulfillmentData;
        }
        if (statusData.fulfillmentStatus) {
          fulfillmentStatus = statusData.fulfillmentStatus;
        }
        if (statusData.paidAt) {
          paidAt = statusData.paidAt;
        }
      } else {
        // Fallback: fetch individual order details directly
        const orderRes = await fetch(`/api/orders/${encodeURIComponent(order.id || order.invoice)}`);
        const orderData = await orderRes.json();
        if (orderData && orderData.success && orderData.order) {
          updatedStatus = orderData.order.paymentStatus;
          fulfillmentData = orderData.order.fulfillmentData;
          fulfillmentStatus = orderData.order.fulfillmentStatus;
          paidAt = orderData.order.paidAt;
        }
      }

      // If status changed or fulfillment changed, update in state
      setOrders((prevOrders) => {
        let changed = false;
        const newOrders = prevOrders.map((o) => {
          if (o.id === order.id || o.invoice === order.invoice) {
            if (
              o.paymentStatus !== updatedStatus ||
              JSON.stringify(o.fulfillmentData) !== JSON.stringify(fulfillmentData)
            ) {
              changed = true;
              return {
                ...o,
                paymentStatus: updatedStatus,
                fulfillmentData: fulfillmentData || o.fulfillmentData,
                fulfillmentStatus: fulfillmentStatus || o.fulfillmentStatus,
                paidAt: paidAt || o.paidAt,
              };
            }
          }
          return o;
        });

        if (changed) {
          setRecentlyUpdatedMap((prev) => ({
            ...prev,
            [orderKey]: updatedStatus === 'PAID' ? 'SUCCESS' : updatedStatus === 'PENDING' ? 'PROCESSING' : 'FAILED',
          }));
          setTimeout(() => {
            setRecentlyUpdatedMap((prev) => {
              const copy = { ...prev };
              delete copy[orderKey];
              return copy;
            });
          }, 4000);
        }

        return changed ? newOrders : prevOrders;
      });

      setLastSyncTime(new Date());
    } catch (err) {
      console.warn(`Could not sync individual order ${order.invoice}:`, err);
    } finally {
      if (manual) {
        setCheckingOrdersMap((prev) => ({ ...prev, [orderKey]: false }));
      }
    }
  }, []);

  // Periodic polling function: continuously monitors active/pending orders and periodically updates them
  useEffect(() => {
    fetchOrders();

    // Setup periodic polling interval
    const interval = setInterval(() => {
      // Don't poll aggressively if the document is hidden
      if (document.hidden) return;

      const currentOrders = ordersRef.current;
      const pendingOrders = currentOrders.filter((o) => o.paymentStatus === 'PENDING');

      if (pendingOrders.length > 0) {
        setIsSyncing(true);
        // Poll each pending/processing order individually from the server in real-time
        Promise.all(
          pendingOrders.map((pendingOrder) => fetchIndividualOrderStatus(pendingOrder, false))
        ).finally(() => {
          setIsSyncing(false);
        });
      } else {
        // If all orders are settled, perform a gentle background sync every few intervals
        // to catch any newly arrived orders
        fetchOrders(true);
      }
    }, 3500); // 3.5-second real-time check interval

    return () => clearInterval(interval);
  }, [fetchOrders, fetchIndividualOrderStatus]);

  // Counts for status tabs
  const pendingCount = orders.filter((o) => o.paymentStatus === 'PENDING').length;
  const successCount = orders.filter((o) => o.paymentStatus === 'PAID').length;
  const failedCount = orders.filter((o) => o.paymentStatus === 'FAILED' || o.paymentStatus === 'EXPIRED').length;

  const filteredOrders = orders.filter((order) => {
    let matchStatus = true;
    if (filterStatus === 'PROCESSING') {
      matchStatus = order.paymentStatus === 'PENDING';
    } else if (filterStatus === 'SUCCESS') {
      matchStatus = order.paymentStatus === 'PAID';
    } else if (filterStatus === 'FAILED') {
      matchStatus = order.paymentStatus === 'FAILED' || order.paymentStatus === 'EXPIRED';
    }

    const matchSearch =
      !searchInvoice.trim() ||
      order.invoice.toLowerCase().includes(searchInvoice.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchInvoice.toLowerCase()) ||
      order.targetAccount.toLowerCase().includes(searchInvoice.toLowerCase());

    return matchStatus && matchSearch;
  });

  // Real-time Tag & Status Badge Helper
  const getStatusBadge = (status: PaymentStatus, isRecentlyUpdated?: 'SUCCESS' | 'FAILED' | 'PROCESSING') => {
    switch (status) {
      case 'PAID':
        return (
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border transition-all ${
                isRecentlyUpdated === 'SUCCESS'
                  ? 'bg-emerald-500 text-white border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Success</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Lunas & Terkirim
            </span>
          </div>
        );

      case 'PENDING':
        return (
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border transition-all ${
                isRecentlyUpdated === 'PROCESSING'
                  ? 'bg-amber-500 text-white border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
              <span>Processing</span>
            </span>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Menunggu Pembayaran
            </span>
          </div>
        );

      case 'FAILED':
        return (
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border transition-all ${
                isRecentlyUpdated === 'FAILED'
                  ? 'bg-rose-500 text-white border-rose-400 scale-105 shadow-md shadow-rose-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </span>
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              Pembayaran Gagal
            </span>
          </div>
        );

      case 'EXPIRED':
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
              <XCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Kedaluwarsa
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Riwayat Transaksi Digital</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Pesanan & Status Layanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau status pembayaran QRIS, serial number, dan lisensi produk Anda secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchOrders(false)}
            disabled={isLoading || isSyncing}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isLoading || isSyncing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}
            />
            <span>{isSyncing ? 'Sinkronisasi...' : 'Segarkan Data'}</span>
          </motion.button>
        </div>
      </div>

      {/* Real-time Status Sync Banner */}
      <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-indigo-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-3.5 h-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white">Pembaruan Real-Time Aktif</span>
            <span className="text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:inline">
              • Status pesanan diperiksa otomatis dari server setiap 3.5 detik.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Radio className={`w-3.5 h-3.5 ${isSyncing ? 'text-blue-500 animate-pulse' : 'text-emerald-500'}`} />
          <span>
            {isSyncing
              ? 'Memeriksa status pesanan...'
              : `Terakhir diperbarui: ${lastSyncTime.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}`}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm mb-6 space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Cari nomor invoice, produk, atau nomor tujuan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 text-xs font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Real-time Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Semua</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('PROCESSING')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'PROCESSING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Processing</span>
              {pendingCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterStatus('SUCCESS')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'SUCCESS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Success</span>
              {successCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterStatus === 'SUCCESS'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {successCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterStatus('FAILED')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'FAILED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
              {failedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterStatus === 'FAILED'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {failedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-2" />
          <span>Memuat data transaksi dari server Florance...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map((ord) => {
              const orderKey = ord.id || ord.invoice;
              const isCheckingIndividual = checkingOrdersMap[orderKey] || false;
              const recentlyUpdated = recentlyUpdatedMap[orderKey];

              return (
                <motion.div
                  key={ord.id || ord.invoice}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-4 ${
                    recentlyUpdated === 'SUCCESS'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : recentlyUpdated === 'FAILED'
                      ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                          {ord.invoice}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {ord.productName}{' '}
                        <span className="font-normal text-slate-500 dark:text-slate-400">
                          ({ord.variantName})
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Total Biaya</span>
                        <span className="text-base font-black text-blue-700 dark:text-blue-400 font-mono">
                          Rp {ord.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>{getStatusBadge(ord.paymentStatus, recentlyUpdated)}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Tujuan / Akun: </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {ord.targetAccount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                      {/* Individual on-demand status check button */}
                      <button
                        onClick={() => fetchIndividualOrderStatus(ord, true)}
                        disabled={isCheckingIndividual}
                        title="Periksa pembaruan status transaksi ini dari server"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCw
                          className={`w-3 h-3 ${isCheckingIndividual ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}
                        />
                        <span>{isCheckingIndividual ? 'Mengecek...' : 'Cek Status'}</span>
                      </button>

                      {ord.paymentStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleCancelOrder(ord)}
                            disabled={cancellingOrdersMap[orderKey]}
                            title="Batalkan pembayaran pesanan ini"
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>{cancellingOrdersMap[orderKey] ? 'Membatalkan...' : 'Batalkan'}</span>
                          </button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onPayPendingOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Bayar QRIS</span>
                          </motion.button>
                        </>
                      )}

                      {ord.paymentStatus === 'PAID' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onViewOrderSuccess(ord)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Lihat Hasil & Token</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm transition-colors">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {filterStatus === 'ALL'
              ? 'Belum Ada Transaksi'
              : `Tidak Ada Pesanan dengan Status ${filterStatus}`}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filterStatus === 'ALL'
              ? 'Pesanan yang Anda buat akan tercatat di sini dan diperbarui secara otomatis.'
              : 'Gunakan filter Semua untuk melihat seluruh riwayat transaksi Anda.'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

