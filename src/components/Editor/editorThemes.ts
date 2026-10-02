import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// ==========================================
// LIGHT THEME (Clean, High Contrast, Razor-Sharp)
// ==========================================
export const lightEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#ffffff',
      color: '#0f172a',
    },
    '.cm-content': {
      caretColor: '#4f46e5',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#4f46e5',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: '#e0e7ff !important', // Indigo 100
    },
    '.cm-gutters': {
      backgroundColor: '#f8fafc',
      color: '#94a3b8',
      borderRight: '1px solid #e2e8f0',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      fontWeight: '600',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(241, 245, 249, 0.6)',
    },
    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: '#fde047',
      color: '#0f172a',
      outline: '1px solid #eab308',
    },
    '.cm-tooltip': {
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      color: '#0f172a',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: '#eef2ff',
        color: '#4338ca',
      },
    },
  },
  { dark: false }
)

export const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#7c3aed', fontWeight: 'bold' }, // Purple
  { tag: tags.string, color: '#059669' }, // Emerald green
  { tag: tags.number, color: '#0284c7', fontWeight: '500' }, // Cyan / Blue
  { tag: tags.bool, color: '#d97706', fontWeight: '600' }, // Amber
  { tag: tags.null, color: '#9333ea', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#d97706', fontWeight: '600' }, // Amber
  { tag: tags.typeName, color: '#2563eb' },
  { tag: tags.operator, color: '#475569' },
  { tag: tags.punctuation, color: '#64748b' },
  { tag: tags.comment, color: '#94a3b8', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#1e293b' },
  { tag: tags.definition(tags.variableName), color: '#0f172a', fontWeight: '600' },
])

// ==========================================
// DARK THEME (Sleek, Linear/Raycast Aesthetic)
// ==========================================
export const darkEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0c0e14',
      color: '#f1f5f9',
    },
    '.cm-content': {
      caretColor: '#818cf8',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#818cf8',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(99, 102, 241, 0.28) !important',
    },
    '.cm-gutters': {
      backgroundColor: '#090a0f',
      color: '#64748b',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#141722',
      color: '#cbd5e1',
      fontWeight: '600',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.025)',
    },
    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: 'rgba(99, 102, 241, 0.35)',
      color: '#ffffff',
      outline: '1px solid #818cf8',
    },
    '.cm-tooltip': {
      backgroundColor: '#141722',
      border: '1px solid #272a3a',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      color: '#f8fafc',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        color: '#ffffff',
      },
    },
  },
  { dark: true }
)

export const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#818cf8', fontWeight: 'bold' }, // Indigo
  { tag: tags.string, color: '#34d399' }, // Mint emerald
  { tag: tags.number, color: '#38bdf8', fontWeight: '500' }, // Sky cyan
  { tag: tags.bool, color: '#fbbf24', fontWeight: '600' }, // Amber
  { tag: tags.null, color: '#c084fc', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#fbbf24', fontWeight: '600' },
  { tag: tags.typeName, color: '#60a5fa' },
  { tag: tags.operator, color: '#94a3b8' },
  { tag: tags.punctuation, color: '#64748b' },
  { tag: tags.comment, color: '#64748b', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#e2e8f0' },
  { tag: tags.definition(tags.variableName), color: '#ffffff', fontWeight: '600' },
])

export const getEditorThemeExtensions = (isDark: boolean) => {
  return isDark
    ? [darkEditorTheme, syntaxHighlighting(darkHighlightStyle)]
    : [lightEditorTheme, syntaxHighlighting(lightHighlightStyle)]
}
