import { FirestoreService } from "@/firebase/firestoreService";
import { toLowerNoSpaces } from "@/helper/helper";
import { Product } from "@/types/backend/models";
import { Timestamp } from "firebase/firestore";

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


type ProductUpdate = {
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
            variations : product.variations ,

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


//     const docId = FirestoreService.docId()

//   await  FirestoreService.setDoc("products",docId,{
//       "createdAt": Timestamp.now(),
//         "cuisine": "North Indian",
//         "lowerCuisine": "northindian",
//         "imageUrl": "https://firebasestorage.googleapis.com/v0/b/tnennt-1e1f2.appspot.com/o/products%2FProduct-ID-0278c4c9-c9eb-4e76-96d1-7c5f0862faad%2F48a251b0f2ab6de7d0ba948bdc880e99.jpg?alt=media",
//         "isAvailable": true,
//         "lastUpdated":  Timestamp.now(),
//         "name": "Aloo Bhat",
//         "lowerName": "aloobhat",
//         "productCategory": "Cafes",
//         "productId": docId,
//         "storeCategory": "Biryani Special",
//         "storeId": "UGuFkpi4gR6zu42RFyML",
//         "type": "nonVeg",
//         "variations": {
//             "half": {
//                 "discount": 10,
//                 "mrp": 189,
//                 "price": 171,
//                 "stockQuantity": 1000000
//             }
//         },
//         "rating": 4.2

//     })
