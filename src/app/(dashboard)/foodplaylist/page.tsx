import AddPlaylist from '@/components/foodplaylist/AddPlaylist'
import FoodPlaylistTable from '@/components/foodplaylist/FoodPlaylistTable'
import React from 'react'

function FoodPlaylist() {
  return (
 <>
 <AddPlaylist/>
 <div>
<FoodPlaylistTable/>
</div>
 </>
  )
}

export default FoodPlaylist