// hooks/useStores.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlog, fetchBlogs } from "@/services/blogs";
import { Blog } from "@/types/backend/models";

export function useBlogsQuery() {
  const queryClient = useQueryClient();

  // ✅ Fetch all blogs
  const blogsQuery = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // refetchInterval: 5000
  });

  // ✅ Create blog  mutation
  const createMutation = useMutation({
    mutationFn: createBlog,
    onError: (error) => {
      console.log(error , "onError");
    },
    onSuccess: (newBlog) => {

      queryClient.setQueryData(["blogs"], (old: Blog[]) => {
        return old ? [...old, newBlog] : [newBlog];
      });
    },
  });

  // ✅ Delete blog mutation
  //   const deleteMutation = useMutation({
  //     mutationFn: deleteStore,
  //     onSuccess: (deletedId) => {
  //       queryClient.setQueryData(["stores"], (old: any) =>
  //         old ? old.filter((store: any) => store.id !== deletedId) : []
  //       );
  //     },
  //   });

  return {
    ...blogsQuery,
    createMutation,
    // deleteMutation,
  };
}
