"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview"; 

import { createVideo } from "@/services/videos"; 
import type { VideoCreate } from "@/services/videos"; 

export default function AddVideo({ onVideoAdded }: { onVideoAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<VideoCreate>>({
    image: undefined,
    videoUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleImageChange = (file: File | null) => {
    setFormData({ ...formData, image: file ?? undefined });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.videoUrl) return;

    setLoading(true);
    try {
      await createVideo({
        image: formData.image,
        videoUrl: formData.videoUrl,
      });

      setFormData({ image: undefined, videoUrl: "" });
      setOpen(false);
      if (onVideoAdded) onVideoAdded();
    } catch (err) {
      console.error("Error adding video:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Video</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Video</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploadWithPreview
            label="Thumbnail"
            id="video-image"
            onFileChange={handleImageChange}
            previewClassName="w-32 h-32"
          />
          <Input
            type="url"
            name="videoUrl"
            placeholder="Video URL"
            value={formData.videoUrl}
            onChange={handleChange}
            required
          />
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
