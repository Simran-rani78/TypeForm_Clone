import React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  loading?: boolean
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, description, loading }: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-zinc-500 text-sm">{description || "This action cannot be undone."}</p>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="bg-white hover:bg-zinc-100">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
