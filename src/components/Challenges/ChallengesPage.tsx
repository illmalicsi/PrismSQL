import React, { useState, useEffect, useMemo } from 'react'
import CodeMirror, { Prec } from '@uiw/react-codemirror'
import { sql, SQLite } from '@codemirror/lang-sql'
import { keymap } from '@codemirror/view'
import { format } from 'sql-formatter'
import {
  Crown,
  Flame,
  Swords,
  Target,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sun,
  Moon,
  Play,
  RotateCcw,
  Sparkles,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  Table2,
  Code2,
  Lock,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import { PrismLogo, PrismBrandText } from '../PrismLogo'
import { useTheme } from '../../context/ThemeContext'
import { getEditorThemeExtensions } from '../Editor/editorThemes'
import { CHALLENGES } from '../../data/challenges'
import { runChallengeTest } from '../../lib/challengeRunner'
import type {
  Challenge,
  ChallengeTier,
  TestResult,
  ChallengeProgress,
} from '../../types/challenges'

interface ChallengesPageProps {
  onBackToStudio: () => void
  onOpenInStudio?: (query: string) => void
}

const STORAGE_KEY = 'prismsql_challenges_progress_v1'

const INITIAL_PROGRESS: ChallengeProgress = {
  completedIds: [],
  totalXp: 0,
  lastActiveChallengeId: 'easy-1',
  completedAt: {},
  savedSql: {},
  bossDefeated: false,
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({
  onBackToStudio,
  onOpenInStudio,
}) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  // Load progress
  const [progress, setProgress] = useState<ChallengeProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...INITIAL_PROGRESS, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.error('Failed to load challenges progress:', e)
    }
    return INITIAL_PROGRESS
  })

  // Active Challenge Selection
  const [activeTier, setActiveTier] = useState<ChallengeTier>('easy')
  const [activeChallengeId, setActiveChallengeId] = useState<string>(() => {
    return progress.lastActiveChallengeId || 'easy-1'
  })

  const currentChallenge: Challenge = useMemo(() => {
    return (
      CHALLENGES.find((c) => c.id === activeChallengeId) ||
      CHALLENGES[0]
    )
  }, [activeChallengeId])

  // Sync tier when active challenge changes
  useEffect(() => {
    if (currentChallenge) {
      setActiveTier(currentChallenge.tier)
    }
  }, [currentChallenge])

  // Current SQL in editor
  const [editorSql, setEditorSql] = useState<string>(() => {
    return (
      progress.savedSql[activeChallengeId] ??
      currentChallenge?.starterSql ??
      ''
    )
  })

  // Switch challenge handler
  const handleSelectChallenge = (challenge: Challenge) => {
    setActiveChallengeId(challenge.id)
    setActiveTier(challenge.tier)
    setTestResult(null)
    setRevealedHints([])
    setPreviewTab('schema')

    const saved = progress.savedSql[challenge.id]
    setEditorSql(saved !== undefined ? saved : challenge.starterSql)
  }

  // Update editor query and persist in progress state
  const handleEditorChange = (val: string) => {
    setEditorSql(val)
    setProgress((prev) => {
      const updated = {
        ...prev,
        savedSql: {
          ...prev.savedSql,
          [activeChallengeId]: val,
        },
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  // Running test suite
  const [isRunning, setIsRunning] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [showBossVictoryModal, setShowBossVictoryModal] = useState(false)

  // Mobile layout tab
  const [mobileTab, setMobileTab] = useState<'brief' | 'editor' | 'results'>('editor')

  // Left panel view tab (schema vs sample preview)
  const [previewTab, setPreviewTab] = useState<'schema' | 'sample'>('schema')
  const [activeTableIndex, setActiveTableIndex] = useState(0)

  // Hints progressive disclosure
  const [revealedHints, setRevealedHints] = useState<number[]>([])

  const toggleHint = (index: number) => {
    setRevealedHints((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  // Lock status calculation for tiers
  const tierUnlocked = useMemo(() => {
    const easyCompleted = CHALLENGES.filter(
      (c) => c.tier === 'easy' && progress.completedIds.includes(c.id)
    ).length
    const mediumCompleted = CHALLENGES.filter(
      (c) => c.tier === 'medium' && progress.completedIds.includes(c.id)
    ).length
    const hardCompleted = CHALLENGES.filter(
      (c) => c.tier === 'hard' && progress.completedIds.includes(c.id)
    ).length

    return {
      easy: true,
      medium: easyCompleted >= 2,
      hard: mediumCompleted >= 2,
      boss: hardCompleted >= 2 || progress.completedIds.length >= 7,
    }
  }, [progress.completedIds])

  // Run Test Solution
  const handleRunTest = async () => {
    if (isRunning) return
    setIsRunning(true)
    setTestResult(null)

    try {
      const result = await runChallengeTest(currentChallenge, editorSql)
      setTestResult(result)

      if (result.success) {
        // Mark as completed
        const isNewCompletion = !progress.completedIds.includes(currentChallenge.id)
        const isBoss = currentChallenge.tier === 'boss'

        const updatedCompletedIds = isNewCompletion
          ? [...progress.completedIds, currentChallenge.id]
          : progress.completedIds

        const updatedXp = isNewCompletion
          ? progress.totalXp + currentChallenge.xp
          : progress.totalXp

        const updatedProgress: ChallengeProgress = {
          ...progress,
          completedIds: updatedCompletedIds,
          totalXp: updatedXp,
          lastActiveChallengeId: currentChallenge.id,
          completedAt: {
            ...progress.completedAt,
            [currentChallenge.id]: Date.now(),
          },
          bossDefeated: progress.bossDefeated || isBoss,
        }

        setProgress(updatedProgress)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress))
        } catch (e) {
          console.error(e)
        }

        if (isBoss) {
          setShowBossVictoryModal(true)
        }
      }

      setMobileTab('results')
    } catch (err: any) {
      console.error('Test execution error:', err)
      setTestResult({
        success: false,
        error: err?.message || 'Unexpected test runner error.',
        executionTimeMs: 0,
        userColumns: [],
        userRows: [],
        expectedColumns: [],
        expectedRows: [],
      })
      setMobileTab('results')
    } finally {
      setIsRunning(false)
    }
  }

  // Format SQL
  const handleFormatSql = () => {
    try {
      const formatted = format(editorSql, {
        language: 'sqlite',
        tabWidth: 2,
        keywordCase: 'upper',
      })
      handleEditorChange(formatted)
    } catch (e) {
      console.warn('SQL format notice:', e)
    }
  }

  // Reset SQL to starter
  const handleResetStarter = () => {
    if (
      window.confirm(
        'Reset your query to the initial starter template for this challenge?'
      )
    ) {
      handleEditorChange(currentChallenge.starterSql)
      setTestResult(null)
    }
  }

  // Next Challenge Navigator
  const handleNextChallenge = () => {
    const currentIndex = CHALLENGES.findIndex((c) => c.id === currentChallenge.id)
    if (currentIndex < CHALLENGES.length - 1) {
      const next = CHALLENGES[currentIndex + 1]
      handleSelectChallenge(next)
    }
  }

  // Reset All Progress (Debug/Replay)
  const handleResetAllProgress = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all your challenge progress, XP, and completed states?'
      )
    ) {
      setProgress(INITIAL_PROGRESS)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.error(e)
      }
      handleSelectChallenge(CHALLENGES[0])
    }
  }

  // CodeMirror Keyboard shortcuts
  const customKeymaps = useMemo(() => {
    return Prec.highest(
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            handleRunTest()
            return true
          },
        },
        {
          key: 'Shift-Mod-F',
          run: () => {
            handleFormatSql()
            return true
          },
        },
      ])
    )
  }, [editorSql, currentChallenge])

  const editorExtensions = useMemo(() => {
    return [
      sql({ dialect: SQLite }),
      ...getEditorThemeExtensions(isDark),
      customKeymaps,
    ]
  }, [isDark, customKeymaps])

  // Player Rank title based on solved count
  const playerRank = useMemo(() => {
    const count = progress.completedIds.length
    if (progress.bossDefeated) return 'Grandmaster Architect'
    if (count >= 7) return 'Senior Architect'
    if (count >= 5) return 'SQL Journeyman'
    if (count >= 2) return 'SQL Apprentice'
    return 'SQL Novice'
  }, [progress.completedIds.length, progress.bossDefeated])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#090a0f] text-slate-900 dark:text-neutral-100 font-sans transition-colors">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] px-4 flex items-center justify-between text-xs select-none z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Studio</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <PrismLogo size={22} />
            <PrismBrandText className="text-sm" />
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Swords className="w-3 h-3" />
              <span>Skill Arena</span>
            </span>
          </div>
        </div>

        {/* Player Stats & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Rank & XP Chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
            <span className="text-amber-500 flex items-center gap-1 font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{progress.totalXp} XP</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-sans font-semibold">
              {playerRank}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">
              {progress.completedIds.length}/{CHALLENGES.length} Solved
            </span>
            {progress.bossDefeated && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                  <Crown className="w-3 h-3" /> Slain
                </span>
              </>
            )}
          </div>

          {/* Reset progress button */}
          {progress.completedIds.length > 0 && (
            <button
              onClick={handleResetAllProgress}
              title="Reset all challenge progress"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141724] hover:bg-slate-100 dark:hover:bg-[#1c2032] transition-colors"
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>
        </div>
      </header>

      {/* Tier Selector & Stage Nav */}
      <div className="bg-white dark:bg-[#0c0e14] border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Tier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { id: 'easy', label: 'Easy Tier', color: 'emerald', icon: Target },
              { id: 'medium', label: 'Medium Tier', color: 'amber', icon: Sparkles },
              { id: 'hard', label: 'Hard Tier', color: 'rose', icon: Swords },
              { id: 'boss', label: 'Boss Round 👑', color: 'purple', icon: Crown },
            ] as const
          ).map((t) => {
            const isUnlocked = tierUnlocked[t.id]
            const isCurrentTier = activeTier === t.id
            const TierIcon = t.icon
            const tierChallenges = CHALLENGES.filter((c) => c.tier === t.id)
            const completedCount = tierChallenges.filter((c) =>
              progress.completedIds.includes(c.id)
            ).length

            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isUnlocked) {
                    setActiveTier(t.id)
                    const firstInTier = tierChallenges[0]
                    if (firstInTier) handleSelectChallenge(firstInTier)
                  }
                }}
                disabled={!isUnlocked}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  !isUnlocked
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-[#141724] text-slate-400 border border-slate-200 dark:border-slate-800'
                    : isCurrentTier
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#141724] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800'
                }`}
              >
                {!isUnlocked ? (
                  <Lock className="w-3 h-3 text-slate-400" />
                ) : (
                  <TierIcon className="w-3.5 h-3.5" />
                )}
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isCurrentTier
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {completedCount}/{tierChallenges.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sub-level pills for current tier */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CHALLENGES.filter((c) => c.tier === activeTier).map((c, idx) => {
            const isSelected = c.id === currentChallenge.id
            const isCompleted = progress.completedIds.includes(c.id)

            return (
              <button
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'bg-white dark:bg-[#0c0e14] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#141724]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 text-[9px] font-mono flex items-center justify-center text-slate-400">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[130px]">{c.title}</span>
                <span className="text-[10px] text-amber-500 font-mono">
                  +{c.xp}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14]">
        <button
          onClick={() => setMobileTab('brief')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center ${
            mobileTab === 'brief'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          Problem Brief
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center ${
            mobileTab === 'editor'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          SQL Editor
        </button>
        <button
          onClick={() => setMobileTab('results')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center flex items-center justify-center gap-1 ${
            mobileTab === 'results'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          <span>Test Results</span>
          {testResult && (
            <span
              className={`w-2 h-2 rounded-full ${
                testResult.success ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          )}
        </button>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Problem Statement & Schema Reference */}
        <div
          className={`w-full md:w-[45%] lg:w-[40%] border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 sm:p-6 space-y-6 ${
            mobileTab === 'brief' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Boss Banner Card */}
          {currentChallenge.tier === 'boss' && (
            <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-950/20 via-[#140b20] to-[#0d0914] p-4 text-purple-200 space-y-3 shadow-lg shadow-purple-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-lg">
                    {currentChallenge.bossAvatar || '👑'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentChallenge.bossName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500 text-white font-mono">
                        Boss
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-300/80">
                      Tier 4 Grandmaster Final Exam
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px]">
                  <span className="text-purple-400">
                    {progress.bossDefeated ? 'HP: 0 / 1,000' : 'HP: 1,000 / 1,000'}
                  </span>
                </div>
              </div>

              {/* Boss HP Bar */}
              <div className="w-full h-2 rounded-full bg-purple-950/60 overflow-hidden border border-purple-500/30">
                <div
                  className={`h-full transition-all duration-700 ${
                    progress.bossDefeated
                      ? 'w-0 bg-slate-600'
                      : 'w-full bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500'
                  }`}
                />
              </div>

              {/* Boss Story Bubble */}
              {currentChallenge.story && (
                <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-xs italic text-purple-200/90 leading-relaxed">
                  "{currentChallenge.story}"
                </div>
              )}
            </div>
          )}

          {/* Standard Challenge Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                    currentChallenge.tier === 'easy'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : currentChallenge.tier === 'medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : currentChallenge.tier === 'hard'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                  }`}
                >
                  {currentChallenge.difficulty} Tier
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-mono">
                  <Flame className="w-3.5 h-3.5" />+{currentChallenge.xp} XP
                </span>
              </div>

              {progress.completedIds.includes(currentChallenge.id) && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentChallenge.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentChallenge.subtitle}
            </p>
          </div>

          {/* Non-boss story context */}
          {currentChallenge.tier !== 'boss' && currentChallenge.story && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{currentChallenge.story}"
            </div>
          )}

          {/* Problem Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Objective
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentChallenge.description}
            </p>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Query Requirements</span>
            </h3>
            <ul className="space-y-1.5">
              {currentChallenge.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Database Tables & Schema Viewer */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Table2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sandbox Schema ({currentChallenge.tables.length})</span>
              </h3>

              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                <button
                  onClick={() => setPreviewTab('schema')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    previewTab === 'schema'
                      ? 'bg-white dark:bg-[#141724] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Columns
                </button>
                <button
                  onClick={() => setPreviewTab('sample')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    previewTab === 'sample'
                      ? 'bg-white dark:bg-[#141724] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Sample Rows
                </button>
              </div>
            </div>

            {/* Table Tabs if multiple */}
            {currentChallenge.tables.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {currentChallenge.tables.map((t, idx) => (
                  <button
                    key={t.name}
                    onClick={() => setActiveTableIndex(idx)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0 ${
                      activeTableIndex === idx
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30'
                        : 'bg-slate-100 dark:bg-[#141724] text-slate-500 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}

            {/* Active Table Schema / Sample Display */}
            {currentChallenge.tables[activeTableIndex] && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] overflow-hidden text-xs font-mono shadow-xs">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#141724] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    table: {currentChallenge.tables[activeTableIndex].name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentChallenge.tables[activeTableIndex].columns.length} columns
                  </span>
                </div>

                {previewTab === 'schema' ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-56 overflow-y-auto">
                    {currentChallenge.tables[activeTableIndex].columns.map((c) => (
                      <div
                        key={c.name}
                        className="p-2.5 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-200">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {c.desc}
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                          {c.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-[#141724]/50 border-b border-slate-200 dark:border-slate-800">
                          {currentChallenge.tables[activeTableIndex].columns.map(
                            (c) => (
                              <th
                                key={c.name}
                                className="px-2.5 py-1.5 font-bold text-slate-700 dark:text-slate-300"
                              >
                                {c.name}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {currentChallenge.tables[activeTableIndex].sampleRows.map(
                          (row, rIdx) => (
                            <tr key={rIdx}>
                              {currentChallenge.tables[activeTableIndex].columns.map(
                                (c) => (
                                  <td
                                    key={c.name}
                                    className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 whitespace-nowrap"
                                  >
                                    {String(row[c.name] ?? 'NULL')}
                                  </td>
                                )
                              )}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Revealable Hints */}
          {currentChallenge.hints && currentChallenge.hints.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Hints ({currentChallenge.hints.length})</span>
              </h3>
              <div className="space-y-1.5">
                {currentChallenge.hints.map((hint, idx) => {
                  const isRevealed = revealedHints.includes(idx)
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#0c0e14]"
                    >
                      <button
                        onClick={() => toggleHint(idx)}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#141724] transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3 h-3 text-amber-500" />
                          <span>Hint #{idx + 1}</span>
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            isRevealed ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isRevealed && (
                        <div className="px-3 pb-2.5 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed font-sans bg-amber-50/20 dark:bg-amber-500/5">
                          {hint}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Code Editor & Test Results */}
        <div
          className={`flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0c0e14] ${
            mobileTab !== 'brief' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Editor Sub-header & Action Buttons */}
          <div className="h-11 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between text-xs shrink-0 bg-slate-50 dark:bg-[#10121a]">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                SQL Solution Editor
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                (Press Ctrl+Enter to Run Test)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFormatSql}
                title="Format SQL (Shift+Ctrl+F)"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#1c2032] text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
              >
                Format
              </button>

              <button
                onClick={handleResetStarter}
                title="Reset code to starter template"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#1c2032] text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
              >
                Reset
              </button>

              {onOpenInStudio && (
                <button
                  onClick={() => onOpenInStudio(editorSql)}
                  title="Open this query in PrismSQL Studio sandbox"
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#1c2032] text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
                >
                  <span>Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={handleRunTest}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CodeMirror Editor Area */}
          <div className="flex-1 min-h-[220px] overflow-hidden relative">
            <CodeMirror
              value={editorSql}
              onChange={handleEditorChange}
              extensions={editorExtensions}
              className="h-full text-[13px] font-mono"
              height="100%"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                searchKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          </div>

          {/* Test Results / Evaluation Panel */}
          <div className="h-64 sm:h-72 border-t border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-[#0c0e14] shrink-0">
            {/* Results Title Bar */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-white dark:bg-[#10121a]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Test Evaluation Output
                </span>
                {testResult && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({testResult.executionTimeMs.toFixed(1)}ms)
                  </span>
                )}
              </div>

              {testResult && testResult.success && (
                <button
                  onClick={handleNextChallenge}
                  className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Next Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results Content Body */}
            <div className="flex-1 overflow-auto p-4">
              {!testResult ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2 text-center text-xs">
                  <Play className="w-8 h-8 opacity-30 stroke-1" />
                  <p className="font-medium">
                    Write your SQL query above and click{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      Run Test
                    </strong>{' '}
                    to evaluate against the challenge sandbox.
                  </p>
                </div>
              ) : testResult.success ? (
                <div className="space-y-4">
                  {/* Success Banner */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">
                          Test Passed! Flawless Query Solution.
                        </div>
                        <div className="text-xs text-emerald-600/90 dark:text-emerald-400/90 font-mono mt-0.5">
                          +{currentChallenge.xp} XP earned • Output matches all expected results
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Output Table Preview */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141724] overflow-hidden text-xs font-mono">
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Your Query Results ({testResult.userRows.length} rows)
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-40">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-[#141724] border-b border-slate-200 dark:border-slate-800">
                            {testResult.userColumns.map((c) => (
                              <th
                                key={c}
                                className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200"
                              >
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {testResult.userRows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-3 py-1.5 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                                >
                                  {String(cell ?? 'NULL')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Fail Alert Banner */}
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <span>Test Failed</span>
                    </div>
                    <div className="text-xs text-rose-600 dark:text-rose-300 font-mono leading-relaxed pl-7">
                      {testResult.error || testResult.mismatchReason}
                    </div>
                  </div>

                  {/* Comparison Details if available */}
                  {testResult.userColumns.length > 0 && testResult.expectedColumns.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* User output preview */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141724] overflow-hidden text-xs font-mono">
                        <div className="px-3 py-1.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                          Your Output ({testResult.userRows.length} rows,{' '}
                          {testResult.userColumns.length} cols)
                        </div>
                        <div className="overflow-x-auto max-h-36">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-[#141724] border-b border-slate-200 dark:border-slate-800">
                                {testResult.userColumns.map((c) => (
                                  <th key={c} className="px-2.5 py-1 font-bold">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {testResult.userRows.slice(0, 5).map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className="px-2.5 py-1 whitespace-nowrap text-slate-600 dark:text-slate-400"
                                    >
                                      {String(cell ?? 'NULL')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Expected output preview */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141724] overflow-hidden text-xs font-mono">
                        <div className="px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          Expected Output ({testResult.expectedRows.length} rows,{' '}
                          {testResult.expectedColumns.length} cols)
                        </div>
                        <div className="overflow-x-auto max-h-36">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-[#141724] border-b border-slate-200 dark:border-slate-800">
                                {testResult.expectedColumns.map((c) => (
                                  <th key={c} className="px-2.5 py-1 font-bold">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {testResult.expectedRows.slice(0, 5).map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className="px-2.5 py-1 whitespace-nowrap text-slate-600 dark:text-slate-400"
                                    >
                                      {String(cell ?? 'NULL')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOSS VICTORY CELEBRATION MODAL */}
      {showBossVictoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0e1017] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center text-4xl border border-amber-500/40 shadow-lg shadow-amber-500/20">
              👑
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono">
                Grandmaster Victory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Chronos Has Been Banished!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                Congratulations! You conquered all tiers and reconciled the corrupted financial ledger. You have attained the title of{' '}
                <strong className="text-amber-500 font-bold">
                  Master Database Architect
                </strong>
                .
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-around font-mono text-xs">
              <div>
                <div className="text-slate-400">Total Solved</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {CHALLENGES.length}/{CHALLENGES.length}
                </div>
              </div>
              <div className="h-8 w-px bg-amber-500/20" />
              <div>
                <div className="text-slate-400">XP Earned</div>
                <div className="text-lg font-bold text-amber-500">
                  +{currentChallenge.xp} XP
                </div>
              </div>
              <div className="h-8 w-px bg-amber-500/20" />
              <div>
                <div className="text-slate-400">Title</div>
                <div className="text-sm font-bold text-purple-400">Architect</div>
              </div>
            </div>

            <button
              onClick={() => setShowBossVictoryModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Claim Victory Badge & Return
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
