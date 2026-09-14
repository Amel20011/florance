import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Wifi,
  Bot,
  Cpu,
  Zap,
  Gamepad2,
  Server,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Product, ProductVariant } from '../types.js';

interface PurchaseModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (
    product: Product,
    selectedVariant: ProductVariant,
    quantity: number,
    targetAccount: string
  ) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  if (!isOpen || !product) return null;

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [targetAccount, setTargetAccount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const totalPrice = (currentVariant ? currentVariant.price : product.basePrice) * quantity;

  const handleBuy = () => {
    if (!targetAccount.trim()) {
      setErrorMsg(`Harap isi ${product.targetFieldLabel} terlebih dahulu.`);
      return;
    }
    setErrorMsg('');
    if (currentVariant) {
      onProceedToCheckout(product, currentVariant, quantity, targetAccount.trim());
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-blue-600" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-blue-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-purple-600" />;
      case 'Server':
        return <Server className="w-5 h-5 text-emerald-600" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      default:
        return <Layers className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          id="purchase-modal-container"
          className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6 text-slate-900"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                {getIcon(product.iconName)}
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                  Beli {product.name}
                </h3>
                <span className="text-[10px] text-blue-600 font-semibold">{product.categoryLabel}</span>
              </div>
            </div>
            <button
              id="close-purchase-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. Pilih Varian / Nominal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih Nominal / Varian:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-600'
                          : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{v.name}</p>
                          {v.description && (
                            <p className="text-[10px] text-slate-500">{v.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-black text-blue-700 font-mono">
                          Rp {v.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Target Field Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  {product.targetFieldLabel} <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
              </label>
              <input
                type="text"
                value={targetAccount}
                onChange={(e) => {
                  setTargetAccount(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={product.targetFieldPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-bold text-slate-900 outline-none transition-all"
              />
              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* 3. Quantity */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Jumlah Pesanan</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer shadow-xs"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-900 font-mono w-5 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. Total Biaya & Checkout Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  Total Biaya
                </span>
                <span className="text-base sm:text-lg font-black text-blue-700 font-mono">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleBuy}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
