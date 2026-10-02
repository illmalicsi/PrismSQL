import React, { useState } from 'react'
import {
  Table2,
  BookOpen,
  History,
  Bookmark,
  ChevronLeft,
  ChevronRight,
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
      <div className="w-10 border-r border-neutral-800 bg-[#0d0e12] flex flex-col items-center py-2 z-20 shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          title="Expand Sidebar"
          className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors mb-4"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setActiveTab('schema')
              onToggleCollapse()
            }}
            title="Tables & Schema"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <Table2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('templates')
              onToggleCollapse()
            }}
            title="Query Templates"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('history')
              onToggleCollapse()
            }}
            title="Query History"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('saved')
              onToggleCollapse()
            }}
            title="Bookmarks"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <aside className="w-72 lg:w-80 border-r border-neutral-800 bg-[#0d0e12] flex flex-col h-full z-20 shrink-0 select-none">
      {/* Sidebar Tab Header */}
      <div className="h-10 border-b border-neutral-800 flex items-center justify-between px-2 bg-[#090a0d]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              activeTab === 'schema'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Tables</span>
            <span className="text-[10px] bg-neutral-900 px-1 rounded text-neutral-400">
              {schemas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              activeTab === 'templates'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
              activeTab === 'history'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              activeTab === 'saved'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 min-h-0 bg-[#0d0e12]">
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
