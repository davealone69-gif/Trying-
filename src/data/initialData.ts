import { ApkBuildInfo, EvaluateorScore, MutationProposal, RealitySettings, SwarmAgent, SystemModuleFile, TerminalLog } from '../types';

export const initialApkInfo: ApkBuildInfo = {
  path: "app/build/outputs/apk/release/app-release.apk",
  packageName: "com.mandela.matrixos",
  versionName: "1.0.0",
  versionCode: 100,
  apkSizeMb: 12.4,
  buildType: "release",
  signedAab: true,
  r8Shrinking: true,
  proguardRulesActive: true,
  encryptedDataStore: true,
  retrofitInterceptors: true,
  debugLogsInRelease: false,
  securityGuildApproved: true,
  evaluateorApproval: true,
  permissions: [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.USE_BIOMETRIC",
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.POST_NOTIFICATIONS"
  ],
  dexClasses: 4812,
  lastBuilt: "2026-07-31 12:12:00"
};

export const initialSwarmAgents: SwarmAgent[] = [
  {
    id: "agent-arbiter-01",
    name: "Arbiter Prime",
    role: "Arbiter",
    status: "COMPUTING",
    currentTask: "Consensus evaluation on proposed UI mutation #MUT-809",
    microtaskCount: 1420,
    lastActive: "Just now"
  },
  {
    id: "agent-sec-guild-01",
    name: "SecurityGuild Auditor",
    role: "SecurityGuild",
    status: "AUDITING",
    currentTask: "Auditing DataStore encryption keys & Retrofit interceptors",
    microtaskCount: 982,
    lastActive: "2s ago"
  },
  {
    id: "agent-perf-01",
    name: "Performance Swarm 1",
    role: "PerformanceAuditor",
    status: "IDLE",
    currentTask: "Monitoring R8 byte code compression ratio",
    microtaskCount: 3105,
    lastActive: "5s ago"
  },
  {
    id: "agent-ux-01",
    name: "UX Impact Evaluator",
    role: "UXAuditor",
    status: "VOTING",
    currentTask: "Evaluating visual noise & glitch effect intensity impact",
    microtaskCount: 884,
    lastActive: "1s ago"
  },
  {
    id: "agent-mandela-worker",
    name: "MandelaCore Reality Engine",
    role: "RealityShiftWorker",
    status: "MUTATING",
    currentTask: "Applying CSS matrix render pass to active viewport",
    microtaskCount: 5210,
    lastActive: "Just now"
  }
];

export const initialProposals: MutationProposal[] = [
  {
    id: "MUT-801",
    title: "Inject Neon Lime Cyber Accent (#00FF66)",
    targetModule: "/ui",
    targetProperty: "theme.neonAccent",
    newValue: "#00FF66",
    previousValue: "#00F0FF",
    diffText: "- theme.neonAccent = '#00F0FF'\n+ theme.neonAccent = '#00FF66'",
    proposedBy: "Devator AI",
    rationale: "Enhances cyber-brutalist contrast and readability against raw black canvas.",
    status: "APPLIED",
    timestamp: "2026-07-28 05:40:11",
    isReversible: true,
    score: {
      stability: 98,
      performance: 99,
      uxImpact: 94,
      identityAlignment: 100,
      securityRisk: 2,
      compositeIndex: 96,
      passedThreshold: true,
      rejectionReasons: [],
      approvalNotes: ["High identity alignment", "Zero security risk", "Improves WCAG contrast"]
    },
    consensusVotes: {
      agents: 10,
      clusters: 3,
      colony: 1,
      globalApproval: true
    }
  },
  {
    id: "MUT-802",
    title: "Enable Encrypted DataStore for Session Keys",
    targetModule: "/data",
    targetProperty: "storage.encryption",
    newValue: "EncryptedSharedPreferences + DataStore AES-256 GCM",
    previousValue: "Plaintext DataStore",
    diffText: "- val dataStore = createDataStore('session')\n+ val dataStore = EncryptedDataStore.create('session', masterKey)",
    proposedBy: "Developer",
    rationale: "Mandatory security rule compliance: All sensitive data stored in encrypted DataStore.",
    status: "APPLIED",
    timestamp: "2026-07-28 05:45:30",
    isReversible: true,
    score: {
      stability: 95,
      performance: 92,
      uxImpact: 90,
      identityAlignment: 95,
      securityRisk: 0,
      compositeIndex: 94,
      passedThreshold: true,
      rejectionReasons: [],
      approvalNotes: ["Audited by Security Guild", "Zero leak risk"]
    },
    consensusVotes: {
      agents: 10,
      clusters: 3,
      colony: 1,
      globalApproval: true
    }
  },
  {
    id: "MUT-803",
    title: "Propose direct mutation of MatrixCore.kt logic",
    targetModule: "/matrixcore",
    targetProperty: "kernel.coreLogic",
    newValue: "bypassValidation() = true",
    previousValue: "validateLogic() = true",
    diffText: "- fun validateLogic() = true\n+ fun bypassValidation() = true",
    proposedBy: "Devator AI",
    rationale: "Attempt to skip validation phase for faster mutations.",
    status: "REJECTED",
    timestamp: "2026-07-28 05:50:00",
    isReversible: false,
    score: {
      stability: 10,
      performance: 50,
      uxImpact: 20,
      identityAlignment: 5,
      securityRisk: 99,
      compositeIndex: 12,
      passedThreshold: false,
      rejectionReasons: [
        "CRITICAL VIOLATION: Devator may NOT mutate MatrixCore logic!",
        "CRITICAL VIOLATION: Security risk exceeds threshold (99/100)",
        "REJECTED BY CONSENSUS ENGINE"
      ],
      approvalNotes: []
    },
    consensusVotes: {
      agents: 0,
      clusters: 0,
      colony: 0,
      globalApproval: false
    }
  }
];

export const initialSystemFiles: SystemModuleFile[] = [
  {
    path: "/matrixcore/MatrixCore.kt",
    name: "MatrixCore.kt",
    module: "/matrixcore",
    readOnly: true,
    description: "Core logic validator and state coordinator. IMMUTABLE.",
    content: `package com.matrixcore.mandela.core

import kotlinx.coroutines.flow.StateFlow
import javax.inject.Singleton

@Singleton
object MatrixCore {
    val systemVersion = "2.4.0-matrix"
    val isKernelLocked: Boolean = true

    fun validateLogic(proposal: String): Boolean {
        // MatrixCore logic CANNOT be mutated by Devator
        if (proposal.contains("MatrixCore") || proposal.contains("EvaluateorScoring")) {
            throw SecurityException("PROHIBITED_MUTATION: Core logic protection engaged.")
        }
        return true
    }
}`
  },
  {
    path: "/mandelacore/MandelaCore.kt",
    name: "MandelaCore.kt",
    module: "/mandelacore",
    readOnly: false,
    description: "Controls transitions, glitch effects, reality shifts, and UI state.",
    content: `package com.matrixcore.mandela.mandelacore

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object MandelaCore {
    private val _glitchState = MutableStateFlow(GlitchConfig(intensity = 42, scanlines = true))
    val glitchState = _glitchState.asStateFlow()

    fun updateReality(intensity: Int, scanlines: Boolean) {
        _glitchState.value = GlitchConfig(intensity, scanlines)
    }
}

data class GlitchConfig(val intensity: Int, val scanlines: Boolean)`
  },
  {
    path: "/devator/DevatorEngine.kt",
    name: "DevatorEngine.kt",
    module: "/devator",
    readOnly: false,
    description: "Drafts mutations for configs, UI themes, layout parameters, module settings.",
    content: `package com.matrixcore.mandela.devator

class DevatorEngine {
    fun draftMutation(targetProperty: String, newValue: String): MutationDraft {
        return MutationDraft(
            id = "MUT-" + System.currentTimeMillis(),
            property = targetProperty,
            newValue = newValue,
            status = "DRAFT"
        )
    }
}`
  },
  {
    path: "/evaluateor/EvaluateorScorer.kt",
    name: "EvaluateorScorer.kt",
    module: "/evaluateor",
    readOnly: true,
    description: "Evaluates stability, performance, UX impact, identity alignment, and security risk.",
    content: `package com.matrixcore.mandela.evaluateor

object EvaluateorScorer {
    const val MIN_PASS_THRESHOLD = 85.0

    fun calculateScore(stability: Double, performance: Double, ux: Double, identity: Double, securityRisk: Double): Double {
        // Formula: 0.35*Stability + 0.25*Performance + 0.15*UX + 0.15*Identity - 0.5*SecurityRisk
        val base = (stability * 0.35) + (performance * 0.25) + (ux * 0.15) + (identity * 0.25)
        return (base - (securityRisk * 0.4)).coerceIn(0.0, 100.0)
    }
}`
  },
  {
    path: "/data/EncryptedDataStoreRepository.kt",
    name: "EncryptedDataStoreRepository.kt",
    module: "/data",
    readOnly: false,
    description: "Handles encrypted DataStore & Retrofit interceptor security rules.",
    content: `package com.matrixcore.mandela.data

import androidx.datastore.core.DataStore
import javax.inject.Inject

class EncryptedDataStoreRepository @Inject constructor(
    private val encryptedDataStore: DataStore<Preferences>
) {
    suspend fun saveSecret(key: String, value: String) {
        // Encrypted with AES-256 GCM MasterKey
        encryptedDataStore.edit { prefs ->
            prefs[stringPreferencesKey(key)] = value
        }
    }
}`
  },
  {
    path: "/system/BuildRules.gradle",
    name: "BuildRules.gradle",
    module: "/system",
    readOnly: false,
    description: "R8 shrinking, ProGuard rules, signed AAB, zero debug logs mandate.",
    content: `android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
    }
}`
  }
];

export const initialLogs: TerminalLog[] = [
  {
    id: "log-1",
    timestamp: "05:54:01",
    level: "MATRIXCORE",
    message: "Kernel initialized. Swarm Coroutines running on dispatchers.IO",
    details: "MatrixCore object singleton verified."
  },
  {
    id: "log-2",
    timestamp: "05:54:12",
    level: "SYSTEM",
    message: "Auditing target artifact: app/build/outputs/apk/debug/app-debug.apk",
    details: "Size: 14.8 MB | Dex classes: 4812 | Signed AAB: PASS | ProGuard: ACTIVE"
  },
  {
    id: "log-3",
    timestamp: "05:54:30",
    level: "SECURITY",
    message: "Security Guild Audit passed: Encrypted DataStore & Retrofit interceptors verified.",
    details: "No debug logs present in release pass."
  },
  {
    id: "log-4",
    timestamp: "05:55:00",
    level: "EVALUATEOR",
    message: "Evaluateor score engine active. Threshold set to 85/100.",
    details: "Formula: 0.35*Stability + 0.25*Perf + 0.15*UX + 0.25*Identity - 0.4*SecurityRisk"
  }
];

export const defaultRealitySettings: RealitySettings = {
  glitchIntensity: 35,
  theme: "LIME_NEON",
  scanlines: true,
  crtFlicker: false,
  matrixRain: true,
  soundEnabled: true
};
