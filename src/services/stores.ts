import { FirestoreService } from "@/firebase/firestoreService";
import { Store } from "@/types/backend/models";

type StoreLogo = {
    logo: File;
    banner: File;
}

export async function fetchStores() {
    const docs = await FirestoreService.getAllDocs("Stores")

    return docs as Store[]
}


export async function updateStoreLogos(storeId: string, { logo, banner }: StoreLogo) {

    const logoUrl = await FirestoreService.uploadFile(logo, "Stores");

    const bannerUrl = await FirestoreService.uploadFile(banner, "Stores");

    await FirestoreService.updateDoc("Stores", storeId, {
        logoUrl: logoUrl,
        bannerUrl: bannerUrl
    });

}

export async function makeStoreActive(storeId: string) {
    await FirestoreService.updateDoc("Stores", storeId, {
        isActive: true
    })
}

export async function makeStoreInActive(storeId: string) {
    await FirestoreService.updateDoc("Stores", storeId, {
        isActive: false
    })
}