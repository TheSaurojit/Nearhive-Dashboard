import { FirestoreService } from "@/firebase/firestoreService";
import { CreatorsWaitinglist, User } from "@/types/backend/models";

type UserWithCreator = User & Partial<CreatorsWaitinglist>;

// Fetch pending creators 
export async function fetchPendingCreators() {

    const users = await FirestoreService.getByConditions("Users", [{ field: 'isWaiting', operator: "==", value: true }]) as User[];


    const creators: UserWithCreator[] = await Promise.all(
        users
            .filter(user => Boolean(user.uid))
            .map(user =>
                FirestoreService.getByConditions(
                    "Creators-Waitinglist",
                    [{ field: "userId", operator: "==", value: user.uid }]
                ).then(reqs => ({
                    ...(reqs[0] ?? {}),// merge only if exists
                    ...user
                }))
            )
    );

    return creators;
}


// Fetch verified creators
export async function fetchVerifiedCreators() {

    const users = await FirestoreService.getByConditions("Users", [{ field: 'isCreator', operator: "==", value: true }]) as User[];

    const creators: UserWithCreator[] = await Promise.all(
        users
            .filter(user => Boolean(user.uid))
            .map(user =>
                FirestoreService.getByConditions(
                    "Creators-Waitinglist",
                    [{ field: "userId", operator: "==", value: user.uid }]
                ).then(reqs => ({
                    ...(reqs[0] ?? {}),// merge only if exists
                    ...user
                }))
            )
    );

    return creators;
}

// approve as creator
export async function approveCreator(userId: string) {

    const updatedUser: Partial<User> = {
        isCreator: true,
        isWaiting: false
    }

    await FirestoreService.updateDoc("Users", userId, updatedUser)
}

// remove as creator
export async function removeCreator(userId: string) {

    const updatedUser: Partial<User> = {
        isCreator: false,
        isWaiting: false
    }

    await FirestoreService.updateDoc("Users", userId, updatedUser)
}