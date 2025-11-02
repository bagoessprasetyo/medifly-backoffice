'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contentSchema } from '@/lib/validations'
import { ContentCategory } from '@/lib/types'
import { z } from 'zod'
import { toast } from 'sonner'

// Layout Components
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Custom Components
import { PhotoUpload } from '@/components/ui/photo-upload'
import { RichTextEditor, RichTextEditorRef } from '@/components/ui/rich-text-editor'

// Icons
import { ArrowLeft, Save, Eye, Plus, AlertTriangle, CheckCircle, Link2 } from 'lucide-react'

type ContentFormSchema = z.infer<typeof contentSchema>

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ms', label: 'Malay' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
]

const MAX_TITLE_LENGTH = 500
const MAX_DESCRIPTION_LENGTH = 1000

// Custom debounce function to replace lodash
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default function NewContentPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null)
  const [contentLength, setContentLength] = useState(0)
  const editorRef = useRef<RichTextEditorRef>(null)

  const form = useForm<ContentFormSchema>({
    resolver: zodResolver(contentSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      body: '',
      thumbnail_url: '',
      language: 'en',
      status: 'draft',
      category_id: 'none',
    },
  })

  const { watch, setValue, formState: { errors, isValid } } = form
  const watchedValues = watch()

  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const fields = ['title', 'description', 'body', 'category_id']
    const completedFields = fields.filter(field => {
      const value = watchedValues[field as keyof ContentFormSchema]
      return value && value.toString().trim() !== '' && value !== 'none'
    })
    return Math.round((completedFields.length / fields.length) * 100)
  }, [watchedValues])

  const progress = calculateProgress()

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  // Auto-generate slug when title changes
  useEffect(() => {
    if (watchedValues.title) {
      const slug = generateSlug(watchedValues.title)
      setValue('slug', slug)
    }
  }, [watchedValues.title, setValue, generateSlug])

  // Update content length when body changes
  useEffect(() => {
    if (editorRef.current) {
      setContentLength(editorRef.current.getLength())
    }
  }, [watchedValues.body])

  // Auto-save functionality
  const autoSave = useCallback(
    debounce(async (data: ContentFormSchema) => {
      if (!data.title) return
      
      setAutoSaveStatus('saving')
      try {
        localStorage.setItem('content-draft', JSON.stringify(data))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(null), 2000)
      } catch (error) {
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus(null), 2000)
      }
    }, 2000),
    []
  )

  // Track changes for auto-save
  useEffect(() => {
    const subscription = form.watch((data) => {
      setHasUnsavedChanges(true)
      autoSave(data as ContentFormSchema)
    })
    return () => subscription.unsubscribe()
  }, [form, autoSave])

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('content-draft')
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        Object.keys(draftData).forEach(key => {
          if (draftData[key]) {
            setValue(key as keyof ContentFormSchema, draftData[key])
          }
        })
        toast.info('Draft loaded from auto-save')
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [setValue])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/content-categories?limit=100')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Handle form submission
  const handleSubmit = async (data: ContentFormSchema, isDraft = false) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        status: isDraft ? 'draft' : 'published',
        category_id: data.category_id === 'none' ? '' : data.category_id,
      }

      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create content')
      }

      // Clear auto-saved draft
      localStorage.removeItem('content-draft')
      setHasUnsavedChanges(false)

      toast.success(`Content ${isDraft ? 'saved as draft' : 'published'} successfully!`)
      router.push('/content')
    } catch (error) {
      console.error('Error creating content:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create content')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle new category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsCreatingCategory(true)
    try {
      const response = await fetch('/api/content-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const newCategory = await response.json()
      setCategories(prev => [...prev, newCategory])
      setValue('category_id', newCategory.id)
      setNewCategoryName('')
      setShowNewCategoryDialog(false)
      toast.success('Category created successfully!')
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create category')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true)
    } else {
      router.push('/content')
    }
  }

  const confirmCancel = () => {
    localStorage.removeItem('content-draft')
    router.push('/content')
  }

  // Handle rich text editor change
  const handleEditorChange = (value: string) => {
    setValue('body', value)
    if (editorRef.current) {
      setContentLength(editorRef.current.getLength())
    }
  }

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/content">Content</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create New Content</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Content</h1>
              <p className="text-muted-foreground">
                Create and publish new articles, tips, and educational materials
              </p>
            </div>
            <div className="flex items-center gap-2">
              {autoSaveStatus && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="h-2 w-2 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                      Saving...
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Auto-saved
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      Save failed
                    </>
                  )}
                </div>
              )}
              <Button variant="outline" onClick={handleCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Form Completion</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          <form onSubmit={form.handleSubmit((data) => handleSubmit(data as any, false))} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...form.register('title')}
                        placeholder="Enter content title..."
                        maxLength={MAX_TITLE_LENGTH}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{errors.title?.message}</span>
                        <span>{watchedValues.title?.length || 0}/{MAX_TITLE_LENGTH}</span>
                      </div>
                    </div>

                    {/* Auto-generated slug preview */}
                    {watchedValues.slug && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">URL Slug (Auto-generated)</Label>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono text-muted-foreground">
                            /content/{watchedValues.slug}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <textarea
                        id="description"
                        {...form.register('description')}
                        placeholder="Brief description of the content..."
                        rows={3}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        className={`w-full px-3 py-2 border rounded-md resize-none ${errors.description ? 'border-red-500' : 'border-input'} bg-background`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{errors.description?.message}</span>
                        <span>{watchedValues.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Thumbnail Image</Label>
                      <PhotoUpload
                        value={watchedValues.thumbnail_url}
                        onChange={(url) => setValue('thumbnail_url', url)}
                        onError={(error) => toast.error(error)}
                      />
                      {errors.thumbnail_url && (
                        <p className="text-xs text-red-500">{errors.thumbnail_url.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Content Body */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Content Body *</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {contentLength} characters
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <RichTextEditor
                        ref={editorRef}
                        value={watchedValues.body}
                        onChange={handleEditorChange}
                        placeholder="Write your content here..."
                        error={!!errors.body}
                        minHeight={400}
                      />
                      {errors.body && (
                        <p className="text-xs text-red-500">{errors.body.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publishing Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !isValid}
                        className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.handleSubmit((data) => handleSubmit(data as any, true))()}
                        disabled={isSubmitting}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                        disabled={!watchedValues.title && !watchedValues.body}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div className="flex gap-2">
                        <Select
                          value={watchedValues.category_id}
                          onValueChange={(value) => setValue('category_id', value)}
                        >
                          <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowNewCategoryDialog(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.category_id && (
                        <p className="text-xs text-red-500">{errors.category_id.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={watchedValues.language}
                        onValueChange={(value) => setValue('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">
                      {watchedValues.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>

          {/* Cancel Confirmation Dialog */}
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* New Category Dialog */}
          <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category for organizing your content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isCreatingCategory}
                  className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
                >
                  {isCreatingCategory ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    'Create Category'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Content Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {watchedValues.thumbnail_url && (
                  <img
                    src={watchedValues.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{watchedValues.title || 'Untitled'}</h2>
                  <p className="text-muted-foreground mt-2">{watchedValues.description}</p>
                  {watchedValues.slug && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      URL: /content/{watchedValues.slug}
                    </p>
                  )}
                </div>
                <Separator />
                <div className="prose max-w-none">
                  <div 
                    className="rich-content-preview"
                    dangerouslySetInnerHTML={{ __html: watchedValues.body || '<p class="text-muted-foreground italic">No content yet...</p>' }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}