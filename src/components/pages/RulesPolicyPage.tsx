import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  RefreshCcw, 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Send 
} from 'lucide-react';
import { storage } from '../../lib/storage';

export const RulesPolicyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'REFUND' | 'TERMS' | 'SUPPORT'>('RULES');
  const settings = storage.getSiteSettings();

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#FF6A00]" />
          Tournament Rules, Fair Play & Refund Policy
        </h1>
        <p className="text-xs text-zinc-400">
          Official compliance guidelines, anti-cheat enforcement, and 100% money-back guarantee terms
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'RULES'
              ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Match & Anti-Cheat Rules
        </button>
        <button
          onClick={() => setActiveTab('REFUND')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'REFUND'
              ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          100% Refund Policy
        </button>
        <button
          onClick={() => setActiveTab('TERMS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'TERMS'
              ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('SUPPORT')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'SUPPORT'
              ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Customer Support
        </button>
      </div>

      {/* Tab 1: Rules */}
      {activeTab === 'RULES' && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-2xl p-6 sm:p-8 cut-corner space-y-4">
          <h2 className="font-display text-lg font-bold uppercase text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Official Free Fire Match Regulations
          </h2>
          <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
            {settings.rulesContent}
          </div>
        </div>
      )}

      {/* Tab 2: Refund Policy */}
      {activeTab === 'REFUND' && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-2xl p-6 sm:p-8 cut-corner space-y-4">
          <h2 className="font-display text-lg font-bold uppercase text-white flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-cyan-400" />
            100% Entry Fee Refund Policy
          </h2>
          <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
            {settings.refundPolicyContent}
          </div>
        </div>
      )}

      {/* Tab 3: Terms */}
      {activeTab === 'TERMS' && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-2xl p-6 sm:p-8 cut-corner space-y-4">
          <h2 className="font-display text-lg font-bold uppercase text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FFC107]" />
            Terms of Service & Age Restrictions
          </h2>
          <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
            {settings.termsContent}
          </div>
        </div>
      )}

      {/* Tab 4: Support */}
      {activeTab === 'SUPPORT' && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-2xl p-6 sm:p-8 cut-corner space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold uppercase text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#FF6A00]" />
              Need Assistance with Payments or Custom Room IDs?
            </h2>
            <p className="text-xs text-zinc-400">
              Our Bangladesh tournament moderation team responds within 5 to 15 minutes during match windows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href={settings.supportWhatsapp}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl flex items-center gap-3 hover:bg-emerald-950/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">WhatsApp Support</span>
                <span className="text-[11px] text-emerald-400">Instant Chat</span>
              </div>
            </a>

            <a
              href={settings.supportTelegram}
              target="_blank"
              rel="noreferrer"
              className="bg-cyan-950/30 border border-cyan-500/40 p-4 rounded-xl flex items-center gap-3 hover:bg-cyan-950/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Telegram Channel</span>
                <span className="text-[11px] text-cyan-400">Match Alerts & Rooms</span>
              </div>
            </a>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Admin Helpline</span>
                <span className="text-[11px] text-amber-400 font-mono">{settings.supportPhone}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
