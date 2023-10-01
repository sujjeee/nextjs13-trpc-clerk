
import Deatils from '@/components/Deatils';
import Profile from '@/components/Profile';
import ToDo from '@/components/ToDo';
import { db } from '@/db';
import { UserButton, currentUser } from '@clerk/nextjs';

import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await currentUser()

  if (!user || !user.id) redirect('/auth-callback?origin=/')

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  })

  if (!dbUser) redirect('/auth-callback?origin=/')

  return (
    <main className="flex flex-col gap-8  items-center justify-between sm:p-24 p-6 w-full">
      <div className='max-w-sm border-2 border-primary flex items-center p-4 justify-between w-full rounded-lg'>
        <Profile session={user} />
      </div>
      <ToDo />
    </main>
  )
}
