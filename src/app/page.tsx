"use client"
import { Kanit } from 'next/font/google'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from 'react';
const kanitBold = Kanit({ weight: '500', subsets: ['latin'] });

export default function MainPage() {
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    console.log(session)
  }, [session]);
  return <div className="text-white">
    <main className="px-24 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
      <div className='flex min-h-[85vh] items-center justify-between '>
        <div className="flex flex-col">
          <p className="text-3xl">ยินดีต้อนรับเข้าสู่</p>
          <h1 className={"text-6xl " + kanitBold.className}>แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง</h1>
        </div>
        <div className="flex flex-col items-center">
          <iframe src="https://www.youtube.com/embed/EjbHXMzeX4c?si=VwvEeDe7wLBK9O-x" className="w-[40vw] aspect-video" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
      </div>
      <div>
        <p className=" text-8xl pb-8">บทความ</p>
        <div className='grid grid-cols-3 gap-4'>
          <div className='block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">บทความ</h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">Lorem Ipsum</p>
          </div>
          <div className='block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">บทความ</h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">Lorem Ipsum</p>
          </div>
          <div className='block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">บทความ</h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">Lorem Ipsum</p>
          </div>
        </div>
      </div>
    </main>

    <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-end select-none text-xl">
      {session != undefined ? <><Link href={"/projects"} className='mr-2'>โปรเจคของคุณ</Link><Link href={""}>ออกจากระบบ</Link></> : <Link href={"/login"}>ลงชื่อเข้าใช้</Link>}
    </nav>
  </div>;
}