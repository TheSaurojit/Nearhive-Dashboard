"use client";

import { cancelOrder } from "@/services/orders";
import React, { useState } from "react";

type StatusType = "delivered" | "cancelled";

const OrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState<string>("");
  const [status, setStatus] = useState<StatusType>("cancelled"); // ✅ typed state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      alert("Please enter an Order ID");
      return;
    }

    await cancelOrder(orderId, status); // ✅ now type-safe
    alert(`Order marked as ${status}`);

    console.log("Submitted Order:", { orderId, status });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-white">Update Order</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-80"
      >
        <input
          type="text"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusType)} // ✅ cast
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="cancelled">Cancelled</option>
          <option value="delivered">Delivered</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default OrderPage;
