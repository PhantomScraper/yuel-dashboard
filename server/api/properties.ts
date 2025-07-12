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
      if (query.priceChanges === 'true') {
        filters.$or = [
          {
            update_at: {
              $gte: `${query.startDate}T00:00:00.000Z`,
              $lte: `${query.endDate}T23:59:59.999Z`
            }
          },
          { update_at: null }
        ];
      } else {
        // For regular tabs, use insertedAt for date filters
        filters.$or = [
          {
            insertedAt: {
              $gte: new Date(`${query.startDate}T00:00:00.000Z`),
              $lte: new Date(`${query.endDate}T23:59:59.999Z`)
            }
          },
          { insertedAt: null }
        ];
      }
    }

    if (query.priceChanges === 'true') {
      // Kiểm tra cả hai điều kiện trong một query
      filters.$and = [
        // Kiểm tra có ít nhất 2 phần tử
        { 'priceChanges.1': { $exists: true } },

        // Kiểm tra có ít nhất 2 giá trị price khác nhau bằng cách:
        {
          $expr: {
            $gt: [
              {
                $size: {
                  $setUnion: [
                    {
                      $map: {
                        input: "$priceChanges",
                        as: "pc",
                        in: "$$pc.price"
                      }
                    }
                  ]
                }
              },
              1
            ]
          }
        }
      ];
    }

    filters.rawHomeStatusCd = { $nin: ["NotForSale", "ForRent"] }

    // Connect to MongoDB
    const { db } = await connectToDatabase()
    const collection = db.collection<Property>(collectionName)

    // Fetch properties with filters
    const properties = await collection.find(filters).toArray();
    properties.forEach(item => {
      if (item.priceChanges && item.priceChanges.length > 0) {
        const maxPrice = Math.max(...item.priceChanges.map(p => p.price));

        const candidates = item.priceChanges.filter(p => p.price === maxPrice);

        const earliest = candidates.reduce((min, current) => {
          return current.updated_at < min.updated_at ? current : min;
        });

        item.update_at = earliest.updated_at;
      }
    });
    // Sort by insertedAt or update_at depending on the tab
    const sortedProperties = properties.sort((a: any, b: any) => {
      if (query.priceChanges === 'true') {
        // For price tracking tabs, sort by update_at
        return new Date(b.update_at || '').getTime() - new Date(a.update_at || '').getTime();
      } else {
        // For regular tabs, sort by insertedAt
        return new Date(b.insertedAt || '').getTime() -
          new Date(a.insertedAt || '').getTime();
      }
    });

    return sortedProperties.map(doc => {
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