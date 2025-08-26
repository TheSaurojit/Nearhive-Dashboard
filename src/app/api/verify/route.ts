import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebase-admin';
import { dump } from '@/helper/helper';


export async function GET(req: NextRequest) {    

    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
        return NextResponse.json({ user: null }, { status: 400 });
    }

    try {

         const decodedToken = await adminAuth.verifySessionCookie(token, true);

         dump("api verifying ");

        const adminSubcollectionRef = adminDb
            .collection("Authorized-Admins")
            .doc("document")
            .collection("admin");

        const querySnapshot = await adminSubcollectionRef
            .where("email", "==", decodedToken.email)
            .limit(1)
            .get();

        const firstDoc = querySnapshot.docs[0]; // will be undefined if no match

        const admin = firstDoc ? { id: firstDoc.id, ...firstDoc.data() } : null;

        return NextResponse.json({ user: admin });
    } catch (error) {
        console.error("Auth verification error:", error);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
