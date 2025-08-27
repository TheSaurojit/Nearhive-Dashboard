// hooks/useStores.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlog, fetchBlogs } from "@/services/blogs";
import { Blog, Product } from "@/types/backend/models";
import { createProduct, fetchProducts, updateProduct } from "@/services/products";

export function useProductsQuery() {
    const queryClient = useQueryClient();


    const productsQuery = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        // refetchInterval : 5000
    });

    // ✅ Create product  mutation
    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: (newProduct) => {

            queryClient.setQueryData(["products"], (old: Product[]) => {
                return old ? [...old, newProduct] : [newProduct];
            });
        },
    });

    // Update product mutation
    // const updateMutation = useMutation({
    //     mutationFn: ({ product, update }: { product: Product; update : any }) => updateProduct(product, ...update),
    //     onSuccess: (newProduct) => {
    //         queryClient.setQueryData(["products"], (old: Product[]) => {

    //             console.log("update",old);
                
    //             return old ? [...old, newProduct] : [newProduct];
    //         });
    //     },
    // });


    // ✅ Delete product mutation
    //   const deleteMutation = useMutation({
    //     mutationFn: deleteStore,
    //     onSuccess: (deletedId) => {
    //       queryClient.setQueryData(["stores"], (old: any) =>
    //         old ? old.filter((store: any) => store.id !== deletedId) : []
    //       );
    //     },
    //   });

    return {
        ...productsQuery,
        createMutation,
        // updateMutation
    };
}
