# OBELISK - Online Educational Learning System

OBELISK is a modern educational learning platform built with React, TypeScript, and Supabase. This platform enables users to browse courses, track their learning progress, and access educational content.

## Features

- User authentication (signup, login, password reset)
- Course catalog with filtering and search
- Course and lesson management
- User progress tracking
- Responsive design for all devices
- Interactive learning content

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (Authentication, Database, Storage)
- **Styling**: CSS with potential for Tailwind CSS
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/obelisk.git
   cd obelisk
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and anon key:
     ```
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Set up the following tables in your Supabase database:

### Table: courses
- id (uuid, primary key)
- title (text, not null)
- description (text)
- image_url (text)
- created_at (timestamp with time zone, default: now())

### Table: lessons
- id (uuid, primary key)
- course_id (uuid, foreign key to courses.id)
- title (text, not null)
- content (text)
- order (integer, not null)
- created_at (timestamp with time zone, default: now())

### Table: user_progress
- id (uuid, primary key)
- user_id (uuid, not null, references auth.users.id)
- lesson_id (uuid, not null, references lessons.id)
- completed (boolean, default: false)
- last_accessed (timestamp with time zone, default: now())

3. Set up Row Level Security (RLS) policies for your tables to ensure data security.

## Deployment

To build the app for production:

```bash
npm run build
# or
yarn build
```

This will generate a `dist` folder with your production-ready application.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Team for the amazing framework
- Supabase for the powerful backend services
- Vite for the fast development experience