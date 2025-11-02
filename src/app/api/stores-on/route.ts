import { adminDb } from "@/firebase/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    try {
        const querySnapshot = await adminDb.collection("Stores").where("isPaused","==",false).get();

        const stores = querySnapshot.docs.map(doc => doc.id);

        const batch = adminDb.batch();

        stores.forEach(storeId => {
            const storeRef = adminDb.collection("Stores").doc(storeId);
            batch.update(storeRef, { isActive: true });
        });

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: "All stores have been successfully activated.",
        });
    } catch (error) {
        console.error("Error activating stores:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to activate stores. Please try again later.",
        }, { status: 500 });
    }

}
