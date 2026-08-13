"use client"

import React, { useState } from 'react'
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { 
  Search, Mail, AlignLeft, CheckSquare, List, ToggleLeft, 
  Hash, Star, Phone, MapPin, Upload, CreditCard, Calendar, 
  Smile, MonitorSmartphone, Link as LinkIcon, ShieldCheck, 
  Video, Sparkles, MessageSquareWarning, PenTool, LayoutTemplate, 
  CornerDownRight, Flag, Target, Hexagon
} from "lucide-react"

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (type: string) => void;
}

export function AddQuestionModal({ isOpen, onClose, onAddQuestion }: AddQuestionModalProps) {
  const [search, setSearch] = useState('')

  const col1 = [
    {
      name: "Contact info",
      items: [
        { id: "contact_info", label: "Contact Info", icon: <Mail className="w-4 h-4" />, color: "bg-pink-100 text-pink-700", active: false },
        { id: "email", label: "Email", icon: <Mail className="w-4 h-4" />, color: "bg-pink-100 text-pink-700", active: true },
        { id: "phone", label: "Phone Number", icon: <Phone className="w-4 h-4" />, color: "bg-pink-100 text-pink-700", active: false },
        { id: "address", label: "Address", icon: <MapPin className="w-4 h-4" />, color: "bg-pink-100 text-pink-700", active: false },
        { id: "website", label: "Website", icon: <LinkIcon className="w-4 h-4" />, color: "bg-pink-100 text-pink-700", active: false },
      ]
    },
    {
      name: "Text & Video",
      items: [
        { id: "long_text", label: "Long Text", icon: <AlignLeft className="w-4 h-4" />, color: "bg-blue-100 text-blue-700", active: true },
        { id: "short_text", label: "Short Text", icon: <AlignLeft className="w-4 h-4" />, color: "bg-blue-100 text-blue-700", active: true },
        { id: "video_audio", label: "Video and Audio", icon: <Video className="w-4 h-4" />, color: "bg-blue-100 text-blue-700", active: true, diamond: true },
        { id: "clarify_ai", label: "Clarify with AI", icon: <Sparkles className="w-4 h-4" />, color: "bg-blue-100 text-blue-700", active: false, diamond: true },
        { id: "faq_ai", label: "FAQ with AI", icon: <MessageSquareWarning className="w-4 h-4" />, color: "bg-blue-100 text-blue-700", active: false, diamond: true },
      ]
    }
  ]

  const col2 = [
    {
      name: "Choice",
      items: [
        { id: "multiple_choice", label: "Multiple Choice", icon: <CheckSquare className="w-4 h-4" />, color: "bg-purple-100 text-purple-700", active: true },
        { id: "dropdown", label: "Dropdown", icon: <List className="w-4 h-4" />, color: "bg-purple-100 text-purple-700", active: true },
        { id: "picture_choice", label: "Picture Choice", icon: <LayoutTemplate className="w-4 h-4" />, color: "bg-purple-100 text-purple-700", active: false },
        { id: "yes_no", label: "Yes/No", icon: <ToggleLeft className="w-4 h-4" />, color: "bg-purple-100 text-purple-700", active: true },
        { id: "legal", label: "Legal", icon: <ShieldCheck className="w-4 h-4" />, color: "bg-purple-100 text-purple-700", active: false },
        { id: "checkbox", label: "Checkbox", icon: <CheckSquare className="w-4 h-4" />, color: "bg-purple-100 text-purple-700", active: false },
      ]
    },
    {
      name: "Other",
      items: [
        { id: "number", label: "Number", icon: <Hash className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700", active: true },
        { id: "date", label: "Date", icon: <Calendar className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700", active: false },
        { id: "signature", label: "Signature", icon: <PenTool className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700", active: false, diamond: true },
        { id: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700", active: false, diamond: true },
        { id: "file_upload", label: "File Upload", icon: <Upload className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700", active: true, diamond: true },
        { id: "scheduler", label: "Scheduler", icon: <Calendar className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-700", active: false },
      ]
    }
  ]

  const col3 = [
    {
      name: "Rating & ranking",
      items: [
        { id: "nps", label: "Net Promoter Score", icon: <Smile className="w-4 h-4" />, color: "bg-green-100 text-green-700", active: false },
        { id: "opinion_scale", label: "Opinion Scale", icon: <List className="w-4 h-4" />, color: "bg-green-100 text-green-700", active: false },
        { id: "rating", label: "Rating", icon: <Star className="w-4 h-4" />, color: "bg-green-100 text-green-700", active: true },
        { id: "ranking", label: "Ranking", icon: <List className="w-4 h-4" />, color: "bg-green-100 text-green-700", active: false },
        { id: "matrix", label: "Matrix", icon: <LayoutTemplate className="w-4 h-4" />, color: "bg-green-100 text-green-700", active: false },
      ]
    },
    {
      name: "",
      items: [
        { id: "welcome", label: "Welcome Screen", icon: <MonitorSmartphone className="w-4 h-4" />, color: "bg-zinc-100 text-zinc-500", active: false },
        { id: "partial_submit", label: "Partial Submit Point", icon: <Target className="w-4 h-4" />, color: "bg-zinc-100 text-zinc-500", active: false, diamond: true },
        { id: "statement", label: "Statement", icon: <AlignLeft className="w-4 h-4" />, color: "bg-zinc-100 text-zinc-500", active: false },
        { id: "group", label: "Question Group", icon: <LayoutTemplate className="w-4 h-4" />, color: "bg-zinc-100 text-zinc-500", active: false },
        { id: "end_screen", label: "End Screen", icon: <Flag className="w-4 h-4" />, color: "bg-zinc-100 text-zinc-500", active: false },
        { id: "redirect", label: "Redirect to URL", icon: <CornerDownRight className="w-4 h-4" />, color: "bg-zinc-100 text-zinc-500", active: false, diamond: true },
      ]
    }
  ]

  const renderCategory = (category: any) => {
    const filteredItems = category.items.filter((item: any) => item.label.toLowerCase().includes(search.toLowerCase()))
    if (filteredItems.length === 0) return null
    return (
      <div key={category.name} className="mb-8">
        {category.name && <h4 className="text-sm font-semibold text-zinc-900 mb-4">{category.name}</h4>}
        <div className="space-y-1">
          {filteredItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.active) {
                  // If they select video_audio, map it to file_upload for now backend compatibility
                  onAddQuestion(item.id === 'video_audio' ? 'file_upload' : item.id)
                  onClose()
                }
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${item.color} ${!item.active ? 'opacity-50' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-sm font-medium ${!item.active ? 'text-zinc-500' : 'text-zinc-700 group-hover:text-zinc-900'}`}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.diamond && (
                  <div className="w-5 h-5 bg-teal-50 text-teal-600 rounded-sm flex items-center justify-center border border-teal-200">
                    <Hexagon className="w-3 h-3 fill-current" />
                  </div>
                )}
                {!item.active && !item.diamond && <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">Soon</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl h-[85vh] !p-0">
      {/* Top Tabs */}
      <div className="flex items-center gap-6 px-6 pt-4 border-b border-zinc-100 shrink-0">
        <button className="pb-3 border-b-2 border-zinc-900 font-semibold text-zinc-900 text-sm">Add form elements</button>
        <button className="pb-3 border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-700 text-sm">Import questions</button>
        <button className="pb-3 border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-700 text-sm">Create with AI</button>
      </div>
      
      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane */}
        <div className="w-72 border-r border-zinc-100 p-6 flex flex-col gap-8 overflow-y-auto bg-zinc-50/30 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search form elements" 
              className="pl-9 h-10 w-full bg-white border-zinc-200 rounded-lg shadow-sm"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Recommended</h3>
            <button className="flex items-center gap-3 w-full p-2 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-sm text-left transition-colors">
              <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600">
                <MonitorSmartphone className="w-4 h-4"/>
              </div>
              <span className="text-sm font-medium text-zinc-700">Welcome Screen</span>
            </button>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Connect to apps</h3>
            <div className="space-y-2">
              <button className="flex items-center gap-3 w-full p-2 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-sm text-left transition-colors">
                <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                  <Hash className="w-4 h-4"/>
                </div>
                <span className="text-sm font-medium text-zinc-700">Hubspot</span>
              </button>
              <button className="flex items-center justify-between w-full p-2 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-sm text-left transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckSquare className="w-4 h-4"/>
                  </div>
                  <span className="text-sm font-medium text-zinc-700">Salesforce</span>
                </div>
                <div className="w-5 h-5 bg-teal-50 text-teal-600 rounded-sm flex items-center justify-center border border-teal-200">
                  <Hexagon className="w-3 h-3 fill-current" />
                </div>
              </button>
              <button className="flex items-center gap-3 w-full p-2 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-sm text-left transition-colors">
                <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-500">
                  <List className="w-4 h-4"/>
                </div>
                <span className="text-sm font-medium text-zinc-700">Browse all apps</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Pane (3 columns) */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12">
            {/* Column 1 */}
            <div>
              {col1.map(renderCategory)}
            </div>
            {/* Column 2 */}
            <div>
              {col2.map(renderCategory)}
            </div>
            {/* Column 3 */}
            <div>
              {col3.map(renderCategory)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
