import { FirestoreService } from "@/firebase/firestoreService";
import { FeaturedStores } from "@/types/backend/models";
import { arrayRemove, arrayUnion } from "firebase/firestore";



// Fetch featured stores 
export async function fetchFeaturedStores() : Promise<FeaturedStores> {

    const stores = await FirestoreService.getDoc("Featured Stores", "featured-stores") as FeaturedStores;

    return stores;
}

// add to featured
export async function addToFeaturedStores(storeId: string) : Promise<string> {

    await FirestoreService.updateDoc("Featured Stores", "featured-stores", {

        stores: arrayUnion(storeId)
    });

    return storeId;
}

// remove from featured
export async function removeFromFeaturedStores(storeId: string) : Promise<string> {

    await FirestoreService.updateDoc("Featured Stores", "featured-stores", {

        stores: arrayRemove(storeId)
    });

    return storeId;
}
