# Bugs Found & Fixes Required

## 🐛 Bug #1: Email Case Sensitivity Issue
**Severity:** MEDIUM  
**Files:** `JwtService.java`, `AuthService.java`, `CustomUserDetailsService.java`

### Problem
Email normalization is inconsistent. Some services lowercase email, others don't.

```java
// AuthService.java (Line 40)
String email = request.getEmail().toLowerCase(); // ✅ Lowercases

// CustomUserDetailsService.java (Line 19)  
AppUser appUser = userRepository.findByEmail(email.toLowerCase()) // ✅ Lowercases

// JwtService.java (Line 25)
public String generateToken(String email) {
    // ❌ Email not normalized - directly uses as subject
    return Jwts.builder()
            .subject(email)  // ← Could be any case
            ...
}

// JwtService.java (Line 28)
public String extractEmail(String token) {
    return extractAllClaims(token).getSubject(); // ❌ Returns whatever case was stored
}
```

### Impact
Token validation may fail if email case changes between login and validation.

### Fix
```java
// In JwtService.java - normalize email in both generate and extract

public String generateToken(String email) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expirationMs);

    return Jwts.builder()
            .subject(email.toLowerCase())  // ✅ Add lowercase
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey())
            .compact();
}

public String extractEmail(String token) {
    return extractAllClaims(token).getSubject().toLowerCase(); // ✅ Add lowercase
}
```

---

## 🐛 Bug #2: JWT Token Expiration Exception
**Severity:** MEDIUM  
**File:** `JwtService.java` Line 51-54

### Problem
```java
private boolean isTokenExpired(String token) {
    return extractAllClaims(token).getExpiration().before(new Date()); // ❌ Bug here
}
```

If token is expired, `extractAllClaims()` throws `JwtException` BEFORE checking expiration.  
This causes 500 Internal Server Error instead of 401 Unauthorized.

### Impact
Users get confusing error messages; security vulnerability as internal exceptions are exposed.

### Fix
```java
private boolean isTokenExpired(String token) {
    try {
        return extractAllClaims(token).getExpiration().before(new Date());
    } catch (JwtException | IllegalArgumentException e) {
        return true; // ✅ Treat expired/invalid tokens as expired
    }
}

// Or better yet, handle in isTokenValid():

public boolean isTokenValid(String token, UserDetails userDetails) {
    try {
        String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    } catch (JwtException | IllegalArgumentException e) {
        return false; // ✅ Invalid token
    }
}
```

---

## 🐛 Bug #3: Missing Validation Annotations
**Severity:** LOW-MEDIUM  
**File:** `StartupValidationRequest.java`

### Problem
```java
@Data
public class StartupValidationRequest {
    // ❌ Missing @NotBlank annotations
    private String startupName;
    private String industry;
    private String targetAudience;
    private String problemStatement;
    private String proposedSolution;
    private String revenueModel;
}
```

API accepts empty or whitespace-only values. Groq API will receive blank input.

### Impact
Wasted API calls to Groq with empty data; poor user experience.

### Fix
```java
@Data
public class StartupValidationRequest {
    @NotBlank(message = "Startup name is required")
    private String startupName;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Target audience is required")
    private String targetAudience;

    @NotBlank(message = "Problem statement is required")
    private String problemStatement;

    @NotBlank(message = "Proposed solution is required")
    private String proposedSolution;

    @NotBlank(message = "Revenue model is required")
    private String revenueModel;
}
```

---

## 🐛 Bug #4: No Token Expiration Handling in Frontend
**Severity:** MEDIUM  
**File:** `AuthContext.jsx`

### Problem
```javascript
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // ❌ No check if token is expired
  // ❌ No automatic logout on 401
}
```

If token expires, frontend still thinks user is authenticated. API calls will fail with 401.

### Impact
Users see broken app after token expires; no graceful handling.

### Fix
```javascript
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    // ✅ Check if token is expired
    if (savedToken && isTokenExpired(savedToken)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return savedToken;
  });

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // ... rest of code
}
```

Also add interceptor in axios to handle 401:

```javascript
// frontend/src/api/axios.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // ✅ Handle expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🐛 Bug #5: CORS Allowed Origin Property Name Mismatch
**Severity:** LOW  
**Files:** `application.properties`, `SecurityConfig.java`, `README.md`

### Problem
```properties
# application.properties (Line 16)
app.cors.allowed-origin=${FRONTEND_URL:http://localhost:5173}
# ❌ Property expects FRONTEND_URL env var but it's not documented
```

### Impact
Works but confusing; default value masks missing env var configuration.

### Fix - Option 1: Update property name
```properties
app.cors.allowed-origin=${APP_CORS_ALLOWED_ORIGIN:http://localhost:5173}
```

### Fix - Option 2: Update env var name
Rename env variable from `FRONTEND_URL` to `APP_CORS_ALLOWED_ORIGIN` for clarity.

**Recommended:** Use more explicit property name.

---

## 🐛 Bug #6: No Pagination on Validations Endpoint
**Severity:** LOW-MEDIUM  
**Files:** `StartupValidationService.java`, `StartupValidationController.java`

### Problem
```java
// StartupValidationService.java
public List<StartupValidationResponse> getMyValidations() {
    AppUser user = getLoggedInUser();
    return validationRepository.findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(StartupValidationResponse::fromEntity)
            .toList(); // ❌ Returns ALL results, no limit
}
```

### Impact
If user has 1000 validations, all load at once - memory issue, slow response.

### Fix
```java
// Add pagination support
@GetMapping
public ResponseEntity<Page<StartupValidationResponse>> getMyValidations(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
) {
    AppUser user = getLoggedInUser();
    PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
    
    Page<StartupValidation> validations = validationRepository.findByUser(user, pageRequest);
    return ResponseEntity.ok(validations.map(StartupValidationResponse::fromEntity));
}
```

Also update repository:
```java
// StartupValidationRepository.java
Page<StartupValidation> findByUser(AppUser user, Pageable pageable);
```

---

## 📋 Checklist of Fixes to Apply

- [ ] Add `.toLowerCase()` to `JwtService.generateToken()` and `extractEmail()`
- [ ] Add try-catch to JWT expiration check or move to `isTokenValid()`
- [ ] Add `@NotBlank` annotations to `StartupValidationRequest`
- [ ] Add token expiration check to frontend `AuthContext`
- [ ] Add axios 401 interceptor in frontend
- [ ] Add pagination to `/api/validations` endpoint
- [ ] Update CORS property name or documentation
- [ ] Add logging configuration to `application.properties`

---

## 🧪 Testing These Fixes

### Test 1: Email Case Sensitivity
```powershell
# Login with uppercase email
POST http://localhost:8080/api/auth/login
{
  "email": "USER@EXAMPLE.COM",  # uppercase
  "password": "password123"
}

# Token should still validate subsequent requests
GET http://localhost:8080/api/validations
Authorization: Bearer <token>
```

### Test 2: Expired Token Handling
```javascript
// Frontend - override token with expired one
localStorage.setItem('token', 'eyJhbGc...');  // expired token

// Try to make API call - should redirect to login
api.get('/validations');  // Should be intercepted and redirect
```

### Test 3: Empty Validation Request
```powershell
POST http://localhost:8080/api/validations
Authorization: Bearer <token>
{
  "startupName": "   ",  # whitespace only
  "industry": "",        # empty
  ...
}

# Should return 400 Bad Request with validation errors
```

