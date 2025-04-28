export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event)
  const { propertyId, note } = body
  
  // Validate input
  if (!propertyId) {
    throw createError({
      statusCode: 400,
      message: 'Property ID is required',
    })
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  console.log(`Updated note for property ${propertyId}: "${note}"`)
  
  // Return success response
  return {
    success: true,
    propertyId,
    note,
    timestamp: new Date().toISOString(),
  }
}) 