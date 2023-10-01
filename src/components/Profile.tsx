import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { User } from '@clerk/nextjs/server'
import { useClerk } from '@clerk/nextjs'

interface ProfileProps {
    session: User
}

const Profile: React.FC<ProfileProps> = ({ session }) => {
    const { signOut } = useClerk();
    return (
        <div className='flex justify-between items-center w-full '>
            <Avatar className='rounded-lg'>
                <AvatarImage src={session.imageUrl} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Button onClick={() => signOut()}>Logout</Button>
        </div>
    )
}

export default Profile