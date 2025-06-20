'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileCode2, Copy, Trash2, Download, Upload, FileText, Image, Music, Video, Package, AlertCircle } from 'lucide-react'

interface Example {
    name: string
    type: 'encode' | 'decode'
    input: string
    description: string
}

const examples: Example[] = [
    {
        name: 'Simple Text',
        type: 'encode',
        input: 'Hello, World!',
        description: 'Encode plain text to Base64'
    },
    {
        name: 'JSON Data',
        type: 'encode',
        input: '{"name": "John", "age": 30}',
        description: 'Encode JSON structure'
    },
    {
        name: 'Base64 String',
        type: 'decode',
        input: 'SGVsbG8sIFdvcmxkIQ==',
        description: 'Decode Base64 back to text'
    },
    {
        name: 'HTML Content',
        type: 'encode',
        input: '<h1>Hello World</h1>',
        description: 'Encode HTML markup'
    }
]

const fileTypeIcons: { [key: string]: any } = {
    'text': FileText,
    'image': Image,
    'audio': Music,
    'video': Video,
    'application': Package
}

export default function Base64EncoderDecoder() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [mode, setMode] = useState<'encode' | 'decode'>('encode')
    const [error, setError] = useState('')
    const [notification, setNotification] = useState('')
    const [fileName, setFileName] = useState('')
    const [fileType, setFileType] = useState('')
    const [fileSize, setFileSize] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    const processBase64 = useCallback(() => {
        setError('')
        setOutput('')

        if (!input.trim()) {
            setError('Please enter some text or upload a file')
            return
        }

        try {
            if (mode === 'encode') {
                const encoded = btoa(unescape(encodeURIComponent(input)))
                setOutput(encoded)
            } else {
                const decoded = decodeURIComponent(escape(atob(input)))
                setOutput(decoded)
            }
        } catch (err) {
            setError(`Failed to ${mode} the input. Please check the format.`)
        }
    }, [input, mode])

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsProcessing(true)
        setFileName(file.name)
        setFileType(file.type)
        setFileSize(file.size)

        const reader = new FileReader()

        if (mode === 'encode') {
            reader.onload = (event) => {
                const base64 = event.target?.result as string
                // Remove data URL prefix
                const base64Data = base64.split(',')[1]
                setInput(base64Data)
                setOutput(base64Data)
                setIsProcessing(false)
            }
            reader.readAsDataURL(file)
        } else {
            reader.onload = (event) => {
                const text = event.target?.result as string
                setInput(text)
                processBase64()
                setIsProcessing(false)
            }
            reader.readAsText(file)
        }

        reader.onerror = () => {
            setError('Failed to read file')
            setIsProcessing(false)
        }
    }, [mode, processBase64])

    const downloadResult = useCallback(() => {
        if (!output) return

        try {
            let blob: Blob
            let filename: string

            if (mode === 'encode') {
                blob = new Blob([output], { type: 'text/plain' })
                filename = 'encoded.txt'
            } else {
                // Try to restore original file type if it was a file
                if (fileName && fileType) {
                    const binaryString = atob(input)
                    const bytes = new Uint8Array(binaryString.length)
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i)
                    }
                    blob = new Blob([bytes], { type: fileType })
                    filename = fileName
                } else {
                    blob = new Blob([output], { type: 'text/plain' })
                    filename = 'decoded.txt'
                }
            }

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            showNotification('Downloaded successfully!')
        } catch (err) {
            setError('Failed to download file')
        }
    }, [output, mode, fileName, fileType, input])

    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification('Copied to clipboard!')
        } catch (err) {
            setError('Failed to copy to clipboard')
        }
    }, [])

    const pasteFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText()
            setInput(text)
            showNotification('Pasted from clipboard!')
        } catch (err) {
            setError('Failed to paste from clipboard')
        }
    }, [])

    const clear = useCallback(() => {
        setInput('')
        setOutput('')
        setError('')
        setFileName('')
        setFileType('')
        setFileSize(0)
    }, [])

    const loadExample = useCallback((example: Example) => {
        clear()
        setMode(example.type)
        setInput(example.input)
        if (example.type === 'encode') {
            setOutput(btoa(unescape(encodeURIComponent(example.input))))
        } else {
            setOutput(decodeURIComponent(escape(atob(example.input))))
        }
    }, [clear])

    const showNotification = (message: string) => {
        setNotification(message)
        setTimeout(() => setNotification(''), 3000)
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = () => {
        if (!fileType) return FileText
        const mainType = fileType.split('/')[0]
        return fileTypeIcons[mainType] || Package
    }

    const FileIcon = getFileIcon()

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 p-4"
        >
            <div className="max-w-6xl mx-auto">
                <Link href="/" className="inline-flex items-center text-white mb-8 hover:opacity-80 transition-opacity">
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Tools
                </Link>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="p-8">
                        <div className="flex items-center mb-6">
                            <FileCode2 className="mr-3 text-purple-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Base64 Encoder/Decoder</h1>
                                <p className="text-gray-600 mt-1">Encode and decode Base64 strings with file support</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Mode Selection */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('encode')}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all ${mode === 'encode'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    Encode
                                </button>
                                <button
                                    onClick={() => setMode('decode')}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all ${mode === 'decode'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    Decode
                                </button>
                            </div>

                            {/* Input Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {mode === 'encode' ? 'Text or File to Encode' : 'Base64 to Decode'}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                            accept={mode === 'decode' ? '.txt' : '*'}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                                        >
                                            <Upload size={16} />
                                            Upload
                                        </label>
                                        <button
                                            onClick={pasteFromClipboard}
                                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            Paste
                                        </button>
                                        <button
                                            onClick={clear}
                                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                        >
                                            <Trash2 size={16} />
                                            Clear
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                                />
                                {fileName && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <FileIcon size={16} />
                                        <span>{fileName}</span>
                                        <span className="text-gray-400">•</span>
                                        <span>{formatFileSize(fileSize)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Process Button */}
                            <button
                                onClick={processBase64}
                                disabled={isProcessing}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : `${mode === 'encode' ? 'Encode' : 'Decode'} Base64`}
                            </button>

                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg"
                                >
                                    <AlertCircle size={20} />
                                    {error}
                                </motion.div>
                            )}

                            {/* Output Section */}
                            {output && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {mode === 'encode' ? 'Encoded Base64' : 'Decoded Text'}
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(output)}
                                                className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                            >
                                                <Copy size={16} />
                                                Copy
                                            </button>
                                            <button
                                                onClick={downloadResult}
                                                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        value={output}
                                        readOnly
                                        className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                                    />
                                </motion.div>
                            )}

                            {/* Examples Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Examples</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {examples.map((example, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => loadExample(example)}
                                            className="text-left p-4 bg-white/90 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                                        {example.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                                                    <code className="text-xs text-gray-500 mt-2 block truncate font-mono">
                                                        {example.input}
                                                    </code>
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${example.type === 'encode'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {example.type}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <FileCode2 className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Text Encoding</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Encode any text to Base64 format instantly
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Upload className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">File Support</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Upload and encode any file type to Base64
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Download className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Download Results</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Save encoded or decoded results as files
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Copy className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Quick Actions</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Copy, paste, and clear with one click
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg"
                >
                    {notification}
                </motion.div>
            )}
        </motion.div>
    )
}