## From Monoliths to Your First Service Mesh — Eureka, Gateway, Config Server, and the Patterns That Hold It All Together

> *A monolith is one building with every department under one roof — you walk down the hall to talk to Accounts. Microservices are the same company spread across ten buildings in ten different cities — talking to Accounts now means a phone call that might not get answered. Most developers jump into microservices chasing the "cool architecture" without realizing they just signed up for network engineering, distributed systems, and DevOps — on top of the business logic they already had to write. This guide builds the foundation properly, one building at a time.*

Microservices are not a free upgrade over monoliths — they are a trade. You give up simplicity, in-process reliability, and single-deployment convenience, and in exchange you get independent scalability, fault isolation, and team autonomy. Most teams that regret adopting microservices didn't lose because the technology failed — they lost because they never understood the trade they were making. This guide builds the complete foundational mental model: when splitting actually makes sense, how Spring Cloud's components fit together, how services find and talk to each other, and how to containerize and expose each piece safely — all with the depth needed to build your first real microservices system deliberately, not by copying a tutorial.

---

<a id="ch1"></a>
## Chapter 1 — Monolith vs Microservices: What You're Actually Trading

A **monolith** is a single deployable unit — one JAR, one process, one codebase — where every module (orders, inventory, users, payments) runs in the same runtime and talks to every other module through plain Java method calls. A **microservices architecture** breaks that single unit into multiple independently deployable services, each owning a specific business capability, communicating over the network instead of through method calls.

The distinction that actually matters is not "how many services do I have" — it's **what kind of call replaced what kind of call**. In a monolith, `OrderService.createOrder()` calling `InventoryService.reserveStock()` is an in-process method call: nanoseconds, no serialization, guaranteed to either fully happen or throw an exception you can catch in the same stack frame. In microservices, that same call becomes an HTTP request over a network: milliseconds instead of nanoseconds, JSON serialization and deserialization, and a whole new category of failure that never existed before — the network can be slow, the other service can be down, the request can time out, or it can succeed on the server but the response can get lost on the way back. This is the single most important thing to internalize before writing a single `@RestController` for a microservice: **you are trading a call that cannot partially fail for a call that can fail in a dozen new ways**, and every pattern in this guide — discovery, gateways, circuit breakers (covered in the Proficient part of this series) — exists to manage that trade-off.

```
MONOLITH                              MICROSERVICES
──────────────────────────            ──────────────────────────────────────
One deployable unit                   N independently deployable services
In-process method calls               Network calls (HTTP/gRPC/messaging)
One database (usually)                Database-per-service
One technology stack                  Polyglot possible (per service)
Scale the whole app                   Scale individual services
One team can own it early on          Needs team-per-service ownership at scale
Transactions are ACID                 Transactions are distributed (Sagas, eventual consistency)
Deploy = redeploy everything          Deploy = redeploy one service
Failure = usually the whole app       Failure = can be isolated to one service
Debugging = one stack trace           Debugging = distributed tracing across services
```

The monolith is not the "beginner" architecture that you graduate out of — it is frequently the **correct** architecture, especially early in a product's life when the domain boundaries are still unclear and the team is small enough to coordinate a single deployment. Martin Fowler's now-famous advice, "monolith first," exists precisely because splitting a system along the wrong boundaries is far more expensive to undo than staying monolithic a little longer. A poorly split microservice architecture is strictly worse than a monolith — you get all the network complexity with none of the team-autonomy benefit, because your services are still tightly coupled in disguise (a pattern sometimes called a "distributed monolith").

> 💡 **Interview framing:** when asked "monolith vs microservices, which is better," the strong answer is never "microservices, obviously" — it's naming the specific trade-offs (deployment independence vs operational complexity, fault isolation vs distributed debugging) and stating that the right choice depends on team size, domain maturity, and scaling needs. Interviewers are testing whether you understand the trade, not whether you have a favorite.

---

<a id="ch2"></a>
## Chapter 2 — When to Split: The Signals That Actually Matter

Splitting a monolith into microservices should be a response to specific, observable pain — not a default architectural starting point. There are four signals that genuinely justify a split, and none of them are "microservices are the modern way to build software."

The first signal is **independent scaling need**. If your `ImageProcessingService` needs ten times the CPU of everything else in your application during peak load, but the rest of your app is idle, keeping it inside the monolith means you scale the entire application just to get more capacity for one workload — wasting resources on every other module that didn't need it. Splitting that module into its own service means you scale exactly the part that needs it, independently, without touching anything else.

The second signal is **independent deployment need**. If your `PaymentService` changes weekly (new gateways, new fraud rules) but your `UserProfileService` changes twice a year, bundling them into one deployable means every payment fix requires a full redeploy of user profile code too — increasing the blast radius of every release and slowing down the team that owns payments. Splitting removes that coupling: payments ship on their own schedule.

The third signal is **team boundary alignment**, formalized as **Conway's Law** — "organizations design systems that mirror their own communication structure." If you have four teams that constantly step on each other's code in the same monolith repository — merge conflicts, coordinated release trains, one team's bug blocking another team's deploy — splitting along team boundaries (not arbitrary technical boundaries) removes the coordination tax. This only works if the teams are actually separate and empowered to own their service end-to-end; splitting the code without splitting the team just adds network latency to the same coordination problem.

The fourth signal is **fault isolation need**. If a memory leak in your recommendation engine should never be able to take down checkout, keeping them in the same process means a `.jar` full of unrelated code that fails together will fail together. Splitting them means checkout keeps running even when recommendations fall over — a genuinely different reliability profile.

![Monolith vs Microservices architecture comparison diagram](/images/blogs/internals/monolith-vs-microservices-architecture.png)

Domain boundaries for the split itself should come from **Domain-Driven Design's bounded contexts** — group functionality by business capability (Orders, Inventory, Payments, Users), not by technical layer (never split into a "Controllers Service" and a "Repository Service" — that's a distributed monolith with extra HTTP hops and zero benefit). A useful gut check: if two pieces of functionality always change together and are always deployed together, they probably belong in the same service regardless of how "different" they look on a whiteboard.

> ⚠️ **Golden Rule:** never split a monolith into microservices before the domain boundaries are stable. Splitting too early means you're guessing at boundaries you don't understand yet, and every wrong boundary you draw becomes a network call you now have to live with — undoing a bad service boundary is dramatically more expensive than undoing a bad package boundary in a monolith, because it usually means a painful data migration across two now-separate databases (see Chapter 10).

---

<a id="ch3"></a>
## Chapter 3 — Spring Boot + Spring Cloud: What Spring Cloud Actually Adds

Spring Boot gives you everything needed to build a single, self-contained service — embedded Tomcat, auto-configuration, `@RestController`, dependency injection, and a runnable JAR. None of that solves the problems that appear only once you have *multiple* services that need to find each other, share configuration, and survive individual failures without taking the whole system down. That's the gap **Spring Cloud** fills — it is not a replacement for Spring Boot, it's a layer of distributed-systems tooling built on top of it.

Spring Cloud is really an umbrella project — a collection of independently versioned sub-projects, each solving one distributed-systems problem, unified under a single BOM (Bill of Materials) so their versions are guaranteed compatible with each other and with your Spring Boot version. This guide's foundational layer uses four of them: **Spring Cloud Netflix Eureka** for service discovery (Chapter 5), **Spring Cloud Gateway** for API routing (Chapter 6), **Spring Cloud Config** for externalized configuration (Chapter 7), and Spring Boot's own `RestTemplate`/`WebClient` for inter-service HTTP calls (Chapter 8).

```xml
<!-- pom.xml — parent POM sets the Spring Cloud version via BOM -->
<properties>
    <java.version>21</java.version>
    <spring-cloud.version>2024.0.0</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <!-- BOM — pins compatible versions for every Spring Cloud starter you add below -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

The mental model worth holding onto: every Spring Cloud component you add is solving a problem that **only exists because you have more than one service**. A single monolith never needs to "discover" itself, never needs a gateway to route between its own modules (it's all one process), and never needs externalized config shared across instances because there's only one deployable to configure. Spring Cloud's entire value proposition is managing the complexity that the split from Chapter 1 introduced — which is exactly why it should only be reached for once that split is actually justified.

---

<a id="ch4"></a>
## Chapter 4 — REST API Design Between Services

Once services communicate over HTTP instead of method calls, the API contract between them becomes a first-class design artifact — not an implementation detail. A method call in a monolith can change its signature and the compiler catches every broken caller immediately. A REST endpoint between two independently deployed services has no compiler checking anything — if `OrderService` expects a field that `InventoryService` renamed last Tuesday, that failure shows up at runtime, in production, potentially only under specific conditions.

Good inter-service REST design starts with **resource-oriented URLs** that model nouns, not verbs — `POST /api/v1/orders`, not `POST /api/v1/createOrder`. The verb belongs in the HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), not the URL path. This isn't stylistic pedantry — it's what makes the API predictable to every other service's developer without reading documentation first, because HTTP method + resource path is a convention every backend engineer already knows.

Versioning the API from day one — `/api/v1/...` — is non-negotiable for inter-service contracts specifically because you cannot force every consuming service to upgrade in lockstep with you the way you could force every module in a monolith to recompile together. When you need a breaking change, you ship `/api/v2/...` alongside `/api/v1/...`, let consumers migrate on their own schedule, and only remove `v1` once nothing depends on it anymore.

```java
// OrderController — resource-oriented, versioned, consistent response shape
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrder(@PathVariable Long orderId) {
        return orderService.findById(orderId);
    }

    // Pagination is mandatory for any list endpoint between services —
    // an unbounded list call is how one slow service takes down another
    @GetMapping
    public Page<OrderResponse> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.findAll(PageRequest.of(page, size));
    }
}
```

A consistent **error response contract** matters more between services than it ever did inside a monolith — the caller is a different codebase entirely, often owned by a different team, and it needs a predictable shape to parse regardless of which service threw the error.

```java
// A shared error shape every service in the system returns — never a raw stack trace
public record ErrorResponse(
    String errorCode,      // machine-readable — "ORDER_NOT_FOUND", "INSUFFICIENT_STOCK"
    String message,        // human-readable, safe to log or display
    Instant timestamp,
    String path
) {}

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            OrderNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            "ORDER_NOT_FOUND", ex.getMessage(), Instant.now(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

> 💡 **Pro tip:** treat every inter-service DTO as a contract, not a convenience. Never expose your JPA `@Entity` directly as a REST response body — a database column rename would silently break every consuming service. A dedicated `OrderResponse` record decouples your database schema from your public API shape, so you can refactor internals freely as long as the contract stays stable.

---

<a id="ch5"></a>
## Chapter 5 — Service Discovery With Eureka: Internals

In a monolith, calling another module means calling a Java object you already have a reference to. In microservices, calling `InventoryService` means first answering a much harder question: **where is it right now?** Services in a containerized, auto-scaled environment don't have fixed IP addresses — instances get killed and restarted, new instances get added under load, IPs get reassigned. Hardcoding `http://192.168.1.15:8082` into `OrderService`'s configuration breaks the moment that instance is replaced. **Service discovery** solves exactly this problem: a central registry that every service instance announces itself to, and every service instance can query to find the current location of any other service.

**Eureka**, from Netflix's OSS stack, is Spring Cloud's most common discovery server for this. The mental model: Eureka is a **phone directory that updates itself continuously**. Every service instance, on startup, calls Eureka and says "I am `inventory-service`, and I'm reachable at `10.0.4.22:8082`." Eureka stores that. Every 30 seconds by default, each instance sends a **heartbeat** to Eureka to say "I'm still alive" — if Eureka stops receiving heartbeats from an instance for a configurable window, it evicts that instance from the registry, so nobody gets routed to a dead service.

```
                    ┌─────────────────────────┐
                    │   Eureka Server          │
                    │   (Service Registry)     │
                    │                          │
                    │  inventory-service:      │
                    │    10.0.4.22:8082  ✓     │
                    │    10.0.4.31:8082  ✓     │
                    │  order-service:          │
                    │    10.0.5.10:8081  ✓     │
                    └─────────────────────────┘
                       ▲       ▲        ▲
          register +   │       │        │  register +
          heartbeat    │       │        │  heartbeat
              ┌────────┘       │        └────────┐
              │                │                 │
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ inventory-service │  │ inventory-service │  │  order-service   │
    │  instance A       │  │  instance B       │  │  instance A      │
    │ 10.0.4.22:8082     │  │ 10.0.4.31:8082     │  │ 10.0.5.10:8081    │
    └─────────────────┘  └─────────────────┘  └─────────────────┘

order-service asks Eureka: "where is inventory-service?"
Eureka replies: [10.0.4.22:8082, 10.0.4.31:8082]
order-service picks one (client-side load balancing) and calls it directly
```

![Eureka service discovery registration and lookup flow](/images/blogs/internals/eureka-service-discovery-flow.png)

Setting up the Eureka server itself is a minimal Spring Boot application whose entire job is running the registry:

```xml
<!-- eureka-server pom.xml -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableEurekaServer   // turns this plain Spring Boot app into the registry itself
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

```yaml
# eureka-server application.yml
server:
  port: 8761

eureka:
  client:
    # This server should not register itself as a client, and shouldn't
    # try to fetch a registry from itself — it IS the registry
    register-with-eureka: false
    fetch-registry: false
```

Every business service becomes a **Eureka client** — it registers itself on startup and queries the registry when it needs to reach another service:

```xml
<!-- inventory-service / order-service pom.xml -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```yaml
# inventory-service application.yml
spring:
  application:
    name: inventory-service   # this name IS the service ID other services will look up

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    lease-renewal-interval-in-seconds: 30    # heartbeat frequency
    lease-expiration-duration-in-seconds: 90 # evict after this long with no heartbeat
```

`@EnableEurekaClient` is not even needed on modern Spring Cloud versions — simply having `spring-cloud-starter-netflix-eureka-client` on the classpath is enough for Spring Boot's auto-configuration to register the application with Eureka automatically, using `spring.application.name` as the service ID that other services will use to look it up.

> ⚠️ **Golden Rule:** `spring.application.name` is not cosmetic — it is the identifier every other service in the system will use to find this one. A typo or inconsistency here (`inventory-service` vs `Inventory-Service` vs `inventory_service`) silently breaks discovery for anyone trying to call it. Treat it as part of the public contract, decided once, changed never.

Eureka's design philosophy leans toward **availability over strict consistency** (an AP system in CAP theorem terms) — if a Eureka server can't confirm with its peers whether an instance is really down, it prefers to keep serving a possibly-stale registry rather than refuse to answer at all. This is deliberate: in a service discovery system, a stale-but-available answer ("try this instance, it might be down") is more useful than no answer at all, because the calling service's own retry/timeout logic can recover from a bad address, but it can't recover from a discovery server that refuses to respond.

---

<a id="ch6"></a>
## Chapter 6 — API Gateway With Spring Cloud Gateway

Without a gateway, every external client — a mobile app, a frontend, a third-party integration — needs to know the network address of every individual microservice it talks to, handle authentication separately for each one, and deal with CORS configuration duplicated across every service. As the number of services grows, this becomes unmanageable: the client now needs deep knowledge of your internal architecture, and any internal refactor (splitting one service into two) breaks every client that hardcoded the old address.

An **API Gateway** solves this by becoming the single entry point for all external traffic. Clients only ever talk to the gateway, at one well-known address. The gateway is responsible for **routing** each incoming request to the correct internal service (using service discovery under the hood), and it becomes the natural place to apply **cross-cutting concerns** that would otherwise be duplicated in every service — authentication, rate limiting, request logging, CORS, and response header manipulation, all in one place instead of copy-pasted N times.

```
                        External Clients
                    (mobile app, web frontend)
                              │
                              ▼
                 ┌───────────────────────────┐
                 │   Spring Cloud Gateway      │
                 │   (single entry point)      │
                 │                             │
                 │  /api/v1/orders/**    ──────┼──▶ order-service
                 │  /api/v1/inventory/** ──────┼──▶ inventory-service
                 │  /api/v1/users/**     ──────┼──▶ user-service
                 │                             │
                 │  Cross-cutting: auth,       │
                 │  rate limiting, logging     │
                 └───────────────────────────┘
                     (resolves targets via Eureka)
```

Spring Cloud Gateway is built on Spring WebFlux's **reactive, non-blocking** foundation (Project Reactor) rather than the traditional Servlet stack — this matters because a gateway sits in the hot path of every single request in the system, so it needs to handle high concurrency with a small number of threads rather than blocking a thread per in-flight request the way a traditional Servlet container would.

```xml
<!-- api-gateway pom.xml -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```yaml
# api-gateway application.yml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true          # auto-create routes from Eureka-registered service names
          lower-case-service-id: true
      routes:
        # Explicit route — full control over predicates and filters
        - id: order-service-route
          uri: lb://order-service          # "lb" = load-balanced via Eureka, not a hardcoded host
          predicates:
            - Path=/api/v1/orders/**
          filters:
            - StripPrefix=0                 # forward the path as-is to order-service
            - AddRequestHeader=X-Gateway-Source, api-gateway

        - id: inventory-service-route
          uri: lb://inventory-service
          predicates:
            - Path=/api/v1/inventory/**
          filters:
            - StripPrefix=0

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

The `lb://` prefix is the detail that connects the gateway back to Chapter 5 — it tells Spring Cloud Gateway not to treat `order-service` as a literal hostname, but to resolve it through the load-balancer, which asks Eureka for all healthy instances of `order-service` and picks one. This is what makes the gateway resilient to instances scaling up, scaling down, or being replaced — it never hardcodes an address, it always asks the registry.

Custom filters are where cross-cutting logic actually lives — a `GlobalFilter` runs on every request that passes through the gateway, regardless of route:

```java
@Component
public class RequestLoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        long startTime = System.currentTimeMillis();

        log.info("Incoming request: {} {}", request.getMethod(), request.getPath());

        // continue the chain, then log after the downstream service responds
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            log.info("Completed {} {} in {}ms",
                request.getMethod(), request.getPath(), duration);
        }));
    }

    @Override
    public int getOrder() {
        return -1;   // lower values run earlier in the filter chain
    }
}
```

> 💡 **Pro tip:** at the foundational stage, keep JWT validation at the gateway limited to "is this token structurally valid and not expired" — full role-based authorization (from the Spring Security series) still belongs in each individual service, because a service should never fully trust that the gateway is the only way to reach it. Defense in depth: the gateway is the front door, not the only lock.

---

<a id="ch7"></a>
## Chapter 7 — Externalized Config With Spring Cloud Config Server

Every service needs configuration — database URLs, JWT secrets, feature flags, third-party API keys — and in a monolith, one `application.yml` covers the whole application. In microservices, that same configuration is now duplicated across N services, and worse, N running *instances* of each service. Changing a database connection pool size across ten instances of `inventory-service` by editing local YAML files and redeploying every instance is slow, error-prone, and means a config-only change requires a full redeployment.

**Spring Cloud Config Server** centralizes configuration into one place — typically backed by a Git repository — that every service fetches its configuration from at startup (and optionally refreshes at runtime). The mental model: instead of each service carrying its own configuration file baked into its deployment artifact, every service asks a central config service, "give me the configuration for my name and my active profile," and the config server resolves that from a Git repo, a filesystem, or Vault.

```
              ┌──────────────────────────┐
              │   Git Repository          │
              │   (config-repo)           │
              │                           │
              │  order-service.yml        │
              │  order-service-prod.yml   │
              │  inventory-service.yml    │
              │  application.yml (shared) │
              └──────────────────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │   Spring Cloud Config      │
              │   Server                   │
              └──────────────────────────┘
                 ▲                  ▲
    GET /order-service/prod   GET /inventory-service/prod
                 │                  │
      ┌─────────────────┐  ┌─────────────────┐
      │  order-service    │  │ inventory-service │
      │  (fetches config   │  │  (fetches config  │
      │   at startup)      │  │   at startup)      │
      └─────────────────┘  └─────────────────┘
```

```xml
<!-- config-server pom.xml -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableConfigServer   // turns this application into the config server itself
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

```yaml
# config-server application.yml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/smitroy/microservices-config-repo
          default-label: main
          clone-on-start: true    # fail fast at startup if the repo is unreachable, not on first request
```

Each business service adds a `spring-cloud-starter-config` dependency and points at the config server via a bootstrap-level property, because config needs to be fetched *before* the rest of the application context builds:

```yaml
# inventory-service — application.yml (or bootstrap.yml on older Spring Cloud versions)
spring:
  application:
    name: inventory-service       # used to resolve inventory-service.yml on the config server
  profiles:
    active: prod                  # used to resolve inventory-service-prod.yml
  config:
    import: "configserver:http://localhost:8888"
```

The naming convention `{application-name}-{profile}.yml` on the Git side is what connects a specific service instance to its configuration — `spring.application.name` (the same property that drives Eureka registration in Chapter 5) does double duty here as the config lookup key, which is exactly why getting that name right and consistent matters so much across the whole system.

> ⚠️ **Golden Rule:** never store secrets (database passwords, JWT signing keys, API keys) in plaintext inside the Git-backed config repo, even a private one — Git history is forever, and a leaked credential in commit history from eighteen months ago is still a leaked credential today. Spring Cloud Config supports encrypting values with a symmetric or asymmetric key (`{cipher}...` prefixed values) or backing the server with HashiCorp Vault instead of Git for genuinely sensitive values.

Config Server also supports runtime refresh without a redeploy: a `POST /actuator/refresh` to a service (with `@RefreshScope` on the relevant bean) re-fetches configuration and rebinds it — useful for feature flags and tunable values, though a fresh deployment remains the safer default for anything structural.

---

<a id="ch8"></a>
## Chapter 8 — Inter-Service Communication: RestTemplate vs WebClient

Once `order-service` knows where `inventory-service` is (Chapter 5) and has routed traffic in from outside (Chapter 6), it still needs to actually make the HTTP call to check stock before confirming an order. Spring gives you two tools for this, and the difference between them is not stylistic — it's a fundamentally different threading model.

**`RestTemplate`** is Spring's original synchronous HTTP client. Calling `restTemplate.getForObject(...)` **blocks the calling thread** until the response comes back — the thread sits idle, doing nothing, waiting. Under load, if `inventory-service` gets slow, every thread in `order-service`'s thread pool that's waiting on an inventory call gets tied up, and once the pool is exhausted, `order-service` stops being able to handle *any* request — including ones that have nothing to do with inventory. This is precisely how one slow service can cascade into taking down an unrelated part of the system.

**`WebClient`**, from Spring WebFlux, is **non-blocking and reactive** — the calling thread issues the request and is immediately freed to do other work; when the response eventually arrives, a callback resumes the processing on an event-loop thread. This means far fewer threads are needed to handle the same volume of concurrent outbound calls, and a slow downstream service ties up far less of your own service's capacity.

```java
// RestTemplate — synchronous, blocking
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced   // resolves "inventory-service" via Eureka instead of a literal hostname
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
@RequiredArgsConstructor
public class InventoryClient {

    private final RestTemplate restTemplate;

    public StockResponse checkStock(Long productId) {
        // "inventory-service" is resolved through Eureka thanks to @LoadBalanced
        String url = "http://inventory-service/api/v1/inventory/" + productId;

        // This call BLOCKS the current thread until inventory-service responds
        return restTemplate.getForObject(url, StockResponse.class);
    }
}
```

```java
// WebClient — reactive, non-blocking
@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}

@Service
@RequiredArgsConstructor
public class InventoryClient {

    private final WebClient.Builder webClientBuilder;

    public Mono<StockResponse> checkStock(Long productId) {
        // Returns a Mono immediately — the actual call happens asynchronously
        // Nothing blocks here; the calling thread is free the moment this returns
        return webClientBuilder.build()
                .get()
                .uri("http://inventory-service/api/v1/inventory/{id}", productId)
                .retrieve()
                .bodyToMono(StockResponse.class)
                .timeout(Duration.ofSeconds(3));   // never wait indefinitely on a downstream service
    }

    // Calling it in a blocking context (e.g. from a synchronous @RestController) when needed
    public StockResponse checkStockBlocking(Long productId) {
        return checkStock(productId).block();   // only block at the very edge, deliberately
    }
}
```

```
RestTemplate                          WebClient
──────────────────────────            ──────────────────────────────────
Synchronous / blocking                 Asynchronous / non-blocking
Simple, familiar imperative code       Reactive style — Mono/Flux, more learning curve
Thread-per-request cost                Small thread pool handles high concurrency
Deprecated for new development         Spring's recommended client going forward
Fine for low-to-moderate call volume   Better for high-throughput service meshes
```

`RestTemplate` has been in **maintenance mode** since Spring 5 — it still works, and it's still extremely common in existing codebases and simpler systems, but Spring's own documentation recommends `WebClient` for new development. For a foundational-level system with a handful of services and moderate traffic, `RestTemplate`'s simplicity is a completely reasonable choice; the reactive investment in `WebClient` pays off specifically under high concurrency, which is a Proficient/Veteran-tier concern covered later in this series alongside circuit breakers and resilience patterns.

> 💡 **Interview framing:** if asked "why would you choose WebClient over RestTemplate," the strong answer names the threading model difference specifically — blocking-thread-per-call vs non-blocking-event-loop — rather than just saying "it's newer." Interviewers are checking whether you understand *why* the reactive model helps at scale, not whether you memorized which one Spring recommends.

---

<a id="ch9"></a>
## Chapter 9 — Docker Containerization Per Service

Every microservice in this guide so far has been described as "independently deployable" — Docker is what actually makes that concrete. A **container** packages a service's application code together with its exact runtime environment (JVM version, OS libraries, environment configuration) into a single, portable unit that runs identically on a developer's laptop, a CI pipeline, and a production cluster. Without containers, "it works on my machine" is a real and constant problem in a system with a dozen services, each potentially built by a different team with a slightly different local setup.

The core idea worth understanding before writing a single `Dockerfile`: a container is not a lightweight virtual machine. It shares the host machine's OS kernel and only isolates the process, filesystem, and network namespace — this is exactly why containers start in milliseconds and use a fraction of the resources a full VM would, which matters enormously when you're running ten or more services simultaneously on a single development machine or a cost-conscious cloud instance.

```dockerfile
# Dockerfile — multi-stage build for a Spring Boot service
# Stage 1: build the JAR using Maven — this stage's tools never ship to production
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Using the Maven wrapper committed to the repo keeps the build reproducible
RUN ./mvnw clean package -DskipTests

# Stage 2: runtime image — only the JAR and a slim JRE, nothing else
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as a non-root user — a compromised container should not have root inside it
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/inventory-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
```

The **multi-stage build** here is deliberate, not decorative: the first stage has the full JDK and Maven and downloads every build-time dependency, producing an image that could be hundreds of megabytes. The second stage starts fresh from a minimal JRE-only base image and copies in *only the final JAR* — none of the build tooling, none of the Maven cache, none of the source code makes it into the image that actually ships to production. This routinely cuts image size by 70-80%, which matters directly for deployment speed and for the attack surface of the running container.

Running multiple services together locally is where **Docker Compose** earns its place — it describes the entire local system (every service, plus infrastructure like Eureka, the config server, and each service's own database) as one file, started with one command:

```yaml
# docker-compose.yml — the whole foundational system, one command to start
version: "3.8"

services:
  eureka-server:
    build: ./eureka-server
    ports:
      - "8761:8761"

  config-server:
    build: ./config-server
    ports:
      - "8888:8888"
    depends_on:
      - eureka-server

  inventory-service:
    build: ./inventory-service
    ports:
      - "8082:8082"
    environment:
      - EUREKA_URI=http://eureka-server:8761/eureka/
      - SPRING_DATASOURCE_URL=jdbc:postgresql://inventory-db:5432/inventory
    depends_on:
      - eureka-server
      - config-server
      - inventory-db

  inventory-db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=inventory
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - inventory-data:/var/lib/postgresql/data

  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server

volumes:
  inventory-data:
```

Note that within the Docker Compose network, services address each other **by service name** (`http://eureka-server:8761`), not `localhost` — Docker Compose creates an internal DNS that resolves each service's container name automatically, which is a smaller-scale preview of exactly what Kubernetes service discovery does at production scale (covered in the Veteran part of this series).

> ⚠️ **Golden Rule:** `depends_on` in Docker Compose controls **start order**, not **readiness**. A database container reports "started" the instant its process launches, which is well before PostgreSQL is actually ready to accept connections — a service that depends on it can still fail to connect on its first few attempts. Production setups add explicit health checks (`healthcheck:` blocks) and retry logic in the application itself (Spring Boot's `spring.datasource.hikari` retry settings) rather than relying on `depends_on` alone for correctness.

---

<a id="ch10"></a>
## Chapter 10 — Database-Per-Service Pattern

In a monolith, one shared database is the natural default — every module reads and writes the same schema, and cross-module joins are just SQL joins. The moment you split into microservices, that shared database becomes the single biggest hidden coupling in the entire system: if `order-service` and `inventory-service` both read and write the same `products` table, they are not actually independent, no matter how many separate JARs and separate deployments you've created. A schema change made by the inventory team can silently break the order team's queries, and neither team can deploy safely without coordinating with the other — which defeats the entire point of splitting in Chapter 1 and 2.

![Database-per-service pattern — shared vs isolated data ownership](/images/blogs/internals/database-per-service-pattern.png)

**Database-per-service** is the pattern that actually enforces microservice independence at the data layer: each service owns its own database, and no other service is ever allowed to connect to it directly. If `order-service` needs data that conceptually "belongs" to `inventory-service`, it does not run a SQL query against inventory's tables — it calls inventory's API (Chapter 4 and 8), the same way an external client would. The database becomes a private implementation detail of the service that owns it, exactly the way a private field is an implementation detail of a Java class.

```
BEFORE — Shared Database (hidden coupling)
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ order-service │   │inventory-svc │   │ user-service │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                           ▼
                  ┌──────────────────┐
                  │  shared_database   │  ← any service can break any other
                  └──────────────────┘

AFTER — Database Per Service (real independence)
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ order-service │   │inventory-svc │   │ user-service │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  order_db      │   │ inventory_db  │   │  user_db      │
└──────────────┘   └──────────────┘   └──────────────┘
   (PostgreSQL)        (PostgreSQL)        (PostgreSQL)

order-service needs inventory data → calls inventory-service's REST API, never its DB
```

```java
// order-service — never a JOIN across service boundaries; always an API call
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;       // order-service's OWN database only
    private final InventoryClient inventoryClient;        // HTTP client from Chapter 8

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Cross-service data access happens over the network, through the owning
        // service's API — never by querying inventory's tables directly
        StockResponse stock = inventoryClient.checkStock(request.productId());

        if (stock.availableQuantity() < request.quantity()) {
            throw new InsufficientStockException(request.productId());
        }

        Order order = Order.builder()
                .productId(request.productId())
                .quantity(request.quantity())
                .status(OrderStatus.PENDING)
                .build();

        return OrderResponse.from(orderRepository.save(order));
    }
}
```

This pattern introduces a real cost that has to be named honestly: you lose ACID transactions across services. In a monolith, "create the order AND decrement stock" is one `@Transactional` method, one database transaction, guaranteed to either fully commit or fully roll back together. Across two databases owned by two services, there is no single transaction spanning both — if the order is created successfully but the stock decrement call fails afterward, you now have an inconsistent system state that a single database transaction would have prevented automatically. Solving this properly (the **Saga pattern**, choreography vs orchestration, compensating transactions) is genuinely a Proficient-tier topic; at the foundational level, the important thing is recognizing that this trade-off exists the moment you adopt database-per-service, not pretending distributed writes are as simple as local ones.

Even the choice of database technology becomes independent per service under this pattern — `order-service` might use PostgreSQL for strong relational guarantees on order line items, while a future `search-service` might use Elasticsearch for full-text product search. This flexibility (**polyglot persistence**) is one of the genuine benefits of the split, but it's a benefit that only exists because the database boundary was enforced strictly from day one.

---

<a id="ch11"></a>
## Chapter 11 — Health Checks With Spring Boot Actuator

Every pattern in this guide so far assumes something that has to actually be verified continuously: that a given service instance is alive and capable of correctly handling requests. Eureka's heartbeat (Chapter 5) tells the registry an instance is *reachable*, but reachable is not the same as *healthy* — an instance can be up and responding to TCP connections while its database connection pool is exhausted, or a downstream dependency it needs is unreachable, making it functionally useless even though the process itself hasn't crashed.

**Spring Boot Actuator** exposes a set of production-ready endpoints out of the box, and the one that matters most for microservices is `/actuator/health` — a standardized endpoint that reports whether the application, and each of its critical dependencies (database, disk space, message broker connections), is actually in a state to serve traffic correctly.

```xml
<!-- pom.xml — Actuator starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics    # never expose ALL actuator endpoints publicly
  endpoint:
    health:
      show-details: when-authorized        # avoid leaking internal details to anonymous callers
      probes:
        enabled: true                       # exposes /actuator/health/liveness and /readiness
```

Calling `GET /actuator/health` returns an aggregated status built from every registered `HealthIndicator` — Spring Boot auto-configures indicators for the database, disk space, and any other infrastructure it detects on the classpath, and you can add your own for anything specific to your service's dependencies:

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "PostgreSQL" } },
    "diskSpace": { "status": "UP" },
    "eureka": { "status": "UP" }
  }
}
```

```java
// A custom health indicator — checks a dependency Spring Boot doesn't know about natively
@Component
public class InventorySyncHealthIndicator implements HealthIndicator {

    private final InventorySyncStatus syncStatus;

    @Override
    public Health health() {
        if (syncStatus.getLastSuccessfulSync().isBefore(Instant.now().minus(Duration.ofMinutes(10)))) {
            // Stock sync hasn't succeeded in 10 minutes — this instance is technically "up"
            // but serving potentially stale stock data, which is a real health problem
            return Health.down()
                    .withDetail("reason", "Stock sync stale")
                    .withDetail("lastSync", syncStatus.getLastSuccessfulSync())
                    .build();
        }
        return Health.up().build();
    }
}
```

The distinction between **liveness** and **readiness** probes is important once this feeds into container orchestration (Kubernetes, covered in the Veteran part of the series): a **liveness** probe answers "should this instance be restarted?" — if it fails repeatedly, the orchestrator kills and replaces the container. A **readiness** probe answers "should this instance currently receive traffic?" — if it fails, the orchestrator stops routing new requests to it without killing it, which matters for cases like "the JVM is warming up its connection pool" where restarting would be actively counterproductive.

Eureka itself uses the health endpoint too — instead of only trusting its own heartbeat mechanism, Eureka clients can be configured to check the actual application health status, so an instance that's technically sending heartbeats but reporting `DOWN` from Actuator can be kept out of load-balanced rotation without waiting for the heartbeat timeout to expire.

> 💡 **Pro tip:** never expose `/actuator/**` endpoints publicly through the API Gateway from Chapter 6 without authentication — `/actuator/env` and `/actuator/beans` can leak configuration details, and even `/actuator/health`'s detailed view can expose internal architecture to anyone who requests it. Route `/actuator/health` (basic status only) through the gateway for load balancer checks, and keep the rest of the Actuator surface internal-only or behind admin authentication.

---

<a id="ch12"></a>
## Key Takeaways

**Architecture Decisions**
- Microservices are a trade, not an upgrade — you exchange in-process reliability and deployment simplicity for independent scaling, fault isolation, and team autonomy
- Split only for real signals: independent scaling need, independent deployment cadence, team-boundary alignment (Conway's Law), or fault isolation — never split by default
- A poorly split system becomes a distributed monolith — all the network overhead, none of the independence benefit

**The Spring Cloud Foundation**
- Spring Cloud solves distributed-systems problems that only exist once you have more than one service — discovery, gateway routing, and centralized configuration all fall away in a monolith
- Inter-service REST contracts need versioned URLs, dedicated response DTOs (never expose JPA entities directly), and a consistent error shape — because there's no compiler catching a broken contract across services

**Discovery, Gateway, Config**
- Eureka is a self-updating directory — services register on startup and heartbeat continuously; it favors availability over strict consistency by design
- Spring Cloud Gateway is the single external entry point, resolving `lb://service-name` addresses through Eureka and centralizing cross-cutting concerns like logging and coarse auth checks
- Spring Cloud Config Server centralizes configuration in Git, keyed by `spring.application.name` and active profile — never store plaintext secrets in the config repo

**Communication, Containers, Data**
- `RestTemplate` blocks the calling thread per call; `WebClient` is non-blocking and scales better under high concurrency — both are valid at foundational scale, but WebClient is Spring's forward path
- Multi-stage Docker builds keep runtime images small and free of build tooling; Docker Compose service names double as internal DNS, previewing Kubernetes service discovery
- Database-per-service is what actually enforces microservice independence — it trades away cross-service ACID transactions for real deployment and schema independence, a trade-off the Proficient tier resolves with Sagas
- `/actuator/health` distinguishes liveness ("restart me?") from readiness ("route traffic to me?") — critical once services run under an orchestrator, and never expose the full Actuator surface publicly

---

*A monolith is one building with every department under one roof. What you've built across these eleven chapters is the beginning of that second architecture — separate buildings, each with its own address (Eureka), a shared reception desk (the Gateway), a common policy handbook distributed to every office (Config Server), and phone lines between departments (RestTemplate/WebClient) — instead of hallways. It's more buildings to maintain, but each one can now be renovated, staffed, and scaled without shutting down the rest of the company.*