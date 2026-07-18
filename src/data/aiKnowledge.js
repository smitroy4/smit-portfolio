const aiKnowledge = {

  staygrid: `
Project: StayGrid

Overview:
Production-grade hotel booking backend built around the problems real booking platforms face — concurrency, dynamic pricing, inventory consistency, and payment workflows. Not a CRUD project.

Core Problems Solved:
- Race conditions when multiple users try to book the same room simultaneously
- Multi-layered dynamic pricing recalculated hourly
- Atomic inventory updates across multi-day stays
- Reliable payment confirmation via Stripe webhooks (not polling)

Auth & Security:
- Stateless JWT auth — short-lived access token + long-lived refresh token
- Refresh token stored in an HttpOnly cookie (XSS protection)
- Role-based access control: HOTEL_MANAGER, GUEST
- Custom JWTAuthFilter plugged into the Spring Security filter chain

Inventory & Overbooking Prevention:
- Pessimistic locking (@Lock(PESSIMISTIC_WRITE) / SELECT FOR UPDATE) to serialize concurrent writes
- Reserved vs Booked count separation to cover the gap between booking intent and payment
- Custom JPQL queries validate availability across the full multi-day stay
- All inventory mutations wrapped in @Transactional methods

Booking Lifecycle:
RESERVED -> GUESTS_ADDED -> PAYMENT_PENDING -> CONFIRMED
                                            -> CANCELLED
                                            -> EXPIRED
- 10-minute expiry window on reserved bookings, enforced via hasBookingExpired()
- Ownership validated on every state transition

Payments (Stripe):
- Stripe Checkout Session created per booking (CheckoutService)
- Webhook-driven confirmation — WebhookController verifies the Stripe signature
- Automatic refund issued on cancellation
- Idempotent booking confirmation via a unique paymentSessionId

Dynamic Pricing Engine:
Implemented with the Decorator pattern — each strategy wraps the previous one, forming a composable pricing pipeline:
- BasePricingStrategy: room's base nightly price
- SurgePricingStrategy: multiplies by a demand-based surgeFactor
- OccupancyPricingStrategy: +20% when bookedCount/reservedCount > 0.8
- UrgencyPricingStrategy: +15% for check-ins within the next 7 days
- HolidayPricingStrategy: +25% on holiday dates
Wrapping order in PricingService: Base -> Surge -> Occupancy -> Urgency -> Holiday

Scheduled Price Optimization:
- PricingUpdateService runs hourly (@Scheduled, cron "0 0 * * * *")
- Recalculates inventory prices in batches of 100 hotels
- Updates a per-day HotelMinPrice aggregate table used for fast hotel search/sorting

Query Optimization:
- Custom JPQL for availability search, locking, and min-price aggregation
- Avoids N+1 via fetch strategies and DTO projections

Global Response Handling:
- GlobalExceptionHandler maps exceptions (ResourceNotFound, Auth, JWT, AccessDenied) to a consistent ApiError shape
- GlobalResponseHandler wraps every successful response in a standard ApiResponse<T> envelope

Tech Stack:
- Java 21, Spring Boot 3.5
- Spring Security + JWT (jjwt)
- PostgreSQL (Neon Serverless), Hibernate/JPA
- Stripe Java SDK
- Swagger / OpenAPI (springdoc)
- ModelMapper

Key Classes:
Controllers: AuthController, HotelController, HotelBrowseController, RoomAdminController, HotelBookingController, WebhookController
Security: JWTService, JWTAuthFilter, AuthService, WebSecurityConfig
Services: BookingServiceImpl, HotelServiceImpl, RoomServiceImpl, InventoryServiceImpl, CheckoutServiceImpl, PricingUpdateService
Pricing: PricingStrategy, BasePricingStrategy, SurgePricingStrategy, OccupancyPricingStrategy, UrgencyPricingStrategy, HolidayPricingStrategy, PricingService
Entities: Hotel, Room, Inventory, Booking, Guest, User, HotelMinPrice
`,

  circuitmart: `
Project: CircuitMart

Overview:
Cloud-native e-commerce backend built with Spring Boot 4.1 + Spring Cloud 2025.1.2 (Java 25). Demonstrates service discovery, API gateway routing, centralized config, sync & async inter-service communication, circuit breakers, distributed tracing, and centralized logging in a 5-service distributed architecture.

Architecture (5 services):
- Discovery Service: Eureka registry — service registration, discovery, health monitoring
- Config Server: Git-backed centralized configuration with @RefreshScope support
- API Gateway: Single entry point — request routing, JWT validation, custom gateway filters
- Inventory Service: Product CRUD, stock tracking, availability checks, Kafka consumer
- Order Service: Order creation/tracking, Feign client, Kafka producer

Communication Patterns:
- Sync: Order → Inventory via OpenFeign (returns total price for order validation), protected by Resilience4J circuit breaker (prevents cascading failures)
- Async: Order publishes OrderCreatedEvent to Kafka topic "order.created"; Inventory consumes it to deduct inventory
- Auth: JWT validated at the Gateway level (X-User-Id header injected) — downstream services stay stateless

Order Creation Flow:
1. Client → POST /orders → API Gateway (JWT validation)
2. Gateway → Order Service
3. Order Service Feign calls Inventory (POST /inventory/products/reduce-stocks) with circuit breaker protection
4. Order saved to PostgreSQL (status: CONFIRMED)
5. Order publishes OrderCreatedEvent to Kafka → Inventory consumes and deducts stock

Observability:
- Micrometer Tracing + Brave + Zipkin — trace IDs propagate across HTTP, Feign, and Kafka
- Distributed tracing enables end-to-end request visualization

Project Structure:
- CircuitMart/discovery-service (:8761)
- CircuitMart/config-server (:8888, Git-backed, reads from circuitmart-config-server repo via GITHUB_ACCESS_TOKEN)
- CircuitMart/api-gateway
- CircuitMart/inventory-service
- CircuitMart/order-service
- CircuitMart/docker-compose.yml (Kafka 3.7.1)
Base package: com.smit.{service_name}

Tech Stack:
- Java 25, Spring Boot 4.1.0, Spring Data JPA, Hibernate
- Spring Cloud 2025.1.2: Eureka, Spring Cloud Gateway (WebFlux), OpenFeign, Resilience4J
- Apache Kafka 3.7.1, Spring Cloud Stream Kafka Binder
- JWT (jjwt 0.12.6), Gateway-level authorization
- PostgreSQL, Zipkin, ModelMapper, Maven
`,

  clinixhub: `
Project: ClinicXHub

Overview:
Hospital management system backend built with Spring Boot. Handles patient registration, doctor onboarding, appointment scheduling, and insurance management — with a dual auth system supporting both JWT email/password login and OAuth2 social login.

Roles & Permissions:
Roles: ADMIN, DOCTOR, PATIENT
Permissions (granular, mapped via RolePermissionMapping):
- PATIENT_READ, PATIENT_WRITE
- APPOINTMENT_READ, APPOINTMENT_WRITE, APPOINTMENT_DELETE
- USER_MANAGE, REPORT_VIEW

Auth & Security:
- Stateless JWT auth — single access token (10-minute expiry), no refresh token
- OAuth2 social login supported: Google, GitHub, Twitter
- OAuth2SuccessHandler writes JWT to response after successful OAuth2 login
- AuthProviderType enum: GOOGLE, GITHUB, FACEBOOK, TWITTER, EMAIL
- JwtAuthFilter (OncePerRequestFilter) validates token and sets SecurityContext
- CustomUserDetailsService loads user by username (email)
- @EnableMethodSecurity enabled — method-level guards used throughout
- Method-level: @Secured("ROLE_PATIENT"), @PreAuthorize("hasRole(...) OR ...")
- Endpoint-level security:
  - /public/**, /auth/** → open
  - DELETE /admin/** → requires APPOINTMENT_DELETE or USER_MANAGE permission
  - /admin/** → ADMIN role only
  - /doctors/** → DOCTOR or ADMIN role

Entities:
- User (table: app_user): username, password, providerId, providerType, Set<RoleType> roles — implements UserDetails
- Patient: name, birthDate, email, gender, BloodGroupType, Insurance (OneToOne), List<Appointment>; linked to User via @MapsId
- Doctor: name, specialization, email, Set<Department> (ManyToMany), List<Appointment>; linked to User via @MapsId
- Insurance: policyNumber, provider, validUntil; OneToOne with Patient (Patient owns the FK)
- Appointment: appointmentTime, reason, ManyToOne Doctor, ManyToOne Patient
- Department: ManyToMany with Doctor

Enums:
- RoleType: ADMIN, DOCTOR, PATIENT
- PermissionType: PATIENT_READ, PATIENT_WRITE, APPOINTMENT_READ, APPOINTMENT_WRITE, APPOINTMENT_DELETE, USER_MANAGE, REPORT_VIEW
- BloodGroupType: A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE
- AuthProviderType: GOOGLE, GITHUB, FACEBOOK, TWITTER, EMAIL

Controllers & Endpoints:
- AuthController (/auth): POST /login, POST /signup
- AdminController (/admin): GET /patients (paginated), POST /onBoardNewDoctor
- DoctorController (/doctors): GET /appointments (returns appointments for the currently logged-in doctor)
- HospitalController (/public): GET /doctors (no auth required)
- PatientController (/patients): POST /appointments (create appointment), GET /profile

Services:
- AppointmentService: createNewAppointment (@Secured ROLE_PATIENT), getAllAppointmentsOfDoctor (@PreAuthorize: ADMIN or own doctor), reAssignAppointmentToAnotherDoctor (@PreAuthorize: appointment:write or own doctor)
- DoctorService: getAllDoctors, onBoardNewDoctor (elevates user role to DOCTOR)
- PatientService: getPatientById, getAllPatients (paginated via native query)
- InsuranceService: assignInsuranceToPatient, disassociateInsuranceFromPatient (both @Transactional)
- AuthService: login (JWT), signup (creates User + Patient together), handleOAuth2LoginRequest (OAuth2 flow with account linking logic)

Repository Highlights (PatientRepository):
- findByBloodGroup — custom JPQL with @Query
- findByBornAfterDate — JPQL with named param
- countEachBloodGroupType — DTO projection query returning List<BloodGroupCountResponseEntity>
- findAllPatients — native SQL query with Pageable
- updateNameWithId — @Modifying + @Transactional bulk update
- findAllPatientWithAppointment — LEFT JOIN FETCH to avoid N+1

Key Design Decisions:
- Doctor and Patient share the same User entity via @MapsId (shared primary key)
- Signup creates both a User and a Patient record in one transaction
- OAuth2 login handles three cases: new user (signup), returning OAuth2 user, and email conflict (throws BadCredentialsException)
- Permissions are additive on top of roles (role grants base authority, RolePermissionMapping adds fine-grained ones)

Tech Stack:
- Java 21, Spring Boot 3.5.3
- Spring Security + JWT (jjwt 0.12.6) + OAuth2 Client
- PostgreSQL, Hibernate/JPA
- ModelMapper

Key Classes:
Controllers: AdminController, AuthController, DoctorController, HospitalController, PatientController
Security: AuthService, AuthUtil, JwtAuthFilter, OAuth2SuccessHandler, CustomUserDetailsService, WebSecurityConfig, RolePermissionMapping
Services: AppointmentService, DoctorService, PatientService, InsuranceService
Entities: User, Patient, Doctor, Appointment, Insurance, Department
Repositories: PatientRepository, UserRepository, DoctorRepository, AppointmentRepository, InsuranceRepository, DepartmentRepository
`,

  jwtStarter: `
Project: jwt-spring-boot-starter

Overview:
A published Spring Boot auto-configuration starter library that provides plug-and-play JWT authentication.
Consumers add the dependency, configure three properties, and get a fully wired JWT security setup — no manual bean registration needed.
Published to GitHub Packages. Version 1.0.2. CI/CD via GitHub Actions.

What It Provides (Auto-Configured):
- JwtService (token generation, validation, claims extraction)
- JwtAuthenticationFilter (OncePerRequestFilter — plugged into the security chain)
- SecurityFilterChain (stateless, CSRF disabled, /auth/** public, all other routes protected)
- JwtConfigurationProperties (binds jwt.* from application.yml)

Two-Library Architecture:
This library (jwt-spring-boot-starter) depends on a separate lower-level library: jwt-core (com.smit:jwt-core:1.0.0).
- jwt-core: contains JwtService, JwtProperties model — the raw JWT logic (JJWT-based)
- jwt-spring-boot-starter: the Spring Boot auto-configuration layer on top of jwt-core

Configuration (application.yml):
jwt:
  secret-key: <your-secret>
  access-token-expiration: 600000   # default: 10 minutes
  refresh-token-expiration: 604800000 # default: 7 days

Auto-Configuration Mechanism:
- META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports registers:
  - JwtAutoConfiguration
  - JwtSecurityConfiguration
- Spring Boot picks these up automatically on classpath — zero manual @Import needed

Key Classes:
- JwtConfigurationProperties: @ConfigurationProperties(prefix = "jwt"), binds secretKey + expiration values
- JwtAutoConfiguration: creates JwtService bean (wrapping JwtProperties from jwt-core) and JwtAuthenticationFilter bean
- JwtSecurityConfiguration: creates SecurityFilterChain — stateless, CSRF off, /auth/** open, rest authenticated
- JwtAuthenticationFilter: extracts Bearer token, calls jwtService.validateToken(), extracts subject, sets UsernamePasswordAuthenticationToken in SecurityContextHolder

All three main beans use @ConditionalOnMissingBean:
- JwtService → overridable
- JwtAuthenticationFilter → overridable
- SecurityFilterChain → overridable
Consumer app defines its own bean → starter backs off automatically.

Authentication Filter Flow:
1. Extract Authorization header
2. Check for "Bearer " prefix — skip filter if absent
3. Validate token via jwtService.validateToken()
4. Extract subject via jwtService.extractSubject()
5. Build UsernamePasswordAuthenticationToken with empty authorities
6. Set into SecurityContextHolder
7. Continue filter chain

Default Security Rules (overridable):
- /auth/** → permitAll
- Everything else → authenticated

CI/CD:
- GitHub Actions (maven.yml) triggers on push and PR to main
- Runs: mvn clean install on ubuntu-latest with Java 21 (Temurin)
- Uses GITHUB_TOKEN for reading packages (jwt-core dependency from GitHub Packages)

Tech Stack:
- Java 21, Spring Boot 3.5.0 (autoconfigure)
- Spring Security
- JJWT (via jwt-core dependency)
- Maven, GitHub Packages, GitHub Actions
`,

  lmsPortal: `
Project: LMS Portal

Overview:
A RESTful Learning Management System API built with Spring Boot. Handles student registration, course management, instructor assignments, and enrollment tracking. Containerized with Docker and deployed on Render with PostgreSQL. Live at: https://lms-portal-backend-lug7.onrender.com/

This is the earliest project in the portfolio — intentionally simple, focused on clean layered architecture, JPA relational mapping, and basic REST API design without auth or DTOs.

Entities & Relationships:
- Student: id, name, email
- Instructor: id, name, email, expertise
- Course: id, title, description, price (double), ManyToOne Instructor
- Enrollment: id, ManyToOne Student, ManyToOne Course, enrolledAt (LocalDate)

Relationships:
- One Instructor → Many Courses
- One Student → Many Enrollments
- One Course → Many Enrollments
- Student ↔ Course is Many-to-Many via the Enrollment join entity

Endpoints:
Students (/student):
  GET    /student/             → get all students
  GET    /student/{id}         → get by id
  POST   /student/create       → create (with @Valid Jakarta validation)
  PUT    /student/update/{id}  → update name & email
  DELETE /student/delete/{id}  → delete, returns deleted student

Courses (/course):
  GET    /course/
  GET    /course/{id}
  POST   /course/create
  PUT    /course/update/{id}   → updates title, description, price (not instructor)
  DELETE /course/delete/{id}

Instructors (/instructor):
  GET    /instructor/
  GET    /instructor/{id}
  POST   /instructor/create
  PUT    /instructor/update/{id} → updates name, email, expertise
  DELETE /instructor/delete/{id}

Enrollments (/enrollment):
  GET    /enrollment/                          → all enrollments, sorted by enrolledAt DESC
  POST   /enrollment/create?studentId=&courseId= → enroll student, sets enrolledAt to today
  GET    /enrollment/courses/{studentId}       → list of courses a student is enrolled in
  GET    /enrollment/student/{courseId}        → list of students enrolled in a course

Enrollment Logic:
- Duplicate prevention via existsByStudentIdAndCourseId before saving
- enrolledAt is set server-side to LocalDate.now() — not client-provided
- getAllEnrollments sorted by enrolledAt DESC using Sort.by()

Repository Highlights:
- EnrollmentRepository: findByStudentId, findByCourseId, existsByStudentIdAndCourseId (duplicate check)
- StudentRepository: findByEmail (available, not currently wired to a controller)
- All others: standard JpaRepository methods only

Key Design Notes:
- No DTO layer — entities returned directly from controllers
- No Spring Security — all endpoints open
- No global exception handler — RuntimeException thrown directly from services
- StudentController uses ResponseEntity<> and @Valid; other controllers return raw entities
- Services use constructor injection via @Autowired (not @RequiredArgsConstructor)
- Swagger/OpenAPI included (springdoc 2.5.0) — UI at /swagger-ui/index.html
- Home controller (GET /) returns an inline HTML landing page as a String

Deployment:
- Multi-stage Dockerfile: maven:3.9.9-eclipse-temurin-21 for build, eclipse-temurin:21-jdk for run
- Deployed on Render (free tier)
- DB config uses environment variables with local fallbacks: DB_URL, DB_USERNAME, DB_PASSWORD

Seed Data (data.sql):
- 20 students, 8 instructors, 15 courses, 40 enrollments
- spring.sql.init.mode=never in production

Tech Stack:
- Java 21, Spring Boot 3.5.11
- Spring Data JPA (Hibernate), PostgreSQL
- Jakarta Validation (spring-boot-starter-validation)
- Swagger/OpenAPI (springdoc-openapi-starter-webmvc-ui 2.5.0)
- Lombok, Maven, Docker, Render

Key Classes:
Controllers: StudentController, CourseController, InstructorController, EnrollmentController, Home
Services: StudentService/Impl, CourseService/Impl, InstructorService/Impl, EnrollmentService/Impl
Repositories: StudentRepository, CourseRepository, InstructorRepository, EnrollmentRepository
Entities: Student, Course, Instructor, Enrollment
`

};

export default aiKnowledge;