"use client";

import { cancelOrder } from "@/services/orders";
import React, { useState } from "react";

const OrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      alert("Please enter an Order ID");
      return;
    }
    await cancelOrder(orderId);
      alert("Please Order Cancelled");

    console.log("Submitted Order ID:", orderId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold mb-6">Enter Order ID</h1>
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
