"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import ImageUploadWithPreview from "@/components/ImageUploadWithPreview";
import { useStoresQuery } from "@/hooks/useFiresStoreQueries"; // adjust path
import { useCuisinesQuery } from "@/hooks/useFiresStoreQueries"; // adjust path
import type { Store, Cuisine } from "@/types/backend/models";
import { useProductsQuery } from "@/hooks/query/useProducts";

const AddProducts: React.FC = () => {
  const { data: stores = [], isLoading: storeLoading } = useStoresQuery();
  const { data: cuisines = [], isLoading: cuisinesLoading } =
    useCuisinesQuery();

  const { createProductMutation } = useProductsQuery();

  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productType, setProductType] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [foodType, setFoodType] = useState<"veg" | "non-veg">("veg");
  const [productName, setProductName] = useState("");
  const [hasVariations, setHasVariations] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [variationData, setVariationData] = useState<
    Record<string, { mrp: number; discount: number }>
  >({});
  const [globalMRP, setGlobalMRP] = useState<number>(0);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [store, setStore] = useState<Store | null>(null);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [cuisineDropdownOpen, setCuisineDropdownOpen] = useState(false);

  const defaultVariations = ["Half", "Full", "Small", "Medium", "Large"];
  const bakeryVariations = ["1 Pound", "1.2 Pound"];
  const variationOptions =
    productType === "bakery" ? bakeryVariations : defaultVariations;

  const toggleVariation = (variation: string) => {
    setSelectedVariations((prev) =>
      prev.includes(variation)
        ? prev.filter((v) => v !== variation)
        : [...prev, variation]
    );
    setVariationData((prev) => ({
      ...prev,
      [variation]: prev[variation] || { mrp: 0, discount: 0 },
    }));
  };

  const handleVariationChange = (
    variation: string,
    field: "mrp" | "discount",
    value: string
  ) => {
    const parsed = parseFloat(value);
    setVariationData((prev) => ({
      ...prev,
      [variation]: {
        ...prev[variation],
        [field]: isNaN(parsed) ? 0 : parsed,
      },
    }));
  };

  // Always round up final price
  const getFinalPrice = (mrp: number, discount: number) => {
    const discounted = mrp - (mrp * discount) / 100;
    return Math.ceil(discounted);
  };

  const handleSave = async () => {
    if (!store) return toast.error("Please select a store");
    if (!productName.trim()) return toast.error("Product name is required");
    if (!productImage) return toast.error("Product image is required");
    if (!cuisine) return toast.error("Please select a cuisine");

    setLoading(true);
    try {
      const variationsObj: Record<string, any> = {};

      if (hasVariations) {
        selectedVariations.forEach((v) => {
          const { mrp, discount } = variationData[v];
          variationsObj[v.toLowerCase()] = {
            mrp,
            discount,
            price: getFinalPrice(mrp, discount),
            stockQuantity: 0,
          };
        });
      } else {
        variationsObj["default"] = {
          mrp: globalMRP,
          discount: globalDiscount,
          price: getFinalPrice(globalMRP, globalDiscount),
          stockQuantity: 0,
        };
      }

      await createProductMutation.mutateAsync({
        name: productName,
        image: productImage,
        cuisine: cuisine.heading, // store the heading of cuisine
        productCategory: productType,
        storeCategory: store.category,
        storeId: store.storeId,
        type: foodType === "veg" ? "Veg" : "Non Veg",
        variations: variationsObj,
      });

    

      toast.success("Product created successfully!");
      setProductName("");
      setProductImage(null);
      setCuisine(null);
      setProductType("");
      setSelectedVariations([]);
      setVariationData({});
      setGlobalMRP(0);
      setGlobalDiscount(0);
      setHasVariations(false);
      setStore(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Product</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-2">
          <div className="grid gap-4 py-4">
            {/* Store Combobox */}
            <div className="flex flex-col gap-2">
              <Label>Store</Label>
              <Popover
                open={storeDropdownOpen}
                onOpenChange={setStoreDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={storeDropdownOpen}
                    className="w-full justify-between"
                  >
                    {store
                      ? store.name
                      : storeLoading
                      ? "Loading..."
                      : "Select store"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search store..." />
                    <CommandEmpty>No store found.</CommandEmpty>
                    <CommandGroup>
                      {stores.map((option: Store) => (
                        <CommandItem
                          key={option.storeId}
                          value={option.name}
                          onSelect={() => {
                            setStore(option);
                            setStoreDropdownOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              store?.storeId === option.storeId
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Image Upload */}
            <ImageUploadWithPreview
              id="upload"
              label="Upload Product Image"
              onFileChange={(file) => setProductImage(file)}
              previewClassName="w-32 h-32"
            />

            {/* Product Type */}
            <div className="flex flex-col gap-2">
              <Label>Product Type</Label>
              <Select
                value={productType}
                onValueChange={(value) => {
                  setProductType(value);
                  setSelectedVariations([]);
                  setVariationData({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cuisine Type Combobox */}
            <div className="flex flex-col gap-2">
              <Label>Cuisine Type</Label>
              <Popover
                open={cuisineDropdownOpen}
                onOpenChange={setCuisineDropdownOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cuisineDropdownOpen}
                    className="w-full justify-between"
                  >
                    {cuisine
                      ? cuisine.heading
                      : cuisinesLoading
                      ? "Loading..."
                      : "Select cuisine"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search cuisine..." />
                    <CommandEmpty>No cuisine found.</CommandEmpty>
                    <CommandGroup>
                      {cuisines.map((option: Cuisine) => (
                        <CommandItem
                          key={option.heading}
                          value={option.heading}
                          onSelect={() => {
                            setCuisine(option);
                            setCuisineDropdownOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              cuisine?.heading === option.heading
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.heading}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Food Type */}
            <div className="flex flex-col gap-2">
              <Label>Food Type</Label>
              <Select
                value={foodType}
                onValueChange={(v: "veg" | "non-veg") => setFoodType(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Name */}
            <div className="flex flex-col gap-2">
              <Label>Product Name</Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            {/* Variation Toggle */}
            <div className="flex items-center justify-between">
              <Label>Is there any variation?</Label>
              <Switch
                checked={hasVariations}
                onCheckedChange={setHasVariations}
              />
            </div>

            {/* Global Pricing */}
            {!hasVariations && (
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>MRP</Label>
                  <Input
                    type="number"
                    value={globalMRP}
                    onChange={(e) => setGlobalMRP(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={globalDiscount}
                    onChange={(e) =>
                      setGlobalDiscount(parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Final Price</Label>
                  <Input
                    disabled
                    value={getFinalPrice(globalMRP, globalDiscount)}
                  />
                </div>
              </div>
            )}

            {/* Variation Pricing */}
            {hasVariations && (
              <div className="flex flex-col gap-4">
                <Label>Select Variations & Pricing</Label>
                {variationOptions.map((variation) => (
                  <div
                    key={variation}
                    className="border p-3 rounded-md space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={variation}
                        checked={selectedVariations.includes(variation)}
                        onCheckedChange={() => toggleVariation(variation)}
                      />
                      <Label htmlFor={variation}>{variation}</Label>
                    </div>

                    {selectedVariations.includes(variation) && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <Label>MRP</Label>
                          <Input
                            type="number"
                            value={variationData[variation]?.mrp || ""}
                            onChange={(e) =>
                              handleVariationChange(
                                variation,
                                "mrp",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label>Discount (%)</Label>
                          <Input
                            type="number"
                            value={variationData[variation]?.discount || ""}
                            onChange={(e) =>
                              handleVariationChange(
                                variation,
                                "discount",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label>Final Price</Label>
                          <Input
                            disabled
                            value={getFinalPrice(
                              variationData[variation]?.mrp || 0,
                              variationData[variation]?.discount || 0
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end mt-4">
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProducts;
