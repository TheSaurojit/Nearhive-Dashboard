import { adminMessage } from "@/firebase/firebase-admin";
import { dump } from "@/helper/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {

        const { searchParams } = new URL(req.url);

        const fcmToken = searchParams.get("fcmToken");

        if (!fcmToken) {
            return NextResponse.json({ error: "fcmToken missing" }, { status: 400 });
        }
        

        const message = {
            notification: {
                title: "Order Cancelled ",
                body: "Your order has been cancelled by the store.",
            },
            data: {
                action: "order_cancelled",
            },
            token: fcmToken
        };

        const response = await adminMessage.send(message);
        console.log("Notification sent successfully:", response);


        return NextResponse.json({
            success: true,
            messageId: response,
        });
    } catch (error: any) {
        console.error("Error sending notification:", error);
        return NextResponse.json(
            { success: false, error: error?.message },
            { status: 500 }
        );
    }
}