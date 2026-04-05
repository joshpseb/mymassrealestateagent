---
name: Full Stack Real Estate Platform Architecture
overview: ""
todos:
  - id: 9692ff61-affb-4183-b21f-dd01e750127a
    content: Create backend directory structure, initialize Node.js project with TypeScript, install dependencies (express, mysql2, @google/genai, dotenv, cors), and set up TypeScript configuration
    status: pending
  - id: d3ba3313-4efc-463b-942f-114d3e7c58b3
    content: Create MySQL connection module, define database schema for properties table, and create table initialization/migration script
    status: pending
  - id: 109c2d93-71aa-4a39-b6fa-f0a12c40c8d5
    content: Create Express routes for news (GET /api/news) and listings (GET, POST, PUT, DELETE /api/listings) with proper error handling
    status: pending
  - id: 6942558e-d24e-4489-a713-ee9de484a211
    content: Create .env file structure in backend directory, add .env to .gitignore, and create .env.example template with required variables
    status: pending
  - id: 37d23eab-7e41-4a41-8023-edf0ab0504ac
    content: Update index.tsx to remove direct Gemini API calls and replace with fetch calls to backend endpoints, update handleAddProperty to POST to backend
    status: pending
  - id: 2af7f652-e5a3-4364-8d60-679d28b6860d
    content: Remove API key exposure from vite.config.ts (remove process.env.API_KEY definitions)
    status: pending
  - id: 2dcac28e-f4ee-4cdc-85e9-55e304405d2c
    content: Update .github/workflows/deploy.yml to build backend, set up backend service (PM2), and handle .env file deployment securely
    status: pending
---

# Full Stack Real Estate Platform Architecture

## Project Structure

```
MyMassRealEstateAgent/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── server.ts           # Express server setup
│   │   ├── routes/
│   │   │   ├── news.ts         # Gemini news endpoint
│   │   │   └── properties.ts   # Property CRUD endpoints
│   │   ├── models/
│   │   │   └── Property.ts     # MongoDB schema/model
│   │   ├── controllers/
│   │   │   ├── newsController.ts
│   │   │   └── propertyController.ts
│   │   ├── services/
│   │   │   └── geminiService.ts
│   │   ├── config/
│   │   │   └── database.ts     # MongoDB connection
│   │   └── middleware/
│   │       └── errorHandler.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                     # API keys & DB connection
└── .github/workflows/
    └── deploy.yml               # Updated deployment
```

## Implementation Plan

### Phase 1: Backend Foundation

1. **Create backend structure**

   - Initialize Node.js project with TypeScript
   - Install: express, mongoose, @google/genai, dotenv, cors, express-validator
   - Set up Express server with middleware (CORS, JSON parsing, error handling)

2. **MongoDB Setup**

   - Create MongoDB connection using Mongoose
   - Define Property schema with validation:
     - address, price, bedrooms, bathrooms, sqft, description, imageUrl
     - timestamps, indexes for search/query optimization
   - Create seed script to populate 30+ initial listings

3. **Gemini API Service**

   - Create service module for Gemini API calls
   - Move news generation logic to backend
   - Implement caching/rate limiting if needed

### Phase 2: RESTful API Endpoints

1. **News Endpoint**

   - `GET /api/news` - Fetches housing market news from Gemini
   - Returns JSON array of articles
   - Error handling and response formatting

2. **Property Endpoints (RESTful)**

   - `GET /api/properties` - List all properties (with pagination for 30+)
     - Query params: page, limit, sort, filter (price, bedrooms, etc.)
   - `GET /api/properties/:id` - Get single property
   - `POST /api/properties` - Create new property (admin)
   - `PUT /api/properties/:id` - Update property (admin)
   - `DELETE /api/properties/:id` - Delete property (admin)

### Phase 3: Frontend Refactoring

1. **Restructure frontend**

   - Move existing code to `frontend/src/`
   - Organize components into separate files
   - Create API service layer for backend communication

2. **Update React Components**

   - Replace hardcoded properties with API fetch
   - Update `handleAddProperty` to POST to backend
   - Add loading states, error handling
   - Implement pagination/filtering UI for 30+ listings

3. **Remove Security Issues**

   - Remove direct Gemini API call from frontend
   - Remove API key from vite.config.ts
   - All API calls go through backend

### Phase 4: Enhanced Features

1. **Property Management**

   - Add edit/delete functionality for admin
   - Form validation and error messages
   - Optimistic UI updates

2. **Data Management**

   - Seed database with 30+ realistic property listings
   - Add search/filter functionality
   - Sort by price, date, etc.

### Phase 5: Deployment

1. **Update deployment workflow**

   - Build both frontend and backend
   - Set up MongoDB connection (MongoDB Atlas or local)
   - Configure environment variables
   - Deploy backend as Node.js service (PM2)
   - Deploy frontend to public_html

## Key Files to Create/Modify

**New Backend Files:**

- `backend/src/server.ts` - Express server
- `backend/src/config/database.ts` - MongoDB connection
- `backend/src/models/Property.ts` - Mongoose schema
- `backend/src/routes/properties.ts` - Property endpoints
- `backend/src/routes/news.ts` - News endpoint
- `backend/src/services/geminiService.ts` - Gemini integration
- `backend/src/controllers/propertyController.ts` - Business logic

**Refactored Frontend Files:**

- `frontend/src/App.tsx` - Main app (refactored from index.tsx)
- `frontend/src/services/api.ts` - API service layer
- `frontend/src/components/PropertyListings.tsx` - Extracted component
- `frontend/src/components/NewsSection.tsx` - Extracted component
- `frontend/src/types/index.ts` - Shared TypeScript types

**Configuration:**

- `backend/.env` - MongoDB URI, Gemini API key
- `backend/.env.example` - Template
- Update `.gitignore` for both frontend and backend