git# GigFlow Frontend

A React-based frontend application for managing freelance gigs and bids.

## Features

- User authentication (login/register)
- Browse and search gigs
- Create new gig postings
- Submit bids on gigs
- View and manage bids (for gig owners)
- Hire freelancers

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Backend API running on `http://localhost:5000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Backend Configuration

Ensure your backend API is running on `http://localhost:5000` with CORS configured for `http://localhost:5173`.

## Project Structure

```
src/
├── components/     # React components
├── services/       # API service functions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## License

MIT
