'use client'
import { Kanit } from 'next/font/google'
import Link from "next/link";
import Image from 'next/image';
import noProjectIcon from '@/app/icons/no.svg'
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/app/socket';

export default function NewProjectsPage() {
  const { data: session } = useSession();
  const [isJoin, setJoin] = useState(false);
  var [data, setData]: [any, any] = useState({})
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isJetsonConnected, setIsJetsonConnected] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const router = useRouter();
  const params = useParams();

  function joinJetson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const pin = data.get('pin')
    setData((prev: any) => ({ ...prev, pin: pin }))
    if (pin == "") return
    socket.emit('subscribe_to_logs', pin)
  }
  function onConnect() {
    setIsSocketConnected(true);

    socket.on('subscription_success', (data: { pin: any; }) => {
        setIsJetsonConnected(true);
        console.log(`Successfully subscribed to logs for PIN: ${data.pin}`)
    })

    socket.on('start_camera_sent', (data: { pin: any; }) => {
      setIsStarted(true);
      console.log(`Start signal sent to PIN: ${data.pin}`)
    })

    socket.on('video_frame', (recv_data: { pin: any; frame: any; }) => {
        if (recv_data.pin == data.pin) {
          imgRef.current!.src = `data:image/jpeg;base64,${recv_data.frame}`
        }
    })

    socket.on('start_camera_failed', (data: { error: any; }) => {
      console.log(`Failed to send start signal: ${data.error}`)
    })
  }

  function startCamera() {
    socket.emit('send_start_camera', data.pin)
  }

  function onDisconnect() {
    setIsSocketConnected(false);
  }
  useEffect(() => {
    document.title = "Camera | แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง"
    if (session != undefined && !isJoin) {
      setJoin(true)
      fetch('/api/project/' + params.id)
        .then(res => res.json())
        .then(async res => {
            //setData(res[0])
            var classG = []
            for await (const className of res[0].classes) {
                const list = res[0].images.filter((i: any) => i.class_id == className).map((i: any) => "/uploads/" + params.id + "/" + i.class_id + "/" + i.name)
                classG.push({ name: className, list: list })
            }
            await setData({ name: res[0].name, classes: classG })
        })
        if (socket.connected) {
            onConnect();
          }
      
          socket.on("connect", onConnect);
          socket.on("disconnect", onDisconnect);
      
          return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
          };

    } else if (session === null) {
      router.push("/login")
    }
  }, [session])
  return <div className="text-white">
    <main className="flex min-h-screen h-screen flex-col p-16 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
        <div className='flex justify-between'>
          <div className='flex'>
            <form onSubmit={joinJetson}>
            <input type="number" name='pin' minLength={6} min={100000} max={999999} maxLength={6} className='min-w-24 py-1 pl-2 rounded-s-lg text-black' placeholder='Jetson Pin' disabled={!isSocketConnected || isJetsonConnected} />
            <button type="submit" className='bg-white text-black pr-2 rounded-e-lg py-1' disabled={!isSocketConnected || isJetsonConnected}>Join</button></form>
            <button onClick={() => startCamera()} className='bg-green-600 ml-2 px-2 rounded-lg py-1' disabled={!isJetsonConnected || isStarted}>Start</button>
            <span className='flex items-center ml-2'>Socket Status : {isSocketConnected ? "Connected" : "Disconnected"} <div className={'rounded-full ml-1 w-4 h-4 ' + (isSocketConnected ? 'bg-green-500' : 'bg-red-600')}></div></span>
            <span className='flex items-center ml-2'>Jetson Status : {isJetsonConnected ? "Connected" : "Disconnected"} <div className={'rounded-full ml-1 w-4 h-4 ' + (isJetsonConnected ? 'bg-green-500' : 'bg-red-600')}></div></span>
          </div>
          <div className='flex'>
            <button className='bg-slate-600 ml-2 px-2 rounded-lg py-1' onClick={() => router.back()}>กลับ</button>
          </div>
        </div>
        <div className='flex flex-col h-full mt-2 w-full bg-white text-black rounded-lg'>
            <img ref={imgRef} />
        </div>
    </main>
    <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-between select-none text-xl">
      <Link href={"/projects"}>แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง</Link>
      <Link href={""}>ยินดีต้อนรับ {session?.user?.email}</Link>
    </nav>
  </div>;
}