/**
 * Agent Cash-Out & Physical Counter Component
 * Relocated from active codebase to archive-offline-features/agent-network/
 */

import React, { useState, useEffect } from 'react';
import type { PhysicalAgentLocation } from './agent_network_service';

export function AgentCashOutScreen({ onBack }: { onBack?: () => void }) {
  const [agents] = useState<PhysicalAgentLocation[]>([
    {
      code: 'AGT-SIT-001',
      name: 'U Ba Thein Agent Counter',
      nameMm: 'ဦးဘသိန်း အေးဂျင့်ဆိုင်',
      township: 'Sittwe',
      townshipMm: 'စစ်တွေမြို့',
      distanceKm: 0.8,
      distanceLabel: '0.8 km',
      phone: '+95 9 420 111 222',
      floatStatus: 'High',
      floatStatusMm: 'ငွေသားအလုံအလောက်ရှိ',
      cashReserveAkd: 85000,
      isOpen: true,
      commissionBps: 150,
    },
    {
      code: 'AGT-MRA-002',
      name: 'Mrauk-U Royal Cash Hub',
      nameMm: 'မြောက်ဦးတော်ဝင် ငွေသားထုတ်ကောင်တာ',
      township: 'Mrauk-U',
      townshipMm: 'မြောက်ဦးမြို့',
      distanceKm: 2.4,
      distanceLabel: '2.4 km',
      phone: '+95 9 790 333 444',
      floatStatus: 'Medium',
      floatStatusMm: 'ငွေသားသင့်တင့်စွာရှိ',
      cashReserveAkd: 25000,
      isOpen: true,
      commissionBps: 150,
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState<PhysicalAgentLocation | null>(null);
  const [dynamicOtp, setDynamicOtp] = useState('719 402');
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    let timer: any;
    if (selectedAgent) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setDynamicOtp(
              Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(100 + Math.random() * 900)
            );
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedAgent]);

  return (
    <div className="p-6 max-w-md mx-auto space-y-4 bg-slate-900 text-white rounded-3xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold">Physical Agent Cash-Out</h2>
        {onBack && (
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-white">
            Back
          </button>
        )}
      </div>

      {!selectedAgent ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Select an authorized Arakan cash-out branch counter to generate a secure TOTP code.
          </p>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.code}
                onClick={() => setSelectedAgent(agent)}
                className="w-full p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{agent.name}</div>
                  <div className="text-[10px] text-slate-400">{agent.code} · {agent.township}</div>
                  <div className="text-[9px] text-amber-400 font-mono mt-0.5">
                    {agent.distanceLabel} · {agent.floatStatus} Cash Float
                  </div>
                </div>
                <span className="text-xs text-slate-400">Select →</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30">
          <div>
            <div className="text-xs font-bold">{selectedAgent.name}</div>
            <div className="text-[10px] text-slate-400">{selectedAgent.code} · {selectedAgent.township}</div>
          </div>

          <div className="py-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">One-Time Cash-Out Code</div>
            <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1">{dynamicOtp}</div>
            <div className="text-[10px] text-slate-400 mt-1">Expires in {secondsLeft}s</div>
          </div>

          <div className="p-3 bg-white rounded-xl inline-block">
            <div className="text-black text-xs font-mono p-2">
              [QR: pethar://cashout?agent={selectedAgent.code}&totp={dynamicOtp}]
            </div>
          </div>

          <button
            onClick={() => setSelectedAgent(null)}
            className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white"
          >
            Change Counter
          </button>
        </div>
      )}
    </div>
  );
}

export default AgentCashOutScreen;
