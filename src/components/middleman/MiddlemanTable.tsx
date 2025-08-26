"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";

import { useMiddlemenQuery } from "@/hooks/useFiresStoreQueries";
import { useOrdersQuery } from "@/hooks/useFiresStoreQueries";

import { fetchMiddlemenEarning } from "@/services/middlemen";
import { Middlemen, MiddlemenEarning, Order } from "@/types/backend/models";

type MiddlemanInfo = {
  dob: string;
  photo: string;
  email: string;
  dProof: string;
  vehicleReg: string;
  vehicleLicense: string;
  bankAcc: string;
  emergencyContact: string;
  aadhar: string;
  pan: string;
};

type Middleman = {
  id: string;
  name: string;
  phone: string;
  successfulOrders: number;
  ranking: string;
  rating: number;
  totalAmount: number;
  status: boolean;
  totalEarnings: number;
  info: MiddlemanInfo;
};

function MiddlemanTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [manageSheet, setManageSheet] = useState(false);
  const [salesDialog, setSalesDialog] = useState(false);
  const [selectedMiddleman, setSelectedMiddleman] = useState<Middleman | null>(
    null
  );
  const [earnings, setEarnings] = useState<MiddlemenEarning[]>([]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 0),
  });

  const { data: middlemenData, isLoading, error } = useMiddlemenQuery();
  const { data: ordersData } = useOrdersQuery();

  const middlemen: Middleman[] = useMemo(() => {
    if (!middlemenData) return [];

    return middlemenData.map((m: Middlemen): Middleman => ({
      id: m.middlemanId,
      name: m.fullName,
      phone: m.phoneNumber,
      successfulOrders: 0, // Replace with real data if available
      ranking: "#1", // Static or calculate if needed
      rating: 4, // Static or calculate
      totalAmount: 3000, // Placeholder
      status: m.isAvailable,
      totalEarnings: m.todayEarning,
      info: {
        dob: m.dateOfBirth,
        photo: "",
        email: m.email,
        dProof: m.idProof,
        vehicleReg: m.vehicleRegistrationNumber,
        vehicleLicense: "",
        bankAcc: m.upiId,
        emergencyContact: m.emergencyContact,
        aadhar: m.idProof.includes("Aadhaar") ? m.idProof : "",
        pan: m.idProof.includes("PAN") ? m.idProof : "",
      },
    }));
  }, [middlemenData]);

  const filtered = middlemen.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / 10);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * 10;
    return filtered.slice(start, start + 10);
  }, [filtered, currentPage]);

  const handleToggleStatus = (id: string) => {
    const updated = middlemen.map((m) =>
      m.id === id ? { ...m, status: !m.status } : m
    );
    setSelectedMiddleman((prev) =>
      prev?.id === id ? { ...prev, status: !prev.status } : prev
    );
  };

  // ✅ Combine Earnings + Orders
  const combinedSales = useMemo(() => {
    if (!ordersData || !earnings.length) return [];

    return earnings
      .map((earning) => {
        const order = ordersData.find((o: Order) => o.orderId === earning.orderId);
        if (!order) return null;

        return {
          ...earning,
          order,
        };
      })
      .filter(Boolean) as { earning: number; amount: number; date: string; orderId: string; order: Order }[];
  }, [ordersData, earnings]);

  // ✅ Filter by date range
 const filteredSales = useMemo(() => {
  if (!date?.from || !date?.to) return combinedSales; // ✅ Return all if date range not set

  return combinedSales.filter((item) => {
    const earningDate = parseISO(item.date);
    return isWithinInterval(earningDate, {
      start: date.from as Date, // ✅ Now guaranteed not undefined
      end: date.to as Date,
    });
  });
}, [combinedSales, date]);


  // ✅ Calculate totals
  const totalOrders = filteredSales.length;
  const totalRevenue = filteredSales.reduce(
    (sum, item) => sum + (item.order.totalAmount || 0),
    0
  );
  const totalEarning = filteredSales.reduce(
    (sum, item) => sum + (item.earning || 0),
    0
  );

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error fetching data.</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-4">
        <Input
          placeholder="Search middleman..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-64"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length ? (
            paginated.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.id}</TableCell>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.phone}</TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full text-white ${
                      m.status ? "bg-green-600" : "bg-red-500"
                    }`}
                  >
                    {m.status ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMiddleman(m);
                      setManageSheet(true);
                    }}
                  >
                    Manage
                  </Button>
                  <Button
  onClick={async () => {
    setSelectedMiddleman(m);
    setSalesDialog(true);
    try {
      const data = await fetchMiddlemenEarning(m.id);

      // ✅ Convert FirestoreData to MiddlemenEarning[]
      const mappedData: MiddlemenEarning[] = data.map((doc: any) => ({
        amount: doc.amount ?? 0,
        date: doc.date ?? "",
        earning: doc.earning ?? 0,
        orderId: doc.orderId ?? "",
      }));

      setEarnings(mappedData);
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }
  }}
>
  Track Sales
</Button>

                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </Button>
      </div>

      {/* ✅ Manage Sheet */}
      <Sheet open={manageSheet} onOpenChange={setManageSheet}>
        <SheetContent className="w-[300px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Manage {selectedMiddleman?.name}</SheetTitle>
          </SheetHeader>
          {selectedMiddleman && (
            <div className="space-y-3 py-4 px-6">
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <Switch
                  checked={selectedMiddleman.status}
                  onCheckedChange={() =>
                    handleToggleStatus(selectedMiddleman.id)
                  }
                />
              </div>
              <div className="text-sm space-y-1">
                <p><strong>DOB:</strong> {selectedMiddleman.info.dob}</p>
                <p><strong>Email:</strong> {selectedMiddleman.info.email}</p>
                <p><strong>D Proof:</strong> {selectedMiddleman.info.dProof}</p>
                <p><strong>Vehicle Reg No:</strong> {selectedMiddleman.info.vehicleReg}</p>
                <p><strong>Bank Account:</strong> {selectedMiddleman.info.bankAcc}</p>
                <p><strong>Emergency Contact:</strong> {selectedMiddleman.info.emergencyContact}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ✅ Track Sales Dialog */}
      <Dialog open={salesDialog} onOpenChange={setSalesDialog}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Track Sales for {selectedMiddleman?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="py-2 font-semibold">
            Total Orders: {totalOrders} | Total Revenue: ₹
            {totalRevenue.toFixed(2)} | Total Earnings: ₹
            {totalEarning.toFixed(2)}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Earning</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Order ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length ? (
                filteredSales.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{format(parseISO(item.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      {item.order.products.map((p) => p.name).join(", ")}
                    </TableCell>
                    <TableCell>
                      {item.order.products.reduce((acc, p) => acc + p.quantity, 0)}
                    </TableCell>
                    <TableCell>₹{item.order.totalAmount}</TableCell>
                    <TableCell>₹{item.earning}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">
                        {item.order.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell>{item.orderId}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No sales found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MiddlemanTable;
