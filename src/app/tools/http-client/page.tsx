'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Globe,
    Send,
    Copy,
    Trash2,
    Plus,
    Minus,
    Download,
    Upload,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Code,
    Eye,
    EyeOff,
    Settings,
    BookOpen,
    Zap,
    Key,
    Lock,
    Database
} from 'lucide-react'

interface Header {
    id: string
    key: string
    value: string
    enabled: boolean
}

interface RequestHistory {
    id: string
    method: string
    url: string
    status?: number
    statusText?: string
    responseTime?: number
    timestamp: Date
}

interface ApiResponse {
    status: number
    statusText: string
    headers: { [key: string]: string }
    data: any
    responseTime: number
    size: number
}

export default function HttpClientPage() {
    const [method, setMethod] = useState('GET')
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
    const [headers, setHeaders] = useState<Header[]>([
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true }
    ])
    const [requestBody, setRequestBody] = useState('')
    const [responseData, setResponseData] = useState<ApiResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showRequestHeaders, setShowRequestHeaders] = useState(true)
    const [showResponseHeaders, setShowResponseHeaders] = useState(false)
    const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([])
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
    const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic'>('none')
    const [authToken, setAuthToken] = useState('')
    const [basicAuthUser, setBasicAuthUser] = useState('')
    const [basicAuthPass, setBasicAuthPass] = useState('')
    const [notification, setNotification] = useState<{
        message: string
        type: 'success' | 'error'
        show: boolean
    }>({ message: '', type: 'success', show: false })

    const startTimeRef = useRef<number>(0)

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type, show: true })
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
        }, 3000)
    }, [])

    // HTTP Methods
    const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

    // Add new header
    const addHeader = useCallback(() => {
        const newHeader: Header = {
            id: Date.now().toString(),
            key: '',
            value: '',
            enabled: true
        }
        setHeaders(prev => [...prev, newHeader])
    }, [])

    // Remove header
    const removeHeader = useCallback((id: string) => {
        setHeaders(prev => prev.filter(h => h.id !== id))
    }, [])

    // Update header
    const updateHeader = useCallback((id: string, field: keyof Header, value: any) => {
        setHeaders(prev => prev.map(h =>
            h.id === id ? { ...h, [field]: value } : h
        ))
    }, [])

    // Build request headers
    const buildRequestHeaders = useCallback((): { [key: string]: string } => {
        const requestHeaders: { [key: string]: string } = {}

        // Add custom headers
        headers.forEach(header => {
            if (header.enabled && header.key.trim() && header.value.trim()) {
                requestHeaders[header.key.trim()] = header.value.trim()
            }
        })

        // Add authentication headers
        if (authType === 'bearer' && authToken.trim()) {
            requestHeaders['Authorization'] = `Bearer ${authToken.trim()}`
        } else if (authType === 'basic' && basicAuthUser.trim() && basicAuthPass.trim()) {
            const credentials = btoa(`${basicAuthUser.trim()}:${basicAuthPass.trim()}`)
            requestHeaders['Authorization'] = `Basic ${credentials}`
        }

        return requestHeaders
    }, [headers, authType, authToken, basicAuthUser, basicAuthPass])

    // Send HTTP request
    const sendRequest = useCallback(async () => {
        if (!url.trim()) {
            showNotification('Please enter a URL', 'error')
            return
        }

        setIsLoading(true)
        startTimeRef.current = Date.now()

        try {
            const requestHeaders = buildRequestHeaders()
            const requestOptions: RequestInit = {
                method,
                headers: requestHeaders
            }

            // Add body for methods that support it
            if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody.trim()) {
                requestOptions.body = requestBody.trim()
            }

            const response = await fetch(url.trim(), requestOptions)
            const responseTime = Date.now() - startTimeRef.current

            // Get response headers
            const responseHeaders: { [key: string]: string } = {}
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value
            })

            // Get response data
            let responseData: any
            const contentType = response.headers.get('content-type') || ''

            try {
                if (contentType.includes('application/json')) {
                    responseData = await response.json()
                } else if (contentType.includes('text/')) {
                    responseData = await response.text()
                } else {
                    responseData = await response.text()
                }
            } catch (parseError) {
                responseData = await response.text()
            }

            // Calculate response size
            const responseText = typeof responseData === 'string' ? responseData : JSON.stringify(responseData)
            const responseSize = new Blob([responseText]).size

            const apiResponse: ApiResponse = {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                data: responseData,
                responseTime,
                size: responseSize
            }

            setResponseData(apiResponse)

            // Add to history
            const historyItem: RequestHistory = {
                id: Date.now().toString(),
                method,
                url: url.trim(),
                status: response.status,
                statusText: response.statusText,
                responseTime,
                timestamp: new Date()
            }

            setRequestHistory(prev => [historyItem, ...prev.slice(0, 19)]) // Keep last 20 requests
            showNotification('Request completed successfully!', 'success')

        } catch (error) {
            const errorResponse: ApiResponse = {
                status: 0,
                statusText: 'Network Error',
                headers: {},
                data: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
                responseTime: Date.now() - startTimeRef.current,
                size: 0
            }

            setResponseData(errorResponse)

            const historyItem: RequestHistory = {
                id: Date.now().toString(),
                method,
                url: url.trim(),
                status: 0,
                statusText: 'Network Error',
                responseTime: Date.now() - startTimeRef.current,
                timestamp: new Date()
            }

            setRequestHistory(prev => [historyItem, ...prev.slice(0, 19)])
            showNotification('Request failed', 'error')

        } finally {
            setIsLoading(false)
        }
    }, [url, method, buildRequestHeaders, requestBody, showNotification])

    // Copy response to clipboard
    const copyResponse = useCallback(async (type: 'full' | 'data' | 'headers') => {
        if (!responseData) {
            showNotification('No response to copy', 'error')
            return
        }

        let textToCopy = ''

        if (type === 'full') {
            textToCopy = JSON.stringify({
                status: responseData.status,
                statusText: responseData.statusText,
                headers: responseData.headers,
                data: responseData.data
            }, null, 2)
        } else if (type === 'data') {
            textToCopy = typeof responseData.data === 'string'
                ? responseData.data
                : JSON.stringify(responseData.data, null, 2)
        } else if (type === 'headers') {
            textToCopy = JSON.stringify(responseData.headers, null, 2)
        }

        try {
            await navigator.clipboard.writeText(textToCopy)
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`, 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [responseData, showNotification])

    // Load request from history
    const loadFromHistory = useCallback((historyItem: RequestHistory) => {
        // In a real app, you'd store the full request details
        setMethod(historyItem.method)
        setUrl(historyItem.url)
        setSelectedHistoryId(historyItem.id)
        showNotification('Request loaded from history', 'success')
    }, [showNotification])

    // Clear request data
    const clearRequest = useCallback(() => {
        setUrl('')
        setRequestBody('')
        setResponseData(null)
        setHeaders([{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }])
        showNotification('Request cleared', 'success')
    }, [showNotification])

    // Load example request
    const loadExample = useCallback((example: string) => {
        const examples = {
            'get-users': {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/users',
                headers: [{ id: '1', key: 'Accept', value: 'application/json', enabled: true }],
                body: ''
            },
            'post-data': {
                method: 'POST',
                url: 'https://jsonplaceholder.typicode.com/posts',
                headers: [
                    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
                    { id: '2', key: 'Accept', value: 'application/json', enabled: true }
                ],
                body: JSON.stringify({
                    title: 'Test Post',
                    body: 'This is a test post created via HTTP client',
                    userId: 1
                }, null, 2)
            },
            'weather-api': {
                method: 'GET',
                url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY',
                headers: [{ id: '1', key: 'Accept', value: 'application/json', enabled: true }],
                body: ''
            },
            'github-api': {
                method: 'GET',
                url: 'https://api.github.com/users/octocat',
                headers: [
                    { id: '1', key: 'Accept', value: 'application/vnd.github.v3+json', enabled: true },
                    { id: '2', key: 'User-Agent', value: 'HTTP-Client-Tool', enabled: true }
                ],
                body: ''
            }
        }

        const selectedExample = examples[example as keyof typeof examples]
        if (selectedExample) {
            setMethod(selectedExample.method)
            setUrl(selectedExample.url)
            setHeaders(selectedExample.headers)
            setRequestBody(selectedExample.body)
            showNotification(`${example.replace('-', ' ').toUpperCase()} example loaded!`, 'success')
        }
    }, [showNotification])

    // Export request/response
    const exportData = useCallback(() => {
        if (!responseData) {
            showNotification('No response data to export', 'error')
            return
        }

        const exportObj = {
            request: {
                method,
                url,
                headers: buildRequestHeaders(),
                body: requestBody || null
            },
            response: {
                status: responseData.status,
                statusText: responseData.statusText,
                headers: responseData.headers,
                data: responseData.data,
                responseTime: responseData.responseTime,
                size: responseData.size
            },
            timestamp: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'http-request-response.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Request/Response exported!', 'success')
    }, [responseData, method, url, buildRequestHeaders, requestBody, showNotification])

    // Format response size
    const formatSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }, [])

    // Get status color
    const getStatusColor = useCallback((status: number): string => {
        if (status === 0) return 'text-gray-500'
        if (status >= 200 && status < 300) return 'text-green-600'
        if (status >= 300 && status < 400) return 'text-blue-600'
        if (status >= 400 && status < 500) return 'text-yellow-600'
        return 'text-red-600'
    }, [])

    // Get status icon
    const getStatusIcon = useCallback((status: number) => {
        if (status === 0) return <XCircle className="w-4 h-4 text-gray-500" />
        if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4 text-green-600" />
        if (status >= 300 && status < 400) return <AlertTriangle className="w-4 h-4 text-blue-600" />
        if (status >= 400 && status < 500) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
        return <XCircle className="w-4 h-4 text-red-600" />
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
                        <Globe className="inline-block w-10 h-10 mr-3" />
                        HTTP Client
                    </h1>
                    <p className="text-lg text-white/90">
                        Test APIs and make HTTP requests with custom headers and authentication
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Request Configuration */}
                    <div className="p-6 border-b border-gray-200">
                        {/* URL and Method */}
                        <div className="flex gap-3 mb-6">
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-300 rounded-lg font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                {httpMethods.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                placeholder="https://api.example.com/endpoint"
                            />

                            <button
                                onClick={sendRequest}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={clearRequest}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear
                            </button>
                            {responseData && (
                                <button
                                    onClick={exportData}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all duration-300"
                                >
                                    <Download className="w-3 h-3" />
                                    Export
                                </button>
                            )}
                        </div>

                        {/* Authentication */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-3">
                                <Lock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-700">Authentication</span>
                                <select
                                    value={authType}
                                    onChange={(e) => setAuthType(e.target.value as any)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="none">No Auth</option>
                                    <option value="bearer">Bearer Token</option>
                                    <option value="basic">Basic Auth</option>
                                </select>
                            </div>

                            {authType === 'bearer' && (
                                <input
                                    type="password"
                                    value={authToken}
                                    onChange={(e) => setAuthToken(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Bearer token"
                                />
                            )}

                            {authType === 'basic' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={basicAuthUser}
                                        onChange={(e) => setBasicAuthUser(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Username"
                                    />
                                    <input
                                        type="password"
                                        value={basicAuthPass}
                                        onChange={(e) => setBasicAuthPass(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Password"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Headers */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowRequestHeaders(!showRequestHeaders)}
                                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                                    >
                                        {showRequestHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        <span className="font-medium">Headers ({headers.filter(h => h.enabled).length})</span>
                                    </button>
                                </div>
                                <button
                                    onClick={addHeader}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-300"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Header
                                </button>
                            </div>

                            {showRequestHeaders && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {headers.map((header) => (
                                        <div key={header.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={header.enabled}
                                                onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <input
                                                type="text"
                                                value={header.key}
                                                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                                placeholder="Header name"
                                            />
                                            <input
                                                type="text"
                                                value={header.value}
                                                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                                placeholder="Header value"
                                            />
                                            <button
                                                onClick={() => removeHeader(header.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Request Body */}
                        {['POST', 'PUT', 'PATCH'].includes(method) && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Code className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">Request Body</span>
                                </div>
                                <textarea
                                    value={requestBody}
                                    onChange={(e) => setRequestBody(e.target.value)}
                                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Enter request body (JSON, XML, etc.)"
                                />
                            </div>
                        )}
                    </div>

                    {/* Response Section */}
                    {responseData && (
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-blue-500" />
                                    Response
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyResponse('data')}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy Data
                                    </button>
                                    <button
                                        onClick={() => copyResponse('full')}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-300"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy All
                                    </button>
                                </div>
                            </div>

                            {/* Response Status */}
                            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(responseData.status)}
                                    <span className={`font-bold ${getStatusColor(responseData.status)}`}>
                                        {responseData.status} {responseData.statusText}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    {responseData.responseTime}ms
                                </div>
                                <div className="text-sm text-gray-600">
                                    {formatSize(responseData.size)}
                                </div>
                            </div>

                            {/* Response Headers */}
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowResponseHeaders(!showResponseHeaders)}
                                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-2"
                                >
                                    {showResponseHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span className="font-medium">Response Headers ({Object.keys(responseData.headers).length})</span>
                                </button>

                                {showResponseHeaders && (
                                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                                        <pre className="font-mono text-xs text-gray-700">
                                            {JSON.stringify(responseData.headers, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Response Data */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-700">Response Data</span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                                        {typeof responseData.data === 'string'
                                            ? responseData.data
                                            : JSON.stringify(responseData.data, null, 2)
                                        }
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Request History */}
                    {requestHistory.length > 0 && (
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                Request History ({requestHistory.length})
                            </h3>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {requestHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-300 ${selectedHistoryId === item.id
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                            }`}
                                        onClick={() => loadFromHistory(item)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                                                {item.method}
                                            </span>
                                            <span className="font-mono text-sm text-gray-700 truncate max-w-md">
                                                {item.url}
                                            </span>
                                            {item.status !== undefined && (
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(item.status)}
                                                    <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {item.responseTime && (
                                                <span>{item.responseTime}ms</span>
                                            )}
                                            <span>{item.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { id: 'get-users', label: 'GET Users', desc: 'Fetch user list from JSONPlaceholder' },
                            { id: 'post-data', label: 'POST Data', desc: 'Create new post with JSON data' },
                            { id: 'weather-api', label: 'Weather API', desc: 'OpenWeatherMap API example' },
                            { id: 'github-api', label: 'GitHub API', desc: 'Fetch GitHub user profile' }
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
                            icon: Zap,
                            title: 'All HTTP Methods',
                            description: 'Support for GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS'
                        },
                        {
                            icon: Key,
                            title: 'Authentication',
                            description: 'Bearer token and Basic authentication support'
                        },
                        {
                            icon: Settings,
                            title: 'Custom Headers',
                            description: 'Add unlimited custom headers with enable/disable toggle'
                        },
                        {
                            icon: Clock,
                            title: 'Request History',
                            description: 'Track and reload previous requests with response times'
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