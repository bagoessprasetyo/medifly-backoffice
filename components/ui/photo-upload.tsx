'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  className?: string
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function PhotoUpload({
  value,
  onChange,
  onError,
  className,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSize}MB`
    }
    
    return null
  }

  const simulateUpload = async (file: File): Promise<string> => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Create a local URL for preview (in real app, this would be uploaded to a server)
    return URL.createObjectURL(file)
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const url = await simulateUpload(file)
      onChange(url)
    } catch (err) {
      const errorMessage = 'Failed to upload image'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={value}
                alt="Uploaded thumbnail"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={openFileDialog}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            error ? 'border-red-500 bg-red-50' : ''
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {isUploading ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2 w-full max-w-xs">
                    <p className="text-sm font-medium">Uploading...</p>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                  </div>
                </>
              ) : error ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-600">Upload Failed</p>
                    <p className="text-xs text-red-500">{error}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setError(null)}>
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload thumbnail image</p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max {maxSize}MB • {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}