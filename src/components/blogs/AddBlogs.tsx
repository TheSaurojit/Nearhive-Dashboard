"use client";

import React, { useRef, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview";
import { createBlog } from "@/services/blogs";
import { useBlogsQuery } from "@/hooks/query/useBlogs";
import CKEditorComponent from "../CKEditor";

const AddBlogs = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("ck editor");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [formatting, setFormatting] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { createMutation } = useBlogsQuery();

  const handleFormattingChange = (value: string[]) => {
    setFormatting(value);
  };

  const applyFormatting = (text: string): string => {
    let formatted = text;
    if (formatting.includes("bold")) formatted = `**${formatted}**`;
    if (formatting.includes("italic")) formatted = `*${formatted}*`;
    if (formatting.includes("underline")) formatted = `__${formatted}__`;
    return formatted;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !content.trim() || !thumbnail) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      await createMutation.mutateAsync({
        title,
        description,
        content,
        thumbnail,
      });

      alert("Blog created successfully!");

      setTitle("");
      setDescription("");
      setContent("");
      setThumbnail(null);
      setFormatting([]);

      setDialogOpen(false);
    } catch (error) {
      console.error("Error submitting blog:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Add Blog</Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Blog</DialogTitle>
          </DialogHeader>

          {/* Thumbnail */}
          <ImageUploadWithPreview
            label="Thumbnail"
            id="thumbnail"
            previewClassName="w-full h-48"
            onFileChange={(file) => setThumbnail(file)}
          />

          {/* Title */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="content">CK EDitor</Label>
            <CKEditorComponent
              value={content}
              onChange={(value: string) => setContent(value)}
            />
          </div>

          {/* Content with formatting */}
          {/* <div className="space-y-2 mt-4">
            <Label htmlFor="content">Content</Label>
            <ToggleGroup
              type="multiple"
              className="mb-2"
              value={formatting}
              onValueChange={handleFormattingChange}
            >
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              className="min-h-[150px]"
            />
          </div> */}

          {/* Submit */}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddBlogs;
