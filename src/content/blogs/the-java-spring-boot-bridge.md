## Every Java Concept You Need Before Spring Boot Makes Sense

> *You don't know Spring Boot — you know annotations you've memorised without knowing why they work. Every `@Autowired`, every `JpaRepository`, every `Optional<User>` is built on Java fundamentals you may have skipped. This guide builds the bridge, one concept at a time.*

---

## Part I — Object-Oriented Java

OOP is not "classes and inheritance." It is a strategy for organising a program so that change in one place does not break another. Every concept in this part — encapsulation, polymorphism, interfaces — is a tool for managing that risk.

---

<a id="ch1"></a>
## Chapter 1 — Class & Object: The Smallest Unit

Before you write a single Spring annotation, you need to understand the atom of the Java world: the class and its instances. Most tutorials rush past this and pay for it later when the learner can't explain why `new` exists or what a variable actually holds.

A class is a blueprint. It declares what data each thing holds (fields) and what behaviours it exposes (methods). An object is one concrete thing built from that blueprint — with its own private copy of the data. You define the shape once and stamp out as many instances as you need. This separation between the definition and the instances is the foundation of everything that follows.

When you call `new User()`, the JVM does five things in sequence. It first locates the `User` class file and loads it if it hasn't been loaded yet. It then allocates a chunk of memory on the heap large enough to hold one `User`'s fields. It runs the constructor to initialise those fields to valid starting values. It returns the memory address of that chunk. And the variable you wrote on the left side of the assignment — `User u` — sits on the stack and holds that address. The variable is a reference, not the object itself. Two variables can point to the same object, and mutating one is mutating both — a source of bugs you'll encounter exactly once and never forget.

```java
public class User { // blueprint
    private String name; // field — every instance gets its own copy
    private String email;

    public String getName() { return name; } // method — the behaviour
    public String getEmail() { return email; }
}

User u = new User(); // new allocates memory on the heap, runs the constructor
User v = u;          // v and u now point at the same object — not a copy
```

> 💡 In Spring Boot, you almost never write `new UserService()` in production code. The framework creates these objects for you and hands them to whoever needs them — this is dependency injection, covered in Chapter 29. But the class you write is still a blueprint. Spring just owns the stamping-out step.

---

<a id="ch2"></a>
## Chapter 2 — Encapsulation: Hide the Wiring

Here is the problem encapsulation solves. If any code anywhere can directly read or write any field of any object, then a single rename or business-rule change forces you to hunt down every caller. Change `balance` to `currentBalance`, and the application breaks in forty places. Add the rule "balance can never go negative," and you must add that check in forty places. Miss one and you have a bug. The blast radius of every change is the entire codebase.

Encapsulation solves this by marking fields `private`. Outside code can no longer touch them. You expose only `public` methods, and those methods become the one funnel through which all reads and writes flow. That funnel can enforce rules, validate inputs, log changes, or swap the internal implementation entirely — and callers don't notice any of it. You've reduced the blast radius of every future change to one place: the class itself.

The key insight is that encapsulation is about controlling access, not relabelling it. Writing a `setBalance(double v)` that blindly assigns has thrown away every benefit of making the field private. If a field needs to obey a rule — and most do — that rule must live inside the method that touches it.

```java
public class Account {
    private double balance; // hidden from the outside world

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        balance += amount; // rule enforced HERE, in one place, forever
    }

    public void withdraw(double amount) {
        if (amount > balance) throw new IllegalStateException("Insufficient funds");
        balance -= amount;
    }

    public double getBalance() { return balance; } // read-only view — no setter
}
```

> ⚠️ **Golden Rule:** A field that has a public setter with no validation logic is not encapsulated — it's just renamed. If you catch yourself writing `public void setBalance(double v) { this.balance = v; }`, ask: what rule should this enforce? If the answer is "none," ask whether the field should be settable at all.

In Spring Boot, `@Entity` classes keep fields `private` and expose accessor methods. JPA reads and writes those fields via reflection during hydration, but the rule-bearing methods stay in the class. Validation annotations like `@NotNull` and `@Email` sit directly on the private fields — the rule lives with the data, exactly the encapsulation principle.

![Encapsulation diagram showing private balance field accessible only through deposit() and getBalance() methods](/images/blogs/internals/encapsulation-funnel-diagram.png)

---

<a id="ch3"></a>
## Chapter 3 — Inheritance & super

The problem inheritance solves is duplication. Suppose you have `Dog`, `Cat`, and `Fish`. All three breathe, sleep, eat. If you copy those 80% of shared behaviours into each class, then the day you need to change how breathing works, you change it in three places. Miss one and the animals disagree on how to breathe.

Inheritance says: put the shared 80% in a parent class called `Animal`. A child class `extends Animal` and automatically receives all its fields and methods. Define it once, fix it once. The child only needs to declare what makes it different — the remaining 20%.

A child can also override a parent's method. Write the same method signature in the child and the child's version wins at runtime. Inside the child's override, `super.method()` calls the parent's version — useful when you want to extend the behaviour rather than replace it entirely.

```java
class Animal {
    void breathe() {
        System.out.println("breathing");
    }
    void eat() {
        System.out.println("eating");
    }
}

class Dog extends Animal { // gets breathe() and eat() for free
    void bark() {
        System.out.println("woof");
    }

    @Override
    void breathe() {
        super.breathe(); // run the parent's version first
        System.out.println("and panting"); // then add to it
    }
}
```

> ⚠️ **Golden Rule:** Inherit only when the child is truly a "is-a" kind of the parent and obeys every contract the parent promises. The classic mistake is `class Stack extends ArrayList` — done to get list methods for free. Now your Stack exposes `add(int index, E element)`, which is meaningless for a stack and can corrupt it. The rule is simple: if the child cannot be substituted everywhere the parent is used, don't extend — compose instead. Hold the collaborator as a `private` field.

Spring uses inheritance sparingly in user code. The patterns you'll see are `extends RuntimeException` for custom domain exceptions and `extends WebMvcConfigurer` for MVC configuration overrides. The framework as a whole strongly prefers composition and interfaces over inheritance — and that's the modern consensus for good reason.

---

<a id="ch4"></a>
## Chapter 4 — Polymorphism: One Name, Many Shapes

Polymorphism solves the extension problem. Imagine you have a method that processes a list of animals. Without polymorphism, you write `if (animal instanceof Dog) … else if (animal instanceof Cat) … else if (animal instanceof Fish)`. Every time you add a new animal, you edit this method. You've made the open-closed principle impossible — the code is never closed for modification.

Polymorphism says: write your code against the parent type `Animal`. Call `animal.sound()` on each. The JVM dispatches to the actual object's version at runtime. When you add `Cow`, nothing in the dispatch code changes — the new behaviour plugs in automatically. The caller never changes. The caller never even knows.

The mechanism underneath is called dynamic dispatch, and it works through what the JVM calls a vtable. Every object holds a hidden pointer to its class's method table — an array of function pointers indexed by method ID. When you call `a.sound()`, the JVM doesn't look at the declared type of the variable (`Animal`). It follows the pointer to the actual object on the heap, reads that object's class pointer, and calls the function stored at the `sound` slot. Same call site, different behaviour, decided entirely at runtime.

```java
class Animal { void sound() { System.out.println("..."); } }
class Dog extends Animal { @Override void sound() { System.out.println("bark"); } }
class Cat extends Animal { @Override void sound() { System.out.println("meow"); } }

// Polymorphic dispatch in action
List animals = List.of(new Dog(), new Cat(), new Dog());
for (Animal a : animals) {
    a.sound(); // JVM picks the right version at runtime — bark, meow, bark
}
```

![Polymorphism vtable dispatch diagram: a.sound() call dispatching to Dog, Cat, Cow implementations at runtime](/images/blogs/internals/polymorphism-vtable-dispatch.png)

In Spring Boot, polymorphism is the engine of the entire framework. You declare a `UserRepository` interface. Spring injects whichever implementation it wants — a JPA one in production, a mock in tests. Your service code is identical in both environments. That ability to swap implementations behind the same interface is polymorphism in its most production-critical form.

---

<a id="ch5"></a>
## Chapter 5 — Abstraction & Abstract Classes

There is a gap between a normal class and a pure interface. Sometimes you want a parent that defines a partial template — some behaviour is shared and ready to use, but a key step varies per child and must be filled in. If the parent is a normal class, two problems arise: someone can instantiate it directly (producing a half-built object), and children can skip implementing the variable step by inheriting a meaningless default.

An abstract class solves both. Marking the class `abstract` prevents direct instantiation — the JVM refuses `new Payment()`. Marking specific methods `abstract` forces every concrete child to implement them or itself become abstract. You publish a skeleton; the children are contractually required to finish it. This is the Template Method pattern — one of the most common patterns in production Java.

The practical value in terms of code organisation is high. The shared steps (validate, log, send confirmation) live in the parent, written once, tested once. The variable step (the actual charge logic) lives in each child. Adding a new payment method means writing exactly one class with exactly one method — the rest is inherited.

```java
abstract class Payment {
    // Shared orchestration — the template. final prevents children from breaking the sequence.
    public final void process() {
        validate();  // shared
        charge();    // each child fills this
        log();       // shared
    }

    private void validate() { /* common validation logic */ }
    private void log() { /* common audit logging */ }

    // Abstract: no body here. Children MUST implement this.
    protected abstract void charge();
}

class UpiPayment extends Payment {
    @Override
    protected void charge() {
        // UPI-specific charge logic
        System.out.println("Charging via UPI");
    }
}

class CardPayment extends Payment {
    @Override
    protected void charge() {
        System.out.println("Charging via card");
    }
}
```

| | Abstract Class | Interface |
|---|---|---|
| Can hold fields/state | Yes | No (only constants) |
| Can hold concrete methods | Yes | Only as `default` methods |
| A class can extend | Only one | Many |
| When to pick | Children share real code | Only the contract matters |

Spring's own source is built on abstract classes: `AbstractApplicationContext`, `AbstractController`, `JdbcTemplate`'s superclass. You'll use this pattern most in notification systems, payment processors, and anywhere a "do these steps, customise this one" structure makes sense.

---

<a id="ch6"></a>
## Chapter 6 — Interfaces: The Contract

Two problems that inheritance cannot solve. First: two completely unrelated classes — a `FileLogger` and a `CloudLogger` — both need to be usable wherever a "logger" is expected. They share no parent and inheriting from one makes no semantic sense. Second: Java has single inheritance, but a class often needs to be many things at once — comparable, serializable, runnable. These two constraints combined are why interfaces exist.

An interface declares what a class can do — a list of method signatures — without specifying how. Any class can implement any number of interfaces. The caller writes its code against the interface type, not the class. This means implementations can be swapped freely, mocked in tests, or added later without touching the caller.

```java
public interface Logger {
    void log(String message); // abstract by default — no body, just the contract
    default void logError(String message) {
        log("ERROR: " + message); // default method — optional to override
    }
}

class FileLogger implements Logger {
    @Override
    public void log(String message) { /* write to disk */ }
}

class CloudLogger implements Logger {
    @Override
    public void log(String message) { /* send to cloud */ }
}

// Caller depends on the interface — can use either implementation interchangeably
Logger logger = new FileLogger();
logger.log("User registered");
```

A class can implement multiple interfaces simultaneously, because each interface is just a contract — there's no shared state to conflict.

```java
class Task implements Runnable, Comparable, Serializable {
    // Task is now usable as any of these three things in any context
    @Override public void run() { /* execute the task */ }
    @Override public int compareTo(Task other) { /* ordering logic */ }
}
```

> 💡 Default to interface. Reach for abstract class only when children genuinely share code, not just a contract. Most design pain comes from picking abstract class too early — it locks children into their one inheritance slot for life.

In Spring Boot, interfaces are the entire programming model. `interface UserRepository extends JpaRepository<User, Long>{}` — no implementation written. Spring Data generates one at startup using reflection and proxies. `interface PaymentService` with `UpiPaymentService implements PaymentService` in production and `FakePaymentService implements PaymentService` in tests — same controller code, different injected bean. The framework's superpower of swapping implementations without touching callers is only possible because of interfaces.

---

<a id="ch7"></a>
## Chapter 7 — static & final

These two keywords solve fundamentally different problems but are commonly confused with each other.

`static` answers the question: does this belong to the class or to each instance? A counter that tracks how many `User` objects have ever been created doesn't belong to any single user — it belongs to the class itself. A utility method like `Math.sqrt()` has no per-instance state whatsoever. `static` members live in the class's metadata in the JVM's method area — one copy total, shared across all instances, accessible as `ClassName.member` without `new`.

`final` answers a different question: can this be reassigned? A `private final UserRepository repo` set in the constructor should never be swapped out mid-life. `final` tells the compiler to enforce that — any reassignment after initialisation is a compile error. On a class, `final` means it cannot be extended. On a method, it means it cannot be overridden.

```java
public class Counter {
    public static int total = 0;   // one copy, shared — lives on the class
    private final int id;          // per-instance, set once in constructor, never changed

    public Counter() {
        id = ++total; // static field incremented; final field assigned exactly once
    }

    // static method — has no 'this', cannot access non-static fields
    public static int getTotal() { return total; }
}

// Constants: public static final is the pattern
public static final String BASE_URL = "https://api.smitroy.com";
```

One gotcha with `final`: it applies to the reference, not the object. `final List<String> names` cannot be reassigned to a new list, but `names.add("Smit")` is perfectly legal — the list itself is still mutable. If you want immutability of content, use `List.of()`.

In Spring Boot, constructor-injected dependencies are almost always `private final`. Once Spring wires them at startup, they must never be reassigned — and `final` enforces that at compile time rather than relying on developer discipline. This is one reason constructor injection is the recommended style over field injection.

---

<a id="ch8"></a>
## Chapter 8 — Access Modifiers

Without visibility control, every class can call every method of every other class. Internal helper methods leak into the public API. Renaming an internal method becomes a breaking change even if it was never meant to be used externally. Refactoring becomes terrifying because anyone might depend on anything. Access modifiers are Java's answer to this: declare exactly how widely each member is visible.

| Modifier | Same Class | Same Package | Subclass (any package) | Anywhere |
|---|---|---|---|---|
| `private` | ✓ | — | — | — |
| (package-private) | ✓ | ✓ | — | — |
| `protected` | ✓ | ✓ | ✓ | — |
| `public` | ✓ | ✓ | ✓ | ✓ |

The rule of thumb is simple: start `private`. Loosen only when forced. A field never needs to be `public` — that's what getters are for. A class's contract with the world should be a small set of `public` methods; everything else is implementation detail that should be free to change.

Package-private (no modifier) is underused. It's the natural scope for classes that collaborate closely within a package but have no business being used from outside it — internal helpers, package-specific utilities. Making everything `public` "just in case" is technical debt.

```java
public class OrderService {
    private final OrderRepository repo; // only this class touches this
    private final EmailService email;

    public Order placeOrder(OrderRequest request) { // external API
        Order order = buildOrder(request); // calls private helper
        repo.save(order);
        notifyUser(order);
        return order;
    }

    private Order buildOrder(OrderRequest req) { /* internal detail */ return null; }
    private void notifyUser(Order o) { email.send(o.getUserEmail(), "Order placed"); }
}
```

In Spring Boot, `@Service` and `@RestController` classes are `public` because the framework must see them. Their methods follow the same principle: only methods that are HTTP endpoints or are called by other components need `public`. Helper methods stay `private`. The framework doesn't need visibility into your internals — and neither does anyone else.

---

<a id="ch9"></a>
## Chapter 9 — Constructors & this

An object created in a half-built state is a bug waiting to happen. If fields are initialised lazily across multiple setter calls, there exists a window — between construction and the last setter — where the object is invalid. Callers must "remember" which setters to call and in which order. Forget one and the object silently misbehaves.

A constructor is a special method that runs exactly once, at the moment the object is created. It is the single enforced opportunity to put the object into a valid initial state. Anything the object cannot function without should be a constructor parameter — not an optional setter, not a field with a default of `null`. The object is either valid when it leaves the constructor, or the constructor throws.

The `this` keyword inside a constructor refers to the object being built. Its most common use is disambiguating fields from parameters when they share names: `this.email = email` means "set my field called email to the parameter called email." Without `this`, the compiler reads both sides as the parameter and the assignment does nothing.

```java
public class User {
    private final String email;
    private final String name;

    // Primary constructor — both fields are required
    public User(String email, String name) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email required");
        this.email = email; // 'this.email' = field, 'email' = parameter
        this.name = name;
    }

    // Overloaded convenience constructor — delegates to the primary
    public User(String email) {
        this(email, "Anonymous"); // this() must be the first line
    }
}
```

> ⚠️ **Golden Rule:** Do not do real work in a constructor. Hitting a database, calling an HTTP endpoint, or spawning a thread inside a constructor turns object creation into a slow, failure-prone operation — and it runs before the object is fully built. Keep constructors to assignment and trivial validation. Real work belongs in dedicated methods called after construction.

In Spring Boot, constructor injection is the standard precisely because of these properties. You declare dependencies as constructor parameters. Spring sees the constructor, finds matching beans, and passes them in. The fields are `private final` — set once, never null, impossible to bypass in tests.

---

<a id="ch10"></a>
## Chapter 10 — equals, hashCode & toString

Java's `==` operator compares memory addresses. Two `User` objects with identical emails and names are different objects in memory, so `==` returns `false`. In nearly every domain model, that's wrong — equality should be about content, not identity. The `equals` method is how you teach Java what equality means for your type.

But there's a contract you must understand: `equals` and `hashCode` are coupled, and breaking the coupling breaks `HashMap`, `HashSet`, and every collection that relies on hashing. The rule is iron-clad: if `a.equals(b)` is `true`, then `a.hashCode()` must equal `b.hashCode()`. Here's why. A `HashMap` stores entries in buckets. It picks a bucket using `hashCode()`. When you look up a key, it goes to that bucket and uses `equals()` to find the right entry. If two equal objects have different hash codes, the map goes to the wrong bucket and reports "not found" — even though the key is there.

```java
public class User {
    private final String email;
    private final String name;

    // Equality based on business key (email), not identity or database id
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User u)) return false; // pattern matching — Java 16+
        return Objects.equals(email, u.email);
    }

    // hashCode must be consistent with equals — same fields, same hash function
    @Override
    public int hashCode() {
        return Objects.hash(email); // uses email, matching equals
    }

    @Override
    public String toString() {
        return "User{email='" + email + "', name='" + name + "'}";
    }
}
```

For immutable data carriers — DTOs, value objects, query results — the `record` type introduced in Java 14 gives you all three methods for free, plus immutability and a compact syntax:

```java
public record UserDto(String email, String name) {}
// Automatically: final fields, canonical constructor, accessors, equals, hashCode, toString
```

In Spring Boot, JPA entities must implement `equals` and `hashCode` correctly because Hibernate stores them in `Set`s for relationship management. The safe pattern: equality based on a stable business key like email or order number, not the database `id` (which is `null` before the first `INSERT`). For REST response DTOs, prefer `record`s — immutable, concise, and serialisation-friendly.

---

<a id="ch11"></a>
## Chapter 11 — The Object Root & instanceof

Every class in Java — yours, the standard library's, the framework's — silently extends `java.lang.Object`. You don't write `extends Object`; the compiler inserts it. This is why every object in the system already has `equals`, `hashCode`, `toString`, `getClass`, `wait`, and `notify` — they are defined once on `Object` and inherited universally. A method that accepts `Object` accepts literally anything. This is the original (pre-generics) way Java expressed "a collection of anything," and it's why you see `Object` everywhere in pre-Java-5 codebases.

The `instanceof` operator checks whether an object is an instance of a given type. Pre-Java 16, this required two lines: the check and then a manual cast. Java 16 introduced pattern variables, which fuse both into one:

```java
// Old style — repetitive and error-prone
if (o instanceof User) {
    User u = (User) o;
    System.out.println(u.getName());
}

// Modern style (Java 16+) — check and bind in one expression
if (o instanceof User u) {
    System.out.println(u.getName()); // u is already typed — no cast needed
}
```

> ⚠️ **Golden Rule:** If you write a chain of `instanceof` checks — `if (x instanceof A) … else if (x instanceof B) …` — you have rediscovered polymorphism badly. The per-type behaviour belongs in a method on each type, called through a common interface. The `instanceof` chain should almost never appear in production code.

---

## Part II — Type System & Modern Java

OOP gives you structure. The type system gives you safety — bugs caught at compile time, not at 2 a.m. on Friday. The modern features (lambdas, streams, `Optional`) are what make Java code look like Java code in 2026.

---

<a id="ch12"></a>
## Chapter 12 — Generics: Typed Containers

Before generics, a `List` stored `Object`. To use an item you cast it back: `String s = (String) list.get(0)`. If you accidentally put an `Integer` in, the cast blew up at runtime with `ClassCastException`. The compiler couldn't help because it had no idea what the list was supposed to contain.

Generics parameterise the type. `List<String>` means "a list that only ever holds Strings." The compiler refuses to add anything else, and removes the cast on the way out — because it already proved the type is correct. An entire class of bugs that used to surface at runtime now fails at compile time. That is the only reason generics exist: shifting error detection left.

```java
// Using a generic type
List names = new ArrayList<>();
names.add("Smit");
// names.add(42); // compile error — not a String
String first = names.get(0); // no cast needed — compiler guarantees it's a String

// Writing your own generic type
public class Box { // T is a type parameter — a placeholder for any type
    private T value;
    public void set(T v) { value = v; }
    public T get() { return value; }
}

Box intBox = new Box<>();
intBox.set(42);
int x = intBox.get(); // no cast
```

Something important happens behind the scenes: **type erasure**. Generics live only at compile time. After the compiler finishes checking types, it erases them. `List<String>` becomes plain `List` in the bytecode, and wherever you call `.get()`, the compiler inserts a synthetic cast. The JVM never sees `<String>`. This has two practical consequences: at runtime you cannot ask "is this a `List<String>`?" — the answer is gone. And you cannot write `new T()` inside a generic class, because `T` doesn't exist at runtime.

Wildcards handle a subtle but common situation. `List<Dog>` is not a subtype of `List<Animal>`, even though `Dog` is an `Animal`. If it were, you could add a `Cat` through the `List<Animal>` reference and corrupt the `List<Dog>`. Wildcards give you a controlled way to loosen this:

```java
// ? extends — you can read Animals from it, but not add
void printAll(List animals) {
    for (Animal a : animals) System.out.println(a.sound());
}

// ? super — you can add Dogs into it
void addDogs(List list) {
    list.add(new Dog());
}
// Mnemonic: PECS — Producer Extends, Consumer Super
```

In Spring Boot, generics are how every API expresses itself. `JpaRepository<User, Long>` tells Spring the entity type is `User` and the primary key is `Long`. `ResponseEntity<User>` means "HTTP response wrapping a User payload." You cannot read a single page of Spring documentation without generics.

---

<a id="ch13"></a>
## Chapter 13 — Collections Framework

Storing groups of objects is universal. The problem is that the right data structure depends entirely on the operation pattern. An `ArrayList.contains()` scan over a million items takes O(n) time — slow enough to visibly stall a request. A `HashSet.contains()` for the same data takes O(1). The Java Collections Framework gives you a unified hierarchy: interfaces describe what a collection can do; implementations provide how. You program against the interface (`List`, `Set`, `Map`) and pick the implementation based on access patterns.

Collection

├── List       → ArrayList, LinkedList

├── Set        → HashSet, TreeSet, LinkedHashSet

└── Queue      → ArrayDeque, PriorityQueue

Map (separate root)

├── HashMap

├── TreeMap

└── LinkedHashMap

`Map` is not a `Collection` — it stores pairs, not individual items.

| Need | Pick | Why |
|---|---|---|
| Indexed, ordered, frequent reads | `ArrayList` | Array-backed. O(1) `get`, O(n) insert in middle. |
| Frequent insert/remove at ends | `ArrayDeque` | Outperforms `LinkedList` in practice. |
| Uniqueness, fast lookup, no order needed | `HashSet` | O(1) `contains`. |
| Uniqueness + insertion order | `LinkedHashSet` | HashSet plus a linked-list of entries. |
| Uniqueness + sorted | `TreeSet` | Red-black tree. O(log n). |
| Key → value mapping | `HashMap` | The workhorse. O(1) average put/get. |
| Map but preserves insertion order | `LinkedHashMap` | Useful for LRU caches. |
| Map sorted by key | `TreeMap` | O(log n), range queries possible. |

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob")); // mutable copy
Set<Long> seen = new HashSet<>();
Map<String, User> byEmail = new HashMap<>();

byEmail.put("alice@x.com", alice);
User u = byEmail.getOrDefault("unknown@x.com", null);

// Immutable collections — prefer for fixed config data
List<String> roles = List.of("ROLE_USER", "ROLE_ADMIN");
Map<String, Integer> codes = Map.of("OK", 200, "NOT_FOUND", 404);
```

> ⚠️ **Golden Rule:** Never use a mutable object as a `HashMap` or `HashSet` key. The bucket is chosen from `hashCode()` at insert time. Mutate the key afterwards and the hash changes — the item is still in the original bucket, but lookups go to the new bucket. The item becomes invisible. Keys must be effectively immutable.

In Spring Boot, repository queries return `List<User>`. Configuration properties bind to `Map<String, String>`. In-memory caches are often `ConcurrentHashMap`s. `List.of()` and `Map.of()` create immutable collections — use them for fixed configuration to prevent accidental mutation.

---

<a id="ch14"></a>
## Chapter 14 — Comparable vs Comparator

To sort a collection, Java needs to know which element comes first. There is no universal answer — sometimes by name, sometimes by signup date, sometimes by revenue. Java provides two strategies for expressing this, and they serve different scenarios.

`Comparable` is for natural ordering — one authoritative order that the class itself defines. A `User` sorted by name alphabetically is a natural order that belongs in the class. The method `compareTo` must return negative if `this` is less, zero if equal, positive if greater. It must be consistent with `equals`.

`Comparator` is for external, on-demand ordering. You build it outside the class, pass it where needed, and can define as many as you want. The modern `Comparator.comparing()` API makes this readable.

```java
// Comparable — natural order baked into the class
class User implements Comparable<User> {
    private String name;

    @Override
    public int compareTo(User other) {
        return this.name.compareTo(other.name); // alphabetical by name
    }
}

// Comparator — external, defined where needed, chained fluently
List<User> users = fetchUsers();

// Sort by signup date descending, then by name ascending as tiebreaker
users.sort(
    Comparator.comparing(User::getSignupDate).reversed()
              .thenComparing(User::getName)
);
```

In Spring Boot, repository queries almost always sort at the database level using `Sort.by("createdAt").descending()` — that translates to `ORDER BY created_at DESC` in SQL, which is where sorting belongs for large datasets. In-memory comparators are for lists already fully loaded, and `PriorityQueue` for retry scheduling or task prioritisation.

---

<a id="ch15"></a>
## Chapter 15 — Enums: A Closed Set of Values

Status fields stored as `String` — `"PENDING"`, `"PAID"`, `"FAILED"` — invite typos that compile perfectly and crash in production. `"PADING"` passes every compiler check. There's no way to know all valid values without reading documentation. And switches on strings aren't exhaustiveness-checked by the compiler.

An enum declares a fixed, named set of constants. The type itself is the guarantee — only those values are valid. The compiler rejects anything else. Switches on enums can be exhaustiveness-checked. And enums can carry data and behaviour, making them far more powerful than simple named constants.

```java
// Simple enum
public enum OrderStatus {
    PENDING, PAYMENT_PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
}

// Enum with associated data and methods
public enum Plan {
    FREE(0), PRO(9), TEAM(29), ENTERPRISE(99);

    private final int monthlyPrice;

    Plan(int price) { this.monthlyPrice = price; }

    public int monthlyPrice() { return monthlyPrice; }
    public boolean isPaid() { return monthlyPrice > 0; }
}

// Usage
Plan current = Plan.PRO;
System.out.println(current.monthlyPrice()); // 9
```

> ⚠️ **Golden Rule:** In JPA, always use `@Enumerated(EnumType.STRING)`. It stores the enum's name ("PAID") in the database column. The default `ORDINAL` stores the index — 0, 1, 2 — which means reordering constants in your code silently corrupts all historical data. This is a production disaster that happens exactly once to any team.

---

<a id="ch16"></a>
## Chapter 16 — Exception Handling

A method ten layers deep hits an unexpected condition — file not found, network timeout, divide by zero. The naive approach is returning a magic value: `-1`, `null`, or a boolean flag. Every caller must then check for the magic value, and one forgotten check propagates incorrect state up the call stack silently. The deeper the failure, the more callers must carry this boilerplate.

Java exceptions provide a separate channel for failure. A method throws an exception; control jumps to the nearest matching `catch` up the call stack, skipping all the intermediate callers. Normal logic stays clean. Error handling is centralised at the level that can actually do something useful with it.

Throwable

├── Error (don't catch — JVM-level: OutOfMemoryError, StackOverflowError)

└── Exception

├── RuntimeException (unchecked — NullPointerException, IllegalArgumentException)

└── (other checked exceptions — IOException, SQLException)

Checked exceptions require callers to explicitly handle or declare them. Unchecked exceptions (`RuntimeException`) propagate freely. Modern Java and Spring strongly prefer unchecked exceptions — they don't pollute method signatures and don't tempt developers to write empty `catch` blocks just to make code compile.

```java
// Checked exception — wrap and rethrow as unchecked
try {
    String data = Files.readString(path); // throws checked IOException
} catch (IOException e) {
    log.error("Failed to read file: {}", path, e);
    throw new UncheckedIOException(e); // propagate as unchecked
} finally {
    // runs whether the try block succeeded or threw — cleanup here
    cleanupResources();
}

// Try-with-resources — auto-closes anything implementing AutoCloseable
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    // use conn and ps — both are closed automatically on exit, even on exception
}

// Custom domain exception — extends RuntimeException
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User not found with id: " + id);
    }
}
```

> ⚠️ **Golden Rule:** Never swallow exceptions silently. `catch (Exception e) { }` — an empty block — is one of the worst patterns in Java. Errors vanish; the program appears to succeed while producing wrong output. If you genuinely cannot handle an exception, rethrow it.

In Spring Boot, the pattern is: throw domain exceptions from anywhere, handle them globally in a `@RestControllerAdvice`. Controllers stay free of error-handling plumbing entirely.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleNotFound(UserNotFoundException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}
```

---

<a id="ch17"></a>
## Chapter 17 — Functional Interfaces & Lambdas

Before Java 8, passing behaviour as a value required an anonymous inner class — six lines of ceremony for a one-line idea like "filter users who are active." Code that should read as a transformation read as a wall of boilerplate. The intent was buried.

Lambdas give you a short syntax for "a function as a value." But Java's type system has no first-class function type — so each lambda is silently treated as an instance of a **functional interface**: any interface with exactly one abstract method. The compiler infers which functional interface you mean from context.

```java
// Before (Java 7 and earlier)
Comparator<String> byLength = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// After (Java 8+ lambda)
Comparator<String> byLength = (a, b) -> a.length() - b.length();

// Single-expression lambdas need no return keyword
Predicate<User> isActive = user -> user.isActive();
Function<User, String> getEmail = user -> user.getEmail();
Consumer<String> printer = msg -> System.out.println(msg);
Supplier<List<User>> emptyList = () -> new ArrayList<>();
```

The four built-in functional interfaces you'll use constantly:

| Interface | Shape | Used For |
|---|---|---|
| `Function<T,R>` | `T → R` | Transform one value to another |
| `Predicate<T>` | `T → boolean` | Test a condition |
| `Consumer<T>` | `T → void` | Do something with a value |
| `Supplier<T>` | `() → T` | Produce a value on demand |

Method references are an even shorter form when the lambda just calls an existing method:

```java
users.forEach(System.out::println);       // same as u -> System.out.println(u)
users.stream().map(User::getEmail);       // same as u -> u.getEmail()
users.stream().filter(User::isActive);    // same as u -> u.isActive()
```

In Spring Boot, lambdas appear wherever you "configure with a function." The security DSL is pure lambdas: `http.authorizeHttpRequests(req -> req.anyRequest().authenticated())`. Stream pipelines in service layers use `Predicate`, `Function`, and `Consumer` constantly. The "DSL feel" of modern Spring configuration is built entirely on functional interfaces.

---

<a id="ch18"></a>
## Chapter 18 — Streams API

Describe this in imperative style: "From this list of orders, give me the emails of active users who placed an order over ₹10,000 last month, sorted alphabetically, no duplicates." Written with nested loops and intermediate `List`s, this is 20 lines of bookkeeping where the intent drowns in mechanics. Every iteration is noise obscuring the transformation.

Streams let you describe the pipeline as a chain of operations. The code reads top-to-bottom like the English description above, and the implementation handles iteration.

```java
List<String> emails = orders.stream()
    .filter(o -> o.getAmount() > 10_000)          // keep expensive orders
    .filter(o -> o.isLastMonth())                  // from last month only
    .map(o -> o.getUser())                         // extract the user
    .filter(User::isActive)                        // active users only
    .map(User::getEmail)                           // extract email
    .distinct()                                    // no duplicates
    .sorted()                                      // alphabetical
    .toList();                                     // materialise
```

The pipeline model is crucial to understand:
source → filter() → map() → sorted() → toList()
lazy        lazy      lazy     terminal (triggers everything)

Intermediate operations (`filter`, `map`, `sorted`, `distinct`, `limit`) do nothing on their own. They only build a description of work. The terminal operation (`toList`, `count`, `forEach`, `reduce`) is what triggers actual iteration. The stream then pulls each element through the entire pipeline one at a time. A stream with no terminal operation does nothing at all.

```java
// Common terminal operations
.toList()                          // into a List (Java 16+)
.collect(Collectors.toSet())       // into a Set
.collect(Collectors.toMap(User::getEmail, u -> u)) // into a Map
.count()                           // number of matching elements
.findFirst()                       // Optional<T> — first element
.reduce(0, Integer::sum)           // fold to a single value
.anyMatch(User::isActive)          // boolean — short-circuits
.allMatch(u -> u.getAge() >= 18)   // boolean — short-circuits
```

> ⚠️ **Golden Rule:** A stream is consumed exactly once. Calling `.count()` and then `.toList()` on the same stream throws `IllegalStateException`. If you need both, call `.stream()` on the source twice. And always ask: should this filtering be done in Java, or should it be a SQL `WHERE` clause? Doing heavy aggregation over thousands of rows already loaded into memory is an anti-pattern — push it to the database.

![Streams pipeline diagram: source bubbles passing through filter, map, sorted, and collecting into a List](/images/blogs/internals/streams-pipeline-lazy-evaluation.png)

---

<a id="ch19"></a>
## Chapter 19 — Optional: Explicit Absence

A method that may return `null` is indistinguishable from one that never does — by signature alone. The caller has no way of knowing which case applies without reading documentation, and documentation lies. A forgotten null-check produces a `NullPointerException` in production at 3 a.m. Tony Hoare, who invented `null`, calls it his "billion-dollar mistake."

`Optional<T>` encodes the possibility of absence in the type itself. A return type of `Optional<User>` tells every caller, at the type level: "this might be empty — you must make a conscious decision about what to do." The absence is not silently propagated; it's handled explicitly.

```java
// Finding a user — returns Optional to signal "might not exist"
Optional<User> maybe = repo.findByEmail("smit@example.com");

// Pattern 1: default value
String name = maybe.map(User::getName).orElse("Anonymous");

// Pattern 2: compute default lazily (only when empty)
User user = maybe.orElseGet(() -> createGuestUser());

// Pattern 3: throw a domain exception if empty
User user = maybe.orElseThrow(() -> new UserNotFoundException("smit@example.com"));

// Pattern 4: side effect only if present
maybe.ifPresent(u -> log.info("User found: {}", u.getEmail()));

// Chaining transformations
String city = maybe
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("Unknown");
```

The most common methods worth knowing:

| Method | What it does |
|---|---|
| `isPresent()` / `isEmpty()` | Boolean check — use sparingly |
| `get()` | Returns value or throws if empty — avoid outside tests |
| `orElse(default)` | Value or eagerly-evaluated fallback |
| `orElseGet(supplier)` | Value or lazily-computed fallback |
| `orElseThrow(() -> ex)` | Value or throw |
| `map(fn)` | Transform the contained value if present |
| `ifPresent(consumer)` | Side effect if present |

> ⚠️ **Golden Rule:** `Optional` is designed as a return type only. Never use it as a field type — it adds overhead and breaks serialisation. Never use it as a method parameter — that shifts the null-check burden onto the caller. Use `null` internally; expose `Optional` at the API boundary where absence is a meaningful outcome.

In Spring Boot, the standard repository signature is `Optional<User> findById(Long id)`. The idiomatic pattern: `repo.findById(id).orElseThrow(() -> new UserNotFoundException(id))` — concise, explicit, and the global handler converts the exception to a `404`.

---

<a id="ch20"></a>
## Chapter 20 — Annotations

Frameworks need a way to attach metadata to your code: "this method is a unit test," "this class is a REST controller," "this field maps to the `email` column." The alternatives are XML configuration files (verbose, disconnected from the code they describe) or magic naming conventions (fragile, invisible). Annotations solve this cleanly.

An annotation is a small piece of metadata attached directly to a class, method, or field. The compiler stores it in the bytecode. Tools and frameworks read it at build time or at runtime via reflection. The annotation itself does nothing — it is a tag that other code looks for and acts on.

```java
// Using built-in annotations
@Deprecated          // compiler warns callers; should not use this method
public void oldMethod() { }

@Override            // compiler verifies the parent has this method signature
public String toString() { return "User{...}"; }

@SuppressWarnings("unchecked") // suppress specific compiler warning
public void riskyMethod() { }
```

You can write your own:

```java
@Retention(RetentionPolicy.RUNTIME) // keep in bytecode and load at runtime (frameworks need this)
@Target(ElementType.METHOD)          // can only be placed on methods
public @interface Audited {
    String value() default "";       // optional attribute with default
}

// Using it
@Audited("user-login")
public void login(String email) { }
```

The three retention policies:
- `SOURCE` — discarded after compilation. `@Override` is `SOURCE`.
- `CLASS` (default) — in the `.class` file but not loaded into the JVM.
- `RUNTIME` — available to reflection. This is what frameworks need.

In Spring Boot, annotations are the configuration language. `@RestController` is read by the component scanner. `@GetMapping` is read by the MVC dispatcher servlet. `@PathVariable` is read by the argument resolver. `@Transactional` is read by the AOP proxy weaver. None of these annotations do anything themselves — Spring's scanning code does the work after discovering them via reflection.

---

<a id="ch21"></a>
## Chapter 21 — Reflection: Inspecting Code at Runtime

Here is the problem that reflection solves. A framework loaded at runtime knows nothing about your classes. It cannot write `new UserService()` — it has never heard of `UserService` at compile time. Yet it must instantiate it, read its annotations, find its constructor parameters, discover what types those parameters are, and call its methods by name. Standard Java code can only work with types known at compile time. Reflection breaks that constraint.

The JVM exposes its own metadata as objects. Given a `Class<?>` object, you can list every field, method, constructor, and annotation — and invoke them dynamically. Code becomes data. Your classes become inspectable artefacts.

```java
// Standard reflection — you typically don't write this yourself
Class<?> cls = Class.forName("com.smitroy.service.UserService");
Object instance = cls.getDeclaredConstructor().newInstance();
Method method = cls.getMethod("findAll");
Object result = method.invoke(instance); // calls findAll() on the instance

// Reading annotations at runtime
for (Method m : cls.getDeclaredMethods()) {
    if (m.isAnnotationPresent(Audited.class)) {
        Audited audited = m.getAnnotation(Audited.class);
        System.out.println("Auditing method: " + m.getName() + " -> " + audited.value());
    }
}
```

Understanding this removes the magic from Spring entirely. Spring isn't reading minds. During startup, it calls `getDeclaredAnnotations()` on every class it finds during component scanning. It calls `getDeclaredConstructors()` to find the right constructor for injection. Jackson calls `getDeclaredFields()` to serialise your object to JSON. Hibernate calls field accessors to map columns. Reflection is the foundation every framework stands on.

The trade-off is real: reflective calls are slower than direct calls and bypass compile-time checks. Modern frameworks cache reflection results aggressively at startup — the steady-state performance is fine. But startup time is dominated by reflection, which is why "Spring Boot startup takes 4 seconds" on a large application.

> 💡 This is also why GraalVM Native Image improves startup so dramatically — it runs reflection at build time and replaces it with direct calls in the native binary.

---

## Part III — Concurrency Basics

A web server handles many requests at once. You don't write threads directly — Spring's container does. But you must understand what goes wrong when shared data meets two threads at the same instant. The bugs are silent, intermittent, and catastrophic.

---

<a id="ch22"></a>
## Chapter 22 — Threads & Runnable

Single-threaded code does one thing at a time. While it waits on a slow operation — a network call, a database query, a disk read — the CPU sits completely idle. A web server serving one user at a time while all others wait is not a web server; it's a bottleneck.

A thread is an independent path of execution within the same process. The OS schedules many of them; they share heap memory but each has its own call stack. Two threads can run two pieces of code simultaneously on separate CPU cores. A 16-core server can theoretically do 16 things at once — in practice, thread pools are sized much larger because most threads spend time waiting on I/O, not computing.

```java
// Creating and starting a thread manually
Runnable task = () -> {
    System.out.println("Running on: " + Thread.currentThread().getName());
};

Thread t = new Thread(task);
t.start(); // starts the thread; returns immediately — doesn't wait for completion

// Thread sleep (pauses the current thread — useful in demos, not production)
Thread.sleep(1000); // milliseconds
```

The hidden danger surfaces immediately with shared mutable state. `count++` looks atomic but is three operations: read the current value, add one, write it back. Thread A reads 5. Thread B reads 5 before A writes. Both write 6. One increment is lost. This is a **race condition**, and it's invisible in testing because timing non-determinism means it reproduces only under load.

In Spring Boot, you rarely create threads directly. Tomcat maintains a thread pool — by default up to 200 threads — and assigns one to each incoming HTTP request. Your controller and service methods run on threads you didn't create. The critical implication: anything stored in a shared singleton bean's field can be touched by all of those threads simultaneously.

---

<a id="ch23"></a>
## Chapter 23 — synchronized & volatile

Two separate problems require two separate tools. Conflating them is one of the most common concurrency mistakes.

**The atomicity problem:** Multi-step operations must complete uninterrupted. `count++` is three steps — if another thread reads between your read and your write, you have a race condition. `synchronized` wraps a block in a monitor lock. Only one thread holds the lock at a time; all others block. The block becomes effectively single-threaded, which eliminates the race.

**The visibility problem:** Modern CPUs cache variables in registers. Thread A increments a field. Thread B, running on a different core, may be reading a stale cached copy indefinitely. `volatile` marks a field as "always read from main memory, always flush writes to main memory immediately." It guarantees visibility across threads, but it does not make compound operations atomic.

```java
public class SharedState {
    private volatile boolean running = true; // visibility — reads and writes are always fresh
    private int count = 0;

    // synchronized — atomicity — only one thread at a time
    public synchronized void increment() {
        count++; // now the three steps are protected
    }

    public synchronized int getCount() {
        return count;
    }

    public void stop() {
        running = false; // write visible immediately to all threads
    }
}
```

| Need | Tool |
|---|---|
| Single flag or reference, no compound logic | `volatile` |
| Multi-step update, mutual exclusion | `synchronized` |
| High-performance counter (lock-free) | `AtomicInteger` |
| Thread-safe map | `ConcurrentHashMap` |

> ⚠️ **Golden Rule:** Don't synchronise everything "for safety." Putting `synchronized` on every public method of a service serialises all requests through that one bean — throughput drops to single-threaded. The cure is keeping services stateless: no mutable fields, no shared counters. State lives in the database, the cache, or the request scope — not in the bean itself.

In Spring Boot, singleton beans (`@Service`, `@Repository`, `@Controller`) are shared across all request threads. Stateless beans — those with only `private final` injected dependencies and no mutable fields — are inherently thread-safe. This is the recommended default. Reach for `synchronized` or `ConcurrentHashMap` only when you intentionally maintain state in a singleton.

---

<a id="ch24"></a>
## Chapter 24 — ExecutorService & Thread Pools

Creating a raw `new Thread()` per task is expensive. Each thread reserves roughly 1MB of stack memory plus OS scheduling overhead. Let an unbounded number of tasks spawn unbounded threads and you exhaust memory and crash the JVM. The real failure mode isn't slow performance — it's a hard crash under load.

Thread pools pre-create a bounded set of threads. Tasks are submitted and queued; available threads pick them up. The resources are bounded, the blast radius is bounded, and the overhead of thread creation is paid once at startup.

```java
// Fixed thread pool — good for CPU-bound work where you want to limit parallelism
ExecutorService pool = Executors.newFixedThreadPool(4);

// Submit a task and get a Future handle
Future<Integer> future = pool.submit(() -> {
    Thread.sleep(1000);
    return computeSomething();
});

// future.get() blocks the calling thread until the task completes
int result = future.get(); // blocks; throws ExecutionException on task failure

pool.shutdown(); // stop accepting new tasks
pool.awaitTermination(30, TimeUnit.SECONDS); // wait for in-flight tasks
```

`CompletableFuture` (Java 8+) adds composition — chaining async steps without blocking:

```java
CompletableFuture.supplyAsync(() -> fetchUser(id))        // runs on ForkJoinPool
    .thenApply(user -> buildDto(user))                    // transform
    .thenAccept(dto -> log.info("Built: {}", dto))        // side effect
    .exceptionally(ex -> { log.error("Failed", ex); return null; }); // error handling
```

In Spring Boot, `@Async` on a method tells Spring to run it on a managed `ThreadPoolTaskExecutor`. You configure the pool size via `spring.task.execution.pool.core-size`. This is the standard pattern for fire-and-forget background work — sending welcome emails, generating PDF reports, triggering notifications — without blocking the request thread.

---

## Part IV — Bridge to Spring Boot

Spring Boot did not invent talking to databases or wiring objects together. It automates patterns that already existed. To stop being afraid of Spring's magic, you have to first see what it replaced — raw JDBC, manual `new`-ing, scattered XML configuration. After that, Spring stops being magic and starts being a build tool.

---

<a id="ch25"></a>
## Chapter 25 — JDBC: Java's Database Protocol

Every relational database speaks its own wire protocol. MySQL's is different from PostgreSQL's is different from Oracle's. If your code knew about MySQL's protocol directly, switching databases would mean rewriting everything database-related in your application.

JDBC (Java Database Connectivity) is the abstraction layer. It defines a standard set of Java interfaces — `Connection`, `PreparedStatement`, `ResultSet` — and every database vendor ships a driver (a JAR) that implements these interfaces against their own protocol. Your code uses only the standard interfaces. Swap the driver JAR and change the connection URL, and the same code talks to a different database. No application changes.

The five-step JDBC flow is the same for every database interaction:

Get Connection → 2. Prepare Statement → 3. Bind Parameters → 4. Execute → 5. Close


```java
String url = "jdbc:postgresql://localhost:5432/staygridsdb";
String sql = "SELECT name, email FROM users WHERE id = ?";

try (Connection conn = DriverManager.getConnection(url, "user", "password");
     PreparedStatement ps = conn.prepareStatement(sql)) {

    ps.setLong(1, 42L); // bind the parameter by position (1-indexed)

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            String name  = rs.getString("name");
            String email = rs.getString("email");
            System.out.println(name + " — " + email);
        }
    }
} // try-with-resources automatically closes ResultSet, PreparedStatement, Connection
```

> ⚠️ **Golden Rule:** Always use `PreparedStatement`, never `Statement` with string concatenation. Concatenating user input into SQL is SQL injection — the user types `' OR 1=1 --` and reads your entire database. `PreparedStatement` uses `?` placeholders; values are bound as data, never parsed as SQL. There are no legitimate exceptions to this rule.

In Spring Boot, you rarely write raw JDBC. `JdbcTemplate` wraps the boilerplate; Spring Data JPA goes further and generates SQL from method names. But everything sits on JDBC underneath. When something breaks deep in the stack — connection leaks, driver bugs, query timeouts — you read JDBC stack traces. Knowing this layer is non-negotiable.

---

<a id="ch26"></a>
## Chapter 26 — Connection Pooling

Opening a database connection is not free. A TCP handshake, TLS negotiation, and database authentication add up to 50–200 milliseconds per connection. If every HTTP request opens and closes its own connection, the database handshake is the bottleneck before the second user even shows up. A 10ms query padded with 100ms of connection overhead is a 10x slowdown you're paying unconditionally.

Connection pooling keeps N connections open and reusable. Each HTTP request "borrows" a connection from the pool, uses it, and returns it when done. The next request picks up the same connection in sub-millisecond time. The database sees a stable, bounded number of connections regardless of how many requests per second are arriving.
               ┌──────────────────────────────┐
HTTP Thread 1 ────►│  Connection Pool (max: 20)   │────► Database
HTTP Thread 2 ────►│  ○ ● ● ○ ○ ● ○ ○ ● ● ...   │
HTTP Thread 3 ────►│  ○=idle  ●=in use            │
HTTP Thread N ────►└──────────────────────────────┘

```yaml
# application.yml — HikariCP configuration (Spring Boot's default pool)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/staygriddb
    username: ${DB_USER}
    password: ${DB_PASS}
    hikari:
      maximum-pool-size: 20         # max concurrent connections
      minimum-idle: 5               # connections kept warm when idle
      connection-timeout: 30000     # ms to wait for a connection before throwing
      idle-timeout: 600000          # ms an idle connection is kept before closing
      max-lifetime: 1800000         # max lifetime of a connection in the pool
```

> ⚠️ **Golden Rule:** The most common production disaster with connection pools: code that holds a connection too long — a long `@Transactional` method that calls an external HTTP service mid-transaction. All 20 connections are borrowed and waiting. New requests queue. The queue fills. The application freezes. The fix: keep transactions short and don't call external services inside a transaction.

In Spring Boot, HikariCP is wired automatically the moment you add `spring-boot-starter-data-jpa` or `spring-boot-starter-jdbc`. You get a pool without writing a single line of pool configuration — though you should always tune `maximum-pool-size` based on your database server's connection limit.

---

<a id="ch27"></a>
## Chapter 27 — JPA & Hibernate: The ORM Concept

Raw JDBC is verbose in a very specific way. For every entity, you write `SELECT` queries and parse `ResultSet` columns into fields. You write `INSERT` and `UPDATE` statements and map fields back to columns. You manually manage associations — a user has many orders, and you join them yourself. 80% of database code is mechanical translation between the relational world and the object world.

Object-Relational Mapping (ORM) eliminates that translation layer. You declare classes that mirror tables, annotate the mapping, and the ORM library generates the SQL for CRUD operations and converts rows back to objects. You think in Java objects; the ORM thinks in SQL.

JPA is the specification — a set of interfaces and annotations that define how ORM should work in Java. Hibernate is the implementation — the library that actually generates and executes the SQL. Spring Boot's default JPA provider is Hibernate.

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB auto-increments the id
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING) // store "ACTIVE", not 0
    private UserStatus status;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Order> orders; // lazy — only loaded when accessed

    // getters, setters, equals/hashCode on business key (email)
}
```

Four concepts that separate developers who understand JPA from those who fight it:

| Concept | What it means |
|---|---|
| `EntityManager` | The runtime object that talks to the database. Manages a session. |
| Persistence context | The EntityManager's in-memory cache of loaded entities. Changes are tracked. |
| Managed vs detached | Managed: tracked — mutations auto-flush to DB. Detached: outside context — mutations are pure Java. |
| Lazy vs eager | Lazy loads on first access. Eager loads immediately. Lazy is correct most of the time. |

> ⚠️ **Golden Rule:** The N+1 problem is the most expensive JPA mistake. You load 100 users (1 query). You iterate and access `user.getOrders()` on each — that triggers 100 additional queries, one per user. 101 queries to display one page. The fix: `JOIN FETCH` in a JPQL query, or a `@EntityGraph`. Always log SQL in development — `spring.jpa.show-sql=true` — and watch for repeated queries.

In Spring Boot, Spring Data JPA goes one layer higher. You declare an interface and Spring generates the implementation at startup:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // Spring generates: SELECT * FROM users WHERE email = ?
    List<User> findByStatusOrderByCreatedAtDesc(UserStatus status); // generated from method name
    
    @Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
    Optional<User> findByIdWithOrders(@Param("id") Long id); // custom JPQL — avoids N+1
}
```

---

<a id="ch28"></a>
## Chapter 28 — Maven & the JAR: How Java Code Ships

A real Java application uses 50 or more libraries — a web server, JSON serialiser, database driver, logging framework, validation library. Each has its own version. Many depend on other libraries, which depend on others. Manually downloading JARs and putting them on the classpath is reproducible only by luck. "Works on my machine" is the daily state.

Maven is a build tool with a declarative dependency model. You describe what you need in a `pom.xml` — group ID, artifact ID, version. Maven downloads those libraries, plus their transitive dependencies, from Maven Central. The same `pom.xml` produces an identical build on your machine, your colleague's machine, and the CI server. The JAR you produce is the deployable unit.

```xml
<!-- pom.xml — declaring a dependency -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- version managed by spring-boot-starter-parent — no version needed here -->
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope> <!-- only needed at runtime, not compile time -->
</dependency>
```

The three packaging formats:

| Format | What it is |
|---|---|
| JAR | A zip of compiled `.class` files + resources. The unit of a library. |
| Fat (uber) JAR | Your code + all dependency classes bundled into one JAR. Spring Boot's `java -jar app.jar` uses this. |
| WAR | Web Archive. Deploy into a separate Tomcat. Rarely needed for Spring Boot. |

```bash
mvn clean package          # compile + run tests + produce JAR in target/
mvn spring-boot:run        # run without packaging — fast for development
mvn dependency:tree        # inspect the full transitive dependency graph
mvn clean package -DskipTests  # package without running tests (CI shortcut)
```

In Spring Boot, "starters" (`spring-boot-starter-web`, `-data-jpa`, `-security`) are curated dependency bundles. Adding one starter pulls in 10–30 transitively correct, version-compatible dependencies. `spring-boot-starter-parent` manages all Spring ecosystem versions coherently. This is why `spring init` projects just work — the dependency puzzle was solved once and encoded in the starter.

---

<a id="ch29"></a>
## Chapter 29 — Dependency Injection: The Concept

A class that constructs its own collaborators is welded to that specific implementation. `this.repo = new UserRepository()` inside the constructor means you cannot swap `UserRepository` for a mock in tests without changing the class. You cannot swap it for a different implementation in a different environment. The class made a decision it wasn't qualified to make.

Dependency injection inverts this. Instead of constructing collaborators, a class declares what kind it needs — specifically, what interface it requires — and receives a concrete instance from outside. The class knows what it needs; someone else decides which specific implementation to provide. This separates "what an object does" from "what objects it depends on," and the second decision becomes configurable, testable, and swappable.

```java
// BEFORE: welded — impossible to test without a real database
class UserService {
    private UserRepository repo = new UserRepository(); // hardcoded
    
    public User find(Long id) { return repo.findById(id); }
}

// AFTER: injected — the dependency is received, not created
class UserService {
    private final UserRepository repo; // declare what you need

    UserService(UserRepository repo) { // receive it via constructor
        this.repo = repo;
    }

    public User find(Long id) { return repo.findById(id).orElseThrow(); }
}

// In a test — inject a mock, no Spring needed
UserRepository mockRepo = Mockito.mock(UserRepository.class);
Mockito.when(mockRepo.findById(1L)).thenReturn(Optional.of(testUser));
UserService service = new UserService(mockRepo); // plain Java — no framework
```

The three injection styles, and when to use each:

| Style | How | When |
| --- | --- | --- |
| **Constructor** | Dependencies as constructor parameters | **Preferred.** Final fields, fails fast if missing, easy to test. |
| **Setter** | Setter methods called after construction | Only for optional dependencies. |
| **Field (`@Autowired`)** | Direct field injection | Avoid. Bypasses immutability, complicates testing. |

### How Spring Builds the Dependency Graph

```text
UserController
      │
      ▼
UserService
      │
      ▼
UserRepository
      │
      ▼
DataSource
      ▲
      │
HikariCP Connection Pool (Bean)
```

Or, in a single-line dependency chain:

```text
UserController
    └── needs → UserService
                 └── needs → UserRepository
                              └── needs → DataSource
                                           ▲
                                           │
                               HikariCP Pool is also a Spring Bean
```

In Spring Boot, `@Service`, `@Repository`, `@Controller` tell Spring to register these as beans. At startup, Spring walks each bean's constructor, matches parameters to available beans, and instantiates them in dependency order — leaves first, then what depends on them. The result is one fully-assembled object graph in the `ApplicationContext`. Your code never writes `new`. That's the magic, demystified.

![Dependency Injection container diagram: Spring walking the dependency graph, instantiating beans bottom-up](/images/blogs/internals/dependency-injection-container-graph.png)

---

<a id="ch30"></a>
## Chapter 30 — Inversion of Control & the Container

Traditional control flow: your code is in charge. It calls libraries when it needs them, builds its own dependencies, drives its own lifecycle. You write a `main` method, it calls `new UserService()`, `new OrderService()`, and tells them what to do.

Inversion of Control flips this. The framework is in charge. It builds the objects, calls your code at the right moments, manages the lifecycle. Your code is called — it doesn't drive. This is the Hollywood Principle: "Don't call us, we'll call you." Dependency Injection is one mechanism that implements IoC specifically for the "who constructs whom" question. The Spring container — technically the `ApplicationContext` — is the runtime that executes it.

The full bean lifecycle in one breath:

Application starts
└─► Spring reads configuration (annotations on the classpath, application.yml)
Component scan
└─► Finds every class annotated with @Component, @Service, @Repository, @Controller
Dependency resolution
└─► For each bean, inspects the constructor
└─► Builds a topological ordering (leaves first)
Instantiation
└─► Instantiates beans bottom-up, injecting collaborators into constructors
Post-construction
└─► Calls any @PostConstruct methods (cache warmup, validation, startup tasks)
Application ready
└─► Beans are live; HTTP requests start flowing
└─► Each request uses the already-built, shared singleton beans
Shutdown
└─► Calls @PreDestroy methods
└─► Closes pools, flushes caches, releases resources


Bean scopes — the two you'll actually use:

| Scope | Behaviour | When |
|---|---|---|
| `singleton` (default) | One instance per container, shared across all threads | Stateless services, repositories, controllers |
| `prototype` | New instance every time the bean is requested | Stateful per-use objects |

```java
@Service // registered as singleton bean
public class UserService {
    private final UserRepository repo;    // injected once — never null
    private final EmailService email;     // injected once — never null

    // Spring calls this constructor exactly once at startup
    public UserService(UserRepository repo, EmailService email) {
        this.repo = repo;
        this.email = email;
    }

    @PostConstruct
    public void init() {
        log.info("UserService ready"); // runs after construction, before first request
    }

    @PreDestroy
    public void cleanup() {
        log.info("UserService shutting down"); // runs on graceful shutdown
    }
}
```

You can now read Spring Boot code from first principles. `@RestController` is an annotation (Chapter 20). The controller's dependencies are constructor-injected (Chapter 9). The repository is an interface (Chapter 6). It returns `Optional<User>` (Chapter 19). The service might call `.stream().map().toList()` (Chapter 18). Spring loads beans via reflection (Chapter 21). Errors become 404s through a `@RestControllerAdvice` (Chapter 16). Database access is JDBC underneath (Chapter 25). And the container ties it all together (this chapter). None of it is magic. It is assembled Java.

---

## Key Takeaways

**Part I — Object-Oriented Java**
- A class is a blueprint; an object is one instance on the heap. A variable holds a reference (address), not the object itself.
- Encapsulation is about controlling access via rules-enforcing methods, not just relabelling private fields with public setters.
- Inherit only for true "is-a" relationships. Prefer composition for code reuse.
- Polymorphism works via vtable dispatch — the JVM consults the actual object's class, not the variable's declared type.
- Abstract classes: shared code + forced contract. Interfaces: contract only, multiple allowed. Default to interface.
- `static` belongs to the class; `final` prevents reassignment or extension. Constructor-injected dependencies should always be `private final`.
- Start `private`, loosen only when forced. Package-private is underused.
- Constructors must produce fully valid objects. No real work inside them.
- Override both `equals` and `hashCode` or neither. For DTOs, use `record`.
- Chains of `instanceof` are a sign to use polymorphism instead.

**Part II — Type System & Modern Java**
- Generics shift errors from runtime to compile time. Type erasure means generics are gone at runtime — you cannot do `new T()` or `instanceof List<String>`.
- PECS: Producer Extends, Consumer Super.
- Pick the right collection for the access pattern. Never use mutable objects as `HashMap`/`HashSet` keys.
- `Comparable`: natural order baked into the class. `Comparator`: external, on-demand, multiple allowed.
- Always `@Enumerated(EnumType.STRING)` — never `ORDINAL`.
- Prefer unchecked exceptions. Never swallow exceptions silently. Use `@RestControllerAdvice` for global handling.
- Lambdas are instances of functional interfaces. The four essentials: `Function`, `Predicate`, `Consumer`, `Supplier`.
- Intermediate stream operations are lazy; only the terminal triggers execution. Ask whether aggregation belongs in SQL, not Java.
- `Optional` is a return type — not a field type, not a parameter type.
- Annotations are metadata; reflection is the mechanism that acts on them. Retention must be `RUNTIME` for frameworks to see them.

**Part III — Concurrency**
- Spring's Tomcat runs up to 200 threads simultaneously. Anything in a singleton bean's field is shared across all of them.
- `volatile` = visibility. `synchronized` = atomicity. Never conflate them.
- Keep services stateless. State belongs in the database or cache, not in singleton fields.
- Use thread pools (`ExecutorService`), not raw `Thread` creation. Use `@Async` for fire-and-forget background work.

**Part IV — Bridge to Spring Boot**
- JDBC is the universal database abstraction layer. Always use `PreparedStatement` — never string concatenation.
- HikariCP is the default pool. Keep transactions short. Never call external HTTP services inside a `@Transactional` method.
- JPA: entity → table, managed entity mutations auto-flush. Lazy is correct for associations by default. Watch for N+1 — log SQL in development.
- Maven declares what you need; the fat JAR bundles everything into one deployable file.
- Constructor injection is the only recommended DI style. `private final` fields, never null, testable without Spring.
- IoC: the framework calls your code, not the other way around. Beans are singletons, instantiated once at startup via reflection. That's all the magic there is.

---

*You don't know Spring Boot — you know what it was built from: Java. And now, finally, so do you.*