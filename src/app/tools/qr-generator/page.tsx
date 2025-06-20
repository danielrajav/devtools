'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    QrCode,
    Download,
    Trash2,
    Settings,
    Eye,
    Copy,
    Smartphone,
    Globe,
    Mail,
    Phone,
    MessageCircle,
    MapPin,
    Wifi,
    Calendar,
    User,
    CreditCard,
    BookOpen,
    Palette,
    Zap,
    Share2
} from 'lucide-react'

interface QRCodeOptions {
    size: number
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
    margin: number
    colorDark: string
    colorLight: string
}

interface QRData {
    type: string
    content: string
    formatted: string
}

export default function QRGeneratorPage() {
    const [qrData, setQrData] = useState<QRData>({
        type: 'text',
        content: 'Hello, QR Code!',
        formatted: 'Hello, QR Code!'
    })
    const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
        size: 256,
        errorCorrectionLevel: 'M',
        margin: 4,
        colorDark: '#000000',
        colorLight: '#FFFFFF'
    })
    const [qrCodeSVG, setQrCodeSVG] = useState('')
    const [showOptions, setShowOptions] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [notification, setNotification] = useState<{
        message: string
        type: 'success' | 'error'
        show: boolean
    }>({ message: '', type: 'success', show: false })

    // Form states for different QR types
    const [formData, setFormData] = useState({
        // URL
        url: 'https://example.com',
        // Email
        email: 'john@example.com',
        emailSubject: 'Hello',
        emailBody: 'This is a test email',
        // Phone
        phoneNumber: '+1234567890',
        // SMS
        smsNumber: '+1234567890',
        smsMessage: 'Hello from QR Code!',
        // WiFi
        wifiSSID: 'MyNetwork',
        wifiPassword: 'MyPassword',
        wifiSecurity: 'WPA',
        wifiHidden: false,
        // Contact (vCard)
        contactName: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@example.com',
        contactOrg: 'Example Corp',
        contactUrl: 'https://johndoe.com',
        // Location
        latitude: '40.7128',
        longitude: '-74.0060',
        locationName: 'New York City',
        // Event
        eventTitle: 'Meeting',
        eventStart: '2024-12-31T10:00',
        eventEnd: '2024-12-31T11:00',
        eventLocation: 'Conference Room',
        eventDescription: 'Team meeting'
    })

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type, show: true })
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }))
        }, 3000)
    }, [])

    // Simple QR Code generation using a basic algorithm
    const generateQRCode = useCallback((text: string, options: QRCodeOptions): string => {
        // This is a simplified QR code generator for demonstration
        // In a real application, you would use a proper QR code library like 'qrcode'

        const size = options.size
        const modules = 25 // Simplified grid size
        const moduleSize = Math.floor(size / modules)
        const margin = options.margin * moduleSize
        const totalSize = size + (margin * 2)

        // Create a simple pattern based on the text
        const pattern: boolean[][] = []
        for (let i = 0; i < modules; i++) {
            pattern[i] = []
            for (let j = 0; j < modules; j++) {
                // Simple pattern generation (not actual QR algorithm)
                const charCode = text.charCodeAt((i * modules + j) % text.length)
                pattern[i][j] = ((i + j + charCode) % 3) === 0
            }
        }

        // Add finder patterns (corners)
        const addFinderPattern = (startRow: number, startCol: number) => {
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    if (startRow + i < modules && startCol + j < modules) {
                        const isEdge = i === 0 || i === 6 || j === 0 || j === 6
                        const isCenter = (i >= 2 && i <= 4) && (j >= 2 && j <= 4)
                        pattern[startRow + i][startCol + j] = isEdge || isCenter
                    }
                }
            }
        }

        addFinderPattern(0, 0) // Top-left
        addFinderPattern(0, modules - 7) // Top-right
        addFinderPattern(modules - 7, 0) // Bottom-left

        // Generate SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`

        // Background
        svg += `<rect width="${totalSize}" height="${totalSize}" fill="${options.colorLight}"/>`

        // QR modules
        for (let i = 0; i < modules; i++) {
            for (let j = 0; j < modules; j++) {
                if (pattern[i] && pattern[i][j]) {
                    const x = margin + j * moduleSize
                    const y = margin + i * moduleSize
                    svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${options.colorDark}"/>`
                }
            }
        }

        svg += '</svg>'
        return svg
    }, [])

    // Format data based on QR type
    const formatQRData = useCallback((type: string, data: any): string => {
        switch (type) {
            case 'url':
                return data.url
            case 'email':
                return `mailto:${data.email}?subject=${encodeURIComponent(data.emailSubject)}&body=${encodeURIComponent(data.emailBody)}`
            case 'phone':
                return `tel:${data.phoneNumber}`
            case 'sms':
                return `sms:${data.smsNumber}?body=${encodeURIComponent(data.smsMessage)}`
            case 'wifi':
                return `WIFI:T:${data.wifiSecurity};S:${data.wifiSSID};P:${data.wifiPassword};H:${data.wifiHidden ? 'true' : 'false'};;`
            case 'contact':
                return `BEGIN:VCARD
VERSION:3.0
FN:${data.contactName}
TEL:${data.contactPhone}
EMAIL:${data.contactEmail}
ORG:${data.contactOrg}
URL:${data.contactUrl}
END:VCARD`
            case 'location':
                return `geo:${data.latitude},${data.longitude}?q=${encodeURIComponent(data.locationName)}`
            case 'event':
                const startDate = new Date(data.eventStart).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                const endDate = new Date(data.eventEnd).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                return `BEGIN:VEVENT
SUMMARY:${data.eventTitle}
DTSTART:${startDate}
DTEND:${endDate}
LOCATION:${data.eventLocation}
DESCRIPTION:${data.eventDescription}
END:VEVENT`
            case 'text':
            default:
                return data.content || data
        }
    }, [])

    // Update QR code when data or options change
    useEffect(() => {
        const formattedContent = formatQRData(qrData.type, qrData.type === 'text' ? { content: qrData.content } : formData)
        const updatedQrData = {
            ...qrData,
            formatted: formattedContent
        }
        setQrData(updatedQrData)

        const svg = generateQRCode(formattedContent, qrOptions)
        setQrCodeSVG(svg)
    }, [qrData.content, qrData.type, formData, qrOptions, formatQRData, generateQRCode])

    // Download QR code
    const downloadQRCode = useCallback((format: 'svg' | 'png') => {
        if (format === 'svg') {
            const blob = new Blob([qrCodeSVG], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'qrcode.svg'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            showNotification('SVG downloaded successfully!', 'success')
        } else {
            // Convert SVG to PNG
            const canvas = canvasRef.current
            if (!canvas) return

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const img = new Image()
            const svgBlob = new Blob([qrCodeSVG], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(svgBlob)

            img.onload = () => {
                canvas.width = qrOptions.size + (qrOptions.margin * 8)
                canvas.height = qrOptions.size + (qrOptions.margin * 8)
                ctx.drawImage(img, 0, 0)

                canvas.toBlob((blob) => {
                    if (blob) {
                        const pngUrl = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = pngUrl
                        a.download = 'qrcode.png'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(pngUrl)
                        showNotification('PNG downloaded successfully!', 'success')
                    }
                }, 'image/png')

                URL.revokeObjectURL(url)
            }

            img.src = url
        }
    }, [qrCodeSVG, qrOptions, showNotification])

    // Copy QR data to clipboard
    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(qrData.formatted)
            showNotification('QR data copied to clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [qrData.formatted, showNotification])

    // Update form data
    const updateFormData = useCallback((key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }, [])

    // QR type configurations
    const qrTypes = [
        { id: 'text', label: 'Text', icon: MessageCircle, description: 'Plain text content' },
        { id: 'url', label: 'Website URL', icon: Globe, description: 'Web page link' },
        { id: 'email', label: 'Email', icon: Mail, description: 'Email address with subject' },
        { id: 'phone', label: 'Phone', icon: Phone, description: 'Phone number' },
        { id: 'sms', label: 'SMS', icon: MessageCircle, description: 'Text message' },
        { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'WiFi network credentials' },
        { id: 'contact', label: 'Contact', icon: User, description: 'vCard contact info' },
        { id: 'location', label: 'Location', icon: MapPin, description: 'GPS coordinates' },
        { id: 'event', label: 'Event', icon: Calendar, description: 'Calendar event' }
    ]

    // Load example data
    const loadExample = useCallback((example: string) => {
        const examples = {
            website: { type: 'url', url: 'https://github.com' },
            email: { type: 'email', email: 'contact@example.com', emailSubject: 'Hello!', emailBody: 'Thanks for scanning!' },
            wifi: { type: 'wifi', wifiSSID: 'GuestNetwork', wifiPassword: 'welcome123', wifiSecurity: 'WPA' },
            contact: { type: 'contact', contactName: 'John Smith', contactPhone: '+1-555-0123', contactEmail: 'john@company.com' },
            location: { type: 'location', latitude: '37.7749', longitude: '-122.4194', locationName: 'San Francisco, CA' }
        }

        const selectedExample = examples[example as keyof typeof examples]
        if (selectedExample) {
            setQrData(prev => ({ ...prev, type: selectedExample.type }))
            setFormData(prev => ({ ...prev, ...selectedExample }))
            showNotification(`${example.charAt(0).toUpperCase() + example.slice(1)} example loaded!`, 'success')
        }
    }, [showNotification])

    // Render form based on QR type
    const renderForm = () => {
        switch (qrData.type) {
            case 'text':
                return (
                    <textarea
                        value={qrData.content}
                        onChange={(e) => setQrData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full h-24 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter your text here..."
                    />
                )

            case 'url':
                return (
                    <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => updateFormData('url', e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="https://example.com"
                    />
                )

            case 'email':
                return (
                    <div className="space-y-3">
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="email@example.com"
                        />
                        <input
                            type="text"
                            value={formData.emailSubject}
                            onChange={(e) => updateFormData('emailSubject', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Email subject"
                        />
                        <textarea
                            value={formData.emailBody}
                            onChange={(e) => updateFormData('emailBody', e.target.value)}
                            className="w-full h-20 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Email message"
                        />
                    </div>
                )

            case 'phone':
                return (
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="+1234567890"
                    />
                )

            case 'sms':
                return (
                    <div className="space-y-3">
                        <input
                            type="tel"
                            value={formData.smsNumber}
                            onChange={(e) => updateFormData('smsNumber', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="+1234567890"
                        />
                        <textarea
                            value={formData.smsMessage}
                            onChange={(e) => updateFormData('smsMessage', e.target.value)}
                            className="w-full h-20 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="SMS message"
                        />
                    </div>
                )

            case 'wifi':
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={formData.wifiSSID}
                            onChange={(e) => updateFormData('wifiSSID', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Network name (SSID)"
                        />
                        <input
                            type="password"
                            value={formData.wifiPassword}
                            onChange={(e) => updateFormData('wifiPassword', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="WiFi password"
                        />
                        <select
                            value={formData.wifiSecurity}
                            onChange={(e) => updateFormData('wifiSecurity', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">No password</option>
                        </select>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.wifiHidden}
                                onChange={(e) => updateFormData('wifiHidden', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Hidden network</span>
                        </label>
                    </div>
                )

            case 'contact':
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={formData.contactName}
                            onChange={(e) => updateFormData('contactName', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Full name"
                        />
                        <input
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) => updateFormData('contactPhone', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Phone number"
                        />
                        <input
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => updateFormData('contactEmail', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Email address"
                        />
                        <input
                            type="text"
                            value={formData.contactOrg}
                            onChange={(e) => updateFormData('contactOrg', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Organization"
                        />
                        <input
                            type="url"
                            value={formData.contactUrl}
                            onChange={(e) => updateFormData('contactUrl', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Website URL"
                        />
                    </div>
                )

            case 'location':
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={formData.latitude}
                            onChange={(e) => updateFormData('latitude', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Latitude (e.g., 40.7128)"
                        />
                        <input
                            type="text"
                            value={formData.longitude}
                            onChange={(e) => updateFormData('longitude', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Longitude (e.g., -74.0060)"
                        />
                        <input
                            type="text"
                            value={formData.locationName}
                            onChange={(e) => updateFormData('locationName', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Location name"
                        />
                    </div>
                )

            case 'event':
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={formData.eventTitle}
                            onChange={(e) => updateFormData('eventTitle', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Event title"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="datetime-local"
                                value={formData.eventStart}
                                onChange={(e) => updateFormData('eventStart', e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <input
                                type="datetime-local"
                                value={formData.eventEnd}
                                onChange={(e) => updateFormData('eventEnd', e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <input
                            type="text"
                            value={formData.eventLocation}
                            onChange={(e) => updateFormData('eventLocation', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Event location"
                        />
                        <textarea
                            value={formData.eventDescription}
                            onChange={(e) => updateFormData('eventDescription', e.target.value)}
                            className="w-full h-20 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Event description"
                        />
                    </div>
                )

            default:
                return null
        }
    }

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
                        <QrCode className="inline-block w-10 h-10 mr-3" />
                        QR Code Generator
                    </h1>
                    <p className="text-lg text-white/90">
                        Generate QR codes for URLs, text, contacts, WiFi, and more
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                        {/* Left Panel - Configuration */}
                        <div className="p-6">
                            {/* QR Type Selection */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                    QR Code Type
                                </h3>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {qrTypes.map((type) => {
                                        const IconComponent = type.icon
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setQrData(prev => ({ ...prev, type: type.id }))}
                                                className={`p-3 rounded-lg border-2 transition-all duration-300 ${qrData.type === type.id
                                                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                                                    }`}
                                                title={type.description}
                                            >
                                                <IconComponent className="w-5 h-5 mx-auto mb-1" />
                                                <div className="text-xs font-medium">{type.label}</div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {qrTypes.find(t => t.id === qrData.type)?.label} Details
                                </h3>
                                {renderForm()}
                            </div>

                            {/* Options Toggle */}
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowOptions(!showOptions)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                >
                                    <Settings className="w-4 h-4" />
                                    {showOptions ? 'Hide Options' : 'Show Options'}
                                </button>
                            </div>

                            {/* Advanced Options */}
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Size: {qrOptions.size}px
                                        </label>
                                        <input
                                            type="range"
                                            min="128"
                                            max="512"
                                            step="32"
                                            value={qrOptions.size}
                                            onChange={(e) => setQrOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Error Correction Level
                                        </label>
                                        <select
                                            value={qrOptions.errorCorrectionLevel}
                                            onChange={(e) => setQrOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as any }))}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="L">Low (7%)</option>
                                            <option value="M">Medium (15%)</option>
                                            <option value="Q">Quartile (25%)</option>
                                            <option value="H">High (30%)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Dark Color
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={qrOptions.colorDark}
                                                    onChange={(e) => setQrOptions(prev => ({ ...prev, colorDark: e.target.value }))}
                                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={qrOptions.colorDark}
                                                    onChange={(e) => setQrOptions(prev => ({ ...prev, colorDark: e.target.value }))}
                                                    className="flex-1 p-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Light Color
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={qrOptions.colorLight}
                                                    onChange={(e) => setQrOptions(prev => ({ ...prev, colorLight: e.target.value }))}
                                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={qrOptions.colorLight}
                                                    onChange={(e) => setQrOptions(prev => ({ ...prev, colorLight: e.target.value }))}
                                                    className="flex-1 p-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Panel - QR Code Display */}
                        <div className="p-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                    Generated QR Code
                                </h3>

                                {/* QR Code Display */}
                                <div className="inline-block p-4 bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                                    <div
                                        dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
                                        className="flex items-center justify-center"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap justify-center gap-3 mb-6">
                                    <button
                                        onClick={() => downloadQRCode('png')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <Download className="w-4 h-4" />
                                        PNG
                                    </button>

                                    <button
                                        onClick={() => downloadQRCode('svg')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                    >
                                        <Download className="w-4 h-4" />
                                        SVG
                                    </button>

                                    <button
                                        onClick={copyToClipboard}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Data
                                    </button>
                                </div>

                                {/* QR Data Preview */}
                                <div className="text-left">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code Content:</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-600 break-all max-h-32 overflow-y-auto">
                                        {qrData.formatted}
                                    </div>
                                </div>
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
                        <BookOpen className="w-5 h-5" />
                        Quick Examples
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { id: 'website', label: 'Website URL', desc: 'GitHub repository link' },
                            { id: 'email', label: 'Email Contact', desc: 'Email with subject and body' },
                            { id: 'wifi', label: 'WiFi Network', desc: 'Guest network credentials' },
                            { id: 'contact', label: 'Business Card', desc: 'vCard contact information' },
                            { id: 'location', label: 'Location', desc: 'GPS coordinates and name' }
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
                            icon: Smartphone,
                            title: '9 Data Types',
                            description: 'Text, URL, Email, Phone, SMS, WiFi, Contact, Location, Event'
                        },
                        {
                            icon: Palette,
                            title: 'Customizable Design',
                            description: 'Adjust colors, size, and error correction levels'
                        },
                        {
                            icon: Download,
                            title: 'Multiple Formats',
                            description: 'Download as PNG or SVG for any use case'
                        },
                        {
                            icon: Share2,
                            title: 'Instant Generation',
                            description: 'Real-time QR code updates as you type'
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

            {/* Hidden canvas for PNG conversion */}
            <canvas ref={canvasRef} className="hidden" />

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