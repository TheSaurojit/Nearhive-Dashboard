import { fetchCampaigns } from "@/services/campaings";
import { fetchCuisines } from "@/services/cuisines";
import { fetchCustomers } from "@/services/customers";
import { fetchFeaturedStores } from "@/services/featuredStores";
import { fetchFoodPlaylist } from "@/services/foodPlaylist";
import {  fetchPendingCreators, fetchVerifiedCreators } from "@/services/hiveCreators";
import { fetchMiddlemen, fetchMiddlemenEarning } from "@/services/middlemen";
import { fetchOrders } from "@/services/orders";
import { fetchProducts } from "@/services/products";
import { fetchStores } from "@/services/stores";
import { fetchUsers } from "@/services/users";
import { fetchVideos } from "@/services/videos";
import { useQuery } from "@tanstack/react-query";

// Hook for stores
export function useStoresQuery() {
    return useQuery({
        queryKey: ["stores"],
        queryFn: fetchStores ,
        refetchOnWindowFocus : false ,
        refetchOnMount : true ,
        refetchInterval : 5000
    });
}

// Hook for middlemen
export function useMiddlemenQuery() {
    return useQuery({
        queryKey: ["middlemen"],
        queryFn: fetchMiddlemen ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
    });
}

 
// Hook for users
export function useUsersQuery() {
    return useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
    });
}


// Hook for customers
export function useCustomersQuery() {
    return useQuery({
        queryKey: ["customers"],
        queryFn: fetchCustomers ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
    });
}

// Hook for orders
export function useOrdersQuery() {
    return useQuery({
        queryKey: ["orders"],
        queryFn: fetchOrders ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
        refetchInterval : 7000
    });
}


// Hook for cuisines
export function useCuisinesQuery() {
    return useQuery({
        queryKey: ["cuisines"],
        queryFn: fetchCuisines ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
    });
}




// Hook for campaigns
export function useCampaignsQuery() {
    return useQuery({
        queryKey: ["campaigns"],
        queryFn: fetchCampaigns ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
    });
}

// Hook for pending hivecreators
export function usePendingCreatorsQuery() {
    return useQuery({
        queryKey: ["pendingCreators"],
        queryFn: fetchPendingCreators ,
        refetchOnWindowFocus : false ,
        refetchOnMount : false ,
    });
}


// Hook for pending hivecreators
export function useVerifiedCreatorsQuery() {
    return useQuery({
        queryKey: ["verifiedCreators"],
        queryFn: fetchVerifiedCreators ,
        refetchOnWindowFocus : false ,
        refetchOnMount : true ,
    });
}


// Hook for featured stores
export function useFeaturedStoresQuery() {
    return useQuery({
        queryKey: ["featuredStores"],
        queryFn: fetchFeaturedStores ,
        refetchOnWindowFocus : false ,
        refetchOnMount : true ,

    });
}


// Hook for food playlist
export function useFoodPlaylistQuery() {
    return useQuery({
        queryKey: ["foodPlaylist"],
        queryFn: fetchFoodPlaylist ,
        refetchOnWindowFocus : false ,
        refetchOnMount : true ,
    });
}


// Hook for videos
export function useVideosQuery() {
    return useQuery({
        queryKey: ["videos"],
        queryFn: fetchVideos ,
        refetchOnWindowFocus : false ,
        refetchOnMount : true ,
    });
}






