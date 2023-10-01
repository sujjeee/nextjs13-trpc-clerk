
import Deatils from '@/components/Deatils';
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
    <main className="flex flex-col gap-8  items-center justify-between p-24">
      <div className='max-w-sm border flex items-center p-4 justify-between w-full'>
        <div className='font-bold text-2xl'>{user?.firstName}</div>
        <UserButton />
        <Deatils />
      </div>
      <ToDo session={user.id} />
    </main>
  )
}
