import React, { useState } from 'react'
import {
  Table2,
  BarChart3,
  FileSearch,
  Code2,
  Download,
  Check,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Clock,
  Database,
  Layers,
  ChevronDown,
} from 'lucide-react'
import type { QueryResult } from '../../types/sql'
import { DataTable } from './DataTable'
import { DataVisualizer } from './DataVisualizer'
import { ExplainView } from './ExplainView'
import {
  exportResultToCsv,
  exportResultToJson,
  formatResultAsMarkdown,
  formatResultAsInserts,
} from '../../lib/exportUtils'

interface ResultsContainerProps {
  result: QueryResult | null
  explainResult: QueryResult | null
  activeView: 'table' | 'chart' | 'explain' | 'json'
  setActiveView: (view: 'table' | 'chart' | 'explain' | 'json') => void
  isMaximized: boolean
  onToggleMaximize: () => void
  originalQuery: string
}

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  result,
  explainResult,
  activeView,
  setActiveView,
  isMaximized,
  onToggleMaximize,
  originalQuery,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const handleCopyMarkdown = () => {
    if (!result) return
    const md = formatResultAsMarkdown(result)
    navigator.clipboard.writeText(md)
    setCopiedType('markdown')
    setTimeout(() => setCopiedType(null), 1500)
    setExportMenuOpen(false)
  }

  const handleCopyInserts = () => {
    if (!result) return
    const inserts = formatResultAsInserts(result, 'playground_export')
    navigator.clipboard.writeText(inserts)
    setCopiedType('inserts')
    setTimeout(() => setCopiedType(null), 1500)
    setExportMenuOpen(false)
  }

  const handleDownloadCsv = () => {
    if (!result) return
    exportResultToCsv(result)
    setExportMenuOpen(false)
  }

  const handleDownloadJson = () => {
    if (!result) return
    exportResultToJson(result)
    setExportMenuOpen(false)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c0e14] select-none text-xs border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Results Header Bar */}
      <div className="h-10 px-3 bg-slate-50 dark:bg-[#090a0f] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs transition-colors shrink-0 ${
              activeView === 'table'
                ? 'bg-white dark:bg-[#1a1e2b] text-indigo-600 dark:text-indigo-400 font-medium shadow-xs border border-slate-200 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>

          <button
            onClick={() => setActiveView('chart')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs transition-colors shrink-0 ${
              activeView === 'chart'
                ? 'bg-white dark:bg-[#1a1e2b] text-indigo-600 dark:text-indigo-400 font-medium shadow-xs border border-slate-200 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Chart</span>
          </button>

          <button
            onClick={() => setActiveView('explain')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs transition-colors shrink-0 ${
              activeView === 'explain'
                ? 'bg-white dark:bg-[#1a1e2b] text-indigo-600 dark:text-indigo-400 font-medium shadow-xs border border-slate-200 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Explain</span>
          </button>

          <button
            onClick={() => setActiveView('json')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs transition-colors shrink-0 ${
              activeView === 'json'
                ? 'bg-white dark:bg-[#1a1e2b] text-indigo-600 dark:text-indigo-400 font-medium shadow-xs border border-slate-200 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>

        {/* Center: Execution Stats Badges */}
        {result && !result.error && (
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>{result.executionTimeMs}ms</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>
                {result.values.length} {result.values.length === 1 ? 'row' : 'rows'}
              </span>
            </span>
            <span>•</span>
            <span>{result.columns.length} cols</span>
          </div>
        )}

        {/* Right: Export Menu & Maximize */}
        <div className="flex items-center gap-1 shrink-0">
          {result && !result.error && result.columns.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline font-medium">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white dark:bg-[#14161f] border border-slate-200 dark:border-neutral-800 shadow-2xl py-1 z-50">
                    <button
                      onClick={handleDownloadCsv}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 flex items-center justify-between"
                    >
                      <span>Download CSV</span>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">.csv</span>
                    </button>
                    <button
                      onClick={handleDownloadJson}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 flex items-center justify-between"
                    >
                      <span>Download JSON</span>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">.json</span>
                    </button>
                    <div className="h-[1px] bg-slate-100 dark:bg-neutral-800 my-1" />
                    <button
                      onClick={handleCopyMarkdown}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 flex items-center justify-between"
                    >
                      <span>Copy as Markdown</span>
                      {copiedType === 'markdown' && (
                        <Check className="w-3 h-3 text-emerald-500" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyInserts}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 flex items-center justify-between"
                    >
                      <span>Copy as SQL INSERTs</span>
                      {copiedType === 'inserts' && (
                        <Check className="w-3 h-3 text-emerald-500" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Restore editor layout' : 'Maximize results'}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isMaximized ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Results Viewport */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-white dark:bg-[#0c0e14]">
        {/* Error Display */}
        {result?.error ? (
          <div className="p-6 h-full flex flex-col items-center justify-center select-text">
            <div className="max-w-xl w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-400 mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>SQL Execution Error</span>
              </div>
              <div className="font-mono text-xs text-rose-900 dark:text-rose-200 bg-rose-100/60 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-200 dark:border-rose-500/20 whitespace-pre-wrap">
                {result.error}
              </div>
              <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400/80">
                Check table names, column spelling, or syntax near the flagged statement.
              </p>
            </div>
          </div>
        ) : !result ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 text-xs">
            <Database className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
            <span>Ready. Press &quot;Run Query&quot; to execute SQL.</span>
          </div>
        ) : activeView === 'table' ? (
          <DataTable result={result} />
        ) : activeView === 'chart' ? (
          <DataVisualizer result={result} />
        ) : activeView === 'explain' ? (
          <ExplainView result={explainResult} originalQuery={originalQuery} />
        ) : (
          /* Raw JSON View */
          <div className="h-full p-4 overflow-auto select-text font-mono text-xs bg-slate-50 dark:bg-[#0b0c10] text-slate-800 dark:text-emerald-400">
            <pre>
              {JSON.stringify(
                result.values.map((row) => {
                  const obj: Record<string, any> = {}
                  result.columns.forEach((c, idx) => {
                    obj[c] = row[idx]
                  })
                  return obj
                }),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
