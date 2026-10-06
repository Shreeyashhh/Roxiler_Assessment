# Store Rating Web Application

A full-stack, production-quality **Store Rating Web Application** built with **ReactJS, Node.js, ExpressJS, PostgreSQL, Prisma ORM, JWT Authentication, and Tailwind CSS**.

The application provides a platform for users to discover stores, submit ratings (1 to 5 stars), and view overall average ratings. It supports role-based access control for **System Administrators**, **Store Owners**, and **Normal Users**.

---

## 🌟 Key Features

### 1. Authentication & Security
- Single unified authentication system supporting **SYSTEM_ADMIN**, **NORMAL_USER**, and **STORE_OWNER**.
- Password hashing using `bcryptjs` (salt rounds = 10).
- Stateless JWT authentication with expiration.
- Strict role-based authorization middleware on both frontend routes and backend REST endpoints.
- SQL Injection protection via Prisma ORM and sanitized dynamic sorting fields.
- Security headers via `Helmet` and configured `CORS`.

### 2. Admin Module (`SYSTEM_ADMIN`)
- **Dashboard Analytics**: Real-time statistics for total registered users, total stores, and total customer ratings.
- **Store Management**: Create stores, assign store owners, view store details, search by store name or address, sort columns (asc/desc), paginated listings, edit/delete stores.
- **User Management**: Add new accounts with any role (Normal User, Store Owner, System Admin), search users by name, email, or address, filter by role, sort columns (asc/desc), paginated listings.
- **Owner Rating Overview**: View store owner names, store names, average calculated ratings, rating counts, and individual review details.

### 3. Normal User Module (`NORMAL_USER`)
- **User Registration**: Self-registration with validation (Name 20–60 chars, Email format, Address max 400 chars, Password 8–16 chars with 1 uppercase & 1 special character).
- **Store Listing & Search**: Browse all registered stores with calculated overall rating and user's own rating (`My Rating`). Search dynamically by name or address.
- **Intuitive Rating UI**: Submit ratings from 1 to 5 stars using interactive star rating controls.
- **Duplicate Prevention**: Database-level unique constraint `@@unique([userId, storeId])` prevents duplicate ratings. Users who have already rated a store are provided with an **"Edit Rating"** option to update their score.
- **Password Management**: Change account password after verifying current password.

### 4. Store Owner Module (`STORE_OWNER`)
- **Owner Dashboard**: View assigned stores, calculated average rating (computed dynamically from the `ratings` table), and total number of ratings.
- **Customer Ratings List**: View customer review breakdown including Customer Name, Customer Email, Rating Score, and Submission Date (without exposing unnecessary sensitive information).
- **Password Management**: Secure password change functionality.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | ReactJS (Vite), React Router v6, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, ExpressJS, REST APIs |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens), `bcryptjs` |
| **Testing** | Jest + Supertest (Backend), Vitest + React Testing Library (Frontend) |

---

## 📐 Database Schema & Architecture

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ STORE : "owns (STORE_OWNER)"
    USER ||--o{ RATING : "submits (NORMAL_USER)"
    STORE ||--o{ RATING : "receives"

    USER {
        int id PK
        string name
        string email UK
        string passwordHash
        string address
        Role role
        datetime createdAt
        datetime updatedAt
    }

    STORE {
        int id PK
        string name
        string email UK
        string address
        int ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    RATING {
        int id PK
        int userId FK
        int storeId FK
        int rating
        datetime createdAt
        datetime updatedAt
    }
```

### Constraints & Indexes
- `users.email`: Unique constraint (`@unique`).
- `stores.email`: Unique constraint (`@unique`).
- `ratings.(userId, storeId)`: **Database-level unique constraint (`@@unique([userId, storeId])`)** to guarantee a user can submit only ONE rating per store.

---

## 📂 Folder Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Schema definition
│   │   └── seed.js             # Database seeding script
│   ├── src/
│   │   ├── config/             # Environment & configuration loading
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # Auth, Role, & Error handling middleware
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # Validators & standardized response helpers
│   │   ├── app.js              # Express app setup & security middlewares
│   │   ├── prisma.js           # Prisma client instance
│   │   └── server.js           # Backend server entry point
│   ├── tests/
│   │   └── api.test.js         # Jest + Supertest integration tests
│   ├── jest.config.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Tables, Modals, RatingStars, etc.)
│   │   ├── context/            # AuthContext state management
│   │   ├── layouts/            # DashboardLayout with sticky header & sidebar
│   │   ├── pages/              # Admin, Store Owner, Normal User, Login, Register pages
│   │   ├── routes/             # AppRoutes with role protection
│   │   ├── services/           # Axios API client
│   │   ├── validations/        # Frontend form validation utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── README.md
```

---

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new Normal User
- `POST /api/auth/login` - Login user and return JWT
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current authenticated user details

### Users (`SYSTEM_ADMIN` / Authenticated)
- `GET /api/users?search=&role=&sortBy=&sortOrder=&page=&limit=` - List users (Admin)
- `POST /api/users` - Add user with any role (Admin)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/password` - Change account password

### Stores
- `GET /api/stores?search=&sortBy=&sortOrder=&page=&limit=` - List stores with overall & user rating
- `POST /api/stores` - Create store (Admin)
- `GET /api/stores/:id` - Get store details
- `PUT /api/stores/:id` - Update store (Admin)
- `DELETE /api/stores/:id` - Delete store (Admin)

### Ratings (`NORMAL_USER`)
- `POST /api/ratings` - Submit 1-5 star rating
- `PUT /api/ratings/:id` - Update existing rating
- `GET /api/ratings` - Get ratings list (Admin / Store Owner)

### Dashboards
- `GET /api/admin/dashboard` - Admin analytics overview (`SYSTEM_ADMIN`)
- `GET /api/store-owner/dashboard` - Store owner dashboard (`STORE_OWNER`)

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- **Node.js** v18+ and **npm** v9+ installed.
- **PostgreSQL** database server running locally or accessible via URL.

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd rolexler-assessment

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Edit `.env` to configure your PostgreSQL database connection string and JWT secret:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storerating_db?schema=public"
JWT_SECRET="super_secret_jwt_key_store_rating_app_2026"
JWT_EXPIRES_IN="1d"
```

### 3. Database Migration & Seeding
```bash
# Run Prisma migrations to create PostgreSQL database tables
npx prisma migrate dev --schema=backend/prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema=backend/prisma/schema.prisma

# Seed database with sample admin, store owners, normal users, stores, and ratings
node backend/prisma/seed.js
```

### 4. Running the Application
```bash
# Start backend server (Port 5000)
npm run server

# In a separate terminal, start frontend development server (Port 5173)
npm run client

# Alternatively, run both concurrently from root:
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Running Tests

### Backend API Unit & Integration Tests (Jest + Supertest)
```bash
npm test --prefix backend
```
*Executes tests for authentication, role authorization, store management, rating submission, duplicate rating prevention, average rating calculation, and password updates.*

### Frontend Component & Form Validation Tests (Vitest + RTL)
```bash
npm test --prefix frontend
```
*Executes tests for form input validation rules and interactive star rating component.*

---

## 👤 Sample Seed Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **SYSTEM_ADMIN** | `admin@example.com` | `Password123!` | System Administrator Account |
| **STORE_OWNER** | `owner1@example.com` | `Password123!` | Alexander Graham Bell Owner |
| **STORE_OWNER** | `owner2@example.com` | `Password123!` | Victoria Beckham Store Owner |
| **NORMAL_USER** | `user1@example.com` | `Password123!` | Jonathan Edward Star User |
| **NORMAL_USER** | `user2@example.com` | `Password123!` | Elizabeth Grace Bennett User |
| **NORMAL_USER** | `user3@example.com` | `Password123!` | Christopher Robin Milne User |
| **NORMAL_USER** | `user4@example.com` | `Password123!` | Samantha Jane Miller User |
| **NORMAL_USER** | `user5@example.com` | `Password123!` | Benjamin Franklin Cooper User |

---

## 📋 Requirement Verification Checklist

- [x] **Admin login**: Implemented (`/login` -> `/admin/dashboard`)
- [x] **Normal User registration**: Implemented (`/register`)
- [x] **Normal User login**: Implemented (`/login` -> `/user/dashboard`)
- [x] **Store Owner login**: Implemented (`/login` -> `/store-owner/dashboard`)
- [x] **JWT authentication**: Implemented (`authenticateToken` middleware)
- [x] **Role-based authorization**: Implemented (`authorizeRole` middleware)
- [x] **Password hashing**: Implemented using `bcryptjs`
- [x] **Password update**: Implemented with current password verification
- [x] **Admin user creation**: Implemented (Add Admin, Store Owner, Normal User)
- [x] **Admin store creation**: Implemented (Assign Store Owner)
- [x] **Admin dashboard statistics**: Total Users, Total Stores, Total Ratings
- [x] **User search**: Search by Name, Email, Address
- [x] **User filtering**: Filter by Role (`SYSTEM_ADMIN`, `STORE_OWNER`, `NORMAL_USER`)
- [x] **User sorting**: Sort by Name, Email, Address, Role, CreatedAt
- [x] **Store search**: Search by Store Name, Address
- [x] **Store sorting**: Sort by Name, Address, Rating, CreatedAt
- [x] **Store details**: Name, Email, Address, Owner, Overall Rating, Ratings Count
- [x] **Store Owner rating information**: User Name, User Email, Rating, Date
- [x] **Normal User store listing**: Shows Store Name, Address, Overall Rating, My Rating
- [x] **Submit rating**: 1 to 5 star rating UI
- [x] **Modify rating**: Edit existing rating action
- [x] **Average rating**: Computed via database query/aggregation
- [x] **Store Owner dashboard**: Store stats, average rating, customer reviews list
- [x] **Store Owner rating users**: View customer rating submissions
- [x] **All validations**: Name (20–60), Address (max 400), Email, Password (8–16 + upper + special), Rating (1–5)
- [x] **API error handling**: Centralized Express error handler with clean JSON responses
- [x] **Responsive UI**: Desktop, tablet, mobile compatible Tailwind CSS UI
- [x] **Database constraints**: `@@unique([userId, storeId])` unique constraint
- [x] **Testing**: Jest + Supertest (Backend), Vitest (Frontend)
- [x] **Seed data**: Complete seed script with Admin, 2 Owners, 5 Users, 5 Stores, sample ratings
- [x] **Git configuration**: Clean Git repository with `.gitignore`
