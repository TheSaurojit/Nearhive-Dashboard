import { FirestoreService } from "@/firebase/firestoreService";
import { Blog } from "@/types/backend/models";
import { Timestamp } from "firebase/firestore";

// Fetch all blogs 
export async function fetchBlogs() : Promise<Blog[]> {

  const blogs = await FirestoreService.getAllDocs("Blogs") as Blog[];

  return blogs;
}

// create blog
export async function createBlog({title,description,thumbnail,content}: { title: string, description: string,thumbnail: File , content: string })
 : Promise<Blog> {

  const docId = FirestoreService.docId();

  try {
    const blog: Blog = {
      blogId: docId,
      title,
      description,
      content,
      thumbnail: await FirestoreService.uploadFile(thumbnail, "Blogs"),
      createdAt: Timestamp.now(),
    };

    await FirestoreService.setDoc("Blogs", docId, blog);

    return blog
  } catch (error) {
    console.error("Error creating blog:", error);
    throw new Error("Error in creating blog")

  }

}

// delete blog
export async function deleteBlog(id: string): Promise<string> {
  await FirestoreService.deleteDoc("Blogs", id);
  return id

}