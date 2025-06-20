'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    FileText,
    Copy,
    Clipboard,
    Trash2,
    Eye,
    EyeOff,
    Download,
    Upload,
    Columns,
    Maximize2,
    BookOpen,
    Code,
    List,
    Image,
    Link as LinkIcon,
    Hash
} from 'lucide-react'

export default function MarkdownPreviewPage() {
    const [markdown, setMarkdown] = useState(`# Welcome to Markdown Preview! 🎉

This is a **powerful** markdown editor with _live preview_ and syntax highlighting.

## Features

- ✅ Real-time preview
- ✅ Syntax highlighting
- ✅ Export to HTML
- ✅ Copy/paste support
- ✅ Responsive design

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to our markdown editor!\`;
}

greet('Developer');
\`\`\`

### Tables

| Feature | Status | Description |
|---------|--------|-------------|
| Preview | ✅ | Live markdown preview |
| Export | ✅ | Download as HTML |
| Syntax | ✅ | Code highlighting |

### Lists

#### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List
1. First step
2. Second step
3. Third step

### Links and Images

Check out [Markdown Guide](https://www.markdownguide.org/) for more syntax examples.

> **Note:** This is a blockquote example. Perfect for highlighting important information!

### Horizontal Rule

---

**Happy writing!** 📝`)

    const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
    const [wordCount, setWordCount] = useState(0)
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

    // Simple markdown to HTML converter
    const convertMarkdownToHtml = useCallback((md: string): string => {
        let html = md
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/__(.*)/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/_(.*)/gim, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
            // Strikethrough
            .replace(/~~(.*?)~~/gim, '<del>$1</del>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            // Horizontal rules
            .replace(/^---$/gim, '<hr>')
            .replace(/^\*\*\*$/gim, '<hr>')
            // Unordered lists
            .replace(/^\s*[\*\-\+]\s+(.*)$/gim, '<li>$1</li>')
            // Ordered lists
            .replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n/gim, '<br>')

        // Wrap consecutive <li> elements in <ul> or <ol>
        html = html.replace(/(<li>.*<\/li>)/gim, (match) => {
            if (match.includes('1.') || match.includes('2.') || match.includes('3.')) {
                return `<ol>${match}</ol>`
            }
            return `<ul>${match}</ul>`
        })

        // Clean up multiple <br> tags
        html = html.replace(/(<br>\s*){2,}/gim, '<br><br>')

        return html
    }, [])

    const htmlPreview = useMemo(() => {
        return convertMarkdownToHtml(markdown)
    }, [markdown, convertMarkdownToHtml])

    // Update word count when markdown changes
    useMemo(() => {
        const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0
        setWordCount(words)
    }, [markdown])

    const handleMarkdownChange = useCallback((value: string) => {
        setMarkdown(value)
    }, [])

    const copyToClipboard = useCallback(async (text: string, type: string) => {
        if (!text.trim()) {
            showNotification('Nothing to copy', 'error')
            return
        }

        try {
            await navigator.clipboard.writeText(text)
            showNotification(`${type} copied to clipboard!`, 'success')
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }, [showNotification])

    const pasteFromClipboard = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText()
            setMarkdown(text)
            showNotification('Pasted from clipboard!', 'success')
        } catch (error) {
            showNotification('Failed to paste from clipboard', 'error')
        }
    }, [showNotification])

    const downloadAsHtml = useCallback(() => {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #2d3748;
        }
        h1 { font-size: 2.5rem; }
        h2 { font-size: 2rem; }
        h3 { font-size: 1.5rem; }
        code {
            background: #f7fafc;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: monospace;
            border: 1px solid #e2e8f0;
        }
        pre {
            background: #f7fafc;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
        }
        pre code {
            background: none;
            border: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #3182ce;
            padding-left: 1rem;
            margin-left: 0;
            font-style: italic;
            color: #4a5568;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #e2e8f0;
            padding: 0.75rem;
            text-align: left;
        }
        th {
            background: #f7fafc;
            font-weight: 600;
        }
        ul, ol {
            padding-left: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
        }
        a {
            color: #3182ce;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        hr {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 2rem 0;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
        }
    </style>
</head>
<body>
    ${htmlPreview}
</body>
</html>`

        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'markdown-export.html'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showNotification('HTML file downloaded!', 'success')
    }, [htmlPreview, showNotification])

    const loadExample = useCallback((example: string) => {
        const examples = {
            basic: `# Basic Markdown Example

This is a **basic** markdown document with _essential_ formatting.

## Lists and Links

- [Google](https://google.com)
- [GitHub](https://github.com)
- [Markdown Guide](https://markdownguide.org)

### Code Example

\`\`\`python
def hello_world():
    print("Hello, World!")
    return True
\`\`\`

> Remember: Keep it simple and readable!`,

            documentation: `# Project Documentation

## Overview

This project demonstrates advanced markdown features for technical documentation.

## Installation

\`\`\`bash
npm install my-awesome-package
cd my-awesome-package
npm start
\`\`\`

## API Reference

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| \`init()\` | \`config: Object\` | \`Promise<void>\` | Initialize the application |
| \`getData()\` | \`id: string\` | \`Object\` | Retrieve data by ID |
| \`update()\` | \`data: Object\` | \`boolean\` | Update existing data |

### Configuration

\`\`\`json
{
  "apiUrl": "https://api.example.com",
  "timeout": 5000,
  "retries": 3
}
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Note:** Always test your changes before submitting!`,

            article: `# The Future of Web Development

*Published on January 2025*

The landscape of web development continues to evolve at an unprecedented pace. In this article, we'll explore the trends shaping the future of how we build for the web.

## Key Trends

### 1. Component-First Architecture

Modern frameworks like **React**, **Vue**, and **Svelte** have established component-based development as the standard approach.

\`\`\`jsx
function WelcomeCard({ name, role }) {
  return (
    <div className="card">
      <h2>Welcome, {name}!</h2>
      <p>Role: {role}</p>
    </div>
  );
}
\`\`\`

### 2. Performance Optimization

> "Speed is not just a feature, it's a requirement" - Unknown Developer

Key metrics to focus on:
- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**

### 3. Developer Experience

Tools that improve developer productivity:

- ✅ Hot Module Replacement
- ✅ TypeScript Integration  
- ✅ Automated Testing
- ✅ Code Splitting

## Conclusion

The future of web development is bright, with tools and techniques that prioritize both developer experience and user satisfaction.

---

*What do you think? Share your thoughts on social media!*`
        }

        const selectedExample = examples[example as keyof typeof examples]
        if (selectedExample) {
            setMarkdown(selectedExample)
            showNotification(`${example.charAt(0).toUpperCase() + example.slice(1)} example loaded!`, 'success')
        }
    }, [showNotification])

    const clearAll = useCallback(() => {
        setMarkdown('')
        showNotification('Cleared all content', 'success')
    }, [showNotification])

    const insertMarkdown = useCallback((syntax: string) => {
        setMarkdown(prev => prev + (prev ? '\n\n' : '') + syntax)
        showNotification('Syntax inserted!', 'success')
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
                        <FileText className="inline-block w-10 h-10 mr-3" />
                        Markdown Preview
                    </h1>
                    <p className="text-lg text-white/90">
                        Write and preview Markdown in real-time with live rendering
                    </p>
                </motion.div>

                {/* Main Tool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                >
                    {/* Controls */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => pasteFromClipboard()}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Clipboard className="w-4 h-4" />
                                    Paste
                                </button>

                                <button
                                    onClick={() => copyToClipboard(markdown, 'Markdown')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy MD
                                </button>

                                <button
                                    onClick={() => copyToClipboard(htmlPreview, 'HTML')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Code className="w-4 h-4" />
                                    Copy HTML
                                </button>

                                <button
                                    onClick={downloadAsHtml}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Download className="w-4 h-4" />
                                    Export HTML
                                </button>

                                <button
                                    onClick={clearAll}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </button>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('edit')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'edit'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <EyeOff className="w-4 h-4 inline mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setViewMode('split')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'split'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <Columns className="w-4 h-4 inline mr-1" />
                                    Split
                                </button>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${viewMode === 'preview'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Preview
                                </button>
                            </div>
                        </div>

                        {/* Quick Syntax Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-700 mr-2">Quick Insert:</span>
                            <button
                                onClick={() => insertMarkdown('# Heading 1')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert H1"
                            >
                                <Hash className="w-3 h-3 inline mr-1" />
                                H1
                            </button>
                            <button
                                onClick={() => insertMarkdown('**Bold Text**')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert Bold"
                            >
                                <strong>B</strong>
                            </button>
                            <button
                                onClick={() => insertMarkdown('*Italic Text*')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert Italic"
                            >
                                <em>I</em>
                            </button>
                            <button
                                onClick={() => insertMarkdown('`Inline Code`')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert Code"
                            >
                                <Code className="w-3 h-3 inline mr-1" />
                                Code
                            </button>
                            <button
                                onClick={() => insertMarkdown('- List Item')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert List"
                            >
                                <List className="w-3 h-3 inline mr-1" />
                                List
                            </button>
                            <button
                                onClick={() => insertMarkdown('[Link Text](https://example.com)')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert Link"
                            >
                                <LinkIcon className="w-3 h-3 inline mr-1" />
                                Link
                            </button>
                            <button
                                onClick={() => insertMarkdown('![Alt Text](https://via.placeholder.com/300x200)')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-all duration-300"
                                title="Insert Image"
                            >
                                <Image className="w-3 h-3 inline mr-1" />
                                Image
                            </button>
                        </div>
                    </div>

                    {/* Editor and Preview */}
                    <div className={`${viewMode === 'split'
                            ? 'grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200'
                            : 'block'
                        }`}>
                        {/* Editor Panel */}
                        {(viewMode === 'edit' || viewMode === 'split') && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                        Markdown Editor
                                    </h3>
                                </div>

                                <textarea
                                    value={markdown}
                                    onChange={(e) => handleMarkdownChange(e.target.value)}
                                    className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                    placeholder="Start writing your markdown here..."
                                />
                            </div>
                        )}

                        {/* Preview Panel */}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        Live Preview
                                    </h3>
                                </div>

                                <div
                                    className="h-96 p-4 border-2 border-gray-300 rounded-lg overflow-y-auto prose prose-sm max-w-none"
                                    style={{
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        lineHeight: '1.6'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: htmlPreview }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600">
                                    Mode: <span className="font-medium capitalize">{viewMode}</span>
                                </span>
                                <span className="text-blue-600 font-medium">
                                    {wordCount} words
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-gray-600">
                                <span>{markdown.length.toLocaleString()} characters</span>
                                <span>{markdown.split('\n').length} lines</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'basic', label: 'Basic Formatting', desc: 'Headers, lists, links, and emphasis' },
                            { id: 'documentation', label: 'Technical Documentation', desc: 'API docs with tables and code blocks' },
                            { id: 'article', label: 'Blog Article', desc: 'Article-style content with quotes' }
                        ].map((example) => (
                            <button
                                key={example.id}
                                onClick={() => loadExample(example.id)}
                                className="text-left p-4 bg-white/90 hover:bg-white rounded-xl border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="font-semibold text-gray-800 mb-1">{example.label}</div>
                                <div className="text-sm text-gray-600">{example.desc}</div>
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
                            icon: Eye,
                            title: 'Live Preview',
                            description: 'See your markdown rendered in real-time as you type'
                        },
                        {
                            icon: Download,
                            title: 'Export HTML',
                            description: 'Download your content as a styled HTML file'
                        },
                        {
                            icon: Columns,
                            title: 'Split View',
                            description: 'Edit and preview side-by-side for maximum productivity'
                        },
                        {
                            icon: BookOpen,
                            title: 'Quick Examples',
                            description: 'Load common markdown patterns and templates'
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