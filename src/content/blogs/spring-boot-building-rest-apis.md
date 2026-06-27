## Request to Response, Routing to Validation, Exception Handling to Pagination

> *A REST API is a contract. Your clients — mobile apps, frontends, third-party integrators — depend on that contract being predictable, consistent, and honest about errors. Spring Boot gives you the machinery to build that contract in hours rather than weeks. This post covers every layer of it, from the first `@RestController` to production-grade pagination, validation, and global error handling — and more importantly, explains the reasoning behind every decision.*

---

<a id="ch1"></a>
## Chapter 1 — What REST Actually Means

REST stands for **Representational State Transfer** — an architectural style, not a protocol or a standard. It was defined by Roy Fielding in his 2000 doctoral dissertation, and it describes a set of constraints that, when followed, make distributed systems scalable, simple, and interoperable. What most developers call a "REST API" is really an HTTP API that follows RESTful principles — and understanding those principles is what separates someone who writes controllers from someone who designs APIs.

The central idea in REST is the **resource**. A resource is any named entity your system cares about — an employee, an order, a product, a booking. Resources are represented as URLs, and HTTP methods express what you want to do with them. You don't design endpoints around actions (`/getEmployee`, `/createOrder`, `/deleteUser`) — you design them around resources (`/employees`, `/orders`, `/users`) and let HTTP verbs carry the action.

```
HTTP Method     Meaning                        Idempotent?   Safe?
──────────────────────────────────────────────────────────────────
GET             Read a resource                  Yes           Yes
POST            Create a new resource            No            No
PUT             Replace a resource entirely      Yes           No
PATCH           Partially update a resource      No            No
DELETE          Remove a resource                Yes           No
```

Two properties matter here. **Idempotency** means calling the same operation multiple times produces the same result as calling it once. `DELETE /employees/1` three times leaves the system in the same state as calling it once — the employee is gone either way. `POST /employees` three times creates three separate employees. **Safety** means the operation doesn't modify any state — a `GET` should never have side effects, which is why browsers can safely retry a failed GET but will warn you before retrying a failed POST on a form.

REST also carries the concept of **statelessness** — every request from a client must contain all information the server needs to process it. The server holds no session state between requests. This is why token-based authentication (JWT) fits REST naturally: the client sends its identity on every request rather than relying on the server to remember it from a previous session. Statelessness is what makes REST APIs horizontally scalable — any server instance can handle any request, because no request depends on a previous one being handled by the same server.

Understanding these constraints isn't academic. When you're debating whether to use `PUT` or `PATCH`, whether to put a filter in the URL or the request body, or whether to return `200` or `201` — you're applying these constraints. Getting them right means your API behaves the way every HTTP client, proxy, cache, and load balancer already expects it to.

---

<a id="ch2"></a>
## Chapter 2 — Project Setup: The Right Dependencies

Go to [start.spring.io](https://start.spring.io) and select:

```
Project:      Maven
Language:     Java
Spring Boot:  4.x (latest stable)
Java:         21 or 25

Dependencies:
  ✓ Spring Web
  ✓ Spring Data JPA
  ✓ PostgreSQL Driver
  ✓ Validation
  ✓ Lombok
```

The resulting `pom.xml` core:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

And `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo
    username: postgres
    password: secret
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
server:
  port: 8080
```

> ⚠️ Never use `ddl-auto: update` or `create` in production. Use Flyway or Liquibase for schema migrations. `validate` makes Hibernate check that your entity mappings match the actual schema without touching the database.

---

<a id="ch3"></a>
## Chapter 3 — Your First Controller: `@RestController`

Spring MVC is built around the **Front Controller pattern** — a single entry point (`DispatcherServlet`) receives all HTTP requests and dispatches them to the appropriate handler. Your `@RestController` classes are those handlers. The pattern centralizes cross-cutting concerns — authentication, logging, error handling — in one place, then delegates to specialized controllers for each resource domain.

`@RestController` is a composed annotation that combines `@Controller` (marks the class as a Spring MVC handler) and `@ResponseBody` (instructs Spring to serialize each method's return value directly to the HTTP response body, rather than resolving it as a view name). Without `@ResponseBody`, returning `"employees"` from a method would tell Spring to render a template called `employees.html`. With it — which `@RestController` provides automatically — returning an `EmployeeResponse` object serializes it to JSON via Jackson.

This design reflects a core principle in Spring MVC: **the controller is a thin orchestration layer**. It receives a request, delegates to a service for business logic, and returns a response. Business rules, transaction management, and data access belong in the layers below — not in the controller.

```java
@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<EmployeeResponse> getAllEmployees() {
        return employeeService.findAll();
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(@PathVariable Long id) {
        return employeeService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return employeeService.create(request);
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return employeeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.delete(id);
    }
}
```

The architecture beneath the controller is a layered stack, where each layer has exactly one responsibility:

```
HTTP Request
      │
      ▼
  Controller (@RestController)
  — maps HTTP to methods, validates input, returns responses
      │
      ▼
  Service (@Service)
  — business logic, transaction boundaries
      │
      ▼
  Repository (@Repository)
  — data access, JPA queries
      │
      ▼
  Database (PostgreSQL)
```

Each layer depends only on the one directly below it. Controllers never access repositories directly. Services never handle HTTP concerns. This separation makes each layer independently testable and replaceable — a `@WebMvcTest` tests the controller in isolation with a mocked service, a `@DataJpaTest` tests the repository without a web layer.

---

<a id="ch4"></a>
## Chapter 4 — Request Mapping: Routing HTTP to Methods

**Handler mapping** is the process by which Spring's `DispatcherServlet` determines which controller method should handle an incoming request. Spring examines the request's URL, HTTP method, headers, and content type, then matches it against the `@RequestMapping` metadata registered on your controller methods. This is all done at startup — Spring builds a lookup structure from all your annotations once, and route resolution at runtime is a fast lookup, not a scan.

The `@RequestMapping` annotation on a class sets the **base path** — every method inside inherits it as a prefix. Method-level annotations then add specificity: the HTTP verb, a path suffix, and optional constraints like accepted content types or required headers.

```java
@GetMapping("/active")             // GET /api/v1/employees/active
@PostMapping                        // POST /api/v1/employees
@PutMapping("/{id}")                // PUT /api/v1/employees/{id}
@PatchMapping("/{id}/salary")       // PATCH /api/v1/employees/{id}/salary
@DeleteMapping("/{id}")             // DELETE /api/v1/employees/{id}

// Constrain to specific media type — only matches requests with Accept: application/json
@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)

// Handle multiple paths with a single method
@GetMapping({"/all", "/list"})
```

The `@GetMapping`, `@PostMapping` shortcuts are simply `@RequestMapping(method = RequestMethod.GET)` with a cleaner syntax — introduced in Spring 4.3 to reduce annotation verbosity. Prefer these specific annotations over the generic `@RequestMapping` — they communicate intent more clearly and prevent ambiguity (a `@RequestMapping` without a `method` parameter matches all HTTP methods, which is almost never what you want).

One important nuance: Spring resolves mapping ambiguities by specificity. A method mapped to `/employees/{id}` and another mapped to `/employees/active` — Spring prefers the literal `/employees/active` match over the template pattern `{id}` when the URL is `/employees/active`. Understanding this specificity ordering prevents surprising routing bugs when you have both literal and parameterized paths at the same level.

---

<a id="ch5"></a>
## Chapter 5 — Reading Requests: Path Variables, Query Params, Request Body

Spring MVC uses **argument resolvers** to automatically extract data from an incoming HTTP request and inject it as parameters into your controller method. Each annotation (`@PathVariable`, `@RequestParam`, `@RequestBody`) maps to a dedicated `HandlerMethodArgumentResolver` that knows how to extract its particular piece of the request. You never manually parse URLs or read input streams — Spring's resolver chain handles all of it before your method is called.

### Path Variables — Identifying a Specific Resource

Path variables embed identifiers directly in the URL path, making the URL itself meaningful. `/employees/42` is better than `/employees?id=42` because the former treats the employee as a first-class resource with its own address, which is core to RESTful resource modeling.

```java
@GetMapping("/{id}")
public EmployeeResponse getById(@PathVariable Long id) { ... }

// Multiple path variables — deeply nested resource relationships
@GetMapping("/departments/{deptId}/employees/{empId}")
public EmployeeResponse get(@PathVariable Long deptId, @PathVariable Long empId) { ... }
```

Spring automatically converts the String extracted from the URL to the declared parameter type (`Long`, `Integer`, `UUID`, even enums). If the conversion fails — someone passes `abc` for a `Long` parameter — Spring returns a `400 Bad Request` before your method is ever called.

### Query Parameters — Filtering, Searching, and Options

Query parameters are the right tool for optional filters and search criteria that narrow a collection, not for identifying a resource. `/employees?department=Engineering&active=true` filters the employee collection — neither parameter identifies a specific resource, they refine the set being returned.

```java
@GetMapping
public List<EmployeeResponse> getAll(
        @RequestParam(required = false) String department,
        @RequestParam(defaultValue = "true") boolean active,
        @RequestParam(required = false) List<Long> ids) { ... }
```

`required = false` makes the parameter optional — if the client doesn't send it, the parameter is `null`. `defaultValue` provides a fallback when the parameter is absent. Both are important for building flexible, backward-compatible filter APIs.

### Request Body — Structured Input for Write Operations

For `POST`, `PUT`, and `PATCH` operations, the input payload travels in the request body as JSON. `@RequestBody` instructs Spring to take the raw JSON string from the body and deserialize it into your DTO using Jackson. This deserialization happens before your method runs — if the JSON is syntactically malformed, Spring returns a `400` automatically.

```java
@PostMapping
public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest request) {
    // If JSON is malformed: 400 before this line
    // If @Valid constraints fail: 400 before this line
    // If we reach here: input is structurally valid
    return ResponseEntity.status(201).body(employeeService.create(request));
}
```

The `@Valid` annotation placed alongside `@RequestBody` triggers Bean Validation immediately after deserialization. The two steps — deserialization and validation — are separate: deserialization checks JSON syntax and type compatibility, validation checks business constraints like `@NotBlank` or `@Email`. Both must pass before your method body executes.

---

<a id="ch6"></a>
## Chapter 6 — Building Responses: `ResponseEntity` and Status Codes

Every HTTP response carries two fundamental components: a **status code** communicating the outcome of the request, and optionally a **body** carrying a representation of the result or error. HTTP status codes are not suggestions — they are a standardized language that every HTTP client, proxy, load balancer, monitoring tool, and browser speaks fluently. Using them correctly means your API works naturally with the entire HTTP ecosystem; misusing them (returning `200 OK` with an error in the body) breaks that contract silently.

`ResponseEntity<T>` is Spring MVC's representation of a complete HTTP response — status code, headers, and body all in one object. It gives you full programmatic control over every aspect of the response from inside your controller method.

```java
// 200 OK with a body
return ResponseEntity.ok(employee);

// 201 Created with a Location header pointing to the new resource — REST best practice
@PostMapping
public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest req) {
    EmployeeResponse created = employeeService.create(req);
    URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
    return ResponseEntity.created(location).body(created);
}

// 204 No Content — operation succeeded but nothing meaningful to return
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    employeeService.delete(id);
    return ResponseEntity.noContent().build();
}

// Conditional — 200 if found, 404 if not
return employeeService.findById(id)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.notFound().build());
```

### HTTP Status Codes — The Ones That Actually Matter

Status codes are grouped by their first digit into semantic categories. Within each category, specific codes carry specific meaning:

```
2xx — Success
  200 OK             Standard success — GET and PUT/PATCH returning an updated resource
  201 Created        POST that successfully created a new resource
  204 No Content     Successful operation with no body — DELETE, or PUT with no return value

4xx — Client Error (the request was wrong — fix it on the client side)
  400 Bad Request    Malformed JSON, type mismatch, failed bean validation
  401 Unauthorized   Not authenticated — missing or invalid credentials
  403 Forbidden      Authenticated but not authorized for this resource
  404 Not Found      The requested resource doesn't exist
  409 Conflict       Resource already exists — duplicate email, unique constraint violation
  422 Unprocessable  Syntactically valid request that violates business rules

5xx — Server Error (something went wrong on our end)
  500 Internal Server Error  Unhandled exception — something we didn't anticipate
  503 Service Unavailable    Downstream dependency is down, try again later
```

> 💡 The `Location` header on a `201 Created` response is a REST best practice that many APIs skip. It tells the client exactly where to find the newly created resource (`/api/v1/employees/42`) without them having to guess or parse the body. It's a small addition that makes your API significantly easier to integrate with.

---

<a id="ch7"></a>
## Chapter 7 — DTOs: Why You Never Expose Your Entities Directly

This is one of the most important architectural decisions in REST API design, and one of the most commonly skipped by developers learning Spring Boot. The rule is simple: **never use your JPA entity as a request or response object**. The reasons are numerous and compound over time.

A JPA entity is a **persistence model** — its shape is dictated by your database schema, its annotations are for Hibernate, and its fields represent what the database stores. A DTO (Data Transfer Object) is an **API model** — its shape is dictated by what clients need, its fields represent what the API surface exposes. These two concerns are fundamentally different, and conflating them causes a cascade of problems.

**Security:** your entity almost certainly contains fields that should never leave the server. A `User` entity holds a `passwordHash`. An `Employee` entity might hold internal IDs, audit metadata, or salary information that only certain roles should see. When you return the entity directly, all of it goes into the JSON response — and you have to remember to annotate every sensitive field with `@JsonIgnore`, which is easy to forget and gets silently undone by the next developer who adds a field.

**Tight coupling:** if your entity is your API contract, every database schema change is a potentially breaking API change. Rename a column in PostgreSQL, update the entity field name, and your API response shape changes — potentially breaking every client depending on it. With DTOs, the schema can evolve independently of the API surface.

**Serialization problems:** JPA uses lazy loading extensively — related entities are not loaded from the database until accessed. When Jackson tries to serialize a lazily-loaded `List<Order>` on an `Employee` entity *outside* a transaction (which is exactly when serialization happens, after the service method has returned), you get a `LazyInitializationException`. This is one of the most common Spring Boot beginner bugs, and DTOs sidestep it entirely — you load exactly what you need inside the transaction, copy it into the DTO, and return the DTO.

![Spring Boot DTO vs Entity separation diagram](/images/blogs/internals/dto-entity-separation.png)

```java
// ❌ Entity — internal persistence model, contains sensitive and lazy-loaded fields
@Entity
public class Employee {
    @Id private Long id;
    private String name;
    private String email;
    private String passwordHash;   // never goes in a response
    private Double salary;          // maybe not everyone should see this

    @OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
    private List<Order> orders;    // LazyInitializationException waiting to happen
}

// ✅ Request DTO — what clients send in
@Getter @Setter @NoArgsConstructor
public class CreateEmployeeRequest {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @NotBlank private String department;
    @Positive private Double salary;
}

// ✅ Response DTO — what clients get back out
@Getter @Builder
public class EmployeeResponse {
    private Long id;
    private String name;
    private String email;
    private String department;
    private LocalDateTime createdAt;
    // passwordHash: absent — never exposed
    // orders: absent — loaded separately via a dedicated endpoint
}
```

### Mapping Between Entity and DTO

The mapping between your entity and DTO is intentionally explicit. You control exactly which fields are copied, in which direction, with what transformation. Manual mapping is the simplest and most transparent approach:

```java
public EmployeeResponse toResponse(Employee employee) {
    return EmployeeResponse.builder()
            .id(employee.getId())
            .name(employee.getName())
            .email(employee.getEmail())
            .department(employee.getDepartment())
            .createdAt(employee.getCreatedAt())
            .build();
}
```

For larger projects with many entities and mappings, **MapStruct** generates the boilerplate at compile time — you declare the interface, and MapStruct produces a complete, type-safe implementation that you can read in your `target/` directory:

```java
@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    EmployeeResponse toResponse(Employee employee);
    Employee toEntity(CreateEmployeeRequest request);
}
```

MapStruct generates actual Java code — no reflection, no magic at runtime, failures at compile time if a mapping field doesn't exist. This is why it's preferred over reflection-based mappers like ModelMapper for production code.

---

<a id="ch8"></a>
## Chapter 8 — Validation: `@Valid` and Bean Validation

Input validation is your first and most important line of defense against bad data entering your system. The earlier you reject invalid input, the cheaper the failure — a validation error at the controller layer is far less costly than a constraint violation at the database layer, a corrupted calculation in the business layer, or a confused downstream service. Bean Validation (Jakarta Validation, formerly javax.validation) is the standard Java API for declaring validation constraints as annotations directly on your model classes.

Spring Boot auto-configures the Hibernate Validator as the Bean Validation implementation. When you annotate a controller parameter with `@Valid`, Spring triggers the validator against the entire object graph of that parameter before executing your method. The validator evaluates every constraint annotation on every field and collects all violations — it doesn't stop at the first failure, so a client gets a complete picture of everything wrong with their request in a single response.

```java
public class CreateEmployeeRequest {

    @NotNull(message = "Name cannot be null")
    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank
    @Pattern(regexp = "ENGINEERING|MARKETING|SALES|HR",
             message = "Department must be one of: ENGINEERING, MARKETING, SALES, HR")
    private String department;

    @NotNull
    @Positive(message = "Salary must be positive")
    @DecimalMax(value = "1000000.00", message = "Salary cannot exceed 1,000,000")
    private Double salary;

    @Valid       // cascade validation into nested objects
    @NotNull
    private AddressRequest address;
}
```

The standard constraint library covers the common cases: `@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Email`, `@Pattern`, `@Positive`, `@Negative`, `@Past`, `@Future`, `@DecimalMin`, `@DecimalMax`. When none of these fit — for example, checking that an email doesn't already exist in the database — you write a custom validator.

### Custom Validators — Business-Rule Validation

A custom validator consists of two parts: an annotation that declares the constraint, and a `ConstraintValidator` implementation that contains the logic. Spring automatically picks up validators declared as `@Component`, which means they can have other beans (like repositories) injected into them.

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Email already registered";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {

    private final EmployeeRepository employeeRepository;

    public UniqueEmailValidator(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) return true; // let @NotBlank handle null
        return !employeeRepository.existsByEmail(email);
    }
}
```

This approach keeps validation concerns in one place — the DTO — rather than scattering `if (repository.existsByEmail(email)) throw ...` checks throughout your service layer. The service layer then only sees pre-validated data, and its logic becomes cleaner and more focused.

---

<a id="ch9"></a>
## Chapter 9 — Global Exception Handling: `@RestControllerAdvice`

Without centralized exception handling, every exception that escapes your controller either produces Spring Boot's default `/error` response (a semi-structured JSON with a stack trace in development mode) or propagates to the client as a `500 Internal Server Error` with no meaningful body. Neither is acceptable for a production API.

`@RestControllerAdvice` is a specialization of Spring's `@ControllerAdvice` — a mechanism that declares a class as a global handler for exceptions thrown from any `@Controller` in the application context. When an exception escapes a controller method, Spring scans all registered advice classes for an `@ExceptionHandler` method that matches the exception type, then invokes it with the exception and request context to produce the response. The key benefit: **one class handles all exceptions for the entire API**, enforcing a consistent response structure across every error case.

![Spring Boot global exception handling flow diagram](/images/blogs/internals/rest-api-exception-handling-flow.png)

The first step is defining a consistent error response shape. Every error your API returns — validation failure, not found, conflict, unexpected exception — should have the same JSON structure, so clients can handle errors generically with a single parser:

```java
@Getter
@Builder
public class ApiError {
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    private Map<String, String> fieldErrors;
}
```

Then the global handler maps each exception type to the right status code and `ApiError` body:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        return ResponseEntity.badRequest().body(ApiError.builder()
                .status(400).error("Validation Failed")
                .message("One or more fields failed validation")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .fieldErrors(fieldErrors).build());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        return ResponseEntity.status(404).body(ApiError.builder()
                .status(404).error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now()).build());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleConflict(
            DuplicateResourceException ex, HttpServletRequest request) {

        return ResponseEntity.status(409).body(ApiError.builder()
                .status(409).error("Conflict")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now()).build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(
            Exception ex, HttpServletRequest request) {

        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        return ResponseEntity.internalServerError().body(ApiError.builder()
                .status(500).error("Internal Server Error")
                .message("An unexpected error occurred. Please try again later.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now()).build());
    }
}
```

The catch-all `Exception.class` handler deserves special attention. Unexpected exceptions — the ones you didn't anticipate and didn't write a specific handler for — can carry dangerous internal information in their message: SQL query strings, file paths, hostnames, stack traces, internal configuration values. Logging the full stack trace internally (for debugging) while returning a generic, safe message to the client (for security) is the correct pattern. `ex.getMessage()` should never be passed directly to the client in a catch-all handler.

---

<a id="ch10"></a>
## Chapter 10 — Pagination and Sorting

Returning an entire collection in a single response is one of the most common performance mistakes in REST API design. A table with ten records today might have ten million records next year, and an endpoint that returns them all in one JSON array is both a server memory problem (loading everything into the JVM heap) and a client parsing problem (no browser or mobile app wants to render a million-row response). Pagination is not an optimization to add later — it is a fundamental design requirement for any collection endpoint.

Spring Data JPA has first-class pagination support built in through two abstractions: `Pageable` (the request side — which page, how many per page, sort order) and `Page<T>` (the response side — the requested slice of data plus metadata about the full collection). The database-level implementation uses `LIMIT` and `OFFSET` in the generated SQL — Spring translates your `Pageable` into the appropriate SQL automatically, across all supported databases.

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Page<Employee> findByDepartment(String department, Pageable pageable);
}

@GetMapping
public ResponseEntity<Page<EmployeeResponse>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String direction) {

    Sort sort = direction.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();

    Pageable pageable = PageRequest.of(page, size, sort);

    return ResponseEntity.ok(
        employeeService.findAll(pageable).map(this::toResponse)
    );
}
```

The `Page<T>` response contains the content slice and everything a client needs to build pagination UI — current page number, page size, total elements across all pages, total pages, and whether this is the first or last page:

```json
{
  "content": [ ... array of up to 20 employees ... ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 347,
  "totalPages": 18,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

One important performance caveat: `OFFSET`-based pagination degrades as the offset grows. `OFFSET 10000 LIMIT 20` forces the database to read and discard 10,000 rows before returning the 20 you asked for — even with an index, this is work that scales with the offset value. For APIs that need to page deep into large datasets, **keyset pagination** (also called cursor-based pagination) is a better approach: instead of `OFFSET n`, you filter using `WHERE id > :lastSeenId ORDER BY id LIMIT 20`. This remains O(1) regardless of how deep into the dataset you navigate, because the index lookup for `id > X` is always equally fast. Spring Data doesn't provide keyset pagination out of the box — it requires a native query or a library like jOOQ.

---

<a id="ch11"></a>
## Chapter 11 — Content Negotiation and Jackson Configuration

**Content negotiation** is the process by which a client and server agree on the format of the response. The client expresses its preference via the `Accept` request header (`Accept: application/json`, `Accept: application/xml`), and the server responds in a format it supports that matches the client's preference. Spring MVC implements content negotiation via `HttpMessageConverter` implementations — each converter handles a specific media type. Jackson's `MappingJackson2HttpMessageConverter` handles JSON, and Spring Boot registers it automatically.

Jackson itself is highly configurable. The right place for that configuration in a Spring Boot application is globally — either via `application.yml` properties or a `@Bean ObjectMapper` — rather than per-field annotations scattered throughout your DTOs. Global configuration enforces consistency: if all dates should be ISO-8601 strings, that should be true for every endpoint, not just the ones someone remembered to annotate.

```yaml
spring:
  jackson:
    default-property-inclusion: non_null      # skip null fields in all responses
    serialization:
      write-dates-as-timestamps: false         # ISO-8601 strings, not epoch milliseconds
    deserialization:
      fail-on-unknown-properties: false        # ignore unrecognized fields from clients
    property-naming-strategy: SNAKE_CASE       # camelCase in Java, snake_case in JSON
```

When you need control beyond what properties allow, define a `@Bean ObjectMapper` directly:

```java
@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }
}
```

Per-field Jackson annotations (`@JsonIgnore`, `@JsonProperty`, `@JsonFormat`) are appropriate for exceptions to the global rule — a specific field that needs a different date format, a field that should be named differently in JSON than in Java, a field that should always be excluded. The global configuration handles the common case; field annotations handle the exceptions.

---

<a id="ch12"></a>
## Chapter 12 — CORS: Letting Your Frontend Talk to Your API

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism, not a Spring-specific feature. Browsers implement a **Same-Origin Policy** — JavaScript running on `http://frontend.com` is not allowed to make HTTP requests to `http://api.com` unless the server explicitly permits it. An origin is the combination of scheme, hostname, and port — `http://localhost:3000` and `http://localhost:8080` are different origins even though they're on the same machine.

When a browser JavaScript application makes a cross-origin request, the browser first sends a **preflight request** — an `OPTIONS` request to the same URL with `Origin` and `Access-Control-Request-Method` headers — asking the server if the actual request is permitted. The server responds with CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.) declaring what it allows. Only if the preflight response permits it does the browser actually send the real request. This entire handshake happens invisibly — your JavaScript just sees its fetch fail with a CORS error in the browser console if the server isn't configured correctly.

CORS configuration belongs at the Spring Security filter level (if you use Spring Security) or the MVC level (if you don't). A global `WebMvcConfigurer` is the cleanest approach for APIs without Spring Security:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "https://your-production-domain.com"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

`maxAge(3600)` tells the browser to cache the preflight response for one hour — without this, the browser sends a preflight before every single cross-origin request, doubling your API's HTTP traffic from browser clients. It's a small setting with a meaningful impact on perceived API responsiveness.

> ⚠️ `allowedOrigins("*")` and `allowCredentials(true)` cannot be combined — browsers reject this combination as a security violation. If you need credentials (cookies, Authorization headers), you must list explicit origins. `allowedOrigins("*")` is only valid for fully public, credential-free endpoints.

---

<a id="ch13"></a>
## Chapter 13 — Versioning Your API

API versioning is not about planning for change — it's about acknowledging that change is inevitable. Every API that serves real clients will eventually need to break backward compatibility: rename a field, change a response structure, remove an endpoint, alter behavior. Without versioning, any such change breaks every existing client simultaneously. With versioning, old clients continue working against the old version while new clients adopt the improved one, and you control the migration timeline.

There are three common versioning strategies, each with real trade-offs:

**URL Path Versioning** (`/api/v1/employees`, `/api/v2/employees`) is the most explicit and operationally simple. The version is visible in every URL, every log line, every bookmark, and every API gateway routing rule. You can route traffic to different service instances by version at the infrastructure level without touching application code. The downside is slightly less "pure" REST — REST purists argue the URL should identify the resource, not the version of the representation, and that the `Accept` header is the correct place for version negotiation.

**Header Versioning** (`API-Version: 2`) keeps URLs clean and follows REST semantics more closely. But it's invisible in browser address bars, harder to test without a tool like Postman, and trickier to configure at the API gateway layer. It's common in internal service-to-service APIs where clients are well-controlled.

**Media Type Versioning** (`Accept: application/vnd.company.api.v2+json`) is the most RESTfully correct approach — version negotiation via content type is exactly what the `Accept` header exists for. It is also the most complex to implement, test, and document, which is why very few APIs use it in practice outside of large companies with dedicated API platform teams.

```java
// URL versioning — the practical default for most teams
@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeV1Controller { ... }

@RestController
@RequestMapping("/api/v2/employees")
public class EmployeeV2Controller { ... }
```

For most teams: use URL path versioning. It's the most universally understood, the most debuggable, and the easiest to document in Swagger/OpenAPI. Switch to header versioning if you're building internal platform APIs where all clients are under your team's control and consistency of URL structure matters more than discoverability.

---

<a id="ch14"></a>
## Chapter 14 — A Production-Grade Request Lifecycle

Understanding exactly what happens from the moment an HTTP request arrives to the moment the response goes back is what makes Spring MVC behavior fully predictable. When something goes wrong — an interceptor blocking a request, a filter adding unexpected headers, an exception not reaching your handler — understanding this lifecycle is what tells you where to look.

The flow passes through several distinct layers, each with its own responsibility, before your controller method ever executes:

![Spring Boot REST API complete request lifecycle diagram](/images/blogs/internals/rest-api-request-lifecycle.png)

```
Client sends HTTP request
        │
        ▼
Embedded Tomcat — accepts the raw TCP connection, parses HTTP headers and body
        │
        ▼
Servlet Filter Chain — runs for every request, before Spring MVC
  ├── SecurityFilter (Spring Security authentication check)
  ├── CorsFilter (handles OPTIONS preflight, adds CORS response headers)
  ├── LoggingFilter (MDC correlation ID, structured request logging)
  └── any other Servlet filters...
        │
        ▼
DispatcherServlet — Spring's front controller, single entry point into Spring MVC
        │
        ▼
HandlerMapping — matches the request URL + method to a specific @RequestMapping method
        │
        ▼
HandlerInterceptor chain (preHandle)
  └── custom pre-processing: rate limiting, tenant resolution, audit logging
        │
        ▼
ArgumentResolvers — extract and convert controller method parameters from the request
  ├── @PathVariable  → extracted from URL template
  ├── @RequestParam  → extracted from query string
  ├── @RequestBody   → Jackson deserializes JSON body → DTO object
  └── @Valid         → Bean Validation runs on the DTO (400 if any violations)
        │
        ▼
Your @RestController method executes
        │
        ▼
Service layer — business logic, @Transactional boundaries, domain rules
        │
        ▼
Repository — Hibernate generates SQL, executes against PostgreSQL, maps ResultSet to entities
        │
        ▼
Return value propagates back up through the call stack
        │
        ▼
HandlerInterceptor chain (postHandle)
        │
        ▼
HttpMessageConverter (Jackson) — serializes return value to JSON
        │
        ▼
ResponseEntity headers and status code applied to the HTTP response
        │
        ▼
HandlerInterceptor (afterCompletion) — cleanup, logging completion
        │
        ▼
HTTP Response written back through Tomcat to the client
```

The exception path branches off at any point from argument resolution onward. If an exception escapes your controller, it travels up to `DispatcherServlet`, which checks all registered `@RestControllerAdvice` classes for a matching `@ExceptionHandler`. Your global handler then produces the error response — bypassing `postHandle` but still running `afterCompletion` for cleanup.

This lifecycle is also why filters and interceptors have different capabilities. Filters run at the Servlet level — before Spring MVC exists in the picture — so they can intercept all requests including static resources, act on raw `HttpServletRequest` and `HttpServletResponse`, and cannot access Spring MVC abstractions like `HandlerMethod`. Interceptors run inside Spring MVC after handler resolution — they have access to the matched handler, can be ordered relative to each other, and can bail out of execution by returning `false` from `preHandle`.

---

<a id="ch15"></a>
## Key Takeaways

- REST is an **architectural style** — resources are nouns, HTTP methods are verbs, status codes communicate outcomes, and statelessness enables horizontal scaling. Internalize these constraints and every API design decision becomes less arbitrary
- `@RestController` is `@Controller` + `@ResponseBody` — Spring serializes your return values to JSON automatically via Jackson; your controller's only job is orchestration, not business logic
- Spring MVC's **argument resolver** chain automatically extracts `@PathVariable`, `@RequestParam`, and `@RequestBody` from the request before your method runs — type conversion, deserialization, and validation all happen before your first line of method code executes
- **Always use DTOs** — never expose your JPA entity as a request or response object. Entities are persistence models; DTOs are API models. Conflating them causes security leaks, tight schema coupling, and `LazyInitializationException` at serialization time
- `ResponseEntity<T>` gives you full control over status code, headers, and body — use the right status code for the right outcome; `201 Created` with a `Location` header is the correct response for a successful POST
- Bean Validation (`@Valid`, `@NotBlank`, `@Email`, custom `@Constraint`) is your first line of defense against bad input — reject it before it reaches your service layer; the `MethodArgumentNotValidException` from `@Valid` should be caught by your `@RestControllerAdvice`
- `@RestControllerAdvice` is the single place all exceptions are mapped to consistent, structured responses — the catch-all handler must log the full stack trace internally but must never expose `ex.getMessage()` externally
- Paginate every collection endpoint from day one — `Page<T>` from Spring Data gives you content plus full navigation metadata; understand the `OFFSET` performance cliff and use keyset pagination when it matters
- CORS is a browser security mechanism — configure it globally via `WebMvcConfigurer`, never combine `allowedOrigins("*")` with `allowCredentials(true)`, and set `maxAge` to reduce preflight overhead
- URL path versioning (`/api/v1/`, `/api/v2/`) is the pragmatic default — visible, debuggable, gateway-friendly, and universally understood by clients and infrastructure alike

---

*A REST API is a promise to every client that will ever depend on it. The patterns in this post — resource-oriented URLs, DTOs, proper status codes, global exception handling, pagination — aren't ceremony. They're the difference between an API that is a pleasure to integrate with and one that frustrates every developer who touches it. Build the contract deliberately, because you'll be maintaining it for longer than you expect.*