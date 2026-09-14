import { useState, useEffect, useRef, useCallback } from 'react';

export type PaymentStatusType = 'idle' | 'pending' | 'paid' | 'success' | 'expired' | 'failed';

export interface PaymentStatusData {
  transaction_id: string;
  invoice: string;
  status: PaymentStatusType;
  totalAmount: number;
  paidAt?: string;
  fulfillmentStatus?: string;
  fulfillmentData?: {
    snNumber?: string;
    licenseKey?: string;
    botWebhookUrl?: string;
    instructions?: string;
  };
  [key: string]: any;
}

export interface UsePaymentStatusOptions {
  /**
   * Polling interval in milliseconds (default: 3000ms).
   */
  intervalMs?: number;
  /**
   * Whether polling is enabled (default: true if transactionId is present).
   */
  enabled?: boolean;
  /**
   * Maximum number of polling attempts before stopping (default: 300 ~ 15 minutes at 3s).
   */
  maxAttempts?: number;
  /**
   * Callback invoked when payment status transitions to 'paid' or 'success'.
   */
  onSuccess?: (orderData: PaymentStatusData) => void;
  /**
   * Callback invoked when payment status transitions to 'expired'.
   */
  onExpired?: (orderData: PaymentStatusData) => void;
  /**
   * Callback invoked when payment status transitions to 'failed'.
   */
  onFailed?: (orderData: PaymentStatusData) => void;
  /**
   * Callback invoked on any status change.
   */
  onStatusChange?: (newStatus: PaymentStatusType, orderData: PaymentStatusData) => void;
  /**
   * Automatically pause polling when the browser tab is hidden to save resources (default: true).
   */
  pauseOnHidden?: boolean;
}

export interface UsePaymentStatusReturn {
  status: PaymentStatusType;
  isPending: boolean;
  isSuccess: boolean;
  isExpired: boolean;
  isFailed: boolean;
  isPolling: boolean;
  isChecking: boolean;
  orderData: PaymentStatusData | null;
  error: string | null;
  lastCheckedAt: Date | null;
  attemptsCount: number;
  /**
   * Trigger an immediate on-demand check against the secure server endpoint.
   */
  checkNow: (showLoading?: boolean) => Promise<PaymentStatusData | null>;
  /**
   * Manually stop polling.
   */
  stopPolling: () => void;
  /**
   * Manually restart/resume polling.
   */
  startPolling: () => void;
  /**
   * Cancel the payment/order on the server and update status to failed/cancelled.
   */
  cancelPayment: (reason?: string) => Promise<boolean>;
}

/**
 * Custom hook to periodically poll the BuatQRIS API status via the secure server endpoint (/api/payment/status).
 * Automatically updates order status without requiring manual user intervention.
 */
export function usePaymentStatus(
  transactionId: string | null | undefined,
  options: UsePaymentStatusOptions = {}
): UsePaymentStatusReturn {
  const {
    intervalMs = 3000,
    enabled = true,
    maxAttempts = 300,
    onSuccess,
    onExpired,
    onFailed,
    onStatusChange,
    pauseOnHidden = true,
  } = options;

  const [status, setStatus] = useState<PaymentStatusType>(transactionId ? 'pending' : 'idle');
  const [orderData, setOrderData] = useState<PaymentStatusData | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(enabled && Boolean(transactionId));
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);

  // Keep references to callbacks to avoid resetting intervals on callback identity changes
  const callbacksRef = useRef({ onSuccess, onExpired, onFailed, onStatusChange });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onExpired, onFailed, onStatusChange };
  }, [onSuccess, onExpired, onFailed, onStatusChange]);

  const statusRef = useRef<PaymentStatusType>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const attemptsRef = useRef<number>(0);
  const isComponentMounted = useRef<boolean>(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Main check function hitting the secure server-side endpoint
  const checkNow = useCallback(
    async (showLoading = false): Promise<PaymentStatusData | null> => {
      if (!transactionId) return null;

      if (showLoading && isComponentMounted.current) {
        setIsChecking(true);
      }

      try {
        attemptsRef.current += 1;
        if (isComponentMounted.current) {
          setAttemptsCount(attemptsRef.current);
        }

        const res = await fetch(`/api/payment/status?transaction_id=${encodeURIComponent(transactionId)}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        if (!isComponentMounted.current) return null;

        setLastCheckedAt(new Date());

        if (data && data.success) {
          const rawStatus = (data.status || 'pending').toLowerCase();
          const normalizedStatus: PaymentStatusType =
            rawStatus === 'paid' || rawStatus === 'success' || rawStatus === 'settlement'
              ? 'success'
              : rawStatus === 'expired'
              ? 'expired'
              : rawStatus === 'failed'
              ? 'failed'
              : 'pending';

          const previousStatus = statusRef.current;
          setOrderData(data);
          setStatus(normalizedStatus);
          setError(null);

          // Trigger change callback if status changed
          if (previousStatus !== normalizedStatus && callbacksRef.current.onStatusChange) {
            callbacksRef.current.onStatusChange(normalizedStatus, data);
          }

          // Terminal state handling: stop polling and trigger completion handlers
          if (normalizedStatus === 'success') {
            setIsPollingActive(false);
            if (callbacksRef.current.onSuccess) {
              callbacksRef.current.onSuccess(data);
            }
          } else if (normalizedStatus === 'expired') {
            setIsPollingActive(false);
            if (callbacksRef.current.onExpired) {
              callbacksRef.current.onExpired(data);
            }
          } else if (normalizedStatus === 'failed') {
            setIsPollingActive(false);
            if (callbacksRef.current.onFailed) {
              callbacksRef.current.onFailed(data);
            }
          }

          return data;
        } else {
          setError(data.error || 'Gagal memeriksa status');
          return null;
        }
      } catch (err: any) {
        console.warn('BuatQRIS status poll error:', err.message);
        if (isComponentMounted.current) {
          setError(err.message || 'Koneksi terputus');
        }
        return null;
      } finally {
        if (isComponentMounted.current) {
          setIsChecking(false);
        }
      }
    },
    [transactionId]
  );

  // Manual control handlers
  const stopPolling = useCallback(() => {
    setIsPollingActive(false);
  }, []);

  const startPolling = useCallback(() => {
    if (transactionId && (status === 'pending' || status === 'idle')) {
      attemptsRef.current = 0;
      setAttemptsCount(0);
      setIsPollingActive(true);
      checkNow(false);
    }
  }, [transactionId, status, checkNow]);

  // Cancel payment handler
  const cancelPayment = useCallback(
    async (reason?: string): Promise<boolean> => {
      if (!transactionId) return false;
      try {
        setIsChecking(true);
        const res = await fetch('/api/payment/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            reason: reason || 'Dibatalkan oleh pembeli.',
          }),
        });
        const data = await res.json();
        if (data && data.success) {
          setIsPollingActive(false);
          setStatus('failed');
          setOrderData(data.order);
          if (callbacksRef.current.onFailed) {
            callbacksRef.current.onFailed(data.order);
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to cancel payment:', err);
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    [transactionId]
  );

  // Initialize or reset polling state when transactionId changes
  useEffect(() => {
    if (!transactionId) {
      setStatus('idle');
      setOrderData(null);
      setIsPollingActive(false);
      attemptsRef.current = 0;
      setAttemptsCount(0);
      return;
    }

    setStatus('pending');
    attemptsRef.current = 0;
    setAttemptsCount(0);
    setError(null);

    if (enabled) {
      setIsPollingActive(true);
      // Perform initial check immediately
      checkNow(false);
    }
  }, [transactionId, enabled, checkNow]);

  // Main polling effect with visibility and max-attempts awareness
  useEffect(() => {
    if (!isPollingActive || !transactionId || status !== 'pending') {
      return;
    }

    let isTabVisible = true;
    const handleVisibilityChange = () => {
      if (pauseOnHidden && document.visibilityState === 'hidden') {
        isTabVisible = false;
      } else {
        isTabVisible = true;
        // Check immediately when user switches back to tab
        if (isPollingActive && statusRef.current === 'pending') {
          checkNow(false);
        }
      }
    };

    if (pauseOnHidden && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    const intervalTimer = setInterval(() => {
      if (!isTabVisible && pauseOnHidden) {
        return; // Skip poll cycle if tab is backgrounded
      }

      if (attemptsRef.current >= maxAttempts) {
        console.warn(`Reached maximum polling attempts (${maxAttempts}). Stopping poll.`);
        setIsPollingActive(false);
        return;
      }

      checkNow(false);
    }, intervalMs);

    return () => {
      clearInterval(intervalTimer);
      if (pauseOnHidden && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [isPollingActive, transactionId, status, intervalMs, maxAttempts, pauseOnHidden, checkNow]);

  return {
    status,
    isPending: status === 'pending',
    isSuccess: status === 'success' || status === 'paid',
    isExpired: status === 'expired',
    isFailed: status === 'failed',
    isPolling: isPollingActive && status === 'pending',
    isChecking,
    orderData,
    error,
    lastCheckedAt,
    attemptsCount,
    checkNow,
    stopPolling,
    startPolling,
    cancelPayment,
  };
}
