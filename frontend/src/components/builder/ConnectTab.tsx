"use client"

import React from 'react'
import { Card } from "@/components/ui/card"

export function ConnectTab() {
  const integrations = [
    { name: "Google Sheets", color: "bg-green-100 text-green-700" },
    { name: "Slack", color: "bg-amber-100 text-amber-700" },
    { name: "Webhooks", color: "bg-blue-100 text-blue-700" },
  ]

  return (
    <div className="flex-1 bg-zinc-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 mb-2">Connect your form to other tools</h2>
          <p className="text-zinc-500">Send your form responses directly to the apps you use every day.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map(integration => (
            <Card key={integration.name} className="p-6 flex flex-col h-[180px] bg-white hover:shadow-md transition-shadow cursor-not-allowed group">
              <div className="flex-1">
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center font-bold text-lg ${integration.color}`}>
                  {integration.name.charAt(0)}
                </div>
                <h3 className="font-medium text-zinc-900">{integration.name}</h3>
              </div>
              <div className="mt-auto">
                <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-500 text-xs font-semibold">Coming Soon</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
