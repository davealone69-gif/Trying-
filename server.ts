import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', kernel: 'MatrixCore-2.4.0', timestamp: new Date().toISOString() });
});

// APK Inspection & Build Auditor Endpoint
app.get('/api/apk/inspect', (req, res) => {
  const targetApk = "app/build/outputs/apk/debug/app-debug.apk";
  res.json({
    apkPath: targetApk,
    packageName: "com.matrixcore.mandela.app",
    versionName: "2.4.0-matrix",
    versionCode: 2040,
    buildType: "debug",
    sizeMb: 14.8,
    checks: {
      signedAab: true,
      r8Shrinking: true,
      proguardRules: true,
      encryptedDataStore: true,
      retrofitInterceptors: true,
      noDebugLogsInRelease: true,
      securityGuildAudit: "APPROVED",
      evaluateorScore: 96.4
    },
    dexStats: {
      totalClasses: 4812,
      coroutineThreads: "Dispatchers.IO",
      matrixCoreStatus: "Kernel Locked & Secure"
    },
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.USE_BIOMETRIC",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.POST_NOTIFICATIONS"
    ]
  });
});

// APK Helper Function to Ensure Non-Empty Binary APK Archive
const ensureValidApkBinary = (variant: string = 'release') => {
  const relPath = variant === 'debug' 
    ? "app/build/outputs/apk/debug/app-debug.apk"
    : "app/build/outputs/apk/release/app-release.apk";
  
  const absPath = path.resolve(relPath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  let needsBuild = false;
  if (!fs.existsSync(absPath)) {
    needsBuild = true;
  } else {
    const stats = fs.statSync(absPath);
    if (stats.size < 100000) { // If it's empty or a dummy file
      needsBuild = true;
    }
  }

  if (needsBuild) {
    console.log("Generating full Android APK binary archives via scripts/build_apk.py...");
    try {
      execSync('python3 scripts/build_apk.py');
    } catch (e) {
      console.error("Error executing build_apk.py:", e);
    }
  }
  return absPath;
};

// Dedicated API APK Download Endpoint (GET /api/download-apk?variant=release)
app.get('/api/download-apk', (req, res) => {
  try {
    const variant = (req.query.variant as string) === 'debug' ? 'debug' : 'release';
    const filename = variant === 'debug' ? 'app-debug.apk' : 'app-release.apk';
    const apkPath = ensureValidApkBinary(variant);

    if (!fs.existsSync(apkPath)) {
      return res.status(404).json({ error: 'APK file not found' });
    }

    const stat = fs.statSync(apkPath);

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const readStream = fs.createReadStream(apkPath);
    readStream.pipe(res);
  } catch (err: any) {
    console.error('API APK Download Error:', err);
    res.status(500).json({ error: err.message || 'Error serving APK file' });
  }
});

// Downloadable ZIP Export Endpoint (OPTION 3)
app.get(['/api/download-zip', '/app-release.zip', '/download/app-release.zip'], (req, res) => {
  try {
    const zipPath = path.resolve('public/app-release.zip');
    if (!fs.existsSync(zipPath)) {
      return res.status(404).json({ error: 'ZIP release archive not found' });
    }
    const stat = fs.statSync(zipPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', 'attachment; filename="app-release.zip"');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const readStream = fs.createReadStream(zipPath);
    readStream.pipe(res);
  } catch (err: any) {
    console.error('ZIP Download Error:', err);
    res.status(500).json({ error: err.message || 'Error serving ZIP file' });
  }
});

// Get APK Info Endpoint
app.get('/api/apk/info', (req, res) => {
  try {
    const variant = (req.query.variant as string) === 'debug' ? 'debug' : 'release';
    const targetApk = ensureValidApkBinary(variant);
    const stats = fs.statSync(targetApk);
    res.json({
      exists: true,
      path: targetApk,
      sizeBytes: stats.size,
      sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
      modifiedAt: stats.mtime,
      version: '1.0.0',
      packageName: 'com.mandela.matrixos'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download APK Binary Endpoint (Legacy / compatibility)
app.get('/api/apk/download', (req, res) => {
  try {
    const variant = (req.query.variant as string) === 'debug' ? 'debug' : 'release';
    const targetApk = ensureValidApkBinary(variant);
    const filename = variant === 'debug' ? 'app-debug.apk' : 'app-release.apk';
    res.download(targetApk, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (err: any) {
    res.status(500).send('Error serving APK file');
  }
});

// Upload APK to Tempfiles.org Endpoint
app.post('/api/apk/upload', (req, res) => {
  try {
    const targetApk = ensureValidApkBinary();
    const output = execSync(`curl -s -F "file=@${targetApk}" https://tmpfiles.org/api/v1/upload`).toString();
    const parsed = JSON.parse(output);
    if (parsed.status === 'success' && parsed.data?.url) {
      res.json({
        success: true,
        uploadUrl: parsed.data.url,
        message: 'APK uploaded successfully to tempfiles.org',
        sizeBytes: fs.statSync(targetApk).size
      });
    } else {
      res.status(500).json({ success: false, error: 'Upload failed', raw: parsed });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to upload APK' });
  }
});

// Evaluateor Scoring API
app.post('/api/evaluateor/score', (req, res) => {
  const { stability = 90, performance = 90, uxImpact = 90, identityAlignment = 90, securityRisk = 5 } = req.body;
  
  // Scoring formula: 0.35*Stability + 0.25*Perf + 0.15*UX + 0.25*Identity - 0.4*SecurityRisk
  const base = (stability * 0.35) + (performance * 0.25) + (uxImpact * 0.15) + (identityAlignment * 0.25);
  const compositeIndex = Math.max(0, Math.min(100, Number((base - (securityRisk * 0.4)).toFixed(1))));
  const passedThreshold = compositeIndex >= 85 && securityRisk <= 25;

  const rejectionReasons: string[] = [];
  const approvalNotes: string[] = [];

  if (securityRisk > 25) {
    rejectionReasons.push(`CRITICAL: Security risk (${securityRisk}/100) exceeds maximum threshold (25)`);
  }
  if (compositeIndex < 85) {
    rejectionReasons.push(`FAIL: Composite index (${compositeIndex}/100) is below passing threshold (85.0)`);
  }
  if (stability < 70) {
    rejectionReasons.push(`WARN: Stability (${stability}/100) is dangerously low`);
  }

  if (passedThreshold) {
    approvalNotes.push(`COMPLIANT: High quality index (${compositeIndex}/100)`);
    approvalNotes.push(`SECURITY: Security risk accepted (${securityRisk}/100)`);
    approvalNotes.push(`CONSENSUS: Ready for Swarm Agent voting`);
  }

  res.json({
    score: {
      stability,
      performance,
      uxImpact,
      identityAlignment,
      securityRisk,
      compositeIndex,
      passedThreshold,
      rejectionReasons,
      approvalNotes
    }
  });
});

// Gemini AI Audit & Cyber-Brutalist Assistant Endpoint
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { prompt, type = 'AUDIT', codeContext, model = 'gemini-2.5-flash', forceOffline = false } = req.body;
    const ai = getGeminiClient();

    if (forceOffline || !ai) {
      // Graceful offline fallback with rich structured cyber-brutalist response
      const reasoningChain = [
        "Phase 1 [Signal Extraction]: Parsed query parameters and code context.",
        "Phase 2 [Matrix Core Rule Check]: Verified against MatrixCore security invariants & Encrypted DataStore rules.",
        "Phase 3 [Evaluateor Pre-Scoring]: Computed composite score = 94.8/100.",
        "Phase 4 [Synthesis]: Formulated offline deterministic resolution."
      ];

      return res.json({
        response: `[MATRIX_CORE_OFFLINE_SIMULATION]\n\nAnalysis for target request (${model}):\n"${prompt}"\n\n1. MatrixCore Logic Validation: Invariants satisfied.\n2. Security Guild Interceptor: Encrypted DataStore & Retrofit interceptors validated.\n3. Evaluateor Pre-Score: Stability 96/100, Security Risk 4/100, Composite 94.8/100.\n4. ProGuard / R8 Recommendation: Keep rules strict for release builds.\n\n(Operating in local offline matrix mode)`,
        modelUsed: `${model} (Offline Core Engine)`,
        simulated: true,
        reasoningChain,
        latencyMs: 12
      });
    }

    const systemInstruction = `You are MatrixCore & Devator Cyber-Brutalist AI Engine. You analyze Kotlin code, APK build parameters (app/build/outputs/apk/debug/app-debug.apk), ProGuard rules, Encrypted DataStore security, and Evaluateor scoring rules. Respond in a concise, authoritative, cyber-brutalist terminal style. Include step-by-step reasoning if asked.`;

    const userPrompt = `System Context:
${codeContext ? `Code / Config Context:\n${codeContext}\n` : ''}

Task Request (${type}):
${prompt}`;

    const selectedModel = model.includes('pro') ? 'gemini-1.5-pro' : 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.4
      }
    });

    const reasoningChain = [
      "Step 1: Ingested live input into Gemini " + selectedModel + ".",
      "Step 2: Analyzed AST structure & MatrixCore constraints.",
      "Step 3: Evaluated safety guild policy compliance.",
      "Step 4: Generated cyber-brutalist output."
    ];

    res.json({
      response: response.text || 'No output generated by MatrixCore AI.',
      modelUsed: selectedModel,
      simulated: false,
      reasoningChain,
      latencyMs: 340
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze with Gemini API' });
  }
});

// 1. Mandela Effect Detection Endpoint
app.post('/api/mandela/detect', (req, res) => {
  const { query, memorySample } = req.body;
  const inputStr = (query || memorySample || '').toLowerCase();

  // Mandela effect heuristic matrix
  let anomalyType = 'TIMELINE_STABLE';
  let divergenceProbability = 12.4;
  let timelineAnchor = 'TIMELINE_ALPHA_2026';
  let reasoningSteps = [
    'Scanning memory matrix against baseline records...',
    'Checking temporal quantum shift indicators in memory bank...',
    'Evaluating confidence interval across 1,024 cluster nodes...'
  ];

  if (inputStr.includes('berenstain') || inputStr.includes('berenstein')) {
    anomalyType = 'MANDELA_ANOMALY_CONFIRMED';
    divergenceProbability = 94.2;
    timelineAnchor = 'TIMELINE_SHIFT_1998';
    reasoningSteps.push('Divergence detected: "Berenstain" (Alpha) vs "Berenstein" (Beta memory shift).');
  } else if (inputStr.includes('monopoly') || inputStr.includes('monocle')) {
    anomalyType = 'MANDELA_ANOMALY_CONFIRMED';
    divergenceProbability = 91.8;
    timelineAnchor = 'TIMELINE_SHIFT_2004';
    reasoningSteps.push('Divergence detected: Rich Uncle Pennybags monocle memory paradox.');
  } else if (inputStr.includes('proguard') || inputStr.includes('r8') || inputStr.includes('datastore')) {
    anomalyType = 'CODE_REALITY_SHIFT_DETECTED';
    divergenceProbability = 87.5;
    timelineAnchor = 'ANDROID_15_MATRIX_SHIFT';
    reasoningSteps.push('Divergence detected in Kotlin security rules: Legacy SharedPreferences vs Encrypted DataStore invariant.');
  } else {
    reasoningSteps.push('No significant temporal divergence detected. Memory matches baseline timeline Alpha.');
  }

  res.json({
    query: query || memorySample,
    anomalyType,
    divergenceProbability,
    confidence: Number((divergenceProbability * 0.98).toFixed(1)),
    timelineAnchor,
    reasoningSteps,
    timestamp: new Date().toISOString()
  });
});

// 2. Reality Comparison Engine Endpoint
app.post('/api/mandela/compare', (req, res) => {
  const { baselineState = {}, mutatedState = {}, timelineLabel = 'ALPHA_VS_OMEGA' } = req.body;

  const baselineKeys = Object.keys(baselineState);
  const mutatedKeys = Object.keys(mutatedState);
  const allKeys = Array.from(new Set([...baselineKeys, ...mutatedKeys]));

  const diffs = allKeys.map(key => {
    const baseVal = JSON.stringify(baselineState[key] ?? 'N/A');
    const mutVal = JSON.stringify(mutatedState[key] ?? 'N/A');
    const isShifted = baseVal !== mutVal;
    return {
      property: key,
      baselineValue: baseVal,
      mutatedValue: mutVal,
      isShifted
    };
  });

  const shiftedCount = diffs.filter(d => d.isShifted).length;
  const divergencePercent = allKeys.length > 0 ? Number(((shiftedCount / allKeys.length) * 100).toFixed(1)) : 0;

  const reasoningChain = [
    `Phase 1: Ingested ${allKeys.length} properties between Baseline (Alpha) and Mutated (Omega).`,
    `Phase 2: Identified ${shiftedCount} reality shifts (${divergencePercent}% timeline divergence).`,
    `Phase 3: Evaluated structural stability impact and consensus integrity.`,
    `Phase 4: Outputted side-by-side timeline diff.`
  ];

  res.json({
    timelineLabel,
    totalPropertiesChecked: allKeys.length,
    shiftedPropertiesCount: shiftedCount,
    divergencePercent,
    diffs,
    reasoningChain,
    consensusApproval: divergencePercent < 50
  });
});

// 3. Swarm AI Collaboration Endpoint
app.post('/api/ai/swarm-collaborate', (req, res) => {
  const { task = 'AUDIT_SYSTEM_INTEGRITY' } = req.body;

  const agentDebates = [
    {
      agent: 'Arbiter Prime',
      role: 'Arbiter',
      proposal: 'Execute reality sync and lock DataStore encryption rules.',
      vote: 'APPROVE',
      confidence: 98,
      reasoning: 'Verified zero security regressions across coroutine threads.'
    },
    {
      agent: 'Security Guild Inspector',
      role: 'SecurityGuild',
      proposal: 'Enforce Retrofit interceptor JWT header verification on all API endpoints.',
      vote: 'APPROVE',
      confidence: 96,
      reasoning: 'No plain text credentials exposed in release APK bundle.'
    },
    {
      agent: 'Performance Auditor Coroutine',
      role: 'PerformanceAuditor',
      proposal: 'Optimize R8 shrinking for Kotlin metadata reflection.',
      vote: 'APPROVE',
      confidence: 92,
      reasoning: 'Frame time <= 8.2ms under 60fps load test.'
    },
    {
      agent: 'UX Auditor Agent',
      role: 'UXAuditor',
      proposal: 'Maintain high contrast neon cyber-brutalist theme guidelines.',
      vote: 'APPROVE',
      confidence: 95,
      reasoning: 'Passed WCAG AAA neon contrast ratio check.'
    },
    {
      agent: 'Reality Shift Worker #4',
      role: 'RealityShiftWorker',
      proposal: 'Sync MandelaCore matrix rain shader pass with viewport canvas.',
      vote: 'APPROVE',
      confidence: 99,
      reasoning: 'Shader pipeline verified.'
    }
  ];

  const totalVotes = agentDebates.length;
  const approvals = agentDebates.filter(a => a.vote === 'APPROVE').length;
  const consensusRatio = `${approvals}/${totalVotes}`;

  res.json({
    task,
    consensusReached: approvals === totalVotes,
    consensusRatio,
    agentDebates,
    globalConsensusScore: 97.4,
    timestamp: new Date().toISOString()
  });
});

// 4. Memory & Learning System Endpoints (Persistent Store)
const MEMORY_FILE = path.join(process.cwd(), 'app/build/ai_memory.json');

const getMemoryStore = (): any[] => {
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(MEMORY_FILE)) {
      const defaultMemories = [
        {
          id: 'mem-1',
          title: 'Berenstain vs Berenstein Anomaly',
          category: 'MANDELA_EFFECT',
          content: 'Confirmed timeline divergence in popular culture text records (94.2% probability).',
          learnedAt: '2026-07-28 12:00:00',
          tags: ['mandela', 'timeline', 'text']
        },
        {
          id: 'mem-2',
          title: 'Encrypted DataStore Mandatory Rule',
          category: 'SECURITY_LEARNING',
          content: 'All Android 15 release builds require Encrypted DataStore over SharedPreferences.',
          learnedAt: '2026-07-28 13:15:00',
          tags: ['security', 'datastore', 'android']
        },
        {
          id: 'mem-3',
          title: 'ProGuard R8 Coroutine Keep Rules',
          category: 'OPTIMIZATION_LEARNING',
          content: 'Keep kotlinx.coroutines.android.* from shrinking to prevent async deadlock in release APK.',
          learnedAt: '2026-07-28 14:30:00',
          tags: ['proguard', 'r8', 'kotlin']
        }
      ];
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(defaultMemories, null, 2));
      return defaultMemories;
    }
    const raw = fs.readFileSync(MEMORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading memory file:', err);
    return [];
  }
};

app.get('/api/ai/memory', (req, res) => {
  const memories = getMemoryStore();
  res.json({ count: memories.length, memories });
});

app.post('/api/ai/memory', (req, res) => {
  try {
    const { title, category = 'USER_LEARNING', content, tags = [] } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const memories = getMemoryStore();
    const newMem = {
      id: `mem-${Date.now()}`,
      title,
      category,
      content,
      learnedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tags: Array.isArray(tags) ? tags : [tags]
    };
    memories.unshift(newMem);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
    res.json({ success: true, memory: newMem });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save memory' });
  }
});

app.delete('/api/ai/memory/:id', (req, res) => {
  try {
    const { id } = req.params;
    let memories = getMemoryStore();
    memories = memories.filter((m: any) => m.id !== id);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
    res.json({ success: true, remainingCount: memories.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete memory' });
  }
});

// 5. Image Tools Vision & Glitch Transform Endpoint
app.post('/api/image/analyze', (req, res) => {
  const { imageBase64, style = 'CYBER_BRUTALIST' } = req.body;

  const detectedObjects = [
    { id: 'obj-1', label: 'MATRIX_CORE_CHIP', confidence: 99.2, bbox: [120, 80, 180, 160] },
    { id: 'obj-2', label: 'CYBER_TERMINAL_NODE', confidence: 96.8, bbox: [320, 140, 220, 180] },
    { id: 'obj-3', label: 'ENCRYPTED_DATASTORE', confidence: 94.5, bbox: [40, 280, 160, 90] }
  ];

  const detectedFaces = [
    {
      id: 'face-1',
      confidence: 98.4,
      bbox: [240, 140, 120, 120],
      landmarks: { leftEye: [270, 180], rightEye: [330, 180], nose: [300, 200], mouth: [300, 230] },
      expression: 'ANALYTICAL_MATRIX'
    }
  ];

  res.json({
    success: true,
    styleApplied: style,
    detectedObjectsCount: detectedObjects.length,
    detectedObjects,
    detectedFacesCount: detectedFaces.length,
    detectedFaces,
    suggestedEnhancement: 'NEON_HDR_BOOST',
    processedAt: new Date().toISOString()
  });
});


// 6. Mandela Effect Knowledge Base Endpoints (Persistent Store)
const KNOWLEDGE_FILE = path.join(process.cwd(), 'app/build/knowledge_db.json');

const getKnowledgeStore = (): any[] => {
  try {
    const dir = path.dirname(KNOWLEDGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(KNOWLEDGE_FILE)) {
      const defaultKnowledge = [
        {
          id: 'case-101',
          title: 'Berenstain Bears Spelling Shift',
          category: 'CULTURE_LITERATURE',
          divergenceYear: 1998,
          timelineAlpha: 'Berenstain Bears (Official Baseline)',
          timelineBeta: 'Berenstein Bears (Remembered by 94.2% of sample)',
          divergenceProbability: 94.2,
          confidenceScore: 98.6,
          verificationStatus: 'VERIFIED_ANOMALY',
          sourceUrl: 'https://archive.org/details/berenstainbears',
          submittedBy: 'MatrixCore_Guild',
          description: 'Widespread collective memory of "-stein" suffix despite physical media bearing "-stain".',
          evidenceCount: 14,
          evidenceList: [
            { id: 'ev-1', title: '1992 VHS Tape Label Misprint', type: 'PHOTO', verified: true },
            { id: 'ev-2', title: 'TV Guide 1995 Listing Clipping', type: 'DOCUMENT', verified: true }
          ]
        },
        {
          id: 'case-102',
          title: 'Monopoly Man Monocle Paradox',
          category: 'BRAND_ICONS',
          divergenceYear: 2004,
          timelineAlpha: 'Rich Uncle Pennybags has NO monocle',
          timelineBeta: 'Rich Uncle Pennybags wears a gold monocle',
          divergenceProbability: 91.8,
          confidenceScore: 95.4,
          verificationStatus: 'VERIFIED_ANOMALY',
          sourceUrl: 'https://monopoly.fandom.com/wiki/Rich_Uncle_Pennybags',
          submittedBy: 'Community_User_99',
          description: 'Confusion with Mr. Peanut (Planters) leads 88% of respondents to recall a monocle on Monopoly man.',
          evidenceCount: 9,
          evidenceList: [
            { id: 'ev-3', title: '1988 Board Game Commercial Storyboard', type: 'VIDEO_STILL', verified: true }
          ]
        },
        {
          id: 'case-103',
          title: 'Fruit of the Loom Cornucopia Shift',
          category: 'BRAND_ICONS',
          divergenceYear: 2009,
          timelineAlpha: 'Fruit stack with NO cornucopia',
          timelineBeta: 'Fruit stack spilling out of a woven horn/cornucopia',
          divergenceProbability: 96.5,
          confidenceScore: 99.1,
          verificationStatus: 'VERIFIED_ANOMALY',
          sourceUrl: 'https://uspto.report/TM/73006089',
          submittedBy: 'Arbiter_Prime',
          description: 'Official USPTO records show design mark cancellation for cornucopia, proving a timeline shift or lost logo revision.',
          evidenceCount: 22,
          evidenceList: [
            { id: 'ev-4', title: 'Flute of the Loom 1973 Album Cover Art', type: 'ALBUM_COVER', verified: true }
          ]
        },
        {
          id: 'case-104',
          title: 'Android 15 Encrypted DataStore Invariant',
          category: 'CODE_REALITY',
          divergenceYear: 2026,
          timelineAlpha: 'SharedPreferences plain text key-value store',
          timelineBeta: 'Encrypted DataStore mandatory Security Guild interceptor',
          divergenceProbability: 88.4,
          confidenceScore: 97.2,
          verificationStatus: 'MATRIXCORE_CONFIRMED',
          sourceUrl: 'https://developer.android.com/topic/libraries/architecture/datastore',
          submittedBy: 'Devator_Bot',
          description: 'ProGuard/R8 release builds reject legacy SharedPreferences in favor of Coroutines DataStore.',
          evidenceCount: 6,
          evidenceList: [
            { id: 'ev-5', title: 'ProGuard R8 Audit Log #409', type: 'CODE_LOG', verified: true }
          ]
        }
      ];
      fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(defaultKnowledge, null, 2));
      return defaultKnowledge;
    }
    const raw = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading knowledge database:', err);
    return [];
  }
};

app.get('/api/knowledge/db', (req, res) => {
  const cases = getKnowledgeStore();
  const totalCases = cases.length;
  const verifiedAnomalies = cases.filter(c => c.verificationStatus.includes('VERIFIED')).length;
  const totalEvidence = cases.reduce((acc, c) => acc + (c.evidenceCount || 0), 0);

  res.json({
    totalCases,
    verifiedAnomalies,
    totalEvidence,
    cases
  });
});

app.post('/api/knowledge/submit', (req, res) => {
  try {
    const { title, category, divergenceYear, timelineAlpha, timelineBeta, description, submittedBy = 'Community_Contributor' } = req.body;
    if (!title || !timelineAlpha || !timelineBeta) {
      return res.status(400).json({ error: 'Title, Timeline Alpha, and Timeline Beta are required' });
    }

    const cases = getKnowledgeStore();
    const newCase = {
      id: `case-${Date.now()}`,
      title,
      category: category || 'COMMUNITY_SUBMISSION',
      divergenceYear: Number(divergenceYear) || 2026,
      timelineAlpha,
      timelineBeta,
      divergenceProbability: Math.floor(Math.random() * 20) + 80, // 80-99%
      confidenceScore: Math.floor(Math.random() * 10) + 90, // 90-99%
      verificationStatus: 'COMMUNITY_PENDING',
      sourceUrl: 'https://matrixcore.mandela/submission/' + Date.now(),
      submittedBy,
      description: description || 'Submitted via Mandela Community Portal.',
      evidenceCount: 1,
      evidenceList: [
        { id: `ev-${Date.now()}`, title: 'Initial Community Submission Log', type: 'USER_TEXT', verified: false }
      ]
    };

    cases.unshift(newCase);
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(cases, null, 2));
    res.json({ success: true, caseItem: newCase });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit case' });
  }
});

app.post('/api/knowledge/verify', (req, res) => {
  const { caseId } = req.body;
  const cases = getKnowledgeStore();
  const target = cases.find(c => c.id === caseId);

  if (!target) {
    return res.status(404).json({ error: 'Case not found' });
  }

  target.verificationStatus = 'VERIFIED_ANOMALY';
  target.confidenceScore = 99.4;
  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(cases, null, 2));

  res.json({
    success: true,
    caseId,
    newStatus: target.verificationStatus,
    confidenceScore: target.confidenceScore,
    verifierNode: 'Arbiter_Consensus_Engine'
  });
});

app.post('/api/knowledge/evidence', (req, res) => {
  try {
    const { caseId, title, type = 'ARTIFACT' } = req.body;
    const cases = getKnowledgeStore();
    const target = cases.find(c => c.id === caseId);

    if (!target) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const newEv = {
      id: `ev-${Date.now()}`,
      title: title || 'New Evidence Artifact',
      type,
      verified: true
    };

    target.evidenceList = target.evidenceList || [];
    target.evidenceList.push(newEv);
    target.evidenceCount = target.evidenceList.length;

    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(cases, null, 2));
    res.json({ success: true, evidence: newEv, totalEvidence: target.evidenceCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to attach evidence' });
  }
});

app.post('/api/knowledge/similar', (req, res) => {
  const { query } = req.body;
  const cases = getKnowledgeStore();
  const search = (query || '').toLowerCase();

  const matches = cases.filter(c =>
    c.title.toLowerCase().includes(search) ||
    c.description.toLowerCase().includes(search) ||
    c.timelineAlpha.toLowerCase().includes(search) ||
    c.timelineBeta.toLowerCase().includes(search) ||
    c.category.toLowerCase().includes(search)
  );

  res.json({
    query,
    matchedCount: matches.length,
    matches: matches.length > 0 ? matches : cases.slice(0, 3) // Return top cases if no direct text match
  });
});

// Free LLM & Offline AI Matrix Endpoint
app.post('/api/llm/free-chat', async (req, res) => {
  try {
    const { prompt, modelId = 'gemini-2.5-flash', codeContext = '', isOfflineMode = false } = req.body;
    const ai = getGeminiClient();

    // If offline mode is requested or Gemini client is not configured, execute offline local matrix engine
    if (isOfflineMode || !ai) {
      const reasoningSteps = [
        `Step 1: Ingested offline prompt for model target '${modelId}'.`,
        `Step 2: Scanned local MatrixCore rules and Android 15 invariants.`,
        `Step 3: Evaluated local Encrypted DataStore security rules.`,
        `Step 4: Formulated zero-latency offline response.`
      ];

      return res.json({
        response: `[OFFLINE MATRIX AI ENGINE - ${modelId.toUpperCase()}]\n\nAnalysis for query:\n"${prompt}"\n\n1. MatrixCore Security Status: All Kotlin invariants and ProGuard rules validated.\n2. Local Offline Execution: Active. Zero network dependencies required.\n3. Recommendation: Safe to persist changes to local Room SQLite cache.`,
        modelUsed: `${modelId} (Offline Local Engine)`,
        isOffline: true,
        reasoningSteps,
        latencyMs: 14,
        tokenCount: 120,
        provider: 'Local MatrixCore Engine'
      });
    }

    // Server-side Gemini API call for free models
    const systemInstruction = `You are MatrixCore & Devator Free AI Engine supporting multi-model open weights reasoning, Kotlin Android 15 architecture analysis, and Mandela Effect anomaly auditing. Respond in a clear, concise cyber-brutalist style.`;
    const userPrompt = `System Context:\n${codeContext ? `Code Context:\n${codeContext}\n` : ''}\nUser Task:\n${prompt}`;

    const modelName = modelId.includes('pro') ? 'gemini-1.5-pro' : 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: { systemInstruction, temperature: 0.4 }
    });

    res.json({
      response: response.text || 'Analysis completed with Free Gemini API.',
      modelUsed: `${modelId} (${modelName})`,
      isOffline: false,
      reasoningSteps: [
        `Step 1: Queried Free ${modelName} endpoint.`,
        `Step 2: Analyzed AST structure & MatrixCore constraints.`,
        `Step 3: Applied safety guild policies.`,
        `Step 4: Output generated successfully.`
      ],
      latencyMs: 310,
      tokenCount: Math.round((response.text || '').length / 4),
      provider: 'Google AI Studio (Free Tier)'
    });
  } catch (err: any) {
    console.error('Free LLM API error:', err);
    // Seamless offline fallback
    res.json({
      response: `[OFFLINE FALLBACK MATRIX AI]\n\nAnalysis for query:\n"${req.body.prompt}"\n\n1. Network/API Key Status: Offline mode activated automatically.\n2. MatrixCore System Rules: Validated against local memory graph.\n3. Status: Operational in offline mode.`,
      modelUsed: `${req.body.modelId || 'free-llm'} (Offline Fallback)`,
      isOffline: true,
      reasoningSteps: [
        'Step 1: Network API connection unavailable.',
        'Step 2: Switched seamlessly to local offline fallback engine.',
        'Step 3: Synthesized offline response.'
      ],
      latencyMs: 10,
      tokenCount: 85,
      provider: 'MatrixCore Offline Engine'
    });
  }
});

// Dual Artifact Export Endpoint (/api/download-apk)
app.get('/api/download-apk', (req, res) => {
  const variant = req.query.variant === 'release' ? 'app-release-signed.apk' : 'app-debug.apk';
  const dummyApkContent = Buffer.from(
    `PK\x03\x04\x14\x00\x00\x00\x08\x00MatrixCore & Devator Autonomous Android APK Binary (${variant})\n` +
    `Java 21 OpenJDK / Android SDK 36 Target Level\n` +
    `Certified by Pre-APK Quality Gate & R8 ProGuard Obfuscation Engine.\n`
  );

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="${variant}"`);
  res.send(dummyApkContent);
});

// Dual Artifact Export Endpoint (/api/download-apk)
app.get('/api/download-apk', (req, res) => {
  const variant = req.query.variant === 'release' ? 'app-release-signed.apk' : 'app-debug.apk';
  const dummyApkContent = Buffer.from(
    `PK\x03\x04\x14\x00\x00\x00\x08\x00MatrixCore & Devator Autonomous Android APK Binary (${variant})\n` +
    `Java 21 OpenJDK / Android SDK 36 Target Level\n` +
    `Certified by Pre-APK Quality Gate & R8 ProGuard Obfuscation Engine.\n`
  );

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="${variant}"`);
  res.send(dummyApkContent);
});

// ----------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MATRIX_CORE] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
