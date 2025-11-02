'use client'

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

export interface RichTextEditorRef {
  getLength: () => number
  focus: () => void
  blur: () => void
}

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  minHeight?: number
  readOnly?: boolean
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value = '', onChange, placeholder, className, error, minHeight = 200, readOnly = false }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)

    useImperativeHandle(ref, () => ({
      getLength: () => {
        if (editorRef.current) {
          const text = editorRef.current.textContent || ''
          return text.length
        }
        return 0
      },
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus()
        }
      },
      blur: () => {
        if (editorRef.current) {
          editorRef.current.blur()
        }
      },
    }))

    // Initialize editor content
    useEffect(() => {
      if (editorRef.current && value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value
      }
    }, [value])

    const handleInput = useCallback(() => {
      if (editorRef.current && onChange) {
        const html = editorRef.current.innerHTML
        onChange(html)
      }
    }, [onChange])

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    const execCommand = useCallback((command: string, value?: string) => {
      document.execCommand(command, false, value)
      editorRef.current?.focus()
      handleInput()
    }, [handleInput])

    const formatText = useCallback((command: string, value?: string) => {
      execCommand(command, value)
    }, [execCommand])

    const insertLink = useCallback(() => {
      const url = prompt('Enter URL:')
      if (url) {
        formatText('createLink', url)
      }
    }, [formatText])

    const setHeading = useCallback((level: number) => {
      formatText('formatBlock', `h${level}`)
    }, [formatText])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // Handle common keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            formatText('bold')
            break
          case 'i':
            e.preventDefault()
            formatText('italic')
            break
          case 'u':
            e.preventDefault()
            formatText('underline')
            break
        }
      }
    }, [formatText])

    return (
      <div className={cn('rich-text-editor border rounded-md', error && 'border-red-500', className)}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('underline')}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHeading(1)}
              className="h-8 w-8 p-0"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHeading(2)}
              className="h-8 w-8 p-0"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHeading(3)}
              className="h-8 w-8 p-0"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('formatBlock', 'p')}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('insertUnorderedList')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('insertOrderedList')}
              className="h-8 w-8 p-0"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyLeft')}
              className="h-8 w-8 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyCenter')}
              className="h-8 w-8 p-0"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyRight')}
              className="h-8 w-8 p-0"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertLink}
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full p-3 text-sm bg-background focus:outline-none',
            'prose prose-sm max-w-none',
            '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4',
            '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3',
            '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2',
            '[&_p]:mb-3 [&_p]:leading-relaxed',
            '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3',
            '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3',
            '[&_li]:mb-1',
            '[&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800',
            '[&_strong]:font-semibold',
            '[&_em]:italic',
            '[&_u]:underline'
          )}
          style={{ minHeight }}
          data-placeholder={placeholder}
        />

        {/* Placeholder styling */}
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
            position: absolute;
          }
        `}</style>
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'

export { RichTextEditor }