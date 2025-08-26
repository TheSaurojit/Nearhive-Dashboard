"use client"

import React, { useState, useMemo } from "react"
import { format, isWithinInterval, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { DateRange } from "react-day-picker"

type StoreData = {
  storeid: string
  storename: string
  sales: number
  revenue: number
  date: string // format: yyyy-MM-dd
}

// Sample data
const rawSalesData: StoreData[] = Array.from({ length: 50 }, (_, i) => ({
  storeid: `00${i % 5 + 1}`,
  storename: `Store ${String.fromCharCode(65 + (i % 5))}`,
  sales: Math.floor(Math.random() * 10) + 1,
  revenue: Math.floor(Math.random() * 1000) + 100,
  date: `2025-07-${(i % 15) + 15}`, // Dates from 15–30 July
}))

const ITEMS_PER_PAGE = 10

function SalesTable() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 6, 21), // July is 6 (0-indexed)
    to: new Date(2025, 7, 3),
  })
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = useMemo(() => {
    if (!date?.from || !date.to) return []

    const filtered = rawSalesData.filter(
      (entry) =>
        isWithinInterval(parseISO(entry.date), {
          start: date.from!,
          end: date.to!,
        }) &&
        entry.storename.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const storeMap: Record<
      string,
      { storeid: string; storename: string; sales: number; revenue: number }
    > = {}

    for (const item of filtered) {
      const key = `${item.storeid}-${item.storename}`
      if (!storeMap[key]) {
        storeMap[key] = {
          storeid: item.storeid,
          storename: item.storename,
          sales: 0,
          revenue: 0,
        }
      }
      storeMap[key].sales += item.sales
      storeMap[key].revenue += item.revenue
    }

    return Object.values(storeMap)
  }, [date, searchQuery])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1)
  }

  const handlePrevious = () => {
    if (page > 1) setPage((p) => p - 1)
  }

  const handleSearch = () => {
    setSearchQuery(searchTerm)
    setPage(1)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd MMM yyyy")} -{" "}
                    {format(date.to, "dd MMM yyyy")}
                  </>
                ) : (
                  format(date.from, "dd MMM yyyy")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              numberOfMonths={2}
              selected={date}
              onSelect={(range) => {
                setDate(range)
                setPage(1)
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Search Input and Button */}
        <Input
          placeholder="Search by store name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store ID</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Sales (Qty)</TableHead>
              <TableHead>Revenue (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((store) => (
                <TableRow key={`${store.storeid}-${store.storename}`}>
                  <TableCell>{store.storeid}</TableCell>
                  <TableCell>{store.storename}</TableCell>
                  <TableCell>{store.sales}</TableCell>
                  <TableCell>₹{store.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No sales data for selected date range or search term.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" onClick={handleNext} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default SalesTable
