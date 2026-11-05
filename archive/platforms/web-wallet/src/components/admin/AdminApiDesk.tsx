import React from 'react'
import { Terminal, Play, Copy, Check } from 'lucide-react'
import type { ApiEndpointItem } from '../../pages/DashboardPage'

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
    <div className="space-y-4">
      {/* Top SLA Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal size={18} className="text-[#FF6B00]" />
            <span>Developer Gateway & REST APIs</span>
          </h2>
          <div className="text-[11px] text-slate-400 font-mono">
            High-availability settlement gateway with zero-knowledge cryptographic signature verification
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
            99.995% Uptime SLA
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] font-bold border border-[#FF6B00]/20">
            1,000 req/s
          </span>
        </div>
      </div>

      {/* Grid: Endpoints Selector & Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Endpoints List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            Registered Endpoints
          </div>
          {apiEndpoints.map((ep) => {
            const isActive = activeApiEndpoint.id === ep.id
            return (
              <button
                key={ep.id}
                onClick={() => setActiveApiEndpoint(ep)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? isDarkMode
                      ? 'bg-zinc-800 border-[#FF6B00] shadow-sm'
                      : 'bg-orange-50/50 border-[#FF6B00] shadow-sm'
                    : isDarkMode
                    ? 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/60'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'POST'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold truncate text-slate-900 dark:text-white">
                    {ep.path}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{ep.description}</div>
              </button>
            )
          })}
        </div>

        {/* Execution Playground (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-zinc-950 text-zinc-200 border border-white/10 shadow-xl overflow-hidden font-mono text-xs">
          {/* Header */}
          <div className="p-3.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
            <span className="text-white font-bold truncate pr-2">
              https://api.pethar.co.uk{activeApiEndpoint.path}
            </span>
            <button
              onClick={onTestEndpoint}
              disabled={apiSimulating}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 shrink-0"
            >
              <Play size={12} />
              <span>{apiSimulating ? 'Executing...' : 'Execute'}</span>
            </button>
          </div>

          {/* Request Body */}
          {activeApiEndpoint.requestBody && (
            <div className="p-3.5 border-b border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Request JSON</span>
              <pre className="p-3 rounded-xl bg-zinc-900/50 text-zinc-300 overflow-x-auto text-[11px]">
                {activeApiEndpoint.requestBody}
              </pre>
            </div>
          )}

          {/* Response Body */}
          <div className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[10px] font-bold uppercase">
                Response (200 OK • {activeApiEndpoint.latency})
              </span>
              <button
                onClick={onCopyJson}
                className="text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {copiedApiJson ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-zinc-900/90 text-emerald-400 overflow-x-auto text-[11px]">
              {activeApiEndpoint.responseBody}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
