"use client";

import React, { useState } from "react";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview"; // adjust path
import { updateCampaignImages } from "@/services/campaings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function AddImages() {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (files.some((f) => f === null)) {
      alert("Please upload all 4 images.");
      return;
    }

    try {
      setLoading(true);
      await updateCampaignImages(files as File[]);
      alert("Images uploaded successfully!");
      setFiles([null, null, null, null]);
      setOpen(false);
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Add Images</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Campaign Images</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {files.map((_, idx) => (
              <ImageUploadWithPreview
                key={idx}
                id={`image-${idx}`}
                label={`Image ${idx + 1}`}
                onFileChange={(file) => handleFileChange(idx, file)}
                previewClassName="w-32 h-32"
              />
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Uploading..." : "Submit Images"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddImages;
