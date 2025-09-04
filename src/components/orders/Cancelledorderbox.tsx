"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useOrdersQuery } from "@/hooks/useFiresStoreQueries"
import { Order } from "@/types/backend/models" // ✅ adjust import path

export function CancelledOrdersBox() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  // ✅ fetch orders
  const { data: orders = [], isLoading } = useOrdersQuery()

  // ✅ filter only cancelled orders
  const cancelledOrders: Order[] = React.useMemo(() => {
    return orders.filter((order) => order.status?.cancelled)
  }, [orders])

  // ✅ filter by date if selected
  const filteredOrders = React.useMemo(() => {
    return cancelledOrders
      .filter((order) => {
        if (selectedDate) {
          return isSameDay(
            order.orderAt instanceof Date ? order.orderAt : order.orderAt.toDate(),
            selectedDate
          )
        }
        return true
      })
      .sort((a, b) => {
        const dateA = a.orderAt instanceof Date ? a.orderAt : a.orderAt.toDate()
        const dateB = b.orderAt instanceof Date ? b.orderAt : b.orderAt.toDate()
        return dateB.getTime() - dateA.getTime()
      })
  }, [cancelledOrders, selectedDate])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 bg-card rounded-2xl shadow-md space-y-4 border w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cancelled Orders</h2>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setCurrentPage(1) // reset pagination when date changes
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="rounded-xl border max-h-[400px] overflow-y-auto overflow-x-scroll w-full">
        <div className="min-w-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Ordered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const date =
                    order.orderAt instanceof Date
                      ? order.orderAt
                      : order.orderAt.toDate()

                  return (
                    <TableRow key={order.orderId}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.storename}</TableCell>
                      <TableCell>
                        {order.products.map((p) => p.name).join(", ")}
                      </TableCell>
                      <TableCell>{order.customerDetails.phone}</TableCell>
                      <TableCell>{format(date, "dd MMM yyyy")}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No cancelled orders {selectedDate ? "for selected date" : ""}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {filteredOrders.length > itemsPerPage && (
        <div className="flex justify-end items-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
