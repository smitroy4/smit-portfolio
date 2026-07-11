## From Surviving Failure to Shipping Continuously — Resilience4j, Kafka, Kubernetes, and Sagas

> *In the Foundational guide, you built separate buildings connected by phone lines. This guide is about what happens when one of those phone lines goes dead mid-call, when a department needs to notify twenty other departments about something without calling each one individually, and when you need to prove — before deployment — that changing your side of a contract won't break the department three buildings over. Foundational made the system work. This makes it survive.*

Every pattern in the Foundational guide assumed the happy path — Eureka finds the service, the gateway routes the request, `WebClient` gets a response. Production doesn't work that way. Services go down mid-request, networks partition, deployments happen while traffic is live, and two services updating "the same" business transaction can disagree about what actually happened. This guide is about the layer of engineering that exists entirely to handle that: what to do when a call fails instead of just making the call, how to decouple services in time instead of just in space, how to prove a contract holds before you ship a breaking change, and how to run all of this on infrastructure that expects failure as a constant rather than an exception.

---

<a id="ch1"></a>
## Chapter 1 — Client-Side Load Balancing With Spring Cloud LoadBalancer

In the Foundational guide, Chapter 5 established that Eureka returns *every* healthy instance of a service, not just one — `order-service` asking "where is `inventory-service`?" gets back a list, not a single address. Something has to decide which of those instances actually receives this particular call, and it has to make that decision on every single request, fast enough that it never becomes the bottleneck. That's the job of a **load balancer**, and the design decision worth understanding first is *where* that decision gets made.

**Server-side load balancing** — the traditional model, like an Nginx reverse proxy or a cloud load balancer (AWS ELB) — puts a dedicated component in front of your service instances. Every caller sends its request to the load balancer, and the load balancer forwards it to a chosen instance. This works, but it introduces an extra network hop for every single call, and that load balancer itself becomes a piece of shared infrastructure that needs to know about every service.

**Client-side load balancing** — what Spring Cloud LoadBalancer does — flips this: the *calling service itself* has the full list of healthy instances (fetched from Eureka) and picks one locally, in-process, before making the call directly to that instance. There's no intermediate hop, no shared load-balancer infrastructure to run, and the decision is made using information the client already has cached from the service registry.

```
Server-Side Load Balancing               Client-Side Load Balancing
──────────────────────────               ──────────────────────────
order-service → LB → inventory-service    order-service (has instance list from Eureka)
                                                    │
Extra network hop through the LB                   ├──▶ inventory-service instance A
LB is shared infra, single point                    └──▶ inventory-service instance B
  of contention for ALL services            order-service picks locally, calls directly
```

This is why `@LoadBalanced` on a `RestTemplate` or `WebClient.Builder` (introduced in the Foundational guide's Chapter 8) is doing real, non-trivial work — it's not just resolving `http://inventory-service` into an IP address, it's actively running a load-balancing algorithm against the current list of healthy instances on every call.

```xml
<!-- pom.xml — Spring Cloud LoadBalancer (replaces the deprecated Netflix Ribbon) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

```java
// The default strategy is round-robin — requests are distributed evenly, instance by instance
@Configuration
public class LoadBalancerConfig {

    // Customizing the strategy for a specific service — here, choosing the
    // instance with the fewest active requests instead of plain round-robin
    @Bean
    public ReactorLoadBalancer<ServiceInstance> reactorServiceInstanceLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory clientFactory) {
        String serviceId = clientFactory.getName(environment);
        return new RoundRobinLoadBalancer(
            clientFactory.getLazyProvider(serviceId, ServiceInstanceListSupplier.class),
            serviceId
        );
    }
}
```

```java
// Using the LoadBalancerClient directly when you need to inspect the chosen instance
@Service
@RequiredArgsConstructor
public class InventoryClient {

    private final LoadBalancerClient loadBalancerClient;
    private final RestTemplate restTemplate;

    public StockResponse checkStock(Long productId) {
        // Explicitly ask the load balancer which instance to use — useful for logging
        // or debugging which instance actually served a given request
        ServiceInstance instance = loadBalancerClient.choose("inventory-service");
        String url = instance.getUri() + "/api/v1/inventory/" + productId;
        return restTemplate.getForObject(url, StockResponse.class);
    }
}
```

Round-robin is the default and is a fine starting point, but it's a blind strategy — it doesn't know that instance A is currently overloaded while instance B is idle. Production systems under real load often move to a **weighted response-time** strategy, or an instance-health-aware strategy that factors in each instance's current Actuator health status (Foundational, Chapter 11) rather than treating every registered instance as equally available.

> ⚠️ **Golden Rule:** client-side load balancing means every calling service caches its own view of "who's healthy" — that cache has a refresh interval, which means for a short window after an instance goes down, some callers may still try to route to it. This is exactly why the retry and circuit breaker patterns in the next chapter aren't optional extras — they're the mechanism that absorbs the gap between "the registry hasn't updated yet" and "the instance is actually gone."

---

<a id="ch2"></a>
## Chapter 2 — Circuit Breakers and Fault Tolerance With Resilience4j

Chapter 1 solved "which instance do I call." This chapter solves a harder problem: **what happens when the instance I called doesn't answer, answers slowly, or answers with an error — repeatedly?** Without an answer to that question, a struggling `inventory-service` doesn't just fail its own requests — it can take down `order-service` too, because every thread in `order-service` that's waiting on a slow inventory call is a thread that can't do anything else. This cascading failure pattern is one of the most common ways a single struggling service brings down an entire system that had nothing to do with the original problem.

**Resilience4j** is the modern, lightweight fault-tolerance library for the JVM, and it replaced **Hystrix** — Netflix's original circuit breaker library, which was placed into maintenance mode in 2018 and should not be used in new systems. Resilience4j is built as a set of independent, composable decorators — circuit breaker, retry, rate limiter, bulkhead, time limiter — each of which can wrap a call individually or be stacked together.

The **circuit breaker** is the centerpiece, and the mental model is literally an electrical circuit breaker in your home: under normal conditions, current flows freely (the **CLOSED** state — calls go through normally). If a circuit sees too much current (too many failures), it trips and stops all current from flowing (the **OPEN** state — calls fail immediately, without even attempting the network call) to protect the rest of the system from the failure. After a cooldown period, the breaker cautiously lets a small trickle of current through again (the **HALF_OPEN** state) to test whether the underlying problem has cleared — if those test calls succeed, it closes fully again; if they fail, it trips back open.

![Circuit breaker state machine — Closed, Open, and Half-Open transitions](/images/blogs/internals/circuit-breaker-state-machine.png)

```
CLOSED  ──[failure rate exceeds threshold]──▶  OPEN
  ▲                                              │
  │                                    [wait duration elapses]
  │                                              │
  │                                              ▼
  └──[trial calls succeed]──── HALF_OPEN ◀───────┘
              │
              └──[trial calls fail]──▶ back to OPEN
```

The critical behavioral shift this creates: while the breaker is OPEN, `order-service` doesn't even attempt the network call to `inventory-service` — it fails **immediately and locally**, in microseconds, instead of waiting out a slow timeout on every single request. This is what actually prevents the cascading failure — `order-service`'s threads stop being tied up waiting on a service that's already known to be struggling.

```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>   <!-- required — annotations use AOP proxies -->
</dependency>
```

```yaml
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 10          # evaluate failure rate over the last 10 calls
        failure-rate-threshold: 50        # trip OPEN if 50% of those calls fail
        wait-duration-in-open-state: 10s  # stay OPEN for 10s before trying HALF_OPEN
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true

  retry:
    instances:
      inventoryService:
        max-attempts: 3
        wait-duration: 500ms
        # Only retry genuinely transient failures — never retry a 4xx client error
        retry-exceptions:
          - java.net.ConnectException
          - org.springframework.web.client.ResourceAccessException

  timelimiter:
    instances:
      inventoryService:
        timeout-duration: 3s   # never wait longer than this for the call to complete
```

```java
@Service
@RequiredArgsConstructor
public class InventoryClient {

    private final WebClient.Builder webClientBuilder;

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "checkStockFallback")
    @Retry(name = "inventoryService")
    @TimeLimiter(name = "inventoryService")
    public CompletableFuture<StockResponse> checkStock(Long productId) {
        return webClientBuilder.build()
                .get()
                .uri("http://inventory-service/api/v1/inventory/{id}", productId)
                .retrieve()
                .bodyToMono(StockResponse.class)
                .toFuture();
    }

    // Called when the circuit is OPEN or every retry attempt has been exhausted —
    // the signature must match the original method plus a Throwable parameter
    public CompletableFuture<StockResponse> checkStockFallback(Long productId, Throwable t) {
        log.warn("Falling back for product {} due to: {}", productId, t.getMessage());
        // A conservative fallback — treat unknown stock as unavailable rather than
        // guessing "probably in stock," which could oversell during an outage
        return CompletableFuture.completedFuture(
            new StockResponse(productId, 0, false));
    }
}
```

The order these annotations apply in matters: `TimeLimiter` bounds how long a single attempt can take, `Retry` governs how many times a failed attempt gets repeated, and `CircuitBreaker` tracks the aggregate failure rate across many calls to decide whether to stop trying altogether. Stacking retry directly on top of a circuit breaker without care can actually make an overloaded service worse — three retries per call means the struggling service sees three times the traffic from that one caller, right when it can least handle it, which is why the retry's `wait-duration` (with backoff) and the circuit breaker's fast-fail behavior have to work together rather than fight each other.

> 💡 **Interview framing:** if asked "how would you prevent one failing service from bringing down another," the answer that shows depth is naming the specific combination — timeout to bound individual call latency, retry with backoff for transient blips, circuit breaker to stop trying entirely once a service is clearly down, and a fallback to degrade gracefully instead of propagating the failure up to the end user. Naming just "circuit breaker" alone is an incomplete answer.

The **Bulkhead** pattern (also in Resilience4j) is worth knowing by name even at this level: it limits how many concurrent calls can be in-flight to a specific dependency, using a fixed-size thread pool or semaphore per dependency — so that even without a full outage, one slow dependency can't consume every available thread in your service, the same way a ship's bulkheads prevent one flooded compartment from sinking the whole vessel.

---

<a id="ch3"></a>
## Chapter 3 — Distributed Tracing: Sleuth, Zipkin, and Micrometer Tracing

In a monolith, when something goes wrong, you have one log file and one stack trace — the full story of a request lives in one place. The moment a request crosses `api-gateway → order-service → inventory-service → payment-service`, that single story splinters into four separate log files on four separate machines, each with its own timestamps and its own request handling, with no built-in way to know that these four log entries were actually part of the *same* originating request. Debugging a slow or failed request without a way to stitch these together means manually correlating timestamps across services — which does not scale past a handful of services.

**Distributed tracing** solves this by attaching a single **trace ID** to a request the moment it enters the system (typically at the gateway), and propagating that same trace ID through every downstream call the original request triggers. Each individual unit of work within that trace — the gateway's handling, the order-service call, the inventory-service call — is recorded as a **span**, with its own start time, duration, and metadata, but all spans sharing the same trace ID can be reassembled into a complete, ordered picture of exactly what happened, on which service, and how long each step took.

```
Trace ID: 7f3a9c21-... (one ID for the ENTIRE request lifecycle)

  Span: api-gateway            [0ms ────────────── 340ms]
    └─ Span: order-service     [15ms ──────────── 320ms]
         └─ Span: inventory-service  [40ms ──── 180ms]
         └─ Span: payment-service    [190ms ──────── 310ms]

Reading this trace immediately shows: payment-service's call took 120ms —
the single largest contributor to this request's total latency.
```

![Distributed trace waterfall showing spans across gateway, order, inventory, and payment services](/images/blogs/internals/distributed-tracing-waterfall.png)

**Micrometer Tracing** is the current Spring Boot standard for generating trace and span IDs and propagating them across service boundaries — it replaced **Spring Cloud Sleuth**, which was merged into Micrometer starting with Spring Boot 3. Micrometer Tracing itself is a facade; it needs a tracer implementation underneath (commonly **Brave**, originally from Zipkin) and an exporter to actually ship the collected trace data somewhere visualizable — most commonly **Zipkin**, a dedicated trace-collection and visualization server.

```xml
<!-- pom.xml — Micrometer Tracing with Brave, exporting to Zipkin -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

```yaml
# application.yml — every service in the system needs this
management:
  tracing:
    sampling:
      probability: 1.0     # trace 100% of requests in dev; much lower (e.g. 0.1) in production
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

logging:
  pattern:
    # Injecting trace and span IDs directly into every log line — this is what actually
    # lets you grep logs across services for one request using a single trace ID
    level: "%5p [${spring.application.name},%X{traceId:-},%X{spanId:-}]"
```

With this in place, propagation across an HTTP call made via `RestTemplate` or `WebClient` (Foundational, Chapter 8) is automatic — Micrometer Tracing instruments Spring's HTTP clients to inject the trace context into outgoing request headers (`traceparent`, following the W3C Trace Context standard), and instruments incoming request handling to read that header and continue the same trace rather than starting a new one.

```java
// Adding a custom span for a specific unit of work worth tracing individually,
// beyond the automatic HTTP-call spans
@Service
@RequiredArgsConstructor
public class OrderService {

    private final Tracer tracer;
    private final PricingEngine pricingEngine;

    public OrderResponse createOrder(CreateOrderRequest request) {
        Span pricingSpan = tracer.nextSpan().name("calculate-order-pricing");
        try (Tracer.SpanInScope ws = tracer.withSpan(pricingSpan.start())) {
            BigDecimal total = pricingEngine.calculate(request);
            pricingSpan.tag("order.total", total.toString());
            // ... rest of order creation
        } finally {
            pricingSpan.end();
        }
        // ...
    }
}
```

> 💡 **Pro tip:** `sampling.probability: 1.0` (trace every request) is correct for development and for debugging a specific production incident, but it's rarely correct as a permanent production setting — tracing every request at high volume adds real overhead and storage cost. A common production setting samples a small percentage (5–10%) of normal traffic but always traces requests that resulted in an error, giving you statistically representative latency data without paying full tracing cost on every single request.

---

<a id="ch4"></a>
## Chapter 4 — Centralized Logging With the ELK Stack

Distributed tracing (Chapter 3) tells you *which* services a request touched and *how long* each step took. It does not replace logs — it complements them. When a trace shows that `inventory-service`'s span failed, the actual reason (a null pointer, a validation failure, a database timeout) still lives in that service's log output, and with a dozen or more services each writing their own log files on their own containers, "SSH into the right container and `tail -f` the right file" stops being viable almost immediately.

**Centralized logging** solves this by shipping every service's log output to one searchable location instead of leaving it scattered across individual containers. The **ELK stack** — **Elasticsearch** (a search and analytics engine that indexes the log data), **Logstash** (or the lighter **Filebeat**, which collects and forwards logs), and **Kibana** (the web UI for searching and visualizing) — is the most common open-source implementation of this pattern.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│order-service  │  │inventory-svc  │  │payment-svc    │
│ writes logs    │  │ writes logs    │  │ writes logs    │
│ to stdout      │  │ to stdout      │  │ to stdout      │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                           ▼
                 ┌──────────────────┐
                 │    Filebeat        │  ← collects logs from every container
                 └──────────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │   Elasticsearch     │  ← indexes and stores logs, searchable
                 └──────────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │      Kibana         │  ← search, filter, and visualize logs
                 └──────────────────┘         from every service, in one place
```

The single most important prerequisite for this to actually be useful is **structured logging** — every service emitting logs as JSON with consistent field names, rather than free-form text strings that are easy for a human to read in one file but painful to filter and aggregate across thousands of log lines from different services.

```xml
<!-- pom.xml — Logstash JSON encoder for structured log output -->
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

```xml
<!-- logback-spring.xml — outputs JSON instead of plain text -->
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <!-- Include the trace/span IDs from Chapter 3 in every JSON log line —
                 this is what lets Kibana filter logs by a single trace ID -->
            <includeMdcKeyName>traceId</includeMdcKeyName>
            <includeMdcKeyName>spanId</includeMdcKeyName>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON" />
    </root>
</configuration>
```

```java
// Structured logging in code — never string-concatenate variable data into the message;
// pass it as key-value context so it becomes a filterable JSON field, not buried text
@Slf4j
@Service
public class OrderService {

    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Order creation started",
            kv("productId", request.productId()),
            kv("quantity", request.quantity()),
            kv("customerId", request.customerId()));
        // ...
    }
}
```

With logs in Elasticsearch and trace IDs embedded in every log line, the two systems from this and the previous chapter combine into the workflow that actually resolves production incidents fast: a trace in Zipkin shows *which* service and span failed and how long it took; searching Kibana for that exact trace ID immediately surfaces every log line, from every service, that was part of that specific failed request — without SSH-ing into a single container.

> ⚠️ **Golden Rule:** never log sensitive data — passwords, full card numbers, JWT tokens, personally identifiable information — even at DEBUG level, because centralized logging means that data is now searchable and retained in one place by anyone with Kibana access, which is a far larger exposure surface than a single log file on one machine ever was.

---

<a id="ch5"></a>
## Chapter 5 — Async Messaging: Kafka and RabbitMQ

Every inter-service call covered in the Foundational guide — `RestTemplate`, `WebClient` — is **synchronous**: the caller sends a request and waits (blocking or non-blocking) for a response before continuing. This works well when the caller genuinely needs an immediate answer ("is this product in stock, right now, before I show the checkout page"). It works badly when the caller doesn't need an immediate answer at all — `order-service` confirming an order doesn't need `notification-service` to have already sent the confirmation email before it can respond to the customer; it just needs to know the email *will* get sent eventually. Forcing that into a synchronous call couples `order-service`'s availability to `notification-service`'s availability for no real reason.

**Message brokers** — Kafka and RabbitMQ being the two dominant choices — decouple this: instead of calling another service directly, a service publishes a **message** to a broker, and the broker takes responsibility for delivering it. The publisher doesn't need to know who's listening, doesn't wait for a response, and doesn't fail if the consumer happens to be down at that exact moment — the message sits safely in the broker until the consumer is ready.

```
Synchronous (tight coupling)              Asynchronous (decoupled via broker)
──────────────────────────                ──────────────────────────────────
order-service ──HTTP──▶ notification-svc   order-service ──▶ [Kafka topic] ◀── notification-svc
                                                                    ▲
order-service BLOCKS until                                  also consumed by:
notification-service responds                               analytics-service
                                                              email-service
If notification-service is down,                            (all independently, no coupling
order confirmation itself fails                               between publisher and consumers)
```

**RabbitMQ** is a traditional **message queue broker** — built around the AMQP protocol, it excels at reliable point-to-point and pub/sub delivery where messages are typically consumed once and removed. **Kafka** is a **distributed event streaming platform** — it retains messages in an ordered, replayable log (a **topic**, split into **partitions**) for a configurable retention period, meaning multiple independent consumers can each read the same stream of events at their own pace, and even replay historical events if needed. The practical rule of thumb: RabbitMQ fits task/work-queue scenarios (send this email, process this job); Kafka fits event-streaming scenarios (broadcast this fact happened, let anyone interested consume it, possibly more than once).

```xml
<!-- pom.xml — Spring for Apache Kafka -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

```java
// Publishing — order-service, after successfully creating an order
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public void publishOrderCreated(Order order) {
        OrderCreatedEvent event = new OrderCreatedEvent(
            order.getId(), order.getCustomerId(), order.getTotal(), Instant.now());

        // key = order.getId() ensures all events for the same order land on the
        // same partition, preserving per-order ordering even with multiple partitions
        kafkaTemplate.send("order-events", order.getId().toString(), event);
    }
}
```

```java
// Consuming — notification-service, independently, on its own schedule
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final EmailService emailService;

    @KafkaListener(topics = "order-events", groupId = "notification-service")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // notification-service never knew order-service existed as a caller —
        // it just reacts to events on a topic it subscribed to
        emailService.sendOrderConfirmation(event.customerId(), event.orderId());
    }
}
```

```yaml
# application.yml — order-service (producer)
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all             # wait for all in-sync replicas to acknowledge — durability over speed

# application.yml — notification-service (consumer)
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: notification-service
      auto-offset-reset: earliest    # new consumer group starts from the beginning of the topic
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "com.example.events"
```

The **consumer group** concept is what makes Kafka scale horizontally on the consuming side: multiple instances of `notification-service` sharing the same `group-id` automatically split the topic's partitions between them, so each message is processed by exactly one instance within that group — while a completely separate consumer group (say, `analytics-service`) can independently consume the *same* topic from the beginning, entirely unaffected by what `notification-service`'s group has already read.

> ⚠️ **Golden Rule:** async messaging trades immediate consistency for availability and decoupling — the consumer will process the event *eventually*, not instantly, and if you need the caller to know synchronously "did this succeed," a fire-and-forget event is the wrong tool. Never use async messaging for a call where the caller's own response depends on the outcome of that message being processed (e.g., don't publish "reserve stock" as fire-and-forget and then immediately tell the customer "in stock" without waiting for confirmation) — that's a correctness bug wearing a scalability pattern's clothing.

---

<a id="ch6"></a>
## Chapter 6 — Event-Driven Architecture Basics

Chapter 5 covered the transport mechanism — how a message physically gets from one service to another. **Event-driven architecture (EDA)** is the design philosophy built on top of that mechanism: instead of services calling each other to request work be done, services **publish facts about things that already happened** ("OrderCreated," "PaymentFailed," "StockReserved") and any number of other services react to those facts independently, without the publisher knowing or caring who's listening.

The distinction worth being precise about is **events vs commands**. A **command** ("ReserveStock") is an instruction — it names what should happen, is addressed to a specific service, and typically expects that service to actually do it. An **event** ("OrderCreated") is a statement of fact about something that has already, unconditionally, happened — it isn't addressed to anyone, and the publisher makes no assumption about who, if anyone, is listening or what they'll do about it. Reaching for events instead of commands is what actually delivers the decoupling benefit — a command creates an implicit dependency ("I need you to do this"), while an event creates none ("this happened, do with it what you will").

```
Command-driven (implicit coupling)         Event-driven (genuine decoupling)
──────────────────────────────             ──────────────────────────────
order-service sends:                       order-service publishes:
  "ReserveStock" ──▶ inventory-service        "OrderCreated" ──▶ [topic]
  "SendEmail"    ──▶ notification-service            │
                                                       ├─▶ inventory-service (reserves stock)
order-service must know about                        ├─▶ notification-service (sends email)
every downstream service and what                    └─▶ analytics-service (records metric)
each one needs to be told to do
                                            order-service knows about NONE of these —
                                            new consumers can be added with zero
                                            changes to order-service
```

![Event-driven architecture — one publisher, multiple independent consumers reacting to the same event](/images/blogs/internals/event-driven-architecture-fanout.png)

This is the property that makes event-driven systems genuinely extensible in a way synchronous, command-driven systems aren't: adding a new consumer — say, a `fraud-detection-service` that wants to react to every `OrderCreated` event — requires zero changes to `order-service`. It just subscribes to the existing topic. In a command-driven or synchronous-call system, adding that same capability would mean modifying `order-service` to explicitly call the new service.

```java
// A well-designed domain event — a fact, immutable, self-contained
public record OrderCreatedEvent(
    UUID eventId,           // unique ID for this specific event occurrence — useful for
                             // deduplication if a consumer sees the same event twice
    Long orderId,
    Long customerId,
    BigDecimal total,
    List<OrderLineItem> items,
    Instant occurredAt
) {}
```

The honest trade-off to name here: event-driven systems are harder to reason about and harder to debug than direct calls, precisely because the flow of "what happens when an order is created" is no longer visible in one place — it's scattered across every consumer that happens to be listening to that topic, discoverable only by searching the codebase (or the message broker's consumer groups) for who subscribes to it. Distributed tracing (Chapter 3) and centralized logging (Chapter 4) aren't optional nice-to-haves in an event-driven system — they're close to mandatory, because they're the only practical way to reconstruct "what actually happened" across a set of services that were deliberately designed not to know about each other.

> 💡 **Interview framing:** if asked to design a system and you reach for events, be ready to name the trade-off unprompted — eventual consistency instead of immediate consistency, and harder debuggability in exchange for decoupling and extensibility. An answer that only lists the benefits of event-driven architecture without naming this cost reads as inexperienced.

---

<a id="ch7"></a>
## Chapter 7 — API Versioning Strategies

The Foundational guide's Chapter 4 established that inter-service REST contracts need versioning because there's no compiler catching a broken contract across independently deployed services. This chapter goes one level deeper: *how* you actually implement that versioning, because the mechanism you choose has real trade-offs for how consumers migrate and how much complexity you carry in your codebase.

**URI versioning** (`/api/v1/orders`, `/api/v2/orders`) is the most common approach because it's the most explicit — the version is visible in the URL, trivially cacheable, trivially routable at the gateway level (Foundational, Chapter 6), and requires zero special client tooling to consume. Its downside is that a "breaking change to one field" often forces you to duplicate an entire controller and DTO set just to change that one field, even when 90% of the endpoint is identical between versions.

**Header versioning** (`Accept: application/vnd.company.orders.v2+json`, or a custom `X-API-Version` header) keeps the URL stable across versions and is considered more strictly "RESTful" by some API design purists, since a URI is supposed to identify a resource, not a representation of it. Its downside is that it's invisible in browser address bars and harder to test casually with a simple `curl` or a browser — every client needs to know to set the header correctly.

```java
// URI versioning — the common, pragmatic default for inter-service APIs
@RestController
@RequestMapping("/api/v1/orders")
public class OrderControllerV1 {
    @GetMapping("/{id}")
    public OrderResponseV1 getOrder(@PathVariable Long id) { /* ... */ }
}

@RestController
@RequestMapping("/api/v2/orders")
public class OrderControllerV2 {
    @GetMapping("/{id}")
    public OrderResponseV2 getOrder(@PathVariable Long id) { /* ... */ }
}
```

```java
// Header versioning — version negotiated via the Accept header, same URL
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping(value = "/{id}", produces = "application/vnd.company.orders.v1+json")
    public OrderResponseV1 getOrderV1(@PathVariable Long id) { /* ... */ }

    @GetMapping(value = "/{id}", produces = "application/vnd.company.orders.v2+json")
    public OrderResponseV2 getOrderV2(@PathVariable Long id) { /* ... */ }
}
```

The more important discipline, regardless of mechanism, is distinguishing **breaking** from **non-breaking** changes so you don't bump a major version needlessly. Adding a new optional field to a response is non-breaking — existing consumers that don't know about the field simply ignore it. Removing a field, renaming a field, or changing a field's type or meaning is breaking — any consumer depending on the old shape fails. A disciplined team can go a long time on `v1` by only ever making additive, non-breaking changes, and reserving a version bump for genuinely necessary breaking changes.

> 💡 **Pro tip:** when a breaking change is unavoidable, never delete the old version the same day you ship the new one. Run both versions in parallel, monitor actual traffic to the old version (via the centralized logging and tracing from Chapters 3-4) to see which consumers haven't migrated yet, and only retire `v1` once traffic to it has genuinely dropped to zero — not once you've merely announced the deprecation.

---

<a id="ch8"></a>
## Chapter 8 — JWT / OAuth2 Authentication Across Services

A previous guide in this series covered how JWT and OAuth2 work within a single Spring Boot application in full depth — the filter chain, token generation, refresh rotation, and OAuth2's Authorization Code flow. In a microservices system, those same mechanisms have to answer a new question: **once a user is authenticated at the gateway, how does every downstream service know who's calling, without each one re-running the full login flow?**

The pattern that fits the Foundational guide's API Gateway (Chapter 6) is validating the JWT **once**, at the gateway, and then propagating the already-verified identity downstream as a lightweight, trusted header or claim — rather than every internal service independently re-validating the token against an external identity provider on every single call, which would add real latency to every internal hop for a check that's already been done once.

```
External client ──JWT──▶ API Gateway
                              │
                    validates JWT signature + expiry
                    extracts userId, roles from claims
                              │
                              ▼
              adds trusted headers: X-User-Id, X-User-Roles
                              │
                              ▼
              order-service ──▶ inventory-service ──▶ payment-service
              (each trusts the headers — they came from
               the gateway, which is the only external entry point)
```

```java
// A Spring Cloud Gateway filter that validates the JWT once and forwards trusted claims
@Component
public class JwtValidationGatewayFilter implements GlobalFilter, Ordered {

    private final JwtDecoder jwtDecoder;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/api/v1/auth/")) {
            return chain.filter(exchange);   // public auth endpoints bypass validation
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        try {
            Jwt jwt = jwtDecoder.decode(authHeader.substring(7));

            // Rewrite the request, adding trusted internal headers derived from the
            // now-verified token — downstream services read these, not the raw JWT
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", jwt.getSubject())
                    .header("X-User-Roles", String.join(",", jwt.getClaimAsStringList("roles")))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (JwtException e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() { return -100; }   // run before routing filters
}
```

```java
// A downstream service — trusts the gateway-supplied header, doesn't re-verify the JWT
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @GetMapping("/mine")
    public List<OrderResponse> getMyOrders(@RequestHeader("X-User-Id") String userId) {
        return orderService.findByCustomerId(Long.valueOf(userId));
    }
}
```

> ⚠️ **Golden Rule:** this pattern is only safe if internal services are genuinely unreachable from outside the cluster — if `order-service` can be called directly, bypassing the gateway, then anyone can forge an `X-User-Id` header and impersonate any user. The gateway must be the *only* network path into internal services (enforced at the network/firewall or Kubernetes NetworkPolicy level, covered in Chapter 11), or this entire trust model collapses.

For service-to-service calls that aren't triggered by an end user at all — a scheduled job in `inventory-service` calling `notification-service` directly — **OAuth2 Client Credentials Grant** is the standard pattern: each service authenticates as itself (not as a user) against the authorization server, receives a service-scoped access token, and presents that token on its own outbound calls, giving you an audit trail and permission model for machine-to-machine traffic separate from user-driven traffic.

---

<a id="ch9"></a>
## Chapter 9 — Contract Testing With Spring Cloud Contract

Chapter 7 established API versioning as the discipline for *managing* breaking changes deliberately. Contract testing answers a related but different question: **how do you catch an accidental breaking change before it ships**, without maintaining a slow, brittle, full end-to-end test environment where every service in the system has to be running simultaneously just to verify that `order-service` still correctly calls `inventory-service`.

The core idea of **consumer-driven contract testing**: the consumer of an API (`order-service`, calling `inventory-service`) defines the exact shape of the request and response it depends on — a **contract**. That contract is used to generate two things automatically: a **stub** of the provider that the consumer can test against in complete isolation (no real `inventory-service` needs to be running), and a **test on the provider's side** that verifies `inventory-service`'s actual implementation still satisfies that exact contract. If a developer on the inventory team changes the response shape in a way that breaks the contract, the provider-side generated test fails *in their own CI pipeline*, before they ever merge — catching the break at the source, not three services downstream in a flaky end-to-end suite.

```
                  ┌─────────────────────────┐
                  │   Contract (Groovy/YAML)  │
                  │   defined by the consumer  │
                  │   (order-service)          │
                  └─────────────────────────┘
                       │                    │
           generates   │                    │  generates
                       ▼                    ▼
        ┌─────────────────────┐   ┌─────────────────────┐
        │   WireMock stub        │   │  Provider-side test   │
        │   consumer tests        │   │  runs against          │
        │   against, in isolation │   │  inventory-service's   │
        │   (order-service CI)    │   │  REAL implementation   │
        └─────────────────────┘   │  (inventory-service CI)│
                                     └─────────────────────┘
                                     Fails here if the real API
                                     no longer matches the contract
```

```groovy
// src/test/resources/contracts/shouldReturnStockForProduct.groovy
// Lives in inventory-service's repo — defines what order-service depends on
Contract.make {
    description "should return stock details for a valid product ID"

    request {
        method GET()
        url "/api/v1/inventory/42"
    }

    response {
        status OK()
        headers { contentType(applicationJson()) }
        body(
            productId: 42,
            availableQuantity: 150,
            inStock: true
        )
    }
}
```

```xml
<!-- inventory-service (provider) pom.xml -->
<plugin>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-contract-maven-plugin</artifactId>
    <version>4.1.0</version>
    <extensions>true</extensions>
    <configuration>
        <baseClassForTests>com.example.inventory.contract.BaseContractTest</baseClassForTests>
    </configuration>
</plugin>
```

```java
// inventory-service — the base class the generated contract test extends;
// spins up the REAL controller (via MockMvc) to verify the contract actually holds
@SpringBootTest
public abstract class BaseContractTest {

    @Autowired
    private InventoryController inventoryController;

    @BeforeEach
    void setup() {
        RestAssuredMockMvc.standaloneSetup(inventoryController);
    }
}
```

```java
// order-service (consumer) — uses the auto-generated stub, no real inventory-service needed
@AutoConfigureStubRunner(
    ids = "com.example:inventory-service:+:stubs:8082",
    stubsMode = StubRunnerProperties.StubsMode.LOCAL
)
@SpringBootTest
class OrderServiceContractTest {

    @Autowired
    private InventoryClient inventoryClient;

    @Test
    void shouldGetStockFromInventoryServiceStub() {
        // This calls a real HTTP request to a WireMock stub generated FROM
        // inventory-service's actual contract — not a hand-written mock that
        // could silently drift from what inventory-service really returns
        StockResponse response = inventoryClient.checkStock(42L);
        assertThat(response.availableQuantity()).isEqualTo(150);
    }
}
```

The distinction worth being precise about for interviews: contract testing is not a replacement for integration or end-to-end testing — it verifies that two services *agree on a shape*, not that the full business flow across many services behaves correctly together. It's specifically the tool for catching one very common, very expensive class of bug — a silent, accidental breaking change to an inter-service API — cheaply, fast, and at the point in the pipeline (each team's own CI) where it's cheapest to fix.

---

<a id="ch10"></a>
## Chapter 10 — Dockerized Multi-Service Orchestration Revisited

The Foundational guide's Chapter 9 introduced Docker Compose for running a handful of services locally. At the Proficient level, the system has grown — Eureka, Config Server, Gateway, three or four business services, each with its own database, plus Kafka, Zipkin, and an ELK stack — and orchestrating all of it by hand in one `docker-compose.yml` starts to expose real gaps that matter before moving to genuine production orchestration in Chapter 11.

The first gap is **startup ordering with actual readiness**, not just container-start order. `depends_on` alone (as flagged as a limitation in the Foundational guide) only waits for a container to *start*, not for the service inside it to be *ready* — Kafka in particular can take several seconds after its container starts before it's actually able to accept connections, and a consumer service that starts too early will fail its first connection attempts.

```yaml
# docker-compose.yml — proper readiness-based startup ordering
services:
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 5s
      retries: 5

  order-service:
    build: ./order-service
    depends_on:
      kafka:
        condition: service_healthy    # waits for the healthcheck to pass, not just container start
      order-db:
        condition: service_healthy

  order-db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
```

The second gap is **network segmentation** — by default, every service in a single `docker-compose.yml` shares one flat network, meaning any service can reach any other service's exposed port, including databases that should only ever be reachable by the one service that owns them (the database-per-service pattern from the Foundational guide's Chapter 10, actually enforced at the network level rather than just by convention).

```yaml
# Segmenting networks so inventory-db is unreachable from order-service
services:
  order-service:
    networks: [backend, order-tier]

  order-db:
    networks: [order-tier]     # only reachable by services also on order-tier

  inventory-service:
    networks: [backend, inventory-tier]

  inventory-db:
    networks: [inventory-tier]  # order-service has no route to this network at all

networks:
  backend:        # shared network for service-to-service HTTP/Kafka traffic
  order-tier:     # private — only order-service and order-db
  inventory-tier: # private — only inventory-service and inventory-db
```

> 💡 **Pro tip:** treat a growing `docker-compose.yml` as a signal, not a permanent home. Once local orchestration needs readiness probes, network segmentation, resource limits, and horizontal scaling of individual services under load, you've outgrown what Compose was designed for — that's precisely the gap Kubernetes fills, and the concepts you've just applied manually here (readiness, network isolation) map almost directly onto Kubernetes primitives in the next chapter.

---

<a id="ch11"></a>
## Chapter 11 — Kubernetes Basics: Deployments, Services, ConfigMaps, Secrets

Docker Compose runs containers on **one machine**. The moment your system needs to survive a single machine failing, scale a specific service to twenty replicas under Black Friday load, or roll out a new version with zero downtime, you need an **orchestrator** that manages containers across a *cluster* of machines — deciding where each container runs, restarting it if it crashes, and load-balancing traffic across however many replicas currently exist. **Kubernetes** (K8s) is the dominant orchestrator for exactly this job, and four of its building blocks map directly onto concepts already built across this series.

A **Pod** is Kubernetes' smallest deployable unit — usually one container (your Spring Boot service's Docker image from the Foundational guide's Chapter 9), though it can hold more than one tightly coupled container sharing the same network namespace. A **Deployment** is a higher-level object that manages a set of identical Pod replicas — it's what you actually create; you tell it "run 3 replicas of `inventory-service`'s image" and the Deployment continuously ensures exactly 3 healthy replicas exist, replacing any that crash or fail their health checks (the same `/actuator/health` liveness/readiness endpoints from the Foundational guide's Chapter 11).

```yaml
# inventory-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inventory-service
spec:
  replicas: 3                          # Kubernetes keeps exactly 3 healthy Pods running
  selector:
    matchLabels:
      app: inventory-service
  template:
    metadata:
      labels:
        app: inventory-service
    spec:
      containers:
        - name: inventory-service
          image: smitroy/inventory-service:1.4.0
          ports:
            - containerPort: 8082
          # These map directly to /actuator/health/liveness and /readiness
          # from the Foundational guide — Kubernetes calls them continuously
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8082 }
            initialDelaySeconds: 20
            periodSeconds: 10
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8082 }
            initialDelaySeconds: 15
            periodSeconds: 5
          envFrom:
            - configMapRef: { name: inventory-service-config }
            - secretRef: { name: inventory-service-secrets }
```

A **Service** solves the same problem Eureka solved in the Foundational guide's Chapter 5, but at the platform level rather than the application level — Pods are ephemeral (a crashed Pod gets replaced with a *new* Pod at a *new* internal IP), so nothing should ever address a Pod directly. A Kubernetes Service gives a stable internal DNS name (`inventory-service.default.svc.cluster.local`, or just `inventory-service` within the same namespace) that always routes to whichever Pods currently match its label selector — Kubernetes' own built-in service discovery and client-side-style load balancing (Chapter 1), no Eureka required inside a Kubernetes cluster.

```yaml
# inventory-service-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: inventory-service
spec:
  selector:
    app: inventory-service   # routes traffic to any Pod carrying this label
  ports:
    - port: 8082
      targetPort: 8082
  type: ClusterIP            # internal-only — not reachable from outside the cluster
```

**ConfigMaps** and **Secrets** are Kubernetes' native equivalent of the Foundational guide's Config Server pattern — externalized configuration, injected into Pods as environment variables or mounted files rather than baked into the image. The distinction between them is deliberate: a **ConfigMap** holds non-sensitive configuration in plain text (feature flags, log levels, non-secret URLs); a **Secret** holds sensitive values and is stored Base64-encoded with access control restrictions, intended for database passwords, API keys, and JWT signing keys.

```yaml
# inventory-service-config.yaml — ConfigMap: non-sensitive
apiVersion: v1
kind: ConfigMap
metadata:
  name: inventory-service-config
data:
  SPRING_PROFILES_ACTIVE: "prod"
  LOG_LEVEL: "INFO"
  KAFKA_BOOTSTRAP_SERVERS: "kafka-service:9092"

---
# inventory-service-secrets.yaml — Secret: sensitive (Base64-encoded, not encrypted by default)
apiVersion: v1
kind: Secret
metadata:
  name: inventory-service-secrets
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=       # base64 -- NOT encryption; restrict RBAC access instead
  JWT_SECRET: c3VwZXJTZWNyZXRLZXk=
```

> ⚠️ **Golden Rule:** Base64 in a Kubernetes Secret is **encoding, not encryption** — anyone with read access to that Secret object in the cluster can trivially decode it. Production clusters layer real protection on top: encryption at rest for the Kubernetes etcd store, RBAC rules restricting exactly which service accounts can read which Secrets, and often an external secrets manager (HashiCorp Vault, AWS Secrets Manager) injecting values at runtime rather than storing them as native Kubernetes Secrets at all.

This is a foundational look at Kubernetes specifically because it's genuinely a large enough topic to be its own dedicated deep-dive — Ingress controllers, Horizontal Pod Autoscalers, StatefulSets for the databases from the Foundational guide's Chapter 10, and service meshes (Istio/Linkerd) sitting on top of everything covered in this chapter are Veteran-tier territory in this series.

---

<a id="ch12"></a>
## Chapter 12 — CI/CD Pipelines for Microservices

Every pattern in this guide so far assumes code eventually makes it into a running container in a cluster. **CI/CD** (Continuous Integration / Continuous Delivery or Deployment) is the automated pipeline that gets it there safely and repeatedly, and it looks meaningfully different for microservices than for a single monolith, precisely because of the property established back in Chapter 1 of the Foundational guide: independent deployability.

In a monolith, one CI/CD pipeline builds, tests, and deploys the entire application together — there is exactly one thing to build. In microservices, each service should have **its own independent pipeline**, triggered only by changes to its own repository (or its own directory, in a monorepo), so that a change to `inventory-service` doesn't force a rebuild-and-redeploy of `payment-service`, which had no code changes at all. This is what actually delivers on the "independent deployment" promise from Chapter 1 of the Foundational guide — if every service still gets rebuilt and redeployed together on every change, you've built microservices with a monolith's release process.

```
                git push to inventory-service repo
                              │
                              ▼
              ┌─────────────────────────────┐
              │  CI: Build & Test              │
              │  1. mvn test (unit tests)       │
              │  2. Spring Cloud Contract tests │  ← Chapter 9 — provider-side contract check
              │  3. mvn package                 │
              │  4. docker build                │
              │  5. docker push (image registry) │
              └─────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │  CD: Deploy                     │
              │  1. kubectl apply (or Helm)      │
              │  2. Rolling update on the         │
              │     inventory-service Deployment  │
              │  3. Readiness probes gate traffic │
              │     to new Pods (Chapter 11)      │
              └─────────────────────────────┘
                (only inventory-service redeploys — every other
                 service's Pods are completely untouched)
```

```yaml
# .github/workflows/inventory-service-ci-cd.yml — GitHub Actions example
name: inventory-service CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'inventory-service/**'   # only triggers when THIS service's code changes

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }

      - name: Run unit and contract tests
        run: ./mvnw test
        working-directory: ./inventory-service

      - name: Build Docker image
        run: docker build -t smitroy/inventory-service:${{ github.sha }} ./inventory-service

      - name: Push image
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u smitroy --password-stdin
          docker push smitroy/inventory-service:${{ github.sha }}

  deploy:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/inventory-service \
            inventory-service=smitroy/inventory-service:${{ github.sha }} \
            --namespace=production
          # Kubernetes performs a rolling update automatically — old Pods stay
          # serving traffic until new Pods pass their readiness probe (Chapter 11)
```

A **rolling update** — Kubernetes' default deployment strategy — is what actually delivers zero-downtime deploys: new Pods running the updated image are started gradually while old Pods keep serving traffic, and old Pods are only terminated once their replacements pass the readiness probe from Chapter 11. If the new version is broken and fails its readiness check, Kubernetes stops the rollout automatically, and the old, working Pods keep serving all traffic — the failure is contained rather than taking the whole service down.

> 💡 **Interview framing:** if asked how CI/CD differs for microservices vs a monolith, the answer that shows real understanding is naming per-service independent pipelines, path-based triggers so unrelated services don't rebuild unnecessarily, and rolling deployments with readiness gating — not just "each service has its own pipeline," which states the conclusion without the mechanism.

---

<a id="ch13"></a>
## Chapter 13 — Database Transactions Across Services: The Saga Pattern

The Foundational guide's Chapter 10 named this problem honestly without solving it: database-per-service means you lose the ACID transaction guarantee across services — "create the order AND reserve the stock" can no longer be one atomic database transaction, because they're now two separate databases owned by two separate services. If the order is created but the stock reservation fails afterward, you have an inconsistent system state. The **Saga pattern** is the standard answer to this — not by faking a distributed transaction, but by replacing it with a sequence of local transactions, each with a defined **compensating action** to undo it if a later step in the sequence fails.

The mental model: instead of one all-or-nothing transaction spanning services, a saga is a chain — `order-service` commits its own local transaction (create the order as PENDING), then `inventory-service` commits its own local transaction (reserve stock), then `payment-service` commits its own local transaction (charge the customer). If any step fails, the saga doesn't roll back a distributed transaction (that's not possible) — it runs **compensating transactions** for every step that already succeeded, undoing them one by one, in reverse.

```
Happy path:
  order-service: create order (PENDING)  ──▶  SUCCESS
  inventory-service: reserve stock        ──▶  SUCCESS
  payment-service: charge customer        ──▶  SUCCESS
  order-service: mark order CONFIRMED

Failure path — payment fails after stock was already reserved:
  order-service: create order (PENDING)  ──▶  SUCCESS
  inventory-service: reserve stock        ──▶  SUCCESS
  payment-service: charge customer        ──▶  FAILURE
  inventory-service: RELEASE reserved stock   ← compensating transaction
  order-service: mark order CANCELLED         ← compensating transaction
```

![Saga pattern — choreography-based event flow with compensating transactions on failure](/images/blogs/internals/saga-pattern-choreography-flow.png)

There are two ways to coordinate a saga. **Choreography** has no central coordinator — each service listens for the previous service's event and reacts, publishing its own event (or a compensating event) in turn, using the async messaging infrastructure from Chapter 5. **Orchestration** introduces a dedicated coordinator service that explicitly calls each step and explicitly decides what compensating action to trigger on failure, rather than leaving that decision implicitly scattered across every service's event listeners.

```java
// Choreography — order-service reacts to events, no central coordinator
@Component
@RequiredArgsConstructor
public class OrderSagaEventListener {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "stock-reservation-failed", groupId = "order-service")
    public void handleStockReservationFailed(StockReservationFailedEvent event) {
        // Compensating transaction — a LOCAL transaction in order-service's own database,
        // undoing the effect of the order having been created in the first place
        Order order = orderRepository.findById(event.orderId()).orElseThrow();
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        kafkaTemplate.send("order-cancelled", new OrderCancelledEvent(order.getId()));
    }

    @KafkaListener(topics = "payment-failed", groupId = "order-service")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        Order order = orderRepository.findById(event.orderId()).orElseThrow();
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Trigger inventory-service's own compensating transaction via an event —
        // order-service never calls inventory-service directly here
        kafkaTemplate.send("release-stock", new ReleaseStockEvent(event.orderId()));
    }
}
```

```java
// Orchestration — a dedicated OrderSagaOrchestrator explicitly drives every step
@Service
@RequiredArgsConstructor
public class OrderSagaOrchestrator {

    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;

    public void executeOrderSaga(CreateOrderRequest request) {
        Order order = createPendingOrder(request);

        try {
            inventoryClient.reserveStock(request.productId(), request.quantity());
            paymentClient.chargeCustomer(request.customerId(), request.total());
            order.setStatus(OrderStatus.CONFIRMED);
        } catch (PaymentFailedException e) {
            // Orchestrator explicitly knows and controls the compensating sequence
            inventoryClient.releaseStock(request.productId(), request.quantity());
            order.setStatus(OrderStatus.CANCELLED);
        } catch (StockReservationFailedException e) {
            order.setStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
    }
}
```

Choreography scales better with more services and avoids a single coordinator becoming a bottleneck or single point of failure, but the overall saga flow becomes implicit and harder to trace — there's no one place in the code that shows the whole sequence. Orchestration makes the whole flow explicit and easy to read in one place, at the cost of that orchestrator needing to know about every participating service, which reintroduces some of the coupling event-driven design (Chapter 6) was trying to remove.

> ⚠️ **Golden Rule:** every step in a saga must be designed with its compensating action in mind *before* it's implemented — "how do I undo this" is not an afterthought bolted on when something fails in production, it's a required part of the design for every single step. A step with no realistic compensating action (e.g., an email that's already been sent and can't be unsent) needs to be placed carefully in the sequence — typically last, after every other step that *can* be compensated has already succeeded.

---

<a id="ch14"></a>
## Chapter 14 — Rate Limiting at the Gateway

Chapter 2's circuit breakers protect a service from a dependency that's already failing. **Rate limiting** protects a service from a dependency (or a client) that's sending it more traffic than it can handle in the first place — whether that's a misbehaving client hammering an endpoint in a retry loop, a genuine traffic spike, or a deliberate abuse pattern. The Foundational guide's API Gateway (Chapter 6) is the natural place to enforce this, because it's the single point every external request already passes through — enforcing limits there protects every downstream service without duplicating the logic in each one.

The most common algorithm, and the one Spring Cloud Gateway ships with, is the **token bucket**: each client (or API key, or IP) has a bucket that holds a maximum number of tokens and refills at a steady rate; every request consumes one token, and a request arriving to an empty bucket is rejected (typically with `HTTP 429 Too Many Requests`) until the bucket refills. This allows short bursts up to the bucket's capacity while still enforcing a steady average rate over time — a more forgiving and realistic model than a strict fixed window that resets abruptly.

```yaml
# api-gateway application.yml — Redis-backed rate limiting (Spring Cloud Gateway)
spring:
  cloud:
    gateway:
      routes:
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/api/v1/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10   # tokens added per second
                redis-rate-limiter.burstCapacity: 20    # bucket size — allows short bursts
                redis-rate-limiter.requestedTokens: 1   # tokens consumed per request
                key-resolver: "#{@userKeyResolver}"     # rate limit PER USER, not globally
```

```java
// The key resolver decides what identifies "one client" for rate-limiting purposes —
// per-user is usually more correct than per-IP, since many users can share one IP
// behind NAT, and one user can rotate across many IPs
@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest().getHeaders().getFirst("X-User-Id") != null
                ? exchange.getRequest().getHeaders().getFirst("X-User-Id")
                : "anonymous"
        );
    }
}
```

Spring Cloud Gateway's built-in rate limiter is **Redis-backed** deliberately — a gateway typically runs as multiple replicas behind a load balancer (Chapter 1's client-side balancing pattern applies here too, from the caller's perspective), and an in-memory token bucket local to one gateway instance would let a client bypass the limit simply by getting routed to a different gateway replica. A shared Redis store means every gateway instance enforces the *same* bucket state for a given client, regardless of which instance actually handles a given request.

> 💡 **Pro tip:** rate limit at multiple granularities deliberately, not just "one global limit." A per-user limit protects against one abusive user; a per-IP limit catches abuse that rotates user accounts; a per-route limit (a stricter limit on an expensive search endpoint than on a cheap health check) protects your most resource-intensive endpoints specifically, rather than applying the same budget uniformly across wildly different-cost operations.

---

<a id="ch15"></a>
## Key Takeaways

**Resilience**
- Client-side load balancing (Spring Cloud LoadBalancer) picks an instance locally from the Eureka-provided list — no extra network hop, but it means every caller's view of "healthy instances" can briefly lag reality
- Resilience4j's circuit breaker fails fast once a dependency is clearly struggling (CLOSED → OPEN → HALF_OPEN), preventing cascading failures; pair it deliberately with timeouts, retries with backoff, and a sensible fallback — not just one of these in isolation

**Observability**
- Distributed tracing (Micrometer Tracing + Zipkin) attaches one trace ID across every service a request touches, with spans showing where time was actually spent
- Centralized logging (ELK) only becomes genuinely useful with structured JSON logs carrying the same trace/span IDs — that combination is what turns "search one trace ID" into "see every relevant log line across every service"

**Decoupling in Time**
- Async messaging (Kafka for event streams, RabbitMQ for task queues) removes the availability coupling that synchronous calls create — the publisher doesn't need the consumer to be up right now
- Event-driven architecture's real benefit is that new consumers can be added with zero changes to the publisher — but it trades away immediate consistency and single-place-to-read-the-flow debuggability, which tracing and logging exist to compensate for

**Contracts That Hold**
- Distinguish breaking from non-breaking API changes deliberately, and run old and new versions in parallel during migration rather than cutting over immediately
- Gateway-level JWT validation, propagated as trusted internal headers, avoids re-validating tokens on every internal hop — but only holds if internal services are genuinely unreachable except through the gateway
- Spring Cloud Contract catches accidental breaking changes in each team's own CI, before a change ever reaches a shared, flaky end-to-end environment

**Running at Scale**
- Kubernetes Deployments, Services, ConfigMaps, and Secrets are the platform-native versions of concepts already built manually in the Foundational guide — health checks, service discovery, and externalized config, now enforced by the orchestrator itself
- Per-service CI/CD pipelines, triggered only by that service's own changes, are what actually deliver on independent deployability — and rolling updates gated by readiness probes are what make deploys zero-downtime by default

**Consistency**
- The Saga pattern replaces one distributed transaction with a chain of local transactions, each with a required compensating action — choreography avoids a central coordinator but is harder to trace; orchestration is easier to read but reintroduces coupling
- Rate limiting at the gateway (token bucket, Redis-backed for multi-instance consistency) protects every downstream service from excess traffic in one place, applied at multiple granularities rather than one blunt global limit

---

*The phone lines between buildings from the Foundational guide are still there — but now every call has a circuit breaker that hangs up gracefully instead of leaving someone on hold forever, a shared bulletin board (Kafka) for announcements nobody has to call in for individually, a security desk that checks ID once at the main entrance instead of at every internal door, and a compensation policy for when a multi-department process falls apart halfway through. It's not that failure stopped happening — it's that the system now expects it, and survives it, on purpose.*