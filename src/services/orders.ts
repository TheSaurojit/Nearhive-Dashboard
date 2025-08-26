import { FirestoreService } from "@/firebase/firestoreService";
import { Order } from "@/types/backend/models";

export async function fetchOrders() {
    const docs = await FirestoreService.getAllDocs("Orders")

    return docs as Order[]
}

// import { db } from "@/firebase/firebase-client";
// import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
// import { startAfter, DocumentData } from "firebase/firestore";


// export async function fetchInitialPosts() {
//   const q = query(
//     collection(db, "Users"),
//     orderBy("createdAt", "desc"),
//   );

//   const snapshot = await getDocs(q);
//   const lastVisible = snapshot.docs[snapshot.docs.length - 1];

//   return {
//     posts: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
//     lastVisible,
//   };
// }



// export async function fetchMorePosts(lastDoc: DocumentData) {
//   const q = query(
//     collection(db, "Orders"),
//     orderBy("orderAt", "desc"),
//     startAfter(lastDoc),
//     limit(10)
//   );

//   const snapshot = await getDocs(q);
//   const lastVisible = snapshot.docs[snapshot.docs.length - 1];

//   return {
//     posts: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
//     lastVisible,
//   };
// }
