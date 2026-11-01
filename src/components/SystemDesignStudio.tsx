import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Server,
  Database,
  Radio,
  Share2,
  Download,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Zap,
  Globe,
  HardDrive,
  MessageSquare
} from 'lucide-react';

interface ScenarioTemplate {
  id: string;
  title: string;
  category: string;
  targetScale: string;
  description: string;
  defaultComponents: string[];
  defaultCache: string;
  defaultDB: string;
  defaultLock: string;
  defaultExplanation: string;
}

const SCENARIOS: ScenarioTemplate[] = [
  {
    id: 'metromart-flash-sale',
    title: 'MetroMart Flash Sale & Cart Concurrency',
    category: 'E-Commerce / High Concurrency',
    targetScale: '50,000 requests/sec',
    description: 'Protect inventory count from race conditions and overselling when 50k users simultaneously checkout limited-stock items on MetroMart.',
    defaultComponents: [
      'React SPA (Client)',
      'Cloudflare CDN',
      'Nginx Load Balancer (Round Robin)',
      'Node.js Express Cluster (PM2)',
      'Redis Cache (Cache-Aside + Lua)',
      'RabbitMQ Order Queue',
      'MongoDB Replica Set (Primary-Secondary)'
    ],
    defaultCache: 'Redis Cache-Aside with Jittered TTL',
    defaultDB: 'MongoDB Replica Set with Read Preference (Secondary)',
    defaultLock: 'Atomic Redis Lua Script (DECRBY with check)',
    defaultExplanation: `1. Clients hit Cloudflare CDN for static assets, routing API requests to dual Nginx reverse proxies with VRRP keepalived failover.
2. Nginx load-balances traffic across 12 Node.js/Express worker processes.
3. Inventory availability checks and reservations occur exclusively in Redis using atomic Lua scripts (checking if stock > 0 before atomic decrement), eliminating database locking bottlenecks.
4. Once reserved in Redis, the checkout payload is published to a durable RabbitMQ queue.
5. Background worker consumers drain the queue, persist orders to MongoDB with write concern w: "majority", and trigger Stripe/Razorpay payment webhooks asynchronously.
6. Product catalog reads query MongoDB secondaries with cache fallback, shielding the primary DB node from read spikes.`
  },
  {
    id: 'realtime-feed',
    title: 'Real-Time Notification & Live Chat Feed',
    category: 'Distributed Real-Time / WebSockets',
    targetScale: '200,000 concurrent socket connections',
    description: 'Broadcast real-time order updates, recruiter messages, and price drops with sub-100ms delivery across distributed Node.js nodes.',
    defaultComponents: [
      'React Web / Mobile Client',
      'AWS ALB (Sticky Sessions)',
      'Node.js WebSocket Cluster (Socket.io)',
      'Redis Pub/Sub & Redis Adapter',
      'MongoDB Chat & Notifications Collection'
    ],
    defaultCache: 'Redis In-Memory Session Store',
    defaultDB: 'MongoDB Sharded on userId (Hash Key)',
    defaultLock: 'Distributed Mutex Lock for Duplicate Messages',
    defaultExplanation: `1. Clients establish WebSocket / SSE connections through AWS ALB with sticky session routing to maintain handshake state.
2. To enable inter-node communication, Socket.io is backed by the Redis Adapter (Pub/Sub). When a notification is generated on Node Instance A, it publishes to Redis, which fans out to Node Instance B where the recipient is connected.
3. Message history and notification state are asynchronously batched and written to MongoDB with compound indexing on { userId: 1, createdAt: -1 }.
4. Heartbeat pings occur every 25 seconds with exponential backoff on reconnection.`
  },
  {
    id: 'url-shortener',
    title: 'Scalable URL Shortener & Analytics Counter',
    category: 'Read-Heavy Storage System',
    targetScale: '100,000 reads/sec, 1,000 writes/sec (100:1 ratio)',
    description: 'Design a high-throughput link redirection service with sub-15ms P99 latency and real-time click analytics counters.',
    defaultComponents: [
      'Edge CDN (Cloudflare Workers)',
      'Nginx Reverse Proxy',
      'Node.js REST API',
      'Redis Hot Key Cache',
      'Bloom Filter (Anti-Scrape)',
      'MongoDB Sharded on shortKey'
    ],
    defaultCache: 'Redis LRU Eviction Cache (Hot 20% of URLs)',
    defaultDB: 'MongoDB Hash Sharding on shortKey',
    defaultLock: 'Optimistic Concurrency on Click Counters',
    defaultExplanation: `1. With a 100:1 read-to-write ratio, 80% of read traffic is served directly from Cloudflare Edge and Redis in-memory cache using Base62 encoded keys (6 characters = ~56.8 billion unique URLs).
2. A Bloom Filter checks if a short key exists before making database queries, eliminating 99% of non-existent key read attacks (cache penetration).
3. Redirect responses return HTTP 302 Found (temporary redirect) so the server can increment analytics counters.
4. Clicks are buffered in Redis hyperloglog / counters and flushed to MongoDB in 10-second batch intervals.`
  }
];

const COMPONENT_LIBRARY = [
  { id: 'React SPA (Client)', icon: <Globe className="w-4 h-4 text-blue-500" />, layer: 'Frontend' },
  { id: 'Cloudflare CDN', icon: <Zap className="w-4 h-4 text-amber-500" />, layer: 'Edge / CDN' },
  { id: 'Nginx Load Balancer (Round Robin)', icon: <Layers className="w-4 h-4 text-emerald-500" />, layer: 'Gateway' },
  { id: 'Node.js Express Cluster (PM2)', icon: <Server className="w-4 h-4 text-green-600" />, layer: 'Compute' },
  { id: 'Redis Cache (Cache-Aside + Lua)', icon: <Radio className="w-4 h-4 text-rose-500" />, layer: 'Cache' },
  { id: 'RabbitMQ Order Queue', icon: <MessageSquare className="w-4 h-4 text-orange-500" />, layer: 'Message Bus' },
  { id: 'MongoDB Replica Set (Primary-Secondary)', icon: <Database className="w-4 h-4 text-emerald-600" />, layer: 'Database' },
  { id: 'AWS S3 Asset Storage', icon: <HardDrive className="w-4 h-4 text-indigo-500" />, layer: 'Storage' }
];

export const SystemDesignStudio: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTemplate>(SCENARIOS[0]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>(SCENARIOS[0].defaultComponents);
  const [cacheStrategy, setCacheStrategy] = useState(SCENARIOS[0].defaultCache);
  const [dbStrategy, setDbStrategy] = useState(SCENARIOS[0].defaultDB);
  const [concurrencyLock, setConcurrencyLock] = useState(SCENARIOS[0].defaultLock);
  const [explanation, setExplanation] = useState(SCENARIOS[0].defaultExplanation);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelectScenario = (sc: ScenarioTemplate) => {
    setSelectedScenario(sc);
    setSelectedComponents(sc.defaultComponents);
    setCacheStrategy(sc.defaultCache);
    setDbStrategy(sc.defaultDB);
    setConcurrencyLock(sc.defaultLock);
    setExplanation(sc.defaultExplanation);
    setAuditResult(null);
  };

  const handleToggleComponent = (compName: string) => {
    if (selectedComponents.includes(compName)) {
      if (selectedComponents.length === 1) return;
      setSelectedComponents(selectedComponents.filter((c) => c !== compName));
    } else {
      setSelectedComponents([...selectedComponents, compName]);
    }
  };

  const handleRunAudit = async () => {
    if (!explanation.trim() || isAuditing) return;
    setIsAuditing(true);

    try {
      const res = await fetch('/api/system-design/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          components: selectedComponents,
          dataFlowExplanation: explanation,
          targetQPS: selectedScenario.targetScale,
          cacheStrategy,
          dbSharding: dbStrategy
        })
      });

      const data = await res.json();
      setAuditResult(data.review);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyReport = () => {
    if (!auditResult) return;
    const markdown = `# System Design Scalability & Architecture Dossier
Scenario: ${selectedScenario.title}
Target Scale: ${selectedScenario.targetScale}
Candidate: Ketan Kaushikbhai Bhoi (B.Tech IT, CVM University)
Date: ${new Date().toLocaleDateString()}

## Architecture Overview
- Caching Strategy: ${cacheStrategy}
- Database Architecture: ${dbStrategy}
- Concurrency Mechanism: ${concurrencyLock}

Components:
${selectedComponents.map((c) => `- ${c}`).join('\n')}

## Architecture Explanation
${explanation}

## Principal Architect Evaluation
- Overall Score: ${auditResult.overallScore}/100
- Scalability: ${auditResult.scalabilityScore}%
- Fault Tolerance: ${auditResult.faultToleranceScore}%
- Latency & Throughput: ${auditResult.latencyThroughputScore}%
- Cost Efficiency: ${auditResult.costEfficiencyScore}%
- Verdict: ${auditResult.architectureVerdict}

### Single Points of Failure (SPOF)
${(auditResult.singlePointsOfFailure || []).map((s: string) => `- ${s}`).join('\n')}

### Concurrency & Race Condition Defense
${auditResult.concurrencyAndRaceConditionAnalysis}

### Cache Stampede Mitigation
${auditResult.cacheStampedeMitigation}

### Interviewer Follow-Up Questions (Technical Drill)
${(auditResult.interviewerFollowUpQuestions || []).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

### Recommended Improvements
${(auditResult.architecturalImprovements || []).map((imp: string) => `- ${imp}`).join('\n')}
`;
    navigator.clipboard.writeText(markdown);
    setCopiedId('report');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF3EA] text-[#0F4A3E] text-xs font-bold font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>System Design Scalability Studio · Senior-Level Architecture Practice</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
              Distributed Systems & High-Concurrency Lab
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Master senior technical interviews for MERN, Java, and Distributed Systems roles. Design high-throughput architectures like <strong>MetroMart at 50k QPS</strong>, audit Single Points of Failure (SPOF), and defend your design against tough interviewer follow-ups.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-6 py-3 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                  <span>Auditing Architecture with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Run Scalability & SPOF Audit</span>
                </>
              )}
            </button>

            {auditResult && (
              <button
                onClick={handleCopyReport}
                className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === 'report' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dossier Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Export Interview Dossier</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Architecture Scenarios:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#0F4A3E] ring-2 ring-[#0F4A3E]/10 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {sc.targetScale}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0F4A3E]" />}
                  </div>
                  <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {sc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Palette & Strategy Row */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2EFE9]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0F4A3E]" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Interactive Component Topology & Building Blocks
            </h2>
          </div>
          <span className="text-xs text-stone-400">
            Click to toggle components in your architecture
          </span>
        </div>

        {/* Component Badges */}
        <div className="flex flex-wrap gap-2">
          {COMPONENT_LIBRARY.map((comp) => {
            const isSelected = selectedComponents.includes(comp.id);
            return (
              <button
                key={comp.id}
                onClick={() => handleToggleComponent(comp.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F4A3E] text-white border-[#0F4A3E] shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{comp.icon}</span>
                <span className="font-mono">{comp.id}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {comp.layer}
                </span>
              </button>
            );
          })}
        </div>

        {/* Strategy Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Caching Pattern:</label>
            <input
              type="text"
              value={cacheStrategy}
              onChange={(e) => setCacheStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Database Scaling Strategy:</label>
            <input
              type="text"
              value={dbStrategy}
              onChange={(e) => setDbStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Concurrency & Lock Mechanism:</label>
            <input
              type="text"
              value={concurrencyLock}
              onChange={(e) => setConcurrencyLock(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800"
            />
          </div>
        </div>

        {/* Architecture Data Flow Explanation */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span>Data Flow & Architectural Defense (Explain how your design handles {selectedScenario.targetScale}):</span>
            <span className="text-[11px] text-stone-400 font-normal">Candidate: Ketan Kaushikbhai Bhoi</span>
          </label>
          <textarea
            rows={6}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-sans text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Audit & Follow-Up Review Section */}
      {auditResult && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F4A3E]" />
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Principal Architect Evaluation & Scalability Scores
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {auditResult.architectureVerdict}
            </span>
          </div>

          {/* Scores Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Overall Architecture', score: auditResult.overallScore, color: 'text-emerald-700' },
              { label: 'Scalability (50k QPS)', score: auditResult.scalabilityScore, color: 'text-indigo-700' },
              { label: 'Fault Tolerance & SPOF', score: auditResult.faultToleranceScore, color: 'text-amber-700' },
              { label: 'Latency & P99 Time', score: auditResult.latencyThroughputScore, color: 'text-purple-700' },
              { label: 'Cost & Operational Fit', score: auditResult.costEfficiencyScore, color: 'text-blue-700' }
            ].map((metric, idx) => (
              <div key={idx} className="bg-white border border-[#EBE8E3] rounded-2xl p-4 text-center shadow-xs">
                <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
                  {metric.label}
                </span>
                <span className={`text-2xl font-serif font-bold ${metric.color} block my-1`}>
                  {metric.score}%
                </span>
                <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-stone-800 rounded-full" style={{ width: `${metric.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Findings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: SPOF & Concurrency */}
            <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif text-sm font-bold text-stone-900">
                  Single Points of Failure (SPOF) Identified
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-stone-700">
                {(auditResult.singlePointsOfFailure || []).map((spof: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="text-amber-600 font-bold shrink-0">•</span>
                    <span>{spof}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <span className="text-xs font-bold text-stone-900 block mb-1">
                  Concurrency & Race Condition Analysis:
                </span>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                  {auditResult.concurrencyAndRaceConditionAnalysis}
                </p>
              </div>
            </div>

            {/* Right: Interviewer Follow-Up Questions (Drill) */}
            <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="font-serif text-sm font-bold text-stone-900">
                  Interviewer Follow-Up Drill (Be Prepared to Defend):
                </h3>
              </div>
              <p className="text-[11px] text-stone-500">
                Senior engineering interviewers frequently ask these edge-case questions based on your proposed components:
              </p>
              <div className="space-y-2.5">
                {(auditResult.interviewerFollowUpQuestions || []).map((q: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <span className="font-bold text-indigo-700 block">Question {idx + 1}:</span>
                    <p className="leading-snug">{q}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-emerald-800 block mb-1">
                  Architectural Praise:
                </span>
                <p className="text-xs text-stone-600 leading-relaxed bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                  {auditResult.seniorEngineerPraise}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
