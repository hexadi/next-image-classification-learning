import { MongoClient, Db, ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

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

async function handler(
  req: NextRequest,
  { params }: { params: { id: string } },
  res: NextResponse
) {
    if (req.method === 'GET') {
    try {
      const db = await connectToDatabase()
      const collection = db.collection('projects')
      const documents = await collection.find({_id: new ObjectId(params.id)}).toArray()
      return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching documents', error }, { status: 500 })
    }
  } else if (req.method === 'POST') {
    try {
      const db = await connectToDatabase()
      const collection = db.collection('projects')

      const newDocument = await req.json()
      const result = await collection.insertOne(newDocument)

      return NextResponse.json({ message: 'Document created', id: result.insertedId }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating document', error }, { status: 500 })
    }
  } else if (req.method === 'PATCH') {
    try {
      const db = await connectToDatabase()
      const collection = db.collection('projects')

      const newDocument = await req.json()
      const result = await collection.updateOne({_id: new ObjectId(params.id)}, {$set: newDocument})

      return NextResponse.json({ message: 'Document updated' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error updating document', error }, { status: 500 })
    }
  }
}

export { handler as GET, handler as POST, handler as PATCH }