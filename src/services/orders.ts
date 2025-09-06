import { db } from "@/firebase/firebase-client";
import { FirestoreService } from "@/firebase/firestoreService";
import { Order } from "@/types/backend/models";
import { deleteField, Timestamp } from "firebase/firestore";

export async function fetchOrders() {
    const docs = await FirestoreService.getAllDocs("Orders")

    return docs as Order[]
}

type StatusType = "delivered" | "cancelled";

export async function updateOrderStatus(orderId: string, statusType: StatusType) {
    const docArray = (await FirestoreService.getByConditions("Orders", [
        {
            field: "orderId",
            operator: "==",
            value: orderId,
        },
    ])) as Order[];

    const data = docArray[0] ?? null;

    if (!data) {
        return;
    }

    const docId = data.id


    if (statusType === "cancelled") {
        await FirestoreService.updateDoc("Orders", docId, {
            assigned: false,
            isOrderOngoing: false,
            providedMiddlemen: deleteField(),
            "status.accepted": deleteField(),
            "status.prepared": deleteField(),
            "status.assigned": deleteField(),
            "status.delivering": deleteField(),
            "status.delivered": deleteField(),
            status: {
                ordered: data.status.ordered,
                cancelled: {
                    message: "Order was cancelled",
                    timestamp: new Date(),
                }
            },
        });
    }

    if (statusType === "delivered") {
        await FirestoreService.updateDoc("Orders", docId, {
            isOrderOngoing: false,
            "status.delivered": {
                message: "Order delivered successfully",
                timestamp: new Date(),
            },
        });
    }

    console.log(data, "dt");



    // const res = await fetch('/api/notify')

    // console.log(res);



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
