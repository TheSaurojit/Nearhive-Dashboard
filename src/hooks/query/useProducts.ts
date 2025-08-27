// hooks/useStores.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlog, fetchBlogs } from "@/services/blogs";
import { Blog, Product } from "@/types/backend/models";
import { createProduct, fetchProducts, ProductUpdate, updateProduct } from "@/services/products";

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
    const createProductMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: (newProduct) => {

            queryClient.setQueryData(["products"], (old: Product[]) => {
                return old ? [...old, newProduct] : [newProduct];
            });
        },
    });

    // Update product mutation
    const updateProductMutation = useMutation({
        mutationFn: ({ product, update }: { product: Product; update: ProductUpdate }) => updateProduct(product, update),
        onSuccess: (updatedProduct) => {
            queryClient.setQueryData(["products"], (old: Product[]) => {

             return   old ? old.map((p: Product) => p.productId === updatedProduct.productId ? updatedProduct : p )
                    : [updatedProduct]
            });
        },
    });


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
        createProductMutation,
        updateProductMutation 
    };
}
