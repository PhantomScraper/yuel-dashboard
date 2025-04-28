export default defineEventHandler(async (event) => {
  // Get property ID from route
  const propertyId = getRouterParam(event, 'id')
  
  // Validate input
  if (!propertyId) {
    throw createError({
      statusCode: 400,
      message: 'Property ID is required',
    })
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  console.log(`Deleted note for property ${propertyId}`)
  
  // Return success response
  return {
    success: true,
    propertyId,
    timestamp: new Date().toISOString(),
  }
}) 