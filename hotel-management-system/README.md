# Hotel Management System

A full-stack web application for managing hotel operations, built with React, Express, and MongoDB.

## Project Structure

```
hotel-management-system/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── services/    # API service functions
│   │   └── utils/       # Utility functions
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── app.js       # Express app setup
│   ├── .env             # Environment variables
│   └── package.json
└── package.json         # Root package.json
```

## Getting Started

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3002

## Features

- Staff Authentication
- Room Management
- Booking Management
- Email Notifications
- Role-based Access Control

## Default Login Credentials

Staff:
- Email: hotelstaff@example.com
- Password: Staff@123
