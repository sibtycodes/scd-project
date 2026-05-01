# AI Startup Validator App

Full-stack Software Construction and Development project using React, Vite, Axios, React Router, Spring Boot, Spring Security, Spring Data JPA, JWT, Lombok, Maven, Supabase PostgreSQL, and Groq API.

## Project Structure

```text
backend/   Spring Boot API
frontend/  React Vite app
```

## Required Environment Variables

The backend reads these values from environment variables:

```text
SUPABASE_DB_URL=jdbc:postgresql://your-supabase-host:5432/postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your-database-password
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
SERVER_PORT=8080
```

The frontend reads:

```text
VITE_API_BASE_URL=http://localhost:8080
```

## Run Backend Locally

Install Java 17 and Maven, then set environment variables in PowerShell:

```powershell
$env:SUPABASE_DB_URL="jdbc:postgresql://your-supabase-host:5432/postgres"
$env:SUPABASE_DB_USERNAME="postgres"
$env:SUPABASE_DB_PASSWORD="your-database-password"
$env:GROQ_API_KEY="your-groq-api-key"
$env:GROQ_MODEL="llama-3.1-8b-instant"
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
$env:SERVER_PORT="8080"
```

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

## Run Frontend Locally

Create `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Install dependencies and start Vite:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Summary

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/validations`
- `GET /api/validations`
- `GET /api/validations/{id}`

All validation endpoints require:

```text
Authorization: Bearer <jwt-token>
```
