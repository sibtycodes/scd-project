# AI Startup Validator — Project Documentation

## 1. Problem Understanding

The AI Startup Validator app helps early-stage founders and product teams validate startup ideas with structured feedback, AI insights, and risk assessments. The system must:

- Collect startup information through a guided form.
- Authenticate users and protect reports.
- Generate AI-driven validation results and scores.
- Store validation history securely in a database.
- Provide a dashboard experience that separates idea creation, report browsing, and detail views.
- Keep local user preferences separate from server-side auth.
- Support a future report download feature from a single validation page.

This project addresses the need for a simple, secure, modern full-stack web app that blends responsive React frontend UI with a Spring Boot backend and Supabase PostgreSQL persistence.

## 2. System Design

### 2.1 High-level architecture

The system is a two-tier full-stack application:

- `frontend/`: React application built with Vite, React Router, Axios, and a lightweight auth context.
- `backend/`: Spring Boot REST API with Spring Security, JWT authentication, Spring Data JPA, and Groq AI integration.

Authentication and API access are separated from the local frontend preference system, enabling the upcoming report download feature to coexist with separate Supabase or auth flows.

### 2.2 Components

Frontend:
- `App.jsx` — route definitions and protected route wrapper.
- `AuthContext.jsx` — token and user state management via localStorage.
- `PageHeader.jsx` — top navigation bar with user actions.
- `DashboardLayout.jsx` + `DashboardSidebar.jsx` — authenticated layout and sidebar.
- `DashboardPage.jsx` — main validation creation and overview.
- `ValidationsPage.jsx` — list of saved validation reports.
- `ValidationDetailPage.jsx` — single report detail view.
- `axios.js` — shared API client with auth request interceptor.

Backend:
- `AuthController.java` — signup and login endpoints.
- `UserController.java` — user profile endpoints for authenticated sessions.
- `StartupValidationController.java` — validation creation and retrieval.
- `AuthService.java` — signup/login business logic.
- `UserService.java` — profile operations and password change.
- `StartupValidationService.java` — validation persistence and AI insight generation.
- `SecurityConfig.java` — Spring Security and CORS setup.
- `JwtAuthenticationFilter.java` — JWT token validation filter.
- `CustomUserDetailsService.java` — user lookup for Spring Security.

## 3. Implementation

### 3.1 Frontend implementation

The frontend uses React functional components and hooks.

- `AuthContext` stores JWT token and sanitized user data in localStorage.
- Axios attaches `Authorization: Bearer <token>` to every request.
- `ProtectedRoute` redirects unauthenticated users to `/login`.
- The dashboard layout wraps protected pages and displays common navigation.
- The validation form on `/dashboard` submits startup data to `/api/validations`.
- `ValidationsPage` fetches the user’s validation history and displays cards.
- `ValidationDetailPage` loads a single report by ID and shows insight fields.

### 3.2 Backend implementation

The backend is a Spring Boot app with JWT-based stateless auth.

- `AuthController` provides `/api/auth/signup` and `/api/auth/login`.
- `JwtService` generates and validates tokens using a secret key.
- `JwtAuthenticationFilter` verifies incoming tokens and populates the security context.
- `SecurityConfig` protects `/api/**` except `/api/auth/**` and allows CORS from the configured frontend origin.
- `StartupValidationService` links validations to the authenticated user and saves AI results.

### 3.3 Validation flow

1. User logs in or signs up.
2. Frontend saves `token` and `user` in localStorage.
3. User submits a startup validation on `/dashboard`.
4. Frontend posts to `/api/validations`.
5. Backend validates the user from the JWT, calls Groq AI service, stores the result, and returns the report.
6. The frontend displays the new insights and adds the report to the viewport.

## 4. Development

### 4.1 Setup

Backend:
- Java 17 and Maven are required.
- Environment variables are loaded from system env or `.env`.
- Use `mvn spring-boot:run` from `backend/`.

Frontend:
- Node.js and npm are required.
- Use `npm install` in `frontend/`.
- `npm run dev` starts the Vite development server.

### 4.2 Environment configuration

Backend expects these vars:
- `SUPABASE_DB_URL`
- `SUPABASE_DB_USERNAME`
- `SUPABASE_DB_PASSWORD`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `JWT_SECRET`
- `SERVER_PORT`
- `FRONTEND_URL`

Frontend expects:
- `VITE_API_BASE_URL`

### 4.3 Testing and iteration

- Use the browser’s network inspector to verify API requests and JWT headers.
- Confirm that `Authorization` is present on protected calls.
- Use localStorage to inspect `token` and `user` values during development.

## 5. Database Handling

### 5.1 Entities

`AppUser`:
- `id`
- `username`
- `email`
- `password`
- `createdAt`
- relationship to validations

`StartupValidation`:
- `id`
- `startupName`
- `industry`
- `location`
- `stage`
- `teamSize`
- `fundingStage`
- `targetAudience`
- `problemStatement`
- `proposedSolution`
- `uniqueValueProposition`
- `competition`
- `traction`
- `goToMarket`
- `revenueModel`
- `pricing`
- `timeline`
- `aiFeedback`
- `aiInsights`
- `createdAt`
- `user`

### 5.2 Persistence

- Spring Data JPA repositories persist entities to a PostgreSQL database.
- `StartupValidationRepository` queries reports by user and by ID.
- The application uses `spring.jpa.hibernate.ddl-auto=update` for schema auto-update during development.

### 5.3 Data model notes

- `aiInsights` is stored as JSON text and parsed into Java DTOs for frontend consumption.
- Each validation report belongs to the authenticated user to prevent cross-user access.

## 6. Security

### 6.1 Authentication

- Login produces a JWT token with an email subject.
- The frontend stores the token in localStorage.
- Axios adds the token to each API request.
- Spring Security validates the token and rejects invalid or expired requests.

### 6.2 Authorization

- Endpoints under `/api/validations` and `/api/users` require authentication.
- Only the authenticated user can access their own validation reports.

### 6.3 Password handling

- Passwords are hashed with `BCryptPasswordEncoder` before storage.
- Password change verifies the current password before updating.

### 6.4 CORS and headers

- `SecurityConfig` sets CORS to allow the configured frontend origin.
- Allowed methods include `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS`.

## 7. Documentation

This document is intended to capture the app’s architecture, design decisions, and implementation details. It should be kept alongside `README.md` as a deeper project reference.

### 7.1 README vs documentation

- `README.md` is a quick start guide for running and understanding the app.
- `documentation.md` is an extended design and implementation overview for maintainers.

### 7.2 Future report download feature

A future enhancement will add a download button on the validation detail page that generates a report file. Suggested implementation:
- backend endpoint such as `GET /api/validations/{id}/report` returns PDF or JSON.
- frontend button triggers the download via an Axios `blob` response.
- ensure auth and ownership checks remain in place.

## 8. README

The existing `README.md` already covers:
- project overview
- structure
- environment variables
- run instructions
- API summary

This documentation extends it with deeper design and implementation notes.

## 9. Diagrams (described in English)

### 9.1 Architecture diagram

- A user in a browser interacts with the React frontend.
- The frontend sends API requests to the Spring Boot backend.
- The backend validates JWT tokens and queries the PostgreSQL database.
- The backend also calls the Groq AI service for validation insight generation.
- The database stores users and validation reports.

### 9.2 Component diagram

- Frontend components include `AuthContext`, `PageHeader`, `DashboardLayout`, `DashboardPage`, `ValidationsPage`, `ValidationDetailPage`, and `axios`.
- Backend components include controllers, services, repositories, security filters, and JWT helpers.
- The flow shows `AuthController` for auth, `UserController` for profile, and `StartupValidationController` for report data.

### 9.3 Data flow diagram

- Login/signup request -> backend auth service -> user repository -> JWT returned.
- Validation request -> auth filter -> validation service -> Groq AI -> database save -> response.
- Fetch history -> auth filter -> repository -> frontend list render.
- Fetch single report -> auth filter -> repository -> detail render.

## 10. Explanation

The app uses classic separation of concerns:
- frontend handles UI, routing, state, and local settings.
- backend handles authentication, persistence, AI integration, and authorization.
- JWT is the gateway for protected operations.

This structure supports later expansion, such as the planned report download feature, because the protected API and frontend layout are already modular.

## 11. Notes and next steps

- Remove any stale settings page references after auth separation.
- Add the report download endpoint and frontend button behavior.
- Consider implementing refresh tokens or shorter/longer JWT expiration depending on the desired session model.
- Keep localStorage usage limited to auth state and client-only preferences.

---

End of documentation.
