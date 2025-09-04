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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useOrdersQuery, useUsersQuery } from "@/hooks/useFiresStoreQueries";
import type { Order, User } from "@/types/backend/models";

// Convert Firestore timestamp or ISO string to JS Date
function toDate(ts: any): Date {
  if (!ts) return new Date();
  if (typeof ts === "object" && ts.seconds) {
    return new Date(ts.seconds * 1000);
  }
  return new Date(ts);
}

// Degrees → Radians
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Haversine formula for distance in km
function getDistanceFromLatLon(
  { lat1, lon1 }: { lat1: number; lon1: number },
  { lat2, lon2 }: { lat2: number; lon2: number }
) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "ordered", desc: true }, // default: newest first
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: ordersData = [], isLoading } = useOrdersQuery();
  const { data: usersData = [] } = useUsersQuery();

  // Build a quick lookup map for users
  const usersMap = React.useMemo(() => {
    const map: Record<string, User> = {};
    usersData.forEach((user: User) => {
      map[user.uid] = user;
    });
    return map;
  }, [usersData]);

  const formattedOrders = React.useMemo(() => {
    return ordersData.map((order: Order) => {
      const product = order.products?.[0] || {
        name: "-",
        variant: "-",
        quantity: 1,
        price: 0,
      };

      const latestStatusKey = (
        Object.keys(order.status || {}) as (keyof typeof order.status)[]
      )
        .sort(
          (a, b) =>
            toDate(order.status[a]?.timestamp).getTime() -
            toDate(order.status[b]?.timestamp).getTime()
        )
        .pop();

      const orderDate = toDate(order.orderAt);

      let deliveredStatusKey = Object.keys(order.status || {}).find((key) =>
        key.toLowerCase().includes("delivered")
      );
      const deliveredTimestamp = deliveredStatusKey
        ? toDate(
            order.status[deliveredStatusKey as keyof typeof order.status]
              ?.timestamp
          )
        : null;

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

      let distance = "-";
      const customerLat = Number(order.customerCoordinates?.lat);
      const customerLong = Number(order.customerCoordinates?.long);
      const storeLat = Number(order.storeCoordinates?.lat);
      const storeLong = Number(order.storeCoordinates?.long);

      if (
        !isNaN(customerLat) &&
        !isNaN(customerLong) &&
        !isNaN(storeLat) &&
        !isNaN(storeLong)
      ) {
        const d = getDistanceFromLatLon(
          { lat1: customerLong, lon1: customerLat },
          {
            lat2: storeLat,
            lon2: storeLong,
          }
        );
        distance = `${d.toFixed(2)} km`;
      }

      // Match user from usersMap
      const user = usersMap[order.userId];
      const customerName = user ? `${user.firstName} ${user.lastName}` : "-";

      return {
        id: order.orderId,
        ordered: orderDate, // keep Date for sorting
        orderedDisplay: format(orderDate, "MMM d, hh:mm:ss a"),
        delivered: deliveredTimestamp
          ? format(deliveredTimestamp, "MMM d, hh:mm:ss a")
          : "-",
        deliveryTime,
        product: product.name,
        store: order.storename || order.storeId,
        customer: order.customerDetails?.name || "-",
        status: latestStatusKey || "-",
        payment: order.paymentMethod || "-",
        total: order.totalAmount || 0,
        platformFee: order.platformFee || 0,
        deliveryFee: order.deliveryFee || 0,
        storeCommission: order.commission || 0,
        distance,
        orderRaw: order,
      };
    });
  }, [ordersData, usersMap]);

  const filteredData = React.useMemo(() => {
    return formattedOrders.filter((item) => {
      const matchesDate = selectedDate
        ? isSameDay(toDate(item.ordered), selectedDate)
        : true;
      const searchLower = debouncedSearch.toLowerCase();
      return (
        matchesDate &&
        (item.id.toLowerCase().includes(searchLower) ||
          item.store.toLowerCase().includes(searchLower) ||
          item.product.toLowerCase().includes(searchLower) ||
          item.customer.toLowerCase().includes(searchLower)) // ✅ include customer
      );
    });
  }, [formattedOrders, selectedDate, debouncedSearch]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "Order ID" },
    {
      accessorKey: "ordered",
      header: "Ordered",
      cell: ({ row }) => format(row.getValue("ordered"), "MMM d, hh:mm:ss a"),
      sortingFn: "datetime",
    },
    { accessorKey: "delivered", header: "Delivered" },
    { accessorKey: "deliveryTime", header: "Delivery Time" },
    { accessorKey: "distance", header: "Distance Travelled" },
    { accessorKey: "product", header: "Product" },
    { accessorKey: "store", header: "Store" },
    { accessorKey: "customer", header: "Customer" }, // ✅ new column
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    { accessorKey: "payment", header: "Payment" },
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy Order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSelectedOrder(payment.orderRaw)}
              >
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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false, // 🔑 prevents reset
  });

  if (isLoading) return <div className="p-4">Loading orders...</div>;

  return (
    <div className="w-full">
      {/* Search & Date Filter */}
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
              variant="outline"
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
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="h-64 flex flex-col items-center justify-center gap-2">
                    <PackageOpen className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No orders found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
                    {selectedOrder.products.map((prd, idx) => (
                      <li key={idx}>
                        {prd.name} ({prd.variant || "-"}) x {prd.quantity} - ₹
                        {prd.price}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Customer Info</h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.customerDetails?.name}
                </p>
                <p>
                  <strong>Address Line 1:</strong>{" "}
                  {selectedOrder.customerDetails?.addressLine1}
                </p>
                <p>
                  <strong>Address Line 2:</strong>{" "}
                  {selectedOrder.customerDetails?.addressLine2}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.customerDetails?.phone}
                </p>
                <p>
                  <strong>Pincode:</strong>{" "}
                  {selectedOrder.customerDetails?.pincode}
                </p>
                <p>
                  <strong>Type:</strong> {selectedOrder.customerDetails?.type}
                </p>
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
                {Object.entries(selectedOrder.status || {}).map(
                  ([key, value]) => (
                    <p key={key}>
                      <strong className="capitalize">{key}:</strong>{" "}
                      {format(toDate(value.timestamp), "PPP p")} (
                      {value.message})
                    </p>
                  )
                )}
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
                  {selectedOrder.storeCoordinates?.long}
                </p>
                <p>
                  <strong>Distance Travelled:</strong>{" "}
                  {selectedOrder.customerCoordinates?.lat &&
                  selectedOrder.storeCoordinates?.lat
                    ? `${getDistanceFromLatLon(
                        {
                          lat1: Number(selectedOrder.customerCoordinates.long),
                          lon1: Number(selectedOrder.customerCoordinates.lat),
                        },
                        {
                          lat2: Number(selectedOrder.storeCoordinates.lat),
                          lon2: Number(selectedOrder.storeCoordinates.long),
                        }
                      ).toFixed(2)} km`
                    : "-"}
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
