'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Copy, Search, MapPin, Wifi, Server, Shield, Clock, Building, Phone, Mail, RefreshCw, AlertCircle } from 'lucide-react'

interface IPInfo {
    ip: string
    city: string
    region: string
    country: string
    country_code: string
    continent: string
    timezone: string
    latitude: number
    longitude: number
    isp: string
    org: string
    asn: string
    hostname?: string
    vpn?: boolean
    proxy?: boolean
    tor?: boolean
    hosting?: boolean
    mobile?: boolean
}

interface Example {
    name: string
    ip: string
    description: string
    type: 'IPv4' | 'IPv6'
}

const examples: Example[] = [
    {
        name: 'Google DNS',
        ip: '8.8.8.8',
        description: 'Google Public DNS server',
        type: 'IPv4'
    },
    {
        name: 'Cloudflare DNS',
        ip: '1.1.1.1',
        description: 'Cloudflare DNS resolver',
        type: 'IPv4'
    },
    {
        name: 'Example IPv6',
        ip: '2001:4860:4860::8888',
        description: 'Google DNS IPv6 address',
        type: 'IPv6'
    },
    {
        name: 'Local Network',
        ip: '192.168.1.1',
        description: 'Common router IP address',
        type: 'IPv4'
    }
]

export default function IPAddressInfo() {
    const [ipAddress, setIpAddress] = useState('')
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
    const [myIpInfo, setMyIpInfo] = useState<IPInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingMyIp, setLoadingMyIp] = useState(true)
    const [error, setError] = useState('')
    const [notification, setNotification] = useState('')

    // Fetch user's own IP on component mount
    useEffect(() => {
        fetchMyIpInfo()
    }, [])

    const fetchMyIpInfo = async () => {
        setLoadingMyIp(true)
        try {
            // This is a mock implementation - in production, you'd call your API
            const mockData: IPInfo = {
                ip: '203.0.113.45',
                city: 'San Francisco',
                region: 'California',
                country: 'United States',
                country_code: 'US',
                continent: 'North America',
                timezone: 'America/Los_Angeles',
                latitude: 37.7749,
                longitude: -122.4194,
                isp: 'Example ISP Inc.',
                org: 'Example Organization',
                asn: 'AS12345',
                hostname: 'example-host.isp.com',
                vpn: false,
                proxy: false,
                tor: false,
                hosting: false,
                mobile: false
            }
            setMyIpInfo(mockData)
        } catch (err) {
            console.error('Failed to fetch IP info')
        } finally {
            setLoadingMyIp(false)
        }
    }

    const validateIP = (ip: string): boolean => {
        // IPv4 validation
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        // IPv6 validation (simplified)
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

        return ipv4Regex.test(ip) || ipv6Regex.test(ip)
    }

    const lookupIP = useCallback(async () => {
        if (!ipAddress.trim()) {
            setError('Please enter an IP address')
            return
        }

        if (!validateIP(ipAddress.trim())) {
            setError('Please enter a valid IP address')
            return
        }

        setLoading(true)
        setError('')
        setIpInfo(null)

        try {
            // This is a mock implementation - in production, you'd call your API
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockData: IPInfo = {
                ip: ipAddress,
                city: 'New York',
                region: 'New York',
                country: 'United States',
                country_code: 'US',
                continent: 'North America',
                timezone: 'America/New_York',
                latitude: 40.7128,
                longitude: -74.0060,
                isp: 'Example ISP Corporation',
                org: 'Example Organization LLC',
                asn: 'AS15169',
                hostname: 'example-hostname.isp.net',
                vpn: false,
                proxy: false,
                tor: false,
                hosting: true,
                mobile: false
            }

            setIpInfo(mockData)
        } catch (err) {
            setError('Failed to lookup IP address. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [ipAddress])

    const copyToClipboard = useCallback(async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${label} copied to clipboard!`)
        } catch (err) {
            setError('Failed to copy to clipboard')
        }
    }, [])

    const loadExample = useCallback((example: Example) => {
        setIpAddress(example.ip)
        setError('')
        setIpInfo(null)
    }, [])

    const clear = useCallback(() => {
        setIpAddress('')
        setIpInfo(null)
        setError('')
    }, [])

    const showNotification = (message: string) => {
        setNotification(message)
        setTimeout(() => setNotification(''), 3000)
    }

    const getCountryFlag = (countryCode: string) => {
        return `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`
    }

    const formatCoordinates = (lat: number, lon: number) => {
        return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
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
                            <Globe className="mr-3 text-purple-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">IP Address Info</h1>
                                <p className="text-gray-600 mt-1">Get detailed information about any IP address</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* My IP Section */}
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wifi className="text-purple-600" size={20} />
                                        <span className="font-medium text-gray-800">Your IP Address</span>
                                    </div>
                                    <button
                                        onClick={fetchMyIpInfo}
                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                        disabled={loadingMyIp}
                                    >
                                        <RefreshCw className={`text-purple-600 ${loadingMyIp ? 'animate-spin' : ''}`} size={16} />
                                    </button>
                                </div>
                                {loadingMyIp ? (
                                    <div className="mt-2 text-gray-600">Loading...</div>
                                ) : myIpInfo ? (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg text-gray-800">{myIpInfo.ip}</span>
                                            <button
                                                onClick={() => copyToClipboard(myIpInfo.ip, 'IP address')}
                                                className="p-1 hover:bg-purple-100 rounded transition-colors"
                                            >
                                                <Copy size={16} className="text-purple-600" />
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {myIpInfo.city}, {myIpInfo.region}, {myIpInfo.country} • {myIpInfo.isp}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* IP Lookup Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter IP Address to Lookup
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ipAddress}
                                        onChange={(e) => setIpAddress(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && lookupIP()}
                                        placeholder="e.g., 8.8.8.8 or 2001:4860:4860::8888"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                                    />
                                    <button
                                        onClick={lookupIP}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        <Search size={20} />
                                        {loading ? 'Looking up...' : 'Lookup'}
                                    </button>
                                    <button
                                        onClick={clear}
                                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        Clear
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

                            {/* IP Info Results */}
                            {ipInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Location Info */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <MapPin className="text-purple-600" size={20} />
                                            Location Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={getCountryFlag(ipInfo.country_code)}
                                                    alt={ipInfo.country}
                                                    className="w-12 h-9 object-cover rounded"
                                                />
                                                <div>
                                                    <div className="text-sm text-gray-600">Country</div>
                                                    <div className="font-medium text-gray-800">{ipInfo.country}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">City</div>
                                                <div className="font-medium text-gray-800">{ipInfo.city}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Region</div>
                                                <div className="font-medium text-gray-800">{ipInfo.region}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Continent</div>
                                                <div className="font-medium text-gray-800">{ipInfo.continent}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Coordinates</div>
                                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                                    {formatCoordinates(ipInfo.latitude, ipInfo.longitude)}
                                                    <button
                                                        onClick={() => copyToClipboard(formatCoordinates(ipInfo.latitude, ipInfo.longitude), 'Coordinates')}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        <Copy size={14} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Timezone</div>
                                                <div className="font-medium text-gray-800 flex items-center gap-1">
                                                    <Clock size={16} className="text-gray-600" />
                                                    {ipInfo.timezone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Network Info */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Server className="text-purple-600" size={20} />
                                            Network Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-600">IP Address</div>
                                                <div className="font-medium text-gray-800 font-mono flex items-center gap-2">
                                                    {ipInfo.ip}
                                                    <button
                                                        onClick={() => copyToClipboard(ipInfo.ip, 'IP address')}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        <Copy size={14} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">ISP</div>
                                                <div className="font-medium text-gray-800">{ipInfo.isp}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">Organization</div>
                                                <div className="font-medium text-gray-800">{ipInfo.org}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600">ASN</div>
                                                <div className="font-medium text-gray-800">{ipInfo.asn}</div>
                                            </div>
                                            {ipInfo.hostname && (
                                                <div className="md:col-span-2">
                                                    <div className="text-sm text-gray-600">Hostname</div>
                                                    <div className="font-medium text-gray-800 font-mono text-sm">{ipInfo.hostname}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Security Info */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Shield className="text-purple-600" size={20} />
                                            Security Information
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div className="text-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${ipInfo.vpn ? 'bg-yellow-100' : 'bg-green-100'
                                                    }`}>
                                                    <Shield className={ipInfo.vpn ? 'text-yellow-600' : 'text-green-600'} size={20} />
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">VPN</div>
                                                <div className={`text-xs ${ipInfo.vpn ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {ipInfo.vpn ? 'Detected' : 'Not Detected'}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${ipInfo.proxy ? 'bg-yellow-100' : 'bg-green-100'
                                                    }`}>
                                                    <Server className={ipInfo.proxy ? 'text-yellow-600' : 'text-green-600'} size={20} />
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">Proxy</div>
                                                <div className={`text-xs ${ipInfo.proxy ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {ipInfo.proxy ? 'Detected' : 'Not Detected'}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${ipInfo.tor ? 'bg-red-100' : 'bg-green-100'
                                                    }`}>
                                                    <Shield className={ipInfo.tor ? 'text-red-600' : 'text-green-600'} size={20} />
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">Tor</div>
                                                <div className={`text-xs ${ipInfo.tor ? 'text-red-600' : 'text-green-600'}`}>
                                                    {ipInfo.tor ? 'Detected' : 'Not Detected'}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${ipInfo.hosting ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                    <Building className={ipInfo.hosting ? 'text-blue-600' : 'text-gray-600'} size={20} />
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">Hosting</div>
                                                <div className={`text-xs ${ipInfo.hosting ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {ipInfo.hosting ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${ipInfo.mobile ? 'bg-purple-100' : 'bg-gray-100'
                                                    }`}>
                                                    <Phone className={ipInfo.mobile ? 'text-purple-600' : 'text-gray-600'} size={20} />
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">Mobile</div>
                                                <div className={`text-xs ${ipInfo.mobile ? 'text-purple-600' : 'text-gray-600'}`}>
                                                    {ipInfo.mobile ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                        </div>
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
                                                        {example.ip}
                                                    </code>
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${example.type === 'IPv4'
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
                                        <MapPin className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Geolocation</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Get precise location data including coordinates
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Server className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Network Info</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            ISP, organization, ASN, and hostname details
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Shield className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">Security Check</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Detect VPN, proxy, Tor, and hosting providers
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/80 rounded-lg p-4 border border-gray-200"
                                    >
                                        <Globe className="text-purple-600 mb-2" size={24} />
                                        <h4 className="font-medium text-gray-800">IPv4 & IPv6</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Support for both IPv4 and IPv6 addresses
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