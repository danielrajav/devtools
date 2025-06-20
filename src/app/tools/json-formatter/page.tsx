'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    FileText,
    Copy,
    Clipboard,
    Trash2,
    CheckCircle,
    XCircle,
    Sparkles,
    Minimize2
} from 'lucide-react'

interface ValidationResult {
    isValid: boolean
    error?: string
    lineCount: number
    charCount: number
}

export default function JsonFormatterPage() {
    const [inputJson, setInputJson] = useState(`{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  },
  "isActive": true
}`)
    const [outputJson, setOutputJson] = useState('')
    const [indentSize, setIndentSize] = useState(2)
    const [validation, setValidation] = useState<ValidationResult>({
        isValid: true,
        lineCount: 0,
        charCount: 0
    })
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

    const validateJson = useCallback((jsonString: string): ValidationResult => {
        const lines = jsonString.split('\n').length
        const chars = jsonString.length

        if (!jsonString.trim()) {
            return { isValid: true, lineCount: lines, charCount: chars }
        }

        try {
            JSON.parse(jsonString)
            return { isValid: true, lineCount: lines, charCount: chars }
        } catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Invalid JSON',
                lineCount: lines,
                charCount: chars
            }
        }
    }, [])

    const handleInputChange = useCallback((value: string) => {
        setInputJson(value)
        const result = validateJson(value)
        setValidation(result)
    }, [validateJson])

    const formatJson = useCallback(() => {
        if (!inputJson.trim()) {
            showNotification('Please enter some JSON to format', 'error')
            return
        }

        try {
            const parsed = JSON.parse(inputJson)
            const formatted = JSON.stringify(parsed, null, indentSize)
            setOutputJson(formatted)
            showNotification('JSON formatted successfully!', 'success')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid JSON'
            showNotification(`Error formatting JSON: ${errorMessage}`, 'error')
        }
    }, [inputJson, indentSize, showNotification])

    const minifyJson = useCallback(() => {
        if (!inputJson.trim()) {
            showNotification('Please enter some JSON to minify', 'error')
            return
        }

        try {
            const parsed = JSON.parse(inputJson)
            const minified = JSON.stringify(parsed)
            setOutputJson(minified)
            showNotification('JSON minified successfully!', 'success')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid JSON'
            showNotification(`Error minifying JSON: ${errorMessage}`, 'error')
        }
    }, [inputJson, showNotification])

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

    const pasteFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText()
            handleInputChange(text)
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [handleInputChange, showNotification])

    const clearAll = useCallback(() => {
        setInputJson('')
        setOutputJson('')
        setValidation({ isValid: true, lineCount: 0, charCount: 0 })
        showNotification('Cleared all content', 'success')
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
                        <FileText className="inline-block w-10 h-10 mr-3" />
                        JSON Formatter
                    </h1>
                    <p className="text-lg text-white/90">
                        Format, validate, and beautify your JSON data
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
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={formatJson}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Format JSON
                                </button>

                                <button
                                    onClick={minifyJson}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Minimize2 className="w-4 h-4" />
                                    Minify
                                </button>

                                <button
                                    onClick={clearAll}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear All
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <label htmlFor="indent" className="text-sm font-medium text-gray-700">
                                    Indent:
                                </label>
                                <select
                                    id="indent"
                                    value={indentSize}
                                    onChange={(e) => setIndentSize(Number(e.target.value))}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={2}>2 spaces</option>
                                    <option value={4}>4 spaces</option>
                                    <option value={8}>8 spaces</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Editor Panels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                        {/* Input Panel */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                    Input JSON
                                </h3>
                                <button
                                    onClick={pasteFromClipboard}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                >
                                    <Clipboard className="w-3 h-3" />
                                    Paste
                                </button>
                            </div>

                            <textarea
                                value={inputJson}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className={`w-full h-96 p-4 border-2 rounded-lg font-mono text-sm resize-none focus:outline-none transition-all duration-300 ${validation.isValid
                                        ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        : 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                    }`}
                                placeholder="Paste your JSON here..."
                            />
                        </div>

                        {/* Output Panel */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    Formatted JSON
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(outputJson, 'Formatted JSON')}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </button>
                            </div>

                            <textarea
                                value={outputJson}
                                readOnly
                                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:outline-none"
                                placeholder="Formatted JSON will appear here..."
                            />
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {validation.isValid ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-700 font-medium">Valid JSON</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-red-700 font-medium">Invalid JSON</span>
                                        </>
                                    )}
                                </div>
                                {validation.error && (
                                    <div className="text-red-600 text-xs">
                                        {validation.error}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <span>{validation.charCount.toLocaleString()} characters</span>
                                <span>{validation.lineCount.toLocaleString()} lines</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                >
                    {[
                        {
                            icon: Sparkles,
                            title: 'Auto-Format',
                            description: 'Automatically formats and beautifies your JSON with proper indentation'
                        },
                        {
                            icon: CheckCircle,
                            title: 'Real-time Validation',
                            description: 'Validates JSON syntax as you type with detailed error messages'
                        },
                        {
                            icon: Minimize2,
                            title: 'Minify',
                            description: 'Compress JSON by removing unnecessary whitespace'
                        },
                        {
                            icon: Copy,
                            title: 'Easy Copy/Paste',
                            description: 'One-click copying and pasting for seamless workflow'
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