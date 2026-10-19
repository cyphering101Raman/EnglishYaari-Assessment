# Teacher-Student Session Booking REST API

A production-ready REST API application built with **Node.js, TypeScript, Express.js, MongoDB, and Mongoose**.

---

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js
- **Database:** MongoDB & Mongoose (ODM)

---

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (default: `mongodb://localhost:27017/english_yaari`) or MongoDB Atlas URI

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/english_yaari
NODE_ENV=development
```

### 3. Run the Application
- **Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Build production bundle:**
  ```bash
  npm run build
  ```
- **Start production server:**
  ```bash
  npm start
  ```

---

## Database Schemas

### 1. User (`users`)
- `fullName`: String (required)
- `email`: String (required, unique, lowercase)
- `phone`: String (required)
- `createdAt`, `updatedAt`: Timestamps

### 2. Teacher (`teachers`)
- `fullName`: String (required)
- `email`: String (required, unique, lowercase)
- `specialization`: String (required)
- `experience`: Number (in years, required)
- `createdAt`, `updatedAt`: Timestamps

### 3. Session (`sessions`)
- `teacherId`: ObjectId (ref: Teacher, required, indexed)
- `userId`: ObjectId | null (ref: User, default: null, indexed)
- `startTime`: Date (required, indexed)
- `endTime`: Date (required)
- `status`: String enum (`AVAILABLE` | `BOOKED` | `COMPLETED`, default: `AVAILABLE`, indexed)
- `completedAt`: Date | null (default: null)
- `createdAt`, `updatedAt`: Timestamps

---

## API Endpoints

### Health Check
- **`GET /health`** - Check API server uptime and health.

---

### User Endpoints
#### 1. Create User
- **`POST /users`**
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "_id": "670f...",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

#### 2. User Session List
- **`GET /users/:id/sessions`**
- *Mandatory implementation: MongoDB Aggregation Pipeline (`$facet`)*
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User sessions retrieved successfully",
    "data": {
      "upcomingSessions": [
        {
          "_id": "670f...",
          "teacherId": "670e...",
          "userId": "670f...",
          "startTime": "2026-10-25T10:00:00.000Z",
          "endTime": "2026-10-25T11:00:00.000Z",
          "status": "BOOKED",
          "teacher": {
            "fullName": "Jane Smith",
            "specialization": "English Grammar"
          }
        }
      ],
      "completedSessions": []
    }
  }
  ```

---

### Teacher Endpoints (Helper)
- **`POST /teachers`** - Create a teacher.
- **`GET /teachers`** - List all teachers.

---

### Session Endpoints
#### 1. Create Session
- **`POST /sessions`**
- **Rules:**
  - Teacher must exist in the database.
  - `endTime` must be strictly greater than `startTime`.
  - Default status is `AVAILABLE`.
- **Body:**
  ```json
  {
    "teacherId": "670e...",
    "startTime": "2026-10-25T10:00:00.000Z",
    "endTime": "2026-10-25T11:00:00.000Z"
  }
  ```
- **Response (201 Created)**

#### 2. Available Sessions for Booking
- **`GET /sessions/available?dateTimestamp={timestamp}`**
- *Mandatory implementation: MongoDB Aggregation Pipeline*
- Filters sessions where `status === 'AVAILABLE'` and `startTime` falls within the target date.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Available sessions retrieved successfully",
    "count": 1,
    "data": [
      {
        "_id": "670f...",
        "teacherId": "670e...",
        "startTime": "2026-10-25T10:00:00.000Z",
        "endTime": "2026-10-25T11:00:00.000Z",
        "status": "AVAILABLE",
        "teacher": {
          "_id": "670e...",
          "fullName": "Jane Smith",
          "specialization": "English Grammar & Fluency"
        }
      }
    ]
  }
  ```

#### 3. Book Session
- **`POST /sessions/:id/book`**
- **Rules:**
  - User must exist.
  - Session must exist.
  - Only `AVAILABLE` sessions can be booked.
  - A booked session cannot be booked again (atomic update concurrency protection).
  - Updates status to `BOOKED` and links `userId`.
- **Body:**
  ```json
  {
    "userId": "670f..."
  }
  ```
- **Response (200 OK)**

#### 4. Mark Session Complete
- **`PATCH /sessions/:id/complete`**
- **Rules:**
  - Session must exist.
  - Only `BOOKED` sessions can be marked as completed.
  - Updates status to `COMPLETED` and sets `completedAt`.
- **Response (200 OK)**

---

## Postman Collection
Import `postman_collection.json` located in `backend/postman_collection.json` into Postman to test all endpoints.
