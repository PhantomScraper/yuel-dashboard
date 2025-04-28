# Zillow Dashboard

A modern dashboard for displaying and filtering property data, built with Nuxt 3, Vue 3, and Tailwind CSS.

## Features

- Responsive design that works well on both desktop and mobile
- Real-time filtering of property data
- Sortable columns
- Pagination
- Statistics overview
- Modern UI with Tailwind CSS

## Tech Stack

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- @tanstack/vue-table

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zillow-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
zillow-dashboard/
├── components/         # Reusable Vue components
├── composables/        # Vue composables
├── pages/             # Application pages
├── server/            # API routes
├── types/             # TypeScript type definitions
└── assets/            # Static assets
```

## Features

### Data Table
- Displays property information in a sortable table
- Supports pagination
- Responsive design for mobile devices

### Filters
- Filter by city
- Filter by state
- Filter by price range

### Statistics
- Total number of properties
- Average property price
- Average property area

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
