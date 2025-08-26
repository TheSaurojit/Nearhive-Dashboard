"use client"

import React, { useState } from "react"

type RefundRecord = {
  amount: number
  reason: string
  date: string
}

const RecordTable: React.FC = () => {
  const [data, setData] = useState<RefundRecord[]>([])
  const [showForm, setShowForm] = useState(false)

  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [selectedReason, setSelectedReason] = useState<string | null>(null)

  const handleAdd = () => {
    if (!amount || !reason) return

    const currentDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    setData((prev) => [
      ...prev,
      {
        amount: parseFloat(amount),
        reason,
        date: currentDate,
      },
    ])

    setAmount("")
    setReason("")
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-sm text-muted-foreground relative">
      {/* Top Bar */}
      <div className="flex justify-end items-center mb-6">
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
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Reason</th>      
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((record, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-accent transition"
                >
                  <td className="p-3 text-foreground">{record.date}</td>
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
                  colSpan={3}
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
                  className="bg-white text-black  px-4 py-2 text-sm rounded-md"
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

export default RecordTable
