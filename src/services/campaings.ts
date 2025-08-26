import { FirestoreService } from "@/firebase/firestoreService";
import { Campaign } from "@/types/backend/models";

// Fetch all campaigns 
export async function fetchCampaigns(): Promise<Campaign[]> {

    const campaigns = await FirestoreService.getAllDocs("Campaigns") as Campaign[];

    return campaigns;
}


// create campaign
export async function createCampaign({ title, productIds = [] }: Campaign): Promise<Campaign> {

    const campaign = {
        title,
        productIds
    }

    await FirestoreService.addDoc("Campaigns", {
        title : campaign.title,
        productIds : campaign.productIds
    });

    return campaign;
}


// update campaign
export async function updateCampaign(campaignId: string, { title, productIds }: Campaign): Promise<Campaign> {

        const campaign = {
        title,
        productIds
    }

    await FirestoreService.updateDoc("Campaigns", campaignId, {
        title : campaign.title,
        productIds : campaign.productIds
    });
    
    return campaign;
}


//delete campaign
export async function deleteCampaign(campaignId: string): Promise<string> {

    await FirestoreService.deleteDoc("Campaigns", campaignId)

    return campaignId

}