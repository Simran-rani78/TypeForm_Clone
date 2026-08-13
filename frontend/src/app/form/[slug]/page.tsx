"use client"

import { useEffect, useState, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronUp, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"

import { fetchFormBySlug, submitResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params)
  
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [started, setStarted] = useState(false) // Tracking state

  // Auto-focus input on mount
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    const loadForm = async () => {
      try {
        const formData = await fetchFormBySlug(slug)
        if (formData.status !== 'published') {
          toast.error("This form is not currently accepting responses.")
        }
        setForm(formData)
        // Track View
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/forms/${formData.id}/track?event=view`, { method: "POST" }).catch(() => {})
      } catch (error) {
        toast.error("Form not found")
      } finally {
        setLoading(false)
      }
    }
    loadForm()
  }, [slug])

  useEffect(() => {
    // Focus the input whenever current index changes
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300) // delay to let animation finish
    }
  }, [currentIndex])

  const questions = form?.questions || []
  const isComplete = currentIndex >= questions.length
  
  // Progress calculation
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0

  const answersRef = useRef(answers)
  
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const handleNext = (overrideValue?: any) => {
    const currentQ = questions[currentIndex]
    const val = overrideValue !== undefined ? overrideValue : answersRef.current[currentQ.id]
    
    if (currentQ?.is_required && (val === undefined || val === "" || (typeof val === 'string' && val.trim() === ""))) {
      toast.error("⚠ Please answer the required question")
      return
    }

    if (val !== undefined && val !== "") {
      if (currentQ?.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(val))) {
          toast.error("Please enter a valid email address.")
          return
        }
      }
      if (currentQ?.type === 'number') {
        if (isNaN(Number(val))) {
          toast.error("Please enter a valid number.")
          return
        }
      }
    }

    // Logic Jumps
    let nextIndex = currentIndex + 1
    if (currentQ.logic_rules && currentQ.logic_rules.length > 0) {
      const match = currentQ.logic_rules.find((rule: any) => String(rule.value).toLowerCase() === String(val).toLowerCase())
      if (match) {
        const targetIndex = questions.findIndex((q: any) => q.id === match.target_question_id)
        if (targetIndex !== -1) {
          nextIndex = targetIndex
        }
      }
    }

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        question_id: qId,
        value: answers[qId]
      }))
      await submitResponse(form.id, formattedAnswers)
      setIsSubmitted(true)
    } catch (error) {
      toast.error("Failed to submit response.")
    } finally {
      setSubmitting(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept Enter if typing in textarea unless it's Ctrl+Enter
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'textarea' && !e.ctrlKey && !e.metaKey) {
          return; // Let user type new lines
        }
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, questions])

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse"></div>
            <div className="h-8 bg-zinc-100 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="h-4 bg-zinc-50 rounded animate-pulse w-1/2 ml-12"></div>
          <div className="mt-12 space-y-4 ml-12">
            <div className="h-12 bg-zinc-50 rounded animate-pulse w-full max-w-xl"></div>
            <div className="h-16 bg-zinc-100 rounded animate-pulse w-32 mt-8"></div>
          </div>
        </div>
      </div>
    )
  }
  if (!form) return <div className="h-screen w-screen flex items-center justify-center bg-white text-lg text-red-500">Form not found or unavailable.</div>
  
  if (form.status !== 'published') {
    return <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold text-zinc-900 mb-2">This form is currently closed.</h1>
      <p className="text-zinc-500 text-lg">The creator has unpublished this form.</p>
    </div>
  }

  if (isSubmitted) {
    const theme = form.theme || { bg: "#ffffff", text: "#171717", button: "#2563eb", font: "inter" }
    const fontClass = theme.font === "roboto" ? "font-sans" : theme.font === "playfair" ? "font-serif" : theme.font === "mono" ? "font-mono" : "font-sans"

    return (
      <div 
        className={`h-screen w-screen flex flex-col items-center justify-center transition-opacity duration-1000 ${fontClass}`}
        style={{ backgroundColor: theme.bg, color: theme.text }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm" style={{ backgroundColor: theme.button, color: theme.bg }}>
            <Check className="h-12 w-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Thank you!</h1>
          <p className="text-2xl opacity-70">Your response has been submitted successfully.</p>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  
  if (!currentQuestion) {
    return <div className="h-screen w-screen flex items-center justify-center">No questions in this form.</div>
  }

  const answerValue = answers[currentQuestion.id] || ""

  const handleAnswerChange = (val: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: val })
    // Track Start
    if (!started) {
      setStarted(true)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/forms/${form.id}/track?event=start`, { method: "POST" }).catch(() => {})
    }
  }

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large (max 2MB).")
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      handleAnswerChange(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  // Apply Theme
  const theme = form.theme || { bg: "#ffffff", text: "#171717", button: "#2563eb", font: "inter" }
  const fontClass = theme.font === "roboto" ? "font-sans" : theme.font === "playfair" ? "font-serif" : theme.font === "mono" ? "font-mono" : "font-sans"

  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden ${fontClass}`} 
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Progress Bar */}
      <div className="h-1 w-full bg-black/5 fixed top-0 z-50">
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, backgroundColor: theme.button }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 md:px-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col"
          >
            <div className="flex items-start gap-4 mb-8">
              <span className="font-semibold text-2xl pt-1" style={{ color: theme.button }}>
                {currentIndex + 1}
                <span className="ml-1 opacity-60">→</span>
              </span>
              <div className="space-y-2 flex-1">
                <h2 className="text-3xl md:text-4xl font-normal leading-tight">
                  {currentQuestion.title}
                  {currentQuestion.is_required && <span className="text-red-500 ml-2">*</span>}
                </h2>
                {currentQuestion.description && (
                  <p className="text-lg opacity-60">{currentQuestion.description}</p>
                )}
              </div>
            </div>

            <div className="ml-12 md:ml-14">
              {/* Render input based on type */}
              {currentQuestion.type === 'short_text' && <Input 
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  placeholder="Type your answer here..."
                  className="text-2xl md:text-3xl border-none border-b-2 border-zinc-200 focus-visible:border-blue-600 focus-visible:ring-0 rounded-none px-0 py-3 h-auto shadow-none w-full max-w-2xl bg-transparent placeholder:text-zinc-300"
                  value={answerValue}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              }
              
              {currentQuestion.type === 'long_text' && <textarea 
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  placeholder="Type your answer here... (Shift+Enter for new line)"
                  className="text-2xl md:text-3xl w-full max-w-2xl border-none border-b-2 border-zinc-200 focus:border-blue-600 focus:ring-0 rounded-none px-0 py-3 min-h-[120px] resize-none bg-transparent outline-none placeholder:text-zinc-300"
                  value={answerValue}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              }

              {currentQuestion.type === 'email' && (
                <Input 
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="email"
                  placeholder="name@example.com"
                  className="text-2xl md:text-3xl border-none border-b-2 border-zinc-200 focus-visible:border-blue-600 focus-visible:ring-0 rounded-none px-0 py-3 h-auto shadow-none w-full max-w-2xl bg-transparent placeholder:text-zinc-300"
                  value={answerValue}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              )}

              {currentQuestion.type === 'number' && (
                <Input 
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="number"
                  placeholder="0"
                  className="text-2xl md:text-3xl border-none border-b-2 border-zinc-200 focus-visible:border-blue-600 focus-visible:ring-0 rounded-none px-0 py-3 h-auto shadow-none w-full max-w-2xl bg-transparent placeholder:text-zinc-300"
                  value={answerValue}
                  onChange={(e) => handleAnswerChange(Number(e.target.value))}
                />
              )}

              {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'dropdown') && (
                <div className="space-y-3 max-w-md">
                  {currentQuestion.options?.choices?.map((choice: string, idx: number) => {
                    const isSelected = answerValue === choice
                    const keyChar = String.fromCharCode(65 + idx)
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleAnswerChange(choice)
                          // Optionally auto-advance after choice
                          setTimeout(() => handleNext(choice), 400)
                        }}
                        className={`w-full text-left px-4 py-3 rounded-md border-2 transition-all flex items-center gap-4 ${
                          isSelected 
                            ? "border-blue-600 bg-blue-50/50 text-blue-900" 
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-sm border flex items-center justify-center text-xs font-semibold ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-300 text-zinc-500 bg-white'}`}>
                          {keyChar}
                        </div>
                        <span className="text-lg">{choice}</span>
                        {isSelected && <Check className="ml-auto h-5 w-5 text-blue-600" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQuestion.type === 'rating' && (
                <div className="flex gap-4 flex-wrap">
                  {Array.from({length: currentQuestion.options?.steps || 5}).map((_, i) => {
                    const num = i + 1
                    const isSelected = answerValue === num
                    return (
                      <button
                        key={num}
                        onClick={() => {
                          handleAnswerChange(num)
                          setTimeout(() => handleNext(num), 400)
                        }}
                        className={`w-14 h-14 rounded-md border-2 text-xl font-medium transition-all flex items-center justify-center ${
                          isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 hover:border-zinc-400 bg-zinc-50"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQuestion.type === 'yes_no' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => { handleAnswerChange(true); setTimeout(() => handleNext(true), 400) }}
                    className={`flex-1 max-w-[160px] py-4 rounded-md border-2 text-xl font-medium transition-all ${
                      answerValue === true ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-6 h-6 rounded-sm border flex items-center justify-center text-xs font-semibold border-zinc-300 text-zinc-500 bg-white">Y</div>
                       Yes
                    </div>
                  </button>
                  <button
                    onClick={() => { handleAnswerChange(false); setTimeout(() => handleNext(false), 400) }}
                    className={`flex-1 max-w-[160px] py-4 rounded-md border-2 text-xl font-medium transition-all ${
                      answerValue === false ? "border-blue-600 bg-blue-50 text-blue-700" : "border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-6 h-6 rounded-sm border flex items-center justify-center text-xs font-semibold border-zinc-300 text-zinc-500 bg-white">N</div>
                       No
                    </div>
                  </button>
                </div>
              )}

              {currentQuestion.type === 'file_upload' && (
                <div className="max-w-md">
                  <input 
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {answerValue && <p className="mt-2 text-sm text-green-600 font-medium">✓ File attached</p>}
                </div>
              )}

              <div className="mt-8 flex items-center gap-4">
                <Button 
                  onClick={() => handleNext()} 
                  disabled={submitting}
                  className="rounded-md px-6 py-6 text-lg font-bold"
                  style={{ backgroundColor: theme.button, color: '#fff' }}
                >
                  {currentIndex < questions.length - 1 ? 'OK' : 'Submit'}
                  {currentIndex < questions.length - 1 && <Check className="ml-2 h-5 w-5" />}
                </Button>
                <div className="text-xs opacity-60 flex items-center gap-1">
                  press <strong>Enter ↵</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 right-0 p-4 flex items-center gap-4 w-full justify-end">
        <div className="absolute left-4 bottom-4">
          <a href="#" className="flex items-center gap-2 bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold">
            Powered by Typeform Clone
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold opacity-60">
            {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
          </span>
          <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0} className="rounded-l-md border-r-0 rounded-r-none h-10 w-12 bg-black/5 border-none hover:bg-black/10">
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleNext()} disabled={submitting} className="rounded-r-md rounded-l-none h-10 w-12 bg-black/5 border-none hover:bg-black/10">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
