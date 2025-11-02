"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, FileText, Loader2, Eye, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contentSchema } from "@/lib/validations"
import type { z } from "zod"

type ContentFormData = z.infer<typeof contentSchema>

interface Content {
  id: string
  title: string
  slug?: string
  description?: string
  body?: string
  thumbnail_url?: string
  language: string
  status: 'draft' | 'published'
  category_id?: string
  author_id: string
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

interface ContentCategory {
  id: string
  name: string
  slug: string
}

// Skeleton Components
const ContentCardSkeleton = () => (
  <Card className="relative">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const ContentsGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, i) => (
      <ContentCardSkeleton key={i} />
    ))}
  </div>
)

const HeaderSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="relative w-72">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </CardHeader>
  </Card>
)

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      body: "",
      thumbnail_url: "",
      language: "en",
      status: "draft",
      category_id: "none",
    },
  })

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/content-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Fetch data with pagination and filters
  const fetchContents = async (page = 1, limit = itemsPerPage, search = searchQuery, status = statusFilter, category = categoryFilter) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setPaginationLoading(true)
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (search) {
        params.append('search', search)
      }
      
      if (status && status !== 'all') {
        params.append('status', status)
      }
      
      if (category && category !== 'all') {
        params.append('category_id', category)
      }
      
      const response = await fetch(`/api/contents?${params}`)
      if (!response.ok) throw new Error("Failed to fetch contents")
      
      const data = await response.json()
      setContents(data.data || [])
      setTotalCount(data.count || 0)
      setTotalPages(data.totalPages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching contents:", error)
      toast.error("Failed to load contents")
    } finally {
      setLoading(false)
      setPaginationLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchContents(1, itemsPerPage)
  }, [])

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchContents(page, itemsPerPage, searchQuery, statusFilter, categoryFilter)
    }
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    fetchContents(1, newLimit, searchQuery, statusFilter, categoryFilter)
  }

  // Handle search and filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchContents(1, itemsPerPage, searchQuery, statusFilter, categoryFilter)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, categoryFilter, itemsPerPage])

  const openCreateDialog = () => {
    setEditingContent(null)
    form.reset({
      title: "",
      slug: "",
      description: "",
      body: "",
      thumbnail_url: "",
      language: "en",
      status: "draft",
      category_id: "none",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (content: Content) => {
    setEditingContent(content)
    form.reset({
      title: content.title,
      slug: content.slug || "",
      description: content.description || "",
      body: content.body || "",
      thumbnail_url: content.thumbnail_url || "",
      language: content.language,
      status: content.status,
      category_id: content.category_id || "none",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingContent ? `/api/contents/${editingContent.id}` : "/api/contents"
      const method = editingContent ? "PUT" : "POST"

      // Convert "none" category_id back to empty string for API
      const submitData = {
        ...data,
        category_id: data.category_id === "none" ? "" : data.category_id
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save content")
      }

      toast.success(editingContent ? "Content updated successfully" : "Content created successfully")
      setIsDialogOpen(false)
      fetchContents(currentPage, itemsPerPage, searchQuery, statusFilter, categoryFilter)
    } catch (error) {
      console.error("Error saving content:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save content")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (contentId: string) => {
    try {
      const response = await fetch(`/api/contents/${contentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete content")
      }

      toast.success("Content deleted successfully")
      fetchContents(currentPage, itemsPerPage, searchQuery, statusFilter, categoryFilter)
    } catch (error) {
      console.error("Error deleting content:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete content")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Content Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <>
              <HeaderSkeleton />
              <ContentsGridSkeleton />
            </>
          ) : (
            <>
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Content Management</CardTitle>
                      <CardDescription>
                        Create and manage articles, blog posts, and other content
                        {totalCount > 0 && (
                          <span className="ml-2">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} contents
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search contents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Content
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                    <div className="flex items-center justify-between">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                        <TabsTrigger value="published">Published</TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-2">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Content Grid */}
              {paginationLoading ? (
                <ContentsGridSkeleton />
              ) : contents.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No content found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? "No content matches your current filters."
                        : "Get started by creating your first piece of content."}
                    </p>
                    <Button onClick={openCreateDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contents.map((content) => (
                    <Card key={content.id} className="relative group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-2">{content.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(content.status)}>
                                {content.status}
                              </Badge>
                              {content.category && (
                                <Badge variant="outline" className="text-xs">
                                  {content.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {content.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {content.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(content.updated_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="uppercase">{content.language}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(content)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Content</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{content.title}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(content.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Items per page:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || paginationLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || paginationLoading}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContent ? "Edit Content" : "Create New Content"}
                </DialogTitle>
                <DialogDescription>
                  {editingContent ? "Update the content details below." : "Fill in the details to create a new content."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit((data) => handleSubmit(data as any))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Enter content title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      {...form.register("slug")}
                      placeholder="auto-generated-from-title"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Brief description of the content"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Content Body</Label>
                  <Textarea
                    id="body"
                    {...form.register("body")}
                    placeholder="Write your content here..."
                    rows={8}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={form.watch("category_id")}
                      onValueChange={(value) => form.setValue("category_id", value)}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) => form.setValue("status", value as "draft" | "published")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={form.watch("language")}
                      onValueChange={(value) => form.setValue("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="id">Indonesian</SelectItem>
                        <SelectItem value="ms">Malay</SelectItem>
                        <SelectItem value="th">Thai</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                    <Input
                      id="thumbnail_url"
                      {...form.register("thumbnail_url")}
                      placeholder="https://example.com/image.jpg"
                    />
                    {form.formState.errors.thumbnail_url && (
                      <p className="text-sm text-destructive">{form.formState.errors.thumbnail_url.message}</p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingContent ? "Update Content" : "Create Content"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}