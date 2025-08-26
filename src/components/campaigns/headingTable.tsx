"use client"

import Image from "next/image"
import { ColumnDef } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React, { useState, useMemo } from "react"

type Product = {
  id: string
  name: string
  image: string
  price: number
  mrp: number
  cuisine: string
  type: string
}

interface Props {
  products: Product[]
}

const HeadingTable: React.FC<Props> = ({ products }) => {
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState(products)

  const filteredRows = useMemo(() => {
    return rows.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, rows])

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "image",
      header: "Photo",
      cell: ({ row }) => (
        <Image
          src={row.original.image}
          alt={row.original.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      ),
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.original.price}`,
    },
    {
      accessorKey: "mrp",
      header: "MRP",
      cell: ({ row }) => `₹${row.original.mrp}`,
    },
    { accessorKey: "cuisine", header: "Cuisine" },
    { accessorKey: "type", header: "Type" },
    {
      id: "actions",
      header: "Delete",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            setRows((prev) => prev.filter((p) => p.id !== row.original.id))
          }
        >
          Delete
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="border rounded-md mt-2 p-4 space-y-4">
      <Input
        placeholder="Search products by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center h-24">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default HeadingTable
