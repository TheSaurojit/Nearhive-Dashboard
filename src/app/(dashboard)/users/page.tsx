import UserTable from '@/components/users/userTable'
import React from 'react'

function User() {
  return (
    <>
    <div className='font-main'>
    <h1 className='font-bold lg:text-4xl sm:text-sm'>Users Table</h1>
    <div className='mt-5'></div>
    <UserTable/>
    </div>
    </>
  )
}

export default User