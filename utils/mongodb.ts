import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const connectionString = process.env.MONGO_URI
  if (!connectionString) {
    throw new Error('MONGO_URI environment variable is not defined')
  }

  try {
    const client = new MongoClient(connectionString)
    await client.connect()
    
    const dbName = process.env.MONGO_DB_NAME
    const db = client.db(dbName)
    
    cachedClient = client
    cachedDb = db
    
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}