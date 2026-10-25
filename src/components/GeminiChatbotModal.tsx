import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { formatIndianCurrency } from '../utils/calculations';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Building2,
  Receipt,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({ isOpen, onClose }) => {
  const {
    shopName,
    transactions,
    distributorPayments,
    totalPhysicalCash,
    expectedBookCash,
    cashDrawerDiscrepancy,
    moneyTransferSettledTotal,
    moneyTransferPendingTotal,
    accessoriesSettledTotal,
    accessoriesPendingTotal,
    todayDate,
  } = useShop();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Namaste! I am **Om Copilot AI**, your intelligent retail fintech accountant and store copilot for **OM ENTERPRISES**.\n\nI have real-time visibility into your multi-gateway DMT ledgers, Indo-Nepal remittance margins, distributor settlement dues, and cash drawer balance. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Aggregate shop context to send to server
  const getLiveShopContext = () => {
    const todayTxns = transactions.filter((t) => t.dateFormatted === todayDate);
    const totalVolume = todayTxns.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalProfit = todayTxns.reduce((acc, t) => acc + (t.netProfit || 0), 0);
    const indoNepalTxns = todayTxns.filter((t) => t.category === 'INDO_NEPAL');
    const indoNepalProfit = indoNepalTxns.reduce((acc, t) => acc + (t.netProfit || 0), 0);

    return {
      storeName: shopName,
      todayDate,
      totalTransactionsToday: todayTxns.length,
      totalTurnoverToday: totalVolume,
      totalNetProfitToday: totalProfit,
      indoNepalRemittances: {
        count: indoNepalTxns.length,
        profitEarned: indoNepalProfit,
        accountDepositShare: indoNepalTxns.filter((t) => t.indoNepalTransferType === 'ACCOUNT_DEPOSIT').length,
        cashPayoutShare: indoNepalTxns.filter((t) => t.indoNepalTransferType === 'CASH_PAYOUT').length,
      },
      cashDrawer: {
        physicalVaultCount: totalPhysicalCash,
        systemBookExpected: expectedBookCash,
        discrepancy: cashDrawerDiscrepancy,
      },
      distributorSettlements: {
        moneyTransferPending: moneyTransferPendingTotal,
        moneyTransferSettled: moneyTransferSettledTotal,
        accessoriesPending: accessoriesPendingTotal,
        accessoriesSettled: accessoriesSettledTotal,
        totalPendingDues: moneyTransferPendingTotal + accessoriesPendingTotal,
      },
    };
  };

  const handleSendMessage = async (userText?: string) => {
    const textToSend = (userText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          shopContext: getLiveShopContext(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'I could not process the response.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Unable to complete request:** ${err.message || 'Network error'}.\n\nPlease ensure the server is active and retry.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        role: 'assistant',
        content: `Chat session reset. Real-time data for **${shopName}** is synchronized. How may I assist your counter operations?`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestionChips = [
    { label: '📊 Today Profit Summary', prompt: 'Provide a breakdown of today profit, top earning service, and total volume.' },
    { label: '⚠️ Distributor Pending Dues', prompt: 'List all pending distributor payments and tell me which ones are urgent to clear.' },
    { label: '🇳🇵 Indo-Nepal Margin Tips', prompt: 'How do Indo-Nepal remittances compare with domestic DMT, and how can I maximize retail profit with it?' },
    { label: '💵 Audit Cash Vault Variance', prompt: 'Check my physical cash drawer versus system book cash and report if there is any shortage or surplus.' },
    { label: '🧾 Accessory Warranty Terms', prompt: 'Draft a short, legally sound computer-generated warranty notice for fast chargers and cables.' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded ? 'w-full h-[96vh] max-w-5xl' : 'w-full h-[85vh] max-w-2xl'
        }`}
      >
        {/* Chatbot Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Om Copilot AI</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Retail Fintech Accountant & Shop Operations Advisor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand full-width'}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Banner */}
        <div className="px-5 py-2 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto">
          <div className="flex items-center gap-4 whitespace-nowrap font-mono">
            <span>
              Transactions Today: <strong className="text-slate-900 dark:text-slate-100">{transactions.length}</strong>
            </span>
            <span>·</span>
            <span>
              Vault Cash: <strong className="text-indigo-700 dark:text-indigo-300">{formatIndianCurrency(totalPhysicalCash)}</strong>
            </span>
            <span>·</span>
            <span>
              Pending Dues: <strong className="text-amber-700 dark:text-amber-300">{formatIndianCurrency(moneyTransferPendingTotal + accessoriesPendingTotal)}</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
            Live Synchronized
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Message Content with basic Markdown formatting */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? (
                          <strong key={cIdx} className="font-bold text-slate-950 dark:text-white">
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </p>
                  ))}
                </div>

                <div
                  className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                    msg.role === 'user'
                      ? 'border-indigo-500/40 text-indigo-200'
                      : 'border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                  Analyzing shop financial records...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(chip.prompt)}
              className="text-[11px] font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-colors shrink-0 disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Om Copilot about profit, ledger discrepancies, distributor dues, or customer bills..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
