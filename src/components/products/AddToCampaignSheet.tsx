"use client";

import { useEffect, useState } from "react";
import { updateCampaignProducts, fetchCampaigns } from "@/services/campaings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  productId: string;
}

export default function AddToCampaignButton({ productId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");

  // Check if product is already in campaign
  useEffect(() => {
    const checkIfAdded = async () => {
      try {
        const campaigns = await fetchCampaigns();
        const alreadyAdded = campaigns.some((c) =>
          c.productIds?.includes(productId)
        );
        if (alreadyAdded) {
          setStatus("added");
        }
      } catch (err) {
        console.error("Error checking campaigns:", err);
      }
    };

    checkIfAdded();
  }, [productId]);

  const handleClick = async () => {
    if (status === "added") return; // prevent re-click

    try {
      setStatus("loading");
      await updateCampaignProducts(productId);
      setStatus("added");
      toast.success("Added to campaign");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      toast.error("Failed to add to campaign");
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={status === "loading" || status === "added"}
      className={
        status === "added"
          ? "bg-green-600 hover:bg-green-700 text-white"
          : ""
      }
    >
      {status === "idle" && "Add to Campaign"}
      {status === "loading" && "Adding..."}
      {status === "added" && "Added"}
    </Button>
  );
}
