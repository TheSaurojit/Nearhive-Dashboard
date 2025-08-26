import { FirestoreService } from "@/firebase/firestoreService";
import { Order, User } from "@/types/backend/models";


export async function fetchCustomers() : Promise<User[]> {
  // Fetch all users and orders
  // 1. Fetch all orders
  const orders = await FirestoreService.getAllDocs("Orders") as Order[];

  // 2. Extract unique user IDs from orders
  const userIds = Array.from(new Set(orders.map(order => order.userId)));

  // 3. Fetch only those users
  const usersWithOrders = await Promise.all(
    userIds.map(id => FirestoreService.getDoc("Users", id) as Promise<User | null>)
  );

  // 4. Filter out nulls (if a user record doesn't exist)
  const customers = usersWithOrders.filter((user): user is User => user !== null);

  return customers;

}
