'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Copy, Download, Calendar, Globe, Building, User, Mail, Phone, MapPin, Shield, Clock, Server, AlertCircle, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'

interface WhoisData {
    domain: string
    status: 'active' | 'expired' | 'pending' | 'reserved'
    registrar: {
        name: string
        url: string
        ianaId: string
        abuseEmail: string
        abusePhone: string
    }
    dates: {
        created: Date
        updated: Date
        expires: Date
        daysUntilExpiry: number
    }
    registrant: {
        name: string
        organization: string
        email: string
        phone: string
        address: {
            street: string
            city: string
            state: string
            postalCode: string
            country: string
        }
    }
    admin: {
        name: string
        organization: string
        email: string
        phone: string
    }
    tech: {
        name: string
        organization: string
        email: string
        phone: string
    }
    nameServers: string[]
    dnssec: boolean
    domainStatus: Array<{
        status: string
        description: string
    }>
    rawWhois?: string
}

interface Example {
    name: string
    domain: string
    description: string
    type: 'popular' | 'new' | 'expiring'
}

const examples: Example[] = [
    {
        name: 'Google',
        domain: 'google.com',
        description: 'Popular domain with public info',
        type: 'popular'
    },
    {
        name: 'Example Domain',
        domain: 'example.com',
        description: 'IANA reserved domain',
        type: 'popular'
    },
    {
        name: 'Tech Startup',
        domain: 'vercel.com',
        description: 'Modern tech company domain',
        type: 'new'
    },
    {
        name: 'Open Source',
        domain: 'github.com',
        description: 'Developer platform domain',
        type: 'popular'
    }
]

const statusDescriptions: { [key: string]: string } = {
    'clientTransferProhibited': 'Transfer is prohibited by the registrar',
    'clientUpdateProhibited': 'Updates are prohibited by the registrar',
    'clientDeleteProhibited': 'Deletion is prohibited by the registrar',
    'clientRenewProhibited': 'Renewal is prohibited by the registrar',
    'serverTransferProhibited': 'Transfer is prohibited by the registry',
    'serverUpdateProhibited': 'Updates are prohibited by the registry',
    'serverDeleteProhibited': 'Deletion is prohibited by the registry',
    'ok': 'No restrictions - domain is active',
    'pendingDelete': 'Domain is pending deletion',
    'redemptionPeriod': 'Domain is in redemption period',
    'pendingTransfer': 'Domain transfer is in progress'
}

export default function WhoisLookup() {
    const [domain, setDomain] = useState('')
    const [loading, setLoading] = useState(false)
    const [whoisData, setWhoisData] = useState<WhoisData | null>(null)
    const [error, setError] = useState('')
    const [notification, setNotification] = useState('')
    const [showRawWhois, setShowRawWhois] = useState(false)
    const [privacyProtected, setPrivacyProtected] = useState(false)

    const validateDomain = (domain: string): boolean => {
        const domainRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
        return domainRegex.test(domain)
    }

    const lookupDomain = useCallback(async () => {
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')

        if (!cleanDomain) {
            setError('Please enter a domain name')
            return
        }

        if (!validateDomain(cleanDomain)) {
            setError('Please enter a valid domain name')
            return
        }

        setLoading(true)
        setError('')
        setWhoisData(null)
        setPrivacyProtected(false)

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Mock WHOIS data - in production, this would come from your API
            const isPrivacyProtected = Math.random() > 0.5

            const mockData: WhoisData = {
                domain: cleanDomain,
                status: 'active',
                registrar: {
                    name: 'Example Registrar, Inc.',
                    url: 'https://www.example-registrar.com',
                    ianaId: '123456',
                    abuseEmail: 'abuse@example-registrar.com',
                    abusePhone: '+1.2025551234'
                },
                dates: {
                    created: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 3), // 3 years ago
                    updated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                    expires: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
                    daysUntilExpiry: 335
                },
                registrant: isPrivacyProtected ? {
                    name: 'REDACTED FOR PRIVACY',
                    organization: 'Privacy Protection Service',
                    email: 'privacy@example-registrar.com',
                    phone: 'REDACTED',
                    address: {
                        street: 'REDACTED',
                        city: 'REDACTED',
                        state: 'REDACTED',
                        postalCode: 'REDACTED',
                        country: 'REDACTED'
                    }
                } : {
                    name: 'John Doe',
                    organization: 'Example Corporation',
                    email: 'admin@' + cleanDomain,
                    phone: '+1.4155551234',
                    address: {
                        street: '123 Main Street',
                        city: 'San Francisco',
                        state: 'CA',
                        postalCode: '94105',
                        country: 'United States'
                    }
                },
                admin: isPrivacyProtected ? {
                    name: 'REDACTED FOR PRIVACY',
                    organization: 'Privacy Protection Service',
                    email: 'privacy@example-registrar.com',
                    phone: 'REDACTED'
                } : {
                    name: 'Jane Smith',
                    organization: 'Example Corporation',
                    email: 'admin@' + cleanDomain,
                    phone: '+1.4155551235'
                },
                tech: isPrivacyProtected ? {
                    name: 'REDACTED FOR PRIVACY',
                    organization: 'Privacy Protection Service',
                    email: 'privacy@example-registrar.com',
                    phone: 'REDACTED'
                } : {
                    name: 'Tech Support',
                    organization: 'Example Hosting Co.',
                    email: 'tech@example-hosting.com',
                    phone: '+1.4155551236'
                },
                nameServers: [
                    'ns1.' + cleanDomain,
                    'ns2.' + cleanDomain,
                    'ns3.example-dns.com',
                    'ns4.example-dns.com'
                ],
                dnssec: true,
                domainStatus: [
                    { status: 'clientTransferProhibited', description: statusDescriptions['clientTransferProhibited'] },
                    { status: 'clientUpdateProhibited', description: statusDescriptions['clientUpdateProhibited'] },
                    { status: 'ok', description: statusDescriptions['ok'] }
                ],
                rawWhois: generateMockRawWhois(cleanDomain, isPrivacyProtected)
            }

            setWhoisData(mockData)
            setPrivacyProtected(isPrivacyProtected)
        } catch (err) {
            setError('Failed to lookup domain. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [domain])

    const generateMockRawWhois = (domain: string, isPrivate: boolean): string => {
        return `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: D123456789-LROR
Registrar WHOIS Server: whois.example-registrar.com
Registrar URL: https://www.example-registrar.com
Updated Date: ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}
Creation Date: ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 3).toISOString()}
Registry Expiry Date: ${new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString()}
Registrar: Example Registrar, Inc.
Registrar IANA ID: 123456
Registrar Abuse Contact Email: abuse@example-registrar.com
Registrar Abuse Contact Phone: +1.2025551234
Domain Status: clientTransferProhibited
Domain Status: clientUpdateProhibited

Name Server: ns1.${domain}
Name Server: ns2.${domain}
Name Server: ns3.example-dns.com
Name Server: ns4.example-dns.com

DNSSEC: signedDelegation

${isPrivate ? 'Registrant Organization: Privacy Protection Service\nRegistrant State/Province: REDACTED\nRegistrant Country: REDACTED' : `Registrant Name: John Doe
Registrant Organization: Example Corporation
Registrant Street: 123 Main Street
Registrant City: San Francisco
Registrant State/Province: CA
Registrant Postal Code: 94105
Registrant Country: US
Registrant Phone: +1.4155551234
Registrant Email: admin@${domain}`}

>>> Last update of WHOIS database: ${new Date().toISOString()} <<<`
    }

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date)
    }

    const getDomainAge = (created: Date): string => {
        const years = Math.floor((Date.now() - created.getTime()) / (365 * 24 * 60 * 60 * 1000))
        const months = Math.floor(((Date.now() - created.getTime()) % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000))

        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`
        }
        return `${months} month${months > 1 ? 's' : ''}`
    }

    const getExpiryStatus = (daysRemaining: number) => {
        if (daysRemaining < 0) {
            return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, text: 'Expired' }
        }
        if (daysRemaining < 30) {
            return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle, text: 'Expiring Soon' }
        }
        if (daysRemaining < 90) {
            return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, text: 'Renewal Recommended' }
        }
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, text: 'Active' }
    }

    const copyToClipboard = useCallback(async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${label} copied to clipboard!`)
        } catch (err) {
            setError('Failed to copy to clipboard')
        }
    }, [])

    const exportWhoisData = useCallback(() => {
        if (!whoisData) return

        const exportData = {
            domain: whoisData.domain,
            lookedUpAt: new Date().toISOString(),
            data: whoisData
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `whois-${whoisData.domain}-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('WHOIS data exported!')
    }, [whoisData])

    const downloadRawWhois = useCallback(() => {
        if (!whoisData || !whoisData.rawWhois) return

        const blob = new Blob([whoisData.rawWhois], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `whois-${whoisData.domain}-raw.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Raw WHOIS downloaded!')
    }, [whoisData])

    const loadExample = useCallback((example: Example) => {
        setDomain(example.domain)
        setError('')
        setWhoisData(null)
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
                            <Search className="mr-3 text-purple-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">WHOIS Lookup</h1>
                                <p className="text-gray-600 mt-1">Get domain registration and ownership information</p>
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
                                        onKeyPress={(e) => e.key === 'Enter' && lookupDomain()}
                                        placeholder="example.com"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={lookupDomain}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={20} />
                                                Looking up...
                                            </>
                                        ) : (
                                            <>
                                                <Search size={20} />
                                                Lookup
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
                                    <AlertCircle size={20} />
                                    {error}
                                </motion.div>
                            )}

                            {/* Privacy Protection Notice */}
                            {privacyProtected && whoisData && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                                >
                                    <Shield className="text-yellow-600" size={20} />
                                    <div>
                                        <h4 className="font-medium text-yellow-800">Privacy Protected Domain</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            This domain uses WHOIS privacy protection. Contact information is hidden by the registrar.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* WHOIS Results */}
                            {whoisData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Domain Overview */}
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-800">{whoisData.domain}</h3>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const status = getExpiryStatus(whoisData.dates.daysUntilExpiry)
                                                            const StatusIcon = status.icon
                                                            return (
                                                                <>
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.bg}`}>
                                                                        <StatusIcon className={status.color} size={16} />
                                                                    </div>
                                                                    <span className={`font-medium ${status.color}`}>{status.text}</span>
                                                                </>
                                                            )
                                                        })()}
                                                    </div>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-gray-600">{getDomainAge(whoisData.dates.created)} old</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={exportWhoisData}
                                                    className="px-3 py-1 text-sm bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center gap-1 border border-gray-200"
                                                >
                                                    <Download size={16} />
                                                    Export
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Important Dates */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Calendar className="text-purple-600" size={20} />
                                            Important Dates
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-600">Created</div>
                                                <div className="font-medium text-gray-800">{formatDate(whoisData.dates.created)}</div>
                                                <div className="text-xs text-gray-500 mt-1">{getDomainAge(whoisData.dates.created)} ago</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Last Updated</div>
                                                <div className="font-medium text-gray-800">{formatDate(whoisData.dates.updated)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Expires</div>
                                                <div className="font-medium text-gray-800">{formatDate(whoisData.dates.expires)}</div>
                                                <div className={`text-xs mt-1 ${whoisData.dates.daysUntilExpiry < 90 ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {whoisData.dates.daysUntilExpiry > 0
                                                        ? `In ${whoisData.dates.daysUntilExpiry} days`
                                                        : `${Math.abs(whoisData.dates.daysUntilExpiry)} days ago`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Registrar Information */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Building className="text-purple-600" size={20} />
                                            Registrar Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Registrar</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-800">{whoisData.registrar.name}</span>
                                                    <a
                                                        href={whoisData.registrar.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-purple-600 hover:text-purple-700"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">IANA ID</span>
                                                <span className="font-medium text-gray-800">{whoisData.registrar.ianaId}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Abuse Email</span>
                                                <div className="flex items-center gap-2">
                                                    <a href={`mailto:${whoisData.registrar.abuseEmail}`} className="font-medium text-purple-600 hover:text-purple-700">
                                                        {whoisData.registrar.abuseEmail}
                                                    </a>
                                                    <button
                                                        onClick={() => copyToClipboard(whoisData.registrar.abuseEmail, 'Email')}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        <Copy size={14} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Abuse Phone</span>
                                                <span className="font-medium text-gray-800">{whoisData.registrar.abusePhone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Registrant */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                                <User className="text-purple-600" size={18} />
                                                Registrant
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Name:</span>
                                                    <div className="font-medium text-gray-800">{whoisData.registrant.name}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Organization:</span>
                                                    <div className="font-medium text-gray-800">{whoisData.registrant.organization}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-gray-600" />
                                                    <span className="text-gray-800 break-all">{whoisData.registrant.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-600" />
                                                    <span className="text-gray-800">{whoisData.registrant.phone}</span>
                                                </div>
                                                {!privacyProtected && (
                                                    <div className="flex items-start gap-2 mt-2">
                                                        <MapPin size={14} className="text-gray-600 mt-0.5" />
                                                        <div className="text-gray-800">
                                                            <div>{whoisData.registrant.address.street}</div>
                                                            <div>{whoisData.registrant.address.city}, {whoisData.registrant.address.state} {whoisData.registrant.address.postalCode}</div>
                                                            <div>{whoisData.registrant.address.country}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Admin Contact */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                                <Shield className="text-purple-600" size={18} />
                                                Admin Contact
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Name:</span>
                                                    <div className="font-medium text-gray-800">{whoisData.admin.name}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Organization:</span>
                                                    <div className="font-medium text-gray-800">{whoisData.admin.organization}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-gray-600" />
                                                    <span className="text-gray-800 break-all">{whoisData.admin.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-600" />
                                                    <span className="text-gray-800">{whoisData.admin.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tech Contact */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                                <Server className="text-purple-600" size={18} />
                                                Tech Contact
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Name:</span>
                                                    <div className="font-medium text-gray-800">{whoisData.tech.name}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Organization:</span>
                                                    <div className="font-medium text-gray-800">{whoisData.tech.organization}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-gray-600" />
                                                    <span className="text-gray-800 break-all">{whoisData.tech.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-600" />
                                                    <span className="text-gray-800">{whoisData.tech.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Details */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Server className="text-purple-600" size={20} />
                                            Technical Details
                                        </h3>

                                        {/* Name Servers */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Name Servers</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {whoisData.nameServers.map((ns, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-white rounded px-3 py-2">
                                                        <Globe className="text-gray-400" size={16} />
                                                        <span className="font-mono text-sm text-gray-800">{ns}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(ns, 'Name server')}
                                                            className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                                                        >
                                                            <Copy size={14} className="text-gray-600" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Domain Status */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Domain Status</h4>
                                            <div className="space-y-2">
                                                {whoisData.domainStatus.map((status, idx) => (
                                                    <div key={idx} className="bg-white rounded px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${status.status === 'ok' ? 'bg-green-500' : 'bg-yellow-500'
                                                                }`} />
                                                            <span className="font-mono text-sm text-gray-800">{status.status}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 ml-4">{status.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DNSSEC */}
                                        <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                                            <span className="text-sm text-gray-700">DNSSEC</span>
                                            <div className="flex items-center gap-2">
                                                {whoisData.dnssec ? (
                                                    <>
                                                        <CheckCircle className="text-green-600" size={16} />
                                                        <span className="text-green-600 font-medium">Enabled</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="text-gray-400" size={16} />
                                                        <span className="text-gray-600">Disabled</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Raw WHOIS */}
                                    <div>
                                        <button
                                            onClick={() => setShowRawWhois(!showRawWhois)}
                                            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-between"
                                        >
                                            <span>{showRawWhois ? 'Hide' : 'Show'} Raw WHOIS Data</span>
                                            <Download size={16} />
                                        </button>

                                        {showRawWhois && whoisData.rawWhois && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4"
                                            >
                                                <div className="bg-gray-900 rounded-lg p-4 relative">
                                                    <button
                                                        onClick={downloadRawWhois}
                                                        className="absolute top-4 right-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <Download size={14} />
                                                        Download
                                                    </button>
                                                    <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                                                        {whoisData.rawWhois}
                                                    </pre>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
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
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${example.type === 'popular'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : example.type === 'new'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
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
                                        <User className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Ownership Info</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Complete registrant and contact details
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Calendar className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Date Tracking</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Creation, update, and expiry dates
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Server className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Technical Data</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Name servers, status, and DNSSEC info
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Shield className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Privacy Detection</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Identify privacy-protected domains
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