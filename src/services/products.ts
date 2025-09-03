import { FirestoreService } from "@/firebase/firestoreService";
import { toLowerNoSpaces } from "@/helper/helper";
import { Product } from "@/types/backend/models";
import { arrayUnion, Timestamp } from "firebase/firestore";

type Variation = {
    discount: number;
    mrp: number;
    price: number;
    stockQuantity: number;
};


type ProductCreate = {
    name: string;
    image: File;
    cuisine: string;
    productCategory: string;
    storeCategory: string;
    storeId: string;
    type: 'Veg' | 'Non Veg';
    variations: {
        [key: string]: Variation; // e.g., "half", "full"
    };
};

type ProductCategory = {
    docid: string;
    createdAt: Timestamp;
    imageUrl: string;
    lastUpdated: Timestamp;
    name: string;
    productIds: string[];
}

type CategoryImageUpdate = {
    storeId: string;
    categoryDocId: string;
    image: File ;
}


export type ProductUpdate = {
    name?: string;
    cuisine?: string;
    // productCategory: string;
    image?: File;
    type?: 'Veg' | 'Non Veg';
    variations?: {
        [key: string]: Variation; // e.g., "half", "full"
    };
};


export async function fetchProducts() {
    const docs = await FirestoreService.getAllDocs("products")

    return docs as Product[]
}

export async function createProduct({
    name,
    image,
    cuisine,
    productCategory,
    storeCategory,
    storeId,
    type,
    variations
}: ProductCreate) {


    const docId = FirestoreService.docId();

    try {


        const product: Product = {
            createdAt: Timestamp.now(),
            cuisine: cuisine,
            lowerCuisine: toLowerNoSpaces(cuisine),
            name: name,
            lowerName: toLowerNoSpaces(name),
            isAvailable: true,
            productCategory: productCategory,
            storeCategory: storeCategory,
            storeId: storeId,
            type: type == "Veg" ? "veg" : "nonVeg",
            variations: variations,
            rating: 0,
            lastUpdated: Timestamp.now(),
            productId: docId,
            imageUrl: await FirestoreService.uploadFile(image, "Products")
            // imageUrl: "https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630"

        }

        await FirestoreService.setDoc("products", docId, product)

        return product
    }

    catch (error) {

        throw new Error("Failed to create product")

    }

}


export async function updateProduct(product: Product, {
    name,
    image,
    cuisine,
    type,
    variations
}: ProductUpdate) {


    const docId = product.productId;

    try {


        const updateProduct: Product = {
            cuisine: cuisine ?? product.cuisine,
            lowerCuisine: cuisine ? toLowerNoSpaces(cuisine) : product.cuisine,
            name: name ?? product.name,
            lowerName: name ? toLowerNoSpaces(name) : product.lowerName,
            type: type ? (type == "Veg" ? "veg" : "nonVeg") : product.type,
            imageUrl: image ? await FirestoreService.uploadFile(image, "Products") : product.imageUrl,
            // variations: variations ?? product.variations,

            //current scenario
            variations: product.variations,

            createdAt: product.createdAt,
            isAvailable: product.isAvailable,
            productCategory: product.productCategory,
            storeCategory: product.storeCategory,
            storeId: product.storeId,
            rating: product.rating,
            lastUpdated: Timestamp.now(),
            productId: product.productId,

        }

        await FirestoreService.updateDoc("products", docId, updateProduct)

        return updateProduct
    }

    catch (error) {
        throw new Error("Failed to update product")


    }

}


export async function fetchProductCategories(storeId: string) {

    const categories = await FirestoreService.getAllDocs(`Stores/${storeId}/categories`) as ProductCategory[]

    return categories
}


export async function updateImageProductCategories({ storeId, categoryDocId, image }: CategoryImageUpdate) {

    await FirestoreService.updateDoc(`Stores/${storeId}/categories`, categoryDocId, {
        imageUrl: await FirestoreService.uploadFile(image, "Categories")
    })

}



export async function addToFeaturedProducts({ storeId , productId } : { storeId : string , productId : string }) {

    await FirestoreService.updateDoc("Stores",storeId, {
        featuredProductIds : arrayUnion(productId)
    })
}