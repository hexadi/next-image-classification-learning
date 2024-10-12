'use client'
import Link from "next/link";
import Image from 'next/image';
import noProjectIcon from '@/app/icons/no.svg'
import deleteIcon from '@/app/icons/delete.svg'
import editIcon from '@/app/icons/edit.svg'
import { ChangeEvent, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
//import * as tf from '@tensorflow/tfjs';
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProjectPage() {
    const params = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    var [data, setData]: [any, any] = useState({})
    var [loading, setLoading] = useState(true)
    var [show, setShow] = useState(false)
    var [modalType, setModalType] = useState(1)
    var [classes, setClasses]: [any, any] = useState([])
    // var [modelStatus, setModelStatus] = useState(false)
    // const MOBILE_NET_INPUT_WIDTH = 224;
    // const MOBILE_NET_INPUT_HEIGHT = 224;

    // const [mobilenet, setMobilenet]: [any, any] = useState(null);
    // const [model, setModel] = useState(null);

    /**
     * Loads the MobileNet model and warms it up so ready for use.
     **/
    // async function loadMobileNetFeatureModel() {
    //     const URL =
    //         'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

    //     const model = await tf.loadGraphModel(URL, { fromTFHub: true });
    //     console.log('MobileNet v3 loaded successfully!');
    //     setMobilenet(model);
    //     setModelStatus(true)
    // }

    // Call the function immediately to start loading.

    async function readImage(image: any) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    // Resolve the promise with the response value
                    resolve(reader.result as string);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(image);
        });
    }
    async function readAllImage(files: any) {
        var images: any[] = []
        for await (let file of files) {
            const image = await readImage(file)
            images.push(image)
        }
        return images
    }

    function handleImageUpload(event: any, i: any) {
        const files = event.target.files;
        if (files != null) {
            // upload files by fetch
            const formData = new FormData();
            for (let file of (files as any)) {
                formData.append('file', file);
            }
            fetch('/api/project/' + params.id + '/image/' + classes[i].name, {
                method: 'POST',
                body: formData
            })
            readAllImage(files).then((image) => setClasses(classes.map((c: { image: any; }, index: any) => index == i ? { ...c, image: c.image.concat(image) } : c)))
        }
    }

    // async function trainAndPredict() {
    //     var model = tf.sequential();
    //     model.add(tf.layers.dense({ inputShape: [1024], units: 128, activation: 'relu' }));
    //     model.add(tf.layers.dense({ units: classes.length, activation: 'softmax' }));

    //     model.summary();

    //     // Compile the model with the defined optimizer and specify a loss function to use.
    //     model.compile({
    //         // Adam changes the learning rate over time which is useful.
    //         optimizer: 'adam',
    //         // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
    //         // Else categoricalCrossentropy is used if more than 2 classes.
    //         loss: (classes.length === 2) ? 'binaryCrossentropy' : 'categoricalCrossentropy',
    //         // As this is a classification problem you can record accuracy in the logs too!
    //         metrics: ['accuracy']
    //     });
    //     var trainingDataInputs: any[] = [];
    //     var trainingDataOutputs: any[] = [];
    //     classes.forEach((c: { imageFeatures: any[]; }, i: any) => {
    //         c.imageFeatures.forEach((f: any) => {
    //             trainingDataInputs.push(f);
    //             trainingDataOutputs.push(i)
    //         })
    //         // trainingDataInputs = trainingDataInputs.concat(c.imageFeatures);
    //         // console.log(trainingDataInputs)
    //         // trainingDataOutputs = trainingDataOutputs.concat(Array(c.imageFeatures.length).fill(i));
    //     })
    //     console.log(trainingDataInputs, trainingDataOutputs)
    //     tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    //     let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
    //     let oneHotOutputs = tf.oneHot(outputsAsTensor, classes.length);
    //     let inputsAsTensor = tf.stack(trainingDataInputs);

    //     let results = await model.fit(inputsAsTensor, oneHotOutputs, {
    //         shuffle: true, batchSize: 5, epochs: 10,
    //         callbacks: { onEpochEnd: (epoch, logs) => console.log('Data for epoch ' + epoch, logs) }
    //     });

    //     outputsAsTensor.dispose();
    //     oneHotOutputs.dispose();
    //     inputsAsTensor.dispose();
    //     console.log(results)
    //     setModel((model as any));
    //     return model
    // }
    function getType(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        var dataX = new FormData(e.currentTarget);
        // trainAndPredict().then((gModel) => {
        //     if (dataX.get("type") == "1") {
        //         (gModel as any).save('http://localhost:3000/api/file/' + dataX.get("pin"))
        //     } else {
        //         (gModel as any).save('downloads://' + data.name)
        //     }
        //     setShow(!show)
        // })


    }
    function getFormData(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const dataObj = Object.fromEntries(data.entries())
        console.log(dataObj);
        // add Class to classes array
        setClasses([...classes, { name: dataObj["name"], image: [], imageFeatures: [] }])
        fetch('/api/project/' + params.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classes: [...classes.map((c: any) => (c.name)), dataObj["name"]] })
        })
        e.currentTarget.reset();
        setShow(!show)
    }

    function deleteClass(i: any) {
        setClasses(classes.filter((c: any, index: any) => index != i))
        fetch('/api/project/' + params.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classes: classes.filter((c: any, index: any) => index != i).map((c: any) => c.name) })
        })
    }

    useEffect(() => {
        document.title = "โปรเจค | แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง"
        if (session !== undefined) {
            fetch('/api/project/' + params.id)
                .then(res => res.json())
                .then(async data => {
                    const res = data[0]
                    var classes = res.classes.map((c: any) => ({ name: c, image: [] }))
                    for await (let file of res.images) {
                        const classIndex = res.classes.indexOf(file.class_id)
                        if (classIndex != -1) classes[classIndex].image.push("/uploads/" + params.id + "/" + file.class_id + "/" + file.name)
                    }
                    await setData(res);
                    document.title = res.name + " | แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง";
                    await setClasses(classes);
                    setLoading(false)
                })
        } else if (session === null) {
            router.push("/login")
        }
        // loadMobileNetFeatureModel();
    }, [session])
    return <div className="text-white">
        <main className="flex min-h-screen flex-col items-center justify-start px-4 py-24 md:px-24 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
            {loading ? <div role="status" className='flex h-full items-center justify-center'>
                <svg aria-hidden="true" className="inline w-32 h-32 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="sr-only">Loading...</span>
            </div> : <><div className='w-full flex justify-between'>
                <p className='text-3xl'>{data.name}</p>
                <div>
                    <button onClick={() => { setShow(!show); setModalType(1) }} className='text-xl text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-1.5 py-1 mb-2 mr-2'>เพิ่มคลาส</button>
                    <button onClick={() => router.push("/projects")} className='text-xl text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-1.5 py-1 mb-2'>กลับ</button>
                </div>
            </div>
                {classes.length == 0 ? <div className='w-full h-full flex flex-col justify-center items-center'>
                    <Image src={noProjectIcon} alt="logo" width={100} height={100} className='mb-4'></Image>
                    <p className='text-2xl'>โปรเจคนี้ยังไม่มีคลาส</p>
                    <p className='text-xl'>สามารถสร้างคลาสได้โดยการกดปุ่ม “เพิ่มคลาส”</p>
                </div> : <div className="w-full h-full">
                    <div className={'grid gap-4 ' + (classes.length == 1 ? 'grid-cols-1' : classes.length == 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3')}>
                        {classes.map((c: { name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; image: any[]; }, i: Key | null | undefined) => <div key={i} className='border-2 min-h-96 h-full border-gray-300 p-2 rounded-lg flex justify-between flex-col'>
                            <div className='flex justify-between'>
                                <p className='text-2xl'>{c.name}</p>
                                <div className='flex '>
                                    <Image src={editIcon} alt="logo" width={32} height={32} className='p-1 select-none'></Image>
                                    <Image src={deleteIcon} alt="logo" width={32} height={32} className='p-1 select-none' onClick={() => deleteClass(i)}></Image>
                                </div>
                            </div>
                            <div>
                                {c.image.map((img, ind) => <Image src={img} alt="logo" width={100} height={100} className='img m-1' key={"img" + ind}></Image>)}
                            </div>
                            <div>
                                <button onClick={() => (document.querySelector("#file_" + i) as HTMLInputElement).click()} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 py-1.5 mb-2">เพิ่มรูป</button>
                                <input type="file" accept="image/*" id={"file_" + i} className="hidden" /* onChange={(e) => setClasses(classes.map((c, index) => index == i ? { ...c, image: [...c.image, e.target.files[0]] } : c))} */ onChange={(event) => handleImageUpload(event, i)} multiple />
                            </div>
                        </div>)}
                    </div>
                    <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 w-[100%] py-1.5 my-2" onClick={() => {router.push("/project/" + params.id + "/check")}}>เซฟโมเดล</button>
                </div>}
            </>}
        </main>
        <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-between select-none text-xl">
            <Link href={"/"}>การเรียนรู้ด้วยเครื่อง</Link>
            <div><Link href={""} className="pr-2 hidden md:inline">ยินดีต้อนรับ {session?.user?.email}</Link>
                <Link href={""}>ออกจากระบบ</Link></div>
        </nav>
        <div className={(show ? '' : 'hidden ') + 'fixed top-0 left-0 w-full h-screen flex justify-center items-center z-10 bg-black bg-opacity-50 select-none'}>
            {modalType == 1 ? <form onSubmit={getFormData} className='min-w-96 min-h-40 bg-white rounded-lg text-black p-5'>
                <div className='flex justify-between'>
                    <p className="text-3xl mb-2">เพิ่มคลาส</p>
                    <button onClick={(e) => { e.preventDefault(); setShow(!show) }} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 py-1.5 mb-2">X</button>
                </div>
                <p className="text-xl text-left w-full mb-2">ชื่อคลาส</p>
                <input name="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2" type="text" />
                <button type="submit" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-5 w-full py-1.5 mb-2">เพิ่มคลาส</button>
            </form> : <form onSubmit={getType} className='min-w-96 min-h-40 bg-white rounded-lg text-black p-5'>
                <div className='flex justify-between'>
                    <p className="text-3xl mb-2">เลือกประเภท</p>
                    <button onClick={(e) => { e.preventDefault(); setShow(!show) }} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 py-1.5 mb-2">X</button>
                </div>
                <p className="text-xl text-left w-full mb-2">ประเภท</p>
                <select name="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2">
                    <option value="1">ส่งไปยัง Jetson Nano</option>
                    <option value="2">ดาวน์โหลดโมเดล</option>
                </select>
                <p className="text-xl text-left w-full mb-2">PIN (Jetson Nano)</p>
                <input type="text" name="pin" id="pin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2" />
                <button type="submit" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-5 w-full py-1.5 mb-2">เลือก</button>
            </form>}
        </div>
    </div>;
}