"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useBlogsQuery } from "@/hooks/query/useBlogs"

type Blog = {
  id: string
  createdAt: Date
  thumbnail: string
  title: string
  description: string
}

const BlogTable = () => {
  const { data, isLoading, isError } = useBlogsQuery()

  const [dialogOpenId, setDialogOpenId] = useState<string | null>(null)

  const blogs: Blog[] = (data || []).map((blog: any) => ({
    id: blog.id || blog.blogId,
    createdAt: new Date(blog.createdAt.seconds * 1000),
    thumbnail: blog.thumbnail,
    title: blog.title,
    description: blog.description,
  }))

  const handleEdit = (blog: Blog) => {
    console.log("Edit blog", blog)
  }

  const handleDeleteConfirmed = (id: string) => {
    console.log("Confirmed delete blog with id:", id)
    setDialogOpenId(null)
    // Add deletion logic here (e.g. Firestore deleteBlog call)
  }

  const columns: ColumnDef<Blog>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => format(row.original.createdAt, "dd MMM yyyy"),
    },
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => (
        <Image
          src={row.original.thumbnail}
          alt="Thumbnail"
          width={60}
          height={60}
          className="rounded object-cover"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.original.description
        return desc.length > 60 ? desc.slice(0, 60) + "..." : desc
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const blog = row.original
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
              Edit
            </Button>

            <Dialog open={dialogOpenId === blog.id} onOpenChange={(open) => setDialogOpenId(open ? blog.id : null)}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDialogOpenId(blog.id)}
                >
                  Delete
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this blog? This action cannot be undone.
                </p>
                <DialogFooter className="mt-4">
                  <Button variant="ghost" onClick={() => setDialogOpenId(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteConfirmed(blog.id)}>
                    Yes, Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      },
    },
  ]

  if (isLoading) return <div className="p-4">Loading...</div>
  if (isError) return <div className="p-4 text-red-500">Failed to load blogs.</div>

  return (
    <div className="p-4">
      <DataTable columns={columns} data={blogs} />
    </div>
  )
}

export default BlogTable
