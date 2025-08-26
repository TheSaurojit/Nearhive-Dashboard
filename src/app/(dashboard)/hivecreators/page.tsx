import HiveSelectionTable from '@/components/hivecreators/HiveSelectionTable'
import HiveTable from '@/components/hivecreators/HiveTable'
import React from 'react'

function HiveCreators() {
  return (
    <>
    <div className='font-main'>
    <HiveSelectionTable/>
    <div className='mt-5'>
    <HiveTable/>
    </div>
    </div>
    </>
  )
}

export default HiveCreators