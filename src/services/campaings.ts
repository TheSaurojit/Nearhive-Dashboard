import { FirestoreService } from "@/firebase/firestoreService";
import { Campaign } from "@/types/backend/models";
import { arrayUnion } from "firebase/firestore";

// Fetch all campaigns 
export async function fetchCampaigns(): Promise<Campaign[]> {

    const campaigns = await FirestoreService.getAllDocs("Campaigns") as Campaign[];

    return campaigns;
}


// create campaign






// insert images in campaign
export async function updateCampaignImages(images: File[]) {

    const imageUrls = await Promise.all(images.map(img => FirestoreService.uploadFile(img, "Campaign")))


    await FirestoreService.updateDoc("Campaigns", "campaignDoc", {

        imageUrls: imageUrls

    });

}


// insert productIds in campaign
export async function updateCampaignProducts(productId: string) {
    await FirestoreService.updateDoc("Campaigns", "campaignDoc", {

        productIds: arrayUnion(productId)
    })
}

//delete campaign
export async function deleteCampaignData() {

    await FirestoreService.updateDoc("Campaigns", "campaignDoc", {
        imageUrls: [],
        productIds: [],
    })


}