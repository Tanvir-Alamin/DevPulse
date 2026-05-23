# 🚀 DevPulse – Internal Issue Tracker API

DevPulse is a backend system for managing bugs, feature requests, and team collaboration. It allows users to create issues, track them, and manage workflows with role-based access control.

---

## Live Link - https://dev-pulse-sigma-sage.vercel.app/

## 📌 Features

- 🔐 JWT Authentication (Signup & Login)
- 👥 Role-based access (Contributor, Maintainer)
- 🐞 Create, update, delete issues
- 📄 View all issues with sorting & filtering
- 🔍 View single issue details
- 🧑 Reporter data included without SQL JOIN
- ⚡ Secure password hashing using bcrypt
- 🗄️ PostgreSQL database using raw SQL (pg driver)

---

## 🛠️ Tech Stack

- Node.js (LTS)
- TypeScript
- Express.js
- PostgreSQL
- pg (native driver)
- bcrypt
- jsonwebtoken
- cors
- dotenv

---

## 📁 Project Structure

src/\
├── config/\
├── db/\
├── middleware/\
├── modules/\
│ ├── auth/\
│ ├── issue/\
├── utils/\
├── app.ts\
├── server.ts

---

## 🗄️ Database Schema

### Users Table

- id (SERIAL PRIMARY KEY)
- name (VARCHAR NOT NULL)
- email (UNIQUE NOT NULL)
- password (TEXT NOT NULL)
- role (contributor | maintainer DEFAULT contributor)
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

### Issues Table

- id (SERIAL PRIMARY KEY)
- title (VARCHAR NOT NULL)
- description (TEXT NOT NULL)
- type (bug | feature_request)
- status (open | in_progress | resolved DEFAULT open)
- reporter_id (INTEGER)
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

---

## 🔐 Authentication Flow

1. User registers → `/api/auth/signup`
2. User logs in → `/api/auth/login`
3. Server returns JWT token
4. Token must be sent in headers:

Authorization: <JWT_TOKEN>

---

## 📡 API Endpoints

### Auth

POST /api/auth/signup
POST /api/auth/login

---

### Issues

POST /api/issues
GET /api/issues?sort=newest&type=bug&status=open
GET /api/issues/:id
PATCH /api/issues/:id
DELETE /api/issues/:id

---

## 🔍 Query Parameters

- sort: newest | oldest
- type: bug | feature_request
- status: open | in_progress | resolved

---

## ⚙️ Setup Instructions

### 1. Clone repository

git clone https://github.com/Tanvir-Alamin/DevPulse

### 2. Install dependencies

npm install

### 3. Create .env file

PORT=5000\
DATABASE_URL=your_postgres_connection_string\
JWT_SECRET=your_jwt_secret

### 4. Run project

npm run dev

---

## 🌐 Deployment

- Backend: Render / Railway / Vercel
- Database: NeonDB / Supabase / ElephantSQL

---

## 🔒 Security

- Password hashing using bcrypt
- JWT authentication
- Role-based authorization
- CORS enabled for frontend communication

---

## 🎯 Author

Built as part of B7A2 Assignment – DevPulse Backend System
