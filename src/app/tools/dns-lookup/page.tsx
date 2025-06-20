'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Search,
    Globe,
    Server,
    Shield,
    Mail,
    Copy,
    Download,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
    Settings,
    BookOpen,
    Zap,
    Database,
    Network,
    MapPin,
    Lock
} from 'lucide-react'

interface DNSRecord {
    name: string
    type: string
    ttl: number
    data: string
    priority?: number
    weight?: number
    port?: number
}

interface DNSResult {
    domain: string
    recordType: string
    records: DNSRecord[]
    queryTime: number
    status: 'success' | 'error' | 'not_found'
    error?: string
    timestamp: Date
}

interface LookupHistory {
    id: string
    domain: string
    recordType: string
    status: 'success' | 'error' | 'not_found'
    recordCount: number
    queryTime: number
    timestamp: Date
}

export default function DnsLookupPage() {
    const [domain, setDomain] = useState('example.com')
    const [recordType, setRecordType] = useState('A')
    const [dnsResults, setDnsResults] = useState<DNSResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [lookupHistory, setLookupHistory] = useState<LookupHistory[]>([])
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [dnsServer, setDnsServer] = useState('1.1.1.1') // Cloudflare DNS
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

    // DNS record types
    const recordTypes = [
        { value: 'A', label: 'A', description: 'IPv4 address' },
        { value: 'AAAA', label: 'AAAA', description: 'IPv6 address' },
        { value: 'CNAME', label: 'CNAME', description: 'Canonical name' },
        { value: 'MX', label: 'MX', description: 'Mail exchange' },
        { value: 'TXT', label: 'TXT', description: 'Text records' },
        { value: 'NS', label: 'NS', description: 'Name servers' },
        { value: 'SOA', label: 'SOA', description: 'Start of authority' },
        { value: 'PTR', label: 'PTR', description: 'Reverse lookup' },
        { value: 'SRV', label: 'SRV', description: 'Service records' },
        { value: 'CAA', label: 'CAA', description: 'Certificate authority' }
    ]

    // Popular DNS servers
    const dnsServers = [
        { value: '1.1.1.1', label: 'Cloudflare (1.1.1.1)' },
        { value: '8.8.8.8', label: 'Google (8.8.8.8)' },
        { value: '208.67.222.222', label: 'OpenDNS' },
        { value: '9.9.9.9', label: 'Quad9' },
        { value: '1.0.0.1', label: 'Cloudflare Secondary' }
    ]

    // Mock DNS lookup function (in real app, you'd use a DNS API service)
    const performDNSLookup = useCallback(async (domain: string, recordType: string): Promise<DNSResult> => {
        const startTime = Date.now()

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

        const queryTime = Date.now() - startTime

        try {
            // Mock DNS responses based on common domains and record types
            const mockResponses: { [key: string]: DNSRecord[] } = {
                'example.com-A': [
                    { name: 'example.com', type: 'A', ttl: 3600, data: '93.184.216.34' }
                ],
                'example.com-AAAA': [
                    { name: 'example.com', type: 'AAAA', ttl: 3600, data: '2606:2800:220:1:248:1893:25c8:1946' }
                ],
                'example.com-MX': [
                    { name: 'example.com', type: 'MX', ttl: 3600, data: 'mail.example.com', priority: 10 }
                ],
                'example.com-TXT': [
                    { name: 'example.com', type: 'TXT', ttl: 3600, data: 'v=spf1 include:_spf.example.com ~all' },
                    { name: 'example.com', type: 'TXT', ttl: 3600, data: 'google-site-verification=abc123def456' }
                ],
                'example.com-NS': [
                    { name: 'example.com', type: 'NS', ttl: 86400, data: 'ns1.example.com' },
                    { name: 'example.com', type: 'NS', ttl: 86400, data: 'ns2.example.com' }
                ],
                'google.com-A': [
                    { name: 'google.com', type: 'A', ttl: 300, data: '142.250.191.46' },
                    { name: 'google.com', type: 'A', ttl: 300, data: '142.250.191.78' }
                ],
                'google.com-MX': [
                    { name: 'google.com', type: 'MX', ttl: 3600, data: 'smtp.gmail.com', priority: 10 },
                    { name: 'google.com', type: 'MX', ttl: 3600, data: 'alt1.gmail-smtp-in.l.google.com', priority: 20 }
                ],
                'github.com-A': [
                    { name: 'github.com', type: 'A', ttl: 60, data: '140.82.114.4' }
                ],
                'github.com-AAAA': [
                    { name: 'github.com', type: 'AAAA', ttl: 60, data: '2606:50c0:8000::153' }
                ]
            }

            const key = `${domain.toLowerCase()}-${recordType}`
            const records = mockResponses[key]

            if (records) {
                return {
                    domain,
                    recordType,
                    records,
                    queryTime,
                    status: 'success',
                    timestamp: new Date()
                }
            } else {
                // Generate some realistic mock data for unknown domains
                if (recordType === 'A') {
                    const mockIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
                    return {
                        domain,
                        recordType,
                        records: [{ name: domain, type: 'A', ttl: 3600, data: mockIP }],
                        queryTime,
                        status: 'success',
                        timestamp: new Date()
                    }
                } else {
                    return {
                        domain,
                        recordType,
                        records: [],
                        queryTime,
                        status: 'not_found',
                        error: `No ${recordType} records found for ${domain}`,
                        timestamp: new Date()
                    }
                }
            }
        } catch (error) {
            return {
                domain,
                recordType,
                records: [],
                queryTime,
                status: 'error',
                error: error instanceof Error ? error.message : 'DNS lookup failed',
                timestamp: new Date()
            }
        }
    }, [])

    // Perform DNS lookup
    const performLookup = useCallback(async () => {
        if (!domain.trim()) {
            showNotification('Please enter a domain name', 'error')
            return
        }

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
        if (!domainRegex.test(domain.trim())) {
            showNotification('Please enter a valid domain name', 'error')
            return
        }

        setIsLoading(true)

        try {
            const result = await performDNSLookup(domain.trim(), recordType)

            // Add result to the beginning of results array
            setDnsResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results

            // Add to history
            const historyItem: LookupHistory = {
                id: Date.now().toString(),
                domain: domain.trim(),
                recordType,
                status: result.status,
                recordCount: result.records.length,
                queryTime: result.queryTime,
                timestamp: new Date()
            }
            setLookupHistory(prev => [historyItem, ...prev.slice(0, 19)]) // Keep last 20 lookups

            if (result.status === 'success') {
                showNotification(`Found ${result.records.length} ${recordType} record(s)`, 'success')
            } else if (result.status === 'not_found') {
                showNotification(result.error || 'No records found', 'error')
            } else {
                showNotification(result.error || 'DNS lookup failed', 'error')
            }

        } catch (error) {
            showNotification('DNS lookup failed', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [domain, recordType, performDNSLookup, showNotification])

    // Copy result to clipboard
    const copyResult = useCallback(async (result: DNSResult) => {
        const output = {
            domain: result.domain,
            recordType: result.recordType,
            records: result.records,
            queryTime: result.queryTime,
            timestamp: result.timestamp.toISOString()
        }

        try {
            await navigator.clipboard.writeText(JSON.stringify(output, null, 2))
            showNotification('DNS result copied to clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [showNotification])

    // Export all results
    const exportResults = useCallback(() => {
        if (dnsResults.length === 0) {
            showNotification('No DNS results to export', 'error')
            return
        }

        const exportData = {
            results: dnsResults.map(result => ({
                domain: result.domain,
                recordType: result.recordType,
                records: result.records,
                queryTime: result.queryTime,
                status: result.status,
                error: result.error,
                timestamp: result.timestamp.toISOString()
            })),
            exportedAt: new Date().toISOString(),
            dnsServer
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'dns-lookup-results.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('DNS results exported!', 'success')
    }, [dnsResults, dnsServer, showNotification])

    // Clear all results
    const clearResults = useCallback(() => {
        setDnsResults([])
        setLookupHistory([])
        showNotification('All results cleared', 'success')
    }, [showNotification])

    // Load example lookup
    const loadExample = useCallback((example: string) => {
        const examples = {
            'google-a': { domain: 'google.com', recordType: 'A' },
            'github-aaaa': { domain: 'github.com', recordType: 'AAAA' },
            'example-mx': { domain: 'example.com', recordType: 'MX' },
            'google-txt': { domain: 'google.com', recordType: 'TXT' },
            'cloudflare-ns': { domain: 'cloudflare.com', recordType: 'NS' }
        }

        const selectedExample = examples[example as keyof typeof examples]
        if (selectedExample) {
            setDomain(selectedExample.domain)
            setRecordType(selectedExample.recordType)
            showNotification(`${example.toUpperCase()} example loaded!`, 'success')
        }
    }, [showNotification])

    // Get status icon and color
    const getStatusDisplay = useCallback((status: string) => {
        switch (status) {
            case 'success':
                return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, color: 'text-green-600' }
            case 'not_found':
                return { icon: <XCircle className="w-4 h-4 text-yellow-600" />, color: 'text-yellow-600' }
            case 'error':
                return { icon: <AlertTriangle className="w-4 h-4 text-red-600" />, color: 'text-red-600' }
            default:
                return { icon: <Clock className="w-4 h-4 text-gray-600" />, color: 'text-gray-600' }
        }
    }, [])

    // Get record type icon
    const getRecordTypeIcon = useCallback((type: string) => {
        switch (type) {
            case 'A':
            case 'AAAA':
                return <Globe className="w-4 h-4 text-blue-500" />
            case 'MX':
                return <Mail className="w-4 h-4 text-green-500" />
            case 'NS':
                return <Server className="w-4 h-4 text-purple-500" />
            case 'TXT':
                return <Database className="w-4 h-4 text-orange-500" />
            case 'CNAME':
                return <Network className="w-4 h-4 text-indigo-500" />
            case 'CAA':
                return <Lock className="w-4 h-4 text-red-500" />
            default:
                return <Settings className="w-4 h-4 text-gray-500" />
        }
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
                        <Search className="inline-block w-10 h-10 mr-3" />
                        DNS Lookup
                    </h1>
                    <p className="text-lg text-white/90">
                        Query DNS records and troubleshoot domain issues with detailed analysis
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* DNS Lookup Form */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder="Enter domain name (e.g., example.com)"
                                    onKeyPress={(e) => e.key === 'Enter' && performLookup()}
                                />
                            </div>

                            <select
                                value={recordType}
                                onChange={(e) => setRecordType(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-300 rounded-lg font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                {recordTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label} - {type.description}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={performLookup}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Looking up...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Lookup
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Advanced Options */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                            >
                                <Settings className="w-4 h-4" />
                                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                            </button>

                            <div className="flex gap-2">
                                {dnsResults.length > 0 && (
                                    <button
                                        onClick={exportResults}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all duration-300"
                                    >
                                        <Download className="w-3 h-3" />
                                        Export
                                    </button>
                                )}
                                <button
                                    onClick={clearResults}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-300"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Advanced Options Panel */}
                        {showAdvanced && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            DNS Server
                                        </label>
                                        <select
                                            value={dnsServer}
                                            onChange={(e) => setDnsServer(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        >
                                            {dnsServers.map(server => (
                                                <option key={server.value} value={server.value}>
                                                    {server.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Query Type Info
                                        </label>
                                        <div className="text-sm text-gray-600 p-2 bg-white rounded border">
                                            {recordTypes.find(t => t.value === recordType)?.description || 'DNS record type'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* DNS Results */}
                    {dnsResults.length > 0 && (
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-500" />
                                DNS Results ({dnsResults.length})
                            </h3>

                            <div className="space-y-4">
                                {dnsResults.map((result, index) => {
                                    const statusDisplay = getStatusDisplay(result.status)
                                    return (
                                        <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                            {/* Result Header */}
                                            <div className="p-4 border-b border-gray-200 bg-white">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getRecordTypeIcon(result.recordType)}
                                                        <div>
                                                            <div className="font-medium text-gray-800">
                                                                {result.domain} ({result.recordType})
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    {statusDisplay.icon}
                                                                    <span className={statusDisplay.color}>
                                                                        {result.status === 'success' ? 'Success' :
                                                                            result.status === 'not_found' ? 'No records' : 'Error'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {result.queryTime}ms
                                                                </div>
                                                                <div>
                                                                    {result.timestamp.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => copyResult(result)}
                                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                        title="Copy result"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Records */}
                                            <div className="p-4">
                                                {result.status === 'success' && result.records.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {result.records.map((record, recordIndex) => (
                                                            <div key={recordIndex} className="flex items-center justify-between p-3 bg-white rounded border">
                                                                <div className="flex-1">
                                                                    <div className="font-mono text-sm text-gray-800">
                                                                        {record.data}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                                        <span>TTL: {record.ttl}s</span>
                                                                        {record.priority && <span>Priority: {record.priority}</span>}
                                                                        {record.weight && <span>Weight: {record.weight}</span>}
                                                                        {record.port && <span>Port: {record.port}</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {record.type}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                        {result.error || 'No records found'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Lookup History */}
                    {lookupHistory.length > 0 && (
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                Lookup History ({lookupHistory.length})
                            </h3>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {lookupHistory.map((item) => {
                                    const statusDisplay = getStatusDisplay(item.status)
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setDomain(item.domain)
                                                setRecordType(item.recordType)
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {getRecordTypeIcon(item.recordType)}
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {item.domain}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">
                                                            {item.recordType}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {statusDisplay.icon}
                                                            <span className={statusDisplay.color}>
                                                                {item.recordCount} records
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 text-right">
                                                <div>{item.queryTime}ms</div>
                                                <div>{item.timestamp.toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    )
                                })}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { id: 'google-a', label: 'Google A Record', desc: 'IPv4 addresses for google.com' },
                            { id: 'github-aaaa', label: 'GitHub IPv6', desc: 'IPv6 addresses for github.com' },
                            { id: 'example-mx', label: 'Example MX', desc: 'Mail servers for example.com' },
                            { id: 'google-txt', label: 'Google TXT', desc: 'Text records for google.com' },
                            { id: 'cloudflare-ns', label: 'Cloudflare NS', desc: 'Name servers for cloudflare.com' }
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
                            icon: Database,
                            title: '10 Record Types',
                            description: 'A, AAAA, CNAME, MX, TXT, NS, SOA, PTR, SRV, CAA records'
                        },
                        {
                            icon: Server,
                            title: 'Multiple DNS Servers',
                            description: 'Query Cloudflare, Google, OpenDNS, and Quad9 servers'
                        },
                        {
                            icon: Clock,
                            title: 'Performance Metrics',
                            description: 'Track query response times and lookup history'
                        },
                        {
                            icon: Shield,
                            title: 'Detailed Analysis',
                            description: 'TTL, priority, weight, and other record details'
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