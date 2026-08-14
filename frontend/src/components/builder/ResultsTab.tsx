"use client"

import React, { useEffect, useState } from "react"
import { Download, Table as TableIcon, BarChart, Trash2, Eye, X, Activity, Users, CheckCircle2, Diamond, Calendar, ChevronDown, Monitor, ArrowDown, User, Sparkles, LayoutTemplate } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"
import { cn } from "@/lib/utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export function ResultsTab({ formId }: { formId: string }) {
  const [form, setForm] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [activeSubTab, setActiveSubTab] = useState<'smart_insights' | 'insights' | 'summary' | 'responses'>('insights')
  const [selectedResponse, setSelectedResponse] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, qsRes, respRes] = await Promise.all([
          fetch(`${API_BASE_URL}/forms/${formId}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/forms/${formId}/questions`).then(r => r.json()),
          fetch(`${API_BASE_URL}/forms/${formId}/responses`).then(r => r.json())
        ])
        setForm(formRes)
        setQuestions(qsRes)
        setResponses(respRes)
      } catch (error) {
        toast.error("Failed to load results")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [formId])

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this response?")) return
    try {
      const res = await fetch(`${API_BASE_URL}/responses/${responseId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setResponses(responses.filter(r => r.id !== responseId))
      if (selectedResponse?.id === responseId) setSelectedResponse(null)
      toast.success("Response deleted")
    } catch {
      toast.error("Failed to delete response")
    }
  }

  const handleExportCSV = () => {
    if (responses.length === 0) return toast.error("No responses to export")
    const headers = ['Submitted At', ...questions.map(q => `"${q.title.replace(/"/g, '""')}"`)]
    const rows = responses.map(r => {
      const row = [new Date(r.submitted_at).toLocaleString()]
      questions.forEach(q => {
        const ans = r.answers.find((a: any) => a.question_id === q.id)
        let val = ans ? ans.value : ''
        if (typeof val === 'boolean') val = val ? 'Yes' : 'No'
        if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`
        row.push(val)
      })
      return row.join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `${form?.slug}_responses.csv`)
    a.click()
  }

  if (loading) return <div className="flex-1 flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>

  const completionRate = form?.starts ? Math.round((responses.length / form.starts) * 100) : 0

  return (
    <div className="flex-1 bg-zinc-50 flex flex-col relative h-full">
      
      {}
      <div className="bg-white border-b border-zinc-200 px-8 shrink-0 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveSubTab('smart_insights')}
            className={`flex items-center gap-1.5 h-12 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'smart_insights' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
          >
            Smart Insights <Diamond className="w-3.5 h-3.5 text-teal-600" />
          </button>
          <button 
            onClick={() => setActiveSubTab('insights')}
            className={`flex items-center gap-1.5 h-12 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'insights' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveSubTab('summary')}
            className={`flex items-center gap-1.5 h-12 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'summary' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
          >
            Summary
          </button>
          <button 
            onClick={() => setActiveSubTab('responses')}
            className={`flex items-center gap-1.5 h-12 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'responses' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
          >
            Responses
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa]">
        
        {}
        {activeSubTab !== 'smart_insights' && (
          <div className="px-8 py-4 flex items-center gap-3">
            <Dropdown 
              triggerClassName="flex items-center gap-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-50 shadow-sm"
              triggerIcon={<>All time <Calendar className="w-4 h-4 ml-1" /></>}
              dropdownClassName="left-0 w-max"
            >
              <div className="flex w-[450px] p-2">
                <div className="w-1/3 border-r border-zinc-100 pr-2 space-y-1">
                  <DropdownItem className="rounded-md bg-zinc-100 font-medium">All time</DropdownItem>
                  <DropdownItem className="rounded-md">Today</DropdownItem>
                  <DropdownItem className="rounded-md">Last week</DropdownItem>
                  <DropdownItem className="rounded-md">Last month</DropdownItem>
                  <DropdownItem className="rounded-md">Last year</DropdownItem>
                </div>
                <div className="w-2/3 pl-6 pt-2">
                  <div className="flex justify-between items-center mb-4 text-sm font-medium">
                    <button className="p-1 hover:bg-zinc-100 rounded text-zinc-500">&lt;</button>
                    August 2026
                    <button className="p-1 hover:bg-zinc-100 rounded text-zinc-500">&gt;</button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>
                  <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-sm">
                    <div className="text-zinc-300">26</div><div className="text-zinc-300">27</div><div className="text-zinc-300">28</div><div className="text-zinc-300">29</div><div className="text-zinc-300">30</div><div className="text-zinc-300">31</div><div>1</div>
                    <div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>
                    <div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div className="bg-[#312b36] text-white rounded-md mx-1 font-medium">14</div><div>15</div>
                    <div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div><div>22</div>
                    <div>23</div><div>24</div><div>25</div><div>26</div><div>27</div><div>28</div><div>29</div>
                    <div>30</div><div>31</div><div className="text-zinc-300">1</div><div className="text-zinc-300">2</div><div className="text-zinc-300">3</div><div className="text-zinc-300">4</div><div className="text-zinc-300">5</div>
                  </div>
                  <div className="flex justify-end mt-4 pt-4 gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900">Cancel</button>
                    <button className="px-4 py-1.5 text-sm font-medium bg-[#312b36] text-white rounded-md">Apply</button>
                  </div>
                </div>
              </div>
            </Dropdown>

            <Dropdown 
              triggerClassName="flex items-center gap-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-50 shadow-sm"
              triggerIcon={<><Monitor className="w-4 h-4 mr-1" /> All devices <ChevronDown className="w-3.5 h-3.5 ml-1" /></>}
              dropdownClassName="left-0"
            >
              <DropdownItem>Mobile</DropdownItem>
              <DropdownItem>Desktop</DropdownItem>
              <DropdownItem>Tablet</DropdownItem>
              <DropdownItem>Other</DropdownItem>
            </Dropdown>
          </div>
        )}

        <div className="px-8 pb-12 max-w-6xl mx-auto mt-2">
          
          {}
          {activeSubTab === 'smart_insights' && (
            <div className="flex flex-col items-center justify-center mt-20 p-12 bg-white rounded-2xl border border-zinc-200 shadow-sm text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 border border-teal-100">
                <Diamond className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-medium text-zinc-900 mb-4 tracking-tight">Smart Insights</h2>
              <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                Let AI analyze your responses automatically and uncover hidden trends. Coming soon!
              </p>
              <Button disabled className="bg-zinc-100 text-zinc-400">Generate Insights (Coming Soon)</Button>
            </div>
          )}

          {}
          {activeSubTab === 'insights' && (
            <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch min-h-[500px]">
              {}
              <div className="flex-1 p-12 flex flex-col justify-center">
                <h2 className="text-[28px] font-normal text-zinc-800 tracking-tight mb-4 leading-tight">See where users drop off</h2>
                <p className="text-[15px] text-zinc-600 mb-8 leading-relaxed max-w-md pr-4">
                  Identify the questions where people stop responding so you can optimize your form.
                </p>
                <div className="flex items-center gap-4 mb-10">
                  <button className="flex items-center gap-2 text-white bg-[#1a7065] hover:bg-[#13564e] transition-colors font-medium px-5 py-2.5 rounded shadow-sm text-sm">
                    <Diamond className="w-4 h-4" /> Upgrade plan
                  </button>
                  <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 px-5 py-2.5 rounded transition-colors shadow-sm">
                    Learn more
                  </button>
                </div>
                <p className="text-xs text-[#1a7065] font-medium max-w-sm leading-relaxed">
                  Available on these plans: Business, Talent, Growth Flow, Growth Custom
                </p>
              </div>

              {}
              <div className="w-[45%] bg-[#c2e4d9] p-8 flex items-center justify-center relative overflow-hidden rounded-r-[24px]">
                <div className="flex flex-col items-center relative z-10 w-full max-w-sm">
                  {}
                  <div className="bg-white rounded-xl p-4 w-full flex items-center gap-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] mb-8 border border-white relative z-20">
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-600 shrink-0 border border-zinc-200">
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 mb-1 leading-tight">{questions.length > 0 ? questions[0].title : 'Ready for the event of the year?'}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{form?.views || 1195} views</div>
                    </div>
                  </div>

                  {}
                  <div className="absolute top-[72px] bottom-[72px] w-px bg-zinc-700 left-1/2 -translate-x-1/2 z-0 flex flex-col items-center justify-between py-2">
                    <div className="w-1.5 h-1.5 border-b border-r border-zinc-700 rotate-45 transform translate-y-1"></div>
                    <div className="w-1.5 h-1.5 border-b border-r border-zinc-700 rotate-45 transform -translate-y-1"></div>
                  </div>

                  {}
                  <div className="bg-[#fce9e9] border border-[#facdcd] text-[#c93b3b] rounded-full px-4 py-1.5 text-[11px] font-bold flex items-center gap-1.5 mb-8 shadow-sm relative z-20 whitespace-nowrap tracking-wide">
                    <ArrowDown className="w-3 h-3" /> Drop-off: -{form?.views ? form.views - responses.length : 1174} (98%)
                  </div>

                  {}
                  <div className="bg-white rounded-xl p-4 w-full flex items-center gap-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-white relative z-20">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 mb-1 leading-tight">{questions.length > 1 ? questions[1].title : "What's your full name?"}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{responses.length > 0 ? responses.length : 21} views</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {activeSubTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Responses</p>
                    <h3 className="text-3xl font-bold text-zinc-900">{responses.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Started</p>
                    <h3 className="text-3xl font-bold text-zinc-900">{form?.starts || 0}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Completion</p>
                    <h3 className="text-3xl font-bold text-zinc-900">{completionRate}%</h3>
                  </div>
                </div>
              </div>

              {responses.length === 0 && (
                <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
                  <BarChart className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-1">No data to summarize yet</h3>
                  <p className="text-zinc-500 text-sm">Share your form to start collecting responses.</p>
                </div>
              )}
            </div>
          )}

          {}
          {activeSubTab === 'responses' && (
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <TableIcon className="w-4 h-4 text-zinc-400" />
                  {responses.length} responses
                </div>
                <Button onClick={handleExportCSV} variant="outline" size="sm" className="h-8 gap-2 bg-white">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>

              {responses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                    <TableIcon className="h-8 w-8 text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900">No responses yet</h3>
                  <p className="text-zinc-500 text-sm mt-1">When people fill out your form, their answers will appear here.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/80 sticky top-0 z-10 shadow-sm border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">#</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Submitted</th>
                        {questions.map((q, i) => (
                          <th key={q.id} className="px-6 py-4 font-semibold tracking-wider max-w-xs truncate" title={q.title}>
                            {i + 1}. {q.title}
                          </th>
                        ))}
                        <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {responses.map((response, index) => (
                        <tr key={response.id} className="hover:bg-zinc-50/80 transition-colors group">
                          <td className="px-6 py-4 font-medium text-zinc-900">{index + 1}</td>
                          <td className="px-6 py-4 text-zinc-500">{new Date(response.submitted_at).toLocaleString()}</td>
                          {questions.map(q => {
                            const answer = response.answers.find((a: any) => a.question_id === q.id)
                            let displayValue = answer ? answer.value : <span className="text-zinc-300">—</span>
                            
                            if (q.type === 'file_upload' && answer?.value) {
                               displayValue = <span className="text-blue-600 underline">File Attached</span>
                            } else if (typeof displayValue === 'boolean') {
                               displayValue = displayValue ? 'Yes' : 'No'
                            } else if (Array.isArray(displayValue)) {
                               displayValue = displayValue.join(", ")
                            }

                            return (
                              <td key={q.id} className="px-6 py-4 max-w-xs truncate text-zinc-700">
                                {displayValue}
                              </td>
                            )
                          })}
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedResponse(response)} className="h-8 w-8 text-zinc-400 hover:text-zinc-900 mr-2">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteResponse(response.id)} className="h-8 w-8 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {}
      {selectedResponse && (
        <>
          <div className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedResponse(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-[480px] bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900">Response Detail</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{new Date(selectedResponse.submitted_at).toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedResponse(null)} className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {questions.map((q, i) => {
                const answer = selectedResponse.answers.find((a: any) => a.question_id === q.id)
                let value = answer ? answer.value : null
                
                return (
                  <div key={q.id} className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                    <p className="text-sm font-semibold text-zinc-900 mb-3 leading-relaxed">
                      <span className="text-zinc-400 mr-2">{i + 1}.</span>
                      {q.title}
                    </p>
                    <div className="text-sm text-zinc-700 bg-white p-3 rounded-lg border border-zinc-200 shadow-sm min-h-[44px] flex items-center">
                      {value === null || value === '' ? (
                        <span className="text-zinc-400 italic">No answer provided</span>
                      ) : q.type === 'file_upload' && value ? (
                         <div className="flex flex-col gap-2 w-full">
                           {value.startsWith('data:image') ? (
                             <img src={value} alt="Upload" className="max-w-full rounded-md border border-zinc-200 max-h-48 object-contain" />
                           ) : value.startsWith('data:video') ? (
                             <video src={value} controls className="max-w-full rounded-md border border-zinc-200 max-h-48" />
                           ) : value.startsWith('data:audio') ? (
                             <audio src={value} controls className="w-full" />
                           ) : (
                             <span className="text-blue-600 truncate break-all">Base64 Uploaded File</span>
                           )}
                         </div>
                      ) : typeof value === 'boolean' ? (
                        value ? 'Yes' : 'No'
                      ) : Array.isArray(value) ? (
                        value.join(", ")
                      ) : (
                        <span className="whitespace-pre-wrap">{String(value)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
              <Button variant="destructive" className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-none border-0" onClick={() => handleDeleteResponse(selectedResponse.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Response
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
