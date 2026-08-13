"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Eye, BarChart, Table as TableIcon } from "lucide-react"
import toast from "react-hot-toast"

import { fetchForm, fetchQuestions, fetchResponses } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params)
  
  const [form, setForm] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // View state: 'table' or 'stats'
  const [activeTab, setActiveTab] = useState<'table' | 'stats'>('table')
  
  // Individual response modal state
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [formData, questionsData, responsesData] = await Promise.all([
          fetchForm(formId),
          fetchQuestions(formId),
          fetchResponses(formId)
        ])
        setForm(formData)
        setQuestions(questionsData)
        setResponses(responsesData)
      } catch (error) {
        toast.error("Failed to load results")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [formId])

  const handleExportCSV = () => {
    if (responses.length === 0) {
      toast.error("No responses to export")
      return
    }

    const headers = ["Submitted At", ...questions.map(q => q.title)]
    const rows = responses.map(response => {
      const row = [new Date(response.submitted_at).toLocaleString()]
      questions.forEach(q => {
        const answer = response.answers.find((a: any) => a.question_id === q.id)
        let val = answer ? answer.value : ""
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`
        }
        row.push(val)
      })
      return row.join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${form.title.replace(/\s+/g, '_')}_responses.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate statistics for choice questions
  const getStatsForQuestion = (questionId: string, type: string) => {
    if (type !== 'multiple_choice' && type !== 'dropdown' && type !== 'yes_no') return null
    
    const counts: Record<string, number> = {}
    responses.forEach(res => {
      const ans = res.answers.find((a: any) => a.question_id === questionId)
      if (ans && ans.value !== null && ans.value !== undefined) {
        const valStr = String(ans.value)
        counts[valStr] = (counts[valStr] || 0) + 1
      }
    })
    return counts
  }

  if (loading) return <div className="p-8">Loading results...</div>

  return (
    <div className="flex-1 space-y-8 p-8 pt-10 mx-auto max-w-6xl w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex">
            <Button variant="ghost" size="icon" type="button" className="-ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Results: {form?.title}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{responses.length} total responses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={() => setActiveTab('table')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'table' ? 'border-zinc-900 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}
        >
          <TableIcon className="h-4 w-4" /> Responses Table
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'stats' ? 'border-zinc-900 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}
        >
          <BarChart className="h-4 w-4" /> Summary Stats
        </button>
      </div>

      {activeTab === 'table' ? (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Submitted At</th>
                {questions.map(q => (
                  <th key={q.id} className="px-6 py-4 font-medium min-w-[200px]">
                    {q.title}
                  </th>
                ))}
                <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={questions.length + 2} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                    No responses yet.
                  </td>
                </tr>
              ) : (
                responses.map(response => (
                  <tr key={response.id} className="hover:bg-zinc-50 dark:bg-zinc-900 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(response.submitted_at).toLocaleString()}
                    </td>
                    {questions.map(q => {
                      const answer = response.answers.find((a: any) => a.question_id === q.id)
                      let displayValue = answer ? answer.value : <span className="text-zinc-300">-</span>
                      if (typeof displayValue === 'boolean') {
                         displayValue = displayValue ? 'Yes' : 'No'
                      }
                      return (
                        <td key={q.id} className="px-6 py-4 truncate max-w-[250px]">
                          {displayValue}
                        </td>
                      )
                    })}
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedResponse(response)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{responses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{form?.starts || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {form?.starts ? Math.round((responses.length / form.starts) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map(q => {
            const stats = getStatsForQuestion(q.id, q.type)
            if (!stats) return null
            
            return (
              <div key={q.id} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{q.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{q.type.replace('_', ' ')}</p>
                
                {Object.keys(stats).length === 0 ? (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">No data yet.</div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats).map(([label, count]) => {
                      const percentage = Math.round((count / responses.length) * 100)
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-zinc-700">{label === 'true' ? 'Yes' : label === 'false' ? 'No' : label}</span>
                            <span className="text-zinc-500 dark:text-zinc-400">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {questions.filter(q => ['multiple_choice', 'dropdown', 'yes_no'].includes(q.type)).length === 0 && (
            <div className="col-span-full p-8 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              No multiple choice, dropdown, or yes/no questions to generate stats for.
            </div>
          )}
        </div>
        </div>
      )}

      {/* Individual Response Modal */}
      <Modal 
        isOpen={!!selectedResponse} 
        onClose={() => setSelectedResponse(null)}
        title="Individual Response"
      >
        {selectedResponse && (
          <div className="space-y-6">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 border-b pb-4">
              Submitted at: {new Date(selectedResponse.submitted_at).toLocaleString()}
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((q) => {
                const answer = selectedResponse.answers.find((a: any) => a.question_id === q.id)
                return (
                  <div key={q.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{q.title}</div>
                    <div className="text-zinc-600">
                      {answer?.value === '[File Attached]' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/answers/${answer.id}/file`)
                              const data = await res.json()
                              if (data.data) {
                                const a = document.createElement('a')
                                a.href = data.data
                                a.download = 'upload' // can be improved by storing filename
                                a.click()
                              }
                            } catch (error) {
                              toast.error("Failed to download file")
                            }
                          }}
                        >
                          Download File
                        </Button>
                      ) : (
                        answer?.value !== undefined ? String(answer.value) : <span className="italic text-zinc-400">Skipped</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}
