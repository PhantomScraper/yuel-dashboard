import schedule from 'node-schedule';
import axios from 'axios';
import { connectToDatabase } from '~/utils/mongodb';
import { Collection } from 'mongodb';

// Define interfaces
interface PriceChange {
    price: number;
    updated_at: string;
}

interface Property {
    _id: any;
    zpid: string;
    price: number;
    rawHomeStatusCd?: string;
    timeOnZillow?: string;
    priceChanges?: PriceChange[];
    update_at?: string;
    insertedAt?: Date | string;
}

interface ApiResponse {
    data: {
        property: {
            price?: number;
            keystoneHomeStatus?: string;
            timeOnZillow?: string;
        } | null;
    };
}

interface ProcessResult {
    success: boolean;
    zpid: string;
    error?: string;
}

// Function to fetch data from API with retry logic
async function fetchZpidData(zpid: string, retries = 3): Promise<ApiResponse> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get<ApiResponse>(`http://64.253.94.161:5050/get-zpid?zpid=${zpid}`, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Connection': 'keep-alive',
                }
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log(`Attempt ${attempt}/${retries} failed for zpid ${zpid}: ${errorMessage}`);

            if (attempt === retries) {
                throw new Error(`API failed for zpid ${zpid} after ${retries} attempts: ${errorMessage}`);
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
    }

    throw new Error(`API failed for zpid ${zpid}: Maximum retries exceeded`);
}

// Function to format date to YYYY-MM-DDTHH:mm:ss
function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 19);
}

// Function to process each property
async function processProperty(property: Property, collection: Collection<Property>): Promise<ProcessResult> {
    try {
        const zpidData = await fetchZpidData(property.zpid);

        const updateFields: Partial<Property> = {};

        // If property is null, set status to "Not Found"
        if (!zpidData.data || zpidData.data.property === null) {
            updateFields.rawHomeStatusCd = "Not Found";
        } else {
            const apiProperty = zpidData.data.property;

            // Always update status and timeOnZillow
            if (apiProperty.keystoneHomeStatus) {
                updateFields.rawHomeStatusCd = apiProperty.keystoneHomeStatus;
            }
            if (apiProperty.timeOnZillow) {
                updateFields.timeOnZillow = apiProperty.timeOnZillow;
            }

            if (apiProperty.price && Number(apiProperty.price) !== Number(property.price)) {
                const currentPrice = Number(property.price) || 0;
                const newPrice = Number(apiProperty.price);
                let priceChanges: PriceChange[] = property.priceChanges || [];

                // If priceChanges is empty, add the initial price
                if (priceChanges.length === 0) {
                    const insertedAt = property.insertedAt
                        ? formatDate(property.insertedAt)
                        : formatDate(new Date());

                    priceChanges.push({
                        price: currentPrice,
                        updated_at: insertedAt
                    });
                }

                priceChanges.push({
                    price: newPrice,
                    updated_at: formatDate(new Date())
                });

                updateFields.priceChanges = priceChanges;
                updateFields.price = newPrice;
                updateFields.update_at = formatDate(new Date());
            }
        }

        // Update the document
        if (Object.keys(updateFields).length > 0) {
            await collection.updateOne(
                { zpid: property.zpid },
                { $set: updateFields }
            );
        }

        return { success: true, zpid: property.zpid };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, zpid: property.zpid, error: errorMessage };
    }
}

// Main cron job function
async function runPriceTracking(): Promise<void> {
    console.log('Starting price tracking job at:', new Date().toISOString());

    const { db } = await connectToDatabase();
    const collection = db.collection<Property>('600_1.2M');

    try {
        // Get all properties
        const properties = (await collection.find({ price: 0 }).toArray());
        console.log(`Found ${properties.length} properties to process`);

        const batchSize = 20;
        const concurrentLimit = 5
        const results = {
            success: 0,
            failed: 0,
            errors: [] as ProcessResult[]
        };

        for (let i = 0; i < properties.length; i += batchSize) {
            const batch = properties.slice(i, i + batchSize);

            // Process batch with limited concurrency
            for (let j = 0; j < batch.length; j += concurrentLimit) {
                const chunk = batch.slice(j, j + concurrentLimit);

                const chunkResults = await Promise.all(
                    chunk.map(property => processProperty(property, collection))
                );

                // Count results
                chunkResults.forEach(result => {
                    if (result.success) {
                        results.success++;
                    } else {
                        results.failed++;
                        results.errors.push(result);
                    }
                });

                // Add delay between chunks
                if (j + concurrentLimit < batch.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between chunks
                }
            }

            // Add longer delay between batches to prevent API rate limiting
            if (i + batchSize < properties.length) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between batches
            }

            console.log(`Processed ${Math.min(i + batchSize, properties.length)}/${properties.length} properties`);
            console.log(`Current stats - Success: ${results.success}, Failed: ${results.failed}`);
        }

        console.log('Price tracking completed:', results);

        if (results.failed > 0) {
            console.error('Failed API calls:', results.errors);
        }

    } catch (error) {
        console.error('Error in price tracking job:', error);
    }
}

// Schedule the cron job to run daily at 2 AM
const job = schedule.scheduleJob('0 2 * * *', runPriceTracking);

console.log('Price tracking cron job scheduled to run daily at 2 AM');

// For testing, uncomment to run immediately
// runPriceTracking();

// Export for use in other files if needed
export { runPriceTracking, job };