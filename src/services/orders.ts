import { db } from "@/firebase/firebase-client";
import { FirestoreService } from "@/firebase/firestoreService";
import { Order, User } from "@/types/backend/models";
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

            status: {
                accepted: deleteField(),
                prepared: deleteField(),
                assigned: deleteField(),
                delivering: deleteField(),
                delivered: deleteField(),

                ordered: data.status.ordered,
                cancelled: {
                    message: "Order was cancelled",
                    timestamp: new Date(),
                }
            },
        });

        const userId = data.userId

        const user = await FirestoreService.getDoc("Users", userId) as User

        fetch(`/api/notify?fcmToken=${encodeURIComponent(user.fcmToken)}`, {
            method: "GET",
        }).catch((err) => {
            console.error("Notification failed:", err);
        });
    }

    if (statusType === "delivered") {
        await FirestoreService.updateDoc("Orders", docId, {
            isOrderOngoing: false,
            status: {
                ordered: data.status.ordered,
                delivered: {
                    message: "Order delivered successfully",
                    timestamp: new Date(),
                }
            },
        });
    }






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
