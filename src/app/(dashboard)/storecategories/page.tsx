"use client";

import * as React from "react";
import { useState } from "react";
import { useStoresQuery } from "@/hooks/useFiresStoreQueries"; // adjust path
import { Store } from "@/types/backend/models"; // your store model
import {
  fetchProductCategories,
  updateImageProductCategories,
} from "@/services/products"; // adjust path
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview"; // adjust path
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // ✅ using sonner

type Category = {
  docid: string;
  name: string;
  imageUrl?: string;
};

export default function StoreCategories() {
  const { data: stores, isLoading } = useStoresQuery();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // dialog state
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch categories on submit
  const handleSubmit = async () => {
    if (!selectedStore) return;
    setLoadingCategories(true);
    try {
      const result = await fetchProductCategories(selectedStore);
      const formatted = result.map((cat: any) => ({
        docid: cat.docid,
        name: cat.name,
        imageUrl: cat.imageUrl,
      }));
      setCategories(formatted);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // open edit dialog
  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setSelectedFile(null);
    setOpen(true);
  };

  // save image update
  const handleSaveImage = async () => {
    if (!editingCategory || !selectedFile || !selectedStore) return;

    setSaving(true);
    try {
      await updateImageProductCategories({
        storeId: selectedStore,
        categoryDocId: editingCategory.docid,
        image: selectedFile,
      });

      const result = await fetchProductCategories(selectedStore);
      const formatted = result.map((cat: any) => ({
        docid: cat.docid,
        name: cat.name,
        imageUrl: cat.imageUrl,
      }));
      setCategories(formatted);
      setOpen(false);

      toast.success("Category image updated successfully!");
    } catch (err) {
      console.error("Error updating image:", err);
      toast.error("Failed to update image");
    } finally {
      setSaving(false);
    }
  };

  // DataTable columns
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
    },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.imageUrl || "/placeholder.png"}
          alt={row.original.name}
          className="h-12 w-12 object-cover rounded-md"
        />
      ),
    },
    {
      id: "actions",
      header: "Edit",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEditDialog(row.original)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 p-6 font-main">
      {/* Dropdown */}
     <h1 className="font-bold lg:text-4xl sm:text-sm">Store Categories</h1>
      <div className="flex gap-4 items-center">
        <Select onValueChange={(value) => setSelectedStore(value)}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select a store" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading">Loading...</SelectItem>
            ) : (
              stores?.map((store: Store) => (
                <SelectItem key={store.storeId} value={store.storeId}>
                  {store.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button onClick={handleSubmit} disabled={!selectedStore}>
          Submit
        </Button>
      </div>

      {/* Categories Table */}
      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : categories.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>No categories found.</p>
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingCategory && (
              <ImageUploadWithPreview
                label="Upload new image"
                id="category-image"
                onFileChange={setSelectedFile}
                previewImage={editingCategory.imageUrl}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveImage} disabled={!selectedFile || saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
