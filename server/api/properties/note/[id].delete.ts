import { ObjectId } from 'mongodb'
import { connectToDatabase } from '~/utils/mongodb'
import type { Property } from '~/types/property'

export default defineEventHandler(async (event) => {
  try {
    // Get the property ID from the URL
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Property ID is required'
      })
    }

    // Get collection from query params
    const query = getQuery(event)
    const collection = query.collection as string

    // Connect to MongoDB
    const { db } = await connectToDatabase()
    const coll = db.collection<Property>(collection)

    // Try to convert the id to ObjectId
    let mongoId
    try {
      mongoId = new ObjectId(id)
    } catch (e) {
      console.log('ID is not a valid ObjectId, will query by id field')
    }

    const mongoQuery = mongoId ? { _id: mongoId } : { id }

    const result = await coll.updateOne(
      mongoQuery,
      { $set: { note: '', update_at: new Date().toISOString() } }
    )

    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Property not found'
      })
    }

    return {
      success: true,
      message: 'Note deleted successfully',
      propertyId: id,
      update_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error deleting property note:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to delete note: ${(error as Error).message}`
    })
  }
})