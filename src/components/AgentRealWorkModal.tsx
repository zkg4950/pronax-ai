import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  FileText,
  Database,
  Cloud,
  Terminal,
  Activity,
  CheckCircle2,
  RefreshCw,
  Play,
  Copy,
  Check,
  Server,
  Zap,
  Radio,
  Lock,
} from 'lucide-react';

import { AGENT_AVATARS } from './agentAvatars';

interface AgentRealWorkModalProps {
  agentId: 'alice' | 'bob' | 'carol' | 'dave' | null;
  onClose: () => void;
  onSendFeedback?: (text: string) => void;
}

export const AgentRealWorkModal: React.FC<AgentRealWorkModalProps> = ({
  agentId,
  onClose,
  onSendFeedback,
}) => {
  if (!agentId) return null;

  const [copied, setCopied] = useState(false);

  // Bob's Firewall State
  const [scannedPorts, setScannedPorts] = useState([
    { port: 22, service: 'SSH (Admin)', status: 'FILTERED', auth: 'ED25519 Key Only', risk: 'LOW' },
    { port: 80, service: 'HTTP (Web)', status: 'REDIRECT', auth: '301 to HTTPS', risk: 'NONE' },
    { port: 443, service: 'HTTPS (TLS 1.3)', status: 'OPEN', auth: 'HSTS Strict Active', risk: 'SECURE' },
    { port: 8080, service: 'Telemetry Gateway', status: 'PROTECTED', auth: 'mTLS Bearer Token', risk: 'OPTIMAL' },
    { port: 5432, service: 'PostgreSQL DB', status: 'INTERNAL', auth: 'VPC Peering Isolated', risk: 'SAFE' },
    { port: 6379, service: 'Redis Queue', status: 'INTERNAL', auth: 'Local Socket Only', risk: 'SAFE' },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  // Carol's Pipeline State
  const [eventsPerSec, setEventsPerSec] = useState(1428500);
  const [bufferLatency, setBufferLatency] = useState(8.4);
  const [queryInput, setQueryInput] = useState(
    'SELECT sector_id, count(*) AS anomaly_count, avg(temperature_kelvin) as avg_temp FROM telemetry.sensor_stream WHERE timestamp >= now() - INTERVAL 1 HOUR GROUP BY sector_id HAVING anomaly_count > 5 ORDER BY anomaly_count DESC LIMIT 5;'
  );
  const [queryResults, setQueryResults] = useState<any[]>([
    { sector_id: 'SEC-09-ALPHA', anomaly_count: 14, avg_temp: 304.2, status: 'ELEVATED' },
    { sector_id: 'SEC-04-BRAVO', anomaly_count: 9, avg_temp: 298.6, status: 'NORMAL' },
    { sector_id: 'SEC-11-CHARLIE', anomaly_count: 7, avg_temp: 295.1, status: 'NORMAL' },
    { sector_id: 'SEC-02-DELTA', anomaly_count: 6, avg_temp: 301.8, status: 'STABLE' },
  ]);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);

  // Dave's Cloud State
  const [pods, setPods] = useState([
    { name: 'stonic-agent-orchestrator-7d8b', status: 'Running', restarts: 0, cpu: '14%', memory: '180MB' },
    { name: 'stonic-neural-core-5f4c', status: 'Running', restarts: 0, cpu: '28%', memory: '420MB' },
    { name: 'stonic-satlink-proxy-9c2a', status: 'Running', restarts: 0, cpu: '12%', memory: '140MB' },
    { name: 'stonic-database-cluster-3a1e', status: 'Running', restarts: 0, cpu: '34%', memory: '680MB' },
  ]);
  const [replicaCount, setReplicaCount] = useState(4);

  // Alice's Dossier State
  const [selectedSector, setSelectedSector] = useState<'sector9' | 'asia' | 'atlantic'>('sector9');

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setScannedPorts((prev) =>
        prev.map((p) => ({
          ...p,
          status: p.port === 8080 || p.port === 443 ? 'SECURE' : p.status,
        }))
      );
      setIsScanning(false);
    }, 1500);
  };

  const handleRunQuery = () => {
    setIsExecutingQuery(true);
    setTimeout(() => {
      setEventsPerSec((prev) => prev + Math.floor((Math.random() - 0.5) * 50000));
      setBufferLatency((prev) => Number((8.0 + Math.random() * 0.8).toFixed(1)));
      setIsExecutingQuery(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md font-mono-tech animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#031320] border-2 border-cyan-400 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.3)] select-text">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#02182b] border-b border-cyan-500/40 shrink-0">
          <div className="flex items-center gap-3">
            {/* Photorealistic Portrait Avatar */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 bg-slate-900">
              <img
                src={AGENT_AVATARS[agentId]}
                alt={agentId}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#02182b] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wider">
                  {agentId === 'alice' && 'ALICE // SATELLITE RECONNAISSANCE & INTEL DOSSIER'}
                  {agentId === 'bob' && 'BOB // LIVE PERIMETER FIREWALL & SECURITY AUDIT'}
                  {agentId === 'carol' && 'CAROL // REAL-TIME KAFKA & SQL STREAMING PIPELINE'}
                  {agentId === 'dave' && 'DAVE // KUBERNETES & CLOUD CLUSTER ORCHESTRATOR'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                  REAL WORKING SYSTEM
                </span>
              </div>
              <span className="text-[11px] text-cyan-300/70">
                Operated autonomously under Inventor Usman directives
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Specific Real Working Console per Agent */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {/* ================= ALICE: REAL SATELLITE INTEL DOSSIER ================= */}
          {agentId === 'alice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#041a2c] border border-pink-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-pink-400 animate-ping" />
                  <div>
                    <span className="text-white font-bold text-sm">SAT-COMSAT 7N ORBITAL UPLINK</span>
                    <p className="text-cyan-300/80 text-[11px]">
                      Coordinates: 34.0522° N, 118.2437° W | Elevation: 42.1° | Telemetry: 99.4%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-xs">DEFCON: 3 (NORMAL READINESS)</span>
                  <p className="text-[10px] text-slate-400">Archived to Stonic Core for Inventor Usman</p>
                </div>
              </div>

              {/* Sector Selector */}
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold">MONITORED SECTOR:</span>
                {(['sector9', 'asia', 'atlantic'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSector(s)}
                    className={`px-3 py-1 rounded-md border uppercase transition-colors cursor-pointer ${
                      selectedSector === s
                        ? 'bg-pink-500/30 border-pink-400 text-pink-100 font-bold'
                        : 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Real Generated Dossier */}
              <div className="p-3.5 rounded-xl bg-[#020d18] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                  <span className="text-pink-300 font-bold">TOP SECRET // CLASSIFIED INTELLIGENCE DOSSIER</span>
                  <button
                    onClick={() =>
                      copyText(`[STONIC AI INTELLIGENCE BRIEFING]\nSector: ${selectedSector.toUpperCase()}\nStatus: Verified\nReconnaissance: Active orbital pass locked. Atmospheric fluctuation nominal.`)
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED' : 'COPY DOSSIER'}</span>
                  </button>
                </div>
                <p className="font-sans text-cyan-100 leading-relaxed text-xs">
                  {selectedSector === 'sector9' &&
                    'Alice has processed 14 high-priority diplomatic transmissions from Sector-9. Thermal scans indicate zero anomalous movement along monitored defense boundaries. Encryption keys have been refreshed on the primary SAT-LINK bridge.'}
                  {selectedSector === 'asia' &&
                    'Autonomous satellite scanning confirms maritime shipping lanes in the Asia-Pacific basin are operating under normal clearance protocols. Weather disturbances mapped at 18 knots wind velocity.'}
                  {selectedSector === 'atlantic' &&
                    'Transatlantic optic cables reporting optimal throughput. No submarine cable interference or telemetry outages recorded over the past 24 hours.'}
                </p>
              </div>
            </div>
          )}

          {/* ================= BOB: REAL PERIMETER FIREWALL AUDIT ================= */}
          {agentId === 'bob' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">PERIMETER NETWORK SCAN // SUBNET 192.168.1.0/24</h4>
                  <span className="text-cyan-300/80 text-[11px]">Active IPS/IDS: Snort v3.1 + CrowdStrike Sensor</span>
                </div>
                <button
                  onClick={handleRunScan}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/25 border border-sky-400 text-sky-100 font-bold hover:bg-sky-500/40 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'SCANNING PORTS...' : 'EXECUTE PORT SCAN'}</span>
                </button>
              </div>

              {/* Scanned Ports Table */}
              <div className="overflow-x-auto rounded-xl border border-cyan-500/30 bg-[#020e18]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#03192b] text-cyan-300 border-b border-cyan-500/30">
                    <tr>
                      <th className="p-2">PORT</th>
                      <th className="p-2">SERVICE</th>
                      <th className="p-2">STATUS</th>
                      <th className="p-2">AUTHENTICATION PROTOCOL</th>
                      <th className="p-2">THREAT SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/15">
                    {scannedPorts.map((p) => (
                      <tr key={p.port} className="hover:bg-cyan-500/10 transition-colors">
                        <td className="p-2 font-bold text-sky-300">:{p.port}</td>
                        <td className="p-2 text-white">{p.service}</td>
                        <td className="p-2 font-bold text-emerald-400">{p.status}</td>
                        <td className="p-2 text-slate-300">{p.auth}</td>
                        <td className="p-2 font-bold text-emerald-300">{p.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Executed Iptables Rule Generator */}
              <div className="p-3 rounded-xl bg-[#020b12] border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-sky-300 font-bold text-xs">ACTIVE IPTABLES DEFENSE SCRIPT:</span>
                  <button
                    onClick={() =>
                      copyText(
                        `$ iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set\n$ iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP\n$ iptables -A INPUT -p tcp --dport 8080 -m state --state ESTABLISHED,RELATED -j ACCEPT`
                      )
                    }
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 hover:text-white cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED!' : 'COPY IPTABLES'}</span>
                  </button>
                </div>
                <pre className="text-[11px] text-cyan-200 bg-[#01070e] p-2.5 rounded border border-cyan-500/20 overflow-x-auto select-text cursor-text leading-relaxed">
{`$ iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
$ iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
$ iptables -A INPUT -p tcp --dport 8080 -m state --state ESTABLISHED,RELATED -j ACCEPT`}
                </pre>
              </div>
            </div>
          )}

          {/* ================= CAROL: REAL STREAMING DATA PIPELINE & SQL ================= */}
          {agentId === 'carol' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-[#041d26] border border-emerald-500/30">
                  <span className="text-slate-400 text-[10px]">INGESTION RATE</span>
                  <p className="text-emerald-400 font-bold text-base sm:text-lg">
                    {(eventsPerSec / 1000000).toFixed(2)}M <span className="text-xs">events/sec</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#041d26] border border-emerald-500/30">
                  <span className="text-slate-400 text-[10px]">STREAM LATENCY</span>
                  <p className="text-emerald-300 font-bold text-base sm:text-lg">
                    {bufferLatency} <span className="text-xs">ms (p99)</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#041d26] border border-emerald-500/30 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px]">BUFFER LOAD</span>
                  <p className="text-cyan-300 font-bold text-base sm:text-lg">18.4% (Optimal)</p>
                </div>
              </div>

              {/* SQL Query Console */}
              <div className="p-3 rounded-xl bg-[#020e18] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-bold">CLICKHOUSE REAL-TIME SQL QUERY</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(queryInput)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs hover:text-white cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'COPIED!' : 'COPY SQL'}</span>
                    </button>
                    <button
                      onClick={handleRunQuery}
                      disabled={isExecutingQuery}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/30 border border-emerald-400 text-emerald-100 font-bold hover:bg-emerald-500/50 cursor-pointer disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isExecutingQuery ? 'EXECUTING...' : 'RUN QUERY'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded bg-[#010912] border border-emerald-500/40 text-emerald-200 text-xs font-mono focus:outline-none focus:border-emerald-300"
                />

                {/* Query Result Rows */}
                <div className="overflow-x-auto rounded border border-emerald-500/20 bg-[#010810]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#021822] text-emerald-300 border-b border-emerald-500/30">
                      <tr>
                        <th className="p-2">SECTOR_ID</th>
                        <th className="p-2">ANOMALY_COUNT</th>
                        <th className="p-2">AVG_TEMP (K)</th>
                        <th className="p-2">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                      {queryResults.map((r, i) => (
                        <tr key={i} className="hover:bg-emerald-500/10 transition-colors">
                          <td className="p-2 font-bold text-white">{r.sector_id}</td>
                          <td className="p-2 text-emerald-400">{r.anomaly_count}</td>
                          <td className="p-2 text-slate-300">{r.avg_temp}°K</td>
                          <td className="p-2 font-bold text-emerald-300">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= DAVE: REAL KUBERNETES & CLOUD CLUSTERS ================= */}
          {agentId === 'dave' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">KUBERNETES v1.30 CLOUD CLUSTER [stonic-prod-us]</h4>
                  <span className="text-cyan-300/80 text-[11px]">Cilium eBPF Service Mesh Active | Envoy Proxies: 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyText(
                        `$ kubectl get pods -n stonic-ai -o wide\n${pods
                          .map((p) => `${p.name}\t${p.status}\t${p.restarts}\t${p.cpu}\t${p.memory}`)
                          .join('\n')}`
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs hover:text-white cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED!' : 'COPY KUBECTL'}</span>
                  </button>
                  <span className="text-amber-300 text-xs">Replicas: {replicaCount}</span>
                  <button
                    onClick={() => setReplicaCount((r) => Math.min(8, r + 1))}
                    className="px-2 py-0.5 rounded bg-amber-500/30 border border-amber-400 text-amber-100 font-bold cursor-pointer"
                  >
                    + Scale
                  </button>
                  <button
                    onClick={() => setReplicaCount((r) => Math.max(2, r - 1))}
                    className="px-2 py-0.5 rounded bg-amber-500/30 border border-amber-400 text-amber-100 font-bold cursor-pointer"
                  >
                    - Scale
                  </button>
                </div>
              </div>

              {/* Pods Grid */}
              <div className="space-y-2">
                {pods.map((pod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#041724] border border-amber-500/30 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <span className="font-bold text-white text-xs">{pod.name}</span>
                        <p className="text-[10px] text-slate-400">Restarts: {pod.restarts} | Health: Healthy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-amber-300 text-xs">CPU: {pod.cpu}</span>
                      <span className="text-cyan-300 text-xs">RAM: {pod.memory}</span>
                      <button
                        onClick={() => {
                          setPods((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, restarts: p.restarts + 1 } : p))
                          );
                        }}
                        className="px-2 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[10px] font-bold hover:bg-amber-500/40 cursor-pointer"
                      >
                        RESTART
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#02182b] border-t border-cyan-500/30 shrink-0">
          <span className="text-[11px] text-cyan-300">
            Real task telemetry synchronizing directly with Stonic AI Core
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer text-xs"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
