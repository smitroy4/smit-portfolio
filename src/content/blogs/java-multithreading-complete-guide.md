## The Complete Guide to Multithreading in Java — From Threads to Virtual Threads

> *You've written `new Thread(() -> doWork()).start()`. Maybe you've even used `synchronized` when something broke. But ask yourself: what's the actual difference between a race condition and a deadlock? Why does `volatile` not make `count++` thread-safe? What does "happens-before" actually mean? And what changed with virtual threads that made half of this advice partially outdated?*

If you're nodding along uncertainly, you're not alone — multithreading is the topic most Java developers learn just enough of to make code "work," without learning enough to make it **correct**. And concurrency bugs don't show up in `localhost` testing. They show up in production, at 2 AM, under load, and they're nearly impossible to reproduce.

Let's build the real mental model — from the ground up.

---

## Table of Contents

- [Part 1 — Why Concurrency Exists & The Core Problem](#part-1)
- [Part 2 — Creating and Managing Threads](#part-2)
- [Part 3 — The Java Memory Model & `volatile`](#part-3)
- [Part 4 — Synchronization: `synchronized`, Locks & Monitors](#part-4)
- [Part 5 — The Classic Concurrency Bugs](#part-5)
- [Part 6 — `java.util.concurrent`: Building Blocks](#part-6)
- [Part 7 — Thread Pools & `ExecutorService`](#part-7)
- [Part 8 — `CompletableFuture` & Async Programming](#part-8)
- [Part 9 — Concurrent Collections](#part-9)
- [Part 10 — Virtual Threads (Project Loom, Java 21+)](#part-10)
- [Quick Reference & Key Takeaways](#reference)

---

<a id="part-1"></a>
## Part 1 — Why Concurrency Exists & The Core Problem

A single CPU core can only do one thing at a time. Multithreading doesn't make a single task faster — it lets your program **do multiple things concurrently**, so a slow I/O operation (database call, network request) doesn't block everything else.

```java
// Without threads: 3 API calls = sum of all 3 wait times
fetchUser();       // 200ms
fetchOrders();     // 300ms
fetchPayments();   // 250ms
// Total: 750ms, sequential

// With threads: all 3 happen concurrently
// Total: ~300ms (the slowest one)
```

But concurrency introduces a problem that single-threaded code never has: **multiple threads can read and write the same memory at the same time**, and the order of operations becomes unpredictable. This single fact is the root cause of almost every concurrency bug you'll ever debug.

<details>
<summary><strong>Concurrency vs Parallelism — the distinction interviewers actually check for</strong></summary>

- **Concurrency** = dealing with multiple tasks *in progress* at once (can be on a single core, via context switching)
- **Parallelism** = multiple tasks *executing simultaneously* (requires multiple cores)

A single-core machine can be concurrent but never truly parallel. A quad-core machine running 4 threads can be both. Most "multithreading" discussions are really about concurrency — parallelism is a subset that depends on hardware.

</details>

---

<a id="part-2"></a>
## Part 2 — Creating and Managing Threads

### The Three Ways to Create a Thread

```java
// 1. Extending Thread (rarely recommended — wastes single inheritance)
class MyThread extends Thread {
    public void run() {
        System.out.println("Running in: " + Thread.currentThread().getName());
    }
}
new MyThread().start();

// 2. Implementing Runnable (preferred — decouples task from execution)
Runnable task = () -> System.out.println("Running in: " + Thread.currentThread().getName());
new Thread(task).start();

// 3. Implementing Callable (when you need a RETURN VALUE or checked exceptions)
Callable<Integer> callableTask = () -> {
    Thread.sleep(1000);
    return 42;
};
// Callable requires an ExecutorService to actually run (see Part 7)
```

> ⚠️ **Golden Rule:** Always call `.start()`, never `.run()` directly. Calling `.run()` executes the code on the **current thread** — no new thread is created at all. This is a classic interview trap.

### The Thread Lifecycle

```
NEW → RUNNABLE → (BLOCKED / WAITING / TIMED_WAITING) → TERMINATED
```

| State | Meaning |
|---|---|
| `NEW` | Thread object created, `.start()` not yet called |
| `RUNNABLE` | Eligible to run (may or may not actually be executing — depends on OS scheduler) |
| `BLOCKED` | Waiting to acquire a lock held by another thread |
| `WAITING` | Waiting indefinitely for another thread's signal (`wait()`, `join()` with no timeout) |
| `TIMED_WAITING` | Waiting with a timeout (`sleep()`, `wait(ms)`, `join(ms)`) |
| `TERMINATED` | `run()` has completed or thrown an uncaught exception |

```java
Thread t = new Thread(() -> { /* work */ });
t.start();
t.join();        // Caller thread blocks until `t` finishes — crucial for coordination
t.interrupt();   // Requests cancellation — doesn't force-stop, just sets a flag
```

<details>
<summary><strong>Why <code>Thread.stop()</code> is deprecated and what to use instead</strong></summary>

`Thread.stop()` forcibly terminates a thread mid-operation — which can leave shared objects in a **corrupted, half-updated state** (e.g., a `Thread` stopped mid-way through updating a linked list leaves dangling references). It's deprecated for this exact reason.

The correct pattern is **cooperative cancellation** using interrupt flags:

```java
class Worker implements Runnable {
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            // do work
        }
        System.out.println("Cleanly stopped");
    }
}

Thread t = new Thread(new Worker());
t.start();
t.interrupt(); // Sets the flag — worker checks it and exits gracefully
```

If the thread is blocked in `sleep()` or `wait()` when interrupted, an `InterruptedException` is thrown immediately instead of waiting for the flag check.

</details>

---

<a id="part-3"></a>
## Part 3 — The Java Memory Model & `volatile`

This is the part most developers skip — and it's the part that explains *why* the other rules exist.

### The Core Problem: CPU Caches

Modern CPUs don't read/write directly to main memory every time — each core has its own cache. Without explicit rules, **Thread A can update a variable, and Thread B might never see the new value**, because it's reading a stale, cached copy.

```java
class SharedFlag {
    private boolean running = true; // NOT volatile — bug waiting to happen

    void stop() {
        running = false; // Thread A writes this
    }

    void doWork() {
        while (running) { // Thread B may NEVER see the updated value!
            // This can loop forever even after stop() is called
        }
    }
}
```

### `volatile` — Visibility, Not Atomicity

```java
private volatile boolean running = true;
```

`volatile` guarantees:
1. **Visibility** — writes are immediately flushed to main memory; reads always fetch the latest value
2. **Ordering** — prevents certain compiler/CPU reordering optimizations around the variable (via the *happens-before* relationship)

`volatile` does **NOT** guarantee:
- **Atomicity** of compound operations

```java
private volatile int count = 0;

void increment() {
    count++; // STILL NOT THREAD-SAFE, even with volatile!
}
```

> ⚠️ **Why `count++` isn't atomic:** it's actually three operations — read `count`, add 1, write back. If two threads interleave between the read and write, one increment can be lost entirely. `volatile` only guarantees each thread sees the latest value *at the moment it reads* — it does nothing to protect the read-modify-write sequence as a whole.

<details>
<summary><strong>"Happens-Before" — the formal rule behind all of this</strong></summary>

The Java Memory Model (JMM) defines **happens-before** as a partial ordering guarantee. If action A happens-before action B, then A's effects (including memory writes) are guaranteed visible to B.

Key happens-before relationships:
- A `volatile` write happens-before every subsequent `volatile` read of the same variable
- Releasing a lock (`synchronized` block exit) happens-before acquiring the same lock
- `Thread.start()` happens-before any action in the started thread
- All actions in a thread happen-before `Thread.join()` returns in the joining thread

Without one of these established relationships, the JVM and CPU are **free to reorder your code** for optimization — and there is no guarantee one thread will ever see another thread's writes. This is why ad-hoc "I think this is probably fine" concurrent code is so dangerous: without an explicit happens-before edge, there's no guarantee at all, even if it "works" in testing.

</details>

---

<a id="part-4"></a>
## Part 4 — Synchronization: `synchronized`, Locks & Monitors

### The `synchronized` Keyword

Every Java object has an intrinsic lock (monitor). `synchronized` ensures only one thread can hold that lock at a time — giving you both **mutual exclusion** and a **happens-before** edge (solving the visibility problem too).

```java
class Counter {
    private int count = 0;

    // Method-level — locks on 'this'
    public synchronized void increment() {
        count++; // Now genuinely thread-safe
    }

    // Block-level — more granular, locks on a specific object
    public void incrementBlock() {
        synchronized (this) {
            count++;
        }
    }
}
```

```java
// Static synchronized — locks on the Class object, not an instance
public static synchronized void globalCounterIncrement() {
    globalCount++;
}
```

> ⚠️ **Golden Rule:** Never synchronize on a mutable or reusable object like a `String` literal or a boxed `Integer` — string interning and integer caching mean you might accidentally share a lock across unrelated parts of your code. Use a private, dedicated `final Object lock = new Object();` for block-level synchronization.

### `ReentrantLock` — When `synchronized` Isn't Enough

```java
private final ReentrantLock lock = new ReentrantLock();

public void increment() {
    lock.lock();
    try {
        count++;
    } finally {
        lock.unlock(); // MUST be in finally — synchronized does this automatically, locks don't
    }
}
```

| Feature | `synchronized` | `ReentrantLock` |
|---|---|---|
| Auto-release on exception | Yes | No — manual `finally` required |
| Try to acquire with timeout | No | Yes — `tryLock(timeout)` |
| Interruptible lock acquisition | No | Yes — `lockInterruptibly()` |
| Fairness policy (FIFO ordering) | No | Yes — `new ReentrantLock(true)` |
| Multiple condition variables | No (one implicit monitor) | Yes — `lock.newCondition()` |
| Performance | Slightly better in low-contention (JIT optimized) | Better under high contention |

### `ReadWriteLock` — Optimizing for Read-Heavy Workloads

```java
private final ReadWriteLock rwLock = new ReentrantReadWriteLock();

public String read() {
    rwLock.readLock().lock();
    try {
        return data; // Multiple readers can hold this simultaneously
    } finally {
        rwLock.readLock().unlock();
    }
}

public void write(String value) {
    rwLock.writeLock().lock(); // Exclusive — blocks all readers and writers
    try {
        data = value;
    } finally {
        rwLock.writeLock().unlock();
    }
}
```

This matters a lot for caches or configuration objects that are read constantly but rarely updated — `synchronized` would force reads to queue up unnecessarily.

---

<a id="part-5"></a>
## Part 5 — The Classic Concurrency Bugs

<details open>
<summary><strong>🐛 Race Condition</strong></summary>

Two or more threads access shared data concurrently, and the final outcome depends on the unpredictable timing of execution.

```java
// Classic example: lost update
class BankAccount {
    private int balance = 100;

    void withdraw(int amount) {
        if (balance >= amount) {       // Thread A and B both check: balance=100, amount=80 → passes
            balance -= amount;          // Both proceed to withdraw — balance goes negative!
        }
    }
}
```

**Fix:** synchronize the check-then-act sequence as one atomic unit.
```java
synchronized void withdraw(int amount) {
    if (balance >= amount) {
        balance -= amount;
    }
}
```

</details>

<details>
<summary><strong>🐛 Deadlock</strong></summary>

Two or more threads are blocked forever, each waiting for a lock the other holds.

```java
// Thread 1: locks A, then tries to lock B
synchronized (lockA) {
    synchronized (lockB) { /* ... */ }
}

// Thread 2: locks B, then tries to lock A — DEADLOCK if timed right
synchronized (lockB) {
    synchronized (lockA) { /* ... */ }
}
```

**Fix:** always acquire locks in a **consistent global order** across the entire codebase.
```java
// Both threads now always lock A before B — no circular wait possible
synchronized (lockA) {
    synchronized (lockB) { /* ... */ }
}
```

</details>

<details>
<summary><strong>🐛 Livelock</strong></summary>

Threads aren't blocked, but they keep changing state in response to each other without making progress — like two people stepping side to side trying to pass each other in a hallway, forever.

```java
// Both threads keep "politely" backing off and retrying at the same time,
// perpetually colliding again
while (!tryAcquireBothLocks()) {
    releaseAnyHeldLocks();
    randomBackoff(); // Without randomness, threads can stay perfectly in sync forever
}
```

**Fix:** introduce **randomized backoff** so retry timing desynchronizes naturally.

</details>

<details>
<summary><strong>🐛 Starvation</strong></summary>

A thread is perpetually denied access to a resource because other (often higher-priority) threads keep getting scheduled first.

```java
// If thread priorities are abused, or a non-fair lock keeps favoring
// recently-active threads, some thread can wait indefinitely
ReentrantLock lock = new ReentrantLock(); // unfair by default — faster but risk of starvation
```

**Fix:** use a fair lock (`new ReentrantLock(true)`) when starvation risk is real — though it does cost throughput.

</details>

---

<a id="part-6"></a>
## Part 6 — `java.util.concurrent`: Building Blocks

The `java.util.concurrent` package (introduced in Java 5, by Doug Lea) exists because hand-rolled `synchronized`/`wait`/`notify` code is extremely error-prone. Use these instead of reinventing them.

### Atomic Variables — Lock-Free Thread Safety

```java
private AtomicInteger count = new AtomicInteger(0);

void increment() {
    count.incrementAndGet(); // Atomic — no synchronized needed, no lost updates
}

// Common atomic types
AtomicInteger, AtomicLong, AtomicBoolean, AtomicReference<T>
```

<details>
<summary><strong>How atomics achieve thread safety WITHOUT locks</strong></summary>

Atomic classes use **Compare-And-Swap (CAS)**, a hardware-level CPU instruction. The logic is:

```
1. Read the current value
2. Compute the new value
3. Atomically: "if the value is STILL what I read in step 1, update it. Otherwise, retry from step 1."
```

This is **optimistic concurrency** — instead of blocking other threads (pessimistic locking), it assumes no conflict will happen, and just retries on the rare occasion it does. Under low-to-moderate contention, this is significantly faster than `synchronized` because there's no thread parking/context-switching overhead.

</details>

### `CountDownLatch` — Wait for N Events to Complete

```java
CountDownLatch latch = new CountDownLatch(3);

// 3 worker threads each call latch.countDown() when done
Runnable worker = () -> {
    doWork();
    latch.countDown();
};

// Main thread waits for all 3 to finish
latch.await();
System.out.println("All workers finished");
```

A `CountDownLatch` is **single-use** — once it hits zero, it can't be reset.

### `CyclicBarrier` — Synchronize Threads at a Common Point

```java
CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("All threads reached the barrier!"));

Runnable task = () -> {
    doPhase1Work();
    barrier.await(); // Waits until all 3 threads arrive here, then all proceed together
    doPhase2Work();
};
```

Unlike `CountDownLatch`, a `CyclicBarrier` **resets automatically** and can be reused across multiple phases — useful for simulations or multi-round parallel algorithms.

### `Semaphore` — Limit Concurrent Access

```java
// Allow only 3 threads to access a resource pool at once
Semaphore semaphore = new Semaphore(3);

void accessResource() throws InterruptedException {
    semaphore.acquire();
    try {
        useExpensiveResource();
    } finally {
        semaphore.release();
    }
}
```

Great for connection pools, rate limiting, or capping concurrent access to a finite resource.

---

<a id="part-7"></a>
## Part 7 — Thread Pools & `ExecutorService`

Creating a raw `new Thread()` for every task is expensive (thread creation/destruction has real OS overhead) and gives you zero control over concurrency limits. Thread pools solve this.

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

executor.submit(() -> doWork());

Future<Integer> future = executor.submit(() -> {
    Thread.sleep(1000);
    return 42;
});
Integer result = future.get(); // Blocks until result is ready

executor.shutdown(); // Stops accepting new tasks, finishes existing ones
```

<details>
<summary><strong>The Executors factory methods — and why most are now discouraged</strong></summary>

```java
Executors.newFixedThreadPool(n)      // Fixed-size pool — unbounded queue (memory risk under load)
Executors.newCachedThreadPool()       // Unbounded threads — can exhaust system resources under load
Executors.newSingleThreadExecutor()   // One thread, sequential task execution
Executors.newScheduledThreadPool(n)   // For delayed/periodic tasks
```

Since Java 9, the official OpenJDK guidance actually discourages most `Executors` factory methods in production, because their default queue/pool configurations can lead to `OutOfMemoryError` under sustained load. The recommended approach is to construct `ThreadPoolExecutor` directly with explicit bounds:

```java
ExecutorService executor = new ThreadPoolExecutor(
    4,                              // core pool size
    8,                              // max pool size
    60L, TimeUnit.SECONDS,          // idle thread timeout
    new ArrayBlockingQueue<>(100),  // BOUNDED queue — prevents unbounded memory growth
    new ThreadPoolExecutor.CallerRunsPolicy() // rejection policy when queue is full
);
```

</details>

### Choosing a Rejection Policy

| Policy | Behavior |
|---|---|
| `AbortPolicy` (default) | Throws `RejectedExecutionException` |
| `CallerRunsPolicy` | Runs the task on the calling thread itself — natural backpressure |
| `DiscardPolicy` | Silently drops the task |
| `DiscardOldestPolicy` | Drops the oldest queued task, then retries |

---

<a id="part-8"></a>
## Part 8 — `CompletableFuture` & Async Programming

`Future` (from Part 7) has a major limitation: `.get()` **blocks**, and you can't chain or combine results without manual coordination. `CompletableFuture` (Java 8+) fixes this with a fully composable, non-blocking API.

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchUser())                    // Runs async
    .thenApply(user -> user.getName())                  // Transform result
    .thenApply(String::toUpperCase)
    .exceptionally(ex -> "DEFAULT_NAME");                // Graceful fallback

future.thenAccept(System.out::println); // Consume final result, non-blocking
```

### Combining Multiple Async Operations

```java
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(this::fetchUser);
CompletableFuture<List<Order>> ordersFuture = CompletableFuture.supplyAsync(this::fetchOrders);

// Run independently, combine results once BOTH complete
CompletableFuture<String> combined = userFuture.thenCombine(ordersFuture,
    (user, orders) -> user.getName() + " has " + orders.size() + " orders");

// Wait for ALL of several futures
CompletableFuture<Void> all = CompletableFuture.allOf(userFuture, ordersFuture);

// Wait for whichever finishes FIRST
CompletableFuture<Object> any = CompletableFuture.anyOf(userFuture, ordersFuture);
```

> ⚠️ **Golden Rule:** by default, `thenApply`/`thenAccept`/etc. run on the **same thread** that completed the previous stage — which might be your common `ForkJoinPool`. For I/O-bound chains, use the `Async` variants (`thenApplyAsync`, with an explicit `Executor` argument) to avoid starving the shared pool.

```java
ExecutorService customPool = Executors.newFixedThreadPool(10);

future.thenApplyAsync(this::transform, customPool); // Explicit executor — don't starve the default pool
```

---

<a id="part-9"></a>
## Part 9 — Concurrent Collections

Regular `ArrayList` and `HashMap` are **not thread-safe** — concurrent modification can corrupt internal structure entirely (not just throw an exception). `java.util.concurrent` provides purpose-built alternatives.

```java
// Thread-safe map — bucket-level locking, NOT a single global lock
Map<String, String> map = new ConcurrentHashMap<>();

// Read-heavy, rarely-modified lists (e.g., event listener registries)
List<String> list = new CopyOnWriteArrayList<>();

// Thread-safe queue for producer-consumer patterns — blocks when empty/full
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100);

queue.put(task);          // Blocks if queue is full
Task t = queue.take();    // Blocks if queue is empty

// Lock-free queue — non-blocking, good for high-throughput pipelines
Queue<Task> lockFreeQueue = new ConcurrentLinkedQueue<>();
```

<details>
<summary><strong>Why ConcurrentHashMap beats Collections.synchronizedMap()</strong></summary>

`Collections.synchronizedMap(new HashMap<>())` wraps every method call in a `synchronized` block on a **single shared lock** — meaning only one thread can touch the map at all, for any operation, at any time. It works, but throughput collapses under contention.

`ConcurrentHashMap` instead locks at a much finer granularity (historically per-segment, and since Java 8, effectively per-bin using CAS operations and synchronized blocks scoped to individual bins). Multiple threads can read **and write to different keys simultaneously** without blocking each other. This is the same principle behind why `ReadWriteLock` beats plain `synchronized` for read-heavy workloads — narrower locks, more concurrency.

</details>

---

<a id="part-10"></a>
## Part 10 — Virtual Threads (Project Loom, Java 21+)

This is the most significant change to Java concurrency in over a decade, and it changes some of the "best practices" you've just read.

### The Problem Virtual Threads Solve

Traditional Java threads (now called **platform threads**) are wrappers around **OS threads** — expensive to create (each consumes ~1MB of stack memory by default) and limited in number (typically a few thousand before exhausting system resources).

This meant thread pools existed largely as a **scarcity management strategy** — you couldn't just spin up a thread per request under high load.

```java
// Platform threads: creating 100,000 of these would likely crash the JVM
for (int i = 0; i < 100_000; i++) {
    new Thread(() -> doBlockingIOWork()).start();
}
```

### Virtual Threads — Cheap, JVM-Managed Threads

```java
// Virtual threads: 100,000 of these is completely fine
for (int i = 0; i < 100_000; i++) {
    Thread.startVirtualThread(() -> doBlockingIOWork());
}

// Or via ExecutorService (recommended pattern)
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> doBlockingIOWork());
    }
} // Auto-closes — waits for all submitted tasks to complete
```

Virtual threads are managed entirely by the JVM, not the OS. Thousands — even millions — can exist simultaneously, because they're **mounted onto a small pool of platform threads (carrier threads) only while actively running CPU work**. The moment a virtual thread blocks on I/O (a DB call, an HTTP request), the JVM **unmounts** it from its carrier thread and frees that carrier thread to run a different virtual thread. When the I/O completes, the virtual thread resumes wherever a carrier thread is free.

<details>
<summary><strong>What changes — and what genuinely doesn't</strong></summary>

**What changes:**
- You generally **stop pooling threads** for I/O-bound work — create a new virtual thread per task instead, since they're cheap
- "Thread per request" becomes viable again at massive scale, simplifying code that used to require complex async/reactive chaining purely to conserve OS threads

**What does NOT change:**
- `synchronized`, race conditions, deadlocks, and the Java Memory Model rules from Parts 3–5 **still fully apply** — virtual threads don't make your code automatically thread-safe
- ⚠️ **Important caveat:** a `synchronized` block that blocks for I/O **pins** the virtual thread to its carrier thread — it can't unmount, which defeats the scalability benefit and can starve the carrier pool under heavy contention. (Java 24 has since improved this, but on earlier versions, prefer `ReentrantLock` over `synchronized` around blocking I/O specifically when using virtual threads heavily.)
- CPU-bound work still doesn't magically parallelize beyond your actual core count — virtual threads help massively with I/O-bound concurrency, not with raw computation

**When NOT to reach for virtual threads:** tight CPU-bound loops, or code with heavy `synchronized` blocks around blocking calls (until pinning is fully resolved across your JDK version).

</details>

---

<a id="reference"></a>
## Quick Reference — Picking the Right Tool

| Need | Use |
|---|---|
| Run a task asynchronously, get a result later | `ExecutorService` + `Future`, or `CompletableFuture` |
| Thousands of concurrent I/O-bound tasks | Virtual threads (`Executors.newVirtualThreadPerTaskExecutor()`) |
| Protect a single shared counter/flag | `AtomicInteger` / `AtomicBoolean` (lock-free) |
| Protect a critical section (multi-step logic) | `synchronized` or `ReentrantLock` |
| Read-heavy shared data structure | `ReadWriteLock` or `ConcurrentHashMap` |
| Wait for N parallel tasks to finish once | `CountDownLatch` |
| Synchronize threads repeatedly at checkpoints | `CyclicBarrier` |
| Limit concurrent access to a resource pool | `Semaphore` |
| Producer-consumer task handoff | `BlockingQueue` |
| Chain/combine async operations | `CompletableFuture` |
| Thread-safe map for general use | `ConcurrentHashMap` |
| Thread-safe list, rarely modified | `CopyOnWriteArrayList` |

---

## Key Takeaways

- Concurrency exists to overlap I/O wait time, not to magically speed up CPU-bound work beyond your core count
- `volatile` guarantees visibility and ordering — it does **not** make compound operations like `count++` atomic
- The Java Memory Model's "happens-before" relationship is the real foundation beneath `synchronized`, `volatile`, and `Thread.start()`/`join()` — without it, there's no visibility guarantee at all
- Race conditions, deadlocks, livelocks, and starvation are four **distinct** failure modes — know the difference and the fix for each
- Prefer `java.util.concurrent` building blocks (`Atomic*`, `CountDownLatch`, `Semaphore`, `ConcurrentHashMap`) over hand-rolled `synchronized`/`wait`/`notify` logic
- Construct `ThreadPoolExecutor` explicitly with bounded queues in production — most `Executors` factory methods are discouraged due to unbounded resource risk
- `CompletableFuture` enables non-blocking, composable async chains — watch out for which executor each stage runs on
- Virtual threads (Java 21+) make thread-per-task viable at massive scale for I/O-bound work, but they don't replace the fundamentals — your code still needs to be genuinely thread-safe

---

*Multithreading isn't about memorizing API calls — it's about understanding what guarantees the JVM actually gives you, and what it doesn't. Get that mental model right, and every class in `java.util.concurrent` stops being magic and starts being a tool you reach for on purpose.*