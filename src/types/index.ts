export type ModuleId = 
  | '/matrixcore'
  | '/mandelacore'
  | '/devator'
  | '/evaluateor'
  | '/ui'
  | '/data'
  | '/domain'
  | '/system';

export type MutationStatus = 
  | 'DRAFT'
  | 'VALIDATING'
  | 'AUDITING'
  | 'EVALUATING'
  | 'CONSENSUS'
  | 'APPLIED'
  | 'REJECTED'
  | 'REVERTED';

export interface MutationProposal {
  id: string;
  title: string;
  targetModule: ModuleId;
  targetProperty: string;
  newValue: string;
  previousValue: string;
  diffText: string;
  proposedBy: 'Developer' | 'Devator AI' | 'Swarm Coroutine';
  rationale: string;
  status: MutationStatus;
  timestamp: string;
  isReversible: boolean;
  score?: EvaluateorScore;
  consensusVotes?: {
    agents: number; // e.g. 8/10
    clusters: number; // e.g. 3/3
    colony: number; // e.g. 1/1
    globalApproval: boolean;
  };
}

export interface EvaluateorScore {
  stability: number; // 0 - 100
  performance: number; // 0 - 100
  uxImpact: number; // 0 - 100
  identityAlignment: number; // 0 - 100
  securityRisk: number; // 0 - 100 (Lower is safer)
  compositeIndex: number; // 0 - 100 calculated
  passedThreshold: boolean;
  rejectionReasons: string[];
  approvalNotes: string[];
}

export interface SwarmAgent {
  id: string;
  name: string;
  role: 'Arbiter' | 'SecurityGuild' | 'PerformanceAuditor' | 'UXAuditor' | 'RealityShiftWorker';
  status: 'IDLE' | 'COMPUTING' | 'MUTATING' | 'VOTING' | 'AUDITING';
  currentTask: string;
  microtaskCount: number;
  lastActive: string;
}

export interface ApkBuildInfo {
  path: string; // "app/build/outputs/apk/debug/app-debug.apk"
  packageName: string; // "com.matrixcore.mandela.app"
  versionName: string; // "2.4.0-matrix"
  versionCode: number; // 2040
  apkSizeMb: number; // e.g. 14.2
  buildType: 'debug' | 'release';
  signedAab: boolean;
  r8Shrinking: boolean;
  proguardRulesActive: boolean;
  encryptedDataStore: boolean;
  retrofitInterceptors: boolean;
  debugLogsInRelease: boolean;
  securityGuildApproved: boolean;
  evaluateorApproval: boolean;
  permissions: string[];
  dexClasses: number;
  lastBuilt: string;
}

export interface RealitySettings {
  glitchIntensity: number; // 0 - 100
  theme: 'LIME_NEON' | 'HOT_CRIMSON' | 'CYBER_YELLOW' | 'ELECTRIC_CYAN';
  scanlines: boolean;
  crtFlicker: boolean;
  matrixRain: boolean;
  soundEnabled: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'SYSTEM' | 'MUTATION' | 'MATRIXCORE' | 'EVALUATEOR' | 'SECURITY' | 'MANDELA';
  message: string;
  details?: string;
}

export interface SystemModuleFile {
  path: string;
  name: string;
  module: ModuleId;
  readOnly: boolean;
  content: string;
  description: string;
}
