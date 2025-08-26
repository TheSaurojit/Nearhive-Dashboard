
import { FirestoreService } from "@/firebase/firestoreService";
import { toLowerNoSpaces } from "@/helper/helper";
import { Cuisine } from "@/types/backend/models";

type Product = {
    imageUrl: File | null;
    title: string;
    desc: string;
};

type CuisineCreate = {
    desc: string;
    heading: string;
    image: File;
    banner: File;
    subHeading: string;
    about: string;
    products: Product[];
};



// Fetch all cuisines 
export async function fetchCuisines(): Promise<Cuisine[]> {

    const cuisines = await FirestoreService.getAllDocs("CuisineItems") as Cuisine[];

    return cuisines;
}


// create cuisine
export async function createCuisine({ heading, image, banner, subHeading, about, products, desc }: CuisineCreate): Promise<Cuisine> {

    try {

        const uploadedProducts = await Promise.all(
            products
                .filter((product) => product.imageUrl) // ✅ Skip products without imageUrl
                .map(async (product) => {

                    let imageUrl = await FirestoreService.uploadFile(product.imageUrl as File, "Cuisine");

                    return {
                        title: product.title,
                        desc: product.desc,
                        imageUrl: imageUrl,
                    };
                })
        );


        const cuisine: Cuisine = {
            heading: heading,
            lowerHeading: toLowerNoSpaces(heading),
            subHeading: subHeading,
            about: about,
            desc: desc,
            image: await FirestoreService.uploadFile(image, "Cuisine"),
            banner: await FirestoreService.uploadFile(banner, "Cuisine"),
            products: uploadedProducts

        }

        await FirestoreService.addDoc("CuisineItems", cuisine)

        return cuisine

    } catch (error) {

        throw new Error("Failed to create cuisine")

    }


}


//delete cuisine
export async function deleteCuisine(cuisineId: string) : Promise<string> {

    await FirestoreService.deleteDoc("CuisineItems", cuisineId)

    return cuisineId

}