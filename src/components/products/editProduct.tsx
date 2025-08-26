"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import ImageUploadWithPreview from "@/components/ImageUploadWithPreview";
import { updateProduct } from "@/services/products";
import { useStoresQuery, useCuisinesQuery } from "@/hooks/useFiresStoreQueries";
import type { Store, Cuisine, Product } from "@/types/backend/models";

type EditProductProps = {
  open: boolean;
  onClose: () => void;
  product: Product;
};

const EditProduct: React.FC<EditProductProps> = ({ open, onClose, product }) => {
  const { data: stores = [] } = useStoresQuery();
  const { data: cuisines = [] } = useCuisinesQuery();

  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productType, setProductType] = useState(product.productCategory || "");
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [foodType, setFoodType] = useState<"veg" | "non-veg">(product.type === "veg" ? "veg" : "non-veg");
  const [productName, setProductName] = useState(product.name);
  const [hasVariations, setHasVariations] = useState(Object.keys(product.variations).length > 1);
  const [selectedVariations, setSelectedVariations] = useState<string[]>(Object.keys(product.variations));
  const [variationData, setVariationData] = useState<Record<string, { mrp: number; discount: number }>>({});
  const [globalMRP, setGlobalMRP] = useState<number>(0);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [store, setStore] = useState<Store | null>(null);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [cuisineDropdownOpen, setCuisineDropdownOpen] = useState(false);

  const defaultVariations = ["Half", "Full", "Small", "Medium", "Large"];
  const bakeryVariations = ["1 Pound", "1.2 Pound"];
const variationOptions = (productType === "bakery" ? bakeryVariations : defaultVariations)
  .filter(v => v.toLowerCase() !== "default");

  // Prefill form
 useEffect(() => {
  setProductName(product.name);
  setProductType(product.productCategory || "");
  setFoodType(product.type === "veg" ? "veg" : "non-veg");
  setCuisine(cuisines.find(c => c.heading === product.cuisine) || null);
  setStore(stores.find(s => s.storeId === product.storeId) || null);

  if (Object.keys(product.variations).length === 1 && product.variations.default) {
    setGlobalMRP(product.variations.default.mrp);
    setGlobalDiscount(product.variations.default.discount);
    setHasVariations(false);
  } else {
    const vData: Record<string, { mrp: number; discount: number }> = {};
    Object.entries(product.variations).forEach(([name, val]) => {
      if (name.toLowerCase() !== "default") { // <- skip default
        vData[name] = { mrp: val.mrp, discount: val.discount };
      }
    });
    setVariationData(vData);
    setSelectedVariations(Object.keys(vData)); // <- skip default
    setHasVariations(true);
  }
}, [product, cuisines, stores]);

const toggleVariation = (variation: string) => {
  setSelectedVariations(prev => {
    const updated = prev.includes(variation)
      ? prev.filter(v => v !== variation)
      : [...prev, variation];

    return updated;
  });

  setVariationData(prev => ({
    ...prev,
    [variation]: prev[variation] || { mrp: 0, discount: 0 },
  }));
};

  const handleVariationChange = (variation: string, field: "mrp" | "discount", value: string) => {
    const parsed = parseFloat(value);
    setVariationData(prev => ({
      ...prev,
      [variation]: {
        ...prev[variation],
        [field]: isNaN(parsed) ? 0 : parsed,
      },
    }));
  };

  const getFinalPrice = (mrp: number, discount: number) => Math.ceil(mrp - (mrp * discount) / 100);

const handleSave = async () => {
  if (!productName.trim()) return toast.error("Product name is required");
  if (!cuisine) return toast.error("Please select a cuisine");

  setLoading(true);
  try {
    let variationsObj: Record<string, any> = {};

    if (hasVariations) {
      // ✅ Only include selected variations — remove default entirely
      selectedVariations.forEach(v => {
        const { mrp, discount } = variationData[v] || { mrp: 0, discount: 0 };
        variationsObj[v] = {
          mrp,
          discount,
          price: getFinalPrice(mrp, discount),
          stockQuantity: product.variations[v]?.stockQuantity || 0,
        };
      });
    } else {
      // ✅ Single "default" variation only
      variationsObj = {
        default: {
          mrp: globalMRP,
          discount: globalDiscount,
          price: getFinalPrice(globalMRP, globalDiscount),
          stockQuantity: product.variations.default?.stockQuantity || 0,
        },
      };
    }

  await updateProduct(product, {
  name: productName,
  image: productImage || undefined,
  cuisine: cuisine.heading,
  type: foodType === "veg" ? "Veg" : "Non Veg",
  variations: variationsObj, // variationsObj built from selected only
});


    toast.success("Product updated successfully!");
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to update product");
  } finally {
    setLoading(false);
  }
};





  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-2">
          <div className="grid gap-4 py-4">
            <ImageUploadWithPreview
              id="upload"
              label="Upload Product Image"
              onFileChange={(file) => setProductImage(file)}
              previewImage={product.imageUrl}
              previewClassName="w-32 h-32"
            />

            <div className="flex flex-col gap-2">
              <Label>Product Name</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Food Type</Label>
              <Select value={foodType} onValueChange={(v: "veg" | "non-veg") => setFoodType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </div>
<div className="flex flex-col gap-2">
  <Label>Cuisine</Label>
  <Select
    open={cuisineDropdownOpen}
    onOpenChange={setCuisineDropdownOpen}
    value={cuisine?.heading || ""}
    onValueChange={(v) => setCuisine(cuisines.find((c) => c.heading === v) || null)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Cuisine" />
    </SelectTrigger>
    <SelectContent>
      {cuisines.map((c) => (
        <SelectItem key={c.heading} value={c.heading}>
          {c.heading}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
            <div className="flex items-center justify-between">
              <Label>Has Variations?</Label>
              <Switch checked={hasVariations} onCheckedChange={setHasVariations} />
            </div>

            {!hasVariations && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>MRP</Label>
                  <Input type="number" value={globalMRP} onChange={(e) => setGlobalMRP(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <Input type="number" value={globalDiscount} onChange={(e) => setGlobalDiscount(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Final Price</Label>
                  <Input disabled value={getFinalPrice(globalMRP, globalDiscount)} />
                </div>
              </div>
            )}

            {hasVariations && variationOptions.map((variation) => (
              <div key={variation} className="border p-3 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedVariations.includes(variation)}
                    onCheckedChange={() => toggleVariation(variation)}
                  />
                  <Label>{variation}</Label>
                </div>
                {selectedVariations.includes(variation) && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>MRP</Label>
                      <Input
                        type="number"
                        value={variationData[variation]?.mrp || ""}
                        onChange={(e) => handleVariationChange(variation, "mrp", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={variationData[variation]?.discount || ""}
                        onChange={(e) => handleVariationChange(variation, "discount", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Final Price</Label>
                      <Input disabled value={getFinalPrice(
                        variationData[variation]?.mrp || 0,
                        variationData[variation]?.discount || 0
                      )} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;
