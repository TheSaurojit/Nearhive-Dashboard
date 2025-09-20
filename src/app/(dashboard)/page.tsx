"use client";

import { db } from "@/firebase/firebase-client";
import { FirestoreService } from "@/firebase/firestoreService";
import { dump } from "@/helper/helper";
import {
  addToFeaturedStores,
  fetchFeaturedStores,
  removeFromFeaturedStores,
} from "@/services/featuredStores";
import {
  fetchPendingCreators,
  fetchVerifiedCreators,
} from "@/services/hiveCreators";
import { fetchMiddlemenEarning } from "@/services/middlemen";
import { fetchOrders } from "@/services/orders";
import {
  fetchProductCategories,
  updateImageProductCategories,
} from "@/services/products";
import {
  fetchStores,
  makeStoreActive,
  makeStoreInActive,
} from "@/services/stores";
import { Order } from "@/types/backend/models";
import { doc, Timestamp, writeBatch } from "firebase/firestore";
import React, { useEffect } from "react";

export default async function page() {

  const ckData = async () => {
    
    // const orders = await fetchOrders();

    // const filteredOrders = orders.filter((order) => order.status.delivered);

    // const newOrders = filteredOrders.map((order) => {
    //   const baseCommission =
    //     order.products[0].price * order.products[0].quantity * 0.075;

    //   const commission = Math.ceil(baseCommission);

    //   return {
    //     orderId: order.orderId,
    //     commission: commission,
    //     price: order.products[0].price,
    //     docId: order.id,
    //   };
    // });

    // console.log(filteredOrders, newOrders);

    // const batch = writeBatch(db);

    // newOrders.forEach(({ docId, commission }) => {
    //   const orderRef = doc(db, "Orders", docId); 
    //   batch.update(orderRef, {commission : commission});
    // });

    // await batch.commit();


  };

  useEffect(() => {
    ckData();
  }, []);

  return <div>page</div>;
}
