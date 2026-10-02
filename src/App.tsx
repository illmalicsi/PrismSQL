import React, { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'sql-formatter'
import type {
  TableSchema,
  QueryResult,
  HistoryItem,
  SavedQuery,
  EditorTab,
  CustomDatabase,
} from './types/sql'
import {
  initDatabase,
  executeQuery,
  explainQuery,
  getSchema,
  subscribeToSchema,
  subscribeToDbChange,
  createNewDatabase,
  getStoredCustomDatabases,
  deleteCustomDatabaseFromStorage,
  getCurrentDbName,
} from './lib/db'
import { parseSqlError } from './lib/sqlErrorParser'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar/Sidebar'
import { EditorToolbar } from './components/Editor/EditorToolbar'
import { SqlEditor } from './components/Editor/SqlEditor'
import { ResultsContainer } from './components/Results/ResultsContainer'
import { CsvImportModal } from './components/Modals/CsvImportModal'
import { TableDetailsModal } from './components/Modals/TableDetailsModal'
import { SaveQueryModal } from './components/Modals/SaveQueryModal'
import { ShortcutsModal } from './components/Modals/ShortcutsModal'
import { CreateDatabaseModal } from './components/Modals/CreateDatabaseModal'
import { BuyMeCoffeeModal } from './components/Modals/BuyMeCoffeeModal'
import { DocsPage } from './components/Docs/DocsPage'
import { FeedbackPage } from './components/Feedback/FeedbackPage'
import { ThemeProvider } from './context/ThemeContext'
import { PrismLogo } from './components/PrismLogo'
import { Loader2, AlertCircle, Coffee } from 'lucide-react'

const DEFAULT_QUERY = ''

// Clean up any legacy boilerplate users table from previous runs
try {
  const legacyFlag = 'sqlplayground_cleaned_boilerplate_users_v4'
  if (!localStorage.getItem(legacyFlag)) {
    localStorage.setItem(legacyFlag, 'true')
    const rawSql = localStorage.getItem('sqlplayground_default_db_sql')
    if (
      rawSql &&
      (rawSql.includes('Alex Morgan') ||
        rawSql.includes('Sam Rivera') ||
        rawSql.includes('alex@example.com') ||
        rawSql.includes('"users"') ||
        rawSql.includes('users'))
    ) {
      localStorage.removeItem('sqlplayground_default_db_sql')
    }
  }
} catch (e) {
  console.warn(e)
}

export function AppContent() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [currentDataset, setCurrentDataset] = useState(() => {
    try {
      const saved = localStorage.getItem('sqlplayground_active_dataset')
      // If no saved dataset or if it was the old default 'ecommerce', start clean with 'default'
      if (!saved || saved === 'ecommerce') {
        localStorage.setItem('sqlplayground_active_dataset', 'default')
        return 'default'
      }
      return saved
    } catch {
      return 'default'
    }
  })
  const [currentDbName, setCurrentDbName] = useState(() => getCurrentDbName())
  const [customDatabases, setCustomDatabases] = useState<CustomDatabase[]>(() => getStoredCustomDatabases())
  const [schemas, setSchemas] = useState<TableSchema[]>([])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isDocsView, setIsDocsView] = useState(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('view') === 'docs' || window.location.hash === '#docs'
  })
  const [isFeedbackView, setIsFeedbackView] = useState(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    return (
      view === 'feedback' ||
      view === 'report' ||
      view === 'bugs' ||
      window.location.hash === '#feedback' ||
      window.location.hash === '#report' ||
      window.location.hash === '#bugs'
    )
  })

  // Handle URL navigation & popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const view = params.get('view')
      setIsDocsView(view === 'docs' || window.location.hash === '#docs')
      setIsFeedbackView(
        view === 'feedback' ||
        view === 'report' ||
        view === 'bugs' ||
        window.location.hash === '#feedback' ||
        window.location.hash === '#report' ||
        window.location.hash === '#bugs'
      )
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Check if query was passed in URL params (e.g. from docs "Run in Studio")
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('query')
      if (q && q.trim()) {
        setTabs([{ id: 'tab-1', title: 'Query 1', query: q.trim() }])
        setActiveTabId('tab-1')
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Editor Tabs
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: 'tab-1', title: 'Query 1', query: DEFAULT_QUERY },
  ])
  const [activeTabId, setActiveTabId] = useState('tab-1')

  // Execution & Results
  const [result, setResult] = useState<QueryResult | null>(null)
  const [explainResult, setExplainResult] = useState<QueryResult | null>(null)
  const [activeView, setActiveView] = useState<'table' | 'chart' | 'explain' | 'json'>('table')
  const [isMaximized, setIsMaximized] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  // Layout & Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [editorHeightPercent, setEditorHeightPercent] = useState(48) // split %
  const isDraggingSplitter = useRef(false)

  // Modals
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [createDbModalOpen, setCreateDbModalOpen] = useState(false)
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false)
  const [inspectedTable, setInspectedTable] = useState<TableSchema | null>(null)

  // History & Saved Queries (Local Storage)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sqlplayground_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => {
    try {
      const saved = localStorage.getItem('sqlplayground_saved')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sqlplayground_history', JSON.stringify(history.slice(0, 50)))
    } catch (e) {
      console.error(e)
    }
  }, [history])

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sqlplayground_saved', JSON.stringify(savedQueries))
    } catch (e) {
      console.error(e)
    }
  }, [savedQueries])

  // Initialize DB engine on mount
  useEffect(() => {
    let isMounted = true
    async function setup() {
      try {
        setIsInitializing(true)
        await initDatabase(currentDataset)
        if (!isMounted) return
        const s = getSchema()
        setSchemas(s)
        setCurrentDbName(getCurrentDbName())
        setCustomDatabases(getStoredCustomDatabases())

        // Only run query if database already contains tables
        if (s.length > 0) {
          const res = executeQuery(`SELECT * FROM "${s[0].name}" LIMIT 50;`)
          setResult(res)
        } else {
          setResult(null)
        }
        setIsInitializing(false)
      } catch (err: any) {
        if (!isMounted) return
        console.error('Failed to init SQLite:', err)
        setInitError(err?.message || 'Failed to initialize SQLite engine')
        setIsInitializing(false)
      }
    }
    setup()

    const unsubscribeSchema = subscribeToSchema((newSchemas) => {
      if (isMounted) setSchemas(newSchemas)
    })

    const unsubscribeDb = subscribeToDbChange(({ id, name }) => {
      if (isMounted) {
        setCurrentDataset(id)
        setCurrentDbName(name)
        setCustomDatabases(getStoredCustomDatabases())
      }
    })

    return () => {
      isMounted = false
      unsubscribeSchema()
      unsubscribeDb()
    }
  }, [])

  // Active query getter & setter
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const updateActiveQuery = (newQuery: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, query: newQuery } : t))
    )
  }

  // Run Query
  const handleRunQuery = useCallback(() => {
    if (!activeTab || !activeTab.query.trim()) return

    setIsRunning(true)
    try {
      const res = executeQuery(activeTab.query)
      setResult(res)

      // Add to history
      const historyItem: HistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        query: activeTab.query.trim(),
        timestamp: Date.now(),
        durationMs: res.executionTimeMs,
        rowCount: res.values.length,
        status: res.error ? 'error' : 'success',
        error: res.error,
        errorDetails: res.errorDetails,
      }
      setHistory((prev) => [historyItem, ...prev.slice(0, 49)])

      // If user was on explain view and ran normal query, switch to table view
      if (activeView === 'explain' && !res.error) {
        setActiveView('table')
      }
    } catch (err: any) {
      const errMessage = err?.message || String(err)
      const errorDetails = parseSqlError(activeTab.query, errMessage)
      setResult({
        columns: [],
        values: [],
        executionTimeMs: 0,
        rowsAffected: 0,
        query: activeTab.query,
        timestamp: Date.now(),
        error: errMessage,
        errorDetails,
      })
    } finally {
      setIsRunning(false)
    }
  }, [activeTab, activeView])

  // Explain Query Plan
  const handleExplainPlan = useCallback(() => {
    if (!activeTab || !activeTab.query.trim()) return
    try {
      const exp = explainQuery(activeTab.query)
      setExplainResult(exp)
      setActiveView('explain')
    } catch (err: any) {
      alert(`Explain error: ${err?.message || err}`)
    }
  }, [activeTab])

  // Format SQL
  const handleFormatSql = useCallback(() => {
    if (!activeTab || !activeTab.query.trim()) return
    try {
      const formatted = format(activeTab.query, {
        language: 'sqlite',
        tabWidth: 2,
        keywordCase: 'upper',
      })
      updateActiveQuery(formatted)
    } catch (err: any) {
      console.warn('Formatting failed:', err)
    }
  }, [activeTab])

  // Dataset switch
  const handleSelectDataset = async (datasetId: string) => {
    try {
      setIsInitializing(true)
      setCurrentDataset(datasetId)
      await initDatabase(datasetId)
      const newSchemas = getSchema()
      setSchemas(newSchemas)

      // Switch default query according to dataset
      let starterSql = ''
      const customDb = customDatabases.find((c) => c.id === datasetId)
      if (customDb) {
        starterSql = customDb.sql || ''
      } else if (datasetId === 'default' || datasetId === 'blank') {
        starterSql = ''
      } else if (datasetId === 'ecommerce') {
        starterSql = `SELECT 
    p.name AS product_name,
    c.name AS category,
    p.price,
    p.stock_quantity,
    p.rating
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1
ORDER BY p.price DESC
LIMIT 15;`
      } else if (datasetId === 'saas') {
        starterSql = `SELECT 
    p.name AS plan_name,
    COUNT(o.id) AS active_clients,
    ROUND(SUM(o.mrr_usd), 2) AS total_mrr
FROM plans p
LEFT JOIN organizations o ON p.id = o.plan_id
GROUP BY p.id, p.name
ORDER BY total_mrr DESC;`
      } else if (datasetId === 'hr_tech') {
        starterSql = `SELECT 
    d.name AS department,
    COUNT(e.id) AS total_employees,
    ROUND(AVG(e.salary), 2) AS average_salary,
    MAX(e.salary) AS highest_salary
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.id, d.name
ORDER BY average_salary DESC;`
      } else {
        starterSql = ''
      }

      setTabs([{ id: 'tab-1', title: 'Query 1', query: starterSql }])
      setActiveTabId('tab-1')

      if (newSchemas.length > 0 && starterSql.trim()) {
        const res = executeQuery(starterSql)
        setResult(res)
      } else {
        setResult(null)
      }
    } catch (err: any) {
      alert(`Error loading dataset: ${err?.message || err}`)
    } finally {
      setIsInitializing(false)
    }
  }

  // Create New Database
  const handleCreateDatabase = async (name: string, starterSql?: string) => {
    try {
      setIsInitializing(true)
      const newId = await createNewDatabase(name, starterSql)
      setCurrentDataset(newId)
      setCurrentDbName(name)
      setCustomDatabases(getStoredCustomDatabases())
      const newSchemas = getSchema()
      setSchemas(newSchemas)

      if (newSchemas.length > 0) {
        const firstTable = newSchemas[0].name
        const initialTabSql = `SELECT * FROM "${firstTable}" LIMIT 50;\n`
        setTabs([{ id: 'tab-1', title: 'Query 1', query: initialTabSql }])
        setActiveTabId('tab-1')
        const res = executeQuery(initialTabSql)
        setResult(res)
        setActiveView('table')
      } else {
        setTabs([{ id: 'tab-1', title: 'Query 1', query: '' }])
        setActiveTabId('tab-1')
        setResult(null)
      }
    } catch (err: any) {
      alert(`Failed to create database: ${err?.message || err}`)
    } finally {
      setIsInitializing(false)
    }
  }

  // Delete Custom Database
  const handleDeleteCustomDb = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const target = customDatabases.find((c) => c.id === id)
    if (!target) return
    if (confirm(`Are you sure you want to delete custom database "${target.name}"?`)) {
      deleteCustomDatabaseFromStorage(id)
      setCustomDatabases(getStoredCustomDatabases())
      if (currentDataset === id) {
        handleSelectDataset('default')
      }
    }
  }

  // Reset database
  const handleResetDb = async () => {
    if (currentDataset === 'default' || currentDataset === 'blank') {
      try {
        localStorage.removeItem('sqlplayground_default_db_sql')
      } catch (e) {
        console.error(e)
      }
    }
    await initDatabase(currentDataset)
    const newSchemas = getSchema()
    setSchemas(newSchemas)
    if (newSchemas.length > 0 && activeTab && activeTab.query.trim()) {
      const res = executeQuery(activeTab.query)
      setResult(res)
    } else {
      setResult(null)
    }
  }

  // Table selection from sidebar
  const handleSelectTable = (tableName: string) => {
    const sql = `SELECT * FROM "${tableName}" LIMIT 50;`
    updateActiveQuery(sql)
    const res = executeQuery(sql)
    setResult(res)
    setActiveView('table')
  }

  // Template selection
  const handleSelectTemplate = (sql: string, runImmediately = false) => {
    updateActiveQuery(sql)
    if (runImmediately) {
      const res = executeQuery(sql)
      setResult(res)
      setActiveView('table')
    }
  }

  // New tab
  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`
    const newTitle = `Query ${tabs.length + 1}`
    setTabs((prev) => [...prev, { id: newId, title: newTitle, query: '' }])
    setActiveTabId(newId)
  }

  // Close tab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length <= 1) return
    const remaining = tabs.filter((t) => t.id !== id)
    setTabs(remaining)
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id)
    }
  }

  // Save Query Bookmark
  const handleSaveQuery = (title: string, description: string) => {
    if (!activeTab) return
    const newBookmark: SavedQuery = {
      id: `save_${Date.now()}`,
      title,
      description,
      query: activeTab.query,
      createdAt: Date.now(),
    }
    setSavedQueries((prev) => [newBookmark, ...prev])
  }

  // CSV Import success
  const handleCsvSuccess = (tableName: string) => {
    const sql = `SELECT * FROM "${tableName}" LIMIT 50;`
    updateActiveQuery(sql)
    const res = executeQuery(sql)
    setResult(res)
    setActiveView('table')
  }

  // Resizable splitter logic
  const handleMouseDownSplitter = () => {
    isDraggingSplitter.current = true
    document.addEventListener('mousemove', handleMouseMoveSplitter)
    document.addEventListener('mouseup', handleMouseUpSplitter)
  }

  const handleMouseMoveSplitter = useCallback((e: MouseEvent) => {
    if (!isDraggingSplitter.current) return
    const container = document.getElementById('editor-results-container')
    if (!container) return
    const rect = container.getBoundingClientRect()
    const newPercent = ((e.clientY - rect.top) / rect.height) * 100
    if (newPercent >= 15 && newPercent <= 85) {
      setEditorHeightPercent(newPercent)
    }
  }, [])

  const handleMouseUpSplitter = useCallback(() => {
    isDraggingSplitter.current = false
    document.removeEventListener('mousemove', handleMouseMoveSplitter)
    document.removeEventListener('mouseup', handleMouseUpSplitter)
  }, [handleMouseMoveSplitter])

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-slate-50 dark:bg-[#090a0f] text-slate-800 dark:text-neutral-200 flex flex-col items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-3">
          <PrismLogo size={48} className="animate-pulse" />
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mt-1">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Initializing PrismSQL Engine...</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Bootstrapping in-memory SQLite WASM & sample databases
          </p>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="h-screen w-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-neutral-200 flex flex-col items-center justify-center select-none p-6 font-sans">
        <div className="max-w-md w-full p-6 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-center shadow-lg">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-500 mb-2" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Initialization Failed</h2>
          <p className="text-xs text-rose-700 dark:text-rose-200/90 mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isDocsView) {
    return (
      <DocsPage
        onBackToStudio={() => {
          window.history.pushState({}, '', window.location.pathname)
          setIsDocsView(false)
        }}
        onSelectQuery={(sql) => {
          setTabs([{ id: 'tab-1', title: 'Query 1', query: sql }])
          setActiveTabId('tab-1')
          window.history.pushState({}, '', window.location.pathname)
          setIsDocsView(false)
        }}
      />
    )
  }

  if (isFeedbackView) {
    return (
      <FeedbackPage
        onBackToStudio={() => {
          window.history.pushState({}, '', window.location.pathname)
          setIsFeedbackView(false)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#090a0f] text-slate-900 dark:text-neutral-100 font-sans">
      {/* Top Header */}
      <Header
        currentDataset={currentDataset}
        currentDbName={currentDbName}
        customDatabases={customDatabases}
        tableCount={schemas.length}
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onSelectDataset={(id) => {
          handleSelectDataset(id)
          setMobileSidebarOpen(false)
        }}
        onResetDb={handleResetDb}
        onOpenCsvModal={() => setCsvModalOpen(true)}
        onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
        onSelectTemplate={(sql) => handleSelectTemplate(sql, false)}
        onOpenCreateDbModal={() => setCreateDbModalOpen(true)}
        onDeleteCustomDb={handleDeleteCustomDb}
        onOpenCoffeeModal={() => setCoffeeModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          schemas={schemas}
          history={history}
          savedQueries={savedQueries}
          currentDataset={currentDataset}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectTable={(tbl) => {
            handleSelectTable(tbl)
            setMobileSidebarOpen(false)
          }}
          onPreviewTable={(tbl) => setInspectedTable(tbl)}
          onSelectTemplate={(sql, run) => {
            handleSelectTemplate(sql, run)
            setMobileSidebarOpen(false)
          }}
          onSelectHistoryQuery={(sql) => {
            updateActiveQuery(sql)
            setMobileSidebarOpen(false)
          }}
          onClearHistory={() => setHistory([])}
          onDeleteSavedQuery={(id) =>
            setSavedQueries((prev) => prev.filter((q) => q.id !== id))
          }
          onOpenSaveModal={() => setSaveModalOpen(true)}
        />

        {/* Center / Right: Editor & Results Split Pane */}
        <div
          id="editor-results-container"
          className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden"
        >
          {/* Top Panel: Editor (hidden if results maximized) */}
          {!isMaximized && (
            <div
              style={{ height: `${editorHeightPercent}%` }}
              className="flex flex-col min-h-[140px] relative border-b border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <EditorToolbar
                tabs={tabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
                onNewTab={handleNewTab}
                onCloseTab={handleCloseTab}
                onRunQuery={handleRunQuery}
                onExplainPlan={handleExplainPlan}
                onFormatSql={handleFormatSql}
                onClearSql={() => updateActiveQuery('')}
                onSaveQuery={() => setSaveModalOpen(true)}
                isRunning={isRunning}
              />
              <div className="flex-1 min-h-0 overflow-hidden">
                <SqlEditor
                  value={activeTab.query}
                  onChange={updateActiveQuery}
                  onRunQuery={handleRunQuery}
                  onFormatSql={handleFormatSql}
                  schemas={schemas}
                  errorDetails={result?.errorDetails}
                />
              </div>
            </div>
          )}

          {/* Resizer Splitter Bar (hidden if results maximized) */}
          {!isMaximized && (
            <div
              onMouseDown={handleMouseDownSplitter}
              className="h-1.5 bg-slate-200 dark:bg-neutral-800/80 hover:bg-indigo-500 dark:hover:bg-indigo-500 cursor-row-resize transition-colors z-10 shrink-0 select-none flex items-center justify-center group"
            >
              <div className="w-8 h-0.5 rounded-full bg-slate-400 dark:bg-neutral-600 group-hover:bg-white" />
            </div>
          )}

          {/* Bottom Panel: Results */}
          <div
            style={{
              height: isMaximized ? '100%' : `${100 - editorHeightPercent}%`,
            }}
            className="flex-1 flex flex-col min-h-[140px] relative overflow-hidden"
          >
            <ResultsContainer
              result={result}
              explainResult={explainResult}
              activeView={activeView}
              setActiveView={setActiveView}
              isMaximized={isMaximized}
              onToggleMaximize={() => setIsMaximized(!isMaximized)}
              originalQuery={activeTab.query}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status & Copyright Bar */}
      <footer className="h-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] px-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0 select-none z-20">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">SQLite WASM</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            In-Browser SQL Studio
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={() => setCoffeeModalOpen(true)}
            title="Support on Buy Me a Coffee (Built-in)"
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors font-medium cursor-pointer"
          >
            <Coffee className="w-3 h-3 text-amber-500 fill-amber-500/20" />
            <span>Buy me a coffee</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>© {new Date().getFullYear()}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Ivan Louie Malicsi</span>
          <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">•</span>
          <span className="text-slate-400 dark:text-slate-500 hidden xs:inline">All rights reserved</span>
        </div>
      </footer>

      {/* Modals */}
      <CsvImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onSuccess={handleCsvSuccess}
      />
      <TableDetailsModal
        table={inspectedTable}
        onClose={() => setInspectedTable(null)}
        onQueryTable={handleSelectTable}
      />
      <SaveQueryModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveQuery}
        currentQuery={activeTab.query}
      />
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
      <CreateDatabaseModal
        isOpen={createDbModalOpen}
        onClose={() => setCreateDbModalOpen(false)}
        onCreate={handleCreateDatabase}
      />
      <BuyMeCoffeeModal
        isOpen={coffeeModalOpen}
        onClose={() => setCoffeeModalOpen(false)}
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
