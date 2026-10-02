import React, { useState, useRef } from 'react'
import {
  RotateCcw,
  Upload,
  Download,
  Moon,
  Sun,
  Keyboard,
  FileSpreadsheet,
  FileCode,
  Check,
  ChevronDown,
  Database as DbIcon,
  Plus,
  Trash2,
  PanelLeft,
} from 'lucide-react'
import { DATASETS } from '../data/datasets'
import { useTheme } from '../context/ThemeContext'
import { exportBinaryDb, exportSqlDump, importSqlDump, importBinaryDb } from '../lib/db'
import { downloadBlob } from '../lib/exportUtils'
import { PrismLogo } from './PrismLogo'
import type { CustomDatabase } from '../types/sql'

interface HeaderProps {
  currentDataset: string
  currentDbName?: string
  customDatabases: CustomDatabase[]
  tableCount?: number
  mobileSidebarOpen?: boolean
  onToggleMobileSidebar?: () => void
  onSelectDataset: (id: string) => void
  onResetDb: () => void
  onOpenCsvModal: () => void
  onOpenShortcutsModal: () => void
  onSelectTemplate: (sql: string) => void
  onOpenCreateDbModal: () => void
  onDeleteCustomDb: (id: string, e: React.MouseEvent) => void
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  currentDbName,
  customDatabases,
  tableCount,
  mobileSidebarOpen,
  onToggleMobileSidebar,
  onSelectDataset,
  onResetDb,
  onOpenCsvModal,
  onOpenShortcutsModal,
  onOpenCreateDbModal,
  onDeleteCustomDb,
}) => {
  const { theme, toggleTheme } = useTheme()
  const [datasetMenuOpen, setDatasetMenuOpen] = useState(false)
  const [importMenuOpen, setImportMenuOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const sqlFileInputRef = useRef<HTMLInputElement>(null)
  const dbFileInputRef = useRef<HTMLInputElement>(null)

  const activeDatasetObj = DATASETS.find((d) => d.id === currentDataset)
  const activeCustomDb = customDatabases.find((d) => d.id === currentDataset)

  const displayDbName = currentDbName || activeCustomDb?.name || activeDatasetObj?.name || 'Active Database'
  const displayDbBadge = activeCustomDb ? 'Custom' : activeDatasetObj?.badge || 'SQLite'

  const handleExportSqlite = () => {
    try {
      const data = exportBinaryDb()
      const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/x-sqlite3' })
      downloadBlob(blob, `${currentDataset || 'database'}_export.sqlite`)
      setExportMenuOpen(false)
    } catch (e: any) {
      alert(`Export error: ${e?.message || e}`)
    }
  }

  const handleExportDump = () => {
    try {
      const dump = exportSqlDump()
      const blob = new Blob([dump], { type: 'text/plain;charset=utf-8' })
      downloadBlob(blob, `${currentDataset || 'database'}_dump.sql`)
      setExportMenuOpen(false)
    } catch (e: any) {
      alert(`Dump error: ${e?.message || e}`)
    }
  }

  const handleSqlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        importSqlDump(content)
        alert('SQL script executed and imported successfully!')
      } catch (err: any) {
        alert(`Error executing SQL file: ${err?.message || err}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
    setImportMenuOpen(false)
  }

  const handleDbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      await importBinaryDb(new Uint8Array(buffer))
      alert(`Loaded SQLite database "${file.name}" successfully!`)
    } catch (err: any) {
      alert(`Error loading database file: ${err?.message || err}`)
    }
    e.target.value = ''
    setImportMenuOpen(false)
  }

  const handleReset = () => {
    if (confirm('Reset active database to original sample state? Any unsaved modifications will be reverted.')) {
      setIsResetting(true)
      onResetDb()
      setTimeout(() => setIsResetting(false), 500)
    }
  }

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] px-4 flex items-center justify-between text-xs select-none z-30 relative transition-colors">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={sqlFileInputRef}
        onChange={handleSqlFileChange}
        accept=".sql"
        className="hidden"
      />
      <input
        type="file"
        ref={dbFileInputRef}
        onChange={handleDbFileChange}
        accept=".sqlite,.db,.sqlite3"
        className="hidden"
      />

      {/* Brand & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Sidebar"
          aria-expanded={mobileSidebarOpen}
          className={`md:hidden p-1.5 -ml-1 rounded-md transition-colors flex items-center gap-1 ${
            mobileSidebarOpen
              ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PanelLeft className="w-4 h-4 text-indigo-500" />
          {tableCount !== undefined && (
            <span className="text-[10px] px-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono">
              {tableCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-slate-900 dark:text-white">
          <PrismLogo size={26} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span>Prism</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400">
                SQL
              </span>
            </div>
            <span className="hidden sm:block text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
              Studio
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Engine status pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SQLite 3 (WASM)</span>
        </div>
      </div>

      {/* Center Controls: Dataset Switcher */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setDatasetMenuOpen(!datasetMenuOpen)
              setImportMenuOpen(false)
              setExportMenuOpen(false)
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#141724] hover:bg-slate-200 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <DbIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="text-slate-400 text-[11px] hidden md:inline">Database:</span>
            <span className="font-semibold text-slate-900 dark:text-white max-w-[85px] xs:max-w-[120px] sm:max-w-[150px] truncate text-xs">
              {displayDbName}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-medium">
              {displayDbBadge}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {datasetMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDatasetMenuOpen(false)}
              />
              <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1.5 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto">
                {/* Header & Create Action */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Databases
                  </span>
                  <button
                    onClick={() => {
                      setDatasetMenuOpen(false)
                      onOpenCreateDbModal()
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium shadow-xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Database</span>
                  </button>
                </div>

                {/* Custom User Databases Section */}
                {customDatabases.length > 0 && (
                  <div className="py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="px-3 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      My Custom Databases ({customDatabases.length})
                    </div>
                    {customDatabases.map((cd) => {
                      const isSelected = cd.id === currentDataset
                      return (
                        <div
                          key={cd.id}
                          onClick={() => {
                            onSelectDataset(cd.id)
                            setDatasetMenuOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-white font-medium'
                              : 'text-slate-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="shrink-0">
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-neutral-700" />
                              )}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-xs text-slate-900 dark:text-neutral-200">
                                {cd.name}
                              </span>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                Created {new Date(cd.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-medium">
                              Custom
                            </span>
                            <button
                              onClick={(e) => onDeleteCustomDb(cd.id, e)}
                              title="Delete database"
                              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Built-in Sample Datasets */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Sample Datasets
                  </div>
                  {DATASETS.map((ds) => {
                    const isSelected = ds.id === currentDataset
                    return (
                      <button
                        key={ds.id}
                        onClick={() => {
                          onSelectDataset(ds.id)
                          setDatasetMenuOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-white font-medium'
                            : 'text-slate-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isSelected ? (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-neutral-700" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-slate-900 dark:text-neutral-200">
                              {ds.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                              {ds.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {ds.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reset Database Button */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset database to initial dataset"
          className="p-1.5 rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-500' : ''}`} />
        </button>
      </div>

      {/* Right Controls: Import, Export, Shortcuts, Theme */}
      <div className="flex items-center gap-1.5">
        {/* Import Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setImportMenuOpen(!importMenuOpen)
              setExportMenuOpen(false)
              setDatasetMenuOpen(false)
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
            <span className="hidden sm:inline font-medium">Import</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {importMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setImportMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-52 rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-slate-800 shadow-2xl py-1 z-50">
                <button
                  onClick={() => {
                    setImportMenuOpen(false)
                    onOpenCsvModal()
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800/80 text-slate-800 dark:text-neutral-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <div>
                    <div className="font-medium">Import CSV</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">Auto-create table from CSV</div>
                  </div>
                </button>
                <button
                  onClick={() => sqlFileInputRef.current?.click()}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800/80 text-slate-800 dark:text-neutral-200"
                >
                  <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <div className="font-medium">Execute .SQL File</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">Run scripts and DDL</div>
                  </div>
                </button>
                <button
                  onClick={() => dbFileInputRef.current?.click()}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800/80 text-slate-800 dark:text-neutral-200"
                >
                  <DbIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium">Load SQLite .db</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">Open custom SQLite file</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setExportMenuOpen(!exportMenuOpen)
              setImportMenuOpen(false)
              setDatasetMenuOpen(false)
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141724] hover:bg-slate-200 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
            <span className="hidden sm:inline font-medium">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {exportMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setExportMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-52 rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-slate-800 shadow-2xl py-1 z-50">
                <button
                  onClick={handleExportSqlite}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800/80 text-slate-800 dark:text-neutral-200"
                >
                  <DbIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium">SQLite Database (.sqlite)</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">Binary SQLite file</div>
                  </div>
                </button>
                <button
                  onClick={handleExportDump}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800/80 text-slate-800 dark:text-neutral-200"
                >
                  <FileCode className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <div>
                    <div className="font-medium">SQL Dump Script (.sql)</div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">DDL & INSERT statements</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={onOpenShortcutsModal}
          title="Keyboard shortcuts"
          className="p-1.5 rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          className="p-1.5 rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  )
}
