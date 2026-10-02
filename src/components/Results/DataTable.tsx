import React, { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { QueryResult } from '../../types/sql'

interface DataTableProps {
  result: QueryResult
}

export const DataTable: React.FC<DataTableProps> = ({ result }) => {
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState<number>(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [copiedCell, setCopiedCell] = useState<{ r: number; c: number } | null>(null)

  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      if (sortAsc) setSortAsc(false)
      else {
        setSortCol(null)
        setSortAsc(true)
      }
    } else {
      setSortCol(colIndex)
      setSortAsc(true)
    }
  }

  const copyToClipboard = (text: string, r: number, c: number) => {
    navigator.clipboard.writeText(text)
    setCopiedCell({ r, c })
    setTimeout(() => setCopiedCell(null), 1200)
  }

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return result.values
    const q = searchQuery.toLowerCase()
    return result.values.filter((row) =>
      row.some((cell) => cell !== null && String(cell).toLowerCase().includes(q))
    )
  }, [result.values, searchQuery])

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (sortCol === null) return filteredRows
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortCol]
      const valB = b[sortCol]

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })
  }, [filteredRows, sortCol, sortAsc])

  // Pagination
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return sortedRows
    const start = (currentPage - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [sortedRows, currentPage, pageSize])

  if (!result.columns.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
        No results to display
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0e12] select-text">
      {/* Table Subtoolbar: Search & Quick pagination */}
      <div className="h-9 px-3 border-b border-neutral-800/80 flex items-center justify-between gap-3 text-xs bg-[#101217]">
        <div className="flex items-center gap-2 max-w-xs flex-1">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search results in table..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-[#161822] border border-neutral-800 rounded pl-7 pr-2 py-0.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
            />
          </div>
          {searchQuery && (
            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
              {filteredRows.length} matching
            </span>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 text-neutral-400 text-xs">
          <div className="flex items-center gap-1 text-[11px]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-[#161822] border border-neutral-800 rounded px-1.5 py-0.5 text-neutral-300 text-xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All</option>
            </select>
          </div>

          <div className="h-3 w-[1px] bg-neutral-800 mx-1" />

          <span className="text-[11px] font-mono">
            {pageSize === -1
              ? `1-${sortedRows.length} of ${sortedRows.length}`
              : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  sortedRows.length
                )} of ${sortedRows.length}`}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || pageSize === -1}
              className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || pageSize === -1}
              className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Viewport */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead className="bg-[#12141c] sticky top-0 z-10 select-none border-b border-neutral-800 shadow-sm">
            <tr>
              <th className="w-10 px-2.5 py-2 text-center text-neutral-500 font-mono text-[10px] border-r border-neutral-800/60">
                #
              </th>
              {result.columns.map((col, idx) => {
                const isSorted = sortCol === idx
                return (
                  <th
                    key={idx}
                    onClick={() => handleSort(idx)}
                    className="px-3 py-2 text-neutral-300 font-medium hover:bg-neutral-800/50 cursor-pointer border-r border-neutral-800/60 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-neutral-200">{col}</span>
                      <span className="text-neutral-500">
                        {isSorted ? (
                          sortAsc ? (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/40">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={result.columns.length + 1}
                  className="p-8 text-center text-neutral-500"
                >
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rIdx) => {
                const absoluteIndex =
                  pageSize === -1 ? rIdx + 1 : (currentPage - 1) * pageSize + rIdx + 1

                return (
                  <tr
                    key={rIdx}
                    className="hover:bg-neutral-800/40 group/row transition-colors"
                  >
                    <td className="px-2.5 py-1.5 text-center text-neutral-500 font-mono text-[10px] border-r border-neutral-800/40 select-none bg-[#0a0b0f]/30">
                      {absoluteIndex}
                    </td>

                    {row.map((cell, cIdx) => {
                      const isNull = cell === null || cell === undefined
                      const isNumber = typeof cell === 'number'
                      const isCopied = copiedCell?.r === rIdx && copiedCell?.c === cIdx
                      const cellText = isNull ? 'NULL' : String(cell)

                      return (
                        <td
                          key={cIdx}
                          onClick={() => !isNull && copyToClipboard(cellText, rIdx, cIdx)}
                          title={isNull ? 'NULL value' : 'Click to copy cell value'}
                          className={`px-3 py-1.5 border-r border-neutral-800/40 font-mono truncate max-w-xs cursor-pointer hover:bg-indigo-500/10 transition-colors relative group/cell ${
                            isNumber ? 'text-right text-cyan-300' : 'text-neutral-200'
                          }`}
                        >
                          {isNull ? (
                            <span className="text-[10px] font-sans italic text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800/60">
                              NULL
                            </span>
                          ) : (
                            <span>{cellText}</span>
                          )}

                          {isCopied && (
                            <span className="absolute right-1 top-1 text-[9px] bg-emerald-600 text-white px-1 rounded shadow">
                              Copied!
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
