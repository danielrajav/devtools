'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Zap,
    Copy,
    Clipboard,
    Trash2,
    CheckCircle,
    XCircle,
    Eye,
    Info,
    Play,
    BookOpen,
    Target,
    Hash
} from 'lucide-react'

interface RegexMatch {
    match: string
    index: number
    groups: string[]
    namedGroups: { [key: string]: string }
}

interface RegexFlags {
    global: boolean
    ignoreCase: boolean
    multiline: boolean
    dotAll: boolean
    unicode: boolean
    sticky: boolean
}

export default function RegexTesterPage() {
    const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b')
    const [testString, setTestString] = useState(`Contact us at:
support@example.com
admin@test.org
user123@domain.co.uk
invalid-email@
another@company.net`)
    const [flags, setFlags] = useState<RegexFlags>({
        global: true,
        ignoreCase: true,
        multiline: false,
        dotAll: false,
        unicode: false,
        sticky: false
    })
    const [matches, setMatches] = useState<RegexMatch[]>([])
    const [isValid, setIsValid] = useState(true)
    const [error, setError] = useState('')
    const [explanation, setExplanation] = useState('')
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

    const flagsString = useMemo(() => {
        let flagStr = ''
        if (flags.global) flagStr += 'g'
        if (flags.ignoreCase) flagStr += 'i'
        if (flags.multiline) flagStr += 'm'
        if (flags.dotAll) flagStr += 's'
        if (flags.unicode) flagStr += 'u'
        if (flags.sticky) flagStr += 'y'
        return flagStr
    }, [flags])

    const testRegex = useCallback(() => {
        if (!pattern.trim()) {
            setMatches([])
            setIsValid(true)
            setError('')
            return
        }

        try {
            const regex = new RegExp(pattern, flagsString)
            const foundMatches: RegexMatch[] = []

            if (flags.global) {
                let match
                while ((match = regex.exec(testString)) !== null) {
                    foundMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: Array.from(match).slice(1),
                        namedGroups: match.groups || {}
                    })

                    // Prevent infinite loop on empty matches
                    if (match[0] === '') {
                        regex.lastIndex++
                    }
                }
            } else {
                const match = regex.exec(testString)
                if (match) {
                    foundMatches.push({
                        match: match[0],
                        index: match.index,
                        groups: Array.from(match).slice(1),
                        namedGroups: match.groups || {}
                    })
                }
            }

            setMatches(foundMatches)
            setIsValid(true)
            setError('')
            generateExplanation(pattern)
        } catch (err) {
            setIsValid(false)
            setError(err instanceof Error ? err.message : 'Invalid regex pattern')
            setMatches([])
            setExplanation('')
        }
    }, [pattern, testString, flagsString, flags.global])

    const generateExplanation = useCallback((regexPattern: string) => {
        // Simple regex explanation generator
        let explanation = 'Pattern breakdown:\n'

        if (regexPattern.includes('\\b')) explanation += '• \\b - Word boundary\n'
        if (regexPattern.includes('\\w')) explanation += '• \\w - Word character (letters, digits, underscore)\n'
        if (regexPattern.includes('\\d')) explanation += '• \\d - Digit character (0-9)\n'
        if (regexPattern.includes('\\s')) explanation += '• \\s - Whitespace character\n'
        if (regexPattern.includes('[')) explanation += '• [...] - Character class/set\n'
        if (regexPattern.includes('+')) explanation += '• + - One or more occurrences\n'
        if (regexPattern.includes('*')) explanation += '• * - Zero or more occurrences\n'
        if (regexPattern.includes('?')) explanation += '• ? - Zero or one occurrence\n'
        if (regexPattern.includes('{')) explanation += '• {...} - Specific number of occurrences\n'
        if (regexPattern.includes('(')) explanation += '• (...) - Capturing group\n'
        if (regexPattern.includes('|')) explanation += '• | - Alternation (OR)\n'
        if (regexPattern.includes('^')) explanation += '• ^ - Start of string/line\n'
        if (regexPattern.includes('$')) explanation += '• $ - End of string/line\n'
        if (regexPattern.includes('.')) explanation += '• . - Any character (except newline)\n'
        if (regexPattern.includes('\\')) explanation += '• \\ - Escape character\n'

        setExplanation(explanation)
    }, [])

    // Auto-test when pattern, test string, or flags change
    useMemo(() => {
        const timeoutId = setTimeout(testRegex, 300)
        return () => clearTimeout(timeoutId)
    }, [testRegex])

    const highlightMatches = useCallback((text: string, matches: RegexMatch[]) => {
        if (matches.length === 0) return text

        const parts = []
        let lastIndex = 0

        matches.forEach((match, i) => {
            // Add text before match
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${i}`}>
                        {text.slice(lastIndex, match.index)}
                    </span>
                )
            }

            // Add highlighted match
            parts.push(
                <span
                    key={`match-${i}`}
                    className="bg-yellow-200 border border-yellow-400 rounded px-1 font-semibold text-yellow-800"
                    title={`Match ${i + 1}: "${match.match}"`}
                >
                    {match.match}
                </span>
            )

            lastIndex = match.index + match.match.length
        })

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(
                <span key="text-end">
                    {text.slice(lastIndex)}
                </span>
            )
        }

        return parts
    }, [])

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

    const pasteFromClipboard = useCallback(async (target: 'pattern' | 'test') => {
        try {
            const text = await navigator.clipboard.readText()
            if (target === 'pattern') {
                setPattern(text)
            } else {
                setTestString(text)
            }
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    const clearAll = useCallback(() => {
        setPattern('')
        setTestString('')
        setMatches([])
        setError('')
        setExplanation('')
        showNotification('Cleared all content', 'success')
    }, [showNotification])

    const loadExample = useCallback((example: string) => {
        const examples = {
            email: {
                pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
                test: 'Contact: john@example.com, admin@test.org, invalid@email'
            },
            phone: {
                pattern: '\\(?\\d{3}\\)?[-.]?\\s?\\d{3}[-.]?\\d{4}',
                test: 'Call us: (555) 123-4567, 555.987.6543, 555-111-2222'
            },
            url: {
                pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
                test: 'Visit: https://example.com, http://test.org/page?id=123'
            },
            ipv4: {
                pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
                test: 'Servers: 192.168.1.1, 10.0.0.1, 255.255.255.255, 999.999.999.999'
            },
            date: {
                pattern: '\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}\\b',
                test: 'Dates: 12/25/2023, 1/1/2024, 31-12-2023, not-a-date'
            },
            hexcolor: {
                pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
                test: 'Colors: #ff0000, #00FF00, #blu, #123456, #abc'
            }
        }

        const selectedExample = examples[example as keyof typeof examples]
        if (selectedExample) {
            setPattern(selectedExample.pattern)
            setTestString(selectedExample.test)
            showNotification(`${example.toUpperCase()} example loaded!`, 'success')
        }
    }, [showNotification])

    const toggleFlag = useCallback((flag: keyof RegexFlags) => {
        setFlags(prev => ({ ...prev, [flag]: !prev[flag] }))
    }, [])

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
                        <Zap className="inline-block w-10 h-10 mr-3" />
                        Regex Tester
                    </h1>
                    <p className="text-lg text-white/90">
                        Test and debug regular expressions with live matching and explanations
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Regex Pattern Input */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-500" />
                                Regular Expression Pattern
                            </h3>
                            <button
                                onClick={() => pasteFromClipboard('pattern')}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                            >
                                <Clipboard className="w-3 h-3" />
                                Paste
                            </button>
                        </div>

                        <div className="relative">
                            <div className="font-mono text-lg bg-gray-50 border-2 border-gray-300 rounded-lg p-3 mb-2">
                                <span className="text-gray-500">/</span>
                                <input
                                    type="text"
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                    className={`bg-transparent border-none outline-none flex-1 w-full ${isValid ? 'text-gray-800' : 'text-red-600'
                                        }`}
                                    placeholder="Enter your regex pattern..."
                                />
                                <span className="text-gray-500">/{flagsString}</span>
                            </div>
                        </div>

                        {/* Flags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-sm font-medium text-gray-700 mr-2">Flags:</span>
                            {[
                                { key: 'global', label: 'Global (g)', desc: 'Find all matches' },
                                { key: 'ignoreCase', label: 'Ignore Case (i)', desc: 'Case insensitive' },
                                { key: 'multiline', label: 'Multiline (m)', desc: '^$ match line boundaries' },
                                { key: 'dotAll', label: 'Dot All (s)', desc: '. matches newlines' },
                                { key: 'unicode', label: 'Unicode (u)', desc: 'Unicode support' },
                                { key: 'sticky', label: 'Sticky (y)', desc: 'Match from lastIndex' }
                            ].map(({ key, label, desc }) => (
                                <button
                                    key={key}
                                    onClick={() => toggleFlag(key as keyof RegexFlags)}
                                    className={`px-3 py-1 text-sm rounded-lg border-2 transition-all duration-300 ${flags[key as keyof RegexFlags]
                                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    title={desc}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={testRegex}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Play className="w-4 h-4" />
                                Test Regex
                            </button>

                            <button
                                onClick={() => copyToClipboard(pattern, 'Pattern')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Pattern
                            </button>

                            <button
                                onClick={clearAll}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-300"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        </div>

                        {/* Error Display */}
                        {!isValid && error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700">
                                    <XCircle className="w-4 h-4" />
                                    <span className="font-medium">Regex Error:</span>
                                </div>
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Test String and Results */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                        {/* Test String Input */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                    Test String
                                </h3>
                                <button
                                    onClick={() => pasteFromClipboard('test')}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                >
                                    <Clipboard className="w-3 h-3" />
                                    Paste
                                </button>
                            </div>

                            <textarea
                                value={testString}
                                onChange={(e) => setTestString(e.target.value)}
                                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                placeholder="Enter text to test against your regex..."
                            />

                            {/* Match Preview */}
                            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <Eye className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Live Preview
                                    </span>
                                </div>
                                <div className="text-sm font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {highlightMatches(testString, matches)}
                                </div>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    Matches ({matches.length})
                                </h3>
                                {matches.length > 0 && (
                                    <button
                                        onClick={() => copyToClipboard(matches.map(m => m.match).join('\n'), 'Matches')}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy
                                    </button>
                                )}
                            </div>

                            <div className="h-64 overflow-y-auto space-y-2">
                                {matches.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No matches found</p>
                                            <p className="text-sm mt-1">Try adjusting your pattern or test string</p>
                                        </div>
                                    </div>
                                ) : (
                                    matches.map((match, index) => (
                                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-green-700">
                                                    Match {index + 1}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    Position: {match.index}
                                                </span>
                                            </div>
                                            <div className="font-mono text-sm bg-white border border-green-200 rounded p-2 mb-2">
                                                "{match.match}"
                                            </div>
                                            {match.groups.length > 0 && (
                                                <div className="text-xs text-green-600">
                                                    <strong>Groups:</strong> {match.groups.map((group, i) => `$${i + 1}: "${group}"`).join(', ')}
                                                </div>
                                            )}
                                            {Object.keys(match.namedGroups).length > 0 && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    <strong>Named Groups:</strong> {Object.entries(match.namedGroups).map(([name, value]) => `${name}: "${value}"`).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Explanation Panel */}
                    {explanation && (
                        <div className="p-6 border-t border-gray-200 bg-blue-50">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-semibold text-blue-800">Pattern Explanation</h3>
                            </div>
                            <pre className="text-sm text-blue-700 whitespace-pre-wrap font-mono bg-white border border-blue-200 rounded p-3">
                                {explanation}
                            </pre>
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {isValid ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-700 font-medium">Valid Pattern</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-red-700 font-medium">Invalid Pattern</span>
                                        </>
                                    )}
                                </div>
                                {matches.length > 0 && (
                                    <span className="text-blue-600 font-medium">
                                        {matches.length} match{matches.length !== 1 ? 'es' : ''} found
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <span>Pattern: {pattern.length} chars</span>
                                <span>Test: {testString.length} chars</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Examples */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: 'email', label: 'Email Addresses', desc: 'Match valid email formats' },
                            { id: 'phone', label: 'Phone Numbers', desc: 'US phone number formats' },
                            { id: 'url', label: 'URLs', desc: 'HTTP/HTTPS web addresses' },
                            { id: 'ipv4', label: 'IPv4 Addresses', desc: 'IP address validation' },
                            { id: 'date', label: 'Dates', desc: 'MM/DD/YYYY format' },
                            { id: 'hexcolor', label: 'Hex Colors', desc: 'CSS hex color codes' }
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
                            icon: Eye,
                            title: 'Live Testing',
                            description: 'See matches highlighted in real-time as you type'
                        },
                        {
                            icon: Info,
                            title: 'Pattern Explanation',
                            description: 'Understand what each part of your regex does'
                        },
                        {
                            icon: Target,
                            title: 'Match Details',
                            description: 'View capture groups and match positions'
                        },
                        {
                            icon: BookOpen,
                            title: 'Quick Examples',
                            description: 'Common patterns for validation and extraction'
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