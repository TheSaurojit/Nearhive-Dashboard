"use client"

import React, { useEffect, useState } from "react"
import { format, addDays, parseISO, differenceInDays } from "date-fns"
import jsPDF from "jspdf"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

// Types

type MiddlemanStatus = "Paid" | "Unpaid"

interface Middleman {
  id: number
  name: string
  address: string
  bankDetails: string
  status: MiddlemanStatus
  dueDate: string | null
  amount: number
  lastStatusUpdate: string
}

const getNextDueDate = () => format(addDays(new Date(), 7), "yyyy-MM-dd")

function MiddlemanPaymentTable() {
  const now = new Date().toISOString()
  const [data, setData] = useState<Middleman[]>([
    {
      id: 1,
      name: "John Doe",
      address: "21 Baker Street",
      bankDetails: "Axis Bank - 9988776655",
      status: "Unpaid",
      dueDate: getNextDueDate(),
      amount: 1500,
      lastStatusUpdate: now,
    },
    {
      id: 2,
      name: "Priya Patel",
      address: "88 Residency Road",
      bankDetails: "HDFC Bank - 2233445566",
      status: "Paid",
      dueDate: null,
      amount: 2500,
      lastStatusUpdate: now,
    },
  ])

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const handleStatusChange = (id: number, value: MiddlemanStatus) => {
    setData((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: value,
              dueDate: value === "Paid" ? null : getNextDueDate(),
              lastStatusUpdate: new Date().toISOString(),
            }
          : m
      )
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setData((prev) =>
        prev.map((m) => {
          const lastUpdated = parseISO(m.lastStatusUpdate)
          const days = differenceInDays(now, lastUpdated)
          if (m.status === "Paid" && days >= 7) {
            return {
              ...m,
              status: "Unpaid",
              dueDate: getNextDueDate(),
              lastStatusUpdate: now.toISOString(),
            }
          }
          return m
        })
      )
    }, 60 * 60 * 1000) // every hour

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Middleman Payment Table</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MIDDLEMAN NAME</TableHead>
            <TableHead>MIDDLEMAN ADDRESS</TableHead>
            <TableHead>MIDDLEMAN BANK DETAILS</TableHead>
            <TableHead>MIDDLEMAN STATUS</TableHead>
            <TableHead>DUE DATE</TableHead>
            <TableHead>AMOUNT</TableHead>
            <TableHead>RECEIPT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.address}</TableCell>
              <TableCell>{m.bankDetails}</TableCell>
              <TableCell>
                <Select value={m.status} onValueChange={(val) => handleStatusChange(m.id, val as MiddlemanStatus)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{m.dueDate ?? "N/A"}</TableCell>
              <TableCell>₹{m.amount}</TableCell>
              <TableCell>
                {m.status === "Paid" && (
                  <Button
                    onClick={() => {
                      const doc = new jsPDF()
                      doc.setFontSize(16)
                      doc.text("Middleman Receipt", 20, 20)
                      doc.setFontSize(12)
                      doc.text(`Name: ${m.name}`, 20, 40)
                      doc.text(`Address: ${m.address}`, 20, 50)
                      doc.text(`Bank: ${m.bankDetails}`, 20, 60)
                      doc.text(`Amount: ₹${m.amount}`, 20, 70)
                      doc.text(`Status: ${m.status}`, 20, 80)
                      doc.save(`${m.name.replace(/\s+/g, "_")}_receipt.pdf`)
                    }}
                  >
                    Download
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Date Range Section */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Generate Receipt for Date Range</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Select
            value={selectedId?.toString()}
            onValueChange={(val) => setSelectedId(parseInt(val))}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Middleman" />
            </SelectTrigger>
            <SelectContent>
              {data.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[250px] justify-start text-left", !dateRange?.from && "text-muted-foreground")}
              >
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
                  : "Select Date Range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button
            disabled={
              !selectedId ||
              !dateRange?.from ||
              !dateRange?.to ||
              differenceInDays(dateRange.to, dateRange.from) < 6
            }
            onClick={() => {
              const m = data.find((d) => d.id === selectedId)
              if (!m || !dateRange?.from || !dateRange?.to) return

              const doc = new jsPDF()
              doc.setFontSize(16)
              doc.text("Date-Range Receipt", 20, 20)
              doc.setFontSize(12)
              doc.text(`Name: ${m.name}`, 20, 40)
              doc.text(`Address: ${m.address}`, 20, 50)
              doc.text(`Bank: ${m.bankDetails}`, 20, 60)
              doc.text(`Amount: ₹${m.amount}`, 20, 70)
              doc.text(`Status: ${m.status}`, 20, 80)
              doc.text(
                `Date Range: ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}`,
                20,
                90
              )
              doc.save(`${m.name.replace(/\s+/g, "_")}_daterange_receipt.pdf`)
            }}
          >
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MiddlemanPaymentTable
