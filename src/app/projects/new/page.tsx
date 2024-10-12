'use client'
import { Kanit } from 'next/font/google'
import Link from "next/link";
import Image from 'next/image';
import noProjectIcon from '@/app/icons/no.svg'
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NewProjectsPage() {
    const { data: session } = useSession();
  const router = useRouter();
    function getFormData(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        console.log(Object.fromEntries(data.entries()));
        fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(data.entries())),
        }).then(res => res.json()).then(data => router.push("/projects"))
        e.currentTarget.reset();
    }
    useEffect(() => {
      document.title = "สร้างโปรเจค | แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง"
      if (session != undefined) {
      } else {
        router.push("/login")
      }
    })
    return <div className="text-white">
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
            <form onSubmit={getFormData} className="flex flex-col min-w-96 items-center bg-opacity-30 bg-slate-500 p-6">
                <p className="text-3xl mb-2">เพิ่มโปรเจค</p>
                    <p className="text-xl text-left w-full mb-2">ชื่อโปรเจค</p>
                    <input name="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2" type="text" />
                    <p className="text-xl text-left w-full mb-2">ประเภทโปรเจค</p>
                    <input name="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-3" type="text" value={"รูปภาพ"} disabled />
                    <input name="type" className="w-0 h-0" type="text" value={"รูปภาพ"} readOnly />
                    <button type="submit" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-5 w-full py-1.5 mb-2">เพิ่มโปรเจค</button>
            </form>
        </main>
        <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-between select-none text-xl">
            <Link href={"/projects"}>แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง</Link>
            <Link href={""}>ยินดีต้อนรับ {session?.user?.email}</Link>
        </nav>
    </div>;
}