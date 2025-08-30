"use client"

import React, { useMemo, useState } from "react"
import { format, isWithinInterval, parseISO } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { DateRange } from "react-day-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { useCustomersQuery, useUsersQuery } from "@/hooks/useFiresStoreQueries"
const Papa: any = require("papaparse")
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Category = "food" | "grocery" | "both"

type User = {
  id: number
  name: string
  phone: string
  address: string
  pincode: string
  createdAt: string // ISO date string
  category: Category
}

const availableMonths = ["2025-07", "2025-08"]

export default function CustomerTable() {
  const [date, setDate] = useState<DateRange | undefined>()
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)

  const { data } = useUsersQuery()

  const transformedUsers: User[] = useMemo(() => {
    if (!data) return []

    return data.map((user: any, index: number): User => ({
      id: index + 1,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      phone: user.phoneNumber || "-",
      address:
        `${user.address?.addressLine1 || ""} ${user.address?.addressLine2 || ""}`.trim() ||
        user.location ||
        "-",
      pincode: user.address?.pincode || "-",
      createdAt: user.createdAt?.seconds
        ? new Date(user.createdAt.seconds * 1000).toISOString()
        : new Date().toISOString(),
      category: "both", // You can customize this logic as needed
    }))
  }, [data])

  const toggleMonth = (month: string) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    )
    setCurrentPage(1)
  }

  const filteredUsers = useMemo(() => {
    return transformedUsers.filter((user) => {
      const userDate = parseISO(user.createdAt)
      const userMonth = format(userDate, "yyyy-MM")

      const inDateRange =
        date?.from && date?.to
          ? isWithinInterval(userDate, { start: date.from, end: date.to })
          : date?.from
          ? format(userDate, "yyyy-MM-dd") === format(date.from, "yyyy-MM-dd")
          : true

      const inMonths =
        selectedMonths.length > 0 ? selectedMonths.includes(userMonth) : true

      const inCategory =
        categoryFilter === "all"
          ? true
          : user.category === categoryFilter

      const inSearch = [user.name, user.phone, user.address, user.pincode]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      return inDateRange && inMonths && inCategory && inSearch
    })
  }, [date, selectedMonths, categoryFilter, searchQuery, transformedUsers])

  const exportData = (type: "csv" | "excel" | "pdf") => {
    const exportFields = filteredUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      "Phone Number": user.phone,
      "Full Address": user.address,
      "Pin-code": user.pincode,
      Date: format(parseISO(user.createdAt), "dd MMM yyyy"),
      Category: user.category,
    }))

    if (type === "csv") {
      const csv = Papa.unparse(exportFields)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "users.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    if (type === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(exportFields)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users")
      XLSX.writeFile(workbook, "users.xlsx")
    }

    if (type === "pdf") {
      const doc = new jsPDF()
      autoTable(doc, {
        head: [Object.keys(exportFields[0])],
        body: exportFields.map((user) => Object.values(user)),
      })
      doc.save("users.pdf")
    }
  }

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const nextPage = () =>
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
  const prevPage = () =>
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex gap-4 items-center">
          <h2 className="text-lg font-semibold">
            Customer Count: {filteredUsers.length}
          </h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-8 w-[240px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[260px] justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} –{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date or range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedMonths.length > 0
                  ? selectedMonths.join(", ")
                  : "Select Months"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <ScrollArea className="h-32">
                {availableMonths.map((month) => (
                  <div key={month} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={month}
                      checked={selectedMonths.includes(month)}
                      onCheckedChange={() => toggleMonth(month)}
                    />
                    <Label htmlFor={month}>
                      {format(parseISO(month + "-01"), "MMMM yyyy")}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="food">Only Food</SelectItem>
              <SelectItem value="grocery">Only Grocery</SelectItem>
            </SelectContent>
          </Select> */}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Export</Button>
            </PopoverTrigger>
            <PopoverContent className="w-36">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => exportData("csv")}
                >
                  Export as CSV
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => exportData("excel")}
                >
                  Export as Excel
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => exportData("pdf")}
                >
                  Export as PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Full Address</TableHead>
            <TableHead>Pin-code</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No data found for selected filters.
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.pincode}</TableCell>
                <TableCell>
                  {format(parseISO(user.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="capitalize">{user.category}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center pt-4">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
