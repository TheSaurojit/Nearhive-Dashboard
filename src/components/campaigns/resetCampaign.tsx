"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FirestoreService } from "@/firebase/firestoreService";

export async function deleteCampaignData() {
  await FirestoreService.updateDoc("Campaigns", "campaignDoc", {
    imageUrls: [],
    productIds: [],
  });
}

function ResetCampaign() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      await deleteCampaignData();
      toast.success("Campaign reset successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleReset}
      disabled={loading}
      variant="destructive"
      className="ml-2"
    >
      {loading ? "Resetting..." : "Reset Campaign"}
    </Button>
  );
}

export default ResetCampaign;
