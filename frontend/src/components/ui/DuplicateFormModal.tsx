import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DuplicateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newTitle: string) => void
  originalTitle: string
  loading?: boolean
}

export function DuplicateFormModal({ isOpen, onClose, onConfirm, originalTitle, loading }: DuplicateFormModalProps) {
  const [title, setTitle] = useState(`${originalTitle} copy`)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplicate form">
      <div className="space-y-6">
        <div className="space-y-2">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="New form title"
            autoFocus
            className="w-full h-12"
          />
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="bg-white hover:bg-zinc-100">
            Cancel
          </Button>
          <Button onClick={() => onConfirm(title)} disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white">
            {loading ? "Duplicating..." : "Duplicate"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
