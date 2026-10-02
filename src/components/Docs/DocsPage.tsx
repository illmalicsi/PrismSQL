import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Sun,
  Moon,
  Terminal,
  FileCode,
  Lightbulb,
  Bug,
} from 'lucide-react'
import { SQL_DOCUMENTATION, DOC_CATEGORIES } from '../../data/sqlDocs'
import { useTheme } from '../../context/ThemeContext'
import { PrismLogo } from '../PrismLogo'

interface DocsPageProps {
  onBackToStudio?: () => void
  onSelectQuery?: (sql: string) => void
}

export const DocsPage: React.FC<DocsPageProps> = ({ onBackToStudio, onSelectQuery }) => {
  const { theme, toggleTheme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const handleOpenInStudio = (sql: string) => {
    if (onSelectQuery) {
      onSelectQuery(sql)
    } else {
      // If opened in another tab, open studio with query parameter
      const targetUrl = `${window.location.origin}${window.location.pathname}?query=${encodeURIComponent(sql)}`
      window.open(targetUrl, '_blank')
    }
  }

  const filteredQueries = useMemo(() => {
    return SQL_DOCUMENTATION.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false
      if (levelFilter !== 'All' && item.level !== levelFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesDesc = item.description.toLowerCase().includes(q)
        const matchesSql = item.exampleSql.toLowerCase().includes(q)
        const matchesCat = item.category.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc && !matchesSql && !matchesCat) return false
      }
      return true
    })
  }, [selectedCategory, levelFilter, searchQuery])

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'Intermediate':
        return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'Advanced':
        return 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/20'
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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

          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3 min-w-0">
            <PrismLogo size={22} className="shrink-0" />
            <div className="truncate">
              <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                PrismSQL
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5 hidden md:inline">
                Docs & Query Reference
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search all queries & syntax..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <a
            href="?view=feedback"
            target="_blank"
            rel="noopener noreferrer"
            title="Report a bug or feedback (Opens in new tab)"
            className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-xs no-underline"
          >
            <Bug className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span className="hidden sm:inline">Report Bug</span>
          </a>

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

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col md:flex-row gap-5 sm:gap-6">
        {/* Mobile Horizontal Category and Difficulty Scroller (< md) */}
        <div className="md:hidden space-y-2.5">
          {/* Mobile Search */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search SQL queries & syntax..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {DOC_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat
              const count =
                cat === 'All'
                  ? SQL_DOCUMENTATION.length
                  : SQL_DOCUMENTATION.filter((q) => q.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 font-medium ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#141724] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Difficulty Level Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 font-medium ${
                  levelFilter === lvl
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-[#141724] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Left Sticky Sidebar (Desktop only) */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4">
          <div className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
              Categories
            </h4>
            <div className="space-y-1">
              {DOC_CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? SQL_DOCUMENTATION.length
                    : SQL_DOCUMENTATION.filter((q) => q.category === cat).length
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
              Difficulty Level
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    levelFilter === lvl
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Quick SQLite Specs Note */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl p-3 text-xs text-indigo-900 dark:text-indigo-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SQLite WASM Engine</span>
            </div>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              PrismSQL executes entirely inside your browser. No data leaves your machine. Multi-statement queries, window functions, and CTEs are fully supported.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Header Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 dark:border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{selectedCategory === 'All' ? 'All SQL Queries' : selectedCategory}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-normal">
                  {filteredQueries.length} available
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Explore, copy, or launch sample queries and SQL syntax templates directly in the studio.
              </p>
            </div>
          </div>

          {/* Queries List */}
          {filteredQueries.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0e1017] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
              <BookOpen className="w-10 h-10 mb-3 opacity-30 text-indigo-500" />
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                No queries found
              </h3>
              <p className="text-xs mt-1">
                Try searching with different keywords or reset your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setLevelFilter('All')
                  setSearchQuery('')
                }}
                className="mt-4 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueries.map((item) => (
                <div
                  key={item.id}
                  id={item.id}
                  className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-3 group"
                >
                  {/* Card Header: Title & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getLevelBadgeClass(
                          item.level
                        )}`}
                      >
                        {item.level}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Code Container */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090a0f] text-slate-800 dark:text-slate-100 overflow-hidden font-mono text-xs shadow-inner relative">
                    {/* Code Header Bar with Copy & Run */}
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-[#12141e] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span>SQL Example</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(item.id, item.exampleSql)}
                          title="Copy SQL to clipboard"
                          className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-transparent transition-colors text-[10px]"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenInStudio(item.exampleSql)}
                          title="Run this query in SQL Studio"
                          className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-[10px] shadow-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Run in Studio</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-3.5 overflow-x-auto text-[12px] leading-relaxed text-indigo-950 dark:text-indigo-100">
                      <code>{item.exampleSql}</code>
                    </pre>
                  </div>

                  {/* Explanation & Pro Tip */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300 font-medium">How it works: </strong>
                      {item.explanation}
                    </p>
                    {item.tips && (
                      <p className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400/90 bg-amber-500/5 dark:bg-amber-500/10 p-2 rounded-lg border border-amber-500/15">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong>Tip: </strong>
                          {item.tips}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-200">Ivan Louie Malicsi</span> • PrismSQL Studio Documentation • All rights reserved
        </p>
      </footer>
    </div>
  )
}
