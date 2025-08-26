import { FirestoreService } from "@/firebase/firestoreService";
import { Store } from "@/types/backend/models";

export async function fetchStores() {
    const docs = await FirestoreService.getAllDocs("Stores")

    return docs as Store[]
}
