"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import ProductTable from '@/components/products/producttable'
import AddProducts from '@/components/products/addproducts'

 

function Products() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <>
    <div className='font-main'>
      <h1 className="font-bold lg:text-4xl sm:text-sm mb-5">Products (Food)</h1>
      <AddProducts/>
      <div className='mt-5'>
        <ProductTable />
      </div>
      </div>
    </>
  )
}

export default Products
