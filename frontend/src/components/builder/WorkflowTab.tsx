"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface WorkflowTabProps {
  questions: any[];
  handleAddLogicRule: (questionId: string) => void;
  handleUpdateLogicRule: (ruleId: string, rule: any) => void;
  handleDeleteLogicRule: (ruleId: string) => void;
}

export function WorkflowTab({ questions, handleAddLogicRule, handleUpdateLogicRule, handleDeleteLogicRule }: WorkflowTabProps) {
  if (questions.length === 0) {
    return (
      <div className="flex-1 bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Add some questions first to build logic flows.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-zinc-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 mb-2">Workflow</h2>
          <p className="text-zinc-500">Define logic jumps and branching based on user responses.</p>
        </div>

        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-zinc-900 text-white px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</div>
                <h3 className="font-medium truncate">{q.title || "Untitled Question"}</h3>
              </div>
              <div className="p-6 bg-white">
                {q.logic_rules && q.logic_rules.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {q.logic_rules.map((rule: any) => (
                      <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-50 border border-zinc-200 rounded-lg p-4 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white border border-zinc-200 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          onClick={() => handleDeleteLogicRule(rule.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-sm font-medium text-zinc-700">If answer</span>
                        </div>
                        <select 
                          className="flex-1 h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                          value={rule.value} 
                          onChange={(e) => handleUpdateLogicRule(rule.id, { value: e.target.value })}
                        >
                          <option value="">Select option...</option>
                          {q.type === 'yes_no' ? (
                            <><option value="true">Yes</option><option value="false">No</option></>
                          ) : (
                            (q.options?.choices || []).map((c: string) => <option key={c} value={c}>{c}</option>)
                          )}
                        </select>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-sm font-medium text-zinc-700">Go to</span>
                        </div>
                        <select 
                          className="flex-1 h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                          value={rule.target_question_id} 
                          onChange={(e) => handleUpdateLogicRule(rule.id, { target_question_id: e.target.value })}
                        >
                          <option value="">Select target...</option>
                          {questions.filter(targetQ => targetQ.id !== q.id).map(targetQ => (
                            <option key={targetQ.id} value={targetQ.id}>{targetQ.title || "Untitled"}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 mb-4">No logic rules defined for this question.</p>
                )}
                <Button variant="outline" size="sm" onClick={() => handleAddLogicRule(q.id)} className="text-zinc-700">
                  <Plus className="h-4 w-4 mr-1" /> Add condition
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
