"use client"

import React, { useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export type Campaign = {
  id: string
  name: string
  date: string
  headings: string[]
}

type Props = {
  open: boolean
  onClose: () => void
  campaigns: Campaign[]
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

export default function AddCampaignDialog({ open, onClose, campaigns }: Props) {
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>()
  const [selectedYear, setSelectedYear] = useState<string | undefined>()
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesMonth = selectedMonth ? new Date(c.date).toLocaleString("default", { month: "long" }) === selectedMonth : true
      const matchesYear = selectedYear ? new Date(c.date).getFullYear().toString() === selectedYear : true
      return matchesSearch && matchesMonth && matchesYear
    })
  }, [campaigns, search, selectedMonth, selectedYear])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Campaign</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search campaigns"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  <Sheet open={activeSheet === c.id} onOpenChange={(v) => setActiveSheet(v ? c.id : null)}>
                    <SheetTrigger asChild>
                      <Button size="sm">Add Heading</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>{c.name} Headings</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-2 mt-4">
                        {c.headings.map((h, i) => (
                          <div key={i} className="flex items-center justify-between border rounded px-3 py-2">
                            <span>{h}</span>
                            <Switch />
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
