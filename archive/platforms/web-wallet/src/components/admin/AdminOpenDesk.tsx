import React, { useMemo, useState } from 'react'
import {
  Send,
  Smartphone,
  Wallet,
  Search,
  Radio,
  MessageSquare,
  ShieldCheck,
  Inbox,
} from 'lucide-react'
import type { ChatMessage } from '../../pages/DashboardPage'
import {
  Avatar,
  DeskHeader,
  EmptyState,
  Panel,
  StatusPill,
  adminInput,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

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
  const [search, setSearch] = useState('')

  const cannedReplies = [
    'Your transaction hash is verified on the Arakan ledger.',
    'Please submit your Tier-2 National ID for review.',
    'Offline BLE mesh rail is active in your township.',
    'Your ticket has been marked as resolved.',
  ]

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    return messages.filter((message) => {
      const matchesChannel = channelFilter === 'all' || message.channel === channelFilter
      const matchesSearch = !query || message.text.toLowerCase().includes(query)
      return matchesChannel && matchesSearch
    })
  }, [channelFilter, messages, search])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Operations · Support"
        title="Customer Desk"
        description="Live dual-rail dispatch across the Android app and web wallet. Triage conversations, reply with verified context and close tickets."
        isDarkMode={isDarkMode}
        actions={
          <>
            <button
              type="button"
              onClick={onSimulateAndroidMsg}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold transition active:scale-95',
                isDarkMode
                  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
              )}
            >
              <Smartphone size={13} />
              Simulate Android
            </button>
            <button
              type="button"
              onClick={onSimulateWalletMsg}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold transition active:scale-95',
                isDarkMode
                  ? 'border-sky-400/20 bg-sky-400/10 text-sky-300 hover:bg-sky-400/15'
                  : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
              )}
            >
              <Wallet size={13} />
              Simulate Web
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel
          isDarkMode={isDarkMode}
          className="xl:col-span-4"
          bodyClassName="p-0"
          title="Inbox"
          description="Open conversations by channel"
          actions={<StatusPill tone="emerald" dot>Live</StatusPill>}
        >
          <div
            className={cn(
              'flex items-center gap-1 border-b px-3 py-2.5',
              isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
            )}
          >
            {(['all', 'android', 'mobilewallet'] as const).map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => setChannelFilter(channel)}
                className={cn(
                  'flex-1 rounded-lg px-2 py-1.5 font-mono text-[10px] font-bold transition',
                  channelFilter === channel
                    ? 'bg-orange-500 text-white shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {channel === 'all' ? 'All' : channel === 'android' ? 'Android' : 'Web'}
              </button>
            ))}
          </div>

          <div className={cn('border-b p-3', isDarkMode ? 'border-white/[0.06]' : 'border-slate-100')}>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversation…"
                className={cn(
                  'w-full rounded-xl border py-2 pl-7 pr-2.5 text-[11px] font-medium outline-none transition',
                  adminInput(isDarkMode),
                )}
              />
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto">
            <div
              className={cn(
                'flex items-start gap-3 border-l-2 border-orange-500 px-3.5 py-3.5',
                isDarkMode ? 'bg-white/[0.03]' : 'bg-orange-50/50',
              )}
            >
              <div className="relative shrink-0">
                <Avatar label="C" tone="amber" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0C1424]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('truncate text-xs font-bold', adminText(isDarkMode))}>
                    Active support thread
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">Now</span>
                </div>
                <div className={cn('mt-0.5 truncate text-[11px]', adminMuted(isDarkMode))}>
                  {messages[messages.length - 1]?.text || 'No messages yet'}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusPill tone="emerald" dot>
                    Live
                  </StatusPill>
                  <span className={cn('font-mono text-[9px]', adminMuted(isDarkMode))}>
                    {filteredMessages.length} messages
                  </span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                'flex items-start gap-3 px-3.5 py-3.5 opacity-70 transition hover:opacity-100',
                isDarkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50',
              )}
            >
              <Avatar label="M" tone="slate" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('truncate text-xs font-bold', adminText(isDarkMode))}>
                    Offline QR sync
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">12m</span>
                </div>
                <div className={cn('mt-0.5 truncate text-[11px]', adminMuted(isDarkMode))}>
                  Signed slip synced to Sittwe gateway node
                </div>
                <div className="mt-1.5">
                  <StatusPill tone="blue">Synced</StatusPill>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          isDarkMode={isDarkMode}
          className="xl:col-span-8"
          bodyClassName="p-0"
          title={
            <span className="flex items-center gap-2">
              <Radio size={14} className="text-orange-500" />
              Conversation
            </span>
          }
          description="All client events · Sittwe node 01"
          actions={<StatusPill tone="emerald" dot>Encrypted</StatusPill>}
        >
          <div className="flex h-[540px] flex-col">
            <div
              className={cn(
                'flex-1 space-y-3 overflow-y-auto p-4',
                isDarkMode ? 'bg-[#080E1A]/60' : 'bg-slate-50/50',
              )}
            >
              {filteredMessages.length === 0 ? (
                <EmptyState
                  isDarkMode={isDarkMode}
                  icon={<Inbox size={20} />}
                  title="No messages in this view"
                  description="Change the channel filter or clear your search."
                />
              ) : (
                filteredMessages.map((message) => {
                  const isOperator = message.sender === 'operator'
                  const isAndroid = message.channel === 'android'
                  return (
                    <div
                      key={message.id}
                      className={cn('flex', isOperator ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-md space-y-1.5 rounded-2xl px-3.5 py-3 text-xs shadow-sm',
                          isOperator
                            ? 'rounded-br-md bg-orange-500 text-white'
                            : isDarkMode
                              ? 'rounded-bl-md border border-white/[0.07] bg-[#0C1424] text-slate-100'
                              : 'rounded-bl-md border border-slate-200 bg-white text-slate-900',
                        )}
                      >
                        <div className="flex items-center justify-between gap-4 font-mono text-[9px] opacity-75">
                          <span className="flex items-center gap-1 font-bold">
                            {isOperator ? (
                              <>
                                <ShieldCheck size={10} />
                                Operator
                              </>
                            ) : isAndroid ? (
                              <>
                                <Smartphone size={10} />
                                Android client
                              </>
                            ) : (
                              <>
                                <MessageSquare size={10} />
                                Web wallet
                              </>
                            )}
                          </span>
                          <span>{message.time}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div
              className={cn(
                'flex flex-wrap items-center gap-1.5 border-t px-3 py-2',
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
              )}
            >
              <span className={cn('mr-1 font-mono text-[9px] font-bold uppercase', adminMuted(isDarkMode))}>
                Quick replies
              </span>
              {cannedReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => onSendMessage(reply)}
                  className={cn(
                    'max-w-[190px] truncate rounded-lg border px-2 py-1 text-[10px] transition',
                    isDarkMode
                      ? 'border-white/[0.07] bg-white/[0.03] text-slate-400 hover:text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900',
                  )}
                >
                  {reply}
                </button>
              ))}
            </div>

            <div
              className={cn(
                'flex items-center gap-2 border-t p-3',
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
              )}
            >
              <input
                type="text"
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && onSendMessage()}
                placeholder="Write a reply to the customer…"
                className={cn(
                  'flex-1 rounded-xl border px-3.5 py-2.5 text-xs font-medium outline-none transition',
                  adminInput(isDarkMode),
                )}
              />
              <button
                type="button"
                onClick={() => onSendMessage()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
              >
                <Send size={13} />
                Send
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
