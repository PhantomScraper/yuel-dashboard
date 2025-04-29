import { ObjectId } from 'mongodb'
import { connectToDatabase } from '~/utils/mongodb'
import type { Property } from '~/types/property'

export default defineEventHandler(async (event) => {
    try {
        // Get the request body
        const body = await readBody(event)
        const { propertyId, note, collection = 'properties' } = body

        if (!propertyId) {
            throw createError({
                statusCode: 400,
                message: 'Property ID is required'
            })
        }

        // Connect to MongoDB
        const { db } = await connectToDatabase()
        const coll = db.collection<Property>(collection)

        let mongoId
        try {
            mongoId = new ObjectId(propertyId)
        } catch (e) {
            console.log('propertyId is not a valid ObjectId, will query by id field')
        }

        const query = mongoId ? { _id: mongoId } : { id: propertyId }

        // Update the note for the property
        const result = await coll.updateOne(
            query,
            { $set: { note, update_at: new Date().toISOString() } }
        )

        if (result.matchedCount === 0) {
            throw createError({
                statusCode: 404,
                message: 'Property not found'
            })
        }

        return {
            success: true,
            message: 'Note updated successfully',
            propertyId,
            note,
            update_at: new Date().toISOString()
        }
    } catch (error) {
        console.error('Error updating property note:', error)
        throw createError({
            statusCode: 500,
            message: `Failed to update note: ${(error as Error).message}`
        })
    }
})