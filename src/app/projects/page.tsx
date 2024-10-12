'use client'
import { Kanit } from 'next/font/google'
import Link from "next/link";
import Image from 'next/image';
import noProjectIcon from '@/app/icons/no.svg'
import deleteIcon from '@/app/icons/delete.svg'
import editIcon from '@/app/icons/edit.svg'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  function getFormData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(Object.fromEntries(data.entries()));
    e.currentTarget.reset();
  }
  useEffect(() => {
    document.title = "โปรเจคของคุณ | แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง"
    if (session != undefined) {
      fetch('/api/projects').then(res => res.json()).then(data => { setProjects(data); setLoading(false) })
    } else {
      router.push("/login")
    }
  }, [])

  function deleteProject(_id: any): void {
    throw new Error('Function not implemented.');
  }

  return <div className="text-white">
    <main className="flex min-h-screen h-screen flex-col items-center justify-start p-24 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
      <div className='w-full flex justify-between text-3xl'>
        <p>โปรเจคของคุณ</p>
        <Link href={"/projects/new"}><button className='text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-3 mb-2'>+</button></Link>
      </div>
      {
        loading ? <div role="status" className='flex h-full items-center justify-center'>
          <svg aria-hidden="true" className="inline w-32 h-32 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div> : projects.length == 0 ?
          <div className='h-full flex flex-col justify-center items-center'>
            <Image src={noProjectIcon} alt="logo" width={100} height={100} className='mb-4'></Image>
            <p className='text-2xl'>คุณยังไม่มีโปรเจค</p>
            <p className='text-xl'>สามารถสร้างโปรเจคได้โดยการกดปุ่ม +</p>
          </div> : <div className='grid w-full grid-cols-4 gap-3'>{projects.map((project: any) => // make this as a card
            <Link href={`/project/${project._id}/edit`} key={project._id}>
              <div className='block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>
                <div className='flex justify-end'>
                  <Link href={`/project/${project._id}/settings`}><Image src={editIcon} alt="logo" width={32} height={32} className='p-1 select-none'></Image></Link>
                  <Link href=""><Image src={deleteIcon} alt="logo" width={32} height={32} className='p-1 select-none' onClick={() => deleteProject(project._id)}></Image></Link>
                </div>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{project.name}</h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">{project.type}</p>
              </div>
            </Link>)}
          </div>
      }
    </main>
    <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-between select-none text-xl">
      <Link href={"/"}>การเรียนรู้ด้วยเครื่อง</Link>
      {session != undefined && <div>
        <span className="pr-2 hidden md:inline">
          ยินดีต้อนรับ {session?.user?.email}
        </span>
        <span onClick={() => { signOut(); router.push("/login") }}>
          ออกจากระบบ
        </span>
      </div>
      }
    </nav>
  </div>;
}