import React, { useState } from 'react'
import {
  Send,
  Smartphone,
  Wallet,
  Search,
  Radio,
} from 'lucide-react'
import type { ChatMessage } from '../../pages/DashboardPage'

interface AdminOpenDeskProps {
  messages: ChatMessage[]
  onSendMessage: (text?: string) => void
  replyText: string
  setReplyText: (text: string) => void
  channelFilter: 'all' | 'mobilewallet' | 'android'
  setChannelFilter: (ch: 'all' | 'mobilewallet' | 'android') => void
  onSimulateAndroidMsg: () => void
  onSimulateWalletMsg: () => void
  isDarkMode: boolean
}

export const AdminOpenDesk: React.FC<AdminOpenDeskProps> = ({
  messages,
  onSendMessage,
  replyText,
  setReplyText,
  channelFilter,
  setChannelFilter,
  onSimulateAndroidMsg,
  onSimulateWalletMsg,
  isDarkMode,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>('primary-thread')
  const [search, setSearch] = useState('')

  const cannedReplies = [
    'Your transaction hash is verified on the Arakan ledger.',
    'Please submit your Tier-2 National ID for review.',
    'Offline BLE mesh rail is active in your township.',
    'Your ticket has been marked as resolved.',
  ]

  const filteredMessages = messages.filter(
    (m) => channelFilter === 'all' || m.channel === channelFilter
  )

  return (
    <div className="space-y-4">
      {/* OpenDesk Header Bar with Quick Simulation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-bold">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>OpenDesk Triage</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
                OPERATIONAL
              </span>
            </h2>
            <div className="text-[11px] text-slate-400 font-mono">
              Live dual-rail dispatcher • Native Android APK & Web Wallet
            </div>
          </div>
        </div>

        {/* Action Buttons to simulate messages */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateAndroidMsg}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Smartphone size={13} />
            <span>+ Sim Android Msg</span>
          </button>

          <button
            onClick={onSimulateWalletMsg}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Wallet size={13} />
            <span>+ Sim Web Msg</span>
          </button>
        </div>
      </div>

      {/* OpenDesk Split-Pane Container */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[560px] max-h-[720px] transition-all ${
          isDarkMode ? 'bg-zinc-950 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        {/* Left Column: Triage Queue & Channels (4 cols on lg) */}
        <div
          className={`lg:col-span-4 border-r flex flex-col ${
            isDarkMode ? 'border-white/10 bg-zinc-900/50' : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          {/* Channel Selector Pills */}
          <div
            className={`p-3 border-b flex items-center gap-1 text-xs font-mono font-bold ${
              isDarkMode ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            {(['all', 'android', 'mobilewallet'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer ${
                  channelFilter === ch
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ch === 'all' ? 'All' : ch === 'android' ? 'Android' : 'Web'}
              </button>
            ))}
          </div>

          {/* Quick Filter */}
          <div className="p-2.5 border-b border-inherit">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket or user..."
                className={`w-full pl-7 pr-2.5 py-1.5 rounded-lg text-xs font-medium border transition focus:outline-none focus:border-[#FF6B00] ${
                  isDarkMode
                    ? 'bg-zinc-900/80 border-white/10 text-white placeholder-zinc-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex-1 overflow-y-auto divide-y divide-inherit">
            <div
              onClick={() => setSelectedTicketId('primary-thread')}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                selectedTicketId === 'primary-thread'
                  ? isDarkMode
                    ? 'bg-zinc-800/80 border-l-2 border-[#FF6B00]'
                    : 'bg-white shadow-xs border-l-2 border-[#FF6B00]'
                  : isDarkMode
                  ? 'hover:bg-zinc-800/40'
                  : 'hover:bg-slate-100/70'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white font-black text-xs flex items-center justify-center">
                  C
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    Active Support Dispatch
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Now</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {messages[messages.length - 1]?.text || 'No messages yet'}
                </div>
                <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px]">
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">
                    LIVE
                  </span>
                  <span className="text-slate-400">
                    {filteredMessages.length} msgs
                  </span>
                </div>
              </div>
            </div>

            {/* Offline Node Peer Ticket */}
            <div
              className={`p-3.5 flex items-start gap-3 opacity-75 hover:opacity-100 cursor-pointer transition ${
                isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-100/70'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-black text-xs flex items-center justify-center shrink-0">
                M
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs truncate">Maung Kyaw Hla</span>
                  <span className="text-[10px] font-mono text-slate-400">12m</span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Offline QR signed slip synced to Sittwe Gateway node
                </div>
                <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px]">
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-500 font-bold">
                    SYNCED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Conversation (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {/* Desk Conversation Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between ${
              isDarkMode ? 'border-white/10 bg-zinc-900/40' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-xs text-slate-900 dark:text-white">
                    Citizen Dispatch Stream
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#FF6B00]/10 text-[#FF6B00]">
                    ROOT-01
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Listening to all client events • Sittwe Node 01
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 text-[10px]">
                ENCRYPTED
              </span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3 ${
              isDarkMode ? 'bg-zinc-950/60' : 'bg-slate-50/50'
            }`}
          >
            {filteredMessages.map((msg) => {
              const isOperator = msg.sender === 'operator'
              const isAndroid = msg.channel === 'android'
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOperator ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs transition-all ${
                      isOperator
                        ? 'bg-[#FF6B00] text-white rounded-br-xs font-medium'
                        : isDarkMode
                        ? 'bg-zinc-900 border border-white/10 text-white rounded-bl-xs'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-80 font-mono gap-3">
                      <span className="font-bold flex items-center gap-1">
                        {isOperator ? (
                          '🛡️ Admin Operator'
                        ) : isAndroid ? (
                          <span className="text-emerald-400 font-bold">📱 Android Client</span>
                        ) : (
                          <span className="text-blue-400 font-bold">💼 Web Wallet</span>
                        )}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Canned Quick Responses (OpenDesk style) */}
          <div
            className={`px-3 py-2 border-t flex flex-wrap items-center gap-1.5 text-[11px] font-mono ${
              isDarkMode ? 'border-white/10 bg-zinc-900/40' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Quick:</span>
            {cannedReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(reply)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                + {reply.slice(0, 24)}...
              </button>
            ))}
          </div>

          {/* Reply Input Bar */}
          <div
            className={`p-3 border-t flex items-center gap-2 ${
              isDarkMode ? 'border-white/10 bg-zinc-900/60' : 'border-slate-200 bg-white'
            }`}
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              placeholder="Send response to citizen..."
              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition focus:outline-none focus:border-[#FF6B00] ${
                isDarkMode
                  ? 'bg-zinc-950 border-white/10 text-white placeholder-zinc-500'
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              onClick={() => onSendMessage()}
              className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <Send size={13} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
