import React from 'react'
import GrowthChart from '@/components/customers/GrowthChart'

function Customers() {
  return (
   <div className='font-main'>
    <h1 className='font-bold lg:text-4xl sm:text-sm'>Customer Table</h1>
    <div className='mt-5'>
    <GrowthChart/>
    

    </div>

   </div>
  )
}

export default Customers