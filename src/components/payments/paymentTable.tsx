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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

type StoreStatus = "Paid" | "Unpaid" | "Processing"

interface Store {
  id: number
  name: string
  address: string
  bankDetails: string
  status: StoreStatus
  nextDueDate: string | null
  amount: number
  lastStatusUpdate: string
}

const getNextDueDate = () => {
  return format(addDays(new Date(), 7), "yyyy-MM-dd")
}

function PaymentTable() {
  const now = new Date().toISOString()

  const [data, setData] = useState<Store[]>([
    {
      id: 1,
      name: "FreshMart",
      address: "123 Main Street",
      bankDetails: "HDFC Bank - 123456789",
      status: "Unpaid",
      nextDueDate: getNextDueDate(),
      amount: 1200,
      lastStatusUpdate: now,
    },
    {
      id: 2,
      name: "GreenGrocers",
      address: "456 Park Lane",
      bankDetails: "ICICI Bank - 987654321",
      status: "Processing",
      nextDueDate: getNextDueDate(),
      amount: 2300,
      lastStatusUpdate: now,
    },
    {
      id: 3,
      name: "DailyNeeds",
      address: "22 Hill Road",
      bankDetails: "SBI - 1029384756",
      status: "Paid",
      nextDueDate: null,
      amount: 1800,
      lastStatusUpdate: now,
    },
  ])

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const handleStatusChange = (id: number, value: StoreStatus) => {
    setData((prev) =>
      prev.map((store) =>
        store.id === id
          ? {
              ...store,
              status: value,
              nextDueDate: value === "Paid" ? null : getNextDueDate(),
              lastStatusUpdate: new Date().toISOString(),
            }
          : store
      )
    )
  }

  // Weekly auto update (7 days from lastStatusUpdate)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setData((prev) =>
        prev.map((store) => {
          const lastUpdated = parseISO(store.lastStatusUpdate)
          const daysPassed = differenceInDays(now, lastUpdated)
          if ((store.status === "Paid" || store.status === "Processing") && daysPassed >= 7) {
            return {
              ...store,
              status: "Unpaid",
              nextDueDate: getNextDueDate(),
              lastStatusUpdate: now.toISOString(),
            }
          }
          return store
        })
      )
    }, 60 * 60 * 1000) // hourly

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Store Payment Table</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Bank Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((store) => (
            <TableRow key={store.id}>
              <TableCell>{store.name}</TableCell>
              <TableCell>{store.address}</TableCell>
              <TableCell>{store.bankDetails}</TableCell>
              <TableCell>
                <Select
                  value={store.status}
                  onValueChange={(val) => handleStatusChange(store.id, val as StoreStatus)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{store.nextDueDate ?? "N/A"}</TableCell>
              <TableCell>₹{store.amount}</TableCell>
              <TableCell>
                {store.status === "Paid" && (
                  <Button
                    onClick={() => {
                      const doc = new jsPDF()
                      doc.setFontSize(16)
                      doc.text("Receipt", 20, 20)

                      doc.setFontSize(12)
                      doc.text(`Store Name: ${store.name}`, 20, 40)
                      doc.text(`Address: ${store.address}`, 20, 50)
                      doc.text(`Bank Details: ${store.bankDetails}`, 20, 60)
                      doc.text(`Amount: ₹${store.amount}`, 20, 70)
                      doc.text(`Status: ${store.status}`, 20, 80)

                      doc.save(`${store.name.replace(/\s+/g, "_")}_receipt.pdf`)
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

      {/* Second Table - Date Range Receipt */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Generate Receipt for Date Range</h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Store Selector */}
          <Select
            value={selectedStoreId?.toString()}
            onValueChange={(val) => setSelectedStoreId(parseInt(val))}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              {data.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[250px] justify-start text-left",
                  !dateRange?.from && "text-muted-foreground"
                )}
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

          {/* Download Button */}
         <Button
  disabled={
    !selectedStoreId ||
    !dateRange?.from ||
    !dateRange?.to ||
    differenceInDays(dateRange.to, dateRange.from) < 6
  }

>
  Download Receipt
</Button>

        </div>
      </div>
    </div>
  )
}

export default PaymentTable
