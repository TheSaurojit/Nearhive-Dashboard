"use client";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Calendar as CalendarIcon,
  PackageOpen,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrdersQuery } from "@/hooks/useFiresStoreQueries";
import type { Order } from "@/types/backend/models"; // Make sure to update this path as per your project structure

// Helper: Convert Firestore timestamp or ISO string to JS Date
function toDate(ts: any): Date {
  if (!ts) return new Date();
  if (typeof ts === "object" && ts.seconds) {
    // Firestore Timestamp
    return new Date(ts.seconds * 1000);
  }
  return new Date(ts);
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch orders using your hook
  const { data: ordersData = [], isLoading } = useOrdersQuery();

  // Transform Firestore orders into table-friendly objects
  const formattedOrders = React.useMemo(() => {
    return ordersData.map((order: Order) => {
      const product = order.products?.[0] || {
        name: "-",
        variant: "-",
        quantity: 1,
        price: 0,
      };

      // Determine latest status key (lex sort timestamps)
      const latestStatusKey = (Object.keys(order.status || {}) as (keyof typeof order.status)[])
  .sort(
    (a, b) =>
      toDate(order.status[a]?.timestamp).getTime() -
      toDate(order.status[b]?.timestamp).getTime()
  )
  .pop();


      const orderDate = toDate(order.orderAt);

      // Find delivered status in keys
      let deliveredStatusKey = Object.keys(order.status || {}).find((key) =>
        key.toLowerCase().includes("delivered")
      );
      const deliveredTimestamp = deliveredStatusKey
  ? toDate(order.status[deliveredStatusKey as keyof typeof order.status]?.timestamp)
  : null;


      // Calculate delivery time if possible
      let deliveryTime = "-";
      if (deliveredTimestamp) {
        const diffMs = deliveredTimestamp.getTime() - orderDate.getTime();
        if (!isNaN(diffMs)) {
          const totalMinutes = Math.floor(diffMs / 60000);
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          deliveryTime = `${h}h ${m}m`;
        }
      }

      return {
        id: order.orderId,
        ordered: format(orderDate, "MMM d, hh:mm:ss a"),
        delivered: deliveredTimestamp ? format(deliveredTimestamp, "MMM d, hh:mm:ss a") : "-",
        deliveryTime,
        product: product.name,
        store: order.storename || order.storeId,
        status: latestStatusKey || "-",
        payment: order.paymentMethod || "-",
        total: order.totalAmount || 0,
        platformFee: order.platformFee || 0,
        deliveryFee: order.deliveryFee || 0,
        storeCommission: order.commission || 0,
        orderRaw: order, // Retain raw order for details
      };
    });
  }, [ordersData]);

  // Filter data by selected date and search query
  const filteredData = React.useMemo(() => {
    return formattedOrders.filter((item) => {
      const matchesDate = selectedDate
        ? isSameDay(toDate(item.ordered), selectedDate)
        : true;
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        item.id.toLowerCase().includes(searchLower) ||
        item.store.toLowerCase().includes(searchLower) ||
        item.product.toLowerCase().includes(searchLower);
      return matchesDate && matchesSearch;
    });
  }, [formattedOrders, selectedDate, debouncedSearch]);

  // Aggregate metrics for filtered data
  const {
    totalSales,
    totalPlatformFee,
    totalStoreFee,
    deliveryFees,
    netRevenue,
    averageDeliveryTime,
  } = React.useMemo(() => {
    const totalSales = filteredData.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalPlatformFee = filteredData.reduce(
      (sum, item) => sum + (item.platformFee || 0),
      0
    );
    const totalStoreFee = filteredData.reduce(
      (sum, item) => sum + (item.storeCommission || 0),
      0
    );
    const deliveryFees = filteredData.reduce(
      (sum, item) => sum + (item.deliveryFee || 0),
      0
    );
    const netRevenue = totalPlatformFee + deliveryFees + totalStoreFee;

    // Calculate average delivery time
    let totalMinutes = 0,
      validCount = 0;
    for (const item of filteredData) {
      if (typeof item.deliveryTime === "string") {
        const match = item.deliveryTime.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          const h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          totalMinutes += h * 60 + m;
          validCount++;
        }
      }
    }
    const avg = validCount > 0 ? totalMinutes / validCount : 0;
    const h = Math.floor(avg / 60);
    const m = Math.round(avg % 60);
    const averageDeliveryTime = validCount > 0 ? `${h}h ${m}m` : "-";
    return {
      totalSales,
      totalPlatformFee,
      totalStoreFee,
      deliveryFees,
      netRevenue,
      averageDeliveryTime,
    };
  }, [filteredData]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "Order ID", cell: ({ row }) => row.getValue("id") },
    { accessorKey: "ordered", header: "Ordered", cell: ({ row }) => row.getValue("ordered") },
    { accessorKey: "delivered", header: "Delivered", cell: ({ row }) => row.getValue("delivered") },
    { accessorKey: "deliveryTime", header: "Delivery Time", cell: ({ row }) => row.getValue("deliveryTime") },
    { accessorKey: "product", header: "Product", cell: ({ row }) => row.getValue("product") },
    { accessorKey: "store", header: "Store", cell: ({ row }) => row.getValue("store") },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    { accessorKey: "payment", header: "Payment", cell: ({ row }) => row.getValue("payment") },
    {
      accessorKey: "total",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">₹{row.getValue("total")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
                Copy Order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedOrder(payment.orderRaw)}>
                View Order Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  if (isLoading) {
    return <div className="p-4">Loading orders...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[180px] md:ml-4 justify-start text-left",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedDate && filteredData.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" className="md:ml-2">
                View Metrics
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <h4 className="font-semibold mb-2">Sales Summary</h4>
              <div className="text-sm space-y-1">
                <p>Total Sales: ₹{totalSales.toFixed(2)}</p>
                <p>Platform Fee: ₹{totalPlatformFee.toFixed(2)}</p>
                <p>Store Fee: ₹{totalStoreFee.toFixed(2)}</p>
                <p>Net Revenue: ₹{netRevenue.toFixed(2)}</p>
                <p>Avg Delivery Time: {averageDeliveryTime}</p>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="h-64 flex flex-col items-center justify-center gap-2">
                    <PackageOpen className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No orders found for the selected date
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Order Details Sheet */}
      {selectedOrder && (
        <Sheet
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <SheetContent className="overflow-y-auto w-full h-full sm:w-[600px] sm:h-auto px-6 sm:px-8">
            <SheetHeader>
              <SheetTitle>Order Details</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <p>
                  <strong>Order ID:</strong> {selectedOrder.orderId}
                </p>
                <p>
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
                <div>
                  <strong>Products:</strong>
                  <ul className="ml-4 mt-1 list-disc">
                    {Array.isArray(selectedOrder.products) &&
                    selectedOrder.products.length > 0 ? (
                      selectedOrder.products.map((prd, idx) => (
                        <li key={idx}>
                          {prd.name} ({prd.variant || "-"}) x {prd.quantity} - ₹
                          {prd.price}
                        </li>
                      ))
                    ) : (
                      <li>No products found</li>
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Price Details</h3>
                <p>
                  <strong>Platform Fee:</strong> ₹{selectedOrder.platformFee}
                </p>
                <p>
                  <strong>Delivery Fee:</strong> ₹{selectedOrder.deliveryFee}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
                </p>
                <p>
                  <strong>Store Commission:</strong> ₹{selectedOrder.commission}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Timeline</h3>
                <p>
                  <strong>Ordered:</strong>{" "}
                  {format(toDate(selectedOrder.orderAt), "PPP p")}
                </p>
                {Object.entries(selectedOrder.status || {}).map(([key, value]) => (
                  <p key={key}>
                    <strong className="capitalize">{key}:</strong>{" "}
                    {format(toDate(value.timestamp), "PPP p")} ({value.message})
                  </p>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Other Info</h3>
                <p>
                  <strong>Customer Coordinates:</strong>{" "}
                  {selectedOrder.customerCoordinates?.lat},{" "}
                  {selectedOrder.customerCoordinates?.long}
                </p>
                <p>
                  <strong>Store Coordinates:</strong>{" "}
                  {selectedOrder.storeCoordinates?.lat},{" "}
                  {selectedOrder.storeCoordinates?.lng}
                </p>
                <p>
                  <strong>Store ID:</strong> {selectedOrder.storeId}
                </p>
                <p>
                  <strong>User ID:</strong> {selectedOrder.userId}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
