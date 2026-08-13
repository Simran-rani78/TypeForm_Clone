"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Plus, Trash2, Edit, ExternalLink, Activity, Copy, PenLine, 
  LayoutTemplate, Users, GitBranch, Sparkles, Search, Grid, 
  Calendar, Mic, MoreHorizontal, Blocks, ChevronDown, 
  AlignJustify, Diamond, UserPlus, Lock, Settings, Filter, Mail, Clock, Play
} from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"
import { Logo } from "@/components/ui/logo"
import { fetchForms, createForm, deleteForm, updateFormTitle, duplicateFormApi } from "@/lib/api"
import { cn } from "@/lib/utils"

import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal"
import { DuplicateFormModal } from "@/components/ui/DuplicateFormModal"

export default function Dashboard() {
  const router = useRouter()
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  
  const [activeGlobalTab, setActiveGlobalTab] = useState<'forms' | 'contacts' | 'automations' | 'research'>('forms')

  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState("")

  
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formToDuplicate, setFormToDuplicate] = useState<{id: string, title: string} | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const loadForms = async () => {
    try {
      const data = await fetchForms()
      setForms(data)
    } catch (error) {
      toast.error("Failed to load forms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForms()
    const onFocus = () => loadForms()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFormTitle.trim()) return

    setIsCreating(true)
    try {
      const form = await createForm(newFormTitle)
      setForms([form, ...forms])
      toast.success("Form created successfully")
      setIsCreateModalOpen(false)
      setNewFormTitle("")
      router.refresh()
      router.push(`/builder/${form.id}`)
    } catch (error) {
      toast.error("Failed to create form")
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDeleteForm = async () => {
    if (!formToDelete) return
    setIsDeleting(true)
    try {
      await deleteForm(formToDelete)
      setForms(forms.filter((f) => f.id !== formToDelete))
      toast.success("Form deleted")
      setFormToDelete(null)
    } catch (error) {
      toast.error("Failed to delete form")
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDuplicateForm = async (newTitle: string) => {
    if (!formToDuplicate) return
    setIsDuplicating(true)
    try {
      const duplicated = await duplicateFormApi(formToDuplicate.id)
      const renamed = await updateFormTitle(duplicated.id, newTitle)
      setForms([renamed, ...forms])
      toast.success("✓ Form duplicated")
      setFormToDuplicate(null)
    } catch (error) {
      toast.error("Failed to duplicate form")
    } finally {
      setIsDuplicating(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString))
  }

  const filteredForms = forms.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {}
      <header className="h-14 bg-white border-b border-zinc-200 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-8 h-full">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
          </div>
          
          <nav className="flex items-center h-full gap-2">
            <button 
              onClick={() => setActiveGlobalTab('forms')}
              className={`flex items-center gap-2 h-full px-2 border-b-2 text-sm font-medium transition-colors ${activeGlobalTab === 'forms' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Forms
            </button>
            <button 
              onClick={() => setActiveGlobalTab('contacts')}
              className={`flex items-center gap-2 h-full px-2 border-b-2 text-sm font-medium transition-colors ${activeGlobalTab === 'contacts' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
            >
              <Users className="w-4 h-4" /> Contacts
            </button>
            <button 
              onClick={() => setActiveGlobalTab('automations')}
              className={`flex items-center gap-2 h-full px-2 border-b-2 text-sm font-medium transition-colors ${activeGlobalTab === 'automations' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
            >
              <GitBranch className="w-4 h-4" /> Automations
            </button>
            <button 
              onClick={() => setActiveGlobalTab('research')}
              className={`flex items-center gap-2 h-full px-2 border-b-2 text-sm font-medium transition-colors ${activeGlobalTab === 'research' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
            >
              <Sparkles className="w-4 h-4" /> Research Flow 
              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold ml-1 border border-blue-100">Demo</span>
            </button>
          </nav>
        </div>
      </header>

      {}
      <div className="flex flex-1 overflow-hidden">
        
        {}
        {activeGlobalTab === 'forms' && (
          <>
            <aside className="w-[260px] bg-white border-r border-zinc-200 flex flex-col shrink-0">
              <div className="p-4 pb-2">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full bg-[#312b36] hover:bg-[#252129] transition-colors text-white rounded-md py-2.5 flex justify-center items-center gap-2 font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" /> Create form
                </button>
              </div>
              
              <div className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border-none rounded-md text-sm outline-none focus:ring-1 focus:ring-zinc-300 transition-all"
                  />
                </div>
              </div>
              
              <div className="px-4 py-4 flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm text-zinc-500 font-medium px-2 py-1.5 hover:bg-zinc-50 rounded-md cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Grid className="w-4 h-4" /> Workspaces
                  </div>
                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </div>
                
                <div className="mt-4">
                  <div className="text-xs font-semibold text-zinc-500 tracking-wide px-2 mb-1 flex items-center justify-between">
                    Private <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-900 font-medium px-2 py-2 bg-zinc-100 rounded-md cursor-pointer">
                    <span>My workspace</span>
                    <span className="text-xs text-zinc-500">{forms.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-zinc-100">
                <div className="mb-4">
                  <div className="text-xs font-medium text-zinc-600 mb-1">Responses collected</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 w-0"></div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-zinc-700">0 / 10</div>
                  <button className="mt-3 text-xs font-medium text-zinc-700 border border-zinc-200 rounded px-3 py-1.5 hover:bg-zinc-50 w-full text-left">
                    Increase response limit
                  </button>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <button className="relative w-full bg-white border border-purple-200 rounded-lg p-2.5 flex items-center gap-3 text-left">
                    <Mic className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-zinc-500 flex-1">Ask Typeform AI</span>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto bg-[#fafafa]">
              <div className="p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-normal text-zinc-800 tracking-tight">My workspace</h1>
                    <button className="text-zinc-400 hover:text-zinc-600"><MoreHorizontal className="w-5 h-5" /></button>
                    <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-md transition-colors">
                      <Users className="w-4 h-4" /> Invite <Diamond className="w-3.5 h-3.5 text-teal-600 ml-1" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-md">
                      <Calendar className="w-4 h-4" /> Date created <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </button>
                    <div className="flex bg-white rounded-md p-1 border border-zinc-200 shadow-sm">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 ${viewMode === 'list' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        <AlignJustify className="w-3.5 h-3.5" /> List
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        <Grid className="w-3.5 h-3.5" /> Grid
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-white rounded-xl border border-zinc-100 p-6 flex flex-col items-start shadow-sm relative">
                    <button className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"><Plus className="w-4 h-4 rotate-45" /></button>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed pr-6">
                        Create a Gather insights on your audience's favorite technologies and emerging trends to tailor your content.
                      </p>
                    </div>
                    <button className="text-xs font-semibold px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                      Use this form
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-zinc-100 p-6 flex flex-col items-start shadow-sm relative">
                    <button className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"><Plus className="w-4 h-4 rotate-45" /></button>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed pr-6">
                        Create a Test your audience's coding skills with fun, interactive programming questions and instant feedback.
                      </p>
                    </div>
                    <button className="text-xs font-semibold px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors">
                      Use this form
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-white border border-zinc-100 h-16 rounded-lg w-full" />
                    ))}
                  </div>
                ) : filteredForms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 border border-zinc-200 rounded-xl bg-white shadow-sm">
                    <h3 className="text-lg font-medium text-zinc-900">No forms yet</h3>
                    <p className="text-zinc-500 mb-6 text-sm mt-1">Create your first form.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md">
                      <Plus className="w-4 h-4 mr-2" /> Create form
                    </Button>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="w-full">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 border-b border-zinc-200 mb-2">
                      <div className="col-span-6"></div>
                      <div className="col-span-1 text-right">Responses</div>
                      <div className="col-span-1 text-right">Completed</div>
                      <div className="col-span-2 text-right">Updated</div>
                      <div className="col-span-1 text-right">Integrations</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredForms.map(form => (
                        <div 
                          key={form.id} 
                          className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border border-zinc-100 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all items-center cursor-pointer group"
                          onClick={() => router.push(`/builder/${form.id}`)}
                        >
                          <div className="col-span-6 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-[10px] bg-[#cc7a40] flex items-center justify-center shadow-inner shrink-0 relative overflow-hidden">
                              <div className="absolute inset-x-2 top-2 bottom-3 bg-white/20 rounded-sm"></div>
                            </div>
                            <span className="font-medium text-sm text-zinc-800 group-hover:text-zinc-900 truncate">{form.title}</span>
                          </div>
                          
                          <div className="col-span-1 text-right text-xs text-zinc-500 font-medium">
                            {form.response_count > 0 ? form.response_count : '—'}
                          </div>
                          <div className="col-span-1 text-right text-xs text-zinc-500 font-medium">
                            {form.starts > 0 ? form.starts : '—'}
                          </div>
                          <div className="col-span-2 text-right text-xs text-zinc-500 font-medium">
                            {formatDate(form.updated_at)}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <div className="w-6 h-6 border border-zinc-200 rounded flex items-center justify-center text-zinc-400">
                              <Blocks className="w-3 h-3" />
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Dropdown>
                              <DropdownItem onClick={(e) => { e.stopPropagation(); router.push(`/builder/${form.id}`); }}>Open</DropdownItem>
                              <DropdownItem onClick={(e) => { e.stopPropagation(); router.push(`/results/${form.id}`); }}>Results</DropdownItem>
                              {form.status === 'published' && (
                                <DropdownItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/form/${form.slug}`); toast.success('✓ Link copied'); }}>Copy link</DropdownItem>
                              )}
                              <DropdownItem onClick={(e) => { e.stopPropagation(); setFormToDuplicate({ id: form.id, title: form.title }); }}>Duplicate</DropdownItem>
                              <DropdownItem onClick={(e) => { e.stopPropagation(); setFormToDelete(form.id); }} danger>Delete</DropdownItem>
                            </Dropdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {filteredForms.map((form) => (
                      <Card key={form.id} className="flex flex-col h-[240px] hover:shadow-lg transition-all group relative overflow-hidden bg-white border border-zinc-200 rounded-xl cursor-pointer" onClick={() => router.push(`/builder/${form.id}`)}>
                        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center relative border-b border-zinc-100 bg-zinc-50/50">
                          <div className="absolute top-4 left-4">
                             <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", 
                                form.status === 'published' ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-500"
                              )}>
                                {form.status}
                              </span>
                          </div>
                          <div className="w-12 h-12 rounded-[14px] bg-[#cc7a40] flex items-center justify-center shadow-inner mb-4 relative overflow-hidden">
                              <div className="absolute inset-x-3 top-3 bottom-4 bg-white/20 rounded-sm"></div>
                          </div>
                          <h3 className="text-base font-medium w-full truncate" title={form.title}>{form.title}</h3>
                        </div>
                        <div className="h-14 flex items-center justify-between px-4 bg-white">
                          <div className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> {form.response_count}
                          </div>
                          <Dropdown>
                            <DropdownItem onClick={(e) => { e.stopPropagation(); router.push(`/builder/${form.id}`); }}>Open</DropdownItem>
                            <DropdownItem onClick={(e) => { e.stopPropagation(); router.push(`/results/${form.id}`); }}>Results</DropdownItem>
                            {form.status === 'published' && (
                              <DropdownItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/form/${form.slug}`); toast.success('✓ Link copied'); }}>Copy link</DropdownItem>
                            )}
                            <DropdownItem onClick={(e) => { e.stopPropagation(); setFormToDuplicate({ id: form.id, title: form.title }); }}>Duplicate</DropdownItem>
                            <DropdownItem onClick={(e) => { e.stopPropagation(); setFormToDelete(form.id); }} danger>Delete</DropdownItem>
                          </Dropdown>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                
              </div>
            </main>
          </>
        )}

        {}
        {activeGlobalTab === 'contacts' && (
          <>
            <aside className="w-[260px] bg-white border-r border-zinc-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-zinc-100">
                <button className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-900 rounded-md py-2 flex justify-center items-center gap-2 font-medium text-sm shadow-sm">
                  <UserPlus className="w-4 h-4" /> Add contact
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-100 inline-block mb-3">Early access</span>
                  <div className="flex items-center justify-between text-sm text-zinc-700 font-medium hover:bg-zinc-50 px-2 py-1.5 rounded-md cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-zinc-500" /> Contact lists
                    </div>
                    <Plus className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-zinc-900 font-medium px-2 py-2 bg-zinc-100 rounded-md cursor-pointer">
                  <span>All contacts</span>
                  <span className="text-xs text-zinc-500">0</span>
                </div>
              </div>
              
              <div className="mt-auto border-t border-zinc-100 p-2">
                <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium hover:bg-zinc-50 px-3 py-2 rounded-md cursor-pointer">
                  <Lock className="w-4 h-4 text-zinc-400" /> Contact permissions
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 font-medium hover:bg-zinc-50 px-3 py-2 rounded-md cursor-pointer">
                  <Settings className="w-4 h-4 text-zinc-400" /> Contact settings
                </div>
              </div>
              
              <div className="p-4 border-t border-zinc-100">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <button className="relative w-full bg-white border border-purple-200 rounded-lg p-2.5 flex items-center gap-3 text-left">
                    <Mic className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-zinc-500 flex-1">Ask Typeform AI</span>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto bg-[#fafafa]">
              <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-normal text-zinc-800 tracking-tight">All contacts</h1>
                  <button className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-md shadow-sm">
                    <Users className="w-4 h-4" /> Public
                  </button>
                </div>
                
                <div className="bg-white border border-zinc-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input 
                          type="text" 
                          placeholder="Search contacts" 
                          className="w-64 pl-9 pr-4 py-1.5 border border-zinc-200 rounded-md text-sm outline-none focus:border-zinc-400"
                        />
                      </div>
                      <button className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 px-3 py-1.5 border border-zinc-200 rounded-md transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="text-zinc-400 hover:text-zinc-600"><AlignJustify className="w-4 h-4 rotate-90" /></button>
                      <button className="text-zinc-400 hover:text-zinc-600"><Settings className="w-4 h-4" /></button>
                      <button className="flex items-center gap-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-md transition-colors">
                        Actions <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                    <h2 className="text-xl font-medium text-zinc-900 mb-4">Ready to build your contact list?</h2>
                    <p className="text-sm text-zinc-500 mb-8">Create contacts automatically from forms with email questions.</p>
                    
                    <ol className="text-sm text-zinc-600 text-left space-y-2 mb-8 list-decimal pl-4">
                      <li><a href="#" className="underline hover:text-zinc-900">Add an email question</a> to a form</li>
                      <li>Publish your form</li>
                      <li>Click "Auto-add from forms" below</li>
                    </ol>
                    
                    <div className="flex items-center justify-center gap-3 w-full mb-4">
                      <button className="flex items-center gap-2 text-sm font-medium text-white bg-[#312b36] hover:bg-[#252129] px-4 py-2 rounded-md transition-colors shadow-sm">
                        <Sparkles className="w-4 h-4" /> Auto-add from forms
                      </button>
                      <button className="text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-4 py-2 rounded-md transition-colors shadow-sm">
                        Import contacts
                      </button>
                    </div>
                    <p className="text-sm text-zinc-500">Or, <a href="#" className="underline hover:text-zinc-900">add individually.</a></p>
                  </div>
                </div>
              </div>
            </main>
          </>
        )}

        {}
        {activeGlobalTab === 'automations' && (
          <>
            <aside className="w-[260px] bg-white border-r border-zinc-200 flex flex-col shrink-0">
              <div className="p-4 pb-2 border-b border-zinc-100">
                <button className="w-full bg-[#312b36] hover:bg-[#252129] transition-colors text-white rounded-md py-2.5 flex justify-center items-center gap-2 font-semibold text-sm shadow-sm">
                  <Plus className="w-4 h-4" /> Create automation
                </button>
              </div>
              
              <div className="py-2">
                <div className="flex items-center justify-between text-sm text-zinc-900 font-medium px-4 py-3 bg-zinc-50 cursor-pointer border-l-2 border-zinc-900">
                  <span>Form submissions</span>
                  <span className="text-xs text-zinc-500">0</span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-600 hover:bg-zinc-50 font-medium px-4 py-3 cursor-pointer border-l-2 border-transparent">
                  <span>Contact activity/updates</span>
                  <span className="text-xs text-zinc-400">0</span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-600 hover:bg-zinc-50 font-medium px-4 py-3 cursor-pointer border-l-2 border-transparent">
                  <span>Specific date/time</span>
                  <span className="text-xs text-zinc-400">0</span>
                </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-zinc-100">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <button className="relative w-full bg-white border border-purple-200 rounded-lg p-2.5 flex items-center gap-3 text-left">
                    <Mic className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-zinc-500 flex-1">Ask Typeform AI</span>
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto bg-[#fafafa] flex items-center justify-center p-12">
              <div className="max-w-4xl w-full flex items-center justify-between gap-12">
                <div className="flex-1 max-w-sm">
                  <h1 className="text-2xl font-normal text-zinc-800 tracking-tight mb-4">Keep the conversation going</h1>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-8">
                    Follow up with emails, text messages, and more actions when someone completes a form.
                  </p>
                  
                  <button className="bg-[#312b36] hover:bg-[#252129] transition-colors text-white rounded-md px-6 py-2.5 flex justify-center items-center gap-2 font-semibold text-sm shadow-sm mb-4">
                    <Plus className="w-4 h-4" /> Create automation
                  </button>
                  <p className="text-xs text-zinc-500">
                    Or, <a href="#" className="underline hover:text-zinc-900">learn about automations.</a>
                  </p>
                </div>
                
                <div className="flex-1 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-50 rounded-2xl p-6 shadow-sm flex items-center gap-6 relative overflow-hidden border border-zinc-100 h-[320px]">
                  {}
                  <div className="w-[160px] h-[340px] bg-zinc-900 rounded-[24px] border-4 border-zinc-800 flex flex-col overflow-hidden shrink-0 shadow-xl relative -mt-10">
                     <div className="bg-[#cc7a40] h-[140px] flex items-center justify-center text-white text-xs font-bold shrink-0 pt-4">
                        ROAST & GRIND
                     </div>
                     <div className="flex-1 bg-white p-4 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">Thanks for filling out our form!</h3>
                     </div>
                  </div>
                  
                  {}
                  <div className="flex flex-col gap-2 flex-1 relative z-10">
                     <div className="bg-white rounded-lg p-2.5 shadow-sm flex items-center gap-3 border border-white/50">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Filter className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-zinc-800">Form completed</span>
                     </div>
                     <div className="flex justify-center -my-1"><div className="w-px h-4 bg-zinc-300 relative"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-b border-r border-zinc-400"></div></div></div>
                     
                     <div className="bg-white rounded-lg p-2.5 shadow-sm flex items-center gap-3 border border-white/50 opacity-90">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="h-2 bg-zinc-200 rounded w-16"></div>
                     </div>
                     <div className="flex justify-center -my-1"><div className="w-px h-4 bg-zinc-300 relative"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-b border-r border-zinc-400"></div></div></div>
                     
                     <div className="bg-white rounded-lg p-2.5 shadow-sm flex items-center gap-3 border border-white/50 opacity-80">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="h-2 bg-zinc-200 rounded w-12"></div>
                     </div>
                     <div className="flex justify-center -my-1"><div className="w-px h-4 bg-zinc-300 relative"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-b border-r border-zinc-400"></div></div></div>
                     
                     <div className="bg-white rounded-lg p-2.5 shadow-sm flex items-center gap-3 border border-white/50 opacity-70">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div className="h-2 bg-zinc-200 rounded w-10"></div>
                     </div>
                  </div>
                </div>
              </div>
            </main>
          </>
        )}

        {}
        {activeGlobalTab === 'research' && (
          <main className="flex-1 overflow-y-auto bg-white flex flex-col items-center p-12 relative">
             <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12 mt-12">
               <div className="flex-1 max-w-sm">
                 <h1 className="text-3xl font-medium text-zinc-800 tracking-tight mb-4 leading-tight">Try AI-powered research and see the insights for yourself</h1>
                 <p className="text-sm text-zinc-600 leading-relaxed mb-8">
                   It helps you run studies, talk to real respondents, and generate decision-ready insights in hours, not weeks.
                 </p>
                 <button className="bg-[#312b36] hover:bg-[#252129] transition-colors text-white rounded-md px-6 py-3 font-semibold text-sm shadow-sm mb-4">
                   Preview a real example
                 </button>
               </div>
               
               <div className="flex-1 w-full bg-gradient-to-r from-purple-900 to-[#2A2338] rounded-xl p-6 shadow-xl flex items-center justify-center h-[320px]">
                 <div className="bg-blue-50 rounded-lg w-full max-w-[360px] h-[220px] shadow-lg relative overflow-hidden flex flex-col p-6">
                    <div className="text-xs font-bold text-blue-900 mb-8 italic uppercase">Roll</div>
                    <div className="text-xl font-medium text-blue-900 max-w-[200px] mb-6">How familiar are you with e-bikes?</div>
                    
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-sm">
                          <Mic className="w-3 h-3" />
                       </div>
                       <span className="text-sm font-medium text-purple-600">Listening...</span>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 w-28 h-20 bg-zinc-200 rounded overflow-hidden shadow border border-white/20">
                       <div className="w-full h-full bg-[#cc7a40] flex items-center justify-center">
                          <Users className="w-8 h-8 text-white/50" />
                       </div>
                    </div>
                 </div>
               </div>
             </div>
             
             <div className="w-full max-w-4xl mt-24">
                <h2 className="text-xl font-medium text-zinc-800 mb-6">See other use cases in action</h2>
             </div>
          </main>
        )}

      </div>

      {}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create a new typeform"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border-2 border-blue-600 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer bg-blue-50/50">
            <Plus className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-semibold">Start from scratch</h4>
            <p className="text-xs text-zinc-500 mt-2">Create a blank form</p>
          </div>
          <div className="border border-zinc-200 rounded-xl p-6 flex flex-col items-center text-center cursor-not-allowed bg-zinc-50 opacity-60">
            <Copy className="w-8 h-8 text-zinc-400 mb-3" />
            <h4 className="font-semibold">Templates</h4>
            <p className="text-xs text-zinc-500 mt-2">Coming Soon</p>
          </div>
          <div className="border border-zinc-200 rounded-xl p-6 flex flex-col items-center text-center cursor-not-allowed bg-zinc-50 opacity-60">
            <Activity className="w-8 h-8 text-zinc-400 mb-3" />
            <h4 className="font-semibold">Create with AI</h4>
            <p className="text-xs text-zinc-500 mt-2">Coming Soon</p>
          </div>
        </div>
        <form onSubmit={handleCreateForm} className="space-y-6 pt-4 border-t border-zinc-200">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Give it a name</Label>
            <Input
              id="title"
              placeholder="e.g. Customer Satisfaction Survey"
              value={newFormTitle}
              onChange={(e) => setNewFormTitle(e.target.value)}
              autoFocus
              className="h-12 text-lg"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !newFormTitle.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isCreating ? "Creating..." : "Continue"}
            </Button>
          </div>
        </form>
      </Modal>
      
      <DeleteConfirmModal
        isOpen={!!formToDelete}
        onClose={() => !isDeleting && setFormToDelete(null)}
        onConfirm={confirmDeleteForm}
        title="Delete this form?"
        loading={isDeleting}
      />
      
      {formToDuplicate && (
        <DuplicateFormModal
          isOpen={!!formToDuplicate}
          onClose={() => !isDuplicating && setFormToDuplicate(null)}
          onConfirm={confirmDuplicateForm}
          originalTitle={formToDuplicate.title}
          loading={isDuplicating}
        />
      )}
    </div>
  )
}
