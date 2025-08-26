"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview";
import type { Cuisine } from "@/types/backend/models";
import { createCuisine } from "@/services/cuisines";
import { toast } from "sonner";

export default function AddCuisine() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<
    Omit<Cuisine, "image" | "banner" | "products" | "lowerHeading">
  >({
    desc: "",
    heading: "",
    subHeading: "",
    about: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [products, setProducts] = useState<
    { title: string; desc: string; imageUrl: File | null }[]
  >([{ title: "", desc: "", imageUrl: null }]);

  const handleProductChange = (
    index: number,
    field: "title" | "desc",
    value: string
  ) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleProductImageChange = (index: number, file: File | null) => {
    const updated = [...products];
    updated[index].imageUrl = file;
    setProducts(updated);
  };

  const handleAddProduct = () => {
    setProducts([...products, { title: "", desc: "", imageUrl: null }]);
  };

  const handleSubmit = async () => {
    if (!imageFile || !bannerFile) {
      toast.error("Image or Banner is missing");
      return;
    }

    if (!products[0].imageUrl) {
      toast.error("Product image is missing");
      return;
    }

    const cuisine = {
      ...formData,
      image: imageFile,
      banner: bannerFile,
      products,
    };

    setLoading(true);
    try {
      await createCuisine(cuisine);
      toast.success("Cuisine created successfully");
      setOpen(false);
      // Reset form after success
      setFormData({ desc: "", heading: "", subHeading: "", about: "" });
      setImageFile(null);
      setBannerFile(null);
      setProducts([{ title: "", desc: "", imageUrl: null }]);
    } catch (error) {
      toast.error("Failed to create Cuisine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Cuisine</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Cuisine</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={formData.heading}
                  onChange={(e) =>
                    setFormData({ ...formData, heading: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="subHeading">Sub Heading</Label>
                <Input
                  id="subHeading"
                  value={formData.subHeading}
                  onChange={(e) =>
                    setFormData({ ...formData, subHeading: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                />
              </div>
            </div>

            <ImageUploadWithPreview
              label="Image"
              id="cuisine-image"
              onFileChange={setImageFile}
            />

            <ImageUploadWithPreview
              label="Banner Image"
              id="cuisine-banner"
              onFileChange={setBannerFile}
            />

            <div>
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                rows={4}
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
              />
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Products</h3>

              {products.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 border p-4 rounded-md bg-muted"
                >
                  <div>
                    <ImageUploadWithPreview
                      label="Product Image"
                      id={`product-image-${index}`}
                      onFileChange={(file) =>
                        handleProductImageChange(index, file)
                      }
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={product.title}
                      onChange={(e) =>
                        handleProductChange(index, "title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={product.desc}
                      onChange={(e) =>
                        handleProductChange(index, "desc", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={handleAddProduct}
                variant="outline"
              >
                + Add New Product
              </Button>
            </div>

            <div className="pt-4">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
