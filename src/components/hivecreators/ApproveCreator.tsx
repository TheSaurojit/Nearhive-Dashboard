"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { approveCreator } from "@/services/hiveCreators"

export function ApproveButton({ userId, onApproved }: { userId: string; onApproved?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    try {
      setLoading(true)
      await approveCreator(userId)
      setOpen(false)
      onApproved?.()
    } catch (err) {
      console.error("Approval failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => setOpen(true)}
      >
        Approve
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Creator</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve this creator?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
