## The Concepts Spring Boot Hides From You, That You Must Understand First

> *Spring Boot is magic only if you don't understand Spring. Once you do, it stops being magic and starts being a very well-designed layer of automation on top of an architecture you already know. This post builds that architecture, from the ground up — so that when Spring Boot auto-configures something for you, you know exactly what it's doing and why.*

Most developers jump straight into Spring Boot, build a few REST APIs, and think they know Spring. Then an interview asks: *"What is a BeanDefinition? What happens if two beans of the same type exist in the context? What's the difference between `@Component` and `@Bean`?"* — and the gaps show immediately.

Read this first. Spring Boot will make complete sense after.

---

<a id="ch1"></a>
## Chapter 1 — What Spring Framework Actually Is

Spring is not a runtime, a server, or a language. It's an **application framework** — a set of libraries whose central purpose is to manage your objects for you, so your code focuses on business logic rather than plumbing.

The two ideas Spring is fundamentally built on:

**Inversion of Control (IoC):** instead of your code creating and wiring its own dependencies, you describe *what* you need and Spring *creates and injects* them. Control over object creation is *inverted* — from your code to the framework.

**Dependency Injection (DI):** the concrete mechanism IoC uses — Spring *injects* the objects a class needs into it, rather than the class constructing them itself.

```java
// WITHOUT Spring — tight coupling, hard to test, hard to swap implementations
public class OrderService {
    private final PaymentService paymentService = new StripePaymentService(); // hardcoded!
    private final EmailService emailService = new SmtpEmailService();          // hardcoded!
}

// WITH Spring — loose coupling, dependencies flow in, implementation is swappable
public class OrderService {
    private final PaymentService paymentService;  // Spring injects this
    private final EmailService emailService;       // Spring injects this too

    public OrderService(PaymentService paymentService, EmailService emailService) {
        this.paymentService = paymentService;
        this.emailService = emailService;
    }
}
```

The `OrderService` no longer cares whether `PaymentService` is Stripe, PayPal, or a mock in a test — it just needs *something* that fulfills the contract. Spring decides what that something is, based on your configuration.

This single shift — from "classes creating their own dependencies" to "dependencies being injected from outside" — is what makes Spring applications loosely coupled, easily testable, and straightforwardly maintainable.

---

<a id="ch2"></a>
## Chapter 2 — The Spring Container: IoC Container Internals

The **Spring Container** (also called the **IoC Container**) is the runtime core of the framework. It is responsible for:

1. Reading your configuration (annotations, Java config classes, or XML)
2. Creating objects (called **beans**) based on that configuration
3. Wiring those beans together according to declared dependencies
4. Managing each bean's lifecycle from creation through destruction

There are two core container interfaces in Spring:

| Interface | Description |
|---|---|
| `BeanFactory` | The root interface — basic bean creation and retrieval. Lazy-initializes beans on first request. Minimal footprint. Rarely used directly in modern Spring. |
| `ApplicationContext` | Extends `BeanFactory` — adds AOP integration, internationalization, event publishing, and eager initialization of singleton beans. **This is what you always use.** |

### Common `ApplicationContext` Implementations

```java
// For annotation + Java config (most common in modern Spring)
ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);

// For XML-based configuration (legacy, still encountered in older codebases)
ApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");

// For web applications
ApplicationContext ctx = new AnnotationConfigWebApplicationContext();
```

### BeanDefinition — The Blueprint Before the Object

Before Spring creates a bean, it first builds a **`BeanDefinition`** — a metadata descriptor that captures everything the container needs to know about that bean: the class, scope, constructor arguments, property values, lifecycle callbacks, and whether it should be lazily or eagerly initialized.

```
Your @Component / @Bean / XML config
            │
            ▼
   [ BeanDefinitionReader ]
            │
            ▼
   BeanDefinition (blueprint in memory)
   - beanClass: com.example.OrderService
   - scope: singleton
   - initMethod: init
   - dependencies: [PaymentService, EmailService]
            │
            ▼
   [ BeanFactory creates the actual object ]
            │
            ▼
      Bean (live instance, stored in context)
```

This two-phase design (blueprint → instance) is why Spring can apply post-processing, proxy wrapping (for AOP and `@Transactional`), and other transformations *before* the final bean is handed to you.

---

<a id="ch3"></a>
## Chapter 3 — Dependency Injection: The Three Ways

Spring supports three mechanisms for injecting dependencies. They are not equally good.

### 1. Constructor Injection (Recommended)

```java
@Service
public class OrderService {
    private final PaymentService paymentService;
    private final EmailService emailService;

    // Spring sees a single constructor and injects automatically (no @Autowired needed since Spring 4.3)
    public OrderService(PaymentService paymentService, EmailService emailService) {
        this.paymentService = paymentService;
        this.emailService = emailService;
    }
}
```

**Why this is the right default:**
- Dependencies are `final` — the object is fully initialized and immutable after construction. No partially-constructed state is ever visible.
- Makes dependencies explicit — you cannot create an `OrderService` without its required collaborators, which also means tests are trivially obvious about what they need to provide.
- No reflection required at runtime — Spring simply calls the constructor.
- The Spring team's own official documentation recommends constructor injection for required dependencies.

### 2. Setter Injection

```java
@Service
public class NotificationService {
    private EmailService emailService;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

**When it makes sense:** optional dependencies — ones that have a working default even if not provided. Setter injection allows the object to exist in a valid partial state and have optional collaborators supplied after construction. Rare in practice.

### 3. Field Injection (Convenient but Problematic)

```java
@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService;   // Spring injects this via reflection
}
```

**Why this is the weakest choice:**
- Dependencies are hidden inside the class — users of this class don't see what it needs from the outside
- Field injection uses reflection at runtime, bypassing normal Java object construction
- You cannot create `OrderService` in a plain unit test without Spring's full context (or reflection hacks) — testability suffers directly
- The fields cannot be `final`, leaving a window where a partially-wired object could be observed

> ⚠️ **Golden Rule:** default to constructor injection for required dependencies. Use setter injection only for optional ones. Avoid field injection in production code — it's convenient to write and expensive to maintain.

### `@Autowired` Resolution — How Spring Decides What to Inject

When `@Autowired` triggers, Spring resolves the injection in this order:

```
1. Match by TYPE — find all beans in the context that match the declared type
2. If exactly one match → inject it directly
3. If multiple matches → attempt to narrow by NAME (field name or parameter name must match a bean name)
4. If still ambiguous → throw NoUniqueBeanDefinitionException
5. If no match at all → throw NoSuchBeanDefinitionException
   (unless @Autowired(required = false), in which case leave it null)
```

---

<a id="ch4"></a>
## Chapter 4 — Bean Scopes

Bean scope defines how many instances Spring creates and how long they live.

| Scope | Instances Created | Lives For |
|---|---|---|
| `singleton` | **One per container** | Lifetime of the application context — the default for all beans |
| `prototype` | **New instance every time** the bean is requested from the context | Until the requesting code discards it — Spring does NOT manage destruction |
| `request` | One per HTTP request | Duration of that single HTTP request — web-aware contexts only |
| `session` | One per HTTP session | Duration of the user's HTTP session — web-aware contexts only |
| `application` | One per `ServletContext` | Lifetime of the web application |

```java
@Component
@Scope("singleton")    // default — this annotation is redundant here, but explicit
public class ConfigurationService { }

@Component
@Scope("prototype")    // new instance every time this bean is requested
public class ReportGenerator { }

@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext { }    // one instance per HTTP request
```

### The Singleton-Prototype Injection Problem

```java
// THIS IS A SUBTLE BUG:
@Component
@Scope("singleton")          // created once — lives forever
public class OrderProcessor {
    @Autowired
    private ReportGenerator reportGenerator;  // PROTOTYPE — should be a new instance each time
    // But because OrderProcessor is a singleton, reportGenerator is injected ONCE
    // at construction time and NEVER refreshed. You always get the SAME instance.
    // The prototype scope is effectively ignored here.
}
```

**The fix:** either use `ApplicationContext.getBean()` directly inside the method that needs a fresh instance (called the "lookup method" pattern), or use `@Lookup`:

```java
@Component
public abstract class OrderProcessor {
    @Lookup
    public abstract ReportGenerator getReportGenerator();  // Spring generates an override that fetches a fresh bean each time

    public void process() {
        ReportGenerator generator = getReportGenerator();  // genuinely new instance every call
    }
}
```

---

<a id="ch5"></a>
## Chapter 5 — Bean Lifecycle: Birth to Destruction

Understanding the full lifecycle is what lets you reason about *when* things are available, *when* initializations have run, and *why* certain code needs to be in a specific callback.

```
Container starts
      │
      ▼
1.  BeanDefinitions loaded (all metadata read from config)
      │
      ▼
2.  BeanFactoryPostProcessors run
    (can modify BeanDefinitions BEFORE any beans are created
     e.g., PropertySourcesPlaceholderConfigurer resolves @Value placeholders here)
      │
      ▼
3.  Bean instantiation (constructor called)
      │
      ▼
4.  Dependency injection (properties and constructor args set)
      │
      ▼
5.  BeanPostProcessor.postProcessBeforeInitialization()
    (runs for every bean — AOP proxies are created in this phase)
      │
      ▼
6.  @PostConstruct method runs
      │
      ▼
7.  InitializingBean.afterPropertiesSet() runs (if implemented)
      │
      ▼
8.  Custom init-method runs (if declared)
      │
      ▼
9.  BeanPostProcessor.postProcessAfterInitialization()
      │
      ▼
10. Bean is fully ready — available in application context
      │
      ▼
  [ Application runs ]
      │
      ▼
11. Container shutdown triggered
      │
      ▼
12. @PreDestroy method runs
      │
      ▼
13. DisposableBean.destroy() runs (if implemented)
      │
      ▼
14. Custom destroy-method runs (if declared)
      │
      ▼
Container destroyed
```

### The Lifecycle Hooks You'll Actually Use

```java
@Component
public class DatabaseConnectionPool {

    @PostConstruct
    public void init() {
        // Runs after all dependencies have been injected
        // Perfect for: establishing connections, warming caches, loading config
        // NOT for: work that depends on OTHER beans' @PostConstruct having already run
        System.out.println("Connection pool initializing...");
    }

    @PreDestroy
    public void cleanup() {
        // Runs when the context is shutting down
        // Perfect for: closing connections, releasing resources, flushing buffers
        System.out.println("Connection pool shutting down...");
    }
}
```

> 💡 **Why `@PostConstruct` over a constructor for initialization?** At the moment a constructor runs, dependency injection hasn't happened yet — your `@Autowired` fields are still `null`. `@PostConstruct` runs *after* the container has finished injecting, so all collaborators are available. Always put initialization logic that needs injected dependencies into `@PostConstruct`, not the constructor.

---

<a id="ch6"></a>
## Chapter 6 — Configuration Styles: XML, Java, and Annotations

Spring has supported three distinct ways of telling the container about your beans. You'll encounter all three in real codebases — understanding each one clarifies why the others exist.

### Style 1: XML Configuration (Legacy, But Still Encountered)

```xml
<!-- applicationContext.xml -->
<beans xmlns="http://www.springframework.org/schema/beans" ...>

    <bean id="paymentService" class="com.example.StripePaymentService" />

    <bean id="orderService" class="com.example.OrderService">
        <constructor-arg ref="paymentService" />
    </bean>

</beans>
```

This was the original Spring configuration style. Verbose, no compile-time checking, but extremely explicit about every wiring decision. Still found in legacy enterprise codebases built before 2010–2012.

### Style 2: Java Configuration (`@Configuration` + `@Bean`)

```java
@Configuration
public class AppConfig {

    @Bean
    public PaymentService paymentService() {
        return new StripePaymentService();
    }

    @Bean
    public OrderService orderService() {
        return new OrderService(paymentService());  // Spring intercepts this call — still returns singleton
    }
}
```

Java config gives you:
- Full compile-time type checking — typos are caught by the compiler, not a runtime XML parse error
- Refactoring support in your IDE
- The ability to write conditional logic inside `@Bean` methods

### Style 3: Annotation-Driven Configuration (`@Component` + `@Autowired`)

```java
@Service
public class OrderService {
    private final PaymentService paymentService;

    @Autowired
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

Annotations on the classes themselves — the most concise and common style in modern Spring.

### The Modern Reality: Both Styles 2 and 3, Together

Real Spring applications today typically use a combination: `@Configuration` + `@Bean` for wiring third-party classes you can't annotate yourself (a database connection pool, a Jackson `ObjectMapper`, an external library client), and `@Component`/`@Service`/`@Repository` for your own classes. Spring Boot's auto-configuration is entirely built on `@Configuration` + `@Bean` classes under the hood.

---

<a id="ch7"></a>
## Chapter 7 — Component Scanning & Stereotype Annotations

### Component Scanning

Instead of declaring every bean individually, you can instruct Spring to scan a package and automatically detect any class annotated with `@Component` (or its derivatives):

```java
@Configuration
@ComponentScan(basePackages = "com.example")   // scan this package and all sub-packages
public class AppConfig { }
```

Spring finds every class annotated with `@Component`, `@Service`, `@Repository`, or `@Controller` within the specified package tree, creates a `BeanDefinition` for each, and registers them automatically.

### The Stereotype Annotations

```java
@Component       // Generic Spring-managed component — the base annotation
@Service         // Semantically marks a class as holding business logic (service layer)
@Repository      // Semantically marks a class as a data access component
                  // (also enables automatic exception translation — DataAccessException wrapping)
@Controller      // Marks a Spring MVC web controller (returns view names)
@RestController  // @Controller + @ResponseBody — returns data directly (JSON/XML)
```

**Technical reality:** `@Service`, `@Repository`, and `@Controller` are each just `@Component` with a different name — they scan and register identically. Their value is *semantic*: they communicate architectural role to anyone reading the code, and `@Repository` specifically adds exception translation behavior from Spring Data.

```
@Component
    │
    ├── @Service        (business logic layer)
    ├── @Repository     (data access layer + exception translation)
    └── @Controller     (presentation layer)
                └── @RestController
```

---

<a id="ch8"></a>
## Chapter 8 — `@Bean` vs `@Component`: The Real Distinction

This is the question that trips up a surprising number of developers who think they know Spring.

| | `@Component` (and derivatives) | `@Bean` |
|---|---|---|
| Applied to | The **class itself** | A **method** inside a `@Configuration` class |
| Who controls instantiation | Spring calls the class constructor automatically | **You** write the instantiation logic in the method body |
| Use for | **Your own classes** that you can annotate | **Third-party classes** you can't annotate, or beans requiring complex construction logic |
| Scanning required | Yes — `@ComponentScan` must cover the package | No — `@Bean` methods are discovered via the `@Configuration` class |

```java
// @Component — used on YOUR class
@Service
public class OrderService { ... }    // Spring instantiates this for you

// @Bean — used when YOU control the instantiation, especially for third-party code
@Configuration
public class InfrastructureConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();    // you create it
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;  // Spring manages the lifecycle from here
    }

    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();  // HikariDataSource has no @Component
        ds.setJdbcUrl("jdbc:postgresql://localhost/mydb");
        ds.setMaximumPoolSize(10);
        return ds;
    }
}
```

---

<a id="ch9"></a>
## Chapter 9 — Handling Multiple Beans: `@Qualifier` & `@Primary`

### The Problem

```java
public interface PaymentService {
    void charge(double amount);
}

@Service
public class StripePaymentService implements PaymentService { ... }

@Service
public class PayPalPaymentService implements PaymentService { ... }

@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService;
    // Spring finds TWO beans matching PaymentService type → NoUniqueBeanDefinitionException 💥
}
```

### Solution 1: `@Primary` — Designate the Default Winner

```java
@Service
@Primary   // when multiple beans of this type exist, prefer this one when no Qualifier is specified
public class StripePaymentService implements PaymentService { ... }
```

Any injection point that asks for `PaymentService` without further specification will now get `StripePaymentService`. Other injection points can still override this.

### Solution 2: `@Qualifier` — Explicit Bean Selection

```java
@Service
@Qualifier("stripe")
public class StripePaymentService implements PaymentService { ... }

@Service
@Qualifier("paypal")
public class PayPalPaymentService implements PaymentService { ... }

@Service
public class OrderService {
    private final PaymentService paymentService;

    public OrderService(@Qualifier("stripe") PaymentService paymentService) {
        this.paymentService = paymentService;   // explicitly selects StripePaymentService
    }
}
```

### Solution 3: Inject All Beans of a Type into a Collection

```java
@Service
public class PaymentRouter {
    private final List<PaymentService> allPaymentServices;

    public PaymentRouter(List<PaymentService> allPaymentServices) {
        this.allPaymentServices = allPaymentServices;
        // Spring injects ALL beans implementing PaymentService into this list
        // Useful for strategy pattern, plugin architectures, chain-of-responsibility
    }
}
```

---

<a id="ch10"></a>
## Chapter 10 — Spring Expression Language (SpEL)

SpEL is a powerful expression language that Spring evaluates at runtime in annotations and XML configuration — most commonly encountered in `@Value`.

```java
@Component
public class AppSettings {

    @Value("${app.max-connections}")      // inject from application.properties
    private int maxConnections;

    @Value("${app.name:DefaultApp}")       // inject with a fallback default
    private String appName;

    @Value("#{systemProperties['user.name']}")   // SpEL — accesses JVM system properties
    private String systemUser;

    @Value("#{orderService.defaultOrderLimit * 2}")  // SpEL — reference another bean and evaluate arithmetic
    private int doubleLimit;

    @Value("#{T(java.lang.Math).PI}")    // SpEL — reference a static field from any class
    private double pi;
}
```

SpEL syntax reference:

```
${...}       → Property placeholder (from application.properties/yml)
#{...}       → Spring Expression Language — dynamic, evaluated at runtime
T(...)       → Type reference — access static fields/methods
@beanName    → Reference another bean
?.[...]      → Null-safe selection operator
.?[...]      → Collection filtering
.^[...]      → First matching element in collection
```

---

<a id="ch11"></a>
## Chapter 11 — Spring AOP: Aspect-Oriented Programming

AOP solves a specific problem that OOP doesn't handle elegantly: **cross-cutting concerns** — logic that needs to run across many classes without being copy-pasted into each one. Logging, transaction management, security checks, performance monitoring, and retry logic are classic examples.

### Core AOP Vocabulary

| Term | Meaning |
|---|---|
| **Aspect** | The class encapsulating your cross-cutting logic |
| **Advice** | The actual code that runs (the "what") |
| **Pointcut** | An expression defining where advice should apply (the "where") |
| **Join Point** | A specific moment during execution where advice can be applied (in Spring AOP: a method call) |
| **Weaving** | The process of applying aspects to target objects |

### Advice Types

```java
@Aspect
@Component
public class LoggingAspect {

    // BEFORE — runs before the method executes
    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Calling: " + joinPoint.getSignature().getName());
    }

    // AFTER RETURNING — runs after the method returns successfully
    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("Returned: " + result);
    }

    // AFTER THROWING — runs if the method throws an exception
    @AfterThrowing(pointcut = "execution(* com.example.service.*.*(..))", throwing = "ex")
    public void logAfterThrowing(JoinPoint joinPoint, Exception ex) {
        System.out.println("Exception in: " + joinPoint.getSignature().getName());
    }

    // AFTER (finally) — runs regardless of outcome
    @After("execution(* com.example.service.*.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("Completed: " + joinPoint.getSignature().getName());
    }

    // AROUND — wraps the entire method — most powerful, most dangerous
    @Around("execution(* com.example.service.*.*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();   // MUST call proceed() or the actual method never runs!
        long duration = System.currentTimeMillis() - start;
        System.out.println(joinPoint.getSignature().getName() + " took " + duration + "ms");
        return result;
    }
}
```

### Pointcut Expressions

```java
// All methods in any class in the service package
"execution(* com.example.service.*.*(..))"

// Only public methods returning void
"execution(public void com.example.service.*.*())"

// Any method annotated with @Transactional
"@annotation(org.springframework.transaction.annotation.Transactional)"

// Any bean whose type has @Service annotation
"@within(org.springframework.stereotype.Service)"

// Combining pointcuts
@Pointcut("execution(* com.example.service.*.*(..))")
public void serviceMethods() {}

@Pointcut("@annotation(com.example.annotation.Audited)")
public void auditedMethods() {}

@Before("serviceMethods() && auditedMethods()")
public void auditLog(JoinPoint jp) { ... }
```

### How Spring AOP Actually Works — Proxy-Based

This is the critical implementation detail that explains several confusing Spring behaviors:

```
Your code calls orderService.placeOrder()
                │
                ▼
     Spring AOP PROXY (wraps orderService)
     ├── Before advice runs
     ├── calls the REAL orderService.placeOrder()
     └── After advice runs
                │
                ▼
      Real OrderService.placeOrder() executes
```

Spring AOP works by wrapping your bean in a **proxy object** — the proxy intercepts method calls, runs the applicable advice, then delegates to the real method. The container hands out the proxy, not the real object.

**The self-invocation limitation:** because AOP only intercepts calls *through the proxy*, if a method inside `OrderService` calls another method on `this` (the real object, not the proxy), advice does **not** fire:

```java
@Service
public class OrderService {
    @Transactional
    public void placeOrder() {
        validateOrder();  // ⚠️ this call bypasses the proxy — @Transactional on validateOrder() won't apply!
    }

    @Transactional   // this advice WILL NOT fire when called from placeOrder() above
    public void validateOrder() { ... }
}
```

This is the exact same mechanism that explains the `@Transactional` self-invocation bug covered in the Spring Boot PostgreSQL chapter — and now you understand *why* at the AOP level: the proxy simply isn't involved in internal `this.method()` calls.

---

<a id="ch12"></a>
## Chapter 12 — Spring Events

Spring's event mechanism enables loosely coupled communication between beans in the same application context — one bean publishes an event, zero or more other beans react to it, without the publisher needing to know who's listening.

```java
// 1. Define the event (a simple POJO extending ApplicationEvent)
public class OrderPlacedEvent extends ApplicationEvent {
    private final String orderId;

    public OrderPlacedEvent(Object source, String orderId) {
        super(source);
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
}

// 2. Publish it from any bean
@Service
public class OrderService {
    private final ApplicationEventPublisher eventPublisher;

    public OrderService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void placeOrder(String orderId) {
        // ... business logic ...
        eventPublisher.publishEvent(new OrderPlacedEvent(this, orderId));
        // OrderService knows nothing about who handles this event
    }
}

// 3. Listen for it from any other bean
@Component
public class EmailNotificationListener {

    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        System.out.println("Sending confirmation email for order: " + event.getOrderId());
    }
}

@Component
public class InventoryListener {

    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        System.out.println("Reserving inventory for order: " + event.getOrderId());
    }
}
```

`OrderService` publishes the event and immediately moves on — it has no knowledge of, no dependency on, and no coupling to `EmailNotificationListener` or `InventoryListener`. Either listener can be added, removed, or changed without touching `OrderService`.

> 💡 Spring events are synchronous by default — all listeners run on the publishing thread before `publishEvent()` returns. For async listeners, add `@Async` to the listener method (requires `@EnableAsync` on a config class).

---

<a id="ch13"></a>
## Chapter 13 — Environment, Profiles & Externalized Configuration

### The Environment Abstraction

The `Environment` interface represents the externalized configuration of the running application — two categories: **properties** (key-value pairs from files, env vars, system properties) and **profiles** (named logical groupings of beans that are activated or deactivated together).

```java
@Component
public class DataSourceConfig {
    @Autowired
    private Environment env;

    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(env.getProperty("db.url"));
        ds.setUsername(env.getProperty("db.username"));
        return ds;
    }
}
```

### `@Value` for Individual Properties

```java
@Value("${db.url}")
private String dbUrl;

@Value("${db.pool-size:10}")  // with a default if property is missing
private int poolSize;
```

### `@ConfigurationProperties` — Type-Safe Property Binding

```java
@ConfigurationProperties(prefix = "app.mail")
@Component
public class MailProperties {
    private String host;
    private int port;
    private String from;
    // Spring binds app.mail.host, app.mail.port, app.mail.from automatically via setters
    // getters/setters required
}
```

### Profiles — Environment-Specific Beans

```java
// This bean only exists when the "dev" profile is active
@Component
@Profile("dev")
public class DevDatabaseSeeder {
    @PostConstruct
    public void seed() {
        System.out.println("Seeding development data...");
    }
}

// This bean only exists when the "prod" profile is active
@Component
@Profile("prod")
public class ProdHealthMonitor {
    @PostConstruct
    public void start() {
        System.out.println("Starting production health monitoring...");
    }
}

// A @Bean can also be profile-conditional
@Configuration
public class DataSourceConfig {
    @Bean
    @Profile("dev")
    public DataSource h2DataSource() {
        return new EmbeddedDatabaseBuilder().setType(H2).build();
    }

    @Bean
    @Profile("prod")
    public DataSource postgresDataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:postgresql://prod-host/mydb");
        return ds;
    }
}
```

**Activating a profile:**

```bash
# Via JVM argument
java -Dspring.profiles.active=prod -jar myapp.jar

# Via environment variable
SPRING_PROFILES_ACTIVE=prod java -jar myapp.jar
```

### Property Source Priority (Highest to Lowest)

```
1. Command-line arguments (--server.port=9090)
2. SPRING_APPLICATION_JSON environment variable
3. OS environment variables
4. JVM system properties (-Dserver.port=9090)
5. application-{profile}.properties (profile-specific files)
6. application.properties (default)
7. @PropertySource annotations
8. Default values (@Value fallbacks)
```

Understanding this precedence is exactly why `spring.datasource.url` set as an environment variable in a deployment environment automatically overrides your local `application.properties` — a deliberate, useful design.

---

<a id="ch14"></a>
## Chapter 14 — Resource Abstraction

Spring provides a unified `Resource` interface for accessing files, classpath resources, URLs, and raw byte streams — all through the same API, regardless of where the data lives.

```java
// Via ResourceLoader (inject into any bean)
@Component
public class ConfigReader {
    @Autowired
    private ResourceLoader resourceLoader;

    public void read() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:data/config.json");
        String content = new String(resource.getInputStream().readAllBytes());
    }
}

// Via @Value injection — Spring resolves the resource descriptor
@Value("classpath:templates/email.html")
private Resource emailTemplate;

@Value("file:/etc/app/secrets.properties")
private Resource secretsFile;

@Value("https://api.example.com/config")
private Resource remoteConfig;
```

| Prefix | Resolves to |
|---|---|
| `classpath:` | File from the application's classpath |
| `file:` | Absolute or relative file system path |
| `http:` / `https:` | Remote URL |
| `(no prefix)` | Depends on ApplicationContext type — usually classpath |

---

<a id="ch15"></a>
## Chapter 15 — What Spring Boot Automates From All of This

Now that you understand each piece, here's exactly what Spring Boot is doing on top of it:

### Auto-Configuration Is Just Conditional `@Configuration` Classes

```java
// This is roughly what Spring Boot's DataSource auto-configuration looks like internally
@Configuration
@ConditionalOnClass(HikariDataSource.class)       // only configure if HikariCP is on the classpath
@ConditionalOnMissingBean(DataSource.class)         // only configure if YOU haven't already defined one
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {

    @Bean
    public DataSource dataSource(DataSourceProperties properties) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(properties.getUrl());
        ds.setUsername(properties.getUsername());
        return ds;
    }
}
```

Every `spring-boot-starter-*` dependency you add ships a set of `@Configuration` classes annotated with conditions like these. Spring Boot's `spring.factories` / `AutoConfiguration.imports` file lists all of them, and the framework applies them if and only if their conditions are satisfied.

### The `@SpringBootApplication` Unpacked

```java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}

// @SpringBootApplication is a composed annotation — it equals all three of:
@Configuration            // marks this as a source of @Bean definitions
@EnableAutoConfiguration  // triggers the auto-configuration mechanism above
@ComponentScan            // scans this class's package and sub-packages for @Component
```

### What "Convention Over Configuration" Means Here

When you add `spring-boot-starter-data-jpa` and define `spring.datasource.url` in `application.properties`, Spring Boot:
1. Detects Hibernate and JPA on the classpath
2. Creates a `DataSource` bean from your properties (because its `@ConditionalOnMissingBean` condition is met — you didn't define one yourself)
3. Creates a `LocalContainerEntityManagerFactoryBean` (JPA's central configuration object)
4. Creates a `JpaTransactionManager`
5. Enables `@EnableJpaRepositories` to scan for your `JpaRepository` interfaces

All of these are plain Spring `@Configuration` classes you could have written yourself. Spring Boot just writes them for you, conditioned on what it finds in your classpath and properties. That's the entire "magic."

---

<a id="ch16"></a>
## Key Takeaways

- Spring's entire value proposition is **Inversion of Control** — the container creates and wires objects, so your code declares dependencies rather than constructing them
- `ApplicationContext` is the full-featured container you always use — it extends `BeanFactory` with AOP, events, internationalization, and eager singleton initialization
- **Constructor injection** is the right default — final fields, explicit dependencies, testable without Spring infrastructure
- Every bean starts as a **`BeanDefinition`** (a blueprint), not an object — this two-phase design is what enables proxy wrapping, post-processing, and conditional bean creation
- Singleton beans are shared — injecting a prototype into a singleton silently breaks the prototype's per-request intent; use `@Lookup` to fix it
- `@Bean` is for **third-party or complex instantiation** (you write the `new`); `@Component` is for **your own classes** (Spring writes the `new`)
- When multiple beans match a type, resolve with `@Primary` (default winner) or `@Qualifier` (explicit name selection)
- Spring AOP works via **proxy wrapping** — self-invocation (`this.method()`) bypasses the proxy and silently skips advice, including `@Transactional`
- `@PostConstruct` runs after injection is complete — use it for initialization that needs injected dependencies, not the constructor
- Spring Boot's auto-configuration is nothing more than `@Configuration` classes with `@ConditionalOn*` guards — knowing this makes every `spring.autoconfigure.exclude` or manual bean override instantly intuitive

---

*Spring Boot is the destination. Spring Core is the map. You can reach the destination without the map — but only until something breaks at 2 AM and you have no idea why your `@Transactional` rollback isn't happening, or why your prototype bean is acting like a singleton. Now you have the map.*