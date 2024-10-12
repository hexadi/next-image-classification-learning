'use client'
import { Kanit } from 'next/font/google'
import Link from "next/link";
import Image from 'next/image';
import noProjectIcon from '@/app/icons/no.svg'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

export default function NewProjectsPage() {
  const { data: session } = useSession();
  var [data, setData]: [any, any] = useState({})
  const router = useRouter();
  const params = useParams();
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
    document.title = "ข้อมูลที่จะใช้ในการเทรน | แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง"
    if (session != undefined) {
      fetch('/api/project/' + params.id)
        .then(res => res.json())
        .then(async res => {
            //setData(res[0])
            var classG = []
            for await (const className of res[0].classes) {
                const count = res[0].images.filter((i: any) => i.class_id == className).length
                classG.push({ name: className, count: count })
            }
            await setData({ classes: classG })
        })

    } else if (session === null) {
      router.push("/login")
    }
  }, [session])
  return <div className="text-white">
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
        <div className='min-w-20 min-h-20 bg-gray-600 bg-opacity-20 p-4'>
        <p className="text-3xl mb-2">ข้อมูลที่จะใช้ในการเทรน</p>
        {data.classes != undefined && data.classes.map((c: any, i: any) => (
            <p key={i} className='text-lg'>คลาส {c.name} มีรูปภาพทั้งหมด {c.count} รูป</p>
        ))}
        {data.classes != undefined && (data.classes.filter((c: any) => c.count > 4).length != data.classes.length || data.classes.length == 0) ? (
            <>
            <p className='text-xl text-red-200'>ตอนนี้ยังมีข้อมูลที่ไม่เพียงพอสำหรับใช้ในการเทรน สามารถกลับไปเพิ่มใหม่ได้</p>
            <button className='bg-slate-600 px-2 py-1 text-lg rounded-lg' onClick={() => router.push("/project/" + params.id + "/edit")}>กลับสู่โปรเจค</button>
            </>
        ) : (
            <>
            <p className='text-xl text-green-200'>ตอนนี้มีข้อมูลที่เพียงพอสำหรับใช้ในการเทรน</p>
            <button className='bg-slate-600 px-2 py-1 mr-2 text-lg rounded-lg' onClick={() => router.push("/project/" + params.id + "/jetson")}>เชื่อมกับ Jetson Nano</button>
            <button className='bg-slate-600 px-2 py-1 text-lg rounded-lg' onClick={() => router.push("/project/" + params.id + "/edit")}>กลับสู่โปรเจค</button>
            </>
        )}
        </div>
    </main>
    <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-between select-none text-xl">
      <Link href={"/projects"}>แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง</Link>
      <Link href={""}>ยินดีต้อนรับ {session?.user?.email}</Link>
    </nav>
  </div>;
}