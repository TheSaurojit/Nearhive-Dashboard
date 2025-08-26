import AddCuisine from '@/components/cuisine/addCuisine'
import CuisineTable from '@/components/cuisine/CuisineTable'
import React from 'react'

function Cuisine() {
  return (
   <>
   <div className='font-main'>
    <h1 className="font-bold lg:text-4xl sm:text-sm mb-5">Cuisine</h1>
   <AddCuisine/>
    <div className='mt-5'>
        <CuisineTable/>
    </div>
    </div>
   </>
  )
}

export default Cuisine