"use client"

import React, { useState } from "react"

type RefundRecord = {
  name: string
  amount: number
  reason: string
  date: string
}

const RefundTable: React.FC = () => {
  const [data, setData] = useState<RefundRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [selectedReason, setSelectedReason] = useState<string | null>(null)

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!name || !amount || !reason) return

    const currentDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    setData((prev) => [
      ...prev,
      {
        name,
        amount: parseFloat(amount),
        reason,
        date: currentDate,
      },
    ])

    setName("")
    setAmount("")
    setReason("")
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-sm text-muted-foreground relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-input bg-background text-foreground rounded-md px-3 py-2 w-1/2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition px-4 py-2 rounded-md text-sm font-medium shadow-sm"
        >
          Add Record
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-left text-sm bg-background">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Reason</th>
      
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-accent transition"
                >
                  <td className="p-3 text-foreground">{record.date}</td>
                  <td className="p-3 text-foreground">{record.name}</td>
                  <td className="p-3 text-foreground">₹{record.amount}</td>
                  <td
                    className="p-3 text-foreground cursor-pointer"
                    onClick={() => setSelectedReason(record.reason)}
                    title="Click to view full reason"
                  >
                    {record.reason.length > 25
                      ? record.reason.slice(0, 25) + "..."
                      : record.reason}
                  </td>
         
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-3 text-center text-foreground"
                  colSpan={4}
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reason Popup */}
      {selectedReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2 text-foreground">Full Reason</h2>
            <p className="text-foreground mb-4">{selectedReason}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReason(null)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Add Refund Record
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-input bg-background text-foreground rounded-md px-3 py-2 w-full"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-input bg-background text-foreground rounded-md px-3 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border border-input bg-background text-foreground rounded-md px-3 py-2 w-full"
              />
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-md border bg-background hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RefundTable
