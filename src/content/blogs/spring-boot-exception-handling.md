# Stop Letting Exceptions Embarrass You in Production
## A Developer's Guide to Exception Handling in Spring Boot

> *You spent weeks building a beautiful REST API. Clean endpoints, solid business logic, JWT secured. Then a user hits a missing resource — and they get a stack trace dumped straight into the response body. Game over.*

Exception handling isn't glamorous. Nobody puts it on their resume headline. But done right, it's what separates a **professional API** from a weekend project.

Let's fix that — properly.

---

## The Problem With Default Spring Boot Error Responses

Out of the box, Spring Boot uses `BasicErrorController` to handle exceptions. The response looks something like this:

```json
{
  "timestamp": "2025-06-07T10:30:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/99"
}
```

Not terrible, but not great either. It leaks internal details, gives clients no actionable info, and the format is inconsistent across different error types.

We can do much better.

---

## Step 1 — Define a Consistent Error Response Structure

Before writing a single exception handler, decide on a **uniform error response contract**. Your API consumers (frontend devs, mobile teams, third-party integrators) will thank you.

```java
public class ApiError {

    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;

    // constructors, getters, setters
}
```

Every error your API returns should look like this. Consistency is everything.

---

## Step 2 — Custom Exceptions That Mean Something

Generic `RuntimeException` tells you nothing. Define domain-specific exceptions that carry intent:

```java
// 404 - Resource not found
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }
}

// 409 - Business rule conflict
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

// 400 - Invalid business operation
public class InvalidOperationException extends RuntimeException {
    public InvalidOperationException(String message) {
        super(message);
    }
}
```

When you read `ResourceNotFoundException` in a stack trace, you immediately know *what went wrong* and *where to look*. That's the goal.

---

## Step 3 — The Heart of It: `@RestControllerAdvice`

This is where it all comes together. `@RestControllerAdvice` is a global exception interceptor — it catches exceptions thrown anywhere in your application and maps them to meaningful HTTP responses.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ApiError error = new ApiError(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {

        ApiError error = new ApiError(
            HttpStatus.CONFLICT.value(),
            "Conflict",
            ex.getMessage(),
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(
            Exception ex, HttpServletRequest request) {

        ApiError error = new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "Something went wrong. Please try again later.",
            request.getRequestURI(),
            LocalDateTime.now()
        );

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

> ⚠️ **Golden Rule:** Never expose raw exception messages in the generic handler. `ex.getMessage()` on an unexpected exception can leak SQL queries, file paths, or config details. Log it internally, return a safe message externally.

---

## Step 4 — Handling Validation Errors

When you use `@Valid` on request bodies, Spring throws `MethodArgumentNotValidException` for bean validation failures. These need special treatment — there are *multiple* field errors, not just one.

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidationErrors(
        MethodArgumentNotValidException ex, HttpServletRequest request) {

    Map<String, String> fieldErrors = new LinkedHashMap<>();

    ex.getBindingResult().getFieldErrors().forEach(err ->
        fieldErrors.put(err.getField(), err.getDefaultMessage())
    );

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("status", 400);
    response.put("error", "Validation Failed");
    response.put("errors", fieldErrors);
    response.put("path", request.getRequestURI());
    response.put("timestamp", LocalDateTime.now());

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
}
```

The response now looks like this — clear, actionable, frontend-friendly:

```json
{
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "email": "must be a valid email address",
    "password": "size must be between 8 and 64"
  },
  "path": "/api/auth/register",
  "timestamp": "2025-06-07T10:30:00"
}
```

---

## Step 5 — Securing the Spring Security Exception Path

Here's something most tutorials skip: Spring Security exceptions like `AccessDeniedException` and `AuthenticationException` are handled *before* your `@RestControllerAdvice` even gets a chance to run. They need separate entry points.

```java
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = Map.of(
            "status", 401,
            "error", "Unauthorized",
            "message", "Authentication required to access this resource",
            "path", request.getRequestURI()
        );

        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
```

```java
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = Map.of(
            "status", 403,
            "error", "Forbidden",
            "message", "You don't have permission to access this resource",
            "path", request.getRequestURI()
        );

        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
```

Wire them in your `SecurityFilterChain`:

```java
http.exceptionHandling(ex -> ex
    .authenticationEntryPoint(customAuthenticationEntryPoint)
    .accessDeniedHandler(customAccessDeniedHandler)
);
```

---

## Step 6 — Log Smartly, Not Loudly

Exception handling is incomplete without logging. But logging everything at `ERROR` level is just as bad as logging nothing — it creates noise that hides real problems.

```java
private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

// Expected business exceptions — just INFO
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex, ...) {
    log.info("Resource not found: {}", ex.getMessage());
    // ...
}

// Unexpected exceptions — full stack trace at ERROR
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiError> handleGenericException(Exception ex, ...) {
    log.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
    // ...
}
```

**Log levels that actually mean something:**
- `DEBUG` — development noise, turned off in prod
- `INFO` — expected business events (not found, duplicate, invalid)
- `WARN` — degraded but recoverable states
- `ERROR` — unexpected failures that need attention *now*

---

## The Full Picture — Exception Hierarchy Design

```
RuntimeException
│
├── ResourceNotFoundException       → 404 Not Found
├── DuplicateResourceException      → 409 Conflict
├── InvalidOperationException       → 400 Bad Request
├── BusinessRuleViolationException  → 422 Unprocessable Entity
│
├── (Spring) AuthenticationException  → 401 Unauthorized
├── (Spring) AccessDeniedException    → 403 Forbidden
│
└── Exception (catch-all)            → 500 Internal Server Error
```

Map each exception to exactly one HTTP status. Never let ambiguity creep in.

---

## Quick Reference — Exception to HTTP Status Mapping

| Exception | HTTP Status | When to Use |
|---|---|---|
| `ResourceNotFoundException` | 404 Not Found | Entity doesn't exist in DB |
| `DuplicateResourceException` | 409 Conflict | Email/username already taken |
| `InvalidOperationException` | 400 Bad Request | Invalid business operation |
| `MethodArgumentNotValidException` | 400 Bad Request | `@Valid` bean validation fails |
| `AuthenticationException` | 401 Unauthorized | No/invalid token |
| `AccessDeniedException` | 403 Forbidden | Valid token, wrong role |
| `Exception` (catch-all) | 500 Internal Server Error | Anything unexpected |

---

## What Good Exception Handling Actually Achieves

**For your API consumers** — they get a predictable, structured response they can programmatically handle, not a wall of HTML or a raw stack trace.

**For your teammates** — meaningful exception names make code self-documenting. `throw new ResourceNotFoundException("User", id)` tells the whole story.

**For production debugging** — structured logs with the right levels mean you find real problems fast, without drowning in noise.

**For security** — sensitive internal details (DB queries, file paths, config values) never reach the client response body.

---

## Key Takeaways

- Use `@RestControllerAdvice` + `@ExceptionHandler` for centralized, global exception handling
- Define custom exceptions per domain concern — resist the urge to throw generic `RuntimeException`
- Always return a consistent `ApiError` structure across every error response
- Handle `MethodArgumentNotValidException` separately to surface field-level validation errors
- Implement `AuthenticationEntryPoint` and `AccessDeniedHandler` for Spring Security exceptions — `@RestControllerAdvice` won't catch them
- Log expected exceptions at `INFO`, unexpected ones at `ERROR` with full stack traces
- Never leak internal error details in the generic catch-all handler

---

*Exception handling is a first-class citizen of API design. Build it right from day one — your future self will be grateful at 2 AM when production alerts fire.*