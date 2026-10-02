import React, { useState } from 'react'
import {
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  Key,
  Link,
  Eye,
  Copy,
  Search,
  Hash,
  Type,
  Calendar,
  Layers,
} from 'lucide-react'
import type { TableSchema } from '../../types/sql'

interface SchemaViewerProps {
  schemas: TableSchema[]
  onSelectTable: (tableName: string) => void
  onPreviewTable: (table: TableSchema) => void
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({
  schemas,
  onSelectTable,
  onPreviewTable,
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    [schemas[0]?.name || '']: true,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedTable, setCopiedTable] = useState<string | null>(null)

  const toggleTable = (name: string) => {
    setExpandedTables((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleCopyName = (e: React.MouseEvent, name: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(name)
    setCopiedTable(name)
    setTimeout(() => setCopiedTable(null), 1200)
  }

  const filteredSchemas = schemas.filter((schema) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const matchesTable = schema.name.toLowerCase().includes(q)
    const matchesColumn = schema.columns.some((c) => c.name.toLowerCase().includes(q))
    return matchesTable || matchesColumn
  })

  const getColumnIcon = (colType: string) => {
    const t = colType.toUpperCase()
    if (t.includes('INT') || t.includes('REAL') || t.includes('NUM') || t.includes('FLOA')) {
      return <Hash className="w-3 h-3 text-cyan-400" />
    }
    if (t.includes('DATE') || t.includes('TIME')) {
      return <Calendar className="w-3 h-3 text-amber-400" />
    }
    return <Type className="w-3 h-3 text-emerald-400" />
  }

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Search Input */}
      <div className="p-2 border-b border-neutral-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter tables & columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111218] border border-neutral-800 rounded-md pl-8 pr-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
        {filteredSchemas.length === 0 ? (
          <div className="p-6 text-center text-neutral-500">
            <Layers className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No matching tables found</p>
          </div>
        ) : (
          filteredSchemas.map((schema) => {
            const isExpanded = !!expandedTables[schema.name]
            return (
              <div key={schema.name} className="group/table">
                {/* Table Header Row */}
                <div
                  onClick={() => toggleTable(schema.name)}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-800/40 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-neutral-500 hover:text-neutral-300">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <TableIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTable(schema.name)
                      }}
                      title={`Click to query ${schema.name}`}
                      className="font-medium text-neutral-200 hover:text-indigo-300 truncate"
                    >
                      {schema.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800/80 font-mono">
                      {schema.rowCount} rows
                    </span>

                    {/* Table Quick Actions */}
                    <div className="opacity-0 group-hover/table:opacity-100 flex items-center transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onPreviewTable(schema)
                        }}
                        title="Preview table data & schema"
                        className="p-1 hover:text-white text-neutral-400 rounded hover:bg-neutral-700/50"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleCopyName(e, schema.name)}
                        title="Copy table name"
                        className="p-1 hover:text-white text-neutral-400 rounded hover:bg-neutral-700/50"
                      >
                        {copiedTable === schema.name ? (
                          <span className="text-[9px] text-emerald-400 font-bold">✓</span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Columns List (Expanded) */}
                {isExpanded && (
                  <div className="bg-[#0b0c10]/50 py-1 pl-7 pr-3 space-y-0.5 border-l-2 border-indigo-500/30 ml-3.5 my-0.5">
                    {schema.columns.map((col) => {
                      const isFk = schema.foreignKeys.some((fk) => fk.from === col.name)
                      return (
                        <div
                          key={col.cid}
                          className="flex items-center justify-between py-0.5 text-[11px] text-neutral-300 hover:text-white"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {getColumnIcon(col.type)}
                            <span className="truncate">{col.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {col.pk === 1 && (
                              <span
                                title="Primary Key"
                                className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/20"
                              >
                                <Key className="w-2.5 h-2.5" /> PK
                              </span>
                            )}
                            {isFk && (
                              <span
                                title="Foreign Key"
                                className="flex items-center gap-0.5 text-[9px] text-cyan-400 bg-cyan-500/10 px-1 rounded border border-cyan-500/20"
                              >
                                <Link className="w-2.5 h-2.5" /> FK
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {col.type || 'TEXT'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
