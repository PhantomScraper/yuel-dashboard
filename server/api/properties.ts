import type { Property } from '~/types/property'

export default defineEventHandler(async (event) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Mock properties data
  return [
    {
      id: '1',
      address: '123 Main St',
      addressCity: 'Los Angeles',
      addressState: 'CA',
      addressStreet: 'Main St',
      addressZipcode: '90001',
      area: 2500,
      baths: 2,
      beds: 3,
      brokerName: 'Coastal Realty',
      detailUrl: 'https://example.com/property/1',
      price: 1250000,
      saves: 24,
      latestSoldYear: 2018,
      yearBuilt: 1985,
      updated_at: '2023-07-12T12:00:00Z',
      note: 'Great location, close to schools and parks. Perfect for families.'
    },
    {
      id: '2',
      address: '456 Ocean Ave',
      addressCity: 'San Francisco',
      addressState: 'CA',
      addressStreet: 'Ocean Ave',
      addressZipcode: '94102',
      area: 1800,
      baths: 2,
      beds: 2,
      brokerName: 'Bay View Properties',
      detailUrl: 'https://example.com/property/2',
      price: 1750000,
      saves: 33,
      latestSoldYear: 2020,
      yearBuilt: 2005,
      updated_at: '2023-08-15T14:30:00Z',
      note: ''
    },
    {
      id: '3',
      address: '789 Broadway',
      addressCity: 'New York',
      addressState: 'NY',
      addressStreet: 'Broadway',
      addressZipcode: '10012',
      area: 1200,
      baths: 1,
      beds: 1,
      brokerName: 'Manhattan Estates',
      detailUrl: 'https://example.com/property/3',
      price: 950000,
      saves: 17,
      latestSoldYear: 2019,
      yearBuilt: 1955,
      updated_at: '2024-04-27T09:15:00Z',
      note: 'Excellent investment opportunity in a high-demand area. Close to subway.'
    },
    {
      id: '4',
      address: '101 Pine St',
      addressCity: 'Seattle',
      addressState: 'WA',
      addressStreet: 'Pine St',
      addressZipcode: '98101',
      area: 2200,
      baths: 2.5,
      beds: 3,
      brokerName: 'Northwest Realty',
      detailUrl: 'https://example.com/property/4',
      price: 1100000,
      saves: 19,
      latestSoldYear: 2021,
      yearBuilt: 2010,
      updated_at: '2023-09-05T16:45:00Z',
      note: ''
    },
    {
      id: '5',
      address: '222 Peachtree St',
      addressCity: 'Atlanta',
      addressState: 'GA',
      addressStreet: 'Peachtree St',
      addressZipcode: '30303',
      area: 3200,
      baths: 3,
      beds: 4,
      brokerName: 'Georgia Home Finders',
      detailUrl: 'https://example.com/property/5',
      price: 890000,
      saves: 28,
      latestSoldYear: 2022,
      yearBuilt: 2000,
      updated_at: '2023-09-10T11:20:00Z',
      note: ''
    }
  ]
}) 