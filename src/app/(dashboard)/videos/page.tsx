import React from 'react'
import VideoTable from '@/components/videos/videotable'
import AddVideo from '@/components/videos/addvideos'

function videos() {
  return (
    <>
    <h1 className="font-bold lg:text-4xl sm:text-sm mb-5">Videos</h1>
    <AddVideo/>
    <div className='mt-5'>
    <VideoTable/>
    </div>
    </>
  )
}

export default videos