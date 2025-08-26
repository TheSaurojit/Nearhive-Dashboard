"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview";
import { createFoodPlaylist } from "@/services/foodPlaylist";
import { toast } from "sonner";
import type { FoodPlaylist } from "@/types/backend/models";

function AddPlaylist() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!imageFile || !title.trim()) {
      toast.error("Please provide both image and title");
      return;
    }

    try {
      setLoading(true);


     await createFoodPlaylist({
  image: imageFile, 
  productIds: [],
  text: title,
} );
      toast.success("Playlist created successfully");
      setOpen(false);
      setTitle("");
      setImageFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Playlist</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Playlist</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <ImageUploadWithPreview
              label="Playlist Image"
              id="playlist-image"
              onFileChange={setImageFile}
              previewClassName="w-32 h-32"
            />
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist title"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddPlaylist;
