import { MongoClient, Db, ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises';
import path from 'path';

// Replace with your MongoDB connection string
const uri = process.env.MONGODB_URI!

let cachedDb: Db | null = null

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  const client = await MongoClient.connect(uri)
  const db = client.db()
  cachedDb = db
  return db
}

export async function POST(request: NextRequest, { params }: { params: { id: string; class_id: string } }, response: NextResponse) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('file') as File[];
        const db = await connectToDatabase()
        const collection = db.collection('projects')
        const documents = await collection.find({_id: new ObjectId(params.id)}).toArray()
        const imagesArray = documents[0].images || []

        if (!files) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        var fileArray = []

        for await (const file of files) {
            // Convert the file to a Buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create the directory path
            const dirPath = path.join(process.cwd(), 'uploads', params.id, params.class_id);

            // Ensure the directory exists
            await createDirectoryIfNotExists(dirPath);

            // Create a unique filename
            const uniqueFilename = `${Date.now()}-${file.name}`;
            const filePath = path.join(dirPath, uniqueFilename);

            // Write the file
            await writeFile(filePath, buffer);
            fileArray.push({"name": uniqueFilename, class_id: params.class_id, "path": filePath})
        }

        const result = await collection.updateOne({_id: new ObjectId(params.id)}, {$set: {images: imagesArray.concat(fileArray)}})

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
}

async function createDirectoryIfNotExists(dirPath: string) {
    const fs = require('fs').promises;
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}