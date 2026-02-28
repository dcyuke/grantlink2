'use client'

import { useState } from 'react'
import { Link2, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  title: string
  url: string
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled share dialog
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="mr-1.5 h-3.5 w-3.5" />
            Copy Link
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handleShare}
      >
        <Share2 className="mr-1.5 h-3.5 w-3.5" />
        Share
      </Button>
    </div>
  )
}
