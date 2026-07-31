import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  PlusCircle,
  Clock,
  ShieldCheck,
  FileCheck,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  Upload,
  Radio,
  Sliders,
  Share2,
  Zap,
  Star,
  Download,
  Smartphone,
  Database,
  Wifi,
  WifiOff,
  Palette,
  History,
  Copy,
  Check,
  FileText,
  Code
} from 'lucide-react';
import { TerminalLog } from '../types';
import { sound } from '../utils/audio';

interface MandelaKnowledgeMatrixProps {
  addLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
}

interface MandelaCase {
  id: string;
  title: string;
  category: string;
  divergenceYear: number;
  timelineAlpha: string;
  timelineBeta: string;
  divergenceProbability: number;
  confidenceScore: number;
  verificationStatus: string;
  sourceUrl: string;
  submittedBy: string;
  description: string;
  evidenceCount: number;
  evidenceList: { id: string; title: string; type: string; verified: boolean }[];
}

export const MandelaKnowledgeMatrix: React.FC<MandelaKnowledgeMatrixProps> = ({ addLog }) => {
  const [cases, setCases] = useState<MandelaCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    | 'DATABASE'
    | 'SUBMIT'
    | 'TIMELINE'
    | 'VERIFICATION'
    | 'EVIDENCE'
    | 'SIMILAR_FINDER'
    | 'ANDROID_FEATURES'
    | 'FAVOURITES'
    | 'HISTORY'
    | 'SHARE_EXPORT'
  >('DATABASE');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [yearMin, setYearMin] = useState<number>(1950);
  const [yearMax, setYearMax] = useState<number>(2026);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Favourites & History State
  const [favourites, setFavourites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mandela_favourites');
      return saved ? JSON.parse(saved) : ['case-101', 'case-103'];
    } catch {
      return ['case-101', 'case-103'];
    }
  });

  const [historyLogs, setHistoryLogs] = useState<{ id: string; title: string; time: string; action: string }[]>(() => {
    try {
      const saved = localStorage.getItem('mandela_history');
      return saved ? JSON.parse(saved) : [
        { id: 'case-101', title: 'Berenstain Bears Spelling Shift', time: '18:40', action: 'VIEWED_CASE' },
        { id: 'case-103', title: 'Fruit of the Loom Cornucopia Shift', time: '18:42', action: 'VERIFIED_SOURCE' }
      ];
    } catch {
      return [];
    }
  });

  // Offline-First & Android State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [roomCacheCount, setRoomCacheCount] = useState<number>(4);
  const [activeMatrixTheme, setActiveMatrixTheme] = useState<'CYBER_NEON' | 'OLED_BLACK' | 'HOT_CRIMSON' | 'CYAN_PULSE'>('CYBER_NEON');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Selected Case for Details / Verification / Evidence
  const [selectedCase, setSelectedCase] = useState<MandelaCase | null>(null);

  // New Case Submission Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('BRAND_ICONS');
  const [newYear, setNewYear] = useState<number>(2024);
  const [newAlpha, setNewAlpha] = useState('');
  const [newBeta, setNewBeta] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evidence Addition Form
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState('PHOTO');

  // Similar Case Finder Search
  const [similarQuery, setSimilarQuery] = useState('');
  const [similarResults, setSimilarResults] = useState<MandelaCase[]>([]);

  // Room Query Simulator State
  const [roomSqlQuery, setRoomSqlQuery] = useState('SELECT * FROM mandela_cases WHERE category = "BRAND_ICONS";');
  const [roomQueryResult, setRoomQueryResult] = useState<any[]>([]);

  // Fetch Knowledge Database from server
  const fetchKnowledgeDatabase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/knowledge/db');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        setRoomCacheCount(data.cases?.length || 0);
        if (data.cases && data.cases.length > 0 && !selectedCase) {
          setSelectedCase(data.cases[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch knowledge db:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeDatabase();
  }, []);

  // Save Favourites
  useEffect(() => {
    try {
      localStorage.setItem('mandela_favourites', JSON.stringify(favourites));
    } catch (e) {
      console.error('Error saving favourites:', e);
    }
  }, [favourites]);

  // Save History
  useEffect(() => {
    try {
      localStorage.setItem('mandela_history', JSON.stringify(historyLogs));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }, [historyLogs]);

  // Toggle Favourite
  const toggleFavourite = (caseId: string) => {
    sound.playClick();
    setFavourites(prev => {
      const isFav = prev.includes(caseId);
      const updated = isFav ? prev.filter(id => id !== caseId) : [...prev, caseId];
      addLog({
        level: 'SYSTEM',
        message: `${isFav ? 'REMOVED FROM' : 'ADDED TO'} FAVOURITES (${caseId})`,
        details: `Total Favourites: ${updated.length}`
      });
      return updated;
    });
  };

  // Add to History Audit
  const recordHistory = (caseItem: MandelaCase, action: string) => {
    const entry = {
      id: caseItem.id,
      title: caseItem.title,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action
    };
    setHistoryLogs(prev => [entry, ...prev.slice(0, 19)]); // Keep last 20 entries
  };

  // Handle New Submission
  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAlpha || !newBeta) return;

    sound.playClick();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/knowledge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          divergenceYear: newYear,
          timelineAlpha: newAlpha,
          timelineBeta: newBeta,
          description: newDesc,
          submittedBy: 'Devator_Swarm_User'
        })
      });

      if (res.ok) {
        const data = await res.json();
        sound.playMutationSuccess();
        addLog({
          level: 'SYSTEM',
          message: `NEW MANDELA CASE SUBMITTED (${data.caseItem.title})`,
          details: `ID: ${data.caseItem.id} | Year: ${data.caseItem.divergenceYear}`
        });

        // Reset form
        setNewTitle('');
        setNewAlpha('');
        setNewBeta('');
        setNewDesc('');
        setActiveTab('DATABASE');
        fetchKnowledgeDatabase();
      }
    } catch (err) {
      console.error('Error submitting case:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Case Verification Audit
  const handleVerifyCase = async (caseId: string) => {
    sound.playClick();
    try {
      const res = await fetch('/api/knowledge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId })
      });

      if (res.ok) {
        sound.playMutationSuccess();
        addLog({
          level: 'EVALUATEOR',
          message: `SOURCE VERIFICATION COMPLETE FOR ${caseId}`,
          details: 'Status upgraded to VERIFIED_ANOMALY with 99.4% confidence score.'
        });
        fetchKnowledgeDatabase();
      }
    } catch (err) {
      console.error('Failed to verify case:', err);
    }
  };

  // Attach Evidence Artifact
  const handleAttachEvidence = async () => {
    if (!selectedCase || !newEvidenceTitle) return;
    sound.playClick();

    try {
      const res = await fetch('/api/knowledge/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCase.id,
          title: newEvidenceTitle,
          type: newEvidenceType
        })
      });

      if (res.ok) {
        sound.playMutationSuccess();
        addLog({
          level: 'SYSTEM',
          message: `EVIDENCE ARTIFACT ATTACHED TO ${selectedCase.id}`,
          details: `Title: ${newEvidenceTitle} | Type: ${newEvidenceType}`
        });
        setNewEvidenceTitle('');
        fetchKnowledgeDatabase();
      }
    } catch (err) {
      console.error('Failed to attach evidence:', err);
    }
  };

  // Search Similar Cases
  const handleSimilarSearch = async (queryStr: string) => {
    setSimilarQuery(queryStr);
    if (!queryStr.trim()) {
      setSimilarResults([]);
      return;
    }

    try {
      const res = await fetch('/api/knowledge/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryStr })
      });

      if (res.ok) {
        const data = await res.json();
        setSimilarResults(data.matches || []);
      }
    } catch (err) {
      console.error('Failed search:', err);
    }
  };

  // Run Room SQL Simulation Query
  const handleRunRoomQuery = () => {
    sound.playClick();
    const q = roomSqlQuery.toLowerCase();
    if (q.includes('brand_icons')) {
      setRoomQueryResult(cases.filter(c => c.category === 'BRAND_ICONS'));
    } else if (q.includes('verified')) {
      setRoomQueryResult(cases.filter(c => c.verificationStatus.includes('VERIFIED')));
    } else {
      setRoomQueryResult(cases);
    }
    addLog({
      level: 'SYSTEM',
      message: 'ROOM SQLITE QUERY EXECUTED IN-MEMORY',
      details: `Query: ${roomSqlQuery} | Rows returned: ${roomQueryResult.length}`
    });
  };

  // Filtered cases for main list
  const filteredCases = cases.filter(c => {
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.timelineAlpha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.timelineBeta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = c.divergenceYear >= yearMin && c.divergenceYear <= yearMax;
    const matchesVerified = !onlyVerified || c.verificationStatus.includes('VERIFIED');
    return matchesCategory && matchesSearch && matchesYear && matchesVerified;
  });

  // Generated Kotlin Jetpack Compose & Room Entity Code
  const generatedKotlinCode = `
package com.matrixcore.mandela.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Dao
import androidx.room.Query
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import kotlinx.coroutines.flow.Flow

// Material 3 Room Entity for Mandela Effect Anomaly Case
@Entity(tableName = "mandela_cases")
data class MandelaCaseEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String,
    val divergenceYear: Int,
    val timelineAlpha: String,
    val timelineBeta: String,
    val divergenceProbability: Double,
    val confidenceScore: Double,
    val verificationStatus: String,
    val description: String,
    val isFavourite: Boolean = false,
    val lastAccessedTimestamp: Long = System.currentTimeMillis()
)

@Dao
interface MandelaCaseDao {
    @Query("SELECT * FROM mandela_cases ORDER BY divergenceYear DESC")
    fun getAllCasesFlow(): Flow<List<MandelaCaseEntity>>

    @Query("SELECT * FROM mandela_cases WHERE isFavourite = 1")
    fun getFavouriteCases(): Flow<List<MandelaCaseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateCase(item: MandelaCaseEntity)
}
`.trim();

  // Export JSON Database
  const handleExportJson = () => {
    sound.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cases, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mandela_effect_knowledge_db_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.playMutationSuccess();
    addLog({
      level: 'SYSTEM',
      message: 'MANDELA KNOWLEDGE DATABASE EXPORTED TO JSON',
      details: `Cases Count: ${cases.length} | Format: JSON`
    });
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    sound.playClick();
    let md = `# MANDELA EFFECT & QUANTUM SHIFT DOSSIER REPORT\n\n`;
    md += `*Generated by MatrixCore OS v2.4 | ${new Date().toISOString()}*\n\n`;
    cases.forEach(c => {
      md += `## ${c.title} (${c.id})\n`;
      md += `- **Category:** ${c.category}\n`;
      md += `- **Divergence Year:** ${c.divergenceYear}\n`;
      md += `- **Physical Alpha Baseline:** ${c.timelineAlpha}\n`;
      md += `- **Remembered Beta Reality:** ${c.timelineBeta}\n`;
      md += `- **Verification:** ${c.verificationStatus} (${c.confidenceScore}%)\n`;
      md += `- **Summary:** ${c.description}\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mandela_dossier_report_${Date.now()}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    sound.playMutationSuccess();
    addLog({
      level: 'SYSTEM',
      message: 'MARKDOWN DOSSIER REPORT EXPORTED',
      details: 'Full markdown documentation generated successfully.'
    });
  };

  return (
    <div className={`space-y-6 font-mono transition-colors ${
      activeMatrixTheme === 'OLED_BLACK'
        ? 'bg-black text-zinc-100'
        : activeMatrixTheme === 'HOT_CRIMSON'
        ? 'bg-zinc-950 text-red-100'
        : activeMatrixTheme === 'CYAN_PULSE'
        ? 'bg-zinc-950 text-cyan-100'
        : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Header Banner */}
      <div className="bg-zinc-950 border-2 border-emerald-500 p-5 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-400">
              <BookOpen className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wider uppercase">
                  MANDELA EFFECT & ANDROID MATERIAL 3 KNOWLEDGE MATRIX
                </h2>
                {isOfflineMode ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 uppercase">
                    <WifiOff className="w-3 h-3" /> OFFLINE_ROOM_CACHE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 uppercase">
                    <Wifi className="w-3 h-3" /> ONLINE_SYNCED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                JETPACK COMPOSE &bull; ROOM DATABASE &bull; MATERIAL 3 UI &bull; OFFLINE-FIRST &bull; SEARCH & FILTERS &bull; FAVOURITES & SHARE
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsOfflineMode(!isOfflineMode);
              }}
              className={`px-3 py-1.5 border text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                isOfflineMode
                  ? 'bg-amber-950 text-amber-400 border-amber-500'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              {isOfflineMode ? 'OFFLINE MODE: ACTIVE' : 'ONLINE MODE: SYNCED'}
            </button>

            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-right">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">FAVOURITES</p>
              <p className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {favourites.length}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'DATABASE', label: '1. Mandela Database', icon: BookOpen },
            { id: 'ANDROID_FEATURES', label: '2. Android & Compose Hub', icon: Smartphone },
            { id: 'SUBMIT', label: '3. Community Submissions', icon: PlusCircle },
            { id: 'TIMELINE', label: '4. Timeline Divergence', icon: Clock },
            { id: 'VERIFICATION', label: '5. Source Verification', icon: ShieldCheck },
            { id: 'EVIDENCE', label: '6. Evidence Vault', icon: FileCheck },
            { id: 'FAVOURITES', label: '7. Favourites & Saved', icon: Star },
            { id: 'HISTORY', label: '8. Activity History', icon: History },
            { id: 'SHARE_EXPORT', label: '9. Share & Export', icon: Share2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-2 text-xs font-bold uppercase border flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MANDELA DATABASE VIEW (SEARCH & FILTERS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'DATABASE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters & Case List */}
          <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-800 pb-3 gap-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                MANDELA EFFECT DATABASE ({filteredCases.length} MATCHES)
              </h3>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search anomaly title or memory..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs pl-8 pr-3 py-1.5 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-3 p-3 bg-zinc-900/60 border border-zinc-800 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {['ALL', 'BRAND_ICONS', 'CULTURE_LITERATURE', 'CODE_REALITY', 'COMMUNITY_SUBMISSION'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        sound.playClick();
                        setCategoryFilter(cat);
                      }}
                      className={`px-2 py-1 uppercase font-bold border transition-all ${
                        categoryFilter === cat
                          ? 'bg-emerald-500 text-black border-emerald-300'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Only Verified Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold uppercase text-[11px]">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={e => setOnlyVerified(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  VERIFIED ANOMALIES ONLY
                </label>
              </div>

              {/* Year Slider Range */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Year Range:</span>
                <span className="text-emerald-400 font-bold">{yearMin} - {yearMax}</span>
                <input
                  type="range"
                  min="1950"
                  max="2026"
                  value={yearMin}
                  onChange={e => setYearMin(Number(e.target.value))}
                  className="w-24 accent-emerald-500 bg-zinc-950"
                />
                <input
                  type="range"
                  min="1950"
                  max="2026"
                  value={yearMax}
                  onChange={e => setYearMax(Number(e.target.value))}
                  className="w-24 accent-emerald-500 bg-zinc-950"
                />
              </div>
            </div>

            {/* Cases List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredCases.map(item => {
                const isFav = favourites.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCase(item);
                      recordHistory(item, 'VIEWED_CASE');
                    }}
                    className={`p-4 border cursor-pointer transition-all ${
                      selectedCase?.id === item.id
                        ? 'bg-zinc-900 border-emerald-500 shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-1.5 py-0.5">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950 border border-amber-800 px-1.5 py-0.5">
                            YEAR {item.divergenceYear}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase mt-1.5">{item.title}</h4>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite(item.id);
                        }}
                        className={`p-1.5 border transition-all ${
                          isFav
                            ? 'bg-amber-950 border-amber-500 text-amber-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Timeline Divergence Split Preview */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                      <div className="p-2 bg-black/60 border border-zinc-800">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase">PHYSICAL ALPHA</p>
                        <p className="text-zinc-300 font-bold truncate mt-0.5">{item.timelineAlpha}</p>
                      </div>
                      <div className="p-2 bg-emerald-950/20 border border-emerald-800/50">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase">REMEMBERED BETA</p>
                        <p className="text-emerald-300 font-bold truncate mt-0.5">{item.timelineBeta}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed View Side Panel */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>CASE METRICS & AUDIT</span>
              <span className="text-xs text-emerald-400 font-bold">{selectedCase?.id}</span>
            </h3>

            {selectedCase ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-black text-white uppercase">{selectedCase.title}</h4>
                    <button
                      onClick={() => toggleFavourite(selectedCase.id)}
                      className={`p-2 border ${
                        favourites.includes(selectedCase.id)
                          ? 'bg-amber-950 border-amber-500 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${favourites.includes(selectedCase.id) ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                  <p className="text-zinc-400 mt-1">{selectedCase.description}</p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 uppercase font-bold">Divergence Probability:</span>
                    <span className="text-emerald-400 font-black">{selectedCase.divergenceProbability}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 border border-zinc-800">
                    <div className="h-full bg-emerald-500" style={{ width: `${selectedCase.divergenceProbability}%` }} />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-400 uppercase font-bold">Source Confidence:</span>
                    <span className="text-amber-400 font-black">{selectedCase.confidenceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 border border-zinc-800">
                    <div className="h-full bg-amber-500" style={{ width: `${selectedCase.confidenceScore}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">VERIFICATION STATUS</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-xs uppercase">{selectedCase.verificationStatus}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex gap-2">
                  <button
                    onClick={() => handleVerifyCase(selectedCase.id)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs flex items-center justify-center gap-1.5 border border-emerald-300"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AUDIT SOURCE VERIFICATION
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 italic text-xs">Select a Mandela Effect case from the list to view quantum metrics.</p>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. ANDROID & JETPACK COMPOSE HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ANDROID_FEATURES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Material 3 & Compose Inspector */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              MATERIAL 3 & JETPACK COMPOSE UI SIMULATOR
            </h3>

            {/* Simulated Android Material 3 Preview Card */}
            <div className="p-4 bg-zinc-900 border-2 border-emerald-500 shadow-[0_0_15px_rgba(0,255,102,0.15)] rounded-2xl space-y-3 font-sans">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                  @Composable MandelaCard() &bull; Material3 Surface
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Container Elevation: 2.dp
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  {selectedCase ? selectedCase.title : 'Berenstain Bears Spelling Shift'}
                </h4>
                <p className="text-xs text-zinc-400">
                  {selectedCase ? selectedCase.description : 'Material 3 Jetpack Compose Card rendering live entity data.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                <div className="p-2 bg-black/60 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Material You Secondary</span>
                  <span className="text-emerald-400 font-bold">{selectedCase?.timelineAlpha || 'Official Baseline'}</span>
                </div>
                <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-800/60">
                  <span className="text-[10px] text-emerald-300 uppercase block">Material You Primary</span>
                  <span className="text-emerald-300 font-bold">{selectedCase?.timelineBeta || 'Remembered Reality'}</span>
                </div>
              </div>
            </div>

            {/* Generated Kotlin Room & Compose Code Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase">Android Room & Compose Kotlin Source</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKotlinCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-xs font-bold text-emerald-400 uppercase flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'COPIED' : 'COPY KOTLIN'}
                </button>
              </div>
              <pre className="p-3 bg-black border border-zinc-800 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-60">
                {generatedKotlinCode}
              </pre>
            </div>
          </div>

          {/* Room Database Query Simulator */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              ROOM SQLITE DATABASE INSPECTOR & QUERY TEST BENCH
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase font-bold mb-1">Room SQL Query Test Bench</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomSqlQuery}
                    onChange={e => setRoomSqlQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 font-mono focus:border-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleRunRoomQuery}
                    className="px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs border border-emerald-300"
                  >
                    RUN
                  </button>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400 font-bold uppercase">Cached Table Rows:</span>
                  <span className="text-amber-400 font-bold">{roomCacheCount} Entities</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400 font-bold uppercase">SQLite Version:</span>
                  <span className="text-emerald-400 font-bold">3.45.1 (Coroutines Flow)</span>
                </div>
              </div>

              {/* Result table */}
              <div className="overflow-x-auto border border-zinc-800 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[9px]">
                    <tr>
                      <th className="p-2 border-b border-zinc-800">ID</th>
                      <th className="p-2 border-b border-zinc-800">Title</th>
                      <th className="p-2 border-b border-zinc-800">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {(roomQueryResult.length > 0 ? roomQueryResult : cases).map(c => (
                      <tr key={c.id}>
                        <td className="p-2 font-bold text-emerald-400">{c.id}</td>
                        <td className="p-2 text-white">{c.title}</td>
                        <td className="p-2 text-zinc-400">{c.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. COMMUNITY SUBMISSIONS FORM */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'SUBMIT' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              SUBMIT NEW MANDELA EFFECT ANOMALY
            </h3>
            <span className="text-xs text-emerald-400 font-bold">COMMUNITY PORTAL</span>
          </div>

          <form onSubmit={handleSubmitCase} className="space-y-4 text-xs max-w-2xl">
            <div className="space-y-1">
              <label className="block text-zinc-300 uppercase font-bold">Anomaly Case Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Luke I am Your Father vs No I am Your Father"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 focus:border-emerald-500 outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-zinc-300 uppercase font-bold">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 focus:border-emerald-500 outline-none font-bold"
                >
                  <option value="BRAND_ICONS">BRAND_ICONS</option>
                  <option value="CULTURE_LITERATURE">CULTURE_LITERATURE</option>
                  <option value="CODE_REALITY">CODE_REALITY</option>
                  <option value="COMMUNITY_SUBMISSION">COMMUNITY_SUBMISSION</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-300 uppercase font-bold">Divergence Year</label>
                <input
                  type="number"
                  min="1950"
                  max="2026"
                  value={newYear}
                  onChange={e => setNewYear(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 focus:border-emerald-500 outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-zinc-400 uppercase font-bold">Timeline Alpha (Physical Baseline)</label>
                <input
                  type="text"
                  required
                  placeholder="Official verified physical artifact state..."
                  value={newAlpha}
                  onChange={e => setNewAlpha(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-emerald-400 uppercase font-bold">Timeline Beta (Remembered Memory)</label>
                <input
                  type="text"
                  required
                  placeholder="Widespread remembered alternate memory..."
                  value={newBeta}
                  onChange={e => setNewBeta(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-300 uppercase font-bold">Detailed Memory Description</label>
              <textarea
                rows={4}
                placeholder="Describe how the collective memory differs from recorded history..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white p-2.5 focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider border border-emerald-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'PERSISTING ANOMALY...' : 'SUBMIT MANDELA ANOMALY TO DATABASE'}
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TIMELINE DIVERGENCE VIEWER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'TIMELINE' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              TEMPORAL QUANTUM SHIFT TIMELINE (1980 - 2026)
            </h3>
            <span className="text-xs text-amber-400 font-bold">MANDELA TIMELINE MAP</span>
          </div>

          <div className="relative pl-6 border-l-2 border-emerald-500/50 space-y-8 my-4">
            {cases
              .sort((a, b) => b.divergenceYear - a.divergenceYear)
              .map(item => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black shadow-[0_0_10px_#00FF66]" />

                  <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2 hover:border-emerald-500 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5">
                        YEAR {item.divergenceYear}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{item.category}</span>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase">{item.title}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-800">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Physical Alpha:</span>
                        <p className="text-zinc-300 font-bold">{item.timelineAlpha}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Remembered Beta:</span>
                        <p className="text-emerald-300 font-bold">{item.timelineBeta}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. SOURCE VERIFICATION ENGINE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'VERIFICATION' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SOURCE HISTORICAL VERIFICATION & CONSENSUS ENGINE
            </h3>
            <span className="text-xs text-emerald-400 font-bold">ARBITER VERIFIER</span>
          </div>

          <div className="space-y-4">
            {cases.map(item => (
              <div key={item.id} className="p-4 bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white uppercase">{item.title}</h4>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5">
                      {item.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Source Anchor: <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-400 underline font-bold">{item.sourceUrl}</a>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <p className="text-[10px] text-zinc-500 uppercase">Confidence Score</p>
                    <p className="font-black text-amber-400 text-sm">{item.confidenceScore}%</p>
                  </div>
                  <button
                    onClick={() => handleVerifyCase(item.id)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs border border-emerald-300"
                  >
                    RE-VERIFY SOURCE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. EVIDENCE VAULT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'EVIDENCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              ATTACH EVIDENCE ARTIFACT
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase font-bold mb-1">Target Anomaly Case</label>
                <select
                  value={selectedCase?.id || ''}
                  onChange={e => {
                    const c = cases.find(x => x.id === e.target.value);
                    if (c) setSelectedCase(c);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 font-bold focus:border-emerald-500 outline-none"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-bold mb-1">Evidence Title</label>
                <input
                  type="text"
                  placeholder="e.g. 1994 Newspaper Clipping Photo"
                  value={newEvidenceTitle}
                  onChange={e => setNewEvidenceTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-bold mb-1">Artifact Type</label>
                <select
                  value={newEvidenceType}
                  onChange={e => setNewEvidenceType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-2 font-bold focus:border-emerald-500 outline-none"
                >
                  <option value="PHOTO">PHOTO</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                  <option value="VIDEO_STILL">VIDEO_STILL</option>
                  <option value="CODE_LOG">CODE_LOG</option>
                </select>
              </div>

              <button
                onClick={handleAttachEvidence}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider border border-emerald-300"
              >
                ATTACH EVIDENCE TO CASE
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>EVIDENCE VAULT LOGS</span>
              <span className="text-xs text-emerald-400 font-bold">{selectedCase?.title}</span>
            </h3>

            <div className="space-y-3">
              {selectedCase?.evidenceList?.map(ev => (
                <div key={ev.id} className="p-3 bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold text-white uppercase">{ev.title}</p>
                      <p className="text-[10px] text-zinc-500">TYPE: {ev.type} | ID: {ev.id}</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px] uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5">
                    VERIFIED ARTIFACT
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. FAVOURITES & BOOKMARKS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'FAVOURITES' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              FAVOURITES & BOOKMARKED MANDELA CASES ({favourites.length})
            </h3>
            <span className="text-xs text-amber-400 font-bold">SAVED ANOMALIES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.filter(c => favourites.includes(c.id)).map(item => (
              <div key={item.id} className="p-4 bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-white uppercase text-sm">{item.title}</h4>
                  <button
                    onClick={() => toggleFavourite(item.id)}
                    className="p-1 text-amber-400 hover:text-red-400"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
                <p className="text-xs text-zinc-400">{item.description}</p>
                <div className="text-[11px] text-emerald-400 font-bold flex justify-between pt-2 border-t border-zinc-800">
                  <span>ALPHA: {item.timelineAlpha}</span>
                  <span>BETA: {item.timelineBeta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. ACTIVITY HISTORY LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'HISTORY' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              USER ACTIVITY AUDIT LOG TRAIL
            </h3>
            <span className="text-xs text-zinc-400 font-bold">SESSION AUDIT LOG</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {historyLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 border border-emerald-800 px-1.5 py-0.5">
                    {log.time}
                  </span>
                  <span className="text-white font-bold">{log.title}</span>
                </div>
                <span className="text-amber-400 font-bold text-[10px] uppercase">
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. SHARE & EXPORT DOSSIER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'SHARE_EXPORT' && (
        <div className="bg-zinc-950 border-2 border-zinc-800 p-5 space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              MANDELA KNOWLEDGE EXPORT & SHARING PORTAL
            </h3>
            <span className="text-xs text-emerald-400 font-bold">EXPORT ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* JSON Export */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-white uppercase">EXPORT FULL JSON DATABASE</h4>
                  <p className="text-zinc-400 text-[11px]">Download raw JSON with all case entities & evidence artifacts.</p>
                </div>
              </div>
              <button
                onClick={handleExportJson}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs flex items-center justify-center gap-2 border border-emerald-300"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD JSON DATABASE
              </button>
            </div>

            {/* Markdown Report */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-white uppercase">EXPORT MARKDOWN DOSSIER</h4>
                  <p className="text-zinc-400 text-[11px]">Generate formatted Markdown document for documentation & research.</p>
                </div>
              </div>
              <button
                onClick={handleExportMarkdown}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs flex items-center justify-center gap-2 border border-amber-300"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD MARKDOWN REPORT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
