"use client"

import React, { useMemo, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Input } from "@/components/ui/input"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { Cuisine, CuisineProduct } from "@/types/backend/models"
import { useCuisinesQuery } from "@/hooks/useFiresStoreQueries"
import { deleteCuisine } from "@/services/cuisines" // <-- your delete function path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const CuisineTable = () => {
  const [openSheet, setOpenSheet] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<CuisineProduct[]>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cuisineToDelete, setCuisineToDelete] = useState<{ id: string; heading: string } | null>(null)

  const { data: cuisines = [], isLoading, isError, refetch } = useCuisinesQuery()

  const handleShowProducts = (products: CuisineProduct[]) => {
    setSelectedProducts(products)
    setOpenSheet(true)
  }

  const handleDeleteClick = (id: string, heading: string) => {
    setCuisineToDelete({ id, heading })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!cuisineToDelete) return
    try {
      await deleteCuisine(cuisineToDelete.id)
      toast.success(`Cuisine "${cuisineToDelete.heading}" deleted successfully`)
      refetch()
    } catch (err) {
      toast.error("Failed to delete cuisine")
    } finally {
      setDeleteDialogOpen(false)
      setCuisineToDelete(null)
    }
  }

  const columns = useMemo<ColumnDef<Cuisine & { id: string }>[]>(
    () => [
      {
        header: "Heading",
        accessorKey: "heading",
      },
      {
        header: "Sub Heading",
        accessorKey: "subHeading",
      },
      {
        header: "Description",
        accessorKey: "desc",
      },
      {
        header: "Image",
        cell: ({ row }) => {
          const img = row.original.image
          return img ? (
            <Image
              src={img}
              alt="Cuisine"
              width={64}
              height={64}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded" />
          )
        },
      },
      {
        header: "Banner",
        cell: ({ row }) => {
          const banner = row.original.banner
          return banner ? (
            <Image
              src={banner}
              alt="Banner"
              width={64}
              height={64}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded" />
          )
        },
      },
      {
        header: "About",
        accessorKey: "about",
      },
      {
        header: "Products",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShowProducts(row.original.products)}
          >
            Show Products
          </Button>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleDeleteClick(row.original.id, row.original.heading)
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: cuisines as (Cuisine & { id: string })[],
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  })

  if (isLoading) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Loading cuisines...</p>
    )
  }

  if (isError) {
    return (
      <p className="p-4 text-sm text-red-500">Failed to load cuisines.</p>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Search cuisines..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
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
            {table.getRowModel().rows.length > 0 ? (
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
                  className="text-center text-sm text-muted-foreground py-6"
                >
                  No cuisines found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm">
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

      {/* Products Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side="right" className="max-w-md overflow-y-auto px-4">
          <SheetHeader>
            <SheetTitle>Products</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            {selectedProducts.map((product, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 border rounded-lg bg-muted"
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    width={64}
                    height={64}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded" />
                )}
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-muted-foreground">{product.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cuisine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {cuisineToDelete?.heading}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CuisineTable
