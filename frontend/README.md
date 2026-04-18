# Civic Monitor - Frontend

A modern React application for civic issue tracking and management, built with Vite, React Router, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Cookie-based JWT authentication with Bearer token fallback
- 📱 **Issue Management**: Create, view, and track civic issues
- 🗺️ **Geographic Organization**: City, Zone, and Locality-based issue organization
- 👥 **User Roles**: Citizen and Admin roles with different access levels
- 💬 **Comments & Upvotes**: Community engagement features
- 📸 **Media Support**: Image and video uploads for issues
- 🎨 **Modern UI**: Beautiful gradient-based design with animations

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=https://civic-monitor.onrender.com
```

For local development with a local backend:
```env
VITE_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable React components
│   ├── context/       # React Context providers
│   ├── pages/         # Page components
│   ├── routes/        # Route definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── dist/              # Production build output
```

## API Integration

The frontend communicates with a backend API. The base URL is configured via the `VITE_API_URL` environment variable.

### Key API Endpoints

- `/auth/login` - User login
- `/auth/signup` - User registration
- `/users/me` - Get current user
- `/issues/feed` - Get locality-specific issues
- `/issues/explore` - Get all city issues
- `/issues` - Create new issue
- `/admin/issues` - Admin issue management

## Authentication

The app uses cookie-based authentication with JWT tokens. Cookies are automatically sent with requests via `withCredentials: true`. A Bearer token fallback is also supported for environments where cookies may be blocked.

## Development

### Code Style

- ESLint is configured for code quality
- Run `npm run lint` to check for linting errors

### Environment Variables

- `VITE_API_URL` - Backend API base URL (default: `https://civic-monitor.onrender.com`)

## Troubleshooting

### CORS Issues

If you encounter CORS errors during development:
1. Ensure your backend allows requests from `http://localhost:5173`
2. Check that `withCredentials` is properly configured
3. Verify the backend CORS settings include your frontend origin

### Authentication Issues

- Clear browser cookies and localStorage
- Check browser console for detailed error logs
- Verify the backend is running and accessible

## License

This project is part of the Civic Monitor application.
