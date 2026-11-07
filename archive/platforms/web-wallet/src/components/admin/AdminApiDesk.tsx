import React from 'react'
import { Terminal, Play, Copy, Check, Zap, ShieldCheck, Globe2 } from 'lucide-react'
import type { ApiEndpointItem } from '../../pages/DashboardPage'
import {
  DeskHeader,
  Panel,
  StatCard,
  StatusPill,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminApiDeskProps {
  apiEndpoints: ApiEndpointItem[]
  activeApiEndpoint: ApiEndpointItem
  setActiveApiEndpoint: (ep: ApiEndpointItem) => void
  apiSimulating: boolean
  onTestEndpoint: () => void
  copiedApiJson: boolean
  onCopyJson: () => void
  isDarkMode: boolean
}

export const AdminApiDesk: React.FC<AdminApiDeskProps> = ({
  apiEndpoints,
  activeApiEndpoint,
  setActiveApiEndpoint,
  apiSimulating,
  onTestEndpoint,
  copiedApiJson,
  onCopyJson,
  isDarkMode,
}) => {
  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Platform · Developer"
        title="API Gateway"
        description="Inspect and execute settlement endpoints. Requests are signed, rate-limited and verified against the ledger consensus layer."
        isDarkMode={isDarkMode}
        actions={
          <>
            <StatusPill tone="emerald" dot>
              99.995% uptime
            </StatusPill>
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold',
                isDarkMode
                  ? 'border-white/[0.07] bg-white/[0.03] text-slate-400'
                  : 'border-slate-200 bg-white text-slate-500',
              )}
            >
              <Zap size={13} className="text-indigo-500" />
              1,000 req/s
            </div>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Gateway status"
          value="Operational"
          hint="All regional edges healthy"
          icon={<Globe2 size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Median latency"
          value="84 ms"
          hint="p50 across all endpoints"
          icon={<Zap size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Signature checks"
          value="100%"
          hint="Ed25519 zero-knowledge"
          icon={<ShieldCheck size={15} />}
          tone="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Registered routes"
          value={apiEndpoints.length}
          hint="Versioned and documented"
          icon={<Terminal size={15} />}
          tone="indigo"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Panel
          isDarkMode={isDarkMode}
          className="xl:col-span-4"
          bodyClassName="p-0"
          title="Registered endpoints"
          description="Select a route to load the console."
        >
          <div className={cn('divide-y', isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-100')}>
            {apiEndpoints.map((endpoint) => {
              const isActive = activeApiEndpoint.id === endpoint.id
              return (
                <button
                  key={endpoint.id}
                  type="button"
                  onClick={() => setActiveApiEndpoint(endpoint)}
                  className={cn(
                    'w-full px-4 py-3.5 text-left transition',
                    isActive
                      ? isDarkMode
                        ? 'bg-indigo-500/[0.08]'
                        : 'bg-indigo-50/70'
                      : isDarkMode
                        ? 'hover:bg-white/[0.025]'
                        : 'hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold',
                        endpoint.method === 'POST'
                          ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                      )}
                    >
                      {endpoint.method}
                    </span>
                    <span className={cn('truncate font-mono text-[11px] font-bold', adminText(isDarkMode))}>
                      {endpoint.path}
                    </span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <div className={cn('mt-1 line-clamp-1 text-[10px]', adminMuted(isDarkMode))}>
                    {endpoint.description}
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070B13] shadow-2xl xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] bg-[#0A101C] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-indigo-400">
                <Terminal size={12} />
              </span>
              <span className="truncate font-mono text-[11px] text-slate-300">
                https://api.pethar.co.uk{activeApiEndpoint.path}
              </span>
            </div>
            <button
              type="button"
              onClick={onTestEndpoint}
              disabled={apiSimulating}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-500 px-3.5 py-2 font-mono text-[10px] font-bold text-white transition hover:bg-indigo-600 active:scale-95 disabled:opacity-60"
            >
              <Play size={12} />
              {apiSimulating ? 'Executing…' : 'Execute'}
            </button>
          </div>

          {activeApiEndpoint.requestBody && (
            <div className="border-b border-white/[0.06] p-4">
              <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Request JSON
              </div>
              <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#05090F] p-3 font-mono text-[11px] leading-relaxed text-slate-300">
                {activeApiEndpoint.requestBody}
              </pre>
            </div>
          )}

          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                200 OK
                <span className="text-slate-600">·</span>
                <span className="text-slate-500">{activeApiEndpoint.latency}</span>
              </div>
              <button
                type="button"
                onClick={onCopyJson}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
                title="Copy response JSON"
              >
                {copiedApiJson ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
            <pre className="max-h-[340px] overflow-auto rounded-xl border border-white/[0.06] bg-[#05090F] p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
              {activeApiEndpoint.responseBody}
            </pre>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 font-mono text-[9px] text-slate-500">
            <span>Auth · Bearer token + Ed25519 signature</span>
            <span>Region · ap-southeast-1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
