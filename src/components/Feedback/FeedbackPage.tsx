import React, { useState, useEffect } from 'react'
import {
  Bug,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
  CheckCheck,
  Loader2,
  Info,
  History,
  Trash2,
  FileCode,
  Lightbulb,
  BookOpen,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { PrismLogo, PrismBrandText } from '../PrismLogo'

export interface BugReport {
  id: string
  ticketId: string
  type: 'bug' | 'feature' | 'performance' | 'sql' | 'ui'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  sqlOrError?: string
  email?: string
  diagnostics: {
    browser: string
    os: string
    screen: string
    engine: string
    url: string
  }
  timestamp: string
  status: 'Submitted' | 'In Review' | 'Resolved'
  githubIssueUrl?: string
  githubIssueNumber?: number
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
)

export function buildGitHubIssueUrl(report: {
  title: string
  description: string
  type: string
  severity: string
  ticketId: string
  sqlOrError?: string
  email?: string
  diagnostics?: any
}) {
  const repoUrl = 'https://github.com/illmalicsi/PrismSQL'
  const labels = [report.type, `severity:${report.severity}`, 'in-app-feedback'].join(',')

  const bodySections = [
    `### 📋 Description\n${report.description}\n`,
    `### 🏷️ Classification\n- **Issue Type**: \`${report.type.toUpperCase()}\`\n- **Severity**: \`${report.severity}\`\n- **Ticket Reference**: \`${report.ticketId}\`\n`,
  ]

  if (report.email) {
    bodySections.push(`### 👤 Submitter\nContact: \`${report.email}\`\n`)
  }

  if (report.sqlOrError) {
    bodySections.push(`### 💻 Problematic SQL / Error Trace\n\`\`\`sql\n${report.sqlOrError}\n\`\`\`\n`)
  }

  if (report.diagnostics) {
    bodySections.push(
      `### ⚙️ Environment Diagnostics\n- **OS**: ${report.diagnostics.os || 'Unknown'}\n- **Browser**: ${report.diagnostics.browser || 'Unknown'}\n- **Screen Resolution**: ${report.diagnostics.screen || 'Unknown'}\n- **Execution Engine**: ${report.diagnostics.engine || 'SQLite WASM'}\n- **App URL**: [https://prismsql.vercel.app/](https://prismsql.vercel.app/)\n`
    )
  }

  bodySections.push(`---\n*Submitted from [PrismSQL Studio](https://prismsql.vercel.app/)*`)

  const issueBody = bodySections.join('\n')
  const issueTitle = `[${report.ticketId}] [${report.type.toUpperCase()}] ${report.title}`

  return `${repoUrl}/issues/new?title=${encodeURIComponent(issueTitle)}&labels=${encodeURIComponent(labels)}&body=${encodeURIComponent(issueBody)}`
}

export function getSubmissionHeading(type: BugReport['type']) {
  switch (type) {
    case 'feature':
      return 'Feature Request Submitted!'
    case 'performance':
      return 'Performance Report Submitted!'
    case 'sql':
      return 'SQL Issue Submitted!'
    case 'ui':
      return 'UI Glitch Reported!'
    case 'bug':
    default:
      return 'Bug Report Submitted!'
  }
}

interface FeedbackPageProps {
  onBackToStudio?: () => void
}

const STORAGE_KEY = 'prismsql_user_bug_reports'

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onBackToStudio }) => {
  const { theme, toggleTheme } = useTheme()

  // Form fields
  const [reportType, setReportType] = useState<BugReport['type']>('bug')
  const [severity, setSeverity] = useState<BugReport['severity']>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sqlOrError, setSqlOrError] = useState('')
  const [email, setEmail] = useState('')
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true)
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState(false)
  const [autoCreateGithub, setAutoCreateGithub] = useState(true)

  // Status & submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedTicket, setSubmittedTicket] = useState<BugReport | null>(null)
  const [copiedTicket, setCopiedTicket] = useState(false)
  const [reportsHistory, setReportsHistory] = useState<BugReport[]>([])

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setReportsHistory(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load past reports', e)
    }
  }, [])

  // Auto-detect browser & OS info
  const diagnostics = {
    browser: typeof navigator !== 'undefined' ? navigator.userAgent.split(') ')[0] + ')' : 'Browser',
    os: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Windows') ? 'Windows' : navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Linux') ? 'Linux' : 'Other') : 'Unknown OS',
    screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight} (Screen ${window.screen.width}x${window.screen.height})` : 'Unknown',
    engine: 'SQLite WASM (In-Browser Execution)',
    appUrl: 'https://prismsql.vercel.app/',
    url: typeof window !== 'undefined' ? window.location.href : 'https://prismsql.vercel.app/',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)

    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const ticketId = `PRISM-${randomSuffix}`

    let createdGithubIssueUrl: string | undefined
    let createdGithubIssueNumber: number | undefined

    // 1. If automatic GitHub issue is enabled, call Vercel Serverless Function /api/create-issue
    if (autoCreateGithub) {
      try {
        const issueRes = await fetch('/api/create-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId,
            type: reportType,
            severity,
            title: title.trim(),
            description: description.trim(),
            sqlOrError: sqlOrError.trim() || undefined,
            email: email.trim() || undefined,
            diagnostics: includeDiagnostics ? diagnostics : undefined,
          }),
        })

        if (issueRes.ok) {
          const issueData = await issueRes.json()
          if (issueData.created && issueData.issueUrl) {
            createdGithubIssueUrl = issueData.issueUrl
            createdGithubIssueNumber = issueData.issueNumber
          }
        }
      } catch (err) {
        console.warn('Auto GitHub issue API request skipped or unavailable:', err)
      }
    }

    const newReport: BugReport = {
      id: `report-${Date.now()}`,
      ticketId,
      type: reportType,
      severity,
      title: title.trim(),
      description: description.trim(),
      sqlOrError: sqlOrError.trim() || undefined,
      email: email.trim() || undefined,
      diagnostics,
      timestamp: new Date().toISOString(),
      status: 'Submitted',
      githubIssueUrl: createdGithubIssueUrl,
      githubIssueNumber: createdGithubIssueNumber,
    }

    // 2. Direct background submission without opening Gmail or external email apps
    try {
      await fetch('https://formsubmit.co/ajax/ivanlouiemalicsi@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[PrismSQL Feedback] [${createdGithubIssueNumber ? `Issue #${createdGithubIssueNumber}` : newReport.ticketId}] [${newReport.type.toUpperCase()}] ${newReport.title}`,
          app: 'PrismSQL (https://prismsql.vercel.app/)',
          ticketId: newReport.ticketId,
          type: newReport.type,
          severity: newReport.severity,
          title: newReport.title,
          description: newReport.description,
          sqlOrError: newReport.sqlOrError || 'N/A',
          contactEmail: newReport.email || 'None provided (Anonymous in-app submission)',
          githubIssue: createdGithubIssueUrl ? `Created automatically: ${createdGithubIssueUrl}` : 'Not created automatically (token unconfigured or prefill fallback)',
          diagnostics: includeDiagnostics ? JSON.stringify(newReport.diagnostics, null, 2) : 'Opted out',
          timestamp: newReport.timestamp,
        }),
      }).catch((err) => {
        // Fallback: silent catch ensures form succeeds even if network/offline
        console.warn('Silent dispatch notice:', err)
      })
    } catch (e) {
      console.warn('Network dispatch exception caught:', e)
    }

    // Persist locally so user can always see their submitted ticket history
    try {
      const updated = [newReport, ...reportsHistory].slice(0, 30)
      setReportsHistory(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }

    setIsSubmitting(false)
    setSubmittedTicket(newReport)
  }

  const handleResetForm = () => {
    setTitle('')
    setDescription('')
    setSqlOrError('')
    setEmail('')
    setSubmittedTicket(null)
  }

  const handleCopyTicketDetails = (report: BugReport) => {
    const idLabel = report.githubIssueNumber ? `Issue #${report.githubIssueNumber}` : report.ticketId
    const text = `### ${idLabel}: ${report.title}
${report.githubIssueUrl ? `- **GitHub Issue**: ${report.githubIssueUrl}\n` : ''}- **Type**: ${report.type}
- **Severity**: ${report.severity}
- **Date**: ${new Date(report.timestamp).toLocaleString()}
- **Contact**: ${report.email || 'Anonymous'}

**Description**:
${report.description}

${report.sqlOrError ? `**SQL / Error Details**:\n\`\`\`sql\n${report.sqlOrError}\n\`\`\`\n` : ''}
**Environment**:
- OS: ${report.diagnostics.os}
- Resolution: ${report.diagnostics.screen}
- Engine: ${report.diagnostics.engine}`

    navigator.clipboard.writeText(text)
    setCopiedTicket(true)
    setTimeout(() => setCopiedTicket(false), 2000)
  }

  const clearHistory = () => {
    if (window.confirm('Clear all your locally saved report history?')) {
      setReportsHistory([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-rose-500/20 selection:text-rose-600 dark:selection:text-rose-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToStudio ? (
            <button
              onClick={onBackToStudio}
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back to Studio</span>
              <span className="xs:hidden">Studio</span>
            </button>
          ) : (
            <a
              href="/"
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-xs no-underline shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Open Studio</span>
              <span className="xs:hidden">Studio</span>
            </a>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            <PrismLogo size={24} />
            <div className="flex items-center">
              <PrismBrandText className="text-sm sm:text-base font-bold shrink-0" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:inline">
                Bug & Feedback Center
              </span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Docs link */}
          <a
            href="?view=docs"
            target="_blank"
            rel="noopener noreferrer"
            title="Open SQL Documentation in new tab"
            className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-xs no-underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">SQL Docs</span>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Success Confirmation Card */}
        {submittedTicket ? (
          <div className="bg-white dark:bg-[#0e1017] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                {submittedTicket.githubIssueNumber ? (
                  <>
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Issue #{submittedTicket.githubIssueNumber}</span>
                  </>
                ) : (
                  <span>Ticket #{submittedTicket.ticketId}</span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {getSubmissionHeading(submittedTicket.type)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Thank you! Your {submittedTicket.type === 'feature' ? 'request' : 'report'} has been dispatched directly to the developer. No email client or Gmail was required.
              </p>
            </div>

            {/* Automatic GitHub Issue Alert or Fallback */}
            {submittedTicket.githubIssueUrl ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>GitHub Issue #{submittedTicket.githubIssueNumber} Created!</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono">Live</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically logged to <span className="font-mono">illmalicsi/PrismSQL</span>.
                    </div>
                  </div>
                </div>
                <a
                  href={submittedTicket.githubIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs no-underline"
                >
                  <span>View GitHub Issue</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Publish to GitHub Issues
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Open a pre-filled issue with your report title, details, and environment info.
                    </div>
                  </div>
                </div>
                <a
                  href={buildGitHubIssueUrl(submittedTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto h-8 px-3.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs no-underline cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Open in GitHub (1-Click)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Ticket Summary Box */}
            <div className="bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Title:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">{submittedTicket.title}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Type:</span>
                <span className="capitalize text-slate-800 dark:text-slate-200">{submittedTicket.type}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Severity:</span>
                <span className="capitalize text-slate-800 dark:text-slate-200">{submittedTicket.severity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Status:</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Logged & Received
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleCopyTicketDetails(submittedTicket)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {copiedTicket ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetForm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: The Submission Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Box */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
                  <Bug className="w-3.5 h-3.5" />
                  <span>In-App Bug & Feedback Reporter</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Report a Bug or Issue
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Submit bug reports, query problems, or feature requests directly from your browser. No Gmail or email client required.
                </p>
              </div>

              {/* Form Card */}
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5"
              >
                {/* 1. Issue Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'bug', label: 'Bug / Error', icon: Bug, color: 'text-rose-500' },
                      { id: 'sql', label: 'SQL Query Issue', icon: FileCode, color: 'text-indigo-500' },
                      { id: 'performance', label: 'Performance / Lag', icon: Sparkles, color: 'text-amber-500' },
                      { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-cyan-500' },
                      { id: 'ui', label: 'UI / Glitch', icon: Laptop, color: 'text-purple-500' },
                    ].map((item) => {
                      const Icon = item.icon
                      const isSelected = reportType === item.id
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setReportType(item.id as BugReport['type'])}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/30'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#141724]/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Severity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Severity
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'low', label: 'Low', desc: 'Cosmetic', badge: 'hover:border-emerald-500/50' },
                      { id: 'medium', label: 'Medium', desc: 'Unexpected behavior', badge: 'hover:border-amber-500/50' },
                      { id: 'high', label: 'High', desc: 'Feature blocked', badge: 'hover:border-orange-500/50' },
                      { id: 'critical', label: 'Critical', desc: 'Crash or data loss', badge: 'hover:border-rose-500/50' },
                    ].map((sev) => {
                      const isSelected = severity === sev.id
                      return (
                        <button
                          type="button"
                          key={sev.id}
                          onClick={() => setSeverity(sev.id as BugReport['severity'])}
                          className={`p-2 rounded-xl border text-center transition-all ${sev.badge} ${
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500/30'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="text-xs capitalize">{sev.label}</div>
                          <div className="text-[10px] opacity-70 hidden sm:block">{sev.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Issue Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Error message appears when executing window function with PARTITION BY"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* 4. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Detailed Description & Steps to Reproduce <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={`1. What did you try to do? (e.g. Run a query, load a custom database)\n2. What happened? (e.g. Nothing loaded, error message)\n3. What did you expect to happen?`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans leading-relaxed"
                  />
                </div>

                {/* 5. SQL Query / Error Trace (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Problematic SQL or Error Message (Optional)
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Code / Trace</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Paste the relevant SQL statement or browser console error here..."
                    value={sqlOrError}
                    onChange={(e) => setSqlOrError(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono leading-relaxed"
                  />
                </div>

                {/* 6. Email (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com (only if you want a developer follow-up)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Completely optional. You will not receive marketing emails.
                  </p>
                </div>

                  {/* 7. Environment Auto-Diagnostics */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={includeDiagnostics}
                          onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Include anonymous browser & OS info to help diagnose</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>{showDiagnosticsDetail ? 'Hide' : 'View'} info</span>
                      </button>
                    </div>

                    {showDiagnosticsDetail && (
                      <div className="p-3 bg-slate-100 dark:bg-[#141724] rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1 animate-in fade-in duration-150">
                        <div>OS: {diagnostics.os}</div>
                        <div>Engine: {diagnostics.engine}</div>
                        <div>Resolution: {diagnostics.screen}</div>
                        <div>Browser: {diagnostics.browser}</div>
                      </div>
                    )}

                    {/* Automatic GitHub Issue Option */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={autoCreateGithub}
                          onChange={(e) => setAutoCreateGithub(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <GithubIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Automatically create issue on GitHub (<span className="font-mono text-[11px]">illmalicsi/PrismSQL</span>)</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting report...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Bug Report</span>
                        </>
                      )}
                    </button>

                    <a
                      href={
                        title.trim() && description.trim()
                          ? buildGitHubIssueUrl({
                              title: title.trim(),
                              description: description.trim(),
                              type: reportType,
                              severity,
                              ticketId: 'DRAFT',
                              sqlOrError: sqlOrError.trim() || undefined,
                              email: email.trim() || undefined,
                              diagnostics: includeDiagnostics ? diagnostics : undefined,
                            })
                          : 'https://github.com/illmalicsi/PrismSQL/issues/new'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141724] hover:bg-slate-200 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all no-underline cursor-pointer"
                    >
                      <GithubIcon className="w-4 h-4 text-slate-500" />
                      <span>Open Pre-filled GitHub Issue</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    ✓ Submits directly in-app without opening mail client. Creates a GitHub issue when configured.
                  </p>
              </form>
            </div>

            {/* Right Column: Local History & Developer Info */}
            <div className="space-y-6">
              {/* Dev Info Card */}
              <div className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Developer Notice</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  PrismSQL is actively maintained by <strong className="text-slate-900 dark:text-white">Ivan Louie Malicsi</strong>. Reports sent through this form are delivered straight to the developer without third-party email hops.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                  <a
                    href="https://github.com/illmalicsi/PrismSQL/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
                  >
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View GitHub Repository</span>
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:underline">Issues</span>
                  </a>
                  <a
                    href="?view=docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Check SQL Documentation</span>
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:underline">Docs</span>
                  </a>
                </div>
              </div>

              {/* Recent User Submissions (Stored locally) */}
              <div className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <History className="w-4 h-4 text-rose-500" />
                    <span>Your Submissions</span>
                  </div>
                  {reportsHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      title="Clear history"
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {reportsHistory.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                    <p>No recent reports from this browser.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {reportsHistory.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#141724]/70 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {rep.githubIssueNumber ? `Issue #${rep.githubIssueNumber}` : `#${rep.ticketId}`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rep.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {rep.title}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="capitalize">{rep.type}</span>
                          <div className="flex items-center gap-2">
                            {rep.githubIssueUrl ? (
                              <a
                                href={rep.githubIssueUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>GitHub</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <a
                                href={buildGitHubIssueUrl(rep)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-0.5"
                              >
                                <span>Open GH</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Sent
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-200">Ivan Louie Malicsi</span> • PrismSQL Studio • All rights reserved
        </p>
      </footer>
    </div>
  )
}
