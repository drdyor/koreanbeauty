import { Loader } from 'lucide-react'
import dynamic from 'next/dynamic'
import React from 'react'

const Scene = dynamic(() => import("@/components/scene"), {
    ssr: false,
    loading: () => <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
})

export default function Test3D() {
  return (
    <main className='relative h-screen'>
        <Scene />
    </main>
  )
}
