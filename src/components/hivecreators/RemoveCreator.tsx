"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { removeCreator } from "@/services/hiveCreators"; // adjust path

interface RemoveCreatorProps {
  userId: string;
}

export default function RemoveCreator({ userId }: RemoveCreatorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    try {
      setLoading(true);
      await removeCreator(userId);
      toast.success("Creator removed successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to remove creator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        className="bg-red-600 hover:bg-red-700"
      >
        Remove
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Creator</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this creator?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={loading}
            >
              {loading ? "Removing..." : "Yes, Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
