import { FirestoreService } from "@/firebase/firestoreService";
import { Middlemen } from "@/types/backend/models";

export async function fetchMiddlemen() : Promise<Middlemen[]> {
    
    const docs = await FirestoreService.getAllDocs("Middlemens")

    return docs as Middlemen[]
}

export async function fetchMiddlemenEarning(middlemenId : string ) {

    const docs = await FirestoreService.getAllDocs(`Middlemens/${middlemenId}/Earnings`)

    return docs

    
}