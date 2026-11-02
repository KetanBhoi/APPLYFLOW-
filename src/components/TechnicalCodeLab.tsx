import React, { useState, useEffect, useRef } from 'react';
import {
  CodeChallenge,
  CodeTestCase,
  CodeTestResult,
  CodeReviewAnalysis,
  TakeHomeProjectSpec,
  JobApplication,
  UserProfile
} from '../types/job';
import { reviewTechnicalCode, generateTakeHomeSpec } from '../services/geminiService';
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Terminal,
  Cpu,
  BookOpen,
  HelpCircle,
  FileCode,
  Zap,
  Building2,
  FolderGit2,
  Download,
  Filter,
  Flame,
  ShieldCheck,
  Send
} from 'lucide-react';

interface TechnicalCodeLabProps {
  applications: JobApplication[];
  userProfile?: UserProfile;
  initialAppId?: string;
  onSelectApplicationForDetail?: (app: JobApplication) => void;
}

const PRESET_CHALLENGES: CodeChallenge[] = [
  {
    id: 'lru-cache',
    title: 'LRU Cache with O(1) Get & Put',
    difficulty: 'Medium',
    category: 'Distributed Systems & Concurrency',
    tags: ['Hash Map', 'Doubly Linked List', 'Design', 'Caching'],
    companyTargets: ['Outlier AI', 'Amazon', 'Meta', 'Stripe'],
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.
Implement the LRUCache class:
• LRUCache(capacity): Initialize the LRU cache with positive size capacity.
• get(key): Return the value of key if key exists, otherwise return -1. Accessing a key marks it as most recently used.
• put(key, value): Update the value of key if key exists. Otherwise, add key-value pair. If number of keys exceeds capacity, evict the least recently used key.

Both get and put must operate in O(1) average time complexity.`,
    starterCode: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    if (!this.cache.has(key)) return -1;
    // Refresh recency
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

// Test harness entry
function runChallenge(capacity, operations) {
  const lru = new LRUCache(capacity);
  const results = [];
  for (const [op, ...args] of operations) {
    if (op === 'put') {
      lru.put(args[0], args[1]);
      results.push(null);
    } else if (op === 'get') {
      results.push(lru.get(args[0]));
    }
  }
  return results;
}`,
    solutionCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
    hints: [
      'Hint 1: In JavaScript, Map preserves key insertion order. Deleting and re-inserting moves a key to the end.',
      'Hint 2: In other languages or low-level systems, pair a Hash Table with a Doubly Linked List with dummy head and tail nodes for O(1) detachment and insertion.',
      'Hint 3: Ensure capacity=1 edge case cleanly evicts without dangling references.'
    ],
    timeLimitMinutes: 45,
    testCases: [
      {
        id: 'tc-1',
        name: 'Basic Put and Get Operations',
        inputDescription: 'Capacity 2: put(1,1), put(2,2), get(1), put(3,3), get(2)',
        codeSnippet: `const out = runChallenge(2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2]]);
assert.deepEqual(out, [null, null, 1, null, -1]);`
      },
      {
        id: 'tc-2',
        name: 'Updating Existing Key Keeps It Most Recent',
        inputDescription: 'Capacity 2: put(2,1), put(2,2), get(2), put(1,1), put(4,1), get(2)',
        codeSnippet: `const out = runChallenge(2, [['put', 2, 1], ['put', 2, 2], ['get', 2], ['put', 1, 1], ['put', 4, 1], ['get', 2]]);
assert.equal(out[out.length - 1], -1);`
      },
      {
        id: 'tc-3',
        name: 'Capacity 1 Edge Case Eviction',
        inputDescription: 'Capacity 1: put(1,10), get(1), put(2,20), get(1)',
        codeSnippet: `const out = runChallenge(1, [['put', 1, 10], ['get', 1], ['put', 2, 20], ['get', 1]]);
assert.deepEqual(out, [null, 10, null, -1]);`,
        isEdgeCase: true
      }
    ]
  },
  {
    id: 'debounce-throttle',
    title: 'Custom Async Debounce with Leading & Trailing Options',
    difficulty: 'Medium',
    category: 'Frontend & Async UI',
    tags: ['Closures', 'Async', 'Event Loop', 'React'],
    companyTargets: ['Linear', 'Figma', 'TCS', 'Meta'],
    description: `Implement an enterprise-grade debounce utility that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.
Support:
• Immediate leading execution option (executes immediately on leading edge).
• cancel() method to abort pending timers and prevent memory leaks.
• flush() method to execute immediately with latest arguments.`,
    starterCode: `/**
 * @param {Function} func
 * @param {number} wait
 * @param {Object} [options]
 * @param {boolean} [options.leading=false]
 * @param {boolean} [options.trailing=true]
 * @return {Function}
 */
function debounce(func, wait, options = {}) {
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;
  const leading = Boolean(options.leading);
  const trailing = options.trailing !== false;

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const isInvoking = leading && !timerId;

    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      if (trailing && (!leading || lastArgs)) {
        func.apply(lastThis, lastArgs);
      }
      timerId = null;
      lastArgs = null;
      lastThis = null;
    }, wait);

    if (isInvoking) {
      func.apply(lastThis, lastArgs);
    }
  }

  debounced.cancel = () => {
    if (timerId) clearTimeout(timerId);
    timerId = null;
    lastArgs = null;
    lastThis = null;
  };

  return debounced;
}

// Synchronous simulator wrapper for unit test validation
function testDebounceBehavior() {
  let count = 0;
  const fn = (inc = 1) => { count += inc; };
  const debouncedFn = debounce(fn, 50, { leading: true });
  debouncedFn(5);
  // Immediate leading invocation check
  return count;
}`,
    solutionCode: `function debounce(func, wait, options = {}) {
  let timer = null;
  let lastArgs = null;
  const leading = !!options.leading;
  const trailing = options.trailing !== false;
  function debounced(...args) {
    lastArgs = args;
    const isFirst = leading && !timer;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (trailing && lastArgs) func.apply(this, lastArgs);
      timer = null;
      lastArgs = null;
    }, wait);
    if (isFirst) func.apply(this, lastArgs);
  }
  debounced.cancel = () => { clearTimeout(timer); timer = null; };
  return debounced;
}`,
    hints: [
      'Hint 1: Keep track of whether a timer is currently active to distinguish leading calls.',
      'Hint 2: Ensure cancel() explicitly cleans up closures to avoid holding old arguments in memory.',
      'Hint 3: In React, wrap this in useCallback or useMemo to prevent re-instantiation on every render.'
    ],
    timeLimitMinutes: 30,
    testCases: [
      {
        id: 'tc-d1',
        name: 'Leading edge immediate invocation',
        inputDescription: 'debounce(fn, 50, { leading: true }) called once',
        codeSnippet: `const result = testDebounceBehavior();
assert.equal(result, 5);`
      },
      {
        id: 'tc-d2',
        name: 'Cancel method stops execution',
        inputDescription: 'debouncedFn.cancel() stops scheduled timer',
        codeSnippet: `let val = 0;
const d = debounce(() => { val = 10; }, 100);
d();
d.cancel();
assert.equal(val, 0);`
      }
    ]
  },
  {
    id: 'token-bucket-rate-limiter',
    title: 'Distributed Token Bucket Rate Limiter',
    difficulty: 'Hard',
    category: 'Distributed Systems & Concurrency',
    tags: ['Rate Limiting', 'System Design', 'Redis', 'Algorithms'],
    companyTargets: ['Stripe', 'Uber', 'AWS', 'Outlier AI'],
    description: `Implement the Token Bucket algorithm used by Stripe and Cloudflare to prevent API throttling and DDoS:
• RateLimiter(capacity, refillRatePerSecond): Initializes bucket with max capacity and continuous replenishment rate.
• allowRequest(tokensRequested = 1, currentTimeMs): Returns boolean true if tokens are granted, false if rejected.
• Tokens should refill continuously proportional to elapsed time without requiring an active setInterval loop (lazy calculation).`,
    starterCode: `class TokenBucketRateLimiter {
  /**
   * @param {number} capacity - Max burst capacity
   * @param {number} refillRate - Tokens added per second
   */
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  /**
   * @param {number} [tokensRequested=1]
   * @param {number} [now=Date.now()]
   * @return {boolean}
   */
  allowRequest(tokensRequested = 1, now = Date.now()) {
    // 1. Calculate tokens generated during elapsed window
    const elapsedSeconds = Math.max(0, (now - this.lastRefillTimestamp) / 1000);
    const tokensToAdd = elapsedSeconds * this.refillRate;

    // 2. Replenish bucket up to maximum capacity
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;

    // 3. Evaluate request authorization
    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true;
    }
    return false;
  }
}

function runRateLimiterTests() {
  const limiter = new TokenBucketRateLimiter(5, 2); // 5 max, 2 tokens/sec
  const t0 = 1000;
  const res1 = limiter.allowRequest(3, t0); // has 5, uses 3, leaves 2 -> true
  const res2 = limiter.allowRequest(3, t0); // has 2, needs 3 -> false
  const res3 = limiter.allowRequest(1, t0 + 1000); // 1 sec elapsed -> adds 2 -> tokens=4, uses 1 -> true
  return [res1, res2, res3];
}`,
    solutionCode: `class TokenBucketRateLimiter {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  allowRequest(tokens = 1, now = Date.now()) {
    const elapsed = Math.max(0, (now - this.lastRefill) / 1000);
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}`,
    hints: [
      'Hint 1: Do not use setInterval to refill tokens; lazy evaluation on each incoming request is O(1) and saves CPU.',
      'Hint 2: When translating to distributed Redis, wrap the get-elapsed-decrement logic in an atomic Lua script.',
      'Hint 3: Ensure time delta does not become negative if clock drift occurs (Math.max(0, delta)).'
    ],
    timeLimitMinutes: 45,
    testCases: [
      {
        id: 'tc-rl1',
        name: 'Burst capacity acceptance and rejection',
        inputDescription: 'Capacity 5, requests of 3 then 3 at t=0',
        codeSnippet: `const out = runRateLimiterTests();
assert.deepEqual(out, [true, false, true]);`
      }
    ]
  },
  {
    id: 'promise-pool',
    title: 'Async Promise Pool with Max Concurrency Limit',
    difficulty: 'Medium',
    category: 'System Utilities & Polyfills',
    tags: ['Async/Await', 'Concurrency', 'Network', 'Queue'],
    companyTargets: ['Google', 'Netflix', 'DoorDash'],
    description: `Write an async function promisePool(tasks, limit) that executes an array of asynchronous task functions with a concurrency limit.
At most limit tasks should be running in parallel. As soon as one task finishes, the next task from the queue should immediately begin.
Return a Promise that resolves with an array of all task results in their original order.`,
    starterCode: `/**
 * @param {Array<() => Promise<any>>} tasks
 * @param {number} limit
 * @return {Promise<Array<any>>}
 */
async function promisePool(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex++;
      try {
        results[currentIndex] = await tasks[currentIndex]();
      } catch (err) {
        results[currentIndex] = err;
      }
    }
  }

  // Spawn pool workers up to the concurrency limit
  const workerCount = Math.min(limit, tasks.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);
  return results;
}

// Validation helper
async function testPromisePoolExecution() {
  const tasks = [
    () => Promise.resolve('task 1'),
    () => Promise.resolve('task 2'),
    () => Promise.resolve('task 3'),
    () => Promise.resolve('task 4')
  ];
  return await promisePool(tasks, 2);
}`,
    solutionCode: `async function promisePool(tasks, limit) {
  const results = new Array(tasks.length);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const cur = idx++;
      results[cur] = await tasks[cur]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}`,
    hints: [
      'Hint 1: Use an array of worker async functions that loop through a shared index cursor.',
      'Hint 2: Pre-allocate the results array so each task writes directly to its original index.',
      'Hint 3: Ensure empty tasks array resolves immediately without hanging.'
    ],
    timeLimitMinutes: 30,
    testCases: [
      {
        id: 'tc-pp1',
        name: 'Preserves result order with concurrency 2',
        inputDescription: '4 tasks executed with limit=2',
        codeSnippet: `const res = await testPromisePoolExecution();
assert.deepEqual(res, ['task 1', 'task 2', 'task 3', 'task 4']);`
      }
    ]
  }
];

export const TechnicalCodeLab: React.FC<TechnicalCodeLabProps> = ({
  applications,
  userProfile,
  initialAppId,
  onSelectApplicationForDetail
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'take-home'>('challenges');

  // Active Challenge State
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('lru-cache');
  const activeChallenge =
    PRESET_CHALLENGES.find((c) => c.id === selectedChallengeId) || PRESET_CHALLENGES[0];

  const [userCode, setUserCode] = useState<string>(activeChallenge.starterCode);
  const [language, setLanguage] = useState<string>('javascript');
  const [testResults, setTestResults] = useState<CodeTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Timer State (45 min simulation)
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Progressive Hints
  const [unlockedHintsCount, setUnlockedHintsCount] = useState<number>(0);

  // Code Review State
  const [isAuditingCode, setIsAuditingCode] = useState(false);
  const [codeReview, setCodeReview] = useState<CodeReviewAnalysis | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Take-Home Spec State
  const [takeHomeTitle, setTakeHomeTitle] = useState('MetroMart High-Concurrency Checkout Service');
  const [takeHomeRequirements, setTakeHomeRequirements] = useState(
    'Build a production-grade REST API in Node.js/TypeScript that processes multi-vendor cart checkouts with optimistic locking, Redis caching, 80%+ test coverage, and Docker containerization.'
  );
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [takeHomeSpec, setTakeHomeSpec] = useState<TakeHomeProjectSpec | null>(null);

  // When selected challenge changes, reset editor code and hints
  useEffect(() => {
    setUserCode(activeChallenge.starterCode);
    setTestResults([]);
    setCodeReview(null);
    setUnlockedHintsCount(0);
    setTimerSeconds(activeChallenge.timeLimitMinutes * 60);
    setIsTimerRunning(false);
  }, [activeChallenge.id]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Test Cases safely in browser
  const handleRunTests = async () => {
    setIsRunningTests(true);
    setConsoleLogs([]);
    const logs: string[] = [];

    // Simple custom assert engine for the sandbox
    const assert = {
      equal: (actual: any, expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
        }
      },
      deepEqual: (actual: any, expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected deep equality:\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
        }
      }
    };

    const results: CodeTestResult[] = [];

    for (const tc of activeChallenge.testCases) {
      const startTime = performance.now();
      try {
        // Construct runnable sandbox function
        const executableString = `
          ${userCode}
          return (async () => {
            ${tc.codeSnippet}
          })();
        `;
        const testRunner = new Function('assert', executableString);
        await testRunner(assert);
        const duration = Math.round(performance.now() - startTime);

        results.push({
          testId: tc.id,
          name: tc.name,
          passed: true,
          executionTimeMs: duration
        });
        logs.push(`✓ [PASS] ${tc.name} (${duration}ms)`);
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        results.push({
          testId: tc.id,
          name: tc.name,
          passed: false,
          errorMessage: err.message || String(err),
          executionTimeMs: duration
        });
        logs.push(`✕ [FAIL] ${tc.name}: ${err.message || String(err)}`);
      }
    }

    setTestResults(results);
    setConsoleLogs(logs);
    setIsRunningTests(false);
  };

  // Request Gemini 3.8 Flash Code Review
  const handleRequestCodeReview = async () => {
    setIsAuditingCode(true);
    try {
      const response = await reviewTechnicalCode({
        challengeTitle: activeChallenge.title,
        description: activeChallenge.description,
        userCode,
        language,
        companyTarget: activeChallenge.companyTargets[0]
      });

      setCodeReview(response.result as CodeReviewAnalysis);
    } catch (err) {
      console.error('Failed to audit code with Gemini:', err);
    } finally {
      setIsAuditingCode(false);
    }
  };

  // Generate Take-Home Spec
  const handleGenerateTakeHome = async () => {
    setIsGeneratingSpec(true);
    try {
      const response = await generateTakeHomeSpec({
        projectTitle: takeHomeTitle,
        requirements: takeHomeRequirements,
        targetRole: userProfile?.currentRole || 'Software Engineer',
        company: applications[0]?.company || 'Tier-1 Tech'
      });
      setTakeHomeSpec(response.result as TakeHomeProjectSpec);
    } catch (err) {
      console.error('Failed to generate take-home spec:', err);
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EBE8E3]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-[#0F4A3E] border border-emerald-300">
              <Code2 className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Technical Code Lab & Take-Home Studio
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider font-sans border border-emerald-300">
              Live Runner & Staff Review
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1.5">
            Simulate 45-minute live technical coding screens, run automated unit test suites, and obtain Gemini Staff Engineer Big-O complexity reviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'challenges'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Live Coding Screen
            </button>
            <button
              onClick={() => setActiveTab('take-home')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'take-home'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Take-Home Spec Architect
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: LIVE CODING SCREEN */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Challenge Selector & Problem Details */}
          <div className="lg:col-span-5 space-y-4">
            {/* Challenge Dropdown & Company Targets */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Select Technical Challenge
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {activeChallenge.difficulty}
                </span>
              </div>

              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-hidden"
              >
                {PRESET_CHALLENGES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.difficulty})
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-stone-400 font-semibold">Target Loops:</span>
                {activeChallenge.companyTargets.map((comp) => (
                  <span
                    key={comp}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200 flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3 text-stone-400" />
                    <span>{comp}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Description Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {activeChallenge.title}
              </h3>
              <div className="text-xs text-stone-700 leading-relaxed font-sans whitespace-pre-wrap">
                {activeChallenge.description}
              </div>

              {/* Progressive Hints Accordion */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Progressive Hints ({unlockedHintsCount}/{activeChallenge.hints.length})</span>
                  </span>
                  {unlockedHintsCount < activeChallenge.hints.length && (
                    <button
                      onClick={() => setUnlockedHintsCount((prev) => prev + 1)}
                      className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                    >
                      Unlock Next Hint
                    </button>
                  )}
                </div>

                {unlockedHintsCount === 0 ? (
                  <p className="text-[11px] text-stone-400 italic">
                    Attempt the problem first without hints to simulate a real screening interview.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {activeChallenge.hints.slice(0, unlockedHintsCount).map((hint, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 font-medium"
                      >
                        {hint}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test Cases Summary List */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Automated Test Suite ({activeChallenge.testCases.length} Tests)
              </span>
              <div className="space-y-1.5">
                {activeChallenge.testCases.map((tc) => (
                  <div
                    key={tc.id}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-800">{tc.name}</p>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {tc.inputDescription}
                      </p>
                    </div>
                    {tc.isEdgeCase && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Edge Case
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Interactive Code Editor & Test Console */}
          <div className="lg:col-span-7 space-y-4">
            {/* Editor Toolbar with 45-min Timer */}
            <div className="bg-stone-900 rounded-2xl p-3 text-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono font-bold text-stone-300">
                  solution.js
                </span>
              </div>

              {/* 45-Minute Timer Controls */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                    timerSeconds < 300
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      : timerSeconds < 900
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>

                <button
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors text-xs font-semibold cursor-pointer px-2"
                >
                  {isTimerRunning ? 'Pause' : 'Start Timer'}
                </button>

                <button
                  onClick={() => {
                    setUserCode(activeChallenge.starterCode);
                    setTestResults([]);
                  }}
                  className="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  title="Reset Starter Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopy(userCode, 'editor-code')}
                  className="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                  title="Copy Code"
                >
                  {copiedKey === 'editor-code' ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* In-Browser Code Editor Area */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-inner">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                spellCheck={false}
                className="w-full h-96 p-4 font-mono text-xs text-stone-100 bg-transparent resize-y focus:outline-hidden leading-relaxed tracking-wide"
                style={{
                  tabSize: 2
                }}
              />
            </div>

            {/* Run Tests & Gemini Audit Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  className="h-9 inline-flex items-center gap-1.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isRunningTests ? 'Executing Tests...' : 'Run Test Cases'}</span>
                </button>

                <button
                  onClick={() => {
                    setUserCode(activeChallenge.solutionCode);
                  }}
                  className="h-9 inline-flex items-center gap-1.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer transition-colors shrink-0"
                >
                  Load Reference Solution
                </button>
              </div>

              <button
                onClick={handleRequestCodeReview}
                disabled={isAuditingCode}
                className="h-9 inline-flex items-center gap-1.5 px-4 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isAuditingCode ? 'Auditing with Gemini 3.8...' : 'Staff Engineer Code Review'}</span>
              </button>
            </div>

            {/* Real Execution Test Console Output */}
            {consoleLogs.length > 0 && (
              <div className="rounded-2xl bg-stone-950 border border-stone-800 p-4 font-mono text-xs space-y-1.5 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Test Execution Console</span>
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Passed: {testResults.filter((r) => r.passed).length}/{testResults.length}
                  </span>
                </div>
                {consoleLogs.map((log, idx) => (
                  <p
                    key={idx}
                    className={
                      log.startsWith('✓')
                        ? 'text-emerald-300'
                        : 'text-rose-400 font-semibold'
                    }
                  >
                    {log}
                  </p>
                ))}
              </div>
            )}

            {/* Gemini 3.8 Flash Staff Engineer Code Review Box */}
            {codeReview && (
              <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-6 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-serif text-base font-bold text-stone-900">
                        Staff Engineer Code Audit Verdict: {codeReview.verdict}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Evaluated with Gemini 3.8 Flash against Senior Bar criteria.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
                    Score: {codeReview.overallScore}/100
                  </span>
                </div>

                {/* Big-O Complexity Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Time Complexity
                    </span>
                    <p className="text-sm font-serif font-bold text-stone-900 mt-0.5">
                      {codeReview.timeComplexity}
                    </p>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {codeReview.timeDerivation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Auxiliary Space Complexity
                    </span>
                    <p className="text-sm font-serif font-bold text-stone-900 mt-0.5">
                      {codeReview.spaceComplexity}
                    </p>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {codeReview.spaceDerivation}
                    </p>
                  </div>
                </div>

                {/* Strengths & Edge Cases */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Strengths Detected:</span>
                    </p>
                    <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                      {codeReview.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edge Case Vulnerabilities:</span>
                    </p>
                    <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                      {codeReview.edgeCaseVulnerabilities?.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interviewer Follow-Up Questions */}
                {codeReview.interviewerFollowUps?.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Interviewer Follow-Up Probes:
                    </p>
                    <div className="space-y-2">
                      {codeReview.interviewerFollowUps.map((f, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1"
                        >
                          <p className="font-bold text-stone-900">
                            Q: "{f.question}"
                          </p>
                          <p className="text-stone-500 italic">
                            Intent: {f.whyAsk}
                          </p>
                          <p className="text-emerald-900 font-medium">
                            Model Answer: {f.expectedAnswer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TAKE-HOME SPEC ARCHITECT */}
      {activeTab === 'take-home' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Take-Home Assignment Architecture Generator
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Paste your employer take-home prompt to instantly generate a senior-level architecture blueprint, folder structure, and justification memo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={takeHomeTitle}
                  onChange={(e) => setTakeHomeTitle(e.target.value)}
                  placeholder="e.g. Real-Time Collaborative Canvas API"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Target Company / Role
                </label>
                <input
                  type="text"
                  value={applications[0]?.company || 'Active Company'}
                  disabled
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Employer Requirements & Constraints
              </label>
              <textarea
                rows={3}
                value={takeHomeRequirements}
                onChange={(e) => setTakeHomeRequirements(e.target.value)}
                placeholder="Paste take-home assignment details, evaluation rubric, and required frameworks..."
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateTakeHome}
                disabled={isGeneratingSpec}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingSpec ? 'Architecting Blueprint...' : 'Generate Take-Home Architecture Blueprint'}</span>
              </button>
            </div>
          </div>

          {/* Render Generated Spec */}
          {takeHomeSpec && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {takeHomeSpec.projectTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Estimated Time: {takeHomeSpec.estimatedHours} · {takeHomeSpec.scopeSummary}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(takeHomeSpec.submissionReadmeNotes, 'readme-spec')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  {copiedKey === 'readme-spec' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy README.md Notes</span>
                </button>
              </div>

              {/* Directory Structure */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Recommended Directory Structure</span>
                </span>
                <pre className="p-4 rounded-xl bg-stone-900 text-emerald-200 font-mono text-xs overflow-x-auto leading-relaxed">
                  {takeHomeSpec.directoryStructure}
                </pre>
              </div>

              {/* Core Architecture Components */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Core Architectural Components & Tradeoffs
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {takeHomeSpec.coreArchitectureComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs"
                    >
                      <h5 className="font-bold text-stone-900 font-serif">
                        {comp.name}
                      </h5>
                      <p className="text-stone-600 leading-relaxed">
                        {comp.responsibility}
                      </p>
                      <p className="text-[11px] text-amber-900 font-medium pt-1 border-t border-stone-200/60">
                        <strong>Tradeoff:</strong> {comp.keyTradeoff}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
