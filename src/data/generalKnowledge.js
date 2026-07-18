const generalKnowledge = {

  about: `
Name: Smit Roy | Java Backend Developer | Expertise in Spring Boot, Microservices, System Design
Location: Kolkata, India
Education: MCA (Master of Computer Applications), specialization in Cloud Computing
Current Role: Associate Developer at Task Virtual Services, Kolkata (PHP-based systems, exposure to JavaScript)
Career Focus: Java Backend Developer — building production-grade Spring Boot systems, microservices, and distributed architectures

Technical Identity:
- Core expertise: Java, Spring Boot, Spring Security, PostgreSQL, Hibernate/JPA, Spring Cloud
- Proficient: JavaScript/TypeScript, React, SQL, Docker, Kafka, Redis
- Systems background: PHP-based systems, legacy modernization
- Published a JWT Spring Boot starter library to GitHub Packages with CI/CD via GitHub Actions
- Maintains a deep-dive technical blog on Spring Boot internals, Java concurrency, SQL optimization, DSA, and backend architecture

Portfolio Projects (in order of complexity):
1. CircuitMart — Spring Boot microservices e-commerce backend (in progress)
2. StayGrid — production-grade hotel booking backend (JWT, pessimistic locking, Stripe, dynamic pricing)
3. ClinicXHub — hospital management system (JWT + OAuth2, role-based + permission-based access)
4. LMS Portal — RESTful LMS API, Dockerized and deployed on Render

Links:
- GitHub: github.com/smitroy4
- Portfolio: smitroy.com
- LinkedIn: linkedin.com/in/smitroy22
`,

  java_core: `
=== CORE JAVA ===

OOP Pillars:
- Encapsulation: binding data and methods; access via getters/setters
- Inheritance: IS-A relationship; single inheritance in Java (use interfaces for multiple)
- Polymorphism: compile-time (method overloading) and runtime (method overriding via dynamic dispatch)
- Abstraction: hiding implementation via abstract classes or interfaces

Key Differences:
- Abstract class vs Interface: abstract class has state and constructors; interface (Java 8+) can have default/static methods; a class can implement multiple interfaces but extend only one abstract class
- == vs equals(): == checks reference equality; equals() checks logical equality (override for custom objects)
- String vs StringBuilder vs StringBuffer: String is immutable; StringBuilder is mutable and non-synchronized (preferred); StringBuffer is mutable and synchronized (thread-safe)

Exception Handling:
- Checked exceptions: must be declared or caught (IOException, SQLException)
- Unchecked exceptions: subclass of RuntimeException (NullPointerException, IllegalArgumentException)
- Error: serious JVM problems, not meant to be caught (OutOfMemoryError, StackOverflowError)
- try-with-resources: auto-closes AutoCloseable resources
- Custom exceptions: extend RuntimeException for unchecked, Exception for checked

Collections Framework:
- List: ordered, allows duplicates — ArrayList (fast random access), LinkedList (fast insert/delete)
- Set: no duplicates — HashSet (O(1) avg), LinkedHashSet (insertion order), TreeSet (sorted, O(log n))
- Map: key-value — HashMap (O(1) avg), LinkedHashMap (insertion order), TreeMap (sorted), Hashtable (synchronized, legacy)
- Queue: FIFO — LinkedList, PriorityQueue (heap-based ordering), ArrayDeque
- Stack: LIFO — Deque preferred over Stack class
- Collections utility class: sort(), reverse(), shuffle(), unmodifiableList(), synchronizedList()
- Comparable vs Comparator: Comparable defines natural ordering (compareTo in class); Comparator is external (compare method, passed to sort)

Generics:
- Type safety at compile time, erased at runtime (type erasure)
- Bounded wildcards: <? extends T> (upper bound, read-only), <? super T> (lower bound, write-friendly)
- Generic methods: <T> T methodName(T param)

Annotations:
- Built-in: @Override, @Deprecated, @SuppressWarnings, @FunctionalInterface
- Meta-annotations: @Retention, @Target, @Documented, @Inherited
- Custom annotations used heavily in Spring (processed at compile-time or runtime via reflection)

Inner Classes:
- Static nested class: can be instantiated without outer class instance
- Non-static inner class: has access to outer class instance
- Anonymous class: inline implementation of interface or abstract class
- Local class: defined inside a method

Immutability:
- Make class final, all fields private final, no setters, deep copy mutable fields in constructor
- Immutable objects are inherently thread-safe
`,

  java_modern: `
=== MODERN JAVA (Java 8–21) ===

Lambdas & Functional Interfaces:
- Lambda: (params) -> expression or block
- Functional interfaces have exactly one abstract method (@FunctionalInterface)
- Built-in: Function<T,R>, Predicate<T>, Consumer<T>, Supplier<T>, BiFunction<T,U,R>
- Method references: Class::method, instance::method, Class::new

Streams API:
- Lazy evaluation — intermediate ops don't execute until terminal op is called
- Intermediate: filter, map, flatMap, distinct, sorted, limit, skip, peek
- Terminal: collect, forEach, reduce, count, findFirst, anyMatch, allMatch, noneMatch, toList()
- Collectors: toList(), toSet(), toMap(), groupingBy(), partitioningBy(), joining(), counting()
- Parallel streams: parallelStream() — use with caution; overhead not always worth it for small datasets
- Optional<T>: container for nullable values — use isPresent(), orElse(), orElseThrow(), map(), filter()

Java 8+ Features:
- Default and static methods in interfaces
- Stream API, Optional
- LocalDate, LocalTime, LocalDateTime (java.time — replaces legacy Date/Calendar)
- CompletableFuture for async programming

Java 9–11:
- Modules (JPMS): module-info.java — explicit dependency declarations
- var (local variable type inference) — Java 10
- String methods: isBlank(), strip(), lines(), repeat()
- Files.readString(), Files.writeString()
- HTTP Client API (Java 11) — modern replacement for HttpURLConnection

Java 14–17:
- Records (Java 16): immutable data carriers — public record Point(int x, int y) {}; auto-generates constructor, getters, equals, hashCode, toString
- Sealed Classes (Java 17): restrict which classes can extend/implement — public sealed class Shape permits Circle, Rectangle {}
- Pattern Matching for instanceof: if (obj instanceof String s) { ... } — no explicit cast needed
- Switch Expressions: return values from switch, arrow syntax, exhaustiveness check
- Text Blocks: triple-quote multiline strings

Java 21:
- Virtual Threads (Project Loom): lightweight threads managed by JVM, not OS — ideal for I/O-bound tasks at massive scale
- Pattern Matching for switch (finalized)
- Sequenced Collections: new interfaces SequencedCollection, SequencedMap with defined encounter order
- Record Patterns in switch
`,

  java_concurrency: `
=== JAVA CONCURRENCY & MULTITHREADING ===

Thread Basics:
- Thread creation: extend Thread or implement Runnable (preferred), or use Callable for return values
- Thread lifecycle: NEW → RUNNABLE → BLOCKED/WAITING/TIMED_WAITING → TERMINATED
- Thread methods: start(), run(), sleep(), join(), interrupt(), yield()
- Daemon threads: background threads that don't prevent JVM shutdown

Synchronization:
- synchronized keyword: on methods or blocks — acquires intrinsic lock (monitor)
- volatile: ensures visibility across threads; prevents caching in CPU registers; not atomic for compound operations
- wait() / notify() / notifyAll(): called on object inside synchronized block for inter-thread communication

java.util.concurrent:
- ExecutorService: thread pool management — Executors.newFixedThreadPool(), newCachedThreadPool(), newSingleThreadExecutor()
- Future<T>: represents async result — get() blocks until done
- CompletableFuture<T>: non-blocking async — thenApply, thenCompose, thenCombine, exceptionally, allOf, anyOf
- CountDownLatch: blocks until count reaches zero — one-time use
- CyclicBarrier: reusable — waits until N threads reach barrier
- Semaphore: controls access to N permits
- ReentrantLock: explicit locking — tryLock(), lockInterruptibly(), fairness option
- ReadWriteLock: multiple readers or one writer

Thread-Safe Collections:
- ConcurrentHashMap: segment-level locking (Java 7), CAS operations (Java 8+)
- CopyOnWriteArrayList: thread-safe reads; writes create a new copy — ideal for read-heavy
- BlockingQueue: ArrayBlockingQueue, LinkedBlockingQueue — used in producer-consumer patterns
- AtomicInteger, AtomicLong, AtomicReference: lock-free atomic operations via CAS

Common Problems:
- Deadlock: two threads waiting on each other's locks — avoid by consistent lock ordering
- Race condition: outcome depends on thread scheduling — fix with synchronization
- Starvation: thread never gets CPU — fix with fair locks
- Livelock: threads keep changing state in response to each other but make no progress

ThreadLocal:
- Per-thread variable storage — commonly used for database connections, user context in web apps
- Spring uses it internally for SecurityContextHolder (thread-bound security context)
`,

  java_jvm: `
=== JVM INTERNALS ===

JVM Architecture:
- Class Loader: Bootstrap → Extension → Application (delegation model)
- Runtime Data Areas: Method Area (class metadata), Heap (objects), Stack (frames per thread), PC Register, Native Method Stack
- Execution Engine: Interpreter + JIT Compiler + Garbage Collector

Heap Structure:
- Young Generation: Eden + Survivor (S0, S1) — most objects die young (Minor GC)
- Old Generation (Tenured): long-lived objects (Major/Full GC)
- Metaspace (Java 8+): class metadata, replaces PermGen

Garbage Collection:
- Serial GC: single-threaded, for small apps
- Parallel GC: multi-threaded throughput-focused
- G1 GC (default Java 9+): region-based, predictable pause times
- ZGC / Shenandoah: low-latency, sub-millisecond pauses (Java 11+/15+)
- GC roots: static fields, local variables, active threads — objects reachable from roots are live
- Finalize() is deprecated — use try-with-resources or Cleaner

JIT Compilation:
- Hotspot JVM identifies hot methods (C1 → C2 compilation tiers)
- Escape analysis, inlining, dead code elimination
- JVM flags: -Xms (initial heap), -Xmx (max heap), -XX:+UseG1GC, -XX:MaxGCPauseMillis

Class Loading:
- Loading → Linking (Verify + Prepare + Resolve) → Initialization
- ClassNotFoundException vs NoClassDefFoundError
`,

  spring_boot: `
=== SPRING BOOT ===

Core Concepts:
- Convention over configuration — auto-configures beans based on classpath
- @SpringBootApplication = @Configuration + @ComponentScan + @EnableAutoConfiguration
- Application context: IoC container that manages bean lifecycle
- Bean scopes: Singleton (default), Prototype, Request, Session, Application

Dependency Injection:
- Constructor injection (recommended — immutable, testable)
- Setter injection, Field injection (@Autowired — avoid for testability)
- @Component, @Service, @Repository, @Controller — stereotype annotations
- @Bean in @Configuration class for explicit bean definition
- @Qualifier to resolve ambiguity when multiple beans of same type exist
- @Primary — default bean when ambiguity exists

Spring MVC:
- DispatcherServlet is the front controller
- @RestController = @Controller + @ResponseBody
- @RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping
- @PathVariable, @RequestParam, @RequestBody, @RequestHeader
- @ResponseStatus to set HTTP status on methods
- ResponseEntity<T> for full control over status + headers + body
- @Valid / @Validated + Jakarta Bean Validation on request bodies

Spring Data JPA:
- Repositories: CrudRepository → JpaRepository → PagingAndSortingRepository
- Derived query methods: findByNameAndEmail(), findByAgeGreaterThan()
- @Query for JPQL and native SQL
- @Modifying + @Transactional for UPDATE/DELETE queries
- @Lock(LockModeType.PESSIMISTIC_WRITE) for pessimistic locking
- Pagination: Pageable, PageRequest.of(page, size), Page<T>
- Fetch types: LAZY (load on access) vs EAGER (load immediately) — prefer LAZY
- N+1 problem: solved with JOIN FETCH in JPQL or @EntityGraph
- Cascade types: ALL, PERSIST, MERGE, REMOVE, REFRESH, DETACH
- @Transactional: ACID guarantees; propagation (REQUIRED default, REQUIRES_NEW, NESTED); isolation levels

Spring Security:
- SecurityFilterChain replaces WebSecurityConfigurerAdapter (deprecated)
- Filter chain processes every request — JWT filter added before UsernamePasswordAuthenticationFilter
- Authentication: who you are — AuthenticationManager, AuthenticationProvider, UserDetailsService
- Authorization: what you can do — hasRole(), hasAuthority(), @PreAuthorize, @Secured
- CSRF: enabled by default, disabled for stateless REST APIs
- Session management: STATELESS for JWT-based APIs
- Password encoding: BCryptPasswordEncoder (never store plain text)
- SecurityContextHolder: ThreadLocal storage for Authentication object

Spring AOP:
- Aspect-Oriented Programming — cross-cutting concerns (logging, security, transactions)
- Concepts: Aspect, JoinPoint, Pointcut, Advice (Before, After, Around, AfterReturning, AfterThrowing)
- @Transactional is implemented via AOP proxy
- Limitations: AOP works via proxy — internal method calls bypass advice

Auto-Configuration:
- spring.factories / AutoConfiguration.imports tells Spring which configurations to load
- @ConditionalOnMissingBean, @ConditionalOnClass, @ConditionalOnProperty
- @ConfigurationProperties for type-safe property binding

Profiles & Properties:
- @Profile("prod") — activate beans per environment
- application-{profile}.properties / .yml
- @Value("\${property}") for individual values
- Environment variables override application.properties

Actuator:
- /actuator/health, /actuator/info, /actuator/metrics, /actuator/env
- Custom health indicators via HealthIndicator
- Expose/secure endpoints via management.endpoints config

Scheduling:
- @EnableScheduling on main class
- @Scheduled(cron = "0 0 * * * *") — hourly; fixedRate, fixedDelay options
- Cron format: second minute hour day month weekday

Validation:
- @NotNull, @NotBlank, @NotEmpty, @Size, @Min, @Max, @Email, @Pattern
- @Valid on controller parameter triggers validation
- BindingResult or @ControllerAdvice to handle ConstraintViolationException

Exception Handling:
- @RestControllerAdvice + @ExceptionHandler for global error handling
- ResponseBodyAdvice for wrapping all responses in a standard envelope
`,

  microservices: `
=== MICROSERVICES ===

Core Principles:
- Single Responsibility: each service owns one bounded context
- Independently deployable and scalable
- Decentralized data management — each service has its own database
- Communicate via HTTP (REST) or messaging (Kafka, RabbitMQ)
- Design for failure — services will go down

Key Patterns:
- API Gateway: single entry point; handles routing, auth, rate limiting, SSL termination (Spring Cloud Gateway, Kong, Nginx)
- Service Discovery: services register themselves; clients discover dynamically (Eureka, Consul)
- Load Balancing: distribute traffic across instances (Ribbon — legacy; Spring Cloud LoadBalancer)
- Circuit Breaker: stop calling failing services; fail fast (Resilience4j, Hystrix — deprecated)
  - States: CLOSED (normal) → OPEN (failing, reject calls) → HALF_OPEN (probe recovery)
- Saga Pattern: distributed transaction management
  - Choreography: events-driven, services react to each other's events
  - Orchestration: central coordinator calls each service in sequence
- CQRS: Command Query Responsibility Segregation — separate read and write models
- Event Sourcing: store state as sequence of events, not current state
- Outbox Pattern: write event to DB in same transaction, relay worker publishes to message broker
- Strangler Fig: gradually migrate monolith by replacing pieces with microservices

Inter-Service Communication:
- Synchronous: REST (HTTP), gRPC (Protocol Buffers — binary, faster)
- Asynchronous: Kafka, RabbitMQ — decoupled, resilient to downstream failures
- Service Mesh: Istio, Linkerd — handles mTLS, observability, traffic management at infrastructure level

Spring Cloud:
- Spring Cloud Config: centralized config server
- Spring Cloud Netflix Eureka: service registry
- Spring Cloud Gateway: API gateway
- Spring Cloud OpenFeign: declarative HTTP client — @FeignClient
- Spring Cloud LoadBalancer: client-side load balancing
- Resilience4j: circuit breaker, retry, rate limiter, bulkhead

Distributed Tracing:
- Trace ID follows a request across all services
- Micrometer Tracing + Zipkin / Jaeger for visualization

Containerization:
- Docker: package app + dependencies into image
- Dockerfile: FROM, WORKDIR, COPY, RUN, EXPOSE, ENTRYPOINT
- Multi-stage builds: separate build and run stages — smaller final image
- docker-compose: define multi-container apps locally
- Kubernetes: orchestrates containers at scale — Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA

Challenges:
- Data consistency across services (no distributed ACID transactions)
- Network latency and partial failures
- Distributed tracing and debugging complexity
- Service versioning and backward compatibility
`,

  kafka: `
=== APACHE KAFKA ===

Core Concepts:
- Distributed event streaming platform
- Producer → Topic → Consumer
- Topics split into Partitions — parallelism unit
- Messages within a partition are ordered
- Offset: position of a message within a partition; consumer tracks its own offset
- Consumer Groups: each partition assigned to one consumer in a group — enables parallel consumption
- Brokers: Kafka servers; Zookeeper (or KRaft in newer versions) for cluster coordination
- Replication: each partition has a leader and replicas for fault tolerance

Key Properties:
- Retention: messages retained for configurable time (default 7 days) regardless of consumption
- At-most-once / At-least-once / Exactly-once delivery semantics
- Log compaction: keep only the latest value per key (for state topics)

Spring Kafka:
- @KafkaListener(topics = "topic-name", groupId = "group")
- KafkaTemplate<K,V> for producing messages
- @EnableKafka on configuration class
- ConsumerRecord<K,V> for accessing offset, partition, headers
- Error handling: SeekToCurrentErrorHandler, DeadLetterPublishingRecoverer

Use Cases:
- Event-driven microservices communication
- Real-time data pipelines
- Activity tracking (clicks, views)
- Log aggregation
`,

  databases_sql: `
=== SQL & RELATIONAL DATABASES ===

Core Concepts:
- ACID: Atomicity, Consistency, Isolation, Durability
- Normalization: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency), BCNF
- Denormalization: intentional redundancy for read performance

SQL Joins:
- INNER JOIN: matching rows in both tables
- LEFT JOIN: all rows from left + matching from right (NULL if no match)
- RIGHT JOIN: all from right + matching from left
- FULL OUTER JOIN: all rows from both (NULL where no match)
- CROSS JOIN: cartesian product
- SELF JOIN: table joined with itself

Indexes:
- B-Tree (default): balanced tree; good for range queries and equality
- Hash: exact match only; not for range queries
- Composite index: multiple columns; order matters (leftmost prefix rule)
- Covering index: query satisfied entirely from index (no table lookup)
- When NOT to index: low-cardinality columns, heavily written tables
- EXPLAIN / EXPLAIN ANALYZE: shows query execution plan

Transactions & Isolation:
- Isolation levels (weakest to strongest): READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE
- Problems by level: dirty read (fixed by READ COMMITTED), non-repeatable read (fixed by REPEATABLE READ), phantom read (fixed by SERIALIZABLE)
- Deadlocks: detect and roll back one transaction; prevent by consistent lock ordering
- Optimistic locking: check version/timestamp before commit (no DB lock)
- Pessimistic locking: SELECT FOR UPDATE — locks row until transaction ends

PostgreSQL Specifics:
- JSONB: binary JSON storage with indexing support
- Arrays, UUID, ENUM types
- CTE (WITH clause): readable complex queries
- Window functions: ROW_NUMBER(), RANK(), LAG(), LEAD(), SUM() OVER (PARTITION BY ...)
- Partial indexes: WHERE clause on index
- VACUUM / AUTOVACUUM: reclaim space from dead tuples
- Connection pooling: PgBouncer — PostgreSQL doesn't handle thousands of connections well natively

Advanced SQL:
- Subqueries vs JOINs: JOINs generally faster; subqueries more readable
- EXISTS vs IN: EXISTS short-circuits; IN materializes full result set
- GROUP BY + HAVING: HAVING filters after aggregation (WHERE filters before)
- CASE WHEN ... THEN ... ELSE ... END
- String functions: CONCAT, SUBSTRING, TRIM, UPPER, LOWER, COALESCE, NULLIF
- Date functions: NOW(), CURRENT_DATE, DATE_TRUNC, AGE, EXTRACT

Query Optimization:
- Avoid SELECT * — fetch only needed columns
- Avoid functions on indexed columns in WHERE (prevents index use)
- Use LIMIT for pagination; OFFSET is slow on large tables — use keyset pagination
- Batch inserts over individual inserts
`,

  databases_nosql: `
=== NoSQL DATABASES ===

Types:
- Document: MongoDB, CouchDB — JSON-like documents
- Key-Value: Redis, DynamoDB — fast lookups by key
- Column-Family: Cassandra, HBase — wide-column; great for time-series
- Graph: Neo4j — nodes and edges; relationship-heavy queries

MongoDB:
- Collections of BSON documents (schema-flexible)
- CRUD: insertOne/Many, findOne/find, updateOne/Many ($set, $push, $pull), deleteOne/Many
- Query operators: $eq, $ne, $gt, $lt, $in, $and, $or, $not, $exists
- Aggregation pipeline: $match, $group, $project, $sort, $limit, $lookup (join), $unwind
- Indexes: single field, compound, text, geospatial, TTL (auto-expire documents)
- Transactions: multi-document ACID transactions (replica set required)
- Sharding: horizontal scaling across shards by shard key
- Replication: replica sets — primary + secondaries; automatic failover

Redis:
- In-memory data structure store — sub-millisecond latency
- Data types: String, List, Set, Sorted Set (ZSet), Hash, Stream, HyperLogLog, Geo
- Common use cases: caching, session storage, rate limiting, pub/sub, leaderboards, distributed locks
- TTL: EXPIRE key seconds — auto-expiration
- Persistence: RDB (point-in-time snapshots) and AOF (append-only log of commands)
- Pub/Sub: PUBLISH channel message / SUBSCRIBE channel
- Lua scripting: atomic multi-step operations
- Cluster mode: horizontal scaling with hash slots (16384 slots across masters)
- Distributed lock: SET key value NX PX milliseconds (SETNX pattern)

CAP Theorem:
- Consistency: every read gets latest write
- Availability: every request gets a response (may not be latest)
- Partition Tolerance: system works despite network partitions
- Must choose 2: CP (MongoDB, HBase), AP (Cassandra, CouchDB), CA (single-node RDBMS — unrealistic in distributed)

SQL vs NoSQL:
- SQL: ACID, structured schema, complex joins — best for relational data and transactions
- NoSQL: flexible schema, horizontal scaling, high throughput — best for unstructured/semi-structured data at scale
`,

  spring_security_jwt: `
=== SPRING SECURITY + JWT (DEEP DIVE) ===

JWT Structure:
- Three Base64URL-encoded parts: Header.Payload.Signature
- Header: algorithm (HS256, RS256) + type
- Payload: claims — sub (subject), iat (issued at), exp (expiration), custom claims
- Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
- Stateless — server does not store tokens; validation is self-contained

Access vs Refresh Token:
- Access token: short-lived (10–15 min); sent in Authorization header
- Refresh token: long-lived (days/weeks); stored in HttpOnly cookie (XSS protection); used to get new access token
- HttpOnly cookie: inaccessible to JavaScript — prevents XSS token theft
- CSRF risk with cookies: mitigate with SameSite=Strict or CSRF tokens

JWT Filter Flow in Spring:
1. Request arrives at JwtAuthFilter (extends OncePerRequestFilter)
2. Extract Authorization header — check for "Bearer " prefix
3. Validate signature and expiration
4. Extract subject/claims
5. Load UserDetails if needed
6. Set UsernamePasswordAuthenticationToken in SecurityContextHolder
7. Continue filter chain — controller sees authenticated request

Token Invalidation (JWT limitation):
- JWTs are stateless — can't be invalidated before expiry by default
- Solutions: token blacklist in Redis (check on each request), short expiry + refresh, versioned tokens (store version in DB)

OAuth2:
- Authorization Code flow (most secure): app gets code → exchanges for token
- Client Credentials: service-to-service, no user involved
- Implicit flow: deprecated (tokens in URL — insecure)
- PKCE: Proof Key for Code Exchange — prevents authorization code interception (mobile/SPA)
- Spring OAuth2 Client: @EnableOAuth2Client, OAuth2AuthorizationCodeGrantRequestEntityConverter, OAuth2SuccessHandler

Role vs Permission (RBAC vs PBAC):
- RBAC: hasRole("ADMIN") — coarse-grained
- PBAC/attribute-based: hasAuthority("appointment:delete") — fine-grained
- Best practice: combine both — roles as groups of permissions
- @EnableMethodSecurity enables @PreAuthorize, @PostAuthorize, @Secured, @RolesAllowed
`,

  design_patterns: `
=== DESIGN PATTERNS ===

Creational:
- Singleton: one instance; use enum Singleton or Bill Pugh holder — avoid double-checked locking in Java
- Factory Method: subclass decides which object to create
- Abstract Factory: factory of factories — families of related objects
- Builder: step-by-step object construction; Lombok @Builder generates this
- Prototype: clone existing object

Structural:
- Adapter: convert interface to another — wrap incompatible class
- Decorator: add behaviour dynamically by wrapping object — used in StayGrid's pricing engine
- Facade: simplified interface to complex subsystem
- Proxy: surrogate that controls access — Spring AOP, lazy loading
- Composite: tree structure of objects treated uniformly
- Flyweight: share common state to reduce memory (e.g., String pool)

Behavioral:
- Strategy: interchangeable algorithms — define interface, multiple implementations, swap at runtime
- Observer: event-driven — publisher notifies subscribers (used in Spring Events, Kafka)
- Command: encapsulate request as object — supports undo/redo
- Chain of Responsibility: pass request along handler chain — Spring Security filter chain
- Template Method: define algorithm skeleton; subclasses fill in steps
- Iterator: traverse collection without exposing internals
- State: object behaviour changes based on internal state — booking lifecycle (RESERVED → CONFIRMED)

SOLID Principles:
- S — Single Responsibility: one reason to change per class
- O — Open/Closed: open for extension, closed for modification (use interfaces/abstract)
- L — Liskov Substitution: subclass must be substitutable for parent without breaking behaviour
- I — Interface Segregation: prefer small, focused interfaces over large general ones
- D — Dependency Inversion: depend on abstractions, not concretions (inject interfaces, not implementations)

Other Principles:
- DRY: Don't Repeat Yourself
- KISS: Keep It Simple, Stupid
- YAGNI: You Aren't Gonna Need It (don't over-engineer)
- Law of Demeter: only talk to immediate collaborators
`,

  system_design: `
=== SYSTEM DESIGN ===

Scalability:
- Vertical scaling: more CPU/RAM on same machine — limited ceiling
- Horizontal scaling: more machines — requires stateless services, load balancing
- Load balancer: distribute traffic — Round Robin, Least Connections, IP Hash, Weighted
- Stateless services: no server-side session — enables horizontal scaling (use JWT, Redis for shared state)

Caching:
- Cache-aside (lazy loading): app checks cache, fetches from DB on miss, populates cache
- Write-through: write to cache and DB simultaneously
- Write-behind: write to cache, async flush to DB
- Read-through: cache handles DB fetch
- Eviction policies: LRU (Least Recently Used), LFU, TTL
- Cache invalidation: hardest problem — use event-driven invalidation or short TTLs
- CDN: cache static assets at edge locations globally

Database Scaling:
- Read replicas: replicate DB for read traffic — eventual consistency
- Sharding: partition data across multiple DB instances by shard key — no cross-shard joins
- Connection pooling: reuse DB connections — HikariCP (default in Spring Boot)

Availability & Reliability:
- SLA (Service Level Agreement): uptime guarantee (99.9% = 8.7h downtime/year, 99.99% = 52min)
- Redundancy: eliminate single points of failure
- Health checks: load balancer removes unhealthy instances
- Graceful degradation: return partial results or fallback instead of failing completely
- Bulkhead pattern: isolate failures — separate thread pools per service

Rate Limiting:
- Token bucket, Leaky bucket, Fixed window, Sliding window algorithms
- Implement at API gateway level
- Store counters in Redis for distributed rate limiting

Content Delivery:
- CDN: Cloudflare, AWS CloudFront — static files, images, videos served from edge
- Object storage: AWS S3, Cloudflare R2 — scalable blob storage; use signed URLs for private access

Common System Design Questions:
- URL shortener: hash URL to 6-char code, store in DB, redirect on lookup; handle collisions
- Rate limiter: Redis + sliding window counter per user/IP
- Notification service: Kafka for async delivery, multiple consumers (email, SMS, push)
- Chat app: WebSocket for real-time; Kafka for persistence; Redis for online presence
- Hotel booking (StayGrid-like): pessimistic locking or optimistic locking for inventory; event-driven payment confirmation
`,

  rest_api: `
=== REST API DESIGN ===

Principles:
- Stateless: server holds no client session state
- Uniform interface: consistent URL conventions, HTTP verbs, status codes
- Client-Server separation: UI and backend are independent
- Cacheable: responses should indicate cacheability
- Layered system: client doesn't know if talking to gateway, cache, or origin

HTTP Methods:
- GET: retrieve (idempotent, safe)
- POST: create (not idempotent)
- PUT: full update/replace (idempotent)
- PATCH: partial update (not always idempotent)
- DELETE: remove (idempotent)

URL Design:
- Use nouns, not verbs: /users not /getUsers
- Plural resource names: /hotels, /bookings
- Nested resources: /hotels/{hotelId}/rooms (when context is necessary)
- Avoid deep nesting (max 2 levels) — use query params for filtering
- Query params for filtering, sorting, pagination: /hotels?city=Kolkata&page=0&size=10

Status Codes:
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request (validation), 401 Unauthorized (no auth), 403 Forbidden (auth but no access), 404 Not Found, 409 Conflict
- 500 Internal Server Error, 503 Service Unavailable

Versioning:
- URI versioning: /api/v1/hotels (most common)
- Header versioning: Accept: application/vnd.api.v1+json
- Query param: /hotels?version=1

Best Practices:
- Always use HTTPS
- Return consistent error response format (status, message, timestamp)
- Use ETag for cache validation
- Implement pagination on list endpoints
- Idempotency keys for payment and mutation endpoints
- Rate limiting and throttling
- HATEOAS (optional but discoverable APIs)
`,

  docker_devops: `
=== DOCKER & DEVOPS ===

Docker:
- Image: read-only template (layered filesystem)
- Container: running instance of an image
- Dockerfile: recipe for building an image
  - FROM: base image
  - WORKDIR: set working directory
  - COPY / ADD: copy files into image
  - RUN: execute commands during build (installs dependencies)
  - EXPOSE: document which port app listens on (doesn't publish)
  - ENV: set environment variables
  - ENTRYPOINT: main command (not overridable); CMD: default args (overridable)
- Multi-stage build: use one stage to build, copy artifact to lean runtime image — reduces final image size
- docker-compose: define multi-container apps; networks + volumes + service dependencies
- Named volumes vs bind mounts: volumes managed by Docker (persistent); bind mounts link to host path

Docker commands:
- docker build -t name:tag .
- docker run -p hostPort:containerPort -e VAR=value -d imageName
- docker exec -it containerName bash
- docker logs containerName
- docker ps, docker images, docker stop, docker rm, docker rmi
- docker-compose up -d, docker-compose down

GitHub Actions CI/CD:
- Triggered by push, pull_request, schedule, workflow_dispatch
- Jobs run on runners (ubuntu-latest, windows-latest, macos-latest)
- Steps: uses (actions) + run (shell commands)
- Secrets: stored in repo settings, referenced as SECRET_NAME
- Matrix builds: test across multiple versions simultaneously
- Artifacts: upload/download files between jobs
- Environments: dev, staging, prod — with approval gates

Deployment Platforms:
- Render: simple free-tier deployment; supports Docker, auto-deploy from GitHub
- Railway: similar to Render; good free tier
- Fly.io: global deployment; Dockerfile-based
- AWS: EC2 (VMs), ECS (containers), EKS (Kubernetes), Lambda (serverless), RDS (managed DB), S3 (storage)
- Neon: serverless PostgreSQL; branching for dev environments
- Cloudinary: image/video storage + CDN + transformations
`,

  git: `
=== GIT ===

Core Workflow:
- git init, git clone
- git add, git commit -m, git push, git pull
- git status, git log --oneline, git diff

Branching:
- git branch branchName, git checkout -b branchName
- git merge branchName (creates merge commit)
- git rebase branchName (reapplies commits on top — cleaner history, rewrites history)
- git cherry-pick commitHash — apply specific commit to current branch

Undoing:
- git revert commitHash — creates new commit that undoes (safe for shared branches)
- git reset --soft HEAD~1 — undo commit, keep changes staged
- git reset --mixed HEAD~1 — undo commit, keep changes unstaged
- git reset --hard HEAD~1 — undo commit, discard changes (destructive)
- git stash / git stash pop — temporarily shelve changes

Branching Strategies:
- Git Flow: main + develop + feature/release/hotfix branches
- Trunk-Based: all devs merge to main frequently; feature flags for incomplete features
- GitHub Flow: main is always deployable; short-lived feature branches; PR → merge

Pull Requests:
- Code review before merge
- Squash merge: combine all commits into one
- Merge commit: preserve all commits
- Rebase and merge: linear history
`,

  javascript: `
=== JAVASCRIPT ===

Core:
- Dynamic, weakly typed, single-threaded with event loop
- var (function-scoped, hoisted), let (block-scoped), const (block-scoped, not reassignable)
- Hoisting: declarations moved to top of scope; var initialized to undefined; let/const hoisted but in temporal dead zone
- Closures: function retains access to outer scope even after outer function returns
- this: depends on call site — regular function (caller), arrow function (lexical/outer this)
- Prototype chain: objects inherit from __proto__; Object.create(), class syntax sugar over prototypes

ES6+ Features:
- Destructuring: const { name, age } = obj; const [first, ...rest] = arr
- Spread/Rest: ...args in params (rest), ...arr in calls (spread)
- Template literals: Hello ${name} — multi-line strings, interpolation
- Arrow functions: (x) => x * 2 — no own this, arguments, super
- Default params: function fn(x = 10)
- Optional chaining: obj?.prop?.nested — short-circuits to undefined if null/undefined
- Nullish coalescing: a ?? b — returns b only if a is null or undefined (not falsy)
- Modules: import/export (ESM); require/module.exports (CJS)
- Promise: represents eventual completion/failure — then(), catch(), finally()
- async/await: syntactic sugar over promises — makes async code look synchronous
- Promise.all(): wait for all; Promise.allSettled(): wait for all regardless of failure; Promise.race(): first to settle
- Symbol: unique primitive — used for hidden properties, custom iterators
- WeakMap / WeakSet: garbage-collectible references — no memory leaks
- Generators: function* — pauseable functions using yield; used in Redux-Saga

Event Loop:
- Call stack → Web APIs → Callback queue (macrotasks) → Microtask queue (promises, queueMicrotask)
- Microtasks (promise callbacks) always run before next macrotask (setTimeout, setInterval)
- setTimeout(fn, 0) defers to next macrotask, not immediate

Type System:
- typeof: "string", "number", "boolean", "object", "undefined", "function", "symbol", "bigint"
- null typeof is "object" (legacy bug)
- == (loose equality with coercion) vs === (strict equality, no coercion) — always prefer ===
- Truthy/Falsy: false, 0, "", null, undefined, NaN are falsy; everything else truthy

Arrays & Objects:
- Array methods: map, filter, reduce, find, findIndex, some, every, flat, flatMap, forEach, sort, splice, slice
- Object methods: Object.keys(), Object.values(), Object.entries(), Object.assign(), Object.freeze(), Object.create()
- Spread for shallow copy: const copy = { ...original }
- Deep copy: structuredClone(obj) (modern), JSON.parse(JSON.stringify(obj)) (limitations with functions/undefined)
`,

  react: `
=== REACT ===

Core Concepts:
- Component-based UI library (not a framework)
- Virtual DOM: React diffs virtual tree against previous — batches actual DOM updates
- JSX: JavaScript + XML syntax — transpiled to React.createElement()
- Unidirectional data flow: parent → child via props; child → parent via callback props

Hooks:
- useState: local state — const [value, setValue] = useState(initial)
- useEffect: side effects — runs after render; cleanup function in return; dependency array controls when
- useRef: mutable ref that doesn't trigger re-render; access DOM elements directly
- useContext: consume context without prop drilling
- useReducer: complex state logic — (state, action) => newState; like mini Redux
- useMemo: memoize expensive computed values; only recomputes when deps change
- useCallback: memoize function reference; prevents unnecessary child re-renders
- Custom hooks: extract reusable stateful logic — function name starts with use

Component Lifecycle (hooks equivalent):
- Mount: useEffect(() => { ... }, []) — empty deps = runs once
- Update: useEffect(() => { ... }, [dep]) — runs when dep changes
- Unmount: return cleanup function from useEffect

State Management:
- Local: useState / useReducer
- Lifted state: move state to common parent
- Context API: global state without external library — useContext + createContext
- Redux: predictable state container; Redux Toolkit simplifies boilerplate; RTK Query for data fetching
- Zustand, Jotai: lightweight alternatives

React Router:
- BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation
- Nested routes, layout routes, protected routes (wrapper component checks auth)

Performance:
- React.memo: prevents re-render if props unchanged
- useMemo + useCallback: avoid recreating values/functions on every render
- Code splitting: React.lazy() + Suspense — loads components on demand
- Virtualization: react-window / react-virtual — render only visible list items
- Key prop: helps React identify which list items changed — use stable unique IDs, not index

Data Fetching:
- useEffect + fetch/axios (basic)
- React Query (TanStack Query): caching, background refetching, loading/error states, pagination
- SWR: stale-while-revalidate pattern

Patterns:
- Controlled components: form input value tied to state
- Uncontrolled components: use ref to access DOM value directly
- Compound components: parent + children share implicit state via Context
- Render props: pass function as prop that returns JSX
- HOC (Higher Order Component): wraps component to add behaviour — largely replaced by hooks
`,

  testing: `
=== TESTING ===

Testing Pyramid:
- Unit tests (most): test single function/class in isolation — fast, numerous
- Integration tests (middle): test interaction between components (controller + service + DB)
- E2E tests (least): test full user flow through the system — slow, expensive

Java Testing:
- JUnit 5: @Test, @BeforeEach, @AfterEach, @BeforeAll, @AfterAll, @ParameterizedTest, @Disabled
- Assertions: assertEquals, assertTrue, assertThrows, assertAll
- Mockito: @Mock, @InjectMocks, @Spy; when().thenReturn(), verify(), doThrow()
- @ExtendWith(MockitoExtension.class) or @MockitoSettings
- Spring Boot Test: @SpringBootTest (full context), @WebMvcTest (slice — controller only), @DataJpaTest (slice — JPA only)
- MockMvc: test controllers without running server — mockMvc.perform(get("/url")).andExpect(status().isOk())
- TestContainers: spin up real Docker containers for integration tests (PostgreSQL, Redis, Kafka)

JavaScript Testing:
- Jest: unit testing + mocking + code coverage
- React Testing Library: test components from user perspective — getByRole, getByText, fireEvent, userEvent
- Cypress / Playwright: E2E browser testing

Test Principles:
- AAA pattern: Arrange, Act, Assert
- One assertion per test (ideal)
- Test behaviour, not implementation
- Avoid testing private methods directly
- Use test doubles: Mock (records interactions), Stub (returns preset values), Fake (working lightweight impl), Spy (wraps real object)
`,

  dsa: `
=== DATA STRUCTURES & ALGORITHMS ===

Time Complexity:
- O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2ⁿ) exponential
- Best case / Worst case / Average case — Big O is worst case by convention

Arrays & Strings:
- Two pointers: opposite ends or slow/fast — used for palindrome, pair sum, remove duplicates
- Sliding window: fixed or variable window — max sum subarray, longest substring without repeat
- Prefix sums: precompute cumulative sums for range queries in O(1)
- In-place operations: swap, reverse, rotate

Linked List:
- Cycle detection: Floyd's algorithm (slow/fast pointers)
- Find middle: slow/fast pointers
- Reverse in-place: prev, curr, next pointer manipulation
- Merge sorted lists: dummy head technique

Stack & Queue:
- Stack: balanced parentheses, next greater element (monotonic stack), DFS iterative
- Queue: BFS, sliding window maximum (deque/monotonic queue)
- Deque: double-ended queue — supports both stack and queue ops

Trees:
- Binary tree traversals: Inorder (left-root-right), Preorder (root-left-right), Postorder (left-right-root)
- BFS (level order): queue-based
- DFS: recursive or stack-based
- BST property: left < root < right; search/insert/delete O(h) where h is height
- Balanced BSTs: AVL, Red-Black — O(log n) guaranteed
- Heap: complete binary tree; max-heap or min-heap; insert/delete O(log n); peek O(1)
- PriorityQueue in Java uses min-heap

Graphs:
- Representation: adjacency list (sparse), adjacency matrix (dense)
- BFS: shortest path in unweighted graph; level-by-level exploration
- DFS: cycle detection, topological sort, connected components
- Topological sort: Kahn's (BFS, in-degree), DFS with stack
- Dijkstra: shortest path in weighted graph (non-negative) — PriorityQueue, O((V+E) log V)
- Union-Find: detect cycles, connected components — path compression + union by rank
- Minimum Spanning Tree: Prim's or Kruskal's

Sorting:
- Bubble O(n²), Selection O(n²), Insertion O(n²) — simple, small datasets
- Merge Sort O(n log n): stable, extra space, good for linked lists
- Quick Sort O(n log n) avg, O(n²) worst: in-place, fast in practice
- Heap Sort O(n log n): in-place, not stable
- Arrays.sort() in Java: Dual-Pivot QuickSort for primitives, TimSort (merge+insertion) for objects

Dynamic Programming:
- Overlapping subproblems + optimal substructure
- Top-down (memoization): recursion + cache
- Bottom-up (tabulation): iterative, fill DP table
- Classic problems: Fibonacci, Knapsack, Longest Common Subsequence, Longest Increasing Subsequence, Coin Change, Edit Distance

Binary Search:
- Requires sorted array; O(log n)
- Template: left=0, right=n-1, mid=(left+right)/2, narrow search space each iteration
- Variations: find first/last occurrence, search rotated array, find minimum in rotated array
`,

  software_engineering: `
=== SOFTWARE ENGINEERING PRINCIPLES ===

Clean Code:
- Meaningful names: variables/methods should reveal intent
- Small functions: do one thing well
- Avoid magic numbers: use named constants
- No dead code, no commented-out code
- Fail fast: validate early, throw meaningful exceptions
- Comments explain WHY, not WHAT (code should be self-explanatory)

Code Review:
- Check for correctness, readability, performance, security, test coverage
- Review architecture decisions, not just syntax
- Constructive tone — suggest, don't command

API Design:
- Backward compatibility: don't break existing clients — add, don't remove
- Versioning: /v1/, /v2/ — deprecate old versions gracefully
- Pagination, filtering, sorting on list endpoints
- Idempotency: safe to call multiple times with same result (GET, PUT, DELETE)

Security Basics:
- OWASP Top 10: Injection, Broken Auth, XSS, IDOR, Security Misconfiguration, etc.
- SQL Injection: use parameterized queries / ORM — never concatenate user input
- XSS: sanitize output, use Content-Security-Policy headers
- CSRF: SameSite cookies, CSRF tokens (for session-based auth)
- Sensitive data: never log passwords/tokens, use environment variables for secrets
- HTTPS everywhere: TLS 1.2+ minimum
- Input validation: validate on server — never trust client input
- Principle of least privilege: only grant minimum necessary permissions

Logging & Monitoring:
- Structured logging: JSON format — easier to query in log aggregators
- Log levels: ERROR (action needed), WARN (potential problem), INFO (normal operations), DEBUG (diagnostic)
- Don't log sensitive data (PII, passwords, tokens)
- Centralized logging: ELK stack (Elasticsearch + Logstash + Kibana), Grafana + Loki
- Metrics: Prometheus + Grafana for dashboards; track error rates, latency, throughput
- Alerting: PagerDuty, Grafana alerts — notify on anomalies
`

};

export default generalKnowledge;