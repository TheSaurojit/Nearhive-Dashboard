"use client"

import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useFoodPlaylistQuery } from "@/hooks/useFiresStoreQueries"
import { updateFoodPlaylist } from "@/services/foodPlaylist"
import { toast } from "sonner"

type AddToPlaylistSheetProps = {
  open: boolean
  onClose: () => void
  productId: string
}

export default function AddToPlaylistSheet({ open, onClose, productId }: AddToPlaylistSheetProps) {
  const { data: playlists = [] } = useFoodPlaylistQuery()
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = async (playlist: any, checked: boolean) => {
    try {
      setLoading(playlist.id)

      const updatedIds = checked
        ? [...playlist.productIds, productId]
        : playlist.productIds.filter((id: string) => id !== productId)

     await updateFoodPlaylist(playlist.id, {
  productIds: updatedIds,
  text: playlist.text,
  image: playlist.image, // ✅ keep old image
})


      toast.success(`Playlist "${playlist.text}" updated`)
    } catch (err) {
      toast.error("Failed to update playlist")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>Add to Playlist</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {playlists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No playlists found</p>
          ) : (
            playlists.map((playlist: any) => {
              const isChecked = playlist.productIds.includes(productId)
              return (
                <div key={playlist.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-3">
                    <img src={playlist.image} alt={playlist.text} className="w-10 h-10 rounded object-cover" />
                    <span className="font-medium">{playlist.text}</span>
                  </div>
                  <Switch
                    checked={isChecked}
                    disabled={loading === playlist.id}
                    onCheckedChange={(checked) => handleToggle(playlist, checked)}
                  />
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
