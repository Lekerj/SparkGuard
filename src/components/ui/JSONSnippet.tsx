import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'

interface JSONSnippetProps {
  data: object
  title?: string
  collapsible?: boolean
  defaultExpanded?: boolean
  maxHeight?: string
}

export default function JSONSnippet({
  data,
  title,
  collapsible = true,
  defaultExpanded = true,
  maxHeight = '300px',
}: JSONSnippetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-neutral-900 rounded-lg overflow-hidden font-mono text-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
          <button
            onClick={() => collapsible && setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
            aria-expanded={isExpanded}
            disabled={!collapsible}
          >
            {collapsible && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            )}
            <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <pre
          className="p-4 overflow-auto text-neutral-300"
          style={{ maxHeight }}
        >
          <code>{jsonString}</code>
        </pre>
      </motion.div>
    </div>
  )
}
