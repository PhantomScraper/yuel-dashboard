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

    if (query.priceChanges !== 'true' && (query.startDate || query.endDate)) {
      const dateFilter: any = {}
      
      if (query.startDate) {
        dateFilter.$gte = new Date(`${query.startDate}T00:00:00.000Z`)
      }
      
      if (query.endDate) {
        dateFilter.$lte = new Date(`${query.endDate}T23:59:59.999Z`)
      }
      
      filters.$or = [
        { insertedAt: dateFilter },
        { insertedAt: null }
      ]
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
        const priceChanges = item.priceChanges;
        const currentPrice = priceChanges[priceChanges.length - 1].price;

        let lastChangeDate = null;

        for (let i = priceChanges.length - 1; i >= 0; i--) {
          if (priceChanges[i].price !== currentPrice) {
            // lần khác giá gần nhất
            if (i + 1 < priceChanges.length) {
              lastChangeDate = priceChanges[i + 1].updated_at;
            }
            break;
          }
        }

        // Nếu không tìm thấy khác giá thì nó chưa bao giờ đổi => dùng bản ghi đầu tiên
        if (!lastChangeDate && priceChanges[0].price === currentPrice) {
          lastChangeDate = priceChanges[0].updated_at;
        }

        item.update_at = lastChangeDate;
      }
    });

    // Filter theo date range SAU KHI đã tính toán update_at
    let filteredProperties = properties;
    if (query.priceChanges === 'true' && (query.startDate || query.endDate)) {
      filteredProperties = properties.filter(item => {
        if (!item.update_at) return false;
        
        const updateDate = item.update_at;
        let matchesDateRange = true;
        
        if (query.startDate) {
          const startDate = `${query.startDate}T00:00:00`;
          matchesDateRange = matchesDateRange && updateDate >= startDate;
        }
        
        if (query.endDate) {
          const endDate = `${query.endDate}T23:59:59`;
          matchesDateRange = matchesDateRange && updateDate <= endDate;
        }
        
        return matchesDateRange;
      });
    }

    // Sort by insertedAt or update_at depending on the tab
    const sortedProperties = filteredProperties.sort((a: any, b: any) => {
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