import { FirestoreService } from "@/firebase/firestoreService"
import { User } from "@/types/backend/models"

export async function fetchUsers() {
    const docs = await FirestoreService.getAllDocs("Users")

    return docs as User[]
}
