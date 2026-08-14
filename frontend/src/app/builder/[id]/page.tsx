"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { GripVertical, Plus, Trash2, Check, Settings, Eye, ArrowLeft, Palette, GitBranch, ChevronDown, Send, Loader2, Mic, MoreHorizontal, ChevronLeft, ChevronRight, Share2, Play } from "lucide-react"
import toast from "react-hot-toast"

import { fetchForm, fetchQuestions, createQuestion, updateQuestion, deleteQuestion, reorderQuestions, updateFormStatus, updateFormTheme, createLogicRule, deleteLogicRule, updateLogicRule } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SortableItem } from "@/components/builder/SortableItem"
import { WorkflowTab } from "@/components/builder/WorkflowTab"
import { ConnectTab } from "@/components/builder/ConnectTab"
import { ShareTab } from "@/components/builder/ShareTab"
import { ResultsTab } from "@/components/builder/ResultsTab"
import { AddQuestionModal } from "@/components/builder/AddQuestionModal"
import { PublishSuccessAnimation } from "@/components/builder/PublishSuccessAnimation"
import { Logo } from "@/components/ui/logo"
import { AnimatePresence } from "framer-motion"

const QUESTION_TYPES = [
  { value: "short_text", label: "Short Text" },
  { value: "long_text", label: "Long Text" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "dropdown", label: "Dropdown" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "yes_no", label: "Yes/No" },
  { value: "rating", label: "Rating" },
  { value: "file_upload", label: "File Upload" }
]

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  
  const { id: formId } = use(params)

  const [form, setForm] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  
  const [activeTopTab, setActiveTopTab] = useState<'content' | 'workflow' | 'connect' | 'share' | 'results'>('content')
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = useState<'question' | 'design'>('question')
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false)
  
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  
  const [previewMode, setPreviewMode] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const loadData = async () => {
      try {
        const [formData, questionsData] = await Promise.all([
          fetchForm(formId),
          fetchQuestions(formId)
        ])
        setForm(formData)
        setQuestions(questionsData)
        if (questionsData.length > 0) {
          setActiveQuestionId(questionsData[0].id)
        }
      } catch (error) {
        toast.error("Failed to load form data")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [formId, router])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      
      const newQuestions = arrayMove(questions, oldIndex, newIndex)
      setQuestions(newQuestions)
      
      
      try {
        await reorderQuestions(formId, newQuestions.map(q => q.id))
      } catch (error) {
        toast.error("Failed to save order")
      }
    }
  }

  const handleAddQuestion = async (type: string = "short_text") => {
    try {
      const newQ = await createQuestion(formId, {
        type: type,
        title: "New Question",
        order: questions.length
      })
      setQuestions([...questions, newQ])
      setActiveQuestionId(newQ.id)
      toast.success("✓ Question saved")
    } catch (error) {
      toast.error("Failed to add question")
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return
    try {
      await deleteQuestion(id)
      const newQuestions = questions.filter(q => q.id !== id)
      setQuestions(newQuestions)
      if (activeQuestionId === id) {
        setActiveQuestionId(newQuestions.length > 0 ? newQuestions[0].id : null)
      }
      toast.success("Question deleted")
    } catch (error) {
      toast.error("Failed to delete question")
    }
  }

  const handleUpdateQuestion = async (id: string, updates: any) => {
    
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
    setSaving(true)
    try {
      await updateQuestion(id, updates)
    } catch (error) {
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }
  
  const handleTogglePublish = async () => {
    const newStatus = form.status === "published" ? "draft" : "published"
    try {
      const updated = await updateFormStatus(form.id, newStatus)
      setForm({ ...form, status: updated.status, published_at: updated.published_at })
      toast.success(newStatus === 'published' ? "✓ Form published" : "Form unpublished")
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleShare = async () => {
    if (!isLive || hasUnpublishedChanges) {
      setIsPublishing(true)
      try {
        const updated = await updateFormStatus(form.id, 'published')
        setForm({ ...form, status: updated.status, published_at: updated.published_at })
        setIsPublishing(false)
        setShowSuccessAnimation(true)
      } catch (error) {
        toast.error("Failed to publish")
        setIsPublishing(false)
      }
    } else {
      setActiveTopTab('share')
    }
  }

  const handleUpdateTheme = async (themeKey: string, value: string) => {
    if (!form) return
    const newTheme = { ...(form.theme || {}), [themeKey]: value }
    setForm({ ...form, theme: newTheme })
    try {
      await updateFormTheme(form.id, newTheme)
    } catch (error) {
      toast.error("Failed to save theme")
    }
  }

  const handleAddLogicRule = async () => {
    if (!activeQuestion) return
    const rule = { condition: "equals", value: "", target_question_id: "" }
    try {
      const saved = await createLogicRule(activeQuestion.id, rule)
      const updatedQ = { ...activeQuestion, logic_rules: [...(activeQuestion.logic_rules || []), saved] }
      setQuestions(questions.map(q => q.id === activeQuestion.id ? updatedQ : q))
    } catch (error) {
      toast.error("Failed to add logic rule")
    }
  }

  const handleDeleteLogicRule = async (ruleId: string) => {
    if (!activeQuestion) return
    try {
      await deleteLogicRule(ruleId)
      const updatedQ = { ...activeQuestion, logic_rules: (activeQuestion.logic_rules || []).filter((r: any) => r.id !== ruleId) }
      setQuestions(questions.map(q => q.id === activeQuestion.id ? updatedQ : q))
    } catch (error) {
      toast.error("Failed to delete rule")
    }
  }

  const handleUpdateLogicRule = async (ruleId: string, updates: any) => {
    if (!activeQuestion) return
    try {
      const saved = await updateLogicRule(ruleId, updates)
      const updatedQ = { 
        ...activeQuestion, 
        logic_rules: (activeQuestion.logic_rules || []).map((r: any) => r.id === ruleId ? saved : r) 
      }
      setQuestions(questions.map(q => q.id === activeQuestion.id ? updatedQ : q))
    } catch (error) {
      toast.error("Failed to update logic rule")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <div className="w-64 border-r border-zinc-200 bg-[var(--surface)] p-4 space-y-4">
          <div className="h-8 bg-zinc-200 rounded animate-pulse w-full"></div>
          <div className="space-y-2 mt-8">
            <div className="h-10 bg-zinc-200 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-zinc-200 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-zinc-200 rounded animate-pulse w-full"></div>
          </div>
        </div>
        <div className="flex-1 p-8 bg-[var(--background)] flex justify-center items-center">
          <div className="w-[375px] h-[650px] bg-white rounded-xl shadow-sm border border-zinc-100 flex flex-col p-8 space-y-6">
             <div className="h-8 bg-zinc-100 rounded animate-pulse w-3/4"></div>
             <div className="h-4 bg-zinc-50 rounded animate-pulse w-1/2"></div>
             <div className="mt-8 space-y-3">
               <div className="h-12 bg-zinc-50 rounded animate-pulse w-full"></div>
               <div className="h-12 bg-zinc-50 rounded animate-pulse w-full"></div>
             </div>
          </div>
        </div>
      </div>
    )
  }

  const activeQuestion = questions.find(q => q.id === activeQuestionId)

  const isLive = form?.status === 'published'
  const hasUnpublishedChanges = isLive && form?.updated_at && form?.published_at && new Date(form.updated_at) > new Date(form.published_at)
  return (
    <div className="flex h-screen overflow-hidden bg-white flex-col font-sans">
      {}
      <header className="h-14 border-b border-zinc-200 bg-[var(--surface)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          <Link href="/" className="inline-flex text-[var(--text-secondary)] hover:text-[var(--text-primary)] items-center transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-100">
            <Logo className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium hidden md:inline">Forms</span>
          </Link>
          <span className="text-zinc-300 hidden md:inline text-sm font-medium">&gt;</span>
          
          {isEditingTitle ? (
            <Input 
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={async () => {
                const newTitle = tempTitle || "Untitled form"
                setForm({...form, title: newTitle})
                setIsEditingTitle(false)
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/forms/${form.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: newTitle })
                  })
                } catch (e) {}
              }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const newTitle = tempTitle || "Untitled form"
                  setForm({...form, title: newTitle})
                  setIsEditingTitle(false)
                  try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/forms/${form.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: newTitle })
                    })
                  } catch (e) {}
                }
              }}
              className="text-sm font-medium h-8 w-[200px] md:w-[300px] px-2 ml-1 shadow-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          ) : (
            <button 
              onClick={() => {
                setTempTitle(form?.title || "")
                setIsEditingTitle(true)
              }}
              className="text-sm font-medium text-zinc-900 hover:bg-zinc-100 px-2 py-1.5 rounded-md ml-1 truncate max-w-[200px] md:max-w-[300px]"
            >
              {form?.title || "Untitled form"}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-6 justify-center flex-1">
          {(['content', 'workflow', 'connect', 'share', 'results'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTopTab(tab)}
              className={`text-sm font-medium capitalize h-14 flex items-center border-b-2 transition-colors ${
                activeTopTab === tab 
                  ? 'border-zinc-900 text-zinc-900' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-end flex-1">
          {saving && <span className="text-xs text-zinc-500 hidden sm:flex items-center gap-1 mr-2"><Check className="h-3 w-3"/> Saved</span>}
          
          <div className="hidden lg:flex items-center mr-2">
            {!isLive ? (
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 bg-zinc-100 px-2 py-1 rounded">Draft</span>
            ) : hasUnpublishedChanges ? (
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">Live + Changes</span>
            ) : (
              <span className="text-[10px] font-bold tracking-wider uppercase text-green-700 bg-green-50 px-2 py-1 rounded">Live</span>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 hidden sm:flex ${previewMode ? 'bg-zinc-100' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" /> {previewMode ? 'Close Preview' : 'Preview'}
          </Button>

          <Button 
            size="sm" 
            className="h-8 rounded-md px-4 bg-zinc-900 hover:bg-zinc-800 text-white min-w-[80px] overflow-hidden"
            onClick={handleShare}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <span className="flex items-center gap-2 relative">
                 <Send className="w-3.5 h-3.5 text-purple-300 animate-sparrow-fly" />
                 Publishing...
              </span>
            ) : (
              (!isLive || hasUnpublishedChanges) ? 'Publish' : 'Share'
            )}
          </Button>

          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ml-2 shrink-0">US</div>
        </div>
      </header>

      {}
      {previewMode ? (
        <div className="flex-1 bg-zinc-200/50 flex flex-col items-center p-8 relative overflow-hidden">
          <div className="flex items-center gap-1 mb-6 bg-white rounded-lg shadow-sm border border-zinc-200 p-1">
             <button onClick={() => setPreviewDevice('desktop')} className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${previewDevice === 'desktop' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>Desktop</button>
             <button onClick={() => setPreviewDevice('mobile')} className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${previewDevice === 'mobile' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>Mobile</button>
          </div>
          <div className={`bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300 flex-1 w-full flex flex-col ${previewDevice === 'mobile' ? 'max-w-[375px] max-h-[812px]' : 'max-w-6xl'}`}>
             <iframe src={`/form/${form?.slug}?preview=true`} className="w-full h-full border-0 flex-1" />
          </div>
        </div>
      ) : activeTopTab === 'content' && (
        <div className="flex flex-1 overflow-hidden bg-zinc-50">
          {}
          <div className="hidden md:flex w-64 border-r border-zinc-200 bg-[var(--surface)] flex-col z-10 shrink-0">
            <div className="p-4 border-b border-zinc-100">
              <button className="flex items-center justify-between w-full text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md px-3 py-1.5 shadow-sm hover:bg-zinc-50">
                <span className="flex items-center gap-2"><GripVertical className="w-4 h-4 text-zinc-400" /> Universal mode</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 mb-3 px-1">Pages</h3>
                <div className="bg-zinc-50 rounded-lg p-2 mb-2">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                    {questions.map((q, index) => (
                      <SortableItem
                        key={q.id}
                        id={q.id}
                        question={q}
                        index={index}
                        isActive={activeQuestionId === q.id}
                        onClick={() => setActiveQuestionId(q.id)}
                        onDelete={handleDeleteQuestion}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              <button 
                onClick={() => setIsAddQuestionModalOpen(true)} 
                className="w-full flex items-center justify-center gap-2 mt-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 py-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> add content
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-zinc-200 w-16 mx-auto mb-4" />
          
          <div className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm border border-zinc-100">
            <span className="text-sm font-semibold text-zinc-900">Endings</span>
            <button className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-md p-1">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

          {}
          <div className="flex-1 overflow-y-auto relative p-8 flex flex-col items-center justify-center min-h-[500px] bg-[var(--background)]">
            {activeQuestion ? (
              <>
                <div className="w-[375px] h-[650px] bg-white shadow-sm flex flex-col relative group overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => handleDeleteQuestion(activeQuestion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="p-8 flex flex-col flex-1 justify-center space-y-6">
                    <div className="flex gap-3 items-start">
                      <div className="bg-zinc-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded mt-1 shrink-0">
                        {questions.findIndex(q => q.id === activeQuestion.id) + 1}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={activeQuestion.title || ""}
                          onChange={(e) => handleUpdateQuestion(activeQuestion.id, { title: e.target.value })}
                          placeholder="Your question here. Recall information with @"
                          className="text-xl font-medium border-0 focus-visible:ring-0 px-0 h-auto rounded-none w-full shadow-none placeholder:text-zinc-300 italic"
                        />
                        <Input
                          value={activeQuestion.description || ""}
                          onChange={(e) => handleUpdateQuestion(activeQuestion.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className="text-sm text-zinc-400 border-0 focus-visible:ring-0 px-0 h-auto rounded-none w-full mt-1 shadow-none"
                        />
                      </div>
                    </div>

                    <div className="pl-8">
                      {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'dropdown') ? (
                        <div className="space-y-3">
                          {(activeQuestion.options?.choices || ["Option 1", "Option 2"]).map((opt: string, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded border border-zinc-300 flex items-center justify-center text-xs font-bold text-blue-600 bg-blue-50/50 uppercase">
                                {String.fromCharCode(65 + i)}
                              </div>
                              <Input 
                                value={opt}
                                onChange={(e) => {
                                  const newChoices = [...(activeQuestion.options?.choices || ["Option 1", "Option 2"])]
                                  newChoices[i] = e.target.value
                                  handleUpdateQuestion(activeQuestion.id, { options: { ...activeQuestion.options, choices: newChoices } })
                                }}
                                className="bg-zinc-50/50 focus-visible:ring-1 focus-visible:ring-zinc-400 h-10 border-transparent hover:border-zinc-200 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      ) : activeQuestion.type === 'rating' ? (
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className="w-10 h-10 rounded border border-zinc-200 flex items-center justify-center text-xl text-zinc-300">★</div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-10 w-full border-b-2 border-zinc-900 flex items-center text-zinc-300 text-lg pb-1">
                          name@example.com
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-white border-2 border-pink-200 rounded-xl px-4 py-3 w-[375px] flex items-center gap-3 shadow-sm text-zinc-400">
                  <div className="w-4 h-4 rounded-full border-2 border-current" />
                  <span className="text-sm">Chat to create</span>
                </div>
              </>
            ) : (
              <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center relative -mt-10">
                <div className="text-sm font-semibold text-zinc-500 mb-2">Typeform AI</div>
                <h2 className="text-[28px] font-normal text-zinc-800 mb-8">What would you like to create?</h2>
                
                <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border-[1.5px] border-[#d8b4e2] p-1.5 focus-within:ring-4 focus-within:ring-[#f3e6f7] transition-all relative group cursor-text">
                  <div className="border border-transparent rounded-lg p-3 min-h-[160px] flex flex-col">
                    <textarea 
                      placeholder="Explain the goal of your form." 
                      className="w-full resize-none border-none outline-none text-zinc-700 bg-transparent flex-1 text-base placeholder:text-zinc-400"
                    />
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <button className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"><Mic className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                      <button className="p-2 bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 rounded-md transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button 
                    onClick={() => setIsAddQuestionModalOpen(true)}
                    className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-lg text-sm font-medium text-zinc-700"
                  >
                    Start from scratch
                  </button>
                  <button className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-lg text-sm font-medium text-zinc-700 flex items-center gap-2">
                    Sync to CRM 
                    <div className="flex -space-x-1 ml-1">
                      <div className="w-5 h-5 rounded-full bg-[#ff7a59] text-white flex items-center justify-center border border-white shrink-0 text-[8px] font-bold">HS</div>
                      <div className="w-5 h-5 rounded-full bg-[#00a1e0] text-white flex items-center justify-center border border-white shrink-0 text-[8px] font-bold">SF</div>
                    </div>
                  </button>
                </div>

                {}
                <button className="absolute -left-32 top-1/2 -translate-y-1/2 w-8 h-12 bg-zinc-300/50 hover:bg-zinc-300 text-white flex items-center justify-center rounded-l">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="absolute -right-32 top-1/2 -translate-y-1/2 w-8 h-12 bg-zinc-300/50 hover:bg-zinc-300 text-white flex items-center justify-center rounded-r">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {}
          {activeQuestion && (
            <div className="hidden lg:flex w-80 border-l border-zinc-200 bg-white flex-col z-10 shrink-0">
              <div className="flex border-b border-zinc-100">
                <button 
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeSidebarTab === 'question' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                  onClick={() => setActiveSidebarTab('question')}
                >
                  Question
                </button>
                <button 
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeSidebarTab === 'design' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                  onClick={() => setActiveSidebarTab('design')}
                >
                  Design
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeSidebarTab === 'question' ? (
                  <div className="p-5 space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-bold text-zinc-900 flex items-center gap-1">Question <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 text-zinc-400 text-[9px] flex items-center justify-center">?</div></span>
                    </div>

                    <div className="bg-zinc-100 rounded-lg p-1 flex">
                      <button className="flex-1 bg-white shadow-sm rounded text-sm font-medium py-1.5 text-zinc-900">Text</button>
                      <button className="flex-1 rounded text-sm font-medium py-1.5 text-zinc-500 hover:text-zinc-900 flex items-center justify-center gap-1">Video</button>
                    </div>

                    <div className="space-y-4">
                      <span className="text-sm font-semibold text-zinc-900">Answer</span>
                      <select 
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 shadow-sm"
                        value={activeQuestion.type}
                        onChange={(e) => handleUpdateQuestion(activeQuestion.id, { type: e.target.value })}
                      >
                        {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-5 pt-2">
                      <div className="flex items-center justify-between">
                        <Label 
                          className="cursor-pointer font-medium text-sm text-zinc-700"
                          onClick={(e) => handleUpdateQuestion(activeQuestion.id, { is_required: !activeQuestion.is_required })}
                        >
                          Required
                        </Label>
                        <div className={`w-8 h-4 flex items-center bg-zinc-200 rounded-full p-0.5 cursor-pointer ${activeQuestion.is_required ? 'bg-zinc-900' : ''}`} onClick={(e) => handleUpdateQuestion(activeQuestion.id, { is_required: !activeQuestion.is_required })}>
                          <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${activeQuestion.is_required ? 'translate-x-4' : ''}`} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Label className="font-medium text-sm cursor-not-allowed">Answer validation</Label>
                          <div className="w-3.5 h-3.5 rounded-full border border-current text-[9px] flex items-center justify-center">?</div>
                        </div>
                        <div className="w-8 h-4 flex items-center bg-zinc-100 rounded-full p-0.5"><div className="bg-white w-3 h-3 rounded-full shadow-sm" /></div>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Label className="font-medium text-sm cursor-not-allowed">Custom placeholder text</Label>
                          <div className="w-3.5 h-3.5 rounded-full border border-current text-[9px] flex items-center justify-center">?</div>
                        </div>
                        <div className="w-8 h-4 flex items-center bg-zinc-100 rounded-full p-0.5"><div className="bg-white w-3 h-3 rounded-full shadow-sm" /></div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-5 flex items-center justify-between text-zinc-900">
                       <div className="flex items-center gap-1">
                          <Label className="font-medium text-sm">Map to contacts</Label>
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-300 text-zinc-400 text-[9px] flex items-center justify-center">?</div>
                       </div>
                       <div className="w-8 h-4 flex items-center bg-zinc-200 rounded-full p-0.5"><div className="bg-white w-3 h-3 rounded-full shadow-sm" /></div>
                    </div>

                    <div className="border-t border-zinc-100 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-900">Image or video</span>
                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-md p-1 border border-zinc-200">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-900">Branching</span>
                        <button onClick={() => setActiveTopTab('workflow')} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 rounded-md p-1 border border-zinc-200">
                          <GitBranch className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Colors</Label>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-zinc-600 mb-1 block">Background</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={form?.theme?.bgColor || "#ffffff"}
                              onChange={(e) => handleUpdateTheme('bgColor', e.target.value)}
                              className="h-10 w-16 p-1 rounded cursor-pointer border-zinc-200"
                            />
                            <Input 
                              value={form?.theme?.bgColor || "#ffffff"}
                              onChange={(e) => handleUpdateTheme('bgColor', e.target.value)}
                              className="flex-1 h-10 border-zinc-200"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-zinc-600 mb-1 block">Text</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={form?.theme?.textColor || "#000000"}
                              onChange={(e) => handleUpdateTheme('textColor', e.target.value)}
                              className="h-10 w-16 p-1 rounded cursor-pointer border-zinc-200"
                            />
                            <Input 
                              value={form?.theme?.textColor || "#000000"}
                              onChange={(e) => handleUpdateTheme('textColor', e.target.value)}
                              className="flex-1 h-10 border-zinc-200"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-zinc-600 mb-1 block">Button</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              value={form?.theme?.buttonColor || "#000000"}
                              onChange={(e) => handleUpdateTheme('buttonColor', e.target.value)}
                              className="h-10 w-16 p-1 rounded cursor-pointer border-zinc-200"
                            />
                            <Input 
                              value={form?.theme?.buttonColor || "#000000"}
                              onChange={(e) => handleUpdateTheme('buttonColor', e.target.value)}
                              className="flex-1 h-10 border-zinc-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!previewMode && activeTopTab === 'workflow' && (
        <WorkflowTab 
          questions={questions} 
          handleAddLogicRule={handleAddLogicRule}
          handleUpdateLogicRule={handleUpdateLogicRule}
          handleDeleteLogicRule={handleDeleteLogicRule}
        />
      )}

      {!previewMode && activeTopTab === 'connect' && <ConnectTab />}
      
      {!previewMode && activeTopTab === 'share' && <ShareTab form={form} onPublish={handleTogglePublish} />}

      {!previewMode && activeTopTab === 'results' && <ResultsTab formId={formId} />}

      <AddQuestionModal 
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        onAddQuestion={handleAddQuestion}
      />

      <AnimatePresence>
        {showSuccessAnimation && (
          <PublishSuccessAnimation 
            onComplete={() => {
              setShowSuccessAnimation(false)
              setActiveTopTab('share')
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
