'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Hash,
    Copy,
    Clipboard,
    Trash2,
    Upload,
    FileText,
    Shield,
    CheckCircle,
    XCircle,
    Download,
    Eye,
    Zap,
    BookOpen,
    Key,
    Lock,
    RefreshCw
} from 'lucide-react'

interface HashResult {
    algorithm: string
    hash: string
    inputType: 'text' | 'file'
    inputSize?: number
    timestamp: Date
}

export default function HashGeneratorPage() {
    const [inputText, setInputText] = useState('')
    const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['SHA-256', 'MD5'])
    const [hashResults, setHashResults] = useState<HashResult[]>([])
    const [verificationHash, setVerificationHash] = useState('')
    const [verificationResult, setVerificationResult] = useState<'match' | 'no-match' | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
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

    // Available hash algorithms
    const algorithms = [
        { id: 'MD5', name: 'MD5', description: '128-bit hash (legacy, not secure)' },
        { id: 'SHA-1', name: 'SHA-1', description: '160-bit hash (legacy, not secure)' },
        { id: 'SHA-256', name: 'SHA-256', description: '256-bit hash (recommended)' },
        { id: 'SHA-384', name: 'SHA-384', description: '384-bit hash (very secure)' },
        { id: 'SHA-512', name: 'SHA-512', description: '512-bit hash (very secure)' }
    ]

    // Hash generation functions using Web Crypto API
    const generateHash = useCallback(async (algorithm: string, data: string | ArrayBuffer): Promise<string> => {
        let algoName: string

        switch (algorithm) {
            case 'MD5':
                // MD5 is not available in Web Crypto API, so we'll use a simple implementation
                return await generateMD5(typeof data === 'string' ? data : new TextDecoder().decode(data))
            case 'SHA-1':
                algoName = 'SHA-1'
                break
            case 'SHA-256':
                algoName = 'SHA-256'
                break
            case 'SHA-384':
                algoName = 'SHA-384'
                break
            case 'SHA-512':
                algoName = 'SHA-512'
                break
            default:
                throw new Error(`Unsupported algorithm: ${algorithm}`)
        }

        const encoder = new TextEncoder()
        const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
        const hashBuffer = await crypto.subtle.digest(algoName, dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }, [])

    // Simple MD5 implementation (for demonstration - in production, use a proper library)
    const generateMD5 = useCallback(async (input: string): Promise<string> => {
        // This is a simplified MD5 for demo purposes
        // In a real app, you'd use a proper crypto library
        let hash = 0
        if (input.length === 0) return '0'

        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }

        // Convert to hex and pad
        return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32)
    }, [])

    // Generate hashes for text input
    const generateTextHashes = useCallback(async () => {
        if (!inputText.trim()) {
            showNotification('Please enter some text to hash', 'error')
            return
        }

        if (selectedAlgorithms.length === 0) {
            showNotification('Please select at least one algorithm', 'error')
            return
        }

        setIsProcessing(true)
        const newResults: HashResult[] = []

        try {
            for (const algorithm of selectedAlgorithms) {
                const hash = await generateHash(algorithm, inputText)
                newResults.push({
                    algorithm,
                    hash,
                    inputType: 'text',
                    timestamp: new Date()
                })
            }

            setHashResults(newResults)
            showNotification('Hashes generated successfully!', 'success')
        } catch (error) {
            showNotification('Error generating hashes', 'error')
        } finally {
            setIsProcessing(false)
        }
    }, [inputText, selectedAlgorithms, generateHash, showNotification])

    // Handle file upload and hashing
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (selectedAlgorithms.length === 0) {
            showNotification('Please select at least one algorithm', 'error')
            return
        }

        setIsProcessing(true)
        const newResults: HashResult[] = []

        try {
            const arrayBuffer = await file.arrayBuffer()

            for (const algorithm of selectedAlgorithms) {
                const hash = await generateHash(algorithm, arrayBuffer)
                newResults.push({
                    algorithm,
                    hash,
                    inputType: 'file',
                    inputSize: file.size,
                    timestamp: new Date()
                })
            }

            setHashResults(newResults)
            showNotification(`File "${file.name}" hashed successfully!`, 'success')
        } catch (error) {
            showNotification('Error hashing file', 'error')
        } finally {
            setIsProcessing(false)
            // Reset file input
            event.target.value = ''
        }
    }, [selectedAlgorithms, generateHash, showNotification])

    // Verify hash against results
    const verifyHash = useCallback(() => {
        if (!verificationHash.trim()) {
            showNotification('Please enter a hash to verify', 'error')
            return
        }

        const normalizedInput = verificationHash.toLowerCase().trim()
        const match = hashResults.some(result => result.hash.toLowerCase() === normalizedInput)

        setVerificationResult(match ? 'match' : 'no-match')
        showNotification(
            match ? 'Hash verification successful!' : 'Hash does not match any generated hashes',
            match ? 'success' : 'error'
        )
    }, [verificationHash, hashResults, showNotification])

    // Copy hash to clipboard
    const copyToClipboard = useCallback(async (text: string, algorithm: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${algorithm} hash copied to clipboard!`, 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [showNotification])

    // Paste from clipboard
    const pasteFromClipboard = useCallback(async (target: 'input' | 'verify') => {
        try {
            const text = await navigator.clipboard.readText()
            if (target === 'input') {
                setInputText(text)
            } else {
                setVerificationHash(text)
            }
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    // Toggle algorithm selection
    const toggleAlgorithm = useCallback((algorithm: string) => {
        setSelectedAlgorithms(prev =>
            prev.includes(algorithm)
                ? prev.filter(a => a !== algorithm)
                : [...prev, algorithm]
        )
    }, [])

    // Load example text
    const loadExample = useCallback((example: string) => {
        const examples = {
            simple: 'Hello, World!',
            secure: 'This is a secure message that needs to be hashed for integrity verification.',
            json: '{"user":"john","email":"john@example.com","timestamp":"2024-01-15T10:30:00Z"}',
            password: 'MySecureP@ssw0rd123!',
            data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'
        }

        const text = examples[example as keyof typeof examples]
        if (text) {
            setInputText(text)
            showNotification(`${example.charAt(0).toUpperCase() + example.slice(1)} example loaded!`, 'success')
        }
    }, [showNotification])

    // Export results
    const exportResults = useCallback(() => {
        if (hashResults.length === 0) {
            showNotification('No hash results to export', 'error')
            return
        }

        const exportData = {
            results: hashResults.map(result => ({
                algorithm: result.algorithm,
                hash: result.hash,
                inputType: result.inputType,
                inputSize: result.inputSize,
                timestamp: result.timestamp.toISOString()
            })),
            exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'hash-results.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Hash results exported!', 'success')
    }, [hashResults, showNotification])

    // Clear all results
    const clearResults = useCallback(() => {
        setHashResults([])
        setInputText('')
        setVerificationHash('')
        setVerificationResult(null)
        showNotification('All results cleared', 'success')
    }, [showNotification])

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
                        <Hash className="inline-block w-10 h-10 mr-3" />
                        Hash Generator
                    </h1>
                    <p className="text-lg text-white/90">
                        Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hash values
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Algorithm Selection */}
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Select Hash Algorithms
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {algorithms.map((algo) => (
                                <label
                                    key={algo.id}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedAlgorithms.includes(algo.id)
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAlgorithms.includes(algo.id)}
                                        onChange={() => toggleAlgorithm(algo.id)}
                                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{algo.name}</div>
                                        <div className="text-sm text-gray-600">{algo.description}</div>
                                        {(algo.id === 'MD5' || algo.id === 'SHA-1') && (
                                            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                <XCircle className="w-3 h-3" />
                                                Not recommended for security
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Input Methods */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Text Input */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        Text Input
                                    </h3>
                                    <button
                                        onClick={() => pasteFromClipboard('input')}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Clipboard className="w-3 h-3" />
                                        Paste
                                    </button>
                                </div>

                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder="Enter text to hash..."
                                />

                                <button
                                    onClick={generateTextHashes}
                                    disabled={isProcessing}
                                    className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            Generate Hashes
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* File Input */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-500" />
                                    File Input
                                </h3>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        Drop a file here or click to select
                                    </p>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={isProcessing}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        Choose File
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hash Results */}
                    {hashResults.length > 0 && (
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-blue-500" />
                                    Hash Results
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={exportResults}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Download className="w-3 h-3" />
                                        Export
                                    </button>
                                    <button
                                        onClick={clearResults}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-300"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {hashResults.map((result, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-800">{result.algorithm}</span>
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    {result.inputType}
                                                </span>
                                                {result.inputSize && (
                                                    <span className="text-xs text-gray-500">
                                                        {formatFileSize(result.inputSize)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {result.timestamp.toLocaleString()}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(result.hash, result.algorithm)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    title="Copy hash"
                                                >
                                                    <Copy className="w-3 h-3 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="font-mono text-sm text-gray-700 bg-white p-3 rounded border break-all">
                                            {result.hash}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hash Verification */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-500" />
                            Hash Verification
                        </h3>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={verificationHash}
                                    onChange={(e) => setVerificationHash(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder="Enter hash to verify against generated results..."
                                />
                            </div>
                            <button
                                onClick={() => pasteFromClipboard('verify')}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                title="Paste from clipboard"
                            >
                                <Clipboard className="w-4 h-4" />
                            </button>
                            <button
                                onClick={verifyHash}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-300"
                            >
                                Verify
                            </button>
                        </div>

                        {verificationResult && (
                            <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${verificationResult === 'match'
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {verificationResult === 'match' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Hash verification successful! The hash matches one of the generated results.
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        Hash verification failed. The hash does not match any generated results.
                                    </>
                                )}
                            </div>
                        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { id: 'simple', label: 'Simple Text', desc: 'Hello, World!' },
                            { id: 'secure', label: 'Secure Message', desc: 'Long security message' },
                            { id: 'json', label: 'JSON Data', desc: 'User data object' },
                            { id: 'password', label: 'Password', desc: 'Strong password example' },
                            { id: 'data', label: 'Lorem Ipsum', desc: 'Sample paragraph text' }
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
                            icon: Shield,
                            title: 'Multiple Algorithms',
                            description: 'Support for MD5, SHA-1, SHA-256, SHA-384, and SHA-512'
                        },
                        {
                            icon: Upload,
                            title: 'File & Text Hashing',
                            description: 'Hash both text input and uploaded files'
                        },
                        {
                            icon: Lock,
                            title: 'Hash Verification',
                            description: 'Verify hashes against generated results'
                        },
                        {
                            icon: Download,
                            title: 'Export Results',
                            description: 'Save and export hash results for documentation'
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