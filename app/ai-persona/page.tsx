"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Bot, Loader2, Star, StarOff, ChevronLeft, ChevronRight, Upload, X } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
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
import { aiPersonaSchema } from "@/lib/validations"
import type { z } from "zod"

type PersonaFormData = z.infer<typeof aiPersonaSchema>

interface AIPersona {
  id: string
  name: string
  description?: string
  tone?: 'professional' | 'friendly' | 'empathetic' | 'clinical'
  voice_style?: string
  image_url?: string
  system_prompt?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// Skeleton Components
const PersonaCardSkeleton = () => (
  <Card className="relative">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
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

const PersonasGridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, i) => (
      <PersonaCardSkeleton key={i} />
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

export default function AIPersonaPage() {
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [loading, setLoading] = useState(true)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<AIPersona | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const form = useForm<PersonaFormData>({
    resolver: zodResolver(aiPersonaSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      tone: "professional",
      voice_style: "",
      image_url: "",
      system_prompt: "",
      is_default: false,
    },
  })

  // Fetch data with pagination
  const fetchPersonas = async (page = 1, limit = itemsPerPage, search = searchQuery) => {
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
      
      const response = await fetch(`/api/ai-personas?${params}`)
      if (!response.ok) throw new Error("Failed to fetch AI personas")
      
      const data = await response.json()
      setPersonas(data.personas || [])
      setTotalCount(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching AI personas:", error)
      toast.error("Failed to load AI personas")
    } finally {
      setLoading(false)
      setPaginationLoading(false)
    }
  }

  useEffect(() => {
    fetchPersonas(1, itemsPerPage)
  }, [])

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchPersonas(page, itemsPerPage, searchQuery)
    }
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    fetchPersonas(1, newLimit, searchQuery)
  }

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchPersonas(1, itemsPerPage, searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, itemsPerPage])

  const openCreateDialog = () => {
    setEditingPersona(null)
    setImageFile(null)
    setImagePreview("")
    form.reset({
      name: "",
      description: "",
      tone: "professional",
      voice_style: "",
      image_url: "",
      system_prompt: "",
      is_default: false,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (persona: AIPersona) => {
    setEditingPersona(persona)
    setImageFile(null)
    setImagePreview(persona.image_url || "")
    form.reset({
      name: persona.name,
      description: persona.description || "",
      tone: persona.tone || "professional",
      voice_style: persona.voice_style || "",
      image_url: persona.image_url || "",
      system_prompt: persona.system_prompt || "",
      is_default: persona.is_default,
    })
    setIsDialogOpen(true)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size must be less than 5MB")
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    form.setValue("image_url", "")
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    // This would be implemented with your file upload service
    // For now, we'll use a placeholder URL
    return `https://example.com/uploads/${file.name}`
  }

  const handleSubmit = async (data: PersonaFormData) => {
    setIsSubmitting(true)
    try {
      let imageUrl = data.image_url

      // Upload image if a new file was selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const url = "/api/ai-personas"
      const method = editingPersona ? "PUT" : "POST"
      const body = editingPersona 
        ? { ...data, id: editingPersona.id, image_url: imageUrl }
        : { ...data, image_url: imageUrl }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save AI persona")
      }

      toast.success(editingPersona ? "AI persona updated successfully" : "AI persona created successfully")
      setIsDialogOpen(false)
      fetchPersonas()
    } catch (error) {
      console.error("Error saving AI persona:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save AI persona")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetDefault = async (personaId: string) => {
    try {
      const response = await fetch("/api/ai-personas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: personaId, is_default: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to set default persona")
      }

      toast.success("Default persona updated successfully")
      fetchPersonas()
    } catch (error) {
      console.error("Error setting default persona:", error)
      toast.error(error instanceof Error ? error.message : "Failed to set default persona")
    }
  }

  const handleDelete = async (personaId: string) => {
    try {
      const response = await fetch(`/api/ai-personas?id=${personaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete AI persona")
      }

      toast.success("AI persona deleted successfully")
      fetchPersonas()
    } catch (error) {
      console.error("Error deleting AI persona:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete AI persona")
    }
  }

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'friendly': return 'bg-green-100 text-green-800'
      case 'empathetic': return 'bg-purple-100 text-purple-800'
      case 'clinical': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
                  <BreadcrumbPage>AI Persona</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <>
              <HeaderSkeleton />
              <PersonasGridSkeleton />
            </>
          ) : (
            <>
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI Persona Management</CardTitle>
                      <CardDescription>
                        Configure chatbot personalities and behaviors
                        {totalCount > 0 && (
                          <span className="ml-2">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} personas
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search personas..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Persona
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Personas Grid */}
              {paginationLoading ? (
                <PersonasGridSkeleton />
              ) : personas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No AI personas found</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery 
                        ? "No personas match your search criteria." 
                        : "Get started by creating your first AI persona."
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Persona
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {personas.map((persona) => (
                    <Card key={persona.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {persona.image_url ? (
                                <img
                                  src={persona.image_url}
                                  alt={persona.name}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bot className="h-6 w-6" />
                                </div>
                              )}
                              {persona.is_default && (
                                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                                  <Star className="h-3 w-3 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{persona.name}</CardTitle>
                              {persona.tone && (
                                <Badge className={`text-xs ${getToneColor(persona.tone)}`}>
                                  {persona.tone}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant={persona.is_default ? "default" : "secondary"}>
                            {persona.is_default ? "Default" : "Active"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {persona.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {persona.description}
                            </p>
                          )}

                          {persona.system_prompt && (
                            <div className="bg-muted/50 p-2 rounded text-xs">
                              <p className="font-medium mb-1">System Prompt:</p>
                              <p className="line-clamp-2 text-muted-foreground">
                                {persona.system_prompt}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(persona)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {!persona.is_default && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefault(persona.id)}
                                  title="Set as default"
                                >
                                  <StarOff className="h-4 w-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the
                                      AI persona &quot;{persona.name}&quot;.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(persona.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(persona.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && totalCount > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show</span>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">per page</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1 || paginationLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={paginationLoading}
                                className="w-10"
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages || paginationLoading}
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
                  {editingPersona ? "Edit AI Persona" : "Create AI Persona"}
                </DialogTitle>
                <DialogDescription>
                  Configure the chatbot's personality, appearance, and behavior.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit((data) => handleSubmit(data as any))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Persona Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="e.g., Dr. Sarah"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select
                      value={form.watch("tone")}
                      onValueChange={(value) => form.setValue("tone", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                        <SelectItem value="clinical">Clinical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Brief description of the persona..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Persona Image</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </span>
                        </Button>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max 5MB. JPG, PNG, GIF supported.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system_prompt">System Prompt</Label>
                  <Textarea
                    id="system_prompt"
                    {...form.register("system_prompt")}
                    placeholder="You are a helpful medical assistant..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define how the AI should behave and respond to users.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={form.watch("is_default")}
                    onCheckedChange={(checked) => form.setValue("is_default", checked)}
                  />
                  <Label htmlFor="is_default">Set as default persona</Label>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingPersona ? "Update Persona" : "Create Persona"}
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