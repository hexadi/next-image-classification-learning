'use client'
import Link from "next/link";
import Image from 'next/image';
import noProjectIcon from '@/app/icons/no.svg'
import deleteIcon from '@/app/icons/delete.svg'
import editIcon from '@/app/icons/edit.svg'
import { ChangeEvent, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export default function ProjectPage() {
    var [show, setShow] = useState(false)
    var [classes, setClasses]: [any, any] = useState([])
    var [modelStatus, setModelStatus] = useState(false)
    const MOBILE_NET_INPUT_WIDTH = 224;
    const MOBILE_NET_INPUT_HEIGHT = 224;

    const [mobilenet, setMobilenet]: [any, any] = useState(null);
    const [model, setModel] = useState(null);

    /**
     * Loads the MobileNet model and warms it up so ready for use.
     **/
    async function loadMobileNetFeatureModel() {
        const URL =
            'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

        const model = await tf.loadGraphModel(URL, { fromTFHub: true });
        console.log('MobileNet v3 loaded successfully!');
        setMobilenet(model);
        setModelStatus(true)
    }

    // Call the function immediately to start loading.

    function handleImageUpload(event: ChangeEvent<HTMLInputElement>, i: any) {
        const files = event.target.files;
        if (files != null) {
            for (let file of (files as any)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    if (e.target != null) {
                        img.src = (e.target.result as string);
                        img.onload = () => {
                            let imageFeatures = tf.tidy(function () {
                                let imageAsTensor = tf.browser.fromPixels(img);
                                let resizedTensorFrame = tf.image.resizeBilinear(imageAsTensor, [MOBILE_NET_INPUT_HEIGHT,
                                    MOBILE_NET_INPUT_WIDTH], true);
                                let normalizedTensorFrame = resizedTensorFrame.div(255);
                                return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
                            });
                            setClasses(classes.map((c: { image: any; imageFeatures: string | any[]; }, index: any) => index == i ? { ...c, image: [...c.image, (e.target as any).result], imageFeatures: c.imageFeatures.concat(imageFeatures) } : c))
                        }
                    }
                }
                reader.readAsDataURL(file);
            }
        }
    }

    async function trainAndPredict() {
        var model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1024], units: 128, activation: 'relu' }));
        model.add(tf.layers.dense({ units: classes.length, activation: 'softmax' }));

        model.summary();

        // Compile the model with the defined optimizer and specify a loss function to use.
        model.compile({
            // Adam changes the learning rate over time which is useful.
            optimizer: 'adam',
            // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
            // Else categoricalCrossentropy is used if more than 2 classes.
            loss: (classes.length === 2) ? 'binaryCrossentropy' : 'categoricalCrossentropy',
            // As this is a classification problem you can record accuracy in the logs too!
            metrics: ['accuracy']
        });
        var trainingDataInputs: any[] = [];
        var trainingDataOutputs: any[] = [];
        classes.forEach((c: { imageFeatures: any[]; }, i: any) => {
            c.imageFeatures.forEach((f: any) => {
                trainingDataInputs.push(f);
                trainingDataOutputs.push(i)
            })
            // trainingDataInputs = trainingDataInputs.concat(c.imageFeatures);
            // console.log(trainingDataInputs)
            // trainingDataOutputs = trainingDataOutputs.concat(Array(c.imageFeatures.length).fill(i));
        })
        console.log(trainingDataInputs, trainingDataOutputs)
        tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
        let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
        let oneHotOutputs = tf.oneHot(outputsAsTensor, classes.length);
        let inputsAsTensor = tf.stack(trainingDataInputs);

        let results = await model.fit(inputsAsTensor, oneHotOutputs, {
            shuffle: true, batchSize: 5, epochs: 10,
            callbacks: { onEpochEnd: (epoch, logs) => console.log('Data for epoch ' + epoch, logs) }
        });

        outputsAsTensor.dispose();
        oneHotOutputs.dispose();
        inputsAsTensor.dispose();
        console.log(results)
        setModel((model as any));
    }

    function getFormData(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const dataObj = Object.fromEntries(data.entries())
        console.log(dataObj);
        // add Class to classes array
        setClasses([...classes, { name: dataObj["name"], image: [], imageFeatures: [] }])
        e.currentTarget.reset();
        setShow(!show)
    }
    useEffect(() => {
        loadMobileNetFeatureModel();
    }, [])
    return <div className="text-white">
        <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-gradient-to-r from-cyan-500 to-blue-500 select-none">
            <div className='w-full flex justify-between'>
                <p className='text-3xl'>ชื่อโปรเจค</p>
                <button onClick={() => setShow(!show)} className='text-xl text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-1.5 py-1 mb-2'>เพิ่มคลาส</button>
            </div>
            {classes.length == 0 ? <div className='w-full h-full flex flex-col justify-center items-center'>
                <Image src={noProjectIcon} alt="logo" width={100} height={100} className='mb-4'></Image>
                <p className='text-2xl'>โปรเจคนี้ยังไม่มีคลาส</p>
                <p className='text-xl'>สามารถสร้างคลาสได้โดยการกดปุ่ม “เพิ่มคลาส”</p>
            </div> : <div className="w-full h-full">
                <div className={'grid gap-4 ' + (classes.length == 1 ? 'grid-cols-1' : classes.length == 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                    {classes.map((c: { name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; image: any[]; }, i: Key | null | undefined) => <div key={i} className='border-2 min-h-96 h-full border-gray-300 p-2 rounded-lg flex justify-between flex-col'>
                        <div className='flex justify-between'>
                            <p className='text-2xl'>{c.name}</p>
                            <div className='flex '>
                                <Image src={editIcon} alt="logo" width={32} height={32} className='p-1 select-none'></Image>
                                <Image src={deleteIcon} alt="logo" width={32} height={32} className='p-1 select-none' onClick={() => setClasses(classes.filter((_: any, index: any) => index != i))}></Image>
                            </div>
                        </div>
                        <div>
                            {c.image.map((img, ind) => <Image src={img} alt="logo" width={100} height={100} className='img m-1' key={"img" + ind}></Image>)}
                        </div>
                        <div>
                            <button onClick={() => (document.querySelector("#file_" + i) as HTMLInputElement).click()} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 py-1.5 mb-2" disabled={modelStatus == false}>เพิ่มรูป</button>
                            <input type="file" accept="image/*" id={"file_" + i} className="hidden" /* onChange={(e) => setClasses(classes.map((c, index) => index == i ? { ...c, image: [...c.image, e.target.files[0]] } : c))} */ onChange={(event) => handleImageUpload(event, i)} />
                        </div>
                    </div>)}
                </div>
                <button onClick={() => trainAndPredict()} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 w-[49%] py-1.5 my-2 mr-[1%]">เทรนข้อมูล</button>
                <button onClick={() => model != null && (model as any).save('downloads://my-model')} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 w-[49%] py-1.5 my-2 ml-[1%]">ดาวน์โหลดโมเดล</button>
            </div>}
        </main>
        <nav className="absolute flex top-0 p-4 bg-opacity-10 bg-slate-500 w-full justify-between select-none text-xl">
            <Link href={"/projects"}>แพลตฟอร์มสำหรับการใช้การเรียนรู้ของเครื่อง</Link>
            <Link href={""}>ยินดีต้อนรับ email@example.com</Link>
        </nav>
        <div className={(show ? '' : 'hidden ') + 'fixed top-0 left-0 w-full h-screen flex justify-center items-center z-10 bg-black bg-opacity-50 select-none'}>
            <form onSubmit={getFormData} className='min-w-96 min-h-40 bg-white rounded-lg text-black p-5'>
                <div className='flex justify-between'>
                    <p className="text-3xl mb-2">เพิ่มคลาส</p>
                    <button onClick={(e) => { e.preventDefault(); setShow(!show) }} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-2.5 py-1.5 mb-2">X</button>
                </div>
                <p className="text-xl text-left w-full mb-2">ชื่อคลาส</p>
                <input name="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2" type="text" />
                <button type="submit" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-lg px-5 w-full py-1.5 mb-2">เพิ่มคลาส</button>
            </form>
        </div>
    </div>;
}