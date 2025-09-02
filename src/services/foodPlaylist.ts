import { FirestoreService } from "@/firebase/firestoreService";
import { FoodPlaylist } from "@/types/backend/models";

type CreateFoodPlaylist = {
    image: File;
    productIds: string[];
    text: string;

}

// Fetch list 
export async function fetchFoodPlaylist() {

    console.log("fetching playslist" , Date.now());
    

    const lists = await FirestoreService.getAllDocs("Foodplaylist") as FoodPlaylist[];

    return lists;
}


// create list 
export async function createFoodPlaylist({ image, productIds =[], text }: CreateFoodPlaylist) {

    const list = {
        image: await FirestoreService.uploadFile(image, "FoodPlaylist",),
        productIds,
        text : ""
    };


    await FirestoreService.addDoc("Foodplaylist", list);

    return list;
}


// update list 
export async function updateFoodPlaylist(playlistId: string, { image, productIds, text }: Partial<CreateFoodPlaylist>) {
    const list = {
        image,
        productIds,
        text : ""
    };

    await FirestoreService.updateDoc("Foodplaylist", playlistId, list);

    return list;
}

// delete list 
export async function deleteFoodPlaylist(playlistId: string) {

    await FirestoreService.deleteDoc("Foodplaylist", playlistId);

    return playlistId;
}