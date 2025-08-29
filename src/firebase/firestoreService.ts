import {
  collection,
  doc,
  getDoc as getDocFirebase,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  WhereFilterOp,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from "@/firebase/firebase-client";
import imageCompression from "browser-image-compression";

type FirestoreData = Record<string, any>;

type Condition = {
  field: string;
  operator: WhereFilterOp;
  value: any;
};

type OrderByField = {
  field: string;
  direction?: "asc" | "desc";
};


export const FirestoreService = {
  // 📄 Generate a unique ID
  docId: (): string => uuidv4(),

  // 📥 Get a single document by ID
  getDoc: async (collectionName: string, docId: string): Promise<FirestoreData | null> => {
    const ref = doc(db, collectionName, docId);
    const snapshot = await getDocFirebase(ref);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },

  // 📚 Get all documents in a collection
  getAllDocs: async (collectionName: string): Promise<FirestoreData[]> => {
    const ref = collection(db, collectionName);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // 🆕 Add a document (auto ID)
  addDoc: async (collectionName: string, data: FirestoreData): Promise<string> => {
    const ref = collection(db, collectionName);
    const docRef = await addDoc(ref, data);
    return docRef.id;
  },

  // ✏️ Set (create/replace) a document by ID
  setDoc: async (collectionName: string, docId: string, data: FirestoreData): Promise<void> => {
    const ref = doc(db, collectionName, docId);
    return await setDoc(ref, data);
  },

  // 🔁 Update a document by ID (merge = true)
  updateDoc: async (collectionName: string, docId: string, data: FirestoreData): Promise<void> => {
    const ref = doc(db, collectionName, docId);
    return await setDoc(ref, data, { merge: true });
  },

  // ❌ Delete a document by ID
  deleteDoc: async (collectionName: string, docId: string): Promise<void> => {
    const ref = doc(db, collectionName, docId);
    return await deleteDoc(ref);
  },


  getByConditions: async (collectionName: string, conditions: Condition[] = [], orderByFields: OrderByField[] = []): Promise<FirestoreData[]> => {
    const ref = collection(db, collectionName);

    const constraints: any[] = [];

    if (conditions.length > 0) {
      constraints.push(...conditions.map(c => where(c.field, c.operator, c.value)));
    }

    if (orderByFields.length > 0) {
      constraints.push(...orderByFields.map(o => orderBy(o.field, o.direction || "asc")));
    }

    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  ,

  // 📤 Upload a file and get its download URL
  uploadFile: async (file: File, path: string): Promise<string> => {

     const options = {
      maxSizeMB: 1, // Max size (1MB)
      maxWidthOrHeight: 1920, // Resize
      useWebWorker: true,
    };

     const compressedFile = await imageCompression(file, options);


    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);

    const snapshot = await uploadBytes(storageRef, compressedFile);
    return await getDownloadURL(snapshot.ref);
  },
};
