'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Palette,
    Copy,
    Clipboard,
    Trash2,
    Eye,
    Shuffle,
    Download,
    Upload,
    Pipette,
    Zap,
    BookOpen,
    Hash,
    Percent,
    Circle
} from 'lucide-react'

interface ColorFormats {
    hex: string
    rgb: { r: number; g: number; b: number }
    hsl: { h: number; s: number; l: number }
    hsv: { h: number; s: number; v: number }
    cmyk: { c: number; m: number; y: number; k: number }
    css: string
}

export default function ColorConverterPage() {
    const [currentColor, setCurrentColor] = useState('#3B82F6')
    const [savedColors, setSavedColors] = useState<string[]>([
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
    ])
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

    // Color conversion functions
    const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 }
    }, [])

    const rgbToHex = useCallback((r: number, g: number, b: number): string => {
        const toHex = (c: number) => {
            const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }, [])

    const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0, s = 0, l = (max + min) / 2

        if (max === min) {
            h = s = 0 // achromatic
        } else {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break
                case g: h = (b - r) / d + 2; break
                case b: h = (r - g) / d + 4; break
            }
            h /= 6
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        }
    }, [])

    const hslToRgb = useCallback((h: number, s: number, l: number): { r: number; g: number; b: number } => {
        h /= 360
        s /= 100
        l /= 100

        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        if (s === 0) {
            const gray = Math.round(l * 255)
            return { r: gray, g: gray, b: gray }
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        return {
            r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
        }
    }, [])

    const rgbToHsv = useCallback((r: number, g: number, b: number): { h: number; s: number; v: number } => {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0, s = 0, v = max

        const d = max - min
        s = max === 0 ? 0 : d / max

        if (max === min) {
            h = 0
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break
                case g: h = (b - r) / d + 2; break
                case b: h = (r - g) / d + 4; break
            }
            h /= 6
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        }
    }, [])

    const rgbToCmyk = useCallback((r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
        r /= 255
        g /= 255
        b /= 255

        const k = 1 - Math.max(r, g, b)
        const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
        const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
        const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        }
    }, [])

    const colorFormats = useMemo((): ColorFormats => {
        const rgb = hexToRgb(currentColor)
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)

        return {
            hex: currentColor.toUpperCase(),
            rgb,
            hsl,
            hsv,
            cmyk,
            css: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        }
    }, [currentColor, hexToRgb, rgbToHsl, rgbToHsv, rgbToCmyk])

    const updateColorFromInput = useCallback((format: string, value: string) => {
        try {
            let newColor = '#000000'

            if (format === 'hex') {
                if (/^#?[0-9A-F]{6}$/i.test(value)) {
                    newColor = value.startsWith('#') ? value : `#${value}`
                }
            } else if (format === 'rgb') {
                const match = value.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
                if (match) {
                    const r = parseInt(match[1])
                    const g = parseInt(match[2])
                    const b = parseInt(match[3])
                    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                        newColor = rgbToHex(r, g, b)
                    }
                }
            } else if (format === 'hsl') {
                const match = value.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/)
                if (match) {
                    const h = parseInt(match[1])
                    const s = parseInt(match[2])
                    const l = parseInt(match[3])
                    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
                        const rgb = hslToRgb(h, s, l)
                        newColor = rgbToHex(rgb.r, rgb.g, rgb.b)
                    }
                }
            }

            setCurrentColor(newColor)
        } catch (error) {
            // Invalid color format, ignore
        }
    }, [rgbToHex, hslToRgb])

    const copyToClipboard = useCallback(async (text: string, format: string) => {
        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${format} copied to clipboard!`, 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [showNotification])

    const pasteFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text.startsWith('#') && text.length === 7) {
                setCurrentColor(text)
                showNotification('Color pasted from clipboard!', 'success')
            } else {
                showNotification('Invalid color format', 'error')
            }
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    const generateRandomColor = useCallback(() => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        setCurrentColor(randomColor)
        showNotification('Random color generated!', 'success')
    }, [showNotification])

    const saveCurrentColor = useCallback(() => {
        if (!savedColors.includes(currentColor)) {
            setSavedColors(prev => [...prev, currentColor])
            showNotification('Color saved to palette!', 'success')
        } else {
            showNotification('Color already in palette', 'error')
        }
    }, [currentColor, savedColors, showNotification])

    const removeFromPalette = useCallback((color: string) => {
        setSavedColors(prev => prev.filter(c => c !== color))
        showNotification('Color removed from palette', 'success')
    }, [showNotification])

    const loadExample = useCallback((example: string) => {
        const examples = {
            primary: '#3B82F6',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            purple: '#8B5CF6',
            pink: '#EC4899',
            indigo: '#6366F1',
            teal: '#14B8A6'
        }

        const color = examples[example as keyof typeof examples]
        if (color) {
            setCurrentColor(color)
            showNotification(`${example.charAt(0).toUpperCase() + example.slice(1)} color loaded!`, 'success')
        }
    }, [showNotification])

    const exportPalette = useCallback(() => {
        const paletteData = {
            colors: savedColors,
            formats: savedColors.map(color => {
                const rgb = hexToRgb(color)
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
                return {
                    hex: color,
                    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                }
            }),
            exported: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'color-palette.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('Palette exported successfully!', 'success')
    }, [savedColors, hexToRgb, rgbToHsl, showNotification])

    const getContrastColor = useCallback((hexColor: string): string => {
        const rgb = hexToRgb(hexColor)
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
        return brightness > 128 ? '#000000' : '#FFFFFF'
    }, [hexToRgb])

    const getColorName = useCallback((hexColor: string): string => {
        const colorNames: { [key: string]: string } = {
            '#FF0000': 'Red',
            '#00FF00': 'Green',
            '#0000FF': 'Blue',
            '#FFFF00': 'Yellow',
            '#FF00FF': 'Magenta',
            '#00FFFF': 'Cyan',
            '#FFFFFF': 'White',
            '#000000': 'Black',
            '#808080': 'Gray',
            '#FFA500': 'Orange',
            '#800080': 'Purple',
            '#FFC0CB': 'Pink'
        }

        return colorNames[hexColor.toUpperCase()] || 'Custom Color'
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
                        <Palette className="inline-block w-10 h-10 mr-3" />
                        Color Converter
                    </h1>
                    <p className="text-lg text-white/90">
                        Convert between HEX, RGB, HSL, HSV, and CMYK color formats
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Color Preview */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                <div
                                    className="w-32 h-32 rounded-2xl shadow-lg border-4 border-white"
                                    style={{ backgroundColor: currentColor }}
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl flex items-center justify-center text-lg font-bold"
                                    style={{ color: getContrastColor(currentColor) }}
                                >
                                    {currentColor}
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {getColorName(currentColor)}
                            </h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={generateRandomColor}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    Random
                                </button>

                                <button
                                    onClick={pasteFromClipboard}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Clipboard className="w-4 h-4" />
                                    Paste
                                </button>

                                <button
                                    onClick={saveCurrentColor}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Circle className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Pipette className="w-5 h-5 text-gray-500" />
                            <h3 className="text-lg font-semibold text-gray-800">Color Picker</h3>
                        </div>

                        <div className="flex items-center justify-center">
                            <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => setCurrentColor(e.target.value)}
                                className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Color Formats */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" />
                                Color Formats
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* HEX */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">HEX</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(colorFormats.hex, 'HEX')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={colorFormats.hex}
                                    onChange={(e) => updateColorFromInput('hex', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* RGB */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">RGB</span>
                                    <button
                                        onClick={() => copyToClipboard(colorFormats.css, 'RGB')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={colorFormats.css}
                                    onChange={(e) => updateColorFromInput('rgb', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:border-blue-500"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    R: {colorFormats.rgb.r} G: {colorFormats.rgb.g} B: {colorFormats.rgb.b}
                                </div>
                            </div>

                            {/* HSL */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">HSL</span>
                                    <button
                                        onClick={() => copyToClipboard(`hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, ${colorFormats.hsl.l}%)`, 'HSL')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={`hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, ${colorFormats.hsl.l}%)`}
                                    onChange={(e) => updateColorFromInput('hsl', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:border-blue-500"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    H: {colorFormats.hsl.h}° S: {colorFormats.hsl.s}% L: {colorFormats.hsl.l}%
                                </div>
                            </div>

                            {/* HSV */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">HSV</span>
                                    <button
                                        onClick={() => copyToClipboard(`hsv(${colorFormats.hsv.h}, ${colorFormats.hsv.s}%, ${colorFormats.hsv.v}%)`, 'HSV')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="text-sm font-mono text-gray-700 p-2 bg-white border border-gray-300 rounded">
                                    hsv({colorFormats.hsv.h}, {colorFormats.hsv.s}%, {colorFormats.hsv.v}%)
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    H: {colorFormats.hsv.h}° S: {colorFormats.hsv.s}% V: {colorFormats.hsv.v}%
                                </div>
                            </div>

                            {/* CMYK */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">CMYK</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`cmyk(${colorFormats.cmyk.c}%, ${colorFormats.cmyk.m}%, ${colorFormats.cmyk.y}%, ${colorFormats.cmyk.k}%)`, 'CMYK')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="text-sm font-mono text-gray-700 p-2 bg-white border border-gray-300 rounded">
                                    cmyk({colorFormats.cmyk.c}%, {colorFormats.cmyk.m}%, {colorFormats.cmyk.y}%, {colorFormats.cmyk.k}%)
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    C: {colorFormats.cmyk.c}% M: {colorFormats.cmyk.m}% Y: {colorFormats.cmyk.y}% K: {colorFormats.cmyk.k}%
                                </div>
                            </div>

                            {/* CSS Variables */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">CSS Variable</span>
                                    <button
                                        onClick={() => copyToClipboard(`--color-primary: ${colorFormats.hex};`, 'CSS Variable')}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                                <div className="text-sm font-mono text-gray-700 p-2 bg-white border border-gray-300 rounded">
                                    --color-primary: {colorFormats.hex};
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Ready for CSS custom properties
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Colors Palette */}
                    <div className="p-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-500" />
                                Color Palette ({savedColors.length})
                            </h3>
                            <button
                                onClick={exportPalette}
                                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                            >
                                <Download className="w-3 h-3" />
                                Export
                            </button>
                        </div>

                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                            {savedColors.map((color, index) => (
                                <div
                                    key={index}
                                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                    onClick={() => setCurrentColor(color)}
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeFromPalette(color)
                                        }}
                                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {color}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Colors */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Quick Colors
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {[
                            { id: 'primary', color: '#3B82F6', name: 'Primary Blue' },
                            { id: 'success', color: '#10B981', name: 'Success Green' },
                            { id: 'warning', color: '#F59E0B', name: 'Warning Orange' },
                            { id: 'danger', color: '#EF4444', name: 'Danger Red' },
                            { id: 'purple', color: '#8B5CF6', name: 'Purple' },
                            { id: 'pink', color: '#EC4899', name: 'Pink' },
                            { id: 'indigo', color: '#6366F1', name: 'Indigo' },
                            { id: 'teal', color: '#14B8A6', name: 'Teal' }
                        ].map((example) => (
                            <button
                                key={example.id}
                                onClick={() => loadExample(example.id)}
                                className="flex flex-col items-center p-4 bg-white/90 hover:bg-white rounded-xl border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div
                                    className="w-12 h-12 rounded-lg mb-2 shadow-md"
                                    style={{ backgroundColor: example.color }}
                                />
                                <div className="text-sm font-medium text-gray-800 text-center">{example.name}</div>
                                <div className="text-xs text-gray-600 font-mono">{example.color}</div>
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
                            icon: Palette,
                            title: 'Multiple Formats',
                            description: 'Convert between HEX, RGB, HSL, HSV, and CMYK'
                        },
                        {
                            icon: Eye,
                            title: 'Live Preview',
                            description: 'See your colors in real-time with instant feedback'
                        },
                        {
                            icon: Circle,
                            title: 'Color Palette',
                            description: 'Save and manage your favorite colors'
                        },
                        {
                            icon: Download,
                            title: 'Export & Share',
                            description: 'Export color palettes and share with your team'
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