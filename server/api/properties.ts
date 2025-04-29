import { connectToDatabase } from '~/utils/mongodb'
import type { Property } from '~/types/property'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const collectionName = query.collection as string

    // Apply filters from query parameters
    const filters: any = {}

    if (query.minPrice) {
      filters.price = { $gte: Number(query.minPrice) }
    }

    if (query.maxPrice) {
      filters.price = { ...filters.price, $lte: Number(query.maxPrice) }
    }

    if (query.yearBuilt) {
      filters.yearBuilt = Number(query.yearBuilt)
    }

    if (query.startDate && query.endDate) {
      filters.$or = [
        {
          update_at: {
            $gte: `${query.startDate}T00:00:00.000Z`,
            $lte: `${query.endDate}T23:59:59.999Z`
          }
        },
        { update_at: null }
      ];
    }
    if (query.priceChanges === 'true') {
      filters.priceChanges = { $exists: true, $type: 'array' }
      filters.$expr = { $gt: [{ $size: "$priceChanges" }, 1] }
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()
    const collection = db.collection<Property>(collectionName)

    // Fetch properties with filters
    const properties = (await collection.find(filters).toArray()).sort((a: any, b: any) => {
      return new Date(b.update_at).getTime() - new Date(a.update_at).getTime();
    });
    return properties.map(doc => {
      const { _id, id: originalId, ...restProps } = doc as any

      return {
        id: _id.toString(),
        ...restProps
      }
    })
  } catch (error) {
    console.error('Error fetching properties from MongoDB:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to fetch properties: ${(error as Error).message}`
    })
  }
})