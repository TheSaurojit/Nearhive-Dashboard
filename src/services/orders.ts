import { FirestoreService } from "@/firebase/firestoreService";
import { Order } from "@/types/backend/models";
import { Timestamp } from "firebase/firestore";

export async function fetchOrders() {
    const docs = await FirestoreService.getAllDocs("Orders")

    return docs as Order[]
}


export async function cancelOrder(orderId: string) {

    const docArray = await FirestoreService.getByConditions("Orders", [
        {
            field: 'orderId',
            operator: '==',
            value: orderId
        }
    ]) as Order[]

    const doc = docArray[0] ?? null

    if (!doc) {
        return;
    }

    const docId = doc.id

    const status = {
        ...doc.status
        ,
        cancelled: {
            'message': "Order is cancelled",
            'timestamp': Timestamp.now()
        }
    }

    await FirestoreService.updateDoc("Orders", docId, {
        status
    })



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
