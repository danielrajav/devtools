'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Link as LinkIcon,
    Copy,
    Clipboard,
    Trash2,
    ArrowUpDown,
    Lock,
    LockOpen,
    Eye
} from 'lucide-react'

type Mode = 'encode' | 'decode'

export default function UrlEncoderPage() {
    const [mode, setMode] = useState<Mode>('encode')
    const [inputUrl, setInputUrl] = useState('https://example.com/search?q=hello world&category=general')
    const [outputUrl, setOutputUrl] = useState('')
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

    const processUrl = useCallback(() => {
        if (!inputUrl.trim()) {
            showNotification('Please enter a URL to process', 'error')
            return
        }

        try {
            let result: string
            if (mode === 'encode') {
                result = encodeURI(inputUrl.trim())
            } else {
                result = decodeURI(inputUrl.trim())
            }

            setOutputUrl(result)
            showNotification(`URL ${mode}d successfully!`, 'success')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Processing failed'
            showNotification(`Error ${mode}ing URL: ${errorMessage}`, 'error')
        }
    }, [inputUrl, mode, showNotification])

    const swapContent = useCallback(() => {
        const temp = inputUrl
        setInputUrl(outputUrl)
        setOutputUrl(temp)
        showNotification('Content swapped!', 'success')
    }, [inputUrl, outputUrl, showNotification])

    const clearAll = useCallback(() => {
        setInputUrl('')
        setOutputUrl('')
        showNotification('Cleared all content', 'success')
    }, [showNotification])

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
            setInputUrl(text)
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    const loadExample = useCallback((example: string) => {
        const examples = {
            basic: 'https://example.com/search?q=hello world&category=general',
            complex: "https://api.example.com/users?filter=name eq 'John Doe'&sort=created_at desc",
            encoded: 'https%3A//example.com/search%3Fq%3Dhello%2Bworld%26category%3Dgeneral'
        }

        setInputUrl(examples[example as keyof typeof examples])
        if (example === 'encoded') {
            setMode('decode')
        } else {
            setMode('encode')
        }
        showNotification('Example loaded!', 'success')
    }, [showNotification])

    const getPreview = useCallback((url: string, isInput: boolean) => {
        if (!url) return 'Preview will appear here...'

        try {
            if (mode === 'encode' && isInput) {
                return `Original: ${url}`
            } else if (mode === 'decode' && isInput) {
                decodeURI(url) // Test if it's valid
                return `Encoded: ${url}`
            } else if (!isInput) {
                return `Result: ${url}`
            }
        } catch (error) {
            if (isInput) {
                return `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }

        return url
    }, [mode])

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
                        <LinkIcon className="inline-block w-10 h-10 mr-3" />
                        URL Encoder/Decoder
                    </h1>
                    <p className="text-lg text-white/90">
                        Encode and decode URLs for safe transmission
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Mode Selector */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-center">
                            <div className="bg-white rounded-lg p-1 shadow-inner">
                                <button
                                    onClick={() => setMode('encode')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${mode === 'encode'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <Lock className="w-4 h-4" />
                                    Encode URL
                                </button>
                                <button
                                    onClick={() => setMode('decode')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${mode === 'decode'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <LockOpen className="w-4 h-4" />
                                    Decode URL
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={processUrl}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {mode === 'encode' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                                {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
                            </button>

                            <button
                                onClick={swapContent}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                Swap
                            </button>

                            <button
                                onClick={clearAll}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-300"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Editor Panels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                        {/* Input Panel */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                    {mode === 'encode' ? 'Input URL' : 'Encoded URL'}
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
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                placeholder="Enter your URL here..."
                            />

                            {/* Input Preview */}
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</span>
                                </div>
                                <div className="text-xs font-mono text-gray-600 break-all">
                                    {getPreview(inputUrl, true)}
                                </div>
                            </div>
                        </div>

                        {/* Output Panel */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(outputUrl, 'Result')}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </button>
                            </div>

                            <textarea
                                value={outputUrl}
                                readOnly
                                className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:outline-none"
                                placeholder="Processed URL will appear here..."
                            />

                            {/* Output Preview */}
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-3 h-3 text-green-400" />
                                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Result</span>
                                </div>
                                <div className="text-xs font-mono text-green-700 break-all">
                                    {getPreview(outputUrl, false)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-600">
                                Ready to {mode} URLs
                            </div>
                            <div className="text-gray-600">
                                {(outputUrl || inputUrl).length.toLocaleString()} characters
                            </div>
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
                        💡 Quick Examples
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                id: 'basic',
                                label: 'Basic URL with parameters',
                                url: 'https://example.com/search?q=hello world&category=general'
                            },
                            {
                                id: 'complex',
                                label: 'Complex URL with special characters',
                                url: "https://api.example.com/users?filter=name eq 'John Doe'&sort=created_at desc"
                            },
                            {
                                id: 'encoded',
                                label: 'Already encoded URL',
                                url: 'https%3A//example.com/search%3Fq%3Dhello%2Bworld%26category%3Dgeneral'
                            }
                        ].map((example) => (
                            <button
                                key={example.id}
                                onClick={() => loadExample(example.id)}
                                className="text-left p-4 bg-white/90 hover:bg-white rounded-xl border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1"
                            >
                                <div className="font-semibold text-gray-800 mb-2">{example.label}</div>
                                <div className="text-xs font-mono text-gray-600 break-all">{example.url}</div>
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
                            icon: Lock,
                            title: 'URL Encoding',
                            description: 'Convert special characters to percent-encoded format for safe transmission'
                        },
                        {
                            icon: LockOpen,
                            title: 'URL Decoding',
                            description: 'Decode percent-encoded URLs back to readable format'
                        },
                        {
                            icon: ArrowUpDown,
                            title: 'Dual Mode',
                            description: 'Seamlessly switch between encoding and decoding'
                        },
                        {
                            icon: Eye,
                            title: 'Live Preview',
                            description: 'See real-time previews of your URLs as you type'
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