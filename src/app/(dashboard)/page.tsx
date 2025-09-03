"use client";

import { FirestoreService } from "@/firebase/firestoreService";
import { dump } from "@/helper/helper";
import { addToFeaturedStores, fetchFeaturedStores, removeFromFeaturedStores } from "@/services/featuredStores";
import { fetchPendingCreators, fetchVerifiedCreators } from "@/services/hiveCreators";
import { fetchMiddlemenEarning } from "@/services/middlemen";
import { fetchProductCategories, updateImageProductCategories } from "@/services/products";
import { fetchStores, makeStoreActive, makeStoreInActive } from "@/services/stores";
import { Timestamp } from "firebase/firestore";
import React, { useEffect } from "react";

export default async function page() {
  const ckData = async () => {

    // await fetchProductCategories("nOxFROaDwelLBzFkcqSS")

    //   const cutoffDate = new Date("2025-08-05T02:12:20+05:30"); // Your cutoff date

    //  const orders =  await FirestoreService.getByConditions(
    //     "Orders",
    //     [
    //       { field: "couponCode", operator: "==", value: "" }, // condition
    //     ]
    //   );

    //   console.log(orders);
  };

  useEffect(() => {
    ckData();
  }, []);

  return <div>page</div>;
}
