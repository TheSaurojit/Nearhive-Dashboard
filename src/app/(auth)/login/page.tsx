import { LoginForm } from '@/components/login-form'
import Image from 'next/image'
import React from 'react'

function Login() {
  return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 font-main">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
        <Image src="./Frame 625231.svg" alt="logo" width={30} height={30}/>
         NearHive Ecom.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}

export default Login