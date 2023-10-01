"use client"

import React from 'react'
import { trpc } from '@/app/_trpc/client';


interface DeatilsProps {

}

const Deatils: React.FC<DeatilsProps> = ({ }) => {

    const { data } = trpc.authCallback.useQuery()

    return (
        <>
            {data?.success}
        </>
    )
}

export default Deatils