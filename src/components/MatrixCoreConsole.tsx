import React, { useState, useEffect } from 'react';
import { Cpu, Activity, ShieldCheck, Play, Pause, Terminal, Layers, Radio, Lock } from 'lucide-react';
import { SwarmAgent, TerminalLog } from '../types';
import { sound } from '../utils/audio';

interface MatrixCoreConsoleProps {
  agents: SwarmAgent[];
  setAgents: React.Dispatch<React.SetStateAction<SwarmAgent[]>>;
  logs: TerminalLog[];
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
}

export const MatrixCoreConsole: React.FC<MatrixCoreConsoleProps> = ({
  agents,
  setAgents,
  logs,
  addLog,
}) => {
  const [swarmActive, setSwarmActive] = useState(true);

  // Live microtask increment simulation
  useEffect(() => {
    if (!swarmActive) return;

    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => {
          if (Math.random() > 0.4) {
            return {
              ...agent,
              microtaskCount: agent.microtaskCount + Math.floor(Math.random() * 5 + 1),
              lastActive: 'Just now'
            };
          }
          return agent;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [swarmActive, setAgents]);

  const toggleSwarm = () => {
    sound.playClick();
    const next = !swarmActive;
    setSwarmActive(next);
    addLog({
      level: 'MATRIXCORE',
      message: `SWARM COROUTINE PIPELINE ${next ? 'RESUMED' : 'PAUSED'}`,
      details: next ? 'Dispatchers.IO active for all Swarm Agents.' : 'All coroutine tasks halted by Arbiter.'
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* MatrixCore Kernel Banner */}
      <div className="bg-zinc-950 border-2 border-emerald-500 p-5 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-400">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wider uppercase">
                  MATRIXCORE KERNEL
                </h2>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-bold">
                  IMMUTABLE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                SINGLETON STATE COORDINATOR &bull; COROUTINES DISPATCHER.IO &bull; LOGIC VALIDATION
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSwarm}
              id="btn-toggle-swarm"
              className={`px-4 py-2.5 border font-bold text-xs uppercase flex items-center gap-2 transition-all ${
                swarmActive
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {swarmActive ? (
                <>
                  <Pause className="w-4 h-4" /> PAUSE SWARM COROUTINES
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> RESUME SWARM COROUTINES
                </>
              )}
            </button>
          </div>
        </div>

        {/* Realtime Kernel Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Dispatcher Scope</span>
            <span className="text-white font-bold text-sm">Dispatchers.IO</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Swarm Coroutines</span>
            <span className="text-emerald-400 font-bold text-sm">{agents.length} Active Agents</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Kernel Lock Status</span>
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> PROTECTED
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3">
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Total Micro-Tasks</span>
            <span className="text-cyan-400 font-bold text-sm">
              {agents.reduce((acc, a) => acc + a.microtaskCount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Coroutine Swarm Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swarm Agents List */}
        <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              SWARM AGENT COROUTINES
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold">
              ONE MICRO-TASK PER AGENT
            </span>
          </div>

          <div className="space-y-3">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="p-3 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-sm font-bold text-white">{agent.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {agent.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">Micro-tasks: <strong className="text-emerald-400">{agent.microtaskCount}</strong></span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500 uppercase font-bold">
                      {agent.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 bg-black/60 p-2 border border-zinc-800 font-mono">
                  Task: <span className="text-amber-300">{agent.currentTask}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime Terminal Log Feed */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              LIVE TELEMETRY LOGS
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold">
              COROUTINES LOGS
            </span>
          </div>

          <div className="bg-black border border-zinc-800 p-3 h-80 overflow-y-auto space-y-2 text-[11px] font-mono scrollbar-thin">
            {logs.map(log => (
              <div key={log.id} className="border-b border-zinc-900/80 pb-1.5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">[{log.timestamp}]</span>
                  <span
                    className={`font-bold ${
                      log.level === 'MATRIXCORE'
                        ? 'text-emerald-400'
                        : log.level === 'SECURITY'
                        ? 'text-cyan-400'
                        : log.level === 'EVALUATEOR'
                        ? 'text-amber-400'
                        : log.level === 'MUTATION'
                        ? 'text-purple-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                </div>
                <p className="text-zinc-200 mt-0.5">{log.message}</p>
                {log.details && (
                  <p className="text-[10px] text-zinc-500 mt-0.5 italic">{log.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
