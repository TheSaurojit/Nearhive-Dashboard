"use client";

import React, { useState, useMemo } from "react";
import { useFoodPlaylistQuery, useProductsQuery } from "@/hooks/useFiresStoreQueries";
import { FoodPlaylist, Product } from "@/types/backend/models";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { deleteFoodPlaylist } from "@/services/foodPlaylist"; // ⬅ replace with actual path

type FoodPlaylistWithId = FoodPlaylist & { id: string };

function FoodPlaylistTable() {
  const { data: playlists = [], refetch } =
    useFoodPlaylistQuery() as unknown as {
      data: FoodPlaylistWithId[];
      refetch: () => void;
    };

  const { data: products = [] } = useProductsQuery() as { data: Product[] };

  const [selectedPlaylist, setSelectedPlaylist] = useState<FoodPlaylistWithId | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<FoodPlaylistWithId | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!selectedPlaylist) return [];
    return products.filter((p) => selectedPlaylist.productIds.includes(p.productId));
  }, [selectedPlaylist, products]);

  const handleDelete = async () => {
    if (!playlistToDelete) return;
    await deleteFoodPlaylist(playlistToDelete.id);
    setPlaylistToDelete(null);
    setIsDeleteDialogOpen(false);
    await refetch();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playlists.map((playlist) => (
            <TableRow key={playlist.id}>
              <TableCell>
                <Image
                  src={playlist.image}
                  alt={playlist.text}
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
              </TableCell>
              <TableCell>{playlist.text}</TableCell>
              <TableCell className="flex gap-2">
                <Button onClick={() => setSelectedPlaylist(playlist)}>
                  Show Products
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setPlaylistToDelete(playlist);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{playlistToDelete?.text}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet for products */}
      <Sheet open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
        <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto px-5">
          <SheetHeader>
            <SheetTitle>
              Products for {selectedPlaylist?.text}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 border-b pb-3"
              >
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <p className="font-medium">{product.name}</p>
                  {Object.entries(product.variations).map(([variationName, variation]) => (
                    <p key={variationName} className="text-sm text-gray-500">
                      {variationName}: ₹{variation.price}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default FoodPlaylistTable;
