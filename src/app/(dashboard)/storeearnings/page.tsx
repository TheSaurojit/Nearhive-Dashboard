"use client";
import * as React from "react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { useOrdersQuery, useStoresQuery } from "@/hooks/useFiresStoreQueries";
import type { Order, Store } from "@/types/backend/models";

import { Calendar as CalendarIcon, Download, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

function toDate(ts: any): Date {
  if (!ts) return new Date();
  if (typeof ts === "object" && ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

type AggregatedRow = {
  storeId: string;
  storeName: string;
  orders: number;
  grossSales: number;
  commission: number;
  platformFee: number;
  deliveryFee: number;
  avgOrderValue: number;
};



export default function StoreEarnings() {
  const { data: ordersData = [], isLoading: ordersLoading } = useOrdersQuery();
  const { data: storesData = [], isLoading: storesLoading } = useStoresQuery();

  // Date range (default: last 7 days)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date()),
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "grossSales", desc: true },
  ]);

  // Search by store name or id
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);

  // Build store map
  const storeMap = React.useMemo(() => {
    const m: Record<string, Store> = {};
    (storesData as Store[]).forEach((s) => (m[s.storeId] = s));
    return m;
  }, [storesData]);

  // Filter by date
  const dateFilteredOrders = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return ordersData;
    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);
    return (ordersData as Order[]).filter((o) => {
      const d = toDate(o.orderAt);
      return isWithinInterval(d, { start, end });
    });
  }, [ordersData, dateRange]);

  // Keep only delivered
  const deliveredOrders = React.useMemo(
    () => (dateFilteredOrders as Order[]).filter((o) => !!o.status?.delivered),
    [dateFilteredOrders]
  );

  // Aggregate in one pass
  const aggregates: AggregatedRow[] = React.useMemo(() => {
    const bucket: Record<string, AggregatedRow> = {};

    for (const o of deliveredOrders as Order[]) {
      const id = o.storeId || "unknown";
      const storeName = storeMap[id]?.name || o.storename || id;

      const b = (bucket[id] ||= {
        storeId: id,
        storeName,
        orders: 0,
        grossSales: 0,
        commission: 0,
        platformFee: 0,
        deliveryFee: 0,
        avgOrderValue: 0,
      });

      b.orders++;
      b.grossSales += o.totalAmount || 0;
      b.commission += (o as any).commission || 0;
      b.platformFee += o.platformFee || 0;
      b.deliveryFee += o.deliveryFee || 0;
    }

    return Object.values(bucket).map((r) => ({
      ...r,
      avgOrderValue: r.orders ? r.grossSales / r.orders : 0,
    }));
  }, [deliveredOrders, storeMap]);

  // Summary cards
  const summary = React.useMemo(() => {
    return aggregates.reduce(
      (acc, cur) => {
        acc.orders += cur.orders;
        acc.grossSales += cur.grossSales;
        acc.commission += cur.commission;
        acc.platformFee += cur.platformFee;
        acc.deliveryFee += cur.deliveryFee;
        return acc;
      },
      { orders: 0, grossSales: 0, commission: 0, platformFee: 0, deliveryFee: 0 }
    );
  }, [aggregates]);

  const columns: ColumnDef<AggregatedRow>[] = [
    { accessorKey: "storeName", header: "Store" },
    {
      accessorKey: "orders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.getValue("orders")}</span>
      ),
    },
    {
      accessorKey: "grossSales",
      header: "Total Sales",
      cell: ({ row }) => (
        <span className="tabular-nums">
          ₹{(row.getValue("grossSales") as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "commission",
      header: "Store Commission",
      cell: ({ row }) => (
        <span className="tabular-nums">
          ₹{(row.getValue("commission") as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "platformFee",
      header: "Platform Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">
          ₹{(row.getValue("platformFee") as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "deliveryFee",
      header: "Delivery Fee",
      cell: ({ row }) => (
        <span className="tabular-nums">
          ₹{(row.getValue("deliveryFee") as number).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "avgOrderValue",
      header: "Avg Order",
      cell: ({ row }) => (
        <span className="tabular-nums">
          ₹{(row.getValue("avgOrderValue") as number).toFixed(2)}
        </span>
      ),
    },
  ];

  // Filter aggregates by search
  const tableData = React.useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return aggregates;
    return aggregates.filter(
      (r) =>
        r.storeName.toLowerCase().includes(q) ||
        r.storeId.toLowerCase().includes(q)
    );
  }, [aggregates, deferredSearch]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });



  // Presets
  const presetSetters = {
    today: () =>
      setDateRange({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
    last7: () =>
      setDateRange({
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date()),
      }),
    thisMonth: () =>
      setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    clear: () => setDateRange(undefined),
  };

  const loading = ordersLoading || storesLoading;

  return (
    <div className="w-full space-y-6 font-main">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Earnings</h1>
   
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} –{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Presets <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Quick ranges</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={presetSetters.today}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={presetSetters.last7}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={presetSetters.thisMonth}>
                  This month
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={presetSetters.clear}>
                  Clear
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:ml-auto w-full md:w-[320px]">
            <Input
              placeholder="Search store name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            ₹{summary.grossSales.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Store Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            ₹{summary.commission.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {summary.orders}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Platform + Delivery Fee
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            ₹{(summary.platformFee + summary.deliveryFee).toFixed(2)}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={cn(
                      h.column.id === "grossSales" ||
                        h.column.id === "commission" ||
                        h.column.id === "platformFee" ||
                        h.column.id === "deliveryFee" ||
                        h.column.id === "avgOrderValue"
                        ? "text-right"
                        : ""
                    )}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between cursor-pointer select-none">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{
                        asc: "↑",
                        desc: "↓",
                      }[h.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No data for the selected range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
