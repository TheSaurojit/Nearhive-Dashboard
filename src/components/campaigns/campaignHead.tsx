"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createCampaign } from "@/services/campaings"
import { Campaign, Product } from "@/types/backend/models"
import { useCampaignsQuery, useProductsQuery } from "@/hooks/useFiresStoreQueries"
import { Trash2 } from "lucide-react"


type CampaignWithId = Campaign & { id: string }


export default function CampaignHead() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")

 const { data: rawCampaigns = [], refetch } = useCampaignsQuery()

const campaigns: CampaignWithId[] = rawCampaigns.map((doc: any) => ({
  ...(doc as Campaign),
  id: doc.id,
}))

  const { data: products = [] } = useProductsQuery() as {
    data: Product[]
  }

  const handleCreateCampaign = async () => {
    if (!title.trim()) return
    const newCampaign: Campaign = {
      title: title.trim(),
      productIds: [],
    }
    await createCampaign(newCampaign)
    setTitle("")
    setOpen(false)
    refetch()
  }

  return (
    <div className="p-4">
      {/* Create Campaign Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">+ Campaign</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button onClick={handleCreateCampaign}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign List */}
      <div className="mt-6 space-y-8">
        {campaigns.map((campaign) => {
          const matchedProducts = products.filter((product) =>
            campaign.productIds.includes(product.productId)
          )

          return (
            <div key={campaign.id} className="space-y-2">
              <h2 className="text-xl font-semibold">{campaign.title}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchedProducts.length > 0 ? (
                    matchedProducts.map((product) => {
                      const firstVariation = Object.values(product.variations)[0]
                      return (
                        <TableRow key={product.productId}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{firstVariation?.price ?? "-"}</TableCell>
                          <TableCell>{firstVariation?.mrp ?? "-"}</TableCell>
                          <TableCell>{firstVariation?.discount ?? "-"}</TableCell>
                          <TableCell>{product.cuisine}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No products
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
