'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Copy, Search, Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Calendar, Globe, Building, Hash, Key, FileText, Download, RefreshCw } from 'lucide-react'

interface CertificateInfo {
    domain: string
    valid: boolean
    issuer: {
        organization: string
        country: string
        commonName: string
    }
    subject: {
        organization?: string
        country?: string
        state?: string
        locality?: string
        commonName: string
        alternativeNames: string[]
    }
    validity: {
        notBefore: Date
        notAfter: Date
        daysRemaining: number
    }
    fingerprint: {
        sha256: string
        sha1: string
    }
    serialNumber: string
    signatureAlgorithm: string
    keyInfo: {
        algorithm: string
        size: number
    }
    protocol: {
        version: string
        cipher: string
    }
    chain: {
        depth: number
        certificates: Array<{
            subject: string
            issuer: string
            valid: boolean
        }>
    }
    score: {
        overall: number
        protocol: number
        keyExchange: number
        cipher: number
        certificate: number
    }
    warnings: string[]
    transparencyLogs?: {
        found: boolean
        count: number
    }
}

interface Example {
    name: string
    domain: string
    description: string
    type: 'secure' | 'warning' | 'expired'
}

const examples: Example[] = [
    {
        name: 'Google',
        domain: 'google.com',
        description: 'Well-configured SSL certificate',
        type: 'secure'
    },
    {
        name: 'GitHub',
        domain: 'github.com',
        description: 'Modern SSL implementation',
        type: 'secure'
    },
    {
        name: 'Expired Example',
        domain: 'expired.badssl.com',
        description: 'Certificate past expiration',
        type: 'expired'
    },
    {
        name: 'Self-Signed',
        domain: 'self-signed.badssl.com',
        description: 'Self-signed certificate example',
        type: 'warning'
    }
]

export default function SSLCertificateChecker() {
    const [domain, setDomain] = useState('')
    const [loading, setLoading] = useState(false)
    const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null)
    const [error, setError] = useState('')
    const [notification, setNotification] = useState('')
    const [showRawCert, setShowRawCert] = useState(false)

    const validateDomain = (domain: string): boolean => {
        const domainRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
        return domainRegex.test(domain)
    }

    const checkCertificate = useCallback(async () => {
        const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')

        if (!cleanDomain) {
            setError('Please enter a domain')
            return
        }

        if (!validateDomain(cleanDomain)) {
            setError('Please enter a valid domain name')
            return
        }

        setLoading(true)
        setError('')
        setCertificateInfo(null)

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Mock certificate data - in production, this would come from your API
            const mockData: CertificateInfo = {
                domain: cleanDomain,
                valid: true,
                issuer: {
                    organization: 'DigiCert Inc',
                    country: 'US',
                    commonName: 'DigiCert TLS RSA SHA256 2020 CA1'
                },
                subject: {
                    organization: 'Example Corporation',
                    country: 'US',
                    state: 'California',
                    locality: 'San Francisco',
                    commonName: cleanDomain,
                    alternativeNames: [`*.${cleanDomain}`, cleanDomain, `www.${cleanDomain}`]
                },
                validity: {
                    notBefore: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                    notAfter: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
                    daysRemaining: 275
                },
                fingerprint: {
                    sha256: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90',
                    sha1: 'A1:B2:C3:D4:E5:F6:78:90:12:34:56:78:90:AB:CD:EF:12:34:56:78'
                },
                serialNumber: '0x1234567890ABCDEF',
                signatureAlgorithm: 'SHA256withRSA',
                keyInfo: {
                    algorithm: 'RSA',
                    size: 2048
                },
                protocol: {
                    version: 'TLS 1.3',
                    cipher: 'TLS_AES_256_GCM_SHA384'
                },
                chain: {
                    depth: 3,
                    certificates: [
                        {
                            subject: cleanDomain,
                            issuer: 'DigiCert TLS RSA SHA256 2020 CA1',
                            valid: true
                        },
                        {
                            subject: 'DigiCert TLS RSA SHA256 2020 CA1',
                            issuer: 'DigiCert Global Root CA',
                            valid: true
                        },
                        {
                            subject: 'DigiCert Global Root CA',
                            issuer: 'DigiCert Global Root CA',
                            valid: true
                        }
                    ]
                },
                score: {
                    overall: 95,
                    protocol: 100,
                    keyExchange: 90,
                    cipher: 95,
                    certificate: 95
                },
                warnings: [],
                transparencyLogs: {
                    found: true,
                    count: 3
                }
            }

            // Add warnings based on conditions
            if (mockData.validity.daysRemaining < 30) {
                mockData.warnings.push('Certificate expires in less than 30 days')
            }
            if (mockData.keyInfo.size < 2048) {
                mockData.warnings.push('Key size is less than 2048 bits')
            }
            if (!mockData.protocol.version.includes('1.3')) {
                mockData.warnings.push('Consider upgrading to TLS 1.3')
            }

            setCertificateInfo(mockData)
        } catch (err) {
            setError('Failed to check certificate. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [domain])

    const getScoreColor = (score: number): string => {
        if (score >= 90) return 'text-green-600'
        if (score >= 70) return 'text-yellow-600'
        if (score >= 50) return 'text-orange-600'
        return 'text-red-600'
    }

    const getScoreGrade = (score: number): string => {
        if (score >= 90) return 'A'
        if (score >= 80) return 'B'
        if (score >= 70) return 'C'
        if (score >= 60) return 'D'
        return 'F'
    }

    const getValidityStatus = (daysRemaining: number) => {
        if (daysRemaining < 0) {
            return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, text: 'Expired' }
        }
        if (daysRemaining < 30) {
            return { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle, text: 'Expiring Soon' }
        }
        if (daysRemaining < 90) {
            return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: ShieldAlert, text: 'Valid' }
        }
        return { color: 'text-green-600', bg: 'bg-green-100', icon: ShieldCheck, text: 'Valid' }
    }

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        }).format(date)
    }

    const copyToClipboard = useCallback(async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${label} copied to clipboard!`)
        } catch (err) {
            setError('Failed to copy to clipboard')
        }
    }, [])

    const exportCertificateInfo = useCallback(() => {
        if (!certificateInfo) return

        const exportData = {
            domain: certificateInfo.domain,
            checkedAt: new Date().toISOString(),
            certificate: certificateInfo,
            report: {
                overallScore: certificateInfo.score.overall,
                grade: getScoreGrade(certificateInfo.score.overall),
                warnings: certificateInfo.warnings
            }
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ssl-certificate-${certificateInfo.domain}-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Certificate info exported!')
    }, [certificateInfo])

    const loadExample = useCallback((example: Example) => {
        setDomain(example.domain)
        setError('')
        setCertificateInfo(null)
    }, [])

    const showNotification = (message: string) => {
        setNotification(message)
        setTimeout(() => setNotification(''), 3000)
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
                            <Lock className="mr-3 text-purple-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">SSL Certificate Checker</h1>
                                <p className="text-gray-600 mt-1">Analyze SSL/TLS certificates and security configuration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Domain Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Domain Name
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && checkCertificate()}
                                        placeholder="example.com"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={checkCertificate}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={20} />
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <Search size={20} />
                                                Check Certificate
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg"
                                >
                                    <AlertTriangle size={20} />
                                    {error}
                                </motion.div>
                            )}

                            {/* Certificate Info */}
                            {certificateInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Overall Score */}
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">Overall Security Score</h3>
                                                <p className="text-sm text-gray-600">Based on protocol, cipher, and certificate analysis</p>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-5xl font-bold ${getScoreColor(certificateInfo.score.overall)}`}>
                                                    {getScoreGrade(certificateInfo.score.overall)}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">{certificateInfo.score.overall}/100</div>
                                            </div>
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="grid grid-cols-4 gap-4 mt-6">
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getScoreColor(certificateInfo.score.protocol)}`}>
                                                    {certificateInfo.score.protocol}
                                                </div>
                                                <div className="text-xs text-gray-600">Protocol</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getScoreColor(certificateInfo.score.keyExchange)}`}>
                                                    {certificateInfo.score.keyExchange}
                                                </div>
                                                <div className="text-xs text-gray-600">Key Exchange</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getScoreColor(certificateInfo.score.cipher)}`}>
                                                    {certificateInfo.score.cipher}
                                                </div>
                                                <div className="text-xs text-gray-600">Cipher Strength</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getScoreColor(certificateInfo.score.certificate)}`}>
                                                    {certificateInfo.score.certificate}
                                                </div>
                                                <div className="text-xs text-gray-600">Certificate</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Status */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Shield className="text-purple-600" size={20} />
                                            Certificate Status
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Validity Status */}
                                            <div>
                                                <div className="text-sm text-gray-600 mb-2">Certificate Validity</div>
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const status = getValidityStatus(certificateInfo.validity.daysRemaining)
                                                        const StatusIcon = status.icon
                                                        return (
                                                            <>
                                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.bg}`}>
                                                                    <StatusIcon className={status.color} size={24} />
                                                                </div>
                                                                <div>
                                                                    <div className={`font-semibold ${status.color}`}>{status.text}</div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {certificateInfo.validity.daysRemaining > 0
                                                                            ? `${certificateInfo.validity.daysRemaining} days remaining`
                                                                            : `Expired ${Math.abs(certificateInfo.validity.daysRemaining)} days ago`}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Valid Dates */}
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-sm text-gray-600">Valid From</div>
                                                    <div className="font-medium text-gray-800 text-sm">
                                                        {formatDate(certificateInfo.validity.notBefore)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Valid Until</div>
                                                    <div className="font-medium text-gray-800 text-sm">
                                                        {formatDate(certificateInfo.validity.notAfter)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Details */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <FileText className="text-purple-600" size={20} />
                                            Certificate Details
                                        </h3>

                                        <div className="space-y-4">
                                            {/* Subject */}
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Subject</div>
                                                <div className="bg-white rounded-lg p-3 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Common Name:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.subject.commonName}</span>
                                                    </div>
                                                    {certificateInfo.subject.organization && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Organization:</span>
                                                            <span className="font-medium text-gray-800">{certificateInfo.subject.organization}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-start justify-between">
                                                        <span className="text-sm text-gray-600">Alternative Names:</span>
                                                        <div className="text-right">
                                                            {certificateInfo.subject.alternativeNames.map((name, idx) => (
                                                                <div key={idx} className="font-medium text-gray-800 text-sm">{name}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Issuer */}
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Issuer</div>
                                                <div className="bg-white rounded-lg p-3 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Common Name:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.issuer.commonName}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Organization:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.issuer.organization}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Country:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.issuer.country}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technical Details */}
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Technical Information</div>
                                                <div className="bg-white rounded-lg p-3 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Serial Number:</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm text-gray-800">{certificateInfo.serialNumber}</span>
                                                            <button
                                                                onClick={() => copyToClipboard(certificateInfo.serialNumber, 'Serial number')}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <Copy size={14} className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Signature Algorithm:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.signatureAlgorithm}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Key Algorithm:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.keyInfo.algorithm} {certificateInfo.keyInfo.size} bits</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Protocol Version:</span>
                                                        <span className="font-medium text-gray-800">{certificateInfo.protocol.version}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Cipher Suite:</span>
                                                        <span className="font-medium text-gray-800 text-sm">{certificateInfo.protocol.cipher}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fingerprints */}
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Fingerprints</div>
                                                <div className="bg-white rounded-lg p-3 space-y-2">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-600">SHA-256:</span>
                                                            <button
                                                                onClick={() => copyToClipboard(certificateInfo.fingerprint.sha256, 'SHA-256 fingerprint')}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <Copy size={14} className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                        <div className="font-mono text-xs text-gray-800 break-all">
                                                            {certificateInfo.fingerprint.sha256}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-600">SHA-1:</span>
                                                            <button
                                                                onClick={() => copyToClipboard(certificateInfo.fingerprint.sha1, 'SHA-1 fingerprint')}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <Copy size={14} className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                        <div className="font-mono text-xs text-gray-800 break-all">
                                                            {certificateInfo.fingerprint.sha1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Chain */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Key className="text-purple-600" size={20} />
                                            Certificate Chain
                                        </h3>
                                        <div className="space-y-2">
                                            {certificateInfo.chain.certificates.map((cert, idx) => (
                                                <div key={idx} className="bg-white rounded-lg p-3 flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${idx === 0 ? 'bg-purple-500' : idx === certificateInfo.chain.certificates.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">{cert.subject}</div>
                                                        <div className="text-sm text-gray-600">
                                                            Issued by: {cert.issuer}
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cert.valid ? 'bg-green-100' : 'bg-red-100'
                                                        }`}>
                                                        {cert.valid ? (
                                                            <CheckCircle className="text-green-600" size={16} />
                                                        ) : (
                                                            <XCircle className="text-red-600" size={16} />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {certificateInfo.warnings.length > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                                                <div>
                                                    <h4 className="font-medium text-yellow-800">Security Warnings</h4>
                                                    <ul className="mt-2 space-y-1">
                                                        {certificateInfo.warnings.map((warning, idx) => (
                                                            <li key={idx} className="text-sm text-yellow-700">• {warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Certificate Transparency */}
                                    {certificateInfo.transparencyLogs && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <Globe className="text-blue-600" size={20} />
                                                <div>
                                                    <h4 className="font-medium text-blue-800">Certificate Transparency</h4>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        {certificateInfo.transparencyLogs.found
                                                            ? `Certificate found in ${certificateInfo.transparencyLogs.count} transparency logs`
                                                            : 'Certificate not found in transparency logs'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={exportCertificateInfo}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                                        >
                                            <Download size={16} />
                                            Export Report
                                        </button>
                                        <button
                                            onClick={() => setShowRawCert(!showRawCert)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            {showRawCert ? 'Hide' : 'Show'} Raw Certificate
                                        </button>
                                    </div>

                                    {/* Raw Certificate (Mock) */}
                                    {showRawCert && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-gray-900 rounded-lg p-4 overflow-x-auto"
                                        >
                                            <pre className="text-green-400 font-mono text-xs">
                                                {`-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
... (truncated for display)
-----END CERTIFICATE-----`}
                                            </pre>
                                        </motion.div>
                                    )}
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
                                                    <code className="text-xs text-gray-500 mt-2 block font-mono">
                                                        {example.domain}
                                                    </code>
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${example.type === 'secure'
                                                        ? 'bg-green-100 text-green-700'
                                                        : example.type === 'warning'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
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
                                        <Shield className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Security Score</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Comprehensive security assessment with A-F grading
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Calendar className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Expiry Tracking</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Monitor certificate validity and expiration dates
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Key className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Chain Analysis</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Full certificate chain validation and visualization
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <FileText className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Detailed Reports</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Export comprehensive security reports
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