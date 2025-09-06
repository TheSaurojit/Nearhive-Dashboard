import { adminMessage } from "@/firebase/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // const { fcmToken, title, body } = await req.json();

        // if (!fcmToken) {
        //     return NextResponse.json({ error: "Missing fcmToken" }, { status: 400 });
        // }
        const message = {
            notification: {
                title: "Order Cancelled ❌",
                body: "Your order has been cancelled by the store.",
            },
            data: {
                action: "order_cancelled",
            },
            token: "fhrKZugSRJ2fcM3A8KjvMM:APA91bFC3HgnoM933sYPD9lz8hLYhkotAaspB-9mMR5uE7ZvxwTkKDQs24Iq_W0w1J0m-jBKnJqAgBL9tg6ebIo4QXpKkHfjMPvN7otq-pO4chztsWRmfeM",
        };

        const response = await adminMessage.send(message);
        console.log("Notification sent successfully:", response);


        return NextResponse.json({
            success: true,
            messageId: response,
        });
    } catch (error : any ) {
        console.error("Error sending notification:", error);
        return NextResponse.json(
            { success: false, error: error?.message },
            { status: 500 }
        );
    }
}