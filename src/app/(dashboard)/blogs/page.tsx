import AddBlogs from '@/components/blogs/AddBlogs'
import BlogTable from '@/components/blogs/BlogTable'
import React from 'react'

function Blogs() {
  return (
    <>
    <h1 className="font-bold lg:text-4xl sm:text-sm ml-3">Blogs</h1>
    <div className='mt-3'>
    <AddBlogs/>
    </div>
    <BlogTable/>
    </>
  )
}

export default Blogs