'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Shield,
    Copy,
    RefreshCw,
    Eye,
    EyeOff,
    Settings,
    Zap,
    AlertTriangle,
    CheckCircle,
    Lock,
    Download,
    Trash2,
    BookOpen,
    Key,
    Hash,
    AtSign,
    Percent
} from 'lucide-react'

interface PasswordCriteria {
    length: number
    includeUppercase: boolean
    includeLowercase: boolean
    includeNumbers: boolean
    includeSymbols: boolean
    excludeSimilar: boolean
    excludeAmbiguous: boolean
    requireEach: boolean
}

interface PasswordStrength {
    score: number
    level: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
    color: string
    feedback: string[]
}

export default function PasswordGeneratorPage() {
    const [generatedPassword, setGeneratedPassword] = useState('')
    const [showPassword, setShowPassword] = useState(true)
    const [criteria, setCriteria] = useState<PasswordCriteria>({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: true,
        excludeAmbiguous: false,
        requireEach: true
    })
    const [savedPasswords, setSavedPasswords] = useState<Array<{
        password: string
        label: string
        created: Date
        strength: PasswordStrength
    }>>([])
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

    // Character sets
    const characterSets = {
        uppercase: 'ABCDEFGHIJKLMNPQRSTUVWXYZ',
        lowercase: 'abcdefghijkmnpqrstuvwxyz',
        numbers: '23456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        similar: 'il1Lo0O', // Characters that look similar
        ambiguous: '{}[]()/\\\'"`~,;.<>' // Characters that might be ambiguous
    }

    const generatePassword = useCallback(() => {
        let charset = ''
        let requiredChars = ''

        // Build character set based on criteria
        if (criteria.includeUppercase) {
            const chars = criteria.excludeSimilar
                ? characterSets.uppercase.replace(/[il1Lo0O]/g, '')
                : characterSets.uppercase
            charset += chars
            if (criteria.requireEach) requiredChars += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        if (criteria.includeLowercase) {
            const chars = criteria.excludeSimilar
                ? characterSets.lowercase.replace(/[il1Lo0O]/g, '')
                : characterSets.lowercase
            charset += chars
            if (criteria.requireEach) requiredChars += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        if (criteria.includeNumbers) {
            const chars = criteria.excludeSimilar
                ? characterSets.numbers.replace(/[il1Lo0O]/g, '')
                : characterSets.numbers
            charset += chars
            if (criteria.requireEach) requiredChars += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        if (criteria.includeSymbols) {
            let chars = characterSets.symbols
            if (criteria.excludeAmbiguous) {
                chars = chars.replace(/[{}[\]()/\\'""`~,;.<>]/g, '')
            }
            charset += chars
            if (criteria.requireEach) requiredChars += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        if (charset === '') {
            showNotification('Please select at least one character type', 'error')
            return
        }

        // Generate password
        let password = requiredChars
        const remainingLength = criteria.length - requiredChars.length

        for (let i = 0; i < remainingLength; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length))
        }

        // Shuffle the password to avoid predictable patterns
        password = password.split('').sort(() => Math.random() - 0.5).join('')

        setGeneratedPassword(password)
        showNotification('Password generated successfully!', 'success')
    }, [criteria, showNotification])

    // Password strength analysis
    const analyzePasswordStrength = useCallback((password: string): PasswordStrength => {
        if (!password) {
            return {
                score: 0,
                level: 'Very Weak',
                color: 'text-gray-400',
                feedback: ['No password generated']
            }
        }

        let score = 0
        const feedback: string[] = []

        // Length analysis
        if (password.length >= 12) score += 25
        else if (password.length >= 8) score += 15
        else if (password.length >= 6) score += 10
        else feedback.push('Password is too short')

        // Character variety
        if (/[a-z]/.test(password)) score += 5
        else feedback.push('Add lowercase letters')

        if (/[A-Z]/.test(password)) score += 5
        else feedback.push('Add uppercase letters')

        if (/[0-9]/.test(password)) score += 5
        else feedback.push('Add numbers')

        if (/[^A-Za-z0-9]/.test(password)) score += 10
        else feedback.push('Add special characters')

        // Advanced patterns
        if (password.length >= 16) score += 10
        if (password.length >= 20) score += 15

        // Check for common patterns (penalty)
        if (/(.)\1{2,}/.test(password)) {
            score -= 10
            feedback.push('Avoid repeating characters')
        }

        if (/123|abc|qwe/i.test(password)) {
            score -= 15
            feedback.push('Avoid common sequences')
        }

        // Determine level and color
        let level: PasswordStrength['level'], color: string

        if (score >= 85) {
            level = 'Very Strong'
            color = 'text-green-600'
            feedback.length === 0 && feedback.push('Excellent password!')
        } else if (score >= 70) {
            level = 'Strong'
            color = 'text-green-500'
            feedback.length === 0 && feedback.push('Strong password')
        } else if (score >= 50) {
            level = 'Good'
            color = 'text-blue-500'
        } else if (score >= 30) {
            level = 'Fair'
            color = 'text-yellow-500'
        } else if (score >= 15) {
            level = 'Weak'
            color = 'text-orange-500'
        } else {
            level = 'Very Weak'
            color = 'text-red-500'
        }

        return { score: Math.max(0, Math.min(100, score)), level, color, feedback }
    }, [])

    const passwordStrength = useMemo(() => {
        return analyzePasswordStrength(generatedPassword)
    }, [generatedPassword, analyzePasswordStrength])

    const copyToClipboard = useCallback(async (text: string) => {
        if (!text) {
            showNotification('No password to copy', 'error')
            return
        }

        try {
            await navigator.clipboard.writeText(text)
            showNotification('Password copied to clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to copy password', 'error')
        }
    }, [showNotification])

    const savePassword = useCallback(() => {
        if (!generatedPassword) {
            showNotification('No password to save', 'error')
            return
        }

        const label = prompt('Enter a label for this password:')
        if (label) {
            const newSavedPassword = {
                password: generatedPassword,
                label,
                created: new Date(),
                strength: passwordStrength
            }
            setSavedPasswords(prev => [...prev, newSavedPassword])
            showNotification('Password saved!', 'success')
        }
    }, [generatedPassword, passwordStrength, showNotification])

    const removeSavedPassword = useCallback((index: number) => {
        setSavedPasswords(prev => prev.filter((_, i) => i !== index))
        showNotification('Password removed!', 'success')
    }, [showNotification])

    const updateCriteria = useCallback((key: keyof PasswordCriteria, value: any) => {
        setCriteria(prev => ({ ...prev, [key]: value }))
    }, [])

    const loadPreset = useCallback((preset: string) => {
        const presets: { [key: string]: Partial<PasswordCriteria> } = {
            strong: {
                length: 16,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: true,
                excludeAmbiguous: false,
                requireEach: true
            },
            complex: {
                length: 24,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: true,
                excludeAmbiguous: true,
                requireEach: true
            },
            simple: {
                length: 12,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: false,
                excludeSimilar: true,
                excludeAmbiguous: false,
                requireEach: true
            },
            pin: {
                length: 6,
                includeUppercase: false,
                includeLowercase: false,
                includeNumbers: true,
                includeSymbols: false,
                excludeSimilar: false,
                excludeAmbiguous: false,
                requireEach: false
            }
        }

        const selectedPreset = presets[preset]
        if (selectedPreset) {
            setCriteria(prev => ({ ...prev, ...selectedPreset }))
            showNotification(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset loaded!`, 'success')
        }
    }, [showNotification])

    const exportPasswords = useCallback(() => {
        if (savedPasswords.length === 0) {
            showNotification('No saved passwords to export', 'error')
            return
        }

        const exportData = {
            passwords: savedPasswords.map(p => ({
                label: p.label,
                created: p.created.toISOString(),
                strength: p.strength.level,
                // Note: In a real app, you wouldn't export actual passwords for security
                passwordLength: p.password.length
            })),
            exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'password-history.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Password history exported!', 'success')
    }, [savedPasswords, showNotification])

    const clearAllSaved = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all saved passwords?')) {
            setSavedPasswords([])
            showNotification('All saved passwords cleared', 'success')
        }
    }, [showNotification])

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
                        <Shield className="inline-block w-10 h-10 mr-3" />
                        Password Generator
                    </h1>
                    <p className="text-lg text-white/90">
                        Generate secure passwords with customizable criteria and strength analysis
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Generated Password Display */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="relative flex-1 max-w-2xl">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={generatedPassword}
                                        readOnly
                                        className="w-full p-4 pr-24 border-2 border-gray-300 rounded-lg font-mono text-lg text-center bg-white focus:outline-none focus:border-blue-500"
                                        placeholder="Click 'Generate Password' to create a secure password"
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(generatedPassword)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            title="Copy password"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Strength */}
                            {generatedPassword && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-center gap-4 mb-2">
                                        <span className="text-sm font-medium text-gray-600">Strength:</span>
                                        <span className={`font-bold ${passwordStrength.color}`}>
                                            {passwordStrength.level}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({passwordStrength.score}/100)
                                        </span>
                                    </div>

                                    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 mb-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${passwordStrength.score >= 85 ? 'bg-green-500' :
                                                    passwordStrength.score >= 70 ? 'bg-green-400' :
                                                        passwordStrength.score >= 50 ? 'bg-blue-400' :
                                                            passwordStrength.score >= 30 ? 'bg-yellow-400' :
                                                                passwordStrength.score >= 15 ? 'bg-orange-400' : 'bg-red-400'
                                                }`}
                                            style={{ width: `${passwordStrength.score}%` }}
                                        />
                                    </div>

                                    {passwordStrength.feedback.length > 0 && (
                                        <div className="text-xs text-gray-600 max-w-md mx-auto">
                                            {passwordStrength.feedback.join(' • ')}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap justify-center gap-3">
                                <button
                                    onClick={generatePassword}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Zap className="w-5 h-5" />
                                    Generate Password
                                </button>

                                <button
                                    onClick={() => generatePassword()}
                                    className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Regenerate
                                </button>

                                <button
                                    onClick={savePassword}
                                    className="inline-flex items-center gap-2 px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Lock className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Password Criteria */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-500" />
                                Password Criteria
                            </h3>

                            {/* Preset Buttons */}
                            <div className="flex gap-2">
                                {['strong', 'complex', 'simple', 'pin'].map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => loadPreset(preset)}
                                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                    >
                                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Length */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password Length: {criteria.length}
                                </label>
                                <input
                                    type="range"
                                    min="6"
                                    max="50"
                                    value={criteria.length}
                                    onChange={(e) => updateCriteria('length', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>6</span>
                                    <span>50</span>
                                </div>
                            </div>

                            {/* Character Types */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Character Types
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.includeUppercase}
                                            onChange={(e) => updateCriteria('includeUppercase', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                            Uppercase (A-Z)
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.includeLowercase}
                                            onChange={(e) => updateCriteria('includeLowercase', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Lowercase (a-z)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.includeNumbers}
                                            onChange={(e) => updateCriteria('includeNumbers', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            Numbers (0-9)
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.includeSymbols}
                                            onChange={(e) => updateCriteria('includeSymbols', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                            <Percent className="w-3 h-3" />
                                            Symbols (!@#$...)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Advanced Options
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.excludeSimilar}
                                            onChange={(e) => updateCriteria('excludeSimilar', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Exclude similar (il1Lo0O)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.excludeAmbiguous}
                                            onChange={(e) => updateCriteria('excludeAmbiguous', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Exclude ambiguous ({ }[]...)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria.requireEach}
                                            onChange={(e) => updateCriteria('requireEach', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Require each type</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Passwords */}
                    {savedPasswords.length > 0 && (
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-blue-500" />
                                    Saved Passwords ({savedPasswords.length})
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={exportPasswords}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                                    >
                                        <Download className="w-3 h-3" />
                                        Export
                                    </button>
                                    <button
                                        onClick={clearAllSaved}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-300"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                                {savedPasswords.map((saved, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-800 truncate">{saved.label}</div>
                                            <div className="text-sm text-gray-600 font-mono truncate">
                                                {'•'.repeat(saved.password.length)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs font-medium ${saved.strength.color}`}>
                                                    {saved.strength.level}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {saved.created.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-2">
                                            <button
                                                onClick={() => copyToClipboard(saved.password)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Copy password"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeSavedPassword(index)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Remove password"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Security Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Password Security Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            {
                                icon: CheckCircle,
                                title: 'Use Long Passwords',
                                desc: 'Aim for at least 12-16 characters for better security',
                                color: 'text-green-500'
                            },
                            {
                                icon: Shield,
                                title: 'Mix Character Types',
                                desc: 'Include uppercase, lowercase, numbers, and symbols',
                                color: 'text-blue-500'
                            },
                            {
                                icon: AlertTriangle,
                                title: 'Avoid Personal Info',
                                desc: 'Don\'t use birthdays, names, or personal information',
                                color: 'text-yellow-500'
                            },
                            {
                                icon: RefreshCw,
                                title: 'Change Regularly',
                                desc: 'Update passwords periodically, especially for important accounts',
                                color: 'text-purple-500'
                            },
                            {
                                icon: Lock,
                                title: 'Use Unique Passwords',
                                desc: 'Never reuse passwords across multiple accounts',
                                color: 'text-red-500'
                            },
                            {
                                icon: Eye,
                                title: 'Enable 2FA',
                                desc: 'Add two-factor authentication for extra security',
                                color: 'text-indigo-500'
                            }
                        ].map((tip, index) => (
                            <div
                                key={index}
                                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/95 transition-all duration-300"
                            >
                                <tip.icon className={`w-8 h-8 ${tip.color} mb-3`} />
                                <h3 className="font-semibold text-gray-800 mb-2">{tip.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
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