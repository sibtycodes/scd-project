# Quick Setup Guide

## 🔑 Environment Variables (Copy-Paste Ready)

Run this in PowerShell BEFORE starting the backend:

```powershell
# Database Configuration (Supabase)
$env:SUPABASE_DB_URL="jdbc:postgresql://your-supabase-host:5432/postgres"
$env:SUPABASE_DB_USERNAME="postgres"
$env:SUPABASE_DB_PASSWORD="your-database-password"

# AI Service (Groq)
$env:GROQ_API_KEY="your-groq-api-key"
$env:GROQ_MODEL="llama-3.1-8b-instant"

# Authentication
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"

# Server Configuration
$env:SERVER_PORT="8080"
$env:FRONTEND_URL="http://localhost:5173"
```

## 🎯 Backend: Maven/Spring Boot

### Clean Build & Run
```powershell
cd backend
mvn clean
mvn install
mvn spring-boot:run
```

### Expected Output
```
Started StartupValidatorApplication in X.XXX seconds
Server is running on port 8080
```

### Common Errors & Fixes

**Error:** `Caused by: org.postgresql.util.PSQLException: Connection refused`
- **Fix:** Check `SUPABASE_DB_URL`, username, password are correct

**Error:** `IllegalArgumentException: JWT_SECRET must be at least 32 characters long`
- **Fix:** Set a longer `JWT_SECRET` (minimum 32 chars)

**Error:** `401 Unauthorized` on API calls
- **Fix:** Ensure `GROQ_API_KEY` is valid and token is being sent

## 🎨 Frontend: React + Vite

### Install & Run
```powershell
cd frontend
npm install
npm run dev
```

### Expected Output
```
  VITE v8.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## ✅ Test the Full Flow

1. Open http://localhost:5173
2. Click "Create an account"
3. Fill form and sign up
4. Login with credentials
5. Submit a startup idea
6. View AI feedback

---

## 📊 Health Checks

### Backend Endpoints
```powershell
# Health check (no auth required)
curl http://localhost:8080/actuator/health

# Auth endpoints (no auth required)
curl -X POST http://localhost:8080/api/auth/login -d "..."

# Validation endpoints (auth required)
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/validations
```

### Frontend
- Console should show no CORS errors
- Network tab should show requests to http://localhost:8080/api/*
- Token should appear in localStorage under "token" key

---

## 🔐 Getting API Keys

### Supabase PostgreSQL
1. Go to supabase.com
2. Create new project
3. Copy connection string from Settings → Database

### Groq API
1. Go to console.groq.com
2. Sign up (free)
3. Create API key
4. Use "llama-3.1-8b-instant" model

### JWT Secret
Generate on Windows PowerShell:
```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Host $secret
```

---

