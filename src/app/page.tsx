'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Code, Shuffle, Globe, Palette, Database } from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  href: string
}

interface Category {
  id: string
  name: string
  icon: any
  color: string
  tools: Tool[]
}

const categories: Category[] = [
  {
    id: 'text',
    name: 'Text & Code Utilities',
    icon: Code,
    color: 'from-blue-500 to-purple-600',
    tools: [
      {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format, validate, and beautify JSON data with syntax highlighting',
        href: '/tools/json-formatter'
      },
      {
        id: 'base64-encoder',
        name: 'Base64 Encoder/Decoder',
        description: 'Encode and decode Base64 strings quickly and easily',
        href: '/tools/base64-encoder'
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder/Decoder',
        description: 'Encode and decode URLs for safe transmission',
        href: '/tools/url-encoder'
      },
      {
        id: 'regex-tester',
        name: 'Regex Tester',
        description: 'Test and debug regular expressions with live matching',
        href: '/tools/regex-tester'
      },
      {
        id: 'markdown-preview',
        name: 'Markdown Preview',
        description: 'Write and preview Markdown in real-time',
        href: '/tools/markdown-preview'
      },
      {
        id: 'text-diff',
        name: 'Text Diff',
        description: 'Compare two texts and highlight differences',
        href: '/tools/text-diff'
      }
    ]
  },
  {
    id: 'conversion',
    name: 'Converters & Generators',
    icon: Shuffle,
    color: 'from-green-500 to-teal-600',
    tools: [
      {
        id: 'color-converter',
        name: 'Color Converter',
        description: 'Convert between HEX, RGB, HSL, and other color formats',
        href: '/tools/color-converter'
      },
      {
        id: 'timestamp-converter',
        name: 'Timestamp Converter',
        description: 'Convert between Unix timestamps and human-readable dates',
        href: '/tools/timestamp-converter'
      },
      {
        id: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate unique identifiers (UUID/GUID) in various formats',
        href: '/tools/uuid-generator'
      },
      {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure passwords with customizable criteria',
        href: '/tools/password-generator'
      },
      {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate MD5, SHA-1, SHA-256, and other hash values',
        href: '/tools/hash-generator'
      },
      {
        id: 'qr-generator',
        name: 'QR Code Generator',
        description: 'Generate QR codes for URLs, text, and other data',
        href: '/tools/qr-generator'
      }
    ]
  },
  {
    id: 'network',
    name: 'Network & Web Tools',
    icon: Globe,
    color: 'from-orange-500 to-red-600',
    tools: [
      {
        id: 'http-client',
        name: 'HTTP Client',
        description: 'Test APIs and make HTTP requests with custom headers',
        href: '/tools/http-client'
      },
      {
        id: 'dns-lookup',
        name: 'DNS Lookup',
        description: 'Query DNS records and troubleshoot domain issues',
        href: '/tools/dns-lookup'
      },
      {
        id: 'ip-info',
        name: 'IP Address Info',
        description: 'Get detailed information about IP addresses and locations',
        href: '/tools/ip-info'
      },
      {
        id: 'port-scanner',
        name: 'Port Scanner',
        description: 'Check if specific ports are open on a host',
        href: '/tools/port-scanner'
      },
      {
        id: 'ssl-checker',
        name: 'SSL Certificate Checker',
        description: 'Validate SSL certificates and check expiration dates',
        href: '/tools/ssl-checker'
      },
      {
        id: 'whois-lookup',
        name: 'WHOIS Lookup',
        description: 'Get domain registration and ownership information',
        href: '/tools/whois-lookup'
      }
    ]
  },
  {
    id: 'image',
    name: 'Image & Media Tools',
    icon: Palette,
    color: 'from-pink-500 to-purple-600',
    tools: [
      {
        id: 'image-optimizer',
        name: 'Image Optimizer',
        description: 'Compress and optimize images for web performance',
        href: '/tools/image-optimizer'
      },
      {
        id: 'image-converter',
        name: 'Image Converter',
        description: 'Convert between different image formats (PNG, JPG, WebP)',
        href: '/tools/image-converter'
      },
      {
        id: 'svg-optimizer',
        name: 'SVG Optimizer',
        description: 'Minify and optimize SVG files for better performance',
        href: '/tools/svg-optimizer'
      },
      {
        id: 'favicon-generator',
        name: 'Favicon Generator',
        description: 'Generate favicons in multiple sizes and formats',
        href: '/tools/favicon-generator'
      },
      {
        id: 'color-palette',
        name: 'Color Palette Generator',
        description: 'Create beautiful color palettes for your projects',
        href: '/tools/color-palette'
      },
      {
        id: 'placeholder-generator',
        name: 'Placeholder Image Generator',
        description: 'Generate placeholder images for mockups and prototypes',
        href: '/tools/placeholder-generator'
      }
    ]
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    icon: Database,
    color: 'from-indigo-500 to-blue-600',
    tools: [
      {
        id: 'csv-viewer',
        name: 'CSV Viewer/Editor',
        description: 'View, edit, and manipulate CSV files in a table format',
        href: '/tools/csv-viewer'
      },
      {
        id: 'json-csv-converter',
        name: 'JSON to CSV Converter',
        description: 'Convert JSON data to CSV format and vice versa',
        href: '/tools/json-csv-converter'
      },
      {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        description: 'Format and beautify SQL queries for better readability',
        href: '/tools/sql-formatter'
      },
      {
        id: 'data-generator',
        name: 'Mock Data Generator',
        description: 'Generate realistic test data for development and testing',
        href: '/tools/data-generator'
      },
      {
        id: 'xml-formatter',
        name: 'XML Formatter',
        description: 'Format, validate, and beautify XML documents',
        href: '/tools/xml-formatter'
      },
      {
        id: 'yaml-converter',
        name: 'YAML Converter',
        description: 'Convert between YAML and JSON formats',
        href: '/tools/yaml-converter'
      }
    ]
  }
]

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.tools.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🛠️ Dev Tools Hub
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Your one-stop destination for essential development tools
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-0 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-800 placeholder-gray-500"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
              >
                {/* Category Header */}
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 ml-4">
                    {category.name}
                  </h2>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool, toolIndex) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (toolIndex * 0.05) }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={tool.href}>
                        <div className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl p-4 border-2 border-transparent hover:border-blue-200 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden">
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* No Results */}
        {searchTerm && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-white/70 text-lg">
              No tools found matching "{searchTerm}"
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}