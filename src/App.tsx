import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { RealtimeTransactionChart } from './components/RealtimeTransactionChart.js';
import { ProductCatalog } from './components/ProductCatalog.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { PurchaseModal } from './components/PurchaseModal.js';
import { CheckoutView } from './components/CheckoutView.js';
import { PaymentQrisView } from './components/PaymentQrisView.js';
import { PaymentSuccessView } from './components/PaymentSuccessView.js';
import { OrdersView } from './components/OrdersView.js';
import { TransactionsView } from './components/TransactionsView.js';
import { BottomNav } from './components/BottomNav.js';
import { CustomerServiceChat } from './components/CustomerServiceChat.js';
import { TrustSection } from './components/TrustSection.js';
import { PromoSection } from './components/PromoSection.js';
import { TestimonialsSection } from './components/TestimonialsSection.js';
import { HelpFaqView } from './components/HelpFaqView.js';
import { ProfileView } from './components/ProfileView.js';
import { Footer } from './components/Footer.js';
import { AuthModal } from './components/AuthModal.js';
import { LoginGate } from './components/LoginGate.js';
import { DepositModal } from './components/DepositModal.js';
import { ScrollBlurOverlay } from './components/ScrollBlurOverlay.js';
import { PullToRefresh } from './components/PullToRefresh.js';
import { PRODUCTS } from './data/products.js';
import { Product, ProductVariant, UserProfile, Order } from './types.js';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'best_seller' | 'price_low' | 'price_high'>('popular');
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<'ALL' | 'Promo' | 'Populer' | 'Terlaris'>('ALL');

  // Active User State (localStorage sync)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('florance_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Flow Modals & Views
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    product: Product;
    variant: ProductVariant;
    quantity: number;
    targetAccount: string;
  } | null>(null);

  const [activePaymentData, setActivePaymentData] = useState<any | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [csChatOpen, setCsChatOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  // Sync current user to localStorage and verify with DB
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('florance_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('florance_user');
    }
  }, [currentUser]);

  // Check if saved user is actually registered in DB on initial load and verify session
  useEffect(() => {
    const verifyDatabaseRegistration = async () => {
      try {
        const token = localStorage.getItem('florance_jwt');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/auth/me', { headers });
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('florance_user', JSON.stringify(data.user));
        } else if (!currentUser?.email && !currentUser?.id) {
          setCurrentUser(null);
          localStorage.removeItem('florance_user');
          localStorage.removeItem('florance_jwt');
        }
      } catch (err) {
        console.error('Failed to verify user registration with DB:', err);
      }
    };

    verifyDatabaseRegistration();
  }, []);

  // Fetch and sync user balance from server
  const refreshUserBalance = async () => {
    if (!currentUser?.id && !currentUser?.email) return;
    try {
      const q = new URLSearchParams();
      if (currentUser.id) q.set('userId', currentUser.id);
      if (currentUser.email) q.set('email', currentUser.email);
      const res = await fetch(`/api/user/balance?${q.toString()}`);
      const data = await res.json();
      if (data.success && typeof data.balance === 'number') {
        setCurrentUser((prev) => (prev ? { ...prev, balance: data.balance } : null));
      }
    } catch (err) {
      console.error('Failed to sync user balance:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.id || currentUser?.email) {
      refreshUserBalance();
      const balInterval = setInterval(refreshUserBalance, 8000);
      return () => clearInterval(balInterval);
    }
  }, [currentUser?.id, currentUser?.email]);

  // Fetch pending count
  const refreshPendingCount = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const count = data.orders.filter(
          (o: Order) => o.paymentStatus === 'PENDING'
        ).length;
        setPendingOrdersCount(count);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  // Global Pull-to-Refresh action for Beranda and all pages
  const handleGlobalRefresh = async () => {
    try {
      await Promise.all([
        refreshUserBalance(),
        refreshPendingCount(),
        fetch('/api/orders').catch(() => null),
        fetch('/api/products').catch(() => null),
      ]);
    } catch (err) {
      console.error('Failed to perform global refresh:', err);
    }
  };

  // Handle Tab changes
  const handleTabChange = (tab: string) => {
    // Reset flow screens if switching top tabs
    setCheckoutPayload(null);
    setActivePaymentData(null);
    setSuccessOrder(null);

    if (
      ['pulsa', 'paket-data', 'sewa-bot', 'bot-whatsapp', 'token', 'layanan'].includes(tab)
    ) {
      setSelectedCategory(tab);
      setActiveTab('transaksi');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tab === 'produk') {
      setSelectedCategory('all');
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open product detail (purely description without price/checkout)
  const handleViewDetail = (product: Product) => {
    setDetailProduct(product);
  };

  // Direct Buy Now click (opens purchase modal)
  const handleBuyNow = (product: Product) => {
    setPurchaseProduct(product);
  };

  // Proceed from Purchase Modal to Checkout
  const handleProceedToCheckout = (
    product: Product,
    selectedVariant: ProductVariant,
    quantity: number,
    targetAccount: string
  ) => {
    setPurchaseProduct(null);
    setDetailProduct(null);
    setCheckoutPayload({
      product,
      variant: selectedVariant,
      quantity,
      targetAccount,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When payment QRIS is generated by /api/payment/create or deposit
  const handlePaymentCreated = (paymentRes: any) => {
    setCheckoutPayload(null);
    setActivePaymentData(paymentRes);
    refreshPendingCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When payment succeeds
  const handlePaymentSuccess = (orderData: any) => {
    setActivePaymentData(null);
    setSuccessOrder(orderData);
    refreshPendingCount();
    refreshUserBalance();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pay a pending order from Orders list
  const handlePayPendingOrder = (order: Order) => {
    setActivePaymentData({
      transaction_id: order.gatewayTransactionId,
      invoice: order.invoice,
      amount: order.amount,
      totalAmount: order.totalAmount,
      qrUrl: order.qrUrl,
      qrDataUrl: order.qrDataUrl,
      expiredAt: order.expiredAt,
      productName: order.productName,
      variantName: order.variantName,
      targetAccount: order.targetAccount,
      status: order.paymentStatus.toLowerCase(),
    });
    setActiveTab('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('florance_user');
    localStorage.removeItem('florance_jwt');
    setCurrentUser(null);
    setActiveTab('beranda');
  };

  // If user is not authenticated, show strict Login Gate requiring Google / Apple login first
  if (!currentUser) {
    return <LoginGate onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <PullToRefresh onRefresh={handleGlobalRefresh}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600/15 selection:text-blue-900 relative">
        {/* Dynamic Top and Bottom Scroll Blur Vignette */}
        <ScrollBlurOverlay />

        {/* Sticky Responsive Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          currentUser={currentUser}
          onOpenLogin={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenDeposit={() => setDepositModalOpen(true)}
          pendingOrdersCount={pendingOrdersCount}
        />

      {/* Main Content Areas */}
      <main className="flex-1 pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          {/* Active Checkout Screen */}
          {checkoutPayload ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CheckoutView
                product={checkoutPayload.product}
                variant={checkoutPayload.variant}
                quantity={checkoutPayload.quantity}
                targetAccount={checkoutPayload.targetAccount}
                currentUser={currentUser}
                onBack={() => setCheckoutPayload(null)}
                onPaymentCreated={handlePaymentCreated}
                onOpenDeposit={() => setDepositModalOpen(true)}
              />
            </motion.div>
          ) : activePaymentData ? (
            /* Active QRIS Payment Screen */
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentQrisView
                paymentData={activePaymentData}
                onPaymentSuccess={handlePaymentSuccess}
                onCancelPayment={() => {
                  setActivePaymentData(null);
                  handleTabChange('orders');
                }}
              />
            </motion.div>
          ) : successOrder ? (
            /* Payment Success & Deliverable Screen */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentSuccessView
                order={successOrder}
                onGoHome={() => handleTabChange('beranda')}
                onViewOrders={() => handleTabChange('riwayat')}
              />
            </motion.div>
          ) : activeTab === 'transaksi' ? (
            /* Dedicated Transaksi Page with Full Product Catalog, Search, and Invoice Checker */
            <motion.div
              key="transaksi-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <TransactionsView
                products={PRODUCTS}
                currentUser={currentUser}
                onSelectProduct={handleBuyNow}
                onViewDetail={handleViewDetail}
                onOpenDeposit={() => setDepositModalOpen(true)}
                onViewHistory={() => handleTabChange('riwayat')}
                onPayPendingOrder={handlePayPendingOrder}
                initialCategory={selectedCategory}
              />
            </motion.div>
          ) : activeTab === 'orders' || activeTab === 'riwayat' ? (
            /* Dedicated Riwayat Page */
            <motion.div
              key="riwayat-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <OrdersView
                userId={currentUser?.id}
                onPayPendingOrder={handlePayPendingOrder}
                onViewOrderSuccess={(order) => setSuccessOrder(order)}
              />
            </motion.div>
          ) : activeTab === 'bantuan' ? (
            /* FAQ & Help Screen */
            <motion.div
              key="bantuan-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <HelpFaqView onOpenCustomerService={() => setCsChatOpen(true)} />
            </motion.div>
          ) : activeTab === 'profile' || activeTab === 'akun' ? (
            /* Dedicated Akun Page */
            <motion.div
              key="akun-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ProfileView
                currentUser={currentUser}
                onOpenLogin={() => setAuthModalOpen(true)}
                onLogout={handleLogout}
                onViewOrders={() => handleTabChange('riwayat')}
                onViewTransactions={() => handleTabChange('transaksi')}
                onOpenDeposit={() => setDepositModalOpen(true)}
                onOpenCS={() => setCsChatOpen(true)}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  try {
                    localStorage.setItem('florance_user', JSON.stringify(updated));
                  } catch {
                    // ignore
                  }
                }}
              />
            </motion.div>
          ) : activeTab === 'produk' ? (
            /* Full Product Catalog View */
            <motion.div
              key="produk-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <TransactionsView
                products={PRODUCTS}
                currentUser={currentUser}
                onSelectProduct={handleBuyNow}
                onViewDetail={handleViewDetail}
                onOpenDeposit={() => setDepositModalOpen(true)}
                onViewHistory={() => handleTabChange('riwayat')}
                onPayPendingOrder={handlePayPendingOrder}
                initialCategory={selectedCategory}
              />
            </motion.div>
          ) : (
            /* Default "Beranda" (Home View) - User Account, Search & Filter Card, Product Cards, Chart, and Promo */
            <motion.div
              key="beranda-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSection
                currentUser={currentUser}
                onViewProfile={() => handleTabChange('profile')}
                onViewOrders={() => handleTabChange('riwayat')}
                onOpenDeposit={() => setDepositModalOpen(true)}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                activeBadgeFilter={activeBadgeFilter}
                onBadgeFilterChange={setActiveBadgeFilter}
                totalProductsCount={
                  PRODUCTS.filter((p) => {
                    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
                    const matchSearch =
                      !searchQuery.trim() ||
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchBadge = activeBadgeFilter === 'ALL' || p.badge === activeBadgeFilter;
                    return matchCategory && matchSearch && matchBadge;
                  }).length
                }
              />

              {/* Product Catalog Grid directly under Search & Filter Card */}
              <ProductCatalog
                products={PRODUCTS}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onBuyNow={handleBuyNow}
                onViewDetail={handleViewDetail}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                activeBadgeFilter={activeBadgeFilter}
                onBadgeFilterChange={setActiveBadgeFilter}
                hideControls={true}
                hideTitle={true}
              />

              {/* Real-time Line Chart Monitoring Pembelian, Berhasil, dan Gagal */}
              <RealtimeTransactionChart />

              <PromoSection
                promoProducts={PRODUCTS.filter((p) => p.badge === 'Promo' || p.badge === 'Terlaris')}
                onSelectProduct={handleBuyNow}
              />

              <TrustSection />

              <TestimonialsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Product Detail Modal (Pure Description) */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          isOpen={Boolean(detailProduct)}
          onClose={() => setDetailProduct(null)}
          onOpenBuy={(prod) => {
            setDetailProduct(null);
            setPurchaseProduct(prod);
          }}
        />
      )}

      {/* Global Purchase Modal (Variant Selection & Order Input) */}
      {purchaseProduct && (
        <PurchaseModal
          product={purchaseProduct}
          isOpen={Boolean(purchaseProduct)}
          onClose={() => setPurchaseProduct(null)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Deposit QRIS Modal */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        currentUser={currentUser}
        onDepositCreated={(paymentRes) => {
          setDepositModalOpen(false);
          setActivePaymentData(paymentRes);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Customer Service Live Chat Window */}
      <CustomerServiceChat
        isOpen={csChatOpen}
        onClose={() => setCsChatOpen(false)}
        onOpen={() => setCsChatOpen(true)}
      />

      {/* Global Full-Width Footer */}
      <Footer
        onNavigate={handleTabChange}
        onOpenCustomerService={() => setCsChatOpen(true)}
      />

      {/* Floating Bottom Navigation Bar: Beranda, Transaksi, Riwayat, Akun */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        pendingCount={pendingOrdersCount}
      />
    </div>
    </PullToRefresh>
  );
}
