import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../types.js';

interface FloranceAIAssistantProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenCustomerService: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

export const FloranceAIAssistant: React.FC<FloranceAIAssistantProps> = ({
  products,
  onSelectProduct,
  onOpenCustomerService,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Halo! ✦ Saya Florance AI Assistant. Butuh rekomendasi pulsa, kuota data, sewa bot WhatsApp, atau token listrik terbaik?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Rekomendasikan paket data hemat',
    'Sewa Bot WhatsApp olshop',
    'Beli token listrik PLN',
    'Cara bayar pakai QRIS',
  ];

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            basePrice: p.basePrice,
            shortDescription: p.shortDescription,
          })),
        }),
      });

      const data = await response.json();

      let matchedProducts: Product[] = [];
      if (data.recommendedIds && Array.isArray(data.recommendedIds)) {
        matchedProducts = products.filter((p) => data.recommendedIds.includes(p.id));
      }

      if (matchedProducts.length === 0) {
        const lowerQ = query.toLowerCase();
        matchedProducts = products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQ) ||
            p.categoryLabel.toLowerCase().includes(lowerQ) ||
            p.shortDescription.toLowerCase().includes(lowerQ)
        ).slice(0, 2);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Berikut adalah rekomendasi produk digital yang sesuai untuk kebutuhan Anda:',
        recommendedProducts: matchedProducts,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error calling AI chat endpoint:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Florance menyediakan katalog lengkap pulsa all operator, kuota data, sewa bot WhatsApp cloud, dan token PLN otomatis. Silakan pilih produk dari katalog kami.',
        recommendedProducts: products.slice(0, 2),
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating AI Trigger Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="btn-florance-ai-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Florance AI ✦</span>
          <span className="sm:hidden font-medium">AI ✦</span>
        </motion.button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            id="florance-ai-chat-window"
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[540px] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900"
          >
            {/* Chat Window Header */}
            <div className="p-4 bg-blue-600 text-white border-b border-blue-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>Florance AI Assistant ✦</span>
                  </h3>
                  <p className="text-[10px] text-blue-100">Rekomendasi Cerdas & Bantuan Produk</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* If AI attaches recommended product cards */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                          Rekomendasi Terkait:
                        </span>
                        {msg.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onSelectProduct(p);
                              setIsOpen(false);
                            }}
                            className="cursor-pointer p-2.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-300 transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 truncate">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-blue-700 font-mono font-bold">
                                Mulai Rp {p.basePrice.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 w-28 text-xs shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Tanyakan produk digital atau panduan..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
