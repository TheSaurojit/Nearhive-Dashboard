"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductsQuery } from "@/hooks/query/useProducts";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStoresQuery } from "@/hooks/useFiresStoreQueries"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Product } from "@/types/backend/models";
import { Timestamp } from "firebase/firestore";

import { toast } from "sonner";
import EditProduct from "./editProduct";
import AddToPlaylistSheet from "./AddPlaylist"


const AddToCampaignSheet = dynamic(() => import("./AddToCampaignSheet"), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground">Loading...</p>,
});

export default function ProductTable() {
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [playlistProductId, setPlaylistProductId] = useState<string | null>(null)


  const { data: products = [] } = useProductsQuery();
   const { data: stores = [] } = useStoresQuery(); // ✅ fetch stores

  // ✅ Build a map: { storeId -> storeName }
  const storeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of stores) {
      map[s.storeId] = s.name;
    }
    return map;
  }, [stores]);

  useEffect(() => {
    if (products.length) {
      setSelectedVariants((prev) => {
        const updated: Record<string, string> = {};
        for (const p of products) {
          updated[p.productId] = Object.keys(p.variations)[0] ?? "default";
        }
        return updated;
      });
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  const columns: ColumnDef<Product, unknown>[] = [
    {
      accessorKey: "imageUrl",
      header: "Photo",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Image
              src={row.original.imageUrl}
              alt={row.original.name}
              width={40}
              height={40}
              className="rounded-full object-cover cursor-pointer"
              onClick={() => setPreviewImage(row.original.imageUrl)}
            />
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Product Image</DialogTitle>
            </DialogHeader>
            <div className="w-full aspect-square relative">
              <Image
                src={previewImage || ""}
                alt="Preview"
                fill
                className="object-cover rounded-md"
              />
            </div>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      header: "Variant",
      cell: ({ row }) => {
        const id = row.original.productId;
        const variants = Object.keys(row.original.variations);
        const current = selectedVariants[id] || variants[0];

        return (
          <Select
            value={current}
            onValueChange={(value) =>
              setSelectedVariants((prev) => ({
                ...prev,
                [id]: value,
              }))
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
      {
      header: "Store Name",
      cell: ({ row }) => {
        const storeId = row.original.storeId;
        return (
          <span className="font-medium">
            {storeMap[storeId] ?? "Unknown Store"}
          </span>
        );
      },
    },
    {
      header: "Price",
      cell: ({ row }) => {
        const id = row.original.productId;
        const variant =
          selectedVariants[id] || Object.keys(row.original.variations)[0];
        const price = row.original.variations[variant]?.price;
        return price ? `₹${price}` : "-";
      },
    },
    {
      header: "MRP",
      cell: ({ row }) => {
        const id = row.original.productId;
        const variant =
          selectedVariants[id] || Object.keys(row.original.variations)[0];
        const mrp = row.original.variations[variant]?.mrp;
        return mrp ? `₹${mrp}` : "-";
      },
    },
    {
      header: "Discount",
      cell: ({ row }) => {
        const id = row.original.productId;
        const variant =
          selectedVariants[id] || Object.keys(row.original.variations)[0];
        const discount = row.original.variations[variant]?.discount;
        return discount ? `${discount}%` : "-";
      },
    },
    {
      accessorKey: "isAvailable",
      header: "Availability",
      cell: ({ row }) =>
        row.original.isAvailable ? (
          <Badge variant="default">Available</Badge>
        ) : (
          <Badge variant="destructive">Unavailable</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        row.original.createdAt instanceof Timestamp
          ? row.original.createdAt.toDate().toLocaleDateString()
          : "-",
    },
    {
      accessorKey: "lastUpdated",
      header: "Updated",
      cell: ({ row }) => {
        const date = row.original.lastUpdated;
        return date instanceof Timestamp
          ? date.toDate().toLocaleDateString()
          : "-";
      },
    },
    {
      accessorKey: "cuisine",
      header: "Cuisine",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (row.original.type === "veg" ? "Veg" : "Non-Veg"),
    },
  {
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const productId = row.original.productId
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditProduct(row.original)}>Edit</Button>
        <Button variant="destructive" size="sm">Delete</Button>
        <Button variant="secondary" size="sm" onClick={() => setActiveProductId(productId)}>
          Add Campaign
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPlaylistProductId(productId)}>
          Add Playlist
        </Button>

        <AddToCampaignSheet
          open={activeProductId === productId}
          onClose={() => setActiveProductId(null)}
          productId={productId}
        />

        <AddToPlaylistSheet
          open={playlistProductId === productId}
          onClose={() => setPlaylistProductId(null)}
          productId={productId}
        />
      </div>
    );
  },
}

  ];

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search product name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      {editProduct && (
        <EditProduct
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          product={editProduct}
        />
      )}
    </div>
  );
}
