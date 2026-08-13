"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Edit2, Eye, QrCode } from "lucide-react"
import toast from "react-hot-toast"
import { Logo } from "@/components/ui/logo"

export function ShareTab({ form, onPublish }: { form: any, onPublish: () => void }) {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/form/${form?.slug}`

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard!")
    }
  }

  if (form?.status !== 'published') {
    return (
      <div className="flex-1 bg-zinc-50 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <Logo className="w-8 h-8 opacity-50" />
          </div>
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 mb-2">Publish your form to get a shareable link.</h2>
          <p className="text-zinc-500 mb-8 text-sm">Make your form live to start collecting responses.</p>
          <Button onClick={onPublish} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md px-8 h-12 text-base">
            Publish
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-zinc-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">LIVE</span>
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900">Your form is live. Choose how you'd like to share it.</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 mb-12">
          <div className="flex items-center gap-2 mb-8">
            <Button onClick={handleCopy} className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-md px-6 flex items-center gap-2 h-12">
              <Copy className="h-4 w-4" /> Copy link
            </Button>
            <div className="flex-1 flex items-center border border-zinc-200 rounded-md h-12 px-4 bg-zinc-50">
              <span className="text-zinc-600 truncate flex-1">{shareUrl}</span>
            </div>
            <Button variant="outline" className="h-12 border-zinc-200 text-zinc-700 gap-2">
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-12 text-zinc-500 gap-2">
              <Edit2 className="h-4 w-4" /> Customize
            </Button>
          </div>

          <div className="border-t border-zinc-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-500">Link preview</h3>
            </div>
            <div className="border border-zinc-200 rounded-lg p-4 flex gap-6 hover:bg-zinc-50 transition-colors cursor-pointer">
              <div className="w-48 h-32 bg-zinc-100 rounded flex items-center justify-center shrink-0">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Logo className="w-5 h-5" /> Typeform
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-semibold text-zinc-900 text-lg mb-1">{form?.title || "My branded form"}</h4>
                <p className="text-sm text-zinc-500 line-clamp-2">
                  Help us improve our service by filling out this quick survey.
                </p>
                <span className="text-xs text-zinc-400 mt-2">yourdomain.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-zinc-900">Embed form</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center gap-6 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 px-2 py-1 rounded">Coming Soon</div>
            <div className="w-32 h-24 bg-purple-300 rounded-lg flex items-center justify-center text-purple-700 shrink-0 overflow-hidden relative opacity-50">
              <div className="absolute inset-2 bg-white rounded-md shadow-sm flex p-2">
                 <div className="w-8 h-full bg-purple-100 rounded-sm mr-2"></div>
                 <div className="flex-1 flex flex-col gap-1 mt-1">
                   <div className="w-full h-1 bg-zinc-200 rounded-full"></div>
                   <div className="w-2/3 h-1 bg-zinc-200 rounded-full"></div>
                 </div>
              </div>
            </div>
            <span className="font-medium text-zinc-700">On your website</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center gap-6 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 px-2 py-1 rounded">Coming Soon</div>
            <div className="w-32 h-24 bg-blue-300 rounded-lg flex items-center justify-center text-blue-700 shrink-0 overflow-hidden relative opacity-50">
               <div className="absolute inset-2 bg-white rounded-md shadow-sm flex flex-col p-2">
                 <div className="w-full h-8 bg-blue-100 rounded-sm mb-2 flex items-center justify-center">
                   <div className="w-8 h-1 bg-blue-300 rounded-full"></div>
                 </div>
                 <div className="flex-1 w-full bg-zinc-100 rounded-sm"></div>
              </div>
            </div>
            <span className="font-medium text-zinc-700">In your email</span>
          </div>
        </div>
      </div>
    </div>
  )
}
