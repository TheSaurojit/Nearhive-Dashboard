"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview"
import { updateStoreLogos } from "@/services/stores"

type Props = {
  storeId: string | null
  onClose: () => void
}

export default function EditLogosDialog({ storeId, onClose }: Props) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  if (!storeId) return null

  const handleSubmit = async () => {
    if (!logoFile || !bannerFile) {
      alert("Please select both logo & banner")
      return
    }
    setLoading(true)
    try {
      await updateStoreLogos(storeId, { logo: logoFile, banner: bannerFile })
      alert("Store logos updated!")
      onClose()
    } catch {
      alert("Failed to update logos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!storeId} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Store Logos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <ImageUploadWithPreview label="Logo" id="logo" onFileChange={setLogoFile} />
          <ImageUploadWithPreview label="Banner" id="banner" onFileChange={setBannerFile} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
