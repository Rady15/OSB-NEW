# Admin Dashboard

A modern, responsive admin dashboard built with React, Vite, and Tailwind CSS for managing companies, transactions, services, employees, and reports.

## Features

- **Authentication** - Secure login with JWT-based authentication
- **Dashboard** - Overview with stats, charts, and recent transactions
- **Companies Management** - View, suspend, and manage companies
- **Transactions** - Track and manage all transactions
- **Services** - Manage service offerings
- **Employees** - Staff management and permissions
- **Reports** - Generate and view reports
- **Settings** - User preferences and app configuration
- **i18n** - Multi-language support (English/Arabic with RTL)
- **Dark Mode** - Toggle between light and dark themes
- **Responsive** - Mobile, tablet, and desktop layouts
- **Permissions** - Role-based access control

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   ├── MobileNav.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   ├── Skeleton.jsx
│   └── EmployeePermissions.jsx
├── context/          # React context providers
├── hooks/            # Custom React hooks
│   └── useFormValidation.js
├── pages/            # Page components
│   ├── Companies.jsx
│   ├── Dashboard.jsx
│   ├── DevHub.jsx
│   ├── EmployeePermissions.jsx
│   ├── Employees.jsx
│   ├── Login.jsx
│   ├── Reports.jsx
│   ├── Services.jsx
│   ├── Settings.jsx
│   └── Transactions.jsx
├── services/         # API and external services
│   └── api.js
├── i18n/             # Translations
│   └── translations.js
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` (or the provided `.env`):
   ```env
   VITE_API_BASE_URL=/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

| Variable             | Description         | Default |
| -------------------- | ------------------- | ------- |
| `VITE_API_BASE_URL`  | API base URL        | `/api`  |

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Key Implementation Details

### Authentication

JWT tokens are stored in `localStorage` and automatically attached to requests via Axios interceptors (`src/services/api.js:13`).

### Error Handling

A global `ErrorBoundary` component catches React rendering errors and displays a friendly fallback UI. The boundary wraps the entire app in `src/main.jsx`.

### Code Splitting

Route-level components are lazy-loaded using `React.lazy` and `Suspense` in `src/App.jsx` to reduce the initial bundle size.

### Form Validation

A custom `useFormValidation` hook (`src/hooks/useFormValidation.js`) provides reusable form state management and validation rules (required, type, minLength, pattern, custom).

### Loading States

Skeleton loaders (`src/components/Skeleton.jsx`) provide visual feedback while data is being fetched. A `PageLoader` fallback is shown during route transitions.

## API Endpoints

The app communicates with the following backend endpoints:

- `POST /Account/login` - Authenticate user
- `GET /Account/all` - Get all users
- `GET /Account/AllStaff` - Get all staff
- `POST /Account/create-employee` - Create staff
- `PUT /Account/suspend/{userName}` - Suspend user
- `PUT /Account/unsuspend/{userName}` - Unsuspend user
- `GET /UserServices/all` - Get all requests
- `GET /UserServices/MyAllServices` - Get user's services
- `GET /UserServices/my-requests` - Get staff requests
- `GET /UserServices/AllZakat` - Get zakat requests
- `PUT /UserServices/set-price` - Set cost
- `POST /UserServices/assign-request` - Assign request
- `PUT /UserServices/update-status` - Update status
- `POST /UserServices/add-description` - Add description

## License

Private project - All rights reserved.
