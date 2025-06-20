'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    GitCompare,
    Copy,
    Clipboard,
    Trash2,
    ArrowUpDown,
    Eye,
    Settings,
    FileText,
    Plus,
    Minus,
    Equal,
    RotateCcw,
    Download,
    BookOpen
} from 'lucide-react'

interface DiffLine {
    type: 'added' | 'removed' | 'unchanged' | 'modified'
    lineNumber1?: number
    lineNumber2?: number
    content: string
    oldContent?: string
}

interface DiffStats {
    additions: number
    deletions: number
    modifications: number
    unchanged: number
}

export default function TextDiffPage() {
    const [originalText, setOriginalText] = useState(`Hello World!
This is the original text.
It contains several lines.
Some lines will be modified.
Others will remain the same.
This line will be deleted.
Common content here.`)

    const [modifiedText, setModifiedText] = useState(`Hello World!
This is the modified text.
It contains several lines.
Some lines have been changed.
Others will remain the same.
New line added here!
Common content here.`)

    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
    const [ignoreCase, setIgnoreCase] = useState(false)
    const [showLineNumbers, setShowLineNumbers] = useState(true)
    const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')
    const [notification, setNotification] = useState<{
        message: string
        type: 'success' | 'error'
        show: boolean
    }>({ message: '', type: 'success', show: false })

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type, show: true })
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
        }, 3000)
    }, [])

    // Simple diff algorithm
    const calculateDiff = useCallback((text1: string, text2: string): { diff: DiffLine[], stats: DiffStats } => {
        let processedText1 = text1
        let processedText2 = text2

        // Apply preprocessing options
        if (ignoreCase) {
            processedText1 = processedText1.toLowerCase()
            processedText2 = processedText2.toLowerCase()
        }

        if (ignoreWhitespace) {
            processedText1 = processedText1.replace(/\s+/g, ' ').trim()
            processedText2 = processedText2.replace(/\s+/g, ' ').trim()
        }

        const lines1 = processedText1.split('\n')
        const lines2 = processedText2.split('\n')
        const originalLines1 = text1.split('\n')
        const originalLines2 = text2.split('\n')

        const diff: DiffLine[] = []
        const stats: DiffStats = { additions: 0, deletions: 0, modifications: 0, unchanged: 0 }

        let i = 0, j = 0

        while (i < lines1.length || j < lines2.length) {
            if (i >= lines1.length) {
                // Remaining lines in text2 are additions
                diff.push({
                    type: 'added',
                    lineNumber2: j + 1,
                    content: originalLines2[j] || ''
                })
                stats.additions++
                j++
            } else if (j >= lines2.length) {
                // Remaining lines in text1 are deletions
                diff.push({
                    type: 'removed',
                    lineNumber1: i + 1,
                    content: originalLines1[i] || ''
                })
                stats.deletions++
                i++
            } else if (lines1[i] === lines2[j]) {
                // Lines are the same
                diff.push({
                    type: 'unchanged',
                    lineNumber1: i + 1,
                    lineNumber2: j + 1,
                    content: originalLines1[i] || ''
                })
                stats.unchanged++
                i++
                j++
            } else {
                // Lines are different - try to find matches ahead
                let foundMatch = false

                // Look ahead in text2 for current line from text1
                for (let k = j + 1; k < Math.min(j + 5, lines2.length); k++) {
                    if (lines1[i] === lines2[k]) {
                        // Found match ahead in text2, so lines j to k-1 are additions
                        for (let l = j; l < k; l++) {
                            diff.push({
                                type: 'added',
                                lineNumber2: l + 1,
                                content: originalLines2[l] || ''
                            })
                            stats.additions++
                        }
                        j = k
                        foundMatch = true
                        break
                    }
                }

                if (!foundMatch) {
                    // Look ahead in text1 for current line from text2
                    for (let k = i + 1; k < Math.min(i + 5, lines1.length); k++) {
                        if (lines1[k] === lines2[j]) {
                            // Found match ahead in text1, so lines i to k-1 are deletions
                            for (let l = i; l < k; l++) {
                                diff.push({
                                    type: 'removed',
                                    lineNumber1: l + 1,
                                    content: originalLines1[l] || ''
                                })
                                stats.deletions++
                            }
                            i = k
                            foundMatch = true
                            break
                        }
                    }
                }

                if (!foundMatch) {
                    // No match found, treat as modification
                    diff.push({
                        type: 'modified',
                        lineNumber1: i + 1,
                        lineNumber2: j + 1,
                        content: originalLines2[j] || '',
                        oldContent: originalLines1[i] || ''
                    })
                    stats.modifications++
                    i++
                    j++
                }
            }
        }

        return { diff, stats }
    }, [ignoreWhitespace, ignoreCase])

    const { diff, stats } = useMemo(() => {
        return calculateDiff(originalText, modifiedText)
    }, [originalText, modifiedText, calculateDiff])

    const copyToClipboard = useCallback(async (text: string, type: string) => {
        if (!text.trim()) {
            showNotification('Nothing to copy', 'error')
            return
        }

        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${type} copied to clipboard!`, 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [showNotification])

    const pasteFromClipboard = useCallback(async (target: 'original' | 'modified') => {
        try {
            const text = await navigator.clipboard.readText()
            if (target === 'original') {
                setOriginalText(text)
            } else {
                setModifiedText(text)
            }
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    const swapTexts = useCallback(() => {
        const temp = originalText
        setOriginalText(modifiedText)
        setModifiedText(temp)
        showNotification('Texts swapped!', 'success')
    }, [originalText, modifiedText, showNotification])

    const clearAll = useCallback(() => {
        setOriginalText('')
        setModifiedText('')
        showNotification('Cleared all content', 'success')
    }, [showNotification])

    const resetToDefault = useCallback(() => {
        setOriginalText(`Hello World!
This is the original text.
It contains several lines.
Some lines will be modified.
Others will remain the same.
This line will be deleted.
Common content here.`)

        setModifiedText(`Hello World!
This is the modified text.
It contains several lines.
Some lines have been changed.
Others will remain the same.
New line added here!
Common content here.`)

        showNotification('Reset to default example', 'success')
    }, [showNotification])

    const exportDiff = useCallback(() => {
        const diffReport = `# Text Comparison Report
Generated on ${new Date().toLocaleString()}

## Statistics
- Lines Added: ${stats.additions}
- Lines Removed: ${stats.deletions}
- Lines Modified: ${stats.modifications}
- Lines Unchanged: ${stats.unchanged}
- Total Changes: ${stats.additions + stats.deletions + stats.modifications}

## Detailed Diff
${diff.map((line, index) => {
            const prefix = line.type === 'added' ? '+ ' :
                line.type === 'removed' ? '- ' :
                    line.type === 'modified' ? '~ ' : '  '
            return `${prefix}${line.content}`
        }).join('\n')}
`

        const blob = new Blob([diffReport], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'text-diff-report.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Diff report downloaded!', 'success')
    }, [diff, stats, showNotification])

    const loadExample = useCallback((example: string) => {
        const examples = {
            code: {
                original: `function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
console.log(result);`,
                modified: `function calculateSum(a, b, c = 0) {
  return a + b + c;
}

function calculateProduct(a, b) {
  return a * b;
}

const sum = calculateSum(5, 3, 2);
const product = calculateProduct(4, 7);
console.log('Sum:', sum);
console.log('Product:', product);`
            },
            config: {
                original: `server:
  port: 3000
  host: localhost

database:
  url: mongodb://localhost:27017
  name: myapp

features:
  auth: true
  logging: false`,
                modified: `server:
  port: 8080
  host: 0.0.0.0
  ssl: true

database:
  url: mongodb://db-server:27017
  name: myapp_prod
  pool_size: 10

features:
  auth: true
  logging: true
  monitoring: true`
            },
            poetry: {
                original: `Roses are red,
Violets are blue,
Sugar is sweet,
And so are you.`,
                modified: `Roses are red,
Violets are purple,
Sugar is sweet,
And so are you.
Life is beautiful,
When shared with two.`
            }
        }

        const selectedExample = examples[example as keyof typeof examples]
        if (selectedExample) {
            setOriginalText(selectedExample.original)
            setModifiedText(selectedExample.modified)
            showNotification(`${example.charAt(0).toUpperCase() + example.slice(1)} example loaded!`, 'success')
        }
    }, [showNotification])

    const renderDiffLine = useCallback((line: DiffLine, index: number) => {
        const getLineClass = (type: string) => {
            switch (type) {
                case 'added':
                    return 'bg-green-50 border-l-4 border-green-400 text-green-800'
                case 'removed':
                    return 'bg-red-50 border-l-4 border-red-400 text-red-800'
                case 'modified':
                    return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800'
                default:
                    return 'bg-gray-50 border-l-4 border-gray-200 text-gray-700'
            }
        }

        const getIcon = (type: string) => {
            switch (type) {
                case 'added':
                    return <Plus className="w-3 h-3 text-green-600" />
                case 'removed':
                    return <Minus className="w-3 h-3 text-red-600" />
                case 'modified':
                    return <RotateCcw className="w-3 h-3 text-yellow-600" />
                default:
                    return <Equal className="w-3 h-3 text-gray-400" />
            }
        }

        return (
            <div key={index} className={`p-2 font-mono text-sm ${getLineClass(line.type)}`}>
                <div className="flex items-start gap-2">
                    {getIcon(line.type)}
                    {showLineNumbers && (
                        <div className="flex gap-2 text-xs text-gray-500 min-w-16">
                            <span className="w-8 text-right">{line.lineNumber1 || '-'}</span>
                            <span className="w-8 text-right">{line.lineNumber2 || '-'}</span>
                        </div>
                    )}
                    <div className="flex-1">
                        {line.type === 'modified' && line.oldContent ? (
                            <div>
                                <div className="line-through text-red-600 mb-1">{line.oldContent}</div>
                                <div className="text-green-600">{line.content}</div>
                            </div>
                        ) : (
                            <div>{line.content || ' '}</div>
                        )}
                    </div>
                </div>
            </div>
        )
    }, [showLineNumbers])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm border border-white/30 transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Tools
                        </Link>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        <GitCompare className="inline-block w-10 h-10 mr-3" />
                        Text Diff
                    </h1>
                    <p className="text-lg text-white/90">
                        Compare two texts and highlight the differences with detailed analysis
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Controls */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={swapTexts}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                    Swap Texts
                                </button>

                                <button
                                    onClick={exportDiff}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>

                                <button
                                    onClick={resetToDefault}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>

                                <button
                                    onClick={clearAll}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear All
                                </button>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('side-by-side')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'side-by-side'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Side by Side
                                </button>
                                <button
                                    onClick={() => setViewMode('unified')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'unified'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Unified
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Options:</span>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ignoreWhitespace}
                                    onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Ignore Whitespace</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ignoreCase}
                                    onChange={(e) => setIgnoreCase(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Ignore Case</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showLineNumbers}
                                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Show Line Numbers</span>
                            </label>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium">{stats.additions} Added</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Minus className="w-4 h-4 text-red-600" />
                                <span className="text-red-700 font-medium">{stats.deletions} Removed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-yellow-600" />
                                <span className="text-yellow-700 font-medium">{stats.modifications} Modified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Equal className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 font-medium">{stats.unchanged} Unchanged</span>
                            </div>
                            <div className="ml-auto text-gray-600">
                                Total Changes: <span className="font-medium">{stats.additions + stats.deletions + stats.modifications}</span>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'side-by-side' ? (
                        /* Side by Side View */
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                            {/* Original Text */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        Original Text
                                    </h3>
                                    <button
                                        onClick={() => pasteFromClipboard('original')}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Clipboard className="w-3 h-3" />
                                        Paste
                                    </button>
                                </div>

                                <textarea
                                    value={originalText}
                                    onChange={(e) => setOriginalText(e.target.value)}
                                    className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder="Enter original text here..."
                                />
                            </div>

                            {/* Modified Text */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        Modified Text
                                    </h3>
                                    <button
                                        onClick={() => pasteFromClipboard('modified')}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Clipboard className="w-3 h-3" />
                                        Paste
                                    </button>
                                </div>

                                <textarea
                                    value={modifiedText}
                                    onChange={(e) => setModifiedText(e.target.value)}
                                    className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder="Enter modified text here..."
                                />
                            </div>
                        </div>
                    ) : (
                        /* Unified Input View */
                        <div className="p-6 border-b border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-800">Original Text</h3>
                                        <button onClick={() => pasteFromClipboard('original')} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                                            Paste
                                        </button>
                                    </div>
                                    <textarea
                                        value={originalText}
                                        onChange={(e) => setOriginalText(e.target.value)}
                                        className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-xs resize-none focus:outline-none focus:border-blue-500"
                                        placeholder="Original text..."
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-800">Modified Text</h3>
                                        <button onClick={() => pasteFromClipboard('modified')} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                                            Paste
                                        </button>
                                    </div>
                                    <textarea
                                        value={modifiedText}
                                        onChange={(e) => setModifiedText(e.target.value)}
                                        className="w-full h-32 p-3 border border-gray-300 rounded font-mono text-xs resize-none focus:outline-none focus:border-blue-500"
                                        placeholder="Modified text..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Diff Results */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-500" />
                                Differences
                            </h3>
                            <button
                                onClick={() => copyToClipboard(diff.map(line => line.content).join('\n'), 'Diff')}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                            >
                                <Copy className="w-3 h-3" />
                                Copy
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                            {diff.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No differences found</p>
                                    <p className="text-sm mt-1">The texts are identical</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {diff.map((line, index) => renderDiffLine(line, index))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Examples */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Quick Examples
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'code', label: 'Code Comparison', desc: 'Compare JavaScript functions and changes' },
                            { id: 'config', label: 'Configuration Files', desc: 'YAML/JSON configuration differences' },
                            { id: 'poetry', label: 'Text Content', desc: 'Simple text and poetry comparison' }
                        ].map((example) => (
                            <button
                                key={example.id}
                                onClick={() => loadExample(example.id)}
                                className="text-left p-4 bg-white/90 hover:bg-white rounded-xl border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="font-semibold text-gray-800 mb-1">{example.label}</div>
                                <div className="text-sm text-gray-600">{example.desc}</div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                >
                    {[
                        {
                            icon: GitCompare,
                            title: 'Smart Comparison',
                            description: 'Advanced diff algorithm with intelligent matching'
                        },
                        {
                            icon: Settings,
                            title: 'Flexible Options',
                            description: 'Ignore whitespace, case, and customize display'
                        },
                        {
                            icon: Eye,
                            title: 'Visual Highlights',
                            description: 'Color-coded additions, deletions, and modifications'
                        },
                        {
                            icon: Download,
                            title: 'Export Results',
                            description: 'Download detailed diff reports for documentation'
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/95 transition-all duration-300"
                        >
                            <feature.icon className="w-8 h-8 text-blue-500 mb-3" />
                            <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Notification */}
            {notification.show && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 ${notification.type === 'success'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                >
                    {notification.message}
                </motion.div>
            )}
        </div>
    )
}