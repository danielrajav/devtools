'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Network, Copy, Play, Square, AlertCircle, Shield, Server, Wifi, Globe, Database, Mail, Lock, Terminal } from 'lucide-react'

interface PortInfo {
    port: number
    service: string
    description: string
    status?: 'open' | 'closed' | 'filtered' | 'checking'
    protocol: 'TCP' | 'UDP'
    risk?: 'low' | 'medium' | 'high'
}

interface PortCategory {
    name: string
    icon: any
    ports: PortInfo[]
}

const commonPorts: PortCategory[] = [
    {
        name: 'Web Services',
        icon: Globe,
        ports: [
            { port: 80, service: 'HTTP', description: 'Hypertext Transfer Protocol', protocol: 'TCP', risk: 'medium' },
            { port: 443, service: 'HTTPS', description: 'HTTP Secure', protocol: 'TCP', risk: 'low' },
            { port: 8080, service: 'HTTP-Proxy', description: 'HTTP Alternate', protocol: 'TCP', risk: 'medium' },
            { port: 8443, service: 'HTTPS-Alt', description: 'HTTPS Alternate', protocol: 'TCP', risk: 'low' }
        ]
    },
    {
        name: 'Email Services',
        icon: Mail,
        ports: [
            { port: 25, service: 'SMTP', description: 'Simple Mail Transfer Protocol', protocol: 'TCP', risk: 'high' },
            { port: 110, service: 'POP3', description: 'Post Office Protocol v3', protocol: 'TCP', risk: 'medium' },
            { port: 143, service: 'IMAP', description: 'Internet Message Access Protocol', protocol: 'TCP', risk: 'medium' },
            { port: 587, service: 'SMTP-SSL', description: 'SMTP Secure', protocol: 'TCP', risk: 'low' },
            { port: 993, service: 'IMAPS', description: 'IMAP Secure', protocol: 'TCP', risk: 'low' },
            { port: 995, service: 'POP3S', description: 'POP3 Secure', protocol: 'TCP', risk: 'low' }
        ]
    },
    {
        name: 'File Transfer',
        icon: Server,
        ports: [
            { port: 20, service: 'FTP-Data', description: 'File Transfer Protocol (Data)', protocol: 'TCP', risk: 'high' },
            { port: 21, service: 'FTP', description: 'File Transfer Protocol (Control)', protocol: 'TCP', risk: 'high' },
            { port: 22, service: 'SSH', description: 'Secure Shell', protocol: 'TCP', risk: 'low' },
            { port: 23, service: 'Telnet', description: 'Telnet Protocol', protocol: 'TCP', risk: 'high' },
            { port: 69, service: 'TFTP', description: 'Trivial File Transfer Protocol', protocol: 'UDP', risk: 'high' },
            { port: 115, service: 'SFTP', description: 'Simple File Transfer Protocol', protocol: 'TCP', risk: 'medium' }
        ]
    },
    {
        name: 'Database Services',
        icon: Database,
        ports: [
            { port: 1433, service: 'MSSQL', description: 'Microsoft SQL Server', protocol: 'TCP', risk: 'medium' },
            { port: 1521, service: 'Oracle', description: 'Oracle Database', protocol: 'TCP', risk: 'medium' },
            { port: 3306, service: 'MySQL', description: 'MySQL Database', protocol: 'TCP', risk: 'medium' },
            { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL Database', protocol: 'TCP', risk: 'medium' },
            { port: 5984, service: 'CouchDB', description: 'CouchDB Database', protocol: 'TCP', risk: 'medium' },
            { port: 6379, service: 'Redis', description: 'Redis Database', protocol: 'TCP', risk: 'medium' },
            { port: 27017, service: 'MongoDB', description: 'MongoDB Database', protocol: 'TCP', risk: 'medium' }
        ]
    },
    {
        name: 'Remote Access',
        icon: Terminal,
        ports: [
            { port: 3389, service: 'RDP', description: 'Remote Desktop Protocol', protocol: 'TCP', risk: 'medium' },
            { port: 5900, service: 'VNC', description: 'Virtual Network Computing', protocol: 'TCP', risk: 'medium' },
            { port: 5938, service: 'TeamViewer', description: 'TeamViewer Remote Access', protocol: 'TCP', risk: 'low' }
        ]
    },
    {
        name: 'Network Services',
        icon: Wifi,
        ports: [
            { port: 53, service: 'DNS', description: 'Domain Name System', protocol: 'UDP', risk: 'low' },
            { port: 67, service: 'DHCP', description: 'DHCP Server', protocol: 'UDP', risk: 'low' },
            { port: 68, service: 'DHCP', description: 'DHCP Client', protocol: 'UDP', risk: 'low' },
            { port: 123, service: 'NTP', description: 'Network Time Protocol', protocol: 'UDP', risk: 'low' },
            { port: 161, service: 'SNMP', description: 'Simple Network Management Protocol', protocol: 'UDP', risk: 'medium' },
            { port: 445, service: 'SMB', description: 'Server Message Block', protocol: 'TCP', risk: 'high' },
            { port: 1900, service: 'UPnP', description: 'Universal Plug and Play', protocol: 'UDP', risk: 'medium' }
        ]
    }
]

export default function PortScanner() {
    const [targetHost, setTargetHost] = useState('')
    const [selectedPorts, setSelectedPorts] = useState<Set<number>>(new Set())
    const [scanResults, setScanResults] = useState<Map<number, PortInfo>>(new Map())
    const [scanning, setScanning] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')
    const [notification, setNotification] = useState('')
    const [customPort, setCustomPort] = useState('')
    const [scanMode, setScanMode] = useState<'quick' | 'common' | 'custom'>('quick')
    const abortControllerRef = useRef<AbortController | null>(null)

    const quickScanPorts = [21, 22, 23, 25, 53, 80, 110, 443, 445, 3389]
    const commonScanPorts = commonPorts.flatMap(cat => cat.ports.map(p => p.port))

    const validateHost = (host: string): boolean => {
        // Simple validation for domain or IP
        const domainRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
        return domainRegex.test(host) || ipRegex.test(host)
    }

    const simulatePortScan = async (host: string, port: number): Promise<'open' | 'closed' | 'filtered'> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

        // Simulate port status (in production, this would make actual connection attempts)
        const randomValue = Math.random()
        if (randomValue < 0.3) return 'open'
        if (randomValue < 0.4) return 'filtered'
        return 'closed'
    }

    const startScan = useCallback(async () => {
        if (!targetHost.trim()) {
            setError('Please enter a target host')
            return
        }

        if (!validateHost(targetHost.trim())) {
            setError('Please enter a valid domain or IP address')
            return
        }

        let portsToScan: number[] = []

        if (scanMode === 'quick') {
            portsToScan = quickScanPorts
        } else if (scanMode === 'common') {
            portsToScan = commonScanPorts
        } else {
            portsToScan = Array.from(selectedPorts)
            if (portsToScan.length === 0) {
                setError('Please select at least one port to scan')
                return
            }
        }

        setError('')
        setScanning(true)
        setProgress(0)
        setScanResults(new Map())

        // Create new AbortController for this scan
        abortControllerRef.current = new AbortController()
        const { signal } = abortControllerRef.current

        try {
            for (let i = 0; i < portsToScan.length; i++) {
                if (signal.aborted) break

                const port = portsToScan[i]
                const portInfo = findPortInfo(port)

                // Update status to checking
                setScanResults(prev => new Map(prev).set(port, { ...portInfo, status: 'checking' }))

                // Simulate port scan
                const status = await simulatePortScan(targetHost, port)

                // Update with result
                setScanResults(prev => new Map(prev).set(port, { ...portInfo, status }))

                // Update progress
                setProgress(((i + 1) / portsToScan.length) * 100)
            }

            if (!signal.aborted) {
                showNotification('Port scan completed!')
            }
        } catch (err) {
            if (!signal.aborted) {
                setError('Scan failed. Please try again.')
            }
        } finally {
            setScanning(false)
            abortControllerRef.current = null
        }
    }, [targetHost, scanMode, selectedPorts])

    const stopScan = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            setScanning(false)
            showNotification('Scan stopped')
        }
    }, [])

    const findPortInfo = (port: number): PortInfo => {
        for (const category of commonPorts) {
            const portInfo = category.ports.find(p => p.port === port)
            if (portInfo) return portInfo
        }
        return {
            port,
            service: 'Unknown',
            description: 'Unknown service',
            protocol: 'TCP',
            risk: 'medium'
        }
    }

    const togglePortSelection = (port: number) => {
        setSelectedPorts(prev => {
            const newSet = new Set(prev)
            if (newSet.has(port)) {
                newSet.delete(port)
            } else {
                newSet.add(port)
            }
            return newSet
        })
    }

    const selectAllInCategory = (ports: PortInfo[]) => {
        setSelectedPorts(prev => {
            const newSet = new Set(prev)
            ports.forEach(p => newSet.add(p.port))
            return newSet
        })
    }

    const addCustomPort = () => {
        const port = parseInt(customPort)
        if (isNaN(port) || port < 1 || port > 65535) {
            setError('Please enter a valid port number (1-65535)')
            return
        }
        setSelectedPorts(prev => new Set(prev).add(port))
        setCustomPort('')
        showNotification(`Port ${port} added to scan list`)
    }

    const copyResults = useCallback(async () => {
        const results = Array.from(scanResults.entries())
            .map(([port, info]) => `${port}/${info.protocol} - ${info.service} - ${info.status?.toUpperCase()}`)
            .join('\n')

        try {
            await navigator.clipboard.writeText(results)
            showNotification('Results copied to clipboard!')
        } catch (err) {
            setError('Failed to copy to clipboard')
        }
    }, [scanResults])

    const exportResults = useCallback(() => {
        const results = {
            host: targetHost,
            scanDate: new Date().toISOString(),
            results: Array.from(scanResults.entries()).map(([port, info]) => ({
                port,
                service: info.service,
                protocol: info.protocol,
                status: info.status,
                description: info.description,
                risk: info.risk
            }))
        }

        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `port-scan-${targetHost}-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Results exported!')
    }, [targetHost, scanResults])

    const showNotification = (message: string) => {
        setNotification(message)
        setTimeout(() => setNotification(''), 3000)
    }

    const getRiskColor = (risk?: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'high': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'open': return 'text-green-600'
            case 'closed': return 'text-red-600'
            case 'filtered': return 'text-yellow-600'
            case 'checking': return 'text-blue-600 animate-pulse'
            default: return 'text-gray-600'
        }
    }

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
                            <Network className="mr-3 text-purple-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Port Scanner</h1>
                                <p className="text-gray-600 mt-1">Check open ports and identify running services</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Target Host Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Host
                                </label>
                                <input
                                    type="text"
                                    value={targetHost}
                                    onChange={(e) => setTargetHost(e.target.value)}
                                    placeholder="example.com or 192.168.1.1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    disabled={scanning}
                                />
                            </div>

                            {/* Scan Mode Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Scan Mode
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setScanMode('quick')}
                                        disabled={scanning}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${scanMode === 'quick'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            } disabled:opacity-50`}
                                    >
                                        Quick Scan (10 ports)
                                    </button>
                                    <button
                                        onClick={() => setScanMode('common')}
                                        disabled={scanning}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${scanMode === 'common'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            } disabled:opacity-50`}
                                    >
                                        Common Ports ({commonScanPorts.length} ports)
                                    </button>
                                    <button
                                        onClick={() => setScanMode('custom')}
                                        disabled={scanning}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${scanMode === 'custom'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            } disabled:opacity-50`}
                                    >
                                        Custom Selection
                                    </button>
                                </div>
                            </div>

                            {/* Custom Port Selection */}
                            {scanMode === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    {/* Add Custom Port */}
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={customPort}
                                            onChange={(e) => setCustomPort(e.target.value)}
                                            placeholder="Enter port number (1-65535)"
                                            min="1"
                                            max="65535"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={addCustomPort}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            Add Port
                                        </button>
                                    </div>

                                    {/* Port Categories */}
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {commonPorts.map((category, catIndex) => {
                                            const CategoryIcon = category.icon
                                            return (
                                                <div key={catIndex} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <CategoryIcon className="text-purple-600" size={20} />
                                                            <h4 className="font-medium text-gray-800">{category.name}</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => selectAllInCategory(category.ports)}
                                                            className="text-sm text-purple-600 hover:text-purple-700"
                                                        >
                                                            Select All
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {category.ports.map((port, portIndex) => (
                                                            <label
                                                                key={portIndex}
                                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedPorts.has(port.port)}
                                                                    onChange={() => togglePortSelection(port.port)}
                                                                    className="text-purple-600 rounded focus:ring-purple-500"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className="font-medium text-sm">{port.port}</span>
                                                                    <span className="text-gray-600 text-sm ml-2">- {port.service}</span>
                                                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getRiskColor(port.risk)}`}>
                                                                        {port.risk}
                                                                    </span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {selectedPorts.size > 0 && (
                                        <div className="text-sm text-gray-600">
                                            Selected ports: {Array.from(selectedPorts).sort((a, b) => a - b).join(', ')}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Scan Control */}
                            <div className="flex gap-2">
                                {!scanning ? (
                                    <button
                                        onClick={startScan}
                                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] inline-flex items-center justify-center gap-2"
                                    >
                                        <Play size={20} />
                                        Start Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopScan}
                                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all inline-flex items-center justify-center gap-2"
                                    >
                                        <Square size={20} />
                                        Stop Scan
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {scanning && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Scanning ports...</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                        />
                                    </div>
                                </div>
                            )}

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

                            {/* Scan Results */}
                            {scanResults.size > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800">Scan Results</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={copyResults}
                                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center gap-1"
                                            >
                                                <Copy size={16} />
                                                Copy
                                            </button>
                                            <button
                                                onClick={exportResults}
                                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                            >
                                                Export JSON
                                            </button>
                                        </div>
                                    </div>

                                    {/* Results Summary */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {Array.from(scanResults.values()).filter(p => p.status === 'open').length}
                                            </div>
                                            <div className="text-sm text-green-800">Open Ports</div>
                                        </div>
                                        <div className="bg-red-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {Array.from(scanResults.values()).filter(p => p.status === 'closed').length}
                                            </div>
                                            <div className="text-sm text-red-800">Closed Ports</div>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {Array.from(scanResults.values()).filter(p => p.status === 'filtered').length}
                                            </div>
                                            <div className="text-sm text-yellow-800">Filtered Ports</div>
                                        </div>
                                    </div>

                                    {/* Detailed Results */}
                                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Port</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Service</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Risk</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {Array.from(scanResults.entries())
                                                    .sort(([a], [b]) => a - b)
                                                    .map(([port, info]) => (
                                                        <tr key={port} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-mono">
                                                                {port}/{info.protocol}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-medium">{info.service}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`font-medium ${getStatusColor(info.status)}`}>
                                                                    {info.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`px-2 py-1 rounded text-xs ${getRiskColor(info.risk)}`}>
                                                                    {info.risk}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{info.description}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Shield className="text-yellow-600 mt-0.5" size={20} />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Security Notice</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Open ports can be potential security vulnerabilities. Ensure that only necessary services are exposed and properly secured.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

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
                                        <Network className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Port Detection</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Identify open, closed, and filtered ports
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Server className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Service Info</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Detailed information about running services
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Shield className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Risk Assessment</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Security risk levels for each service
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Database className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Export Results</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Save scan results in JSON format
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