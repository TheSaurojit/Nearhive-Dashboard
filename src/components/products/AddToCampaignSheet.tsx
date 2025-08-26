"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCampaignsQuery } from "@/hooks/useFiresStoreQueries"
import { Campaign } from "@/types/backend/models"
import { updateCampaign } from "@/services/campaings"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
  productId: string
}

type CampaignFetch = Campaign & {
  id: string;
};

export default function AddToCampaignSheet({ open, onClose, productId }: Props) {
  const { data: campaigns = [], refetch } = useCampaignsQuery()
  const [localCampaigns, setLocalCampaigns] = useState<CampaignFetch[]>([])

  useEffect(() => {
    if (campaigns.length) {
      setLocalCampaigns(campaigns as CampaignFetch[])
    }
  }, [campaigns])

  const handleToggle = async (campaign: CampaignFetch, checked: boolean) => {
    let updatedIds = [...campaign.productIds]

    if (checked && !updatedIds.includes(productId)) {
      updatedIds.push(productId)
    } else if (!checked && updatedIds.includes(productId)) {
      updatedIds = updatedIds.filter(id => id !== productId)
    }

    try {
      await updateCampaign(campaign.id, {
        title: campaign.title,
        productIds: updatedIds,
      })
      toast.success("Campaign updated")
      refetch()
    } catch (err) {
      toast.error("Failed to update campaign")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add to Campaign</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {localCampaigns.map((campaign) => {
            const isActive = campaign.productIds.includes(productId)

            return (
              <div key={campaign.id} className="flex items-center justify-between">
                <Label>{campaign.title}</Label>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => handleToggle(campaign, checked)}
                />
              </div>
            )
          })}

          {!localCampaigns.length && (
            <p className="text-sm text-muted-foreground">No campaigns found.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
