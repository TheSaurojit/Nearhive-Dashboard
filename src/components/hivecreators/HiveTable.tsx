"use client"

import React, { useMemo, useState, useTransition, useCallback } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useDebounce } from "@/hooks/useDebounce"
import {  useVerifiedCreatorsQuery } from "@/hooks/useFiresStoreQueries"
import { CreatorsWaitinglist } from "@/types/backend/models"
import RemoveCreator from "./RemoveCreator"


const truncate = (text: string, len = 25) =>
  (text ?? "").length > len ? (text ?? "").slice(0, len) + "..." : (text ?? "")

type DialogPayload = {
  title: string
  body: string
} | null

export default function HiveTable() {
  const { data: rawCreators = [] } = useVerifiedCreatorsQuery()
  console.log(rawCreators)


  const creators: (CreatorsWaitinglist & { _search: string; _cuisinesStr: string })[] =
    useMemo(() => {
      return rawCreators.map((c: any) => {
        const cuisines: string[] = Array.isArray(c?.cuisines) ? c.cuisines : []
        const name = c?.name ?? ""
        const phone = c?.phone ?? ""
        const email = c?.email ?? ""
        const description = c?.description ?? ""
        const store = c?.store ?? ""
        const favfood = c?.favfood ?? ""
        const social = c?.social ?? ""
        const userId = c?.userId ?? ""

        const cuisinesStr = cuisines.join(", ")
        const haystack = [
          name,
          phone,
          email,
          description,
          cuisinesStr,
          store,
          favfood,
          social,
        ]
          .filter(Boolean)
          .join(" | ")
          .toLowerCase()

        return {
          cuisines,
          description,
          email,
          favfood,
          name,
          phone,
          social,
          store,
          userId,
          _cuisinesStr: cuisinesStr,
          _search: haystack,
        }
      })
    }, [rawCreators])

  // 2) Debounced search + transition to keep UI responsive.
  const [searchTerm, setSearchTerm] = useState("")
  const debounced = useDebounce(searchTerm, 500)
  const [isPending, startTransition] = useTransition()

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      startTransition(() => setSearchTerm(val))
    },
    []
  )

  // 3) Filter using prebuilt haystack (O(n), minimal allocations).
  const filteredData = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return creators
    return creators.filter((u) => u._search.includes(q))
  }, [debounced, creators])

  // 4) Single shared Dialog for heavy content.
  const [dialogData, setDialogData] = useState<DialogPayload>(null)
  const openDialog = useCallback((title: string, body: string) => {
    setDialogData({ title, body })
  }, [])
  const closeDialog = useCallback(() => setDialogData(null), [])

  // 5) Columns (no per-row Dialogs).
  const columns: ColumnDef<CreatorsWaitinglist & { _cuisinesStr: string }>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "phone", header: "Phone Number" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "social",
        header: "Link",
        cell: ({ row }) => {
          const link = row.original.social
          return link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
              Link
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "description",
        header: "About Yourself",
        cell: ({ row }) => {
          const text = row.original.description ?? ""
          return (
            <button
              className="underline underline-offset-2 hover:opacity-80 text-left"
              onClick={() => openDialog(`About ${row.original.name}`, text)}
            >
              {truncate(text)}
            </button>
          )
        },
      },
      {
        id: "cuisines",
        header: "Favourite Cuisine",
        cell: ({ row }) => {
          const cuisines = row.original._cuisinesStr
          return cuisines ? (
            <button
              className="underline underline-offset-2 hover:opacity-80 text-left"
              onClick={() => openDialog(`${row.original.name}'s Favourite Cuisine`, cuisines)}
            >
              {truncate(cuisines)}
            </button>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        },
      },
      { accessorKey: "store", header: "Favourite Restaurant" },
      { accessorKey: "favfood", header: "Favourite Food" },
    {
  id: "actions",
  header: "Action",
  cell: ({ row }) => (
    <RemoveCreator userId={row.original.userId} />
  ),
},

    ],
    [openDialog]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <h1 className="font-bold lg:text-3xl sm:text-sm mb-5 ml-4">
        Hive-Creators
      </h1>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            className="max-w-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {isPending && <span className="text-xs text-muted-foreground">Searching…</span>}
        </div>

        <div className="rounded-md border">
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
                  <TableCell colSpan={columns.length} className="text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Single shared dialog */}
      <Dialog open={!!dialogData} onOpenChange={(o) => (o ? null : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogData?.title}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap">{dialogData?.body}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
