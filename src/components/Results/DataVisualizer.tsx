import React, { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2'
import { BarChart3, LineChart, PieChart, Info } from 'lucide-react'
import type { QueryResult } from '../../types/sql'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DataVisualizerProps {
  result: QueryResult
}

type ChartType = 'bar' | 'line' | 'doughnut' | 'pie'

const COLOR_PALETTE = [
  'rgba(99, 102, 241, 0.85)', // Indigo
  'rgba(16, 185, 129, 0.85)', // Emerald
  'rgba(6, 182, 212, 0.85)',  // Cyan
  'rgba(245, 158, 11, 0.85)', // Amber
  'rgba(244, 63, 94, 0.85)',  // Rose
  'rgba(168, 85, 247, 0.85)', // Purple
  'rgba(20, 184, 166, 0.85)', // Teal
  'rgba(249, 115, 22, 0.85)', // Orange
]

const BORDER_PALETTE = [
  'rgb(99, 102, 241)',
  'rgb(16, 185, 129)',
  'rgb(6, 182, 212)',
  'rgb(245, 158, 11)',
  'rgb(244, 63, 94)',
  'rgb(168, 85, 247)',
  'rgb(20, 184, 166)',
  'rgb(249, 115, 22)',
]

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ result }) => {
  const { theme } = useTheme()
  const [chartType, setChartType] = useState<ChartType>('bar')

  // Find suitable numeric and categorical columns
  const { numericCols, labelCols } = useMemo(() => {
    if (!result || !result.columns.length || !result.values.length) {
      return { numericCols: [], labelCols: [] }
    }

    const nCols: string[] = []
    const lCols: string[] = []

    result.columns.forEach((col, idx) => {
      // Check first few rows
      let isNumber = true
      let hasData = false

      for (let i = 0; i < Math.min(result.values.length, 10); i++) {
        const val = result.values[i][idx]
        if (val !== null && val !== undefined) {
          hasData = true
          if (typeof val !== 'number') {
            isNumber = false
            break
          }
        }
      }

      if (hasData && isNumber) {
        nCols.push(col)
      } else {
        lCols.push(col)
      }
    })

    return { numericCols: nCols, labelCols: lCols }
  }, [result])

  const [labelCol, setLabelCol] = useState<string>(
    labelCols[0] || result.columns[0] || ''
  )
  const [valueCol, setValueCol] = useState<string>(
    numericCols[0] || result.columns[1] || result.columns[0] || ''
  )

  // Sync if columns changed
  useMemo(() => {
    if (!result.columns.includes(labelCol)) {
      setLabelCol(labelCols[0] || result.columns[0] || '')
    }
    if (!result.columns.includes(valueCol)) {
      setValueCol(numericCols[0] || result.columns[1] || result.columns[0] || '')
    }
  }, [result.columns, labelCols, numericCols])

  // Build chart data
  const chartData = useMemo(() => {
    if (!result.columns.length || !result.values.length) return null

    const labelIdx = result.columns.indexOf(labelCol)
    const valueIdx = result.columns.indexOf(valueCol)

    if (labelIdx === -1 || valueIdx === -1) return null

    // Slice to top 40 items so chart remains clean and sharp
    const rows = result.values.slice(0, 40)
    const labels = rows.map((r) => String(r[labelIdx] ?? 'NULL'))
    const dataValues = rows.map((r) => {
      const v = r[valueIdx]
      return typeof v === 'number' ? v : parseFloat(String(v)) || 0
    })

    const isPieOrDoughnut = chartType === 'doughnut' || chartType === 'pie'

    return {
      labels,
      datasets: [
        {
          label: valueCol,
          data: dataValues,
          backgroundColor: isPieOrDoughnut
            ? labels.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length])
            : COLOR_PALETTE[0],
          borderColor: isPieOrDoughnut
            ? labels.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length])
            : BORDER_PALETTE[0],
          borderWidth: 1.5,
          borderRadius: chartType === 'bar' ? 4 : 0,
        },
      ],
    }
  }, [result, labelCol, valueCol, chartType])

  const chartOptions = useMemo(() => {
    const isDark = theme === 'dark'
    const textColor = isDark ? '#94a3b8' : '#475569'
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === 'pie' || chartType === 'doughnut',
          position: 'right' as const,
          labels: {
            color: textColor,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#1e2230' : '#ffffff',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 8,
          boxPadding: 4,
        },
      },
      scales:
        chartType === 'pie' || chartType === 'doughnut'
          ? {}
          : {
              x: {
                grid: { color: gridColor },
                ticks: { color: textColor, font: { size: 10 }, maxRotation: 45 },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: textColor, font: { size: 10 } },
              },
            },
    }
  }, [theme, chartType])

  if (!result.values.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
        Execute a query to visualize data
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0e12] select-none text-xs">
      {/* Controls Bar */}
      <div className="h-10 px-4 border-b border-neutral-800 bg-[#101217] flex items-center justify-between gap-4">
        {/* Chart Type Selector */}
        <div className="flex items-center gap-1 bg-[#161822] p-0.5 rounded-md border border-neutral-800">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              chartType === 'bar' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              chartType === 'line' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>
          <button
            onClick={() => setChartType('doughnut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              chartType === 'doughnut' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              chartType === 'pie' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Pie</span>
          </button>
        </div>

        {/* Axis Column Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 text-[11px]">X-Axis (Label):</span>
            <select
              value={labelCol}
              onChange={(e) => setLabelCol(e.target.value)}
              className="bg-[#161822] border border-neutral-800 rounded px-2 py-0.5 text-neutral-200 font-mono text-xs focus:outline-none"
            >
              {result.columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 text-[11px]">Y-Axis (Value):</span>
            <select
              value={valueCol}
              onChange={(e) => setValueCol(e.target.value)}
              className="bg-[#161822] border border-neutral-800 rounded px-2 py-0.5 text-neutral-200 font-mono text-xs focus:outline-none"
            >
              {result.columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 p-6 relative min-h-0">
        {chartData ? (
          <div className="w-full h-full">
            {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
            {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
            {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
            {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-neutral-500">
            No valid data points for selected axes
          </div>
        )}
      </div>

      {result.values.length > 40 && (
        <div className="py-1 px-4 bg-[#101217] border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-neutral-400" />
          <span>Chart displays first 40 rows for optimal readability.</span>
        </div>
      )}
    </div>
  )
}
