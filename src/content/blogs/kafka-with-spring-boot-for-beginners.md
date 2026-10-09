## Kafka Without the Fear — Your First Event Stream With Spring Boot

> *Imagine a huge notice board in the middle of your office. Anyone can pin a note on it, and anyone can read the notes — at their own speed, as many times as they like. Nobody has to walk to anyone's desk. That notice board is Kafka. This guide explains it from scratch, in plain language, and then shows how little Spring Boot code it takes to use it.*

Most beginners hear "Kafka" and imagine something enormous, scary, and only meant for companies like Netflix or Uber. The truth is simpler: Kafka is just a **very reliable, very fast way for programs to pass messages to each other**. Once the handful of core ideas click, the Spring Boot part is almost boring — and that is the goal of this guide.

---

## Chapter 1 — The Problem Kafka Solves

Picture an online shop. When a customer places an order, several things must happen: send a confirmation email, update stock, notify the warehouse, record analytics. The "obvious" way is for `order-service` to call each of those services one by one, using HTTP.

This works, until it doesn't:

- If the email service is down, does the order fail? It shouldn't — but with direct calls, it might.
- Every new feature ("also send an SMS") means editing `order-service` again.
- `order-service` must **wait** for every call to finish before replying to the customer.

It is like a manager walking desk to desk to tell five people the same news, and standing there until each one acknowledges it.

**Kafka's idea:** instead of telling everyone directly, the manager pins *one note* on a shared notice board — "Order #101 was placed" — and walks away. Everyone who cares reads the note when they are ready. The manager never needs to know who is reading, or whether they are busy right now.

This style of communication — "I'll leave a message, you pick it up later" — is called **asynchronous messaging**, and Kafka is one of the most popular tools to do it.

---

## Chapter 2 — Kafka's Building Blocks, One Analogy at a Time

Kafka has only a few vocabulary words. Learn these and everything else follows.

### Event (or Message)

A single note on the notice board: *"Order #101 placed by Asha for ₹1,499."* It is a small piece of data describing **something that happened**. People use "event" and "message" interchangeably.

### Producer

Whoever **writes** a note. In our shop, `order-service` is a producer.

### Consumer

Whoever **reads** notes. `email-service` and `analytics-service` are consumers.

### Topic

A **named section** of the notice board — "Orders", "Payments", "Shipping". Producers write to a topic; consumers subscribe to the topics they care about. Topics keep unrelated messages from getting mixed together.

### Broker

The **notice board itself** — an actual Kafka server that stores messages and hands them to consumers. A real setup uses several brokers working together (a **cluster**) so the system survives if one machine dies.

### The Log, and the Offset

Here is the most important thing to understand, and where Kafka differs from a normal queue:

> Kafka does **not** delete a message when someone reads it. Messages are kept in order, like entries in a diary, for a set period of time (for example, 7 days).

Each entry in the diary has a page number called an **offset** (0, 1, 2, 3…). Each consumer keeps its own **bookmark** — "I have read up to page 5". Because the bookmarks are separate, the email service can be on page 5 while analytics is on page 2, and a brand-new service can start from page 0 and read the entire history.

Try it yourself below. Send a few orders, then let each consumer read at its own pace.

{{visual:topic-log}}

> 💡 **Pro tip:** this "keep the diary, let everyone have a bookmark" design is why Kafka is called an **event log** rather than just a queue. A queue forgets a message once it is delivered; Kafka remembers.

### Partition

One diary can become too busy for one person to write in and one person to read. So Kafka splits a topic into **partitions** — think of **several checkout lanes in a supermarket** instead of one. More lanes means more customers served at the same time.

Each partition is its own independent, ordered diary with its own offsets. This is how Kafka handles huge volumes: the work is spread across lanes.

### Key

When a message is written, it can carry a **key** — for example, the customer's ID. Kafka uses the key to decide the lane: **the same key always goes to the same partition**. This matters because order is only guaranteed *inside* one partition. If all of Asha's events share a key, they stay in the right order: "order placed" always comes before "order cancelled".

Messages with no key are simply spread across partitions in turn.

{{visual:partitions-keys}}

### Consumer Group

Suppose `email-service` becomes so popular that one copy cannot keep up, so you run three copies. You do *not* want each copy to send the same email! Kafka solves this with a **consumer group**: copies sharing the same group name **split the partitions among themselves**, so every message is handled by exactly one copy in that group.

Think of a team of cashiers: each cashier takes a lane, and no customer is served twice. A *different* group (say, `analytics-service`) gets its own full copy of every message, completely independent of the email team.

One rule to remember: **within a group, a partition is read by only one consumer at a time.** So with 3 partitions, a 4th consumer has no lane and sits idle.

{{visual:consumer-groups}}

### Replication (just the idea)

Kafka can store copies of each partition on different brokers. If one broker dies, another copy takes over. You will not configure this as a beginner, but it is why Kafka is trusted with important data.

---

## Chapter 3 — Where Spring Boot Fits In

Kafka itself speaks its own network protocol and has a Java client library. That library works, but it is verbose — you manage connections, loops, serializers, and offsets yourself.

**Spring for Apache Kafka** (`spring-kafka`) wraps all of that so you only write the business logic. Two names cover 90% of what you need:

| Kafka idea | Spring Boot tool | What it does |
| --- | --- | --- |
| Producer | `KafkaTemplate` | A ready-made object with a `send()` method |
| Consumer | `@KafkaListener` | An annotation that turns a method into a message receiver |
| Connection settings | `application.yml` | Broker address, group name, serializers |

Spring Boot's auto-configuration builds the connections for you from your YAML — the same "convention over configuration" idea you already know from other starters.

---

## Chapter 4 — Running Kafka on Your Laptop

You need a broker to talk to. The easiest way is Docker. This single-node setup is enough for learning:

```yaml
# docker-compose.yml
services:
  kafka:
    image: apache/kafka:3.8.0
    ports:
      - "9092:9092"
```

Run `docker compose up -d` and Kafka is listening on `localhost:9092`. By default, a topic is created automatically the first time something is written to it, which is convenient for learning.

---

## Chapter 5 — Your First Producer

Add one dependency to your Spring Boot project:

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

Tell Spring where Kafka lives, and that we will send plain text for now:

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
```

A **serializer** simply converts your Java object into bytes for the trip — Kafka only stores bytes, so something has to do this conversion.

Now the producer itself:

```java
@RestController
@RequiredArgsConstructor
public class OrderController {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @PostMapping("/orders/{customerId}")
    public String placeOrder(@PathVariable String customerId) {
        // topic name, key, message
        kafkaTemplate.send("orders", customerId, "Order placed by " + customerId);
        return "Order sent!";
    }
}
```

That one line is the whole producer. Notice the three arguments: the **topic** (`orders`), the **key** (`customerId`, so one customer's events stay in order), and the **message**.

---

## Chapter 6 — Your First Consumer

In another service (or the same app, for a first test), add the matching settings:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: email-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
```

A **deserializer** is the reverse of a serializer: bytes back into a Java `String`. Two settings here deserve plain-English explanations:

- **`group-id`** — the name of the consumer group from Chapter 2. Kafka remembers each group's bookmark under this name.
- **`auto-offset-reset: earliest`** — "if my group has no bookmark yet, start from the very first page of the diary." The alternative, `latest`, means "only show me messages that arrive from now on."

And the consumer:

```java
@Component
public class EmailListener {

    @KafkaListener(topics = "orders", groupId = "email-service")
    public void onOrder(String message) {
        System.out.println("Sending email for: " + message);
    }
}
```

That is the entire consumer. Spring starts a background loop that polls Kafka, calls your method for every message, and updates the bookmark for you. You never write that loop.

> ⚠️ **Golden Rule:** the producer's serializer and the consumer's deserializer must match. If one side writes JSON and the other expects plain text, the consumer fails on every message. This is the single most common beginner error.

---

## Chapter 7 — What Happens When You Run It

Follow one request from start to finish:

1. You call `POST /orders/asha`.
2. `KafkaTemplate` converts the message to bytes and sends it to the `orders` topic.
3. Kafka uses the key `asha` to pick a partition, appends the message at the next offset, and stores it on disk.
4. `EmailListener`, polling in the background, receives the message and prints it.
5. Kafka moves the `email-service` bookmark forward by one.

Notice what did **not** happen: `OrderController` never knew an email listener exists. Add a second listener with a different `groupId` and it will receive the same messages, with zero changes to the producer. That is the decoupling Kafka is famous for.

If you stop the consumer, send three more orders, and restart it, it will pick up exactly where its bookmark was left. Nothing is lost.

---

## Chapter 8 — Beginner Mistakes to Avoid

**Expecting exactly-once behavior without thinking.** By default, a consumer can occasionally see the same message twice (for example, if it crashes after processing but before saving its bookmark). Write consumers so that handling a message twice is harmless — this property is called being **idempotent**. Sending the same welcome email twice is annoying; charging a card twice is a disaster.

**Assuming global ordering.** Order is guaranteed only within one partition. If order matters for a group of related events, give them the same key.

**Using Kafka for things that need an instant answer.** If the caller needs the result *right now* ("is this item in stock?"), a normal HTTP call is still the right tool. Kafka is for "tell the world this happened."

**Forgetting that messages can be replayed.** Because Kafka keeps messages, a new consumer group with `earliest` will process the whole history. That is a feature — until you forget about it and email every old customer again.

**Running more consumers than partitions.** Extra consumers in a group sit idle. Scale partitions and consumers together.

> 💡 **Pro tip:** while learning, install a free UI like Kafka UI or use the `kafka-console-consumer` command-line tool to watch messages arrive. Seeing the diary fill up makes every concept in this guide concrete.

---

## Key Takeaways

**The Concepts**

- Kafka is a shared notice board for programs: producers write events, consumers read them later, and neither needs to know the other exists
- A **topic** is a named section; a **broker** is the Kafka server; messages are kept as an ordered log, not deleted after reading
- Every message has an **offset** (page number), and every consumer group keeps its own **bookmark**

**Scaling**

- **Partitions** are parallel lanes inside a topic; more lanes means more throughput
- A **key** sends all related messages to the same partition, preserving their order
- A **consumer group** splits partitions among copies of one service, so each message is handled once per group — and extra consumers beyond the partition count sit idle

**Spring Boot**

- `spring-kafka` plus a few YAML lines replaces pages of boilerplate
- `KafkaTemplate.send(topic, key, message)` is the producer; `@KafkaListener` is the consumer
- Serializers and deserializers must match on both sides, and consumers should tolerate seeing a message twice

---

*A phone call needs both people to be there at the same time. A notice board does not. Kafka is that notice board — and with Spring Boot, pinning a note and reading one each take a single line of code.*