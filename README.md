# MessageHub

A modern messaging application built with React and Supabase.

## Features

- Real-time messaging
- User authentication (login, register, logout)
- Contact management
- Dark/Light theme support
- Responsive design
- Demo mode for development

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Supabase project for authentication

### Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. (Optional) Configure Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your Project URL and anon key to `.env`

### Running the App

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Demo Mode

If Supabase is not configured (no `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`), the app runs in demo mode:

- Any email/password combination works for login
- User data is stored in localStorage
- All app features are fully functional

This is useful for development and testing without setting up a backend.

## Tech Stack

- React 18
- Vite
- Supabase (authentication & backend)
- Tailwind CSS
- Radix UI (shadcn/ui components)
- React Router
- React Hook Form + Zod validation

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

MIT
