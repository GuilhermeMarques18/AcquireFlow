# AcquireFlow - Complete Architecture Analysis

## 📋 Project Overview

**Project Name:** AcquireFlow  
**Description:** Sistema de Gestão de Aquisições (Acquisition Management System)  
**Version:** 1.0.0  
**Language:** TypeScript  
**Runtime:** Node.js  
**Package Manager:** npm  

---

## 🏗️ Architecture Pattern

**Pattern Type:** Layered (N-Tier) Architecture with MVC-like organization

The application follows a clean, modular structure with clear separation of concerns:

```
Request → Routes → Controller → Service → Database
         ↓          ↓           ↓        ↓
      Express    Validation  Business  Drizzle ORM
                             Logic     + PostgreSQL
```

---

## 📁 Directory Structure

```
src/
├── app.ts                          # Express app configuration & middleware setup
├── server.ts                        # Server initialization & port listener
├── index.ts                         # Entry point
├── config/
│   ├── database.ts                 # Database connection (Neon PostgreSQL)
│   └── logger.ts                   # Winston logging configuration
├── controllers/
│   └── auth.controller.ts          # Request handlers for auth endpoints
├── routes/
│   └── auth.routes.ts              # Route definitions for auth
├── service/
│   └── auth.service.ts             # Business logic for authentication
├── models/
│   └── user.model.ts               # Database schema & cookie utilities
├── validations/
│   └── auth.validation.ts          # Zod schema for request validation
└── utils/
    ├── jwt.ts                      # JWT token creation/verification
    ├── cookies.ts                  # Cookie management utilities
    └── format.ts                   # Error formatting utilities
```

---

## 🔧 Core Technologies & Dependencies

### Runtime & Framework
- **Express.js (5.2.1)** - Web framework
- **TypeScript (6.0.3)** - Type safety
- **Node.js** - Runtime environment

### Database & ORM
- **Drizzle ORM (0.45.2)** - Type-safe database ORM
- **@neondatabase/serverless (1.1.0)** - PostgreSQL driver (Neon)
- **PostgreSQL** - Primary database

### Authentication & Security
- **jsonwebtoken (9.0.3)** - JWT token generation
- **bcrypt (6.0.0)** - Password hashing
- **helmet (8.1.0)** - Security headers
- **cors (2.8.6)** - CORS middleware
- **cookie-parser (1.4.7)** - Cookie parsing

### Validation & Utilities
- **zod (4.3.6)** - Runtime schema validation
- **dotenv (17.4.2)** - Environment configuration
- **morgan (1.10.1)** - HTTP request logging
- **winston (3.19.0)** - Application logging

### Development Tools
- **tsx (4.21.0)** - TypeScript execution & watch mode
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **drizzle-kit** - Database schema management

---

## 🔄 Data Flow & Request Lifecycle

### User Registration Flow

```
1. Client POST /api/auth/sign-up
   │
2. Routes (auth.routes.ts)
   ├─ Route handler mapped to signup controller
   │
3. Controller (auth.controller.ts)
   ├─ Extract request body
   ├─ Validate using Zod schema
   │
4. Service (auth.service.ts)
   ├─ Check if email already exists
   ├─ Hash password with bcrypt
   ├─ Create user in database
   │
5. Database (Neon PostgreSQL)
   ├─ Insert user record
   ├─ Return user data
   │
6. Controller (continued)
   ├─ Generate JWT token
   ├─ Set HTTP-only cookie
   ├─ Return 201 response with user data
   │
7. Client receives response
```

---

## 📊 Layer Descriptions

### 1. Routes Layer (`src/routes/`)
**Responsibility:** Request routing and HTTP method mapping

**Files:**
- `auth.routes.ts` - Defines:
  - `POST /api/auth/sign-up` → signup controller
  - `POST /api/auth/sign-in` → placeholder
  - `POST /api/auth/sign-out` → placeholder

**Key Feature:** Clean route organization using Express Router

---

### 2. Controller Layer (`src/controllers/`)
**Responsibility:** Handle HTTP requests/responses, request validation

**Files:**
- `auth.controller.ts` - Exports `signup()`
  - Validates request payload with Zod
  - Calls service layer for business logic
  - Handles errors and formats responses
  - Sets JWT cookies
  - Logs operations

---

### 3. Service Layer (`src/service/`)
**Responsibility:** Core business logic, database operations

**Files:**
- `auth.service.ts` - Exports:
  - `hashPassword()` - Bcrypt password hashing (salt rounds: 10)
  - `createUser()` - User creation with duplicate email prevention

**Database Operations:**
- Query existing users by email
- Insert new user records
- Return created user data

---

### 4. Model Layer (`src/models/`)
**Responsibility:** Database schema definitions and utilities

**Files:**
- `user.model.ts` - Defines:
  - `users` PostgreSQL table with Drizzle ORM schema
    - `id` (serial, primary key)
    - `name` (varchar, required)
    - `email` (varchar, unique, required)
    - `password` (varchar, required)
    - `role` (varchar, default: "user")
    - `createdAt` (timestamp, auto-generated)
    - `updated_at` (timestamp, auto-generated)
  
  - `cookies` utility object:
    - `getOptions()` - Security cookie configuration
    - `set()` - Set cookie on response
    - `clear()` - Clear cookie from response

---

### 5. Configuration Layer (`src/config/`)
**Responsibility:** Application setup and initialization

**Files:**
- `database.ts` - Database connection
  - Neon PostgreSQL serverless driver
  - Drizzle ORM initialization
  - Environment variable validation
  
- `logger.ts` - Winston logger setup
  - Structured logging
  - File and console transports

---

### 6. Utilities Layer (`src/utils/`)
**Responsibility:** Reusable helper functions

**Files:**
- `jwt.ts` - JWT token management
  - Token signing with payload
  - Token verification and validation
  
- `cookies.ts` - Cookie handling utilities
  - Cookie creation with security options
  - Cookie deletion
  
- `format.ts` - Error formatting
  - Zod validation error formatting
  - Standardized error responses

---

### 7. Validation Layer (`src/validations/`)
**Responsibility:** Request schema validation

**Files:**
- `auth.validation.ts` - Zod schemas
  - `signUpSchema` - Validates sign-up request body
    - name (string, required)
    - email (string, email format, required)
    - password (string, min length, required)
    - role (string, optional, default: "user")

---

## 🌐 API Endpoints

### Base Endpoints
- **GET** `/` - Health check ("Hello from AcquireFlow!")
- **GET** `/health` - Detailed health status with uptime
- **GET** `/api` - API status ("Acquisitions API is running!")

### Auth Endpoints
- **POST** `/api/auth/sign-up` - User registration (IMPLEMENTED)
  - Request: `{ name, email, password, role? }`
  - Response: `{ message, user: { id, name, email, role } }`
  - Status: 201 (success), 400 (validation), 409 (duplicate), 500 (error)

- **POST** `/api/auth/sign-in` - User login (STUB)
- **POST** `/api/auth/sign-out` - User logout (STUB)

---

## 🔐 Security Features

### Implemented
1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Never stored in plain text

2. **Authentication**
   - JWT token generation
   - Secure HTTP-only cookies
   - Token includes: `id`, `email`, `role`

3. **Cookie Security**
   - `httpOnly: true` - JavaScript cannot access
   - `secure: true` (production only) - HTTPS only
   - `sameSite: strict` - CSRF protection
   - 15-minute expiration

4. **HTTP Security**
   - Helmet.js - Security headers
   - CORS configuration
   - Request validation with Zod

5. **Data Validation**
   - Zod runtime schema validation
   - Type safety with TypeScript
   - Email uniqueness enforcement

---

## 📦 Project Configuration

### Environment Variables Required
```
DB_URL=postgresql://...  # Neon PostgreSQL connection string
NODE_ENV=development     # development or production
PORT=3000               # Server port (optional)
```

### NPM Scripts
```bash
npm run dev              # Development mode with hot reload
npm run build           # Compile TypeScript to JavaScript
npm run start           # Production mode
npm run lint            # Check code with ESLint
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run db:generate     # Generate database migrations
npm run db:migrate      # Apply database migrations
npm run db:studio       # Open Drizzle Studio
```

---

## 🚀 Application Startup Flow

```
1. npm run dev
   └── tsx watch src/index.ts
       │
2. src/index.ts
   ├─ Load .env variables
   ├─ Import server.ts
   │
3. src/server.ts
   ├─ Import Express app
   ├─ Listen on PORT (default: 3000)
   │
4. src/app.ts
   ├─ Initialize Express
   ├─ Configure middleware:
   │  ├─ Helmet (security)
   │  ├─ CORS (cross-origin)
   │  ├─ Cookie Parser
   │  ├─ JSON parser
   │  ├─ URL-encoded parser
   │  └─ Morgan logging
   ├─ Register routes
   │
5. Database Connection
   ├─ Load DB_URL from .env
   ├─ Connect to Neon PostgreSQL
   ├─ Initialize Drizzle ORM
   │
6. Ready to accept requests
```

---

## 🎯 Key Design Patterns

### 1. **Separation of Concerns**
- Routes handle HTTP routing only
- Controllers handle request/response
- Services handle business logic
- Models handle data structure

### 2. **Dependency Injection**
- Database instance injected into services
- Logger injected into controllers/services
- Configuration centralized in config files

### 3. **Error Handling**
- Try-catch in controller and service layers
- Specific error messages for different scenarios
- HTTP status codes appropriately set

### 4. **Validation**
- Request validation at controller level
- Database-level constraints (unique emails)
- Type safety with TypeScript

### 5. **Logging**
- Winston logger for structured logging
- Morgan for HTTP request logging
- Consistent log format across layers

---

## 📈 Current Development Status

### ✅ Completed
- Basic Express server setup
- User registration endpoint (sign-up)
- Password hashing with bcrypt
- JWT token generation
- User model with Drizzle ORM
- Request validation with Zod
- Database connection (Neon PostgreSQL)
- Security middleware (Helmet, CORS)
- Logging infrastructure
- Cookie management
- Error handling

### 🔄 Partially Implemented
- Authentication routes (login, logout stubs only)
- User validation schema

### ⏳ Not Yet Implemented
- Sign-in endpoint logic
- Sign-out endpoint logic
- Password verification
- Token refresh mechanism
- User update/delete operations
- Additional database schemas for acquisitions
- Middleware for JWT verification
- Rate limiting
- API documentation (Swagger/OpenAPI)
- Unit and integration tests

---

## 🔌 Integration Points

### Database
- **Provider:** Neon (PostgreSQL serverless)
- **ORM:** Drizzle ORM
- **Schema:** Defined with TypeScript types
- **Migrations:** Drizzle Kit

### Authentication
- **Token Type:** JWT
- **Storage:** HTTP-only cookies
- **Algorithm:** (Default JWT)
- **Expiration:** 15 minutes

### Logging
- **Provider:** Winston
- **Transports:** Console + File
- **Format:** Structured JSON

### External Services
- None currently integrated

---

## 🧪 Code Quality Tools

### Linting
- **ESLint** with TypeScript support
- **eslint-config-prettier** for code style consistency

### Formatting
- **Prettier** for code formatting
- Configured in `.prettierrc`

### Type Checking
- **TypeScript** with strict mode
- Type definitions for all dependencies

---

## 📝 Code Conventions

### Import Aliases
The project uses path aliases for cleaner imports:
```typescript
import logger from "#config/logger"
import { signup } from "#controllers/auth.controller"
import { createUser } from "#service/auth.service"
```

Instead of:
```typescript
import logger from "../../config/logger"
```

### Naming Conventions
- **Files:** camelCase with clear function names
- **Functions:** camelCase
- **Classes/Types:** PascalCase
- **Constants:** UPPER_CASE
- **Database columns:** snake_case

---

## 🔮 Future Architecture Considerations

### Planned Expansions
1. Add acquisition management features
2. Implement middleware layer for authentication checks
3. Add more database schemas (acquisitions, suppliers, etc.)
4. Implement request/response interceptors
5. Add comprehensive error handling middleware
6. Implement caching layer (Redis)
7. Add message queue (for async operations)
8. Implement file upload handling
9. Add API versioning
10. Implement comprehensive testing suite

### Scalability Considerations
- Current: Single-tier monolithic approach
- Future: Consider microservices if domain grows
- Database: Neon serverless scales automatically
- API: Ready for horizontal scaling with load balancer

---

## 📚 Summary

**AcquireFlow** is a well-structured TypeScript/Express REST API for acquisition management, currently focused on user authentication. The architecture follows best practices with clear layer separation, comprehensive security measures, and modern tooling. The codebase is clean, maintainable, and ready for feature expansion.

**Strengths:**
- Clear layered architecture
- Type safety with TypeScript
- Comprehensive security features
- Proper error handling
- Good code organization
- Scalable foundation

**Next Steps:**
- Implement remaining auth endpoints
- Add JWT middleware for protected routes
- Expand database schema for acquisitions
- Add comprehensive testing
- Implement API documentation

