"use client";

import React, { useEffect, useState } from "react";
import { fetchCampaigns } from "@/services/campaings";
import { fetchProducts } from "@/services/products";
import { Campaign, Product } from "@/types/backend/models";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type CampaignWithProducts = Campaign & { products: Product[] };

function CampaignHead() {
  const [campaigns, setCampaigns] = useState<CampaignWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignsData, productsData] = await Promise.all([
          fetchCampaigns(),
          fetchProducts(),
        ]);

        const withProducts: CampaignWithProducts[] = campaignsData.map(
          (campaign) => {
            const matchedProducts = productsData.filter((p) =>
              campaign.productIds?.includes(p.productId)
            );
            return { ...campaign, products: matchedProducts };
          }
        );

        setCampaigns(withProducts);
      } catch (err) {
        console.error("Error loading campaigns/products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading campaigns...</p>;
  if (!campaigns.length) return <p>No campaigns found</p>;

  return (
    <div className="p-6 space-y-8">
      {campaigns.map((campaign, idx) => (
        <Card key={idx} className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campaign Images */}
           {/* Campaign Images */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {campaign.imageUrls?.map((url, i) => (
    <div
      key={i}
      className="w-full h-40 bg-muted rounded-xl flex items-center justify-center overflow-hidden"
    >
      <img
        src={url}
        alt={`Campaign ${campaign.title} image ${i + 1}`}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  ))}
</div>


            {/* Products */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Products</h3>
              {campaign.products.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.products.map((product) => {
                      const firstVar = Object.values(product.variations)[0];
                      return (
                        <TableRow key={product.productId}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            ₹{firstVar?.price ?? "-"}
                          </TableCell>
                          <TableCell>
                            {firstVar?.discount ?? 0}%
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                console.log("delete product", product.productId)
                              }
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No products added yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CampaignHead;
