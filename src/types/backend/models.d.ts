import { Timestamp } from "firebase/firestore"; // Use this if using Firestore


// type for store
export type Store = {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  category: string;
  createdAt: Timestamp; // Or Date if you convert it
  email: string;
  featuredProductIds: string[];
  followerIds: string[];
  greenFlags: number;
  isActive: boolean;
  isBlocked: boolean;
  isPaused: boolean;
  location: string;
  logoUrl: string;
  bannerUrl : string ;
  name: string;
  ownerId: string;
  phone: string;
  redFlags: number;
  storeDomain: string;
  storeId: string;
  storeLocation: {
    lat: number;
    long: number;
  };
}

// type for campaign
export type Campaign = {
  title: string;
  imageUrls : string[]
  productIds: string[]
}

// type for middlemen
export type Middlemen = {
  address: string;
  age: number;
  dateOfBirth: string; // "DD/MM/YYYY" format
  email: string;
  emergencyContact: string;
  fcmToken: string;
  fullName: string;
  hasVehicle: boolean;
  idProof: string; // e.g., "Aadhaar"
  idProofImageUrl: string;
  isAvailable: boolean;
  lastEarningUpdateDate: string; // "YYYY-MM-DD" format
  middlemanId: string;
  password: string;
  phoneNumber: string;
  registrationDate: Timestamp; // Timestamp or ISO string
  todayEarning: number;
  upiId: string;
  vehicleRegistrationNumber: string;
};

// type for user
export type User = {
  uid: string;
  isCreator : boolean ;
  isWaiting : boolean ;
  address: string[]; // Array of address strings
  createdAt: Timestamp; // Firestore timestamp or ISO string
  email: string;
  firstName: string;
  lastName: string;
  lastUpdated: Timestamp; // Firestore timestamp or ISO string
  likedPosts: string[]; // Array of post IDs or titles
  location: string;
  phoneNumber: string;
  photoURL: string;
  storeId: string | null;
};

//type for cuisine 
type CuisineProduct = {
  imageUrl: string;
  title: string;
  desc: string;
};

export type Cuisine = {
  desc: string;
  heading: string;
  lowerHeading: string;
  image: string;
  banner: string;
  subHeading: string;
  about: string;
  products: CuisineProduct[]
};


// type for orders
type OrderStatusStep = {
  message: string;
  timestamp: Timestamp | string;
};

export type Order = {
  id : string ;
  commission: number;
  couponCode: string;
  couponDiscount: number;
  couponID: string;
  customerCoordinates: {
    lat: number;
    long: number;
  }
  deliveryFee: number;
  isDeliveryFeeOff: boolean;
  isPlatformFeeOff: boolean;
  orderAt: Timestamp; // Firestore timestamp or ISO string
  orderId: string;
  paymentId: string;
  paymentMethod: "COD" | "Online"; // Can expand if needed
  platformFee: number;
  products: {
    imageUrl: string;
    mrp: number;
    name: string;
    note: string;
    price: number;
    productId: string;
    quantity: number;
    variant: string;
  }[];
  status: {
    accepted?: OrderStatusStep;
    ordered?: OrderStatusStep;
    assigned?: OrderStatusStep;
    prepared?: OrderStatusStep;
    delivered?: OrderStatusStep;
    cancelled?: OrderStatusStep;
  },
  storeCoordinates: {
    lat: number;
    long: number;
  };
  storeId: string;
  storename: string;
  totalAmount: number;
  userId: string;
};


// type for products
type ProductVariation = {
  discount: number;
  mrp: number;
  price: number;
  stockQuantity: number;
};

export type Product = {
  createdAt: Timestamp; // ISO date string
  cuisine: string;
  lowerCuisine: string;
  imageUrl: string;
  isAvailable: boolean;
  lastUpdated: Timestamp; // ISO date string
  name: string;
  lowerName: string;
  productCategory: string;
  productId: string;
  storeCategory: string;
  storeId: string;
  type: 'veg' | 'nonVeg'; // can be a union if only these values exist
  variations: {
    [key: string]: ProductVariation; // dynamic keys like "half", "full"
  };
  rating: number;
};


// type for blogs
export type Blog = {
  blogId: string;
  title: string;
  thumbnail: string;
  description: string;
  content: string;
  createdAt: Timestamp; // ISO date string
}

//type for hive creators request
export type CreatorsWaitinglist = {
  cuisines: string[];
  description: string;
  email: string;
  favfood: string;
  name: string;
  phone: string;
  social: string;
  store: string;
  userId: string;
}

//type for featured stores
export type FeaturedStores = {
    stores: string[]
}

// type for food playlist
export type FoodPlaylist = {
  image : string ;
  productIds : string[] ;
  text : string ;
}


// type for middlemen earning
export type MiddlemenEarning = {
    amount: number;
    date: string;
    earning: number;
    orderId: string;
}
