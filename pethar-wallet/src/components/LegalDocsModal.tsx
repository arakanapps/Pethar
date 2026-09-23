import React, { useState } from 'react'
import {
  FileText, Shield, HelpCircle, TrendingUp, X,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import { legalDocs, liveFxRates } from '../data'
import { ArakanEmblem } from './ArakanEmblem'
import type { Language } from '../i18n'
import { translations } from '../i18n'

interface LegalDocsModalProps {
  lang: Language
  initialDoc?: 'terms' | 'privacy' | 'guidelines' | 'fx'
  onClose: () => void
}

export const LegalDocsModal: React.FC<LegalDocsModalProps> = ({
  lang,
  initialDoc = 'terms',
  onClose,
}) => {
  const t = translations[lang]
  const [activeDoc, setActiveDoc] = useState<'terms' | 'privacy' | 'guidelines' | 'fx'>(initialDoc)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0B0F17] border border-[#283852] shadow-2xl overflow-hidden text-white">
        {/* Modal Top Bar */}
        <div className="p-4 bg-gradient-to-r from-[#2B0A0D] to-[#121A28] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ArakanEmblem size={28} variant="badge" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {lang === 'arak' ? 'အာရက္ခ တရားဝင် ဥပဒေနှင့် မူဝါဒများ' : 'Arakan Sovereign Legal & Compliance'}
              </h2>
              <div className="text-[10px] text-amber-300">
                Arakan Digital Financial Regulatory Authority
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-black/40 border-b border-white/5 text-[11px] font-semibold">
          <button
            onClick={() => setActiveDoc('terms')}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeDoc === 'terms'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span className="truncate">{lang === 'arak' ? 'စည်းမျဉ်းများ' : 'Terms'}</span>
          </button>
          <button
            onClick={() => setActiveDoc('privacy')}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeDoc === 'privacy'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={13} />
            <span className="truncate">{lang === 'arak' ? 'ကိုယ်ရေးလုံခြုံမှု' : 'Privacy'}</span>
          </button>
          <button
            onClick={() => setActiveDoc('guidelines')}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeDoc === 'guidelines'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle size={13} />
            <span className="truncate">{lang === 'arak' ? 'လမ်းညွှန်ချက်' : 'Guidelines'}</span>
          </button>
          <button
            onClick={() => setActiveDoc('fx')}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeDoc === 'fx'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={13} />
            <span className="truncate">{lang === 'arak' ? 'ငွေလဲနှုန်း' : 'FX Board'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* TERMS */}
          {activeDoc === 'terms' && (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'arak' ? legalDocs.terms.titleMm : legalDocs.terms.titleEn}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Revision 2026.09 · Sovereign Legal Code of Arakan Nation
                </p>
              </div>

              {legalDocs.terms.sections.map((sec, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#131B26] border border-white/5 space-y-1.5">
                  <h4 className="font-bold text-amber-400 text-xs">
                    {lang === 'arak' ? sec.hMm : sec.hEn}
                  </h4>
                  <p className="text-gray-300 text-xs">
                    {lang === 'arak' ? sec.pMm : sec.pEn}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* PRIVACY */}
          {activeDoc === 'privacy' && (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'arak' ? legalDocs.privacy.titleMm : legalDocs.privacy.titleEn}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Zero-Surveillance Standard · Encrypted Enclave Architecture
                </p>
              </div>

              {legalDocs.privacy.sections.map((sec, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#131B26] border border-white/5 space-y-1.5">
                  <h4 className="font-bold text-amber-400 text-xs">
                    {lang === 'arak' ? sec.hMm : sec.hEn}
                  </h4>
                  <p className="text-gray-300 text-xs">
                    {lang === 'arak' ? sec.pMm : sec.pEn}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* GUIDELINES */}
          {activeDoc === 'guidelines' && (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'arak' ? legalDocs.guidelines.titleMm : legalDocs.guidelines.titleEn}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  How to prevent scams, verify agents, and use offline vouchers
                </p>
              </div>

              {legalDocs.guidelines.sections.map((sec, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#131B26] border border-white/5 space-y-1.5">
                  <h4 className="font-bold text-amber-400 text-xs">
                    {lang === 'arak' ? sec.hMm : sec.hEn}
                  </h4>
                  <p className="text-gray-300 text-xs">
                    {lang === 'arak' ? sec.pMm : sec.pEn}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* FX SPECIAL RATES BOARD */}
          {activeDoc === 'fx' && (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'arak' ? 'အာရက္ခဒေါ်လာ တရားဝင်ငွေလဲနှုန်း ဘုတ်' : 'Official Arakan FX Rates Board'}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Live rates updated every 60s · 0% Sovereign Markup
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>

              <div className="space-y-2">
                {liveFxRates.map((item) => (
                  <div
                    key={item.pair}
                    className="p-3 rounded-2xl bg-[#131B26] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{item.pair}</div>
                      <div className="text-[10px] text-gray-400">
                        {lang === 'arak' ? item.nameMm : item.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-white">
                        {item.rate >= 1000 ? item.rate.toLocaleString() : item.rate.toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-mono flex items-center justify-end gap-0.5 ${
                          item.trend === 'up'
                            ? 'text-emerald-400'
                            : item.trend === 'down'
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {item.trend === 'up' && <ArrowUpRight size={12} />}
                        {item.trend === 'down' && <ArrowDownRight size={12} />}
                        {item.trend === 'flat' && <Minus size={12} />}
                        <span>{item.change24h}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>{t.legalRegulatory}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
          >
            {lang === 'arak' ? 'နားလည်သဘောတူပါသည်' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  )
}
