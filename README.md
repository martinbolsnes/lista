# LISTA

A real-time collaborative list application built with Next.js, MongoDB, Pusher and Clerk.

## Features

- Create and manage multiple lists
- Real-time updates across devices and users
- Share lists with other users
- Granular permissions (view, edit)
- Add, edit, complete, and delete list items
- User authentication and authorization
- Responsive design

## Tech Stack

- **Frontend**: Next.js, React, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Real-time Updates**: Pusher
- **Authentication**: Clerk
- **UI Components**: shadcn/ui

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local instance or cloud service like MongoDB Atlas)

## Environment Variables

Create a \`.env.local\` file in the root directory and add the following variables:

```bash
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_cler_secret
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
```

Replace the placeholder values with your actual credentials.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lista.git
   cd lista
   ```

2. Install dependencies:
   ```bash
   npm install
   
   or
   
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   
   or
   
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Register a new account or log in if you already have one.
2. Create a new list from the dashboard.
3. Add items to your list.
4. Share your list with other users by entering their email address.
5. Collaborate in real-time as changes sync across all connected clients.

## API Routes

- \`/api/users\`: Register a new user from Clerk
- \`/api/lists\`: Get all lists for a user or create a new list
- \`/api/lists/[id]\`: Get, update, or delete a specific list
- \`/api/lists/[id]/items\`: Get, add, update, or delete items in a list
- \`/api/lists/[id]/share\`: Share a list with another user
