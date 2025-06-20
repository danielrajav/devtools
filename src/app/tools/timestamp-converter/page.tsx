'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Clock,
    Copy,
    Clipboard,
    Trash2,
    RefreshCw,
    Calendar,
    Globe,
    Zap,
    Play,
    Pause,
    BookOpen,
    Timer,
    ArrowUpDown,
    Download
} from 'lucide-react'

interface TimestampFormats {
    unix: number
    unixMs: number
    iso: string
    utc: string
    local: string
    relative: string
    formatted: {
        full: string
        date: string
        time: string
        dateTime: string
    }
}

export default function TimestampConverterPage() {
    const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000))
    const [inputValue, setInputValue] = useState('')
    const [inputType, setInputType] = useState<'unix' | 'date'>('unix')
    const [timezone, setTimezone] = useState('UTC')
    const [isLive, setIsLive] = useState(false)
    const [savedTimestamps, setSavedTimestamps] = useState<Array<{
        timestamp: number
        label: string
        date: Date
    }>>([])
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

    // Live timestamp updates
    useEffect(() => {
        if (!isLive) return

        const interval = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000))
        }, 1000)

        return () => clearInterval(interval)
    }, [isLive])

    // Common timezones
    const timezones = [
        'UTC',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'Europe/London',
        'Europe/Berlin',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Kolkata',
        'Australia/Sydney',
        'Pacific/Auckland'
    ]

    // Format timestamp to various formats
    const timestampFormats = useMemo((): TimestampFormats => {
        const date = new Date(currentTimestamp * 1000)
        const now = new Date()

        // Calculate relative time
        const diffMs = now.getTime() - date.getTime()
        const diffSeconds = Math.floor(diffMs / 1000)
        const diffMinutes = Math.floor(diffSeconds / 60)
        const diffHours = Math.floor(diffMinutes / 60)
        const diffDays = Math.floor(diffHours / 24)
        const diffMonths = Math.floor(diffDays / 30)
        const diffYears = Math.floor(diffDays / 365)

        let relative = ''
        if (Math.abs(diffYears) >= 1) {
            relative = diffYears > 0 ? `${diffYears} year${diffYears !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffYears)} year${Math.abs(diffYears) !== 1 ? 's' : ''}`
        } else if (Math.abs(diffMonths) >= 1) {
            relative = diffMonths > 0 ? `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMonths)} month${Math.abs(diffMonths) !== 1 ? 's' : ''}`
        } else if (Math.abs(diffDays) >= 1) {
            relative = diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`
        } else if (Math.abs(diffHours) >= 1) {
            relative = diffHours > 0 ? `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''}`
        } else if (Math.abs(diffMinutes) >= 1) {
            relative = diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''}`
        } else {
            relative = diffSeconds > 0 ? `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago` : 'just now'
        }

        // Format for different timezones
        const formatInTimezone = (date: Date, tz: string) => {
            try {
                return new Intl.DateTimeFormat('en-US', {
                    timeZone: tz,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).format(date)
            } catch {
                return date.toISOString()
            }
        }

        return {
            unix: currentTimestamp,
            unixMs: currentTimestamp * 1000,
            iso: date.toISOString(),
            utc: date.toUTCString(),
            local: date.toLocaleString(),
            relative,
            formatted: {
                full: formatInTimezone(date, timezone),
                date: date.toDateString(),
                time: date.toTimeString().split(' ')[0],
                dateTime: date.toLocaleString()
            }
        }
    }, [currentTimestamp, timezone])

    const updateFromInput = useCallback(() => {
        if (!inputValue.trim()) {
            showNotification('Please enter a value to convert', 'error')
            return
        }

        try {
            if (inputType === 'unix') {
                const timestamp = parseInt(inputValue)
                if (isNaN(timestamp)) {
                    showNotification('Invalid timestamp format', 'error')
                    return
                }

                // Auto-detect if it's in milliseconds or seconds
                const timestampSeconds = timestamp > 1e10 ? Math.floor(timestamp / 1000) : timestamp
                setCurrentTimestamp(timestampSeconds)
                showNotification('Timestamp converted successfully!', 'success')
            } else {
                const date = new Date(inputValue)
                if (isNaN(date.getTime())) {
                    showNotification('Invalid date format', 'error')
                    return
                }

                setCurrentTimestamp(Math.floor(date.getTime() / 1000))
                showNotification('Date converted successfully!', 'success')
            }
        } catch (error) {
            showNotification('Invalid input format', 'error')
        }
    }, [inputValue, inputType, showNotification])

    const setToCurrentTime = useCallback(() => {
        setCurrentTimestamp(Math.floor(Date.now() / 1000))
        showNotification('Set to current time!', 'success')
    }, [showNotification])

    const copyToClipboard = useCallback(async (text: string, format: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${format} copied to clipboard!`, 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [showNotification])

    const pasteFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText()
            setInputValue(text)
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    const saveCurrentTimestamp = useCallback(() => {
        const label = prompt('Enter a label for this timestamp:')
        if (label) {
            const newSavedTimestamp = {
                timestamp: currentTimestamp,
                label,
                date: new Date(currentTimestamp * 1000)
            }
            setSavedTimestamps(prev => [...prev, newSavedTimestamp])
            showNotification('Timestamp saved!', 'success')
        }
    }, [currentTimestamp, showNotification])

    const loadSavedTimestamp = useCallback((timestamp: number) => {
        setCurrentTimestamp(timestamp)
        showNotification('Timestamp loaded!', 'success')
    }, [showNotification])

    const removeSavedTimestamp = useCallback((index: number) => {
        setSavedTimestamps(prev => prev.filter((_, i) => i !== index))
        showNotification('Timestamp removed!', 'success')
    }, [showNotification])

    const loadExample = useCallback((example: string) => {
        const examples = {
            now: Math.floor(Date.now() / 1000),
            epoch: 0,
            y2k: 946684800,
            future: Math.floor(new Date('2030-01-01').getTime() / 1000),
            past: Math.floor(new Date('2000-01-01').getTime() / 1000),
            millennium: Math.floor(new Date('2000-01-01T00:00:00Z').getTime() / 1000)
        }

        const timestamp = examples[example as keyof typeof examples]
        if (timestamp !== undefined) {
            setCurrentTimestamp(timestamp)
            showNotification(`${example.charAt(0).toUpperCase() + example.slice(1)} timestamp loaded!`, 'success')
        }
    }, [showNotification])

    const exportData = useCallback(() => {
        const exportData = {
            currentTimestamp,
            formats: timestampFormats,
            savedTimestamps,
            timezone,
            exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'timestamp-data.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Data exported successfully!', 'success')
    }, [currentTimestamp, timestampFormats, savedTimestamps, timezone, showNotification])

    const clearAll = useCallback(() => {
        setInputValue('')
        setCurrentTimestamp(Math.floor(Date.now() / 1000))
        showNotification('Cleared all data', 'success')
    }, [showNotification])

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
                        <Clock className="inline-block w-10 h-10 mr-3" />
                        Timestamp Converter
                    </h1>
                    <p className="text-lg text-white/90">
                        Convert between Unix timestamps and human-readable dates
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Current Time Display */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="text-3xl font-mono font-bold text-gray-800">
                                    {timestampFormats.unix}
                                </div>
                                <button
                                    onClick={() => setIsLive(!isLive)}
                                    className={`p-2 rounded-lg transition-all duration-300 ${isLive
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                    title={isLive ? 'Stop live updates' : 'Start live updates'}
                                >
                                    {isLive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="text-lg text-gray-600 mb-4">
                                {timestampFormats.formatted.dateTime}
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={setToCurrentTime}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Current Time
                                </button>

                                <button
                                    onClick={saveCurrentTimestamp}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Timer className="w-4 h-4" />
                                    Save
                                </button>

                                <button
                                    onClick={exportData}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" />
                                Convert Input
                            </h3>

                            {/* Input Type Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setInputType('unix')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${inputType === 'unix'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Timestamp
                                </button>
                                <button
                                    onClick={() => setInputType('date')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${inputType === 'date'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Date
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder={
                                        inputType === 'unix'
                                            ? 'Enter Unix timestamp (seconds or milliseconds)'
                                            : 'Enter date (YYYY-MM-DD, MM/DD/YYYY, etc.)'
                                    }
                                    onKeyPress={(e) => e.key === 'Enter' && updateFromInput()}
                                />
                            </div>

                            <button
                                onClick={pasteFromClipboard}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                title="Paste from clipboard"
                            >
                                <Clipboard className="w-4 h-4" />
                            </button>

                            <button
                                onClick={updateFromInput}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                            >
                                Convert
                            </button>
                        </div>
                    </div>

                    {/* Timezone Selection */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Timezone:</span>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                {timezones.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Format Display */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Formatted Output
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Unix Timestamp */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">Unix Timestamp (seconds)</span>
                                    <button
                                        onClick={() => copyToClipboard(timestampFormats.unix.toString(), 'Unix timestamp')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="font-mono text-lg text-gray-800 bg-white p-2 rounded border">
                                    {timestampFormats.unix}
                                </div>
                            </div>

                            {/* Unix Timestamp (ms) */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">Unix Timestamp (milliseconds)</span>
                                    <button
                                        onClick={() => copyToClipboard(timestampFormats.unixMs.toString(), 'Unix timestamp (ms)')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded border">
                                    {timestampFormats.unixMs}
                                </div>
                            </div>

                            {/* ISO String */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">ISO 8601</span>
                                    <button
                                        onClick={() => copyToClipboard(timestampFormats.iso, 'ISO string')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded border">
                                    {timestampFormats.iso}
                                </div>
                            </div>

                            {/* UTC String */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">UTC String</span>
                                    <button
                                        onClick={() => copyToClipboard(timestampFormats.utc, 'UTC string')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded border">
                                    {timestampFormats.utc}
                                </div>
                            </div>

                            {/* Local String */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">Local Time</span>
                                    <button
                                        onClick={() => copyToClipboard(timestampFormats.local, 'Local time')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded border">
                                    {timestampFormats.local}
                                </div>
                            </div>

                            {/* Relative Time */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">Relative Time</span>
                                    <button
                                        onClick={() => copyToClipboard(timestampFormats.relative, 'Relative time')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded border">
                                    {timestampFormats.relative}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Timestamps */}
                    {savedTimestamps.length > 0 && (
                        <div className="p-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Timer className="w-5 h-5 text-blue-500" />
                                Saved Timestamps ({savedTimestamps.length})
                            </h3>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {savedTimestamps.map((saved, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{saved.label}</div>
                                            <div className="text-sm text-gray-600 font-mono">{saved.timestamp}</div>
                                            <div className="text-xs text-gray-500">{saved.date.toLocaleString()}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => loadSavedTimestamp(saved.timestamp)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Load this timestamp"
                                            >
                                                <ArrowUpDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeSavedTimestamp(index)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Remove this timestamp"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { id: 'now', label: 'Right Now', desc: 'Current timestamp' },
                            { id: 'epoch', label: 'Unix Epoch', desc: 'January 1, 1970' },
                            { id: 'y2k', label: 'Y2K', desc: 'January 1, 2000' },
                            { id: 'future', label: 'Future', desc: 'January 1, 2030' },
                            { id: 'past', label: 'Past', desc: 'January 1, 2000' },
                            { id: 'millennium', label: 'Millennium', desc: 'Year 2000 UTC' }
                        ].map((example) => (
                            <button
                                key={example.id}
                                onClick={() => loadExample(example.id)}
                                className="text-center p-4 bg-white/90 hover:bg-white rounded-xl border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="font-semibold text-gray-800 mb-1">{example.label}</div>
                                <div className="text-xs text-gray-600">{example.desc}</div>
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
                            icon: Clock,
                            title: 'Multiple Formats',
                            description: 'Unix, ISO 8601, UTC, local time, and relative formats'
                        },
                        {
                            icon: Globe,
                            title: 'Timezone Support',
                            description: 'Convert timestamps across different timezones'
                        },
                        {
                            icon: Timer,
                            title: 'Live Updates',
                            description: 'Real-time timestamp updates with live mode'
                        },
                        {
                            icon: Download,
                            title: 'Save & Export',
                            description: 'Save timestamps and export data for later use'
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