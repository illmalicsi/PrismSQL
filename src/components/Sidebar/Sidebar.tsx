import React, { useState } from 'react'
import {
  Table2,
  BookOpen,
  History,
  Bookmark,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import type { TableSchema, HistoryItem, SavedQuery } from '../../types/sql'
import { SchemaViewer } from './SchemaViewer'
import { QueryLibrary } from './QueryLibrary'
import { QueryHistory } from './QueryHistory'
import { SavedQueries } from './SavedQueries'

interface SidebarProps {
  schemas: TableSchema[]
  history: HistoryItem[]
  savedQueries: SavedQuery[]
  currentDataset: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSelectTable: (tableName: string) => void
  onPreviewTable: (table: TableSchema) => void
  onSelectTemplate: (sql: string, runImmediately?: boolean) => void
  onSelectHistoryQuery: (sql: string) => void
  onClearHistory: () => void
  onDeleteSavedQuery: (id: string) => void
  onOpenSaveModal: () => void
}

type TabType = 'schema' | 'templates' | 'history' | 'saved'

export const Sidebar: React.FC<SidebarProps> = ({
  schemas,
  history,
  savedQueries,
  currentDataset,
  isCollapsed,
  onToggleCollapse,
  onSelectTable,
  onPreviewTable,
  onSelectTemplate,
  onSelectHistoryQuery,
  onClearHistory,
  onDeleteSavedQuery,
  onOpenSaveModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('schema')

  if (isCollapsed) {
    return (
      <div className="w-11 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0e14] flex flex-col items-center py-2.5 z-20 shrink-0 select-none overflow-hidden">
        <button
          onClick={onToggleCollapse}
          title="Expand Sidebar"
          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
        >
          <PanelLeft className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setActiveTab('schema')
              onToggleCollapse()
            }}
            title="Tables & Schema"
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Table2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('templates')
              onToggleCollapse()
            }}
            title="Query Library"
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('history')
              onToggleCollapse()
            }}
            title="Query History"
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('saved')
              onToggleCollapse()
            }}
            title="Bookmarks"
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <aside className="w-72 lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0e14] flex flex-col h-full z-20 shrink-0 select-none overflow-hidden">
      {/* 1. Dedicated Top Section Bar with Explorer Title and Collapse Button */}
      <div className="h-9 px-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-100/80 dark:bg-[#090a0f] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Workspace
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-600">•</span>
          <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 font-mono">
            {schemas.length} {schemas.length === 1 ? 'table' : 'tables'}
          </span>
        </div>

        <button
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Seamless 4-Tab Segmented Control (Grid with equal width, NO overflow) */}
      <div className="p-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-[#0e1017] shrink-0">
        <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-slate-200/60 dark:bg-[#141724]">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] transition-all min-w-0 ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-[#1f2438] text-slate-900 dark:text-white font-medium shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Table2 className="w-3 h-3 shrink-0" />
            <span className="truncate">Tables</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] transition-all min-w-0 ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-[#1f2438] text-slate-900 dark:text-white font-medium shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">Library</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] transition-all min-w-0 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-[#1f2438] text-slate-900 dark:text-white font-medium shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3 h-3 shrink-0" />
            <span className="truncate">History</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] transition-all min-w-0 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-[#1f2438] text-slate-900 dark:text-white font-medium shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3 h-3 shrink-0" />
            <span className="truncate">Saved</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Content Panel */}
      <div className="flex-1 min-h-0 bg-white dark:bg-[#0c0e14] overflow-hidden">
        {activeTab === 'schema' && (
          <SchemaViewer
            schemas={schemas}
            onSelectTable={onSelectTable}
            onPreviewTable={onPreviewTable}
          />
        )}
        {activeTab === 'templates' && (
          <QueryLibrary
            currentDataset={currentDataset}
            onSelectTemplate={onSelectTemplate}
          />
        )}
        {activeTab === 'history' && (
          <QueryHistory
            history={history}
            onSelectQuery={onSelectHistoryQuery}
            onClearHistory={onClearHistory}
          />
        )}
        {activeTab === 'saved' && (
          <SavedQueries
            savedQueries={savedQueries}
            onSelectQuery={onSelectHistoryQuery}
            onDeleteQuery={onDeleteSavedQuery}
            onOpenSaveModal={onOpenSaveModal}
          />
        )}
      </div>
    </aside>
  )
}
