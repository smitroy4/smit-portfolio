## From Absolute Zero to Java Expert — Core & Advanced, A to Z

> *Java has been declared "dead" by some blog post every year since 2005. It now powers more production backend systems than almost any other language on Earth — banks, e-commerce platforms, Android, half the Fortune 500's internal tooling, and the JVM ecosystem that Kotlin and Scala themselves run on. This handbook teaches you Java the way the engineers who built the JVM think about it — not just syntax, but the machinery underneath.*

This is a reference handbook, not a single sitting read. Bookmark it. Come back to it. Every concept builds on the one before it — work through it in order the first time, then use the table of contents to jump back in later.

---
---

<a id="ch1"></a>
## Chapter 1 — What Java Actually Is: JVM, JRE, JDK

Before writing a single line of Java, you need the one idea that explains almost everything else about the language: **"Write Once, Run Anywhere."**

```
Your .java file (source code)
        │
        ▼
   [ Compiler: javac ]
        │
        ▼
  .class file (BYTECODE — not machine code!)
        │
        ▼
┌──────────────────────────────────────────┐
│   JVM (Java Virtual Machine)              │
│   — different JVM for Windows/Mac/Linux,  │
│     but bytecode itself never changes     │
└──────────────────────────────────────────┘
        │
        ▼
  Native machine code, executed by the OS
```

Unlike C, which compiles directly to machine code for one specific operating system, Java compiles to an intermediate format called **bytecode**. Any machine with a JVM installed can run that exact same `.class` file — that's the "write once, run anywhere" promise.

### JDK vs JRE vs JVM — The Distinction Everyone Mixes Up

| | What it is | Contains |
|---|---|---|
| **JVM** (Java Virtual Machine) | The engine that actually executes bytecode | Just the runtime execution engine |
| **JRE** (Java Runtime Environment) | Everything needed to *run* Java programs | JVM + core libraries (`java.lang`, `java.util`, etc.) |
| **JDK** (Java Development Kit) | Everything needed to *develop* Java programs | JRE + compiler (`javac`) + debugger + dev tools |

```
┌─────────────────────────────────────────┐
│ JDK (Java Development Kit)               │
│  ┌─────────────────────────────────┐    │
│  │ JRE (Java Runtime Environment)   │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │ JVM (Java Virtual        │    │    │
│  │  │      Machine)            │    │    │
│  │  └─────────────────────────┘    │    │
│  │  + Core Libraries (java.util...) │    │
│  └─────────────────────────────────┘    │
│  + javac (compiler), jdb (debugger)      │
└─────────────────────────────────────────┘
```

If you're writing Java code, you install the **JDK**. If you're only running an already-compiled Java application, the **JRE** alone is technically sufficient (though modern tooling usually just gives you the full JDK regardless).

---

<a id="ch2"></a>
## Chapter 2 — Your First Program & How It Runs

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Let's dissect every single token, because each one teaches a rule:

| Token | Meaning |
|---|---|
| `public` | This class is accessible from anywhere |
| `class HelloWorld` | Defines a class — the file **must** be named `HelloWorld.java` |
| `public static void main(String[] args)` | The entry point — JVM looks for exactly this signature to start execution |
| `static` | Belongs to the class itself, not to an instance — so JVM can call it without creating an object first |
| `void` | Returns nothing |
| `String[] args` | Command-line arguments, passed in as an array of strings |
| `System.out.println(...)` | `System` is a class, `out` is a static `PrintStream` field on it, `println` prints with a trailing newline |

### Compiling and Running

```bash
javac HelloWorld.java   # produces HelloWorld.class (bytecode)
java HelloWorld          # JVM loads the .class file and executes main()
```

---

<a id="ch3"></a>
## Chapter 3 — Variables, Data Types & Literals

Java is **statically typed** — every variable's type is fixed at compile time, and the compiler catches type mismatches before your program ever runs. This is a deliberate trade-off: more upfront ceremony, far fewer runtime surprises.

### The Eight Primitive Types

```java
byte    b = 127;            // 8-bit,  -128 to 127
short   s = 32000;          // 16-bit, -32,768 to 32,767
int     i = 2_000_000;      // 32-bit (underscore is just a readability separator)
long    l = 9_000_000_000L; // 64-bit — note the required 'L' suffix
float   f = 3.14f;          // 32-bit decimal — note the required 'f' suffix
double  d = 3.14159;        // 64-bit decimal — the default for decimal literals
char    c = 'A';            // single 16-bit Unicode character
boolean flag = true;        // true or false, nothing else
```

| Type | Size | Default Value | Range (approx) |
|---|---|---|---|
| `byte` | 8 bits | 0 | -128 to 127 |
| `short` | 16 bits | 0 | -32,768 to 32,767 |
| `int` | 32 bits | 0 | ±2.1 billion |
| `long` | 64 bits | 0L | ±9.2 quintillion |
| `float` | 32 bits | 0.0f | ~7 decimal digits precision |
| `double` | 64 bits | 0.0 | ~15 decimal digits precision |
| `char` | 16 bits | '\u0000' | single Unicode character |
| `boolean` | JVM-dependent | false | true / false |

> ⚠️ **Golden Rule:** primitives are **not objects** — they live directly on the stack (for local variables), have no methods, and can never be `null`. This is the single biggest conceptual difference from languages like Python or JavaScript where "everything is an object."

### Reference Types — Everything Else

```java
String name = "Smit";          // String is a class, not a primitive
int[] numbers = {1, 2, 3};     // arrays are objects
Employee emp = new Employee(); // your own classes
```

Reference type variables don't hold the object itself — they hold a **reference** (essentially a memory address) pointing to an object that lives on the heap.

```
Stack                    Heap
┌─────────────┐         ┌──────────────────┐
│ emp ────────┼────────▶│ Employee object   │
└─────────────┘         │ name: "Smit"      │
                         │ salary: 85000     │
                         └──────────────────┘
```

### Autoboxing & Unboxing

```java
int primitive = 10;
Integer boxed = primitive;        // autoboxing — int automatically wrapped into Integer
int unboxed = boxed;              // unboxing — Integer automatically unwrapped back to int

// Wrapper classes for every primitive:
// int → Integer, double → Double, boolean → Boolean, char → Character, etc.
```

> ⚠️ **The classic `Integer` comparison trap:**
```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);   // true — Java caches Integer objects from -128 to 127

Integer c = 200;
Integer d = 200;
System.out.println(c == d);   // false — outside the cache range, these are different objects!

// Always use .equals() for wrapper class value comparison, never ==
System.out.println(c.equals(d));  // true — correct, always
```

---

<a id="ch4"></a>
## Chapter 4 — Operators

```java
// Arithmetic
int sum = 5 + 3, diff = 5 - 3, product = 5 * 3, quotient = 5 / 3, remainder = 5 % 3;

// Relational
boolean isEqual = (5 == 3);       // false
boolean notEqual = (5 != 3);      // true

// Logical
boolean and = (true && false);    // false — short-circuits: won't evaluate right side if left is false
boolean or = (true || false);     // true — short-circuits: won't evaluate right side if left is true

// Bitwise
int and_bits = 5 & 3;             // 0101 & 0011 = 0001 = 1
int or_bits  = 5 | 3;             // 0101 | 0011 = 0111 = 7
int xor_bits = 5 ^ 3;             // 0101 ^ 0011 = 0110 = 6
int leftShift = 5 << 1;           // 10 — shifts bits left, multiplies by 2
int rightShift = 5 >> 1;          // 2  — shifts bits right, divides by 2

// Ternary — compact if/else
int max = (a > b) ? a : b;

// Compound assignment
int x = 10;
x += 5;  // x = x + 5
```

> 💡 **`&&`/`||` vs `&`/`|` for booleans:** `&&` and `||` are **short-circuit** operators — if the result is already determined by the left side, the right side isn't even evaluated. `&` and `|` always evaluate both sides. This matters when the right side has a side effect:

```java
// Safe — if user is null, the && short-circuits and never calls user.isActive()
if (user != null && user.isActive()) { ... }

// Dangerous — & always evaluates BOTH sides, even if user is null → NullPointerException
if (user != null & user.isActive()) { ... }
```

---

<a id="ch5"></a>
## Chapter 5 — Control Flow: Conditionals & Loops

```java
// if / else if / else
if (score >= 90) {
    grade = "A";
} else if (score >= 75) {
    grade = "B";
} else {
    grade = "C";
}

// switch statement (traditional)
switch (day) {
    case 1:
        dayName = "Monday";
        break;        // without break, execution "falls through" to the next case!
    case 2:
        dayName = "Tuesday";
        break;
    default:
        dayName = "Unknown";
}

// switch expression (modern, Java 14+) — see Chapter 27 for full depth
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    default -> "Unknown";
};
```

### Loops

```java
// for loop — when you know the iteration count
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// while loop — when the condition is checked BEFORE each iteration
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}

// do-while — runs the body at LEAST once, condition checked AFTER
int j = 0;
do {
    System.out.println(j);
    j++;
} while (j < 5);

// enhanced for-each loop — iterating over collections/arrays directly
int[] numbers = {1, 2, 3};
for (int n : numbers) {
    System.out.println(n);
}

// break and continue
for (int k = 0; k < 10; k++) {
    if (k == 5) break;       // exits the loop entirely
    if (k % 2 == 0) continue; // skips to the next iteration
    System.out.println(k);
}
```

---

<a id="ch6"></a>
## Chapter 6 — Arrays

An array is a **fixed-size**, ordered collection of elements of the same type, stored contiguously in memory.

```java
int[] numbers = new int[5];          // creates an array of 5 ints, all defaulted to 0
int[] filled = {10, 20, 30, 40, 50}; // array literal — size inferred

numbers[0] = 100;                     // zero-indexed
System.out.println(numbers.length);   // .length is a FIELD, not a method (no parentheses!)

// Multi-dimensional arrays
int[][] grid = new int[3][3];
grid[0][0] = 1;

int[][] jagged = {
    {1, 2},
    {3, 4, 5},     // jagged arrays can have rows of different lengths
    {6}
};
```

> ⚠️ **Golden Rule:** array size is **fixed at creation**. You cannot resize a Java array — if you need a growable collection, use `ArrayList` (Chapter 19) instead, which is internally backed by an array that gets reallocated as needed.

```java
// Common array utilities (java.util.Arrays)
import java.util.Arrays;

int[] arr = {5, 2, 8, 1};
Arrays.sort(arr);                          // sorts in place: [1, 2, 5, 8]
System.out.println(Arrays.toString(arr));  // proper string representation: [1, 2, 5, 8]
int[] copy = Arrays.copyOf(arr, 10);       // copies into a larger array, padding with 0s
```

---

<a id="ch7"></a>
## Chapter 7 — Strings: Deep Dive

Strings are the most-used class in Java, and also the source of one of its most important performance lessons.

```java
String s1 = "Hello";              // string literal
String s2 = new String("Hello");  // explicitly creates a new object on the heap

System.out.println(s1 == s2);         // false — different objects in memory
System.out.println(s1.equals(s2));    // true — same content
```

### The String Pool

String literals are stored in a special memory region called the **String Pool**, and Java reuses identical literals automatically.

```java
String a = "Java";
String b = "Java";
System.out.println(a == b);  // true! Both point to the SAME pooled object

String c = new String("Java");
System.out.println(a == c);  // false — new String() forces a separate heap object
```

```
String Pool (part of heap, Java 7+)
┌─────────────┐
│   "Java"    │◄──── a
│             │◄──── b   (both reference the SAME pooled string)
└─────────────┘

Regular Heap
┌─────────────┐
│   "Java"    │◄──── c   (a separate object, even though content matches)
└─────────────┘
```

### Strings Are Immutable — And Why That Matters

```java
String name = "Smit";
name.concat(" Roy");          // does NOT modify 'name' — returns a NEW string that's discarded here!
System.out.println(name);     // still prints "Smit"

name = name.concat(" Roy");   // you must REASSIGN to capture the new string
System.out.println(name);     // now prints "Smit Roy"
```

Every "modifying" String method (`concat`, `replace`, `substring`, `toUpperCase`...) actually returns a **brand new** String object, leaving the original untouched. This immutability is deliberate — it makes Strings inherently thread-safe and allows safe string pooling, but it has a real performance cost in loops.

```java
// BAD — creates a new String object on every single iteration (10,000 throwaway objects!)
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i;  // each += silently does: result = new String(result + i)
}

// GOOD — StringBuilder mutates an internal buffer in place, no throwaway objects
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

> 💡 **`StringBuilder` vs `StringBuffer`:** identical API, but `StringBuffer` is `synchronized` (thread-safe, slower) and `StringBuilder` is not (faster, single-threaded use). Default to `StringBuilder` unless you specifically need thread safety on the builder itself.

### Common String Methods

```java
String s = "  Hello, Java World!  ";

s.length();              // 23
s.trim();                 // removes leading/trailing whitespace
s.toUpperCase();           // "  HELLO, JAVA WORLD!  "
s.toLowerCase();
s.charAt(2);               // 'H'
s.indexOf("Java");          // position of first match, or -1
s.contains("World");        // true
s.replace("Java", "Kotlin");
s.split(",");               // splits into a String[]
s.substring(2, 7);          // "Hello"
String.valueOf(42);          // converts other types TO String
Integer.parseInt("42");       // converts String TO int
```

---

<a id="ch8"></a>
## Chapter 8 — Methods & Parameter Passing

```java
public int add(int a, int b) {
    return a + b;
}

// Method overloading — same name, different parameter lists
public int add(int a, int b, int c) { return a + b + c; }
public double add(double a, double b) { return a + b; }

// Varargs — accept any number of arguments
public int sum(int... numbers) {
    int total = 0;
    for (int n : numbers) total += n;
    return total;
}
sum(1, 2, 3, 4, 5); // works with any count, including zero
```

### Java Is Always Pass-By-Value — Even For Objects

This is one of the most misunderstood concepts in Java, and it trips up developers coming from languages with explicit reference semantics.

```java
public void reassign(Employee emp) {
    emp = new Employee("Different Name");  // only changes the LOCAL copy of the reference
}

public void mutate(Employee emp) {
    emp.setName("Changed");  // changes the ACTUAL object the reference points to
}

Employee e = new Employee("Smit");
reassign(e);
System.out.println(e.getName());  // still "Smit" — reassignment inside the method didn't affect the caller

mutate(e);
System.out.println(e.getName());  // "Changed" — the object itself was modified, visible everywhere
```

**The precise mental model:** for objects, Java passes a *copy of the reference* (the memory address), not the object itself. You can use that copied reference to reach into the object and mutate its fields — those changes are visible to the caller. But if you reassign the parameter to point somewhere else entirely, that only affects your local copy of the reference, not the caller's original variable.

```
Caller's stack          Method's stack          Heap
┌─────────┐             ┌─────────┐
│ e ──────┼───┐     ┌───┼─ emp    │
└─────────┘   │     │   └─────────┘
              ▼     ▼
         ┌──────────────────┐
         │  Employee object  │   ← both 'e' and 'emp' point HERE
         │  name: "Smit"     │      (two separate variables, same object)
         └──────────────────┘
```

---

<a id="ch9"></a>
## Chapter 9 — Classes & Objects

A **class** is a blueprint. An **object** is an actual instance built from that blueprint, living on the heap.

```java
public class Employee {
    // Fields (instance state)
    private String name;
    private double salary;

    // Methods (behavior)
    public void giveRaise(double amount) {
        this.salary += amount;
    }

    public double getSalary() {
        return salary;
    }
}

// Creating objects (instances)
Employee emp1 = new Employee();
Employee emp2 = new Employee();
// emp1 and emp2 are two SEPARATE objects, each with their own independent state
```

`this` refers to the current instance — it's used to distinguish a field from a same-named parameter, and is implicitly available in every non-static method.

### Instance vs Static Members

```java
public class Employee {
    private String name;              // instance field — each object has its own copy
    private static int totalCount = 0; // static field — ONE shared copy across ALL objects

    public Employee(String name) {
        this.name = name;
        totalCount++;   // every new Employee increments the SAME shared counter
    }

    public static int getTotalCount() {  // static method — callable without an instance
        return totalCount;
    }
}

Employee.getTotalCount();  // called on the CLASS, not an instance
```

```
              Class-level (static) memory
              ┌─────────────────────┐
              │  totalCount = 3      │  ← ONE copy, shared
              └─────────────────────┘
                        ▲
        ┌───────────────┼───────────────┐
        │                │               │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ emp1: "Smit"  │ │ emp2: "Raj"   │ │ emp3: "Ana"   │   ← each has its OWN name
└──────────────┘ └──────────────┘ └──────────────┘
```

---

<a id="ch10"></a>
## Chapter 10 — Constructors

A constructor initializes a newly created object. It shares the class's name and has no return type — not even `void`.

```java
public class Employee {
    private String name;
    private double salary;

    // No-arg (default) constructor
    public Employee() {
        this.name = "Unnamed";
        this.salary = 0.0;
    }

    // Parameterized constructor
    public Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }

    // Constructor chaining with this(...)
    public Employee(String name) {
        this(name, 50000.0);   // delegates to the two-arg constructor above
    }
}
```

> ⚠️ **Golden Rule:** if you define **any** constructor yourself, Java no longer generates the free no-arg constructor automatically. If you still need a no-arg constructor, you must write it explicitly.

### Constructor Execution Order (Including Inheritance)

```java
class Animal {
    public Animal() {
        System.out.println("Animal constructor");
    }
}

class Dog extends Animal {
    public Dog() {
        super();  // implicit if omitted — ALWAYS runs the parent constructor first
        System.out.println("Dog constructor");
    }
}

new Dog();
// Output:
// Animal constructor   ← parent ALWAYS initializes first
// Dog constructor
```

---

<a id="ch11"></a>
## Chapter 11 — The Four Pillars of OOP

Everything in object-oriented Java rests on four ideas. Chapters 12–15 cover each in full depth — here's the map:

| Pillar | One-Line Definition |
|---|---|
| **Encapsulation** | Bundling data and the methods that operate on it, hiding internal state behind a controlled interface |
| **Inheritance** | A class acquiring fields and behavior from a parent class |
| **Polymorphism** | The same method call behaving differently depending on the actual object's runtime type |
| **Abstraction** | Exposing only essential behavior, hiding implementation complexity behind a simpler contract |

---

<a id="ch12"></a>
## Chapter 12 — Inheritance

```java
class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " is eating");
    }
}

class Dog extends Animal {
    public Dog(String name) {
        super(name);   // must call the parent constructor — explicitly or implicitly
    }

    public void bark() {
        System.out.println(name + " says Woof!");
    }
}

Dog d = new Dog("Rex");
d.eat();   // inherited from Animal
d.bark();  // defined in Dog
```

### `super` — Reaching Into the Parent

```java
class Animal {
    public void makeSound() {
        System.out.println("Some generic animal sound");
    }
}

class Dog extends Animal {
    @Override
    public void makeSound() {
        super.makeSound();  // calls the PARENT's version first
        System.out.println("Woof!");
    }
}
```

### Single Inheritance Only — And Why

Java classes can extend **only one** parent class (unlike C++'s multiple inheritance). This is a deliberate design decision to avoid the "diamond problem" — ambiguity over which parent's method should win when two parents define conflicting behavior. Interfaces (Chapter 14) are how Java achieves multiple-inheritance-like flexibility without this ambiguity.

```
       Animal
         │
       Dog          ✅ Single inheritance chain — always unambiguous
```

---

<a id="ch13"></a>
## Chapter 13 — Polymorphism

Polymorphism means: the same method call resolves to different actual behavior, depending on the real object underneath — even when accessed through a parent-type reference.

```java
class Animal {
    public void makeSound() {
        System.out.println("Some sound");
    }
}

class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Woof!");
    }
}

class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Meow!");
    }
}

Animal[] animals = { new Dog(), new Cat(), new Animal() };
for (Animal a : animals) {
    a.makeSound();  // calls the ACTUAL object's version, not Animal's — this IS polymorphism
}
// Output: Woof! / Meow! / Some sound
```

### Method Overloading vs Method Overriding

This distinction is asked constantly in interviews, and the difference is fundamental, not cosmetic.

| | Overloading | Overriding |
|---|---|---|
| Same class or subclass? | Same class | Subclass redefining a parent method |
| Method signature | Must differ (parameters) | Must be identical |
| Resolved when? | **Compile time** (static binding) | **Runtime** (dynamic binding) |
| Purpose | Multiple ways to call a similarly-named operation | Specialize inherited behavior |

```java
// OVERLOADING — resolved at COMPILE time based on argument types
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}

// OVERRIDING — resolved at RUNTIME based on actual object type
class Animal {
    void makeSound() { System.out.println("Generic sound"); }
}
class Dog extends Animal {
    @Override
    void makeSound() { System.out.println("Woof!"); }  // RUNTIME decides which version runs
}
```

### Compile-Time vs Runtime Polymorphism — The Mechanics

```java
Animal a = new Dog();
a.makeSound();
```

At compile time, the compiler only knows `a` is declared as type `Animal` — it checks that `makeSound()` exists on `Animal`, nothing more. At **runtime**, the JVM looks at the actual object (`Dog`) sitting in memory and calls *that* class's version. This mechanism is called **dynamic method dispatch**, and it's the actual machinery underneath every polymorphic call in Java.

---

<a id="ch14"></a>
## Chapter 14 — Abstraction: Abstract Classes & Interfaces

### Abstract Classes

An abstract class can have both fully implemented methods AND methods with no body (abstract methods) — it serves as a partial blueprint that subclasses must complete.

```java
abstract class Shape {
    abstract double area();          // no body — subclasses MUST implement this

    void describe() {                 // concrete method — shared by all subclasses
        System.out.println("This shape has an area of " + area());
    }
}

class Circle extends Shape {
    private double radius;

    Circle(double radius) { this.radius = radius; }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}

// Shape s = new Shape();  ❌ COMPILE ERROR — cannot instantiate an abstract class directly
Shape s = new Circle(5);   // ✅ fine — instantiate a concrete subclass
```

### Interfaces

An interface defines a **contract** — a set of methods a class promises to implement, with no state of its own (traditionally).

```java
interface Drivable {
    void accelerate();
    void brake();

    // Default method (Java 8+) — provides a body, implementing classes can override or inherit it
    default void honk() {
        System.out.println("Beep!");
    }

    // Static method (Java 8+) — belongs to the interface itself
    static Drivable createDefault() {
        return new Car();
    }
}

class Car implements Drivable {
    @Override
    public void accelerate() { System.out.println("Car speeding up"); }

    @Override
    public void brake() { System.out.println("Car slowing down"); }
}
```

A class can implement **multiple** interfaces — this is how Java achieves multiple-inheritance-like behavior without the diamond problem ambiguity (since interfaces, pre-Java-8, had no implementation to conflict over):

```java
class AmphibiousCar implements Drivable, Floatable {
    // must implement methods from BOTH interfaces
}
```

### Abstract Class vs Interface — The Real Difference

| | Abstract Class | Interface |
|---|---|---|
| Instance fields with actual state | Yes | No (only `public static final` constants) |
| Constructors | Yes | No |
| Multiple inheritance | No — single parent only | Yes — implement many interfaces |
| Method bodies | Mix of abstract + concrete | Default/static methods allowed (Java 8+), otherwise abstract |
| Use when | Classes share significant common implementation and clear "is-a" relationship | Defining a capability/contract unrelated classes can all promise to fulfill |

> 💡 **Modern guidance:** prefer interfaces for defining capabilities (`Comparable`, `Runnable`, `Serializable`) and reach for abstract classes when subclasses genuinely share meaningful, reusable implementation — not just a method signature.

---

<a id="ch15"></a>
## Chapter 15 — Encapsulation

Encapsulation means: hide internal state behind `private` fields, expose controlled access through public methods. It's the difference between letting outside code corrupt your object's state directly versus forcing every change through logic you control.

```java
public class BankAccount {
    private double balance;  // hidden — cannot be accessed directly from outside the class

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit must be positive");
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds");
        }
        balance -= amount;
    }
}

BankAccount acc = new BankAccount();
// acc.balance = -1000;  ❌ COMPILE ERROR — balance is private
acc.deposit(500);          // ✅ goes through controlled, validated logic
```

Without encapsulation, any code anywhere could set `balance = -1000` directly, bypassing every validation rule. Encapsulation makes invalid states structurally impossible to create from outside the class.

### Access Modifiers

```java
public class Example {
    public int a;      // accessible from ANYWHERE
    protected int b;     // accessible within the package + subclasses (even in other packages)
    int c;                 // (no modifier) "package-private" — accessible only within the same package
    private int d;          // accessible ONLY within this exact class
}
```

| Modifier | Same Class | Same Package | Subclass (different package) | Everywhere |
|---|---|---|---|---|
| `private` | ✅ | ❌ | ❌ | ❌ |
| (default/package) | ✅ | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

---

<a id="ch16"></a>
## Chapter 16 — Object Class Methods: equals, hashCode, toString

Every class in Java implicitly extends `Object`, inheriting several methods you'll override constantly.

```java
public class Employee {
    private String name;
    private int id;

    @Override
    public String toString() {
        return "Employee{name='" + name + "', id=" + id + "}";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                       // same object reference — trivially equal
        if (o == null || getClass() != o.getClass()) return false;
        Employee other = (Employee) o;
        return id == other.id && Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, id);
    }
}
```

### Why `toString()` Matters

```java
Employee e = new Employee("Smit", 1);
System.out.println(e);
// Without override: Employee@1b6d3586  (className@hexHashcode — useless)
// With override:    Employee{name='Smit', id=1}  (actually readable)
```

### The `equals()`/`hashCode()` Contract — Critical for Collections

This was covered in depth in the [Java Collections Framework handbook](#) — the short version: if you override `equals()`, you **must** override `hashCode()` too, or hash-based collections (`HashMap`, `HashSet`) will silently fail to find your objects, even when `equals()` would return `true`.

```java
// The contract: if a.equals(b) is true, then a.hashCode() MUST equal b.hashCode()
// The reverse is NOT required — different objects CAN share a hash code (a collision)
```

---

<a id="ch17"></a>
## Chapter 17 — Exception Handling

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero: " + e.getMessage());
} finally {
    System.out.println("This ALWAYS runs — cleanup code goes here");
}
```

### The Exception Hierarchy

```
Throwable
│
├── Error                       ← serious JVM-level problems, NOT meant to be caught
│   ├── OutOfMemoryError
│   └── StackOverflowError
│
└── Exception
    │
    ├── RuntimeException          ← UNCHECKED — compiler doesn't force you to handle these
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ArithmeticException
    │   └── IllegalArgumentException
    │
    └── (everything else)          ← CHECKED — compiler FORCES you to catch or declare these
        ├── IOException
        └── SQLException
```

### Checked vs Unchecked Exceptions

```java
// CHECKED exception — compiler forces you to handle it
public void readFile() throws IOException {   // must declare, or wrap in try-catch
    FileReader reader = new FileReader("data.txt");
}

// UNCHECKED exception — compiler does NOT force handling
public void divide(int a, int b) {
    int result = a / b;  // could throw ArithmeticException, but compiler doesn't require try-catch
}
```

> 💡 **The design intent:** checked exceptions represent recoverable conditions outside your program's control (a file might not exist, a network call might fail) — the compiler forces you to consciously decide how to handle them. Unchecked exceptions usually represent programming bugs (null references, bad array indices) that ideally shouldn't happen at all, so the compiler doesn't burden every method signature with them.

### Custom Exceptions

```java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public void withdraw(double amount) {
    if (amount > balance) {
        throw new InsufficientFundsException("Cannot withdraw " + amount + ", balance is " + balance);
    }
}
```

### Multi-Catch and Try-With-Resources

```java
try {
    riskyOperation();
} catch (IOException | SQLException e) {   // multi-catch — handle several types identically
    System.out.println("Operation failed: " + e.getMessage());
}

// Try-with-resources — automatically closes resources, no manual finally block needed
try (FileReader reader = new FileReader("data.txt");
     BufferedReader br = new BufferedReader(reader)) {
    String line = br.readLine();
} catch (IOException e) {
    System.out.println("Error reading file");
}
// Both 'reader' and 'br' are automatically .close()'d here, even if an exception was thrown
```

> ⚠️ **Golden Rule:** never silently swallow exceptions with an empty `catch` block. `catch (Exception e) {}` hides real bugs and makes production debugging nearly impossible — at minimum, log the exception.

---

<a id="ch18"></a>
## Chapter 18 — Generics

Generics let you write classes and methods that work with **any type**, while still catching type errors at compile time instead of at runtime.

### Life Before Generics

```java
// Pre-generics (pre-Java 5): collections held raw Object — no compile-time type safety
List list = new ArrayList();
list.add("a string");
list.add(42);                          // compiler allows this — no type checking at all!
String s = (String) list.get(1);        // ClassCastException at RUNTIME — too late to catch it early
```

### With Generics

```java
List<String> list = new ArrayList<>();
list.add("a string");
// list.add(42);  ❌ COMPILE ERROR — caught immediately, not at runtime
String s = list.get(0);  // no cast needed — compiler already knows the type
```

### Generic Classes

```java
public class Box<T> {
    private T content;

    public void set(T content) { this.content = content; }
    public T get() { return content; }
}

Box<String> stringBox = new Box<>();
stringBox.set("Hello");

Box<Integer> intBox = new Box<>();
intBox.set(42);
```

### Generic Methods

```java
public static <T> T firstElement(List<T> list) {
    return list.get(0);
}
```

### Bounded Type Parameters

```java
// T must be a Number or a subclass of Number
public static <T extends Number> double sum(List<T> list) {
    double total = 0;
    for (T item : list) {
        total += item.doubleValue();
    }
    return total;
}
```

### Wildcards: `? extends` and `? super`

```java
// Producer — reading FROM a list of unknown-but-bounded type (covariance)
public static double sumAll(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) total += n.doubleValue();
    return total;
}

// Consumer — writing INTO a list (contravariance)
public static void addIntegers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}
```

> 💡 **PECS mnemonic:** "Producer Extends, Consumer Super" — use `? extends T` when you're only **reading** from a generic structure, and `? super T` when you're only **writing** into one.

### Type Erasure — What Actually Happens at Runtime

```java
List<String> strings = new ArrayList<>();
List<Integer> integers = new ArrayList<>();
System.out.println(strings.getClass() == integers.getClass());  // TRUE!
```

Generics exist **only at compile time**. The JVM erases all generic type information during compilation — at runtime, both lists are just `ArrayList`, indistinguishable. This is why you can't do `new T()` or `new T[]` inside a generic class, and why generic type checks via `instanceof` don't work as you'd expect.

---

<a id="ch19"></a>
## Chapter 19 — Collections Framework Overview

This handbook treats Collections as a topic worthy of its own dedicated deep-dive — covering `ArrayList` vs `LinkedList` internals, `HashMap` hashing/treeification, the `equals`/`hashCode` contract in practice, `ConcurrentModificationException`, and `Comparable` vs `Comparator` — in full depth elsewhere. Here's the structural map to keep in your head:

```
Collection (interface)
│
├── List          → ordered, duplicates allowed, index-based
│   ├── ArrayList, LinkedList, Vector
│
├── Set           → no duplicates
│   ├── HashSet, LinkedHashSet, TreeSet
│
└── Queue         → FIFO / priority-based processing
    ├── LinkedList, PriorityQueue, ArrayDeque

Map (interface — separate hierarchy, NOT a Collection)
│
├── HashMap, LinkedHashMap, TreeMap, Hashtable
```

```java
List<String> list = new ArrayList<>();      // ordered, allows duplicates
Set<String> set = new HashSet<>();           // unique values only
Map<String, Integer> map = new HashMap<>();  // key-value pairs
Queue<String> queue = new LinkedList<>();     // FIFO processing
```

The full reasoning behind *why* `ArrayList` usually beats `LinkedList`, how `HashMap` resolves collisions internally, and the exact mechanics of fail-fast iterators is covered comprehensively in the dedicated Collections Framework handbook — read that alongside this chapter for full depth.

---

<a id="ch20"></a>
## Chapter 20 — Enums

An enum represents a fixed set of constants — far more powerful in Java than a simple list of named integers.

```java
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

Day today = Day.MONDAY;

switch (today) {
    case MONDAY -> System.out.println("Start of the work week");
    case SATURDAY, SUNDAY -> System.out.println("Weekend!");
    default -> System.out.println("Midweek");
}
```

### Enums Can Have Fields, Constructors, and Methods

```java
public enum Planet {
    MERCURY(3.3e23, 2.4e6),
    EARTH(5.9e24, 6.4e6),
    JUPITER(1.9e27, 7.1e7);

    private final double mass;
    private final double radius;

    Planet(double mass, double radius) {   // enum constructors are implicitly private
        this.mass = mass;
        this.radius = radius;
    }

    public double surfaceGravity() {
        final double G = 6.67300E-11;
        return G * mass / (radius * radius);
    }
}

System.out.println(Planet.EARTH.surfaceGravity());
```

### Built-In Enum Methods

```java
Day.MONDAY.name();      // "MONDAY"
Day.MONDAY.ordinal();    // 0 — position in declaration order
Day.values();             // returns an array of ALL enum constants
Day.valueOf("FRIDAY");     // converts a String back to the enum constant
```

> 💡 Enums are the type-safe, refactor-friendly alternative to using raw `int` or `String` constants for fixed categories — the compiler catches typos and invalid values that plain strings never would.

---

<a id="ch21"></a>
## Chapter 21 — Nested & Inner Classes

```java
class Outer {
    private int x = 10;

    // Static nested class — doesn't need an Outer instance to exist
    static class StaticNested {
        void display() {
            System.out.println("Static nested class");
        }
    }

    // Inner class (non-static) — tied to a specific Outer INSTANCE
    class Inner {
        void display() {
            System.out.println("Inner class can access x: " + x);  // can reach Outer's private fields
        }
    }
}

Outer.StaticNested nested = new Outer.StaticNested();   // no Outer instance needed

Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();                    // REQUIRES an Outer instance
```

### Local and Anonymous Classes

```java
public void process() {
    class LocalHelper {              // local class — defined and used only within this method
        void help() { System.out.println("Helping locally"); }
    }
    new LocalHelper().help();
}

// Anonymous class — a one-off implementation with no class name at all
Runnable task = new Runnable() {
    @Override
    public void run() {
        System.out.println("Running anonymously");
    }
};
```

Anonymous classes were the standard way to pass behavior as data before lambdas (Chapter 22) existed — and you'll still see them in older codebases or when you need more than a single abstract method's worth of logic.

---

<a id="ch22"></a>
## Chapter 22 — Lambda Expressions & Functional Interfaces

A **functional interface** is any interface with exactly **one** abstract method. A **lambda expression** is a compact, anonymous implementation of that single method.

```java
// Before lambdas — verbose anonymous class
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Running");
    }
};

// With a lambda — same behavior, dramatically less ceremony
Runnable r2 = () -> System.out.println("Running");
```

```java
// Lambda syntax with parameters
Comparator<String> byLength = (a, b) -> a.length() - b.length();

// Multi-statement lambda body
Function<Integer, Integer> square = x -> {
    int result = x * x;
    return result;
};
```

### The Built-In Functional Interfaces (`java.util.function`)

```java
Function<Integer, Integer> doubler = x -> x * 2;        // takes T, returns R
Predicate<Integer> isEven = x -> x % 2 == 0;              // takes T, returns boolean
Consumer<String> printer = s -> System.out.println(s);     // takes T, returns nothing
Supplier<String> greeting = () -> "Hello!";                  // takes nothing, returns T
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b; // takes T,U, returns R
```

| Interface | Signature | Use For |
|---|---|---|
| `Function<T, R>` | `R apply(T t)` | Transform a value |
| `Predicate<T>` | `boolean test(T t)` | Test a condition |
| `Consumer<T>` | `void accept(T t)` | Do something with a value, no return |
| `Supplier<T>` | `T get()` | Produce a value from nothing |
| `BiFunction<T, U, R>` | `R apply(T t, U u)` | Transform two values into one |

### Method References — An Even Shorter Lambda

```java
// Lambda
list.forEach(s -> System.out.println(s));

// Equivalent method reference — when the lambda JUST calls one existing method
list.forEach(System.out::println);

// Static method reference
Function<String, Integer> parser = Integer::parseInt;

// Instance method reference on a particular object
Supplier<String> getName = employee::getName;

// Constructor reference
Supplier<ArrayList<String>> listMaker = ArrayList::new;
```

---

<a id="ch23"></a>
## Chapter 23 — Streams API

Streams (Java 8+) let you express data processing as a declarative pipeline, instead of manually writing loops.

```java
List<String> names = List.of("Smit", "Raj", "Ananya", "Bob", "Karan");

List<String> result = names.stream()
    .filter(name -> name.length() > 3)     // keep only names longer than 3 chars
    .map(String::toUpperCase)               // transform each remaining name
    .sorted()                                // sort alphabetically
    .collect(Collectors.toList());           // gather into a List

System.out.println(result);  // [ANANYA, KARAN, SMIT]
```

### The Stream Pipeline Model

```
Source → Intermediate Operations (lazy) → Terminal Operation (triggers execution)

list.stream()           ← source
    .filter(...)          ← intermediate (lazy — doesn't run yet)
    .map(...)              ← intermediate (lazy)
    .collect(...)            ← terminal (THIS is when the entire pipeline actually executes)
```

> 💡 **Critical mental model:** intermediate operations are **lazy** — nothing actually executes until a terminal operation is invoked. A stream with `filter` and `map` but no terminal operation does literally nothing at all.

### Common Stream Operations

```java
// filter, map, sorted (seen above)

// Aggregation
long count = names.stream().filter(n -> n.length() > 3).count();
Optional<String> longest = names.stream().max(Comparator.comparingInt(String::length));

// reduce — combine all elements into a single result
int sum = Stream.of(1, 2, 3, 4, 5).reduce(0, (a, b) -> a + b);

// Collectors
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));

String joined = names.stream().collect(Collectors.joining(", "));

// Numeric streams (avoids autoboxing overhead)
IntStream.rangeClosed(1, 10).sum();

// Parallel streams — splits work across multiple threads automatically
long total = bigList.parallelStream().filter(x -> x > 100).count();
```

> ⚠️ **`parallelStream()` is not automatically faster.** It adds real overhead for splitting work and merging results — only worth it for genuinely large datasets with CPU-bound (not I/O-bound) operations. Benchmark before assuming it helps.

### Why Streams Don't Replace Loops Entirely

Streams excel at transformation pipelines (filter → map → collect). For complex control flow, early termination across multiple variables, or heavy side effects, a traditional loop is often clearer and just as efficient. Streams are a tool for *expressiveness*, not a mandate.

---

<a id="ch24"></a>
## Chapter 24 — Optional

`Optional<T>` is a container that may or may not hold a value — designed specifically to make the *possibility* of a missing value explicit in a method's return type, instead of silently returning `null` and hoping callers remember to check.

```java
public Optional<Employee> findById(int id) {
    Employee emp = database.get(id);
    return Optional.ofNullable(emp);   // wraps a possibly-null value safely
}

Optional<Employee> result = findById(5);

// Bad — defeats the entire purpose of Optional
if (result.isPresent()) {
    Employee e = result.get();
}

// Better — functional, expressive
result.ifPresent(e -> System.out.println(e.getName()));

String name = result.map(Employee::getName).orElse("Unknown");

Employee emp = result.orElseThrow(() -> new NoSuchElementException("Employee not found"));
```

> ⚠️ **Golden Rule:** `Optional` is meant for **return types**, signaling "this might not have a value" to callers. It is NOT meant for fields, method parameters, or collection elements — using it there adds overhead and ceremony without the benefit it was designed for.

```java
// Avoid — Optional as a field, generally considered an anti-pattern
private Optional<String> middleName;

// Avoid — Optional as a parameter, just overload the method or use a sentinel instead
public void process(Optional<String> filter) { ... }
```

---

<a id="ch25"></a>
## Chapter 25 — Records (Java 16+)

A record is a compact way to declare an immutable data carrier class — eliminating the enormous boilerplate of constructors, getters, `equals()`, `hashCode()`, and `toString()` for simple data-holding classes.

```java
// This single line...
public record Point(int x, int y) {}

// ...automatically generates the equivalent of ALL of this:
public final class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) { this.x = x; this.y = y; }
    public int x() { return x; }              // note: x(), not getX()
    public int y() { return y; }
    @Override public boolean equals(Object o) { /* generated, field-by-field */ }
    @Override public int hashCode() { /* generated */ }
    @Override public String toString() { return "Point[x=" + x + ", y=" + y + "]"; }
}
```

```java
Point p1 = new Point(1, 2);
Point p2 = new Point(1, 2);
System.out.println(p1.equals(p2));  // true — generated equals() compares all fields
System.out.println(p1);              // Point[x=1, y=2]
```

### Compact Constructors — Adding Validation

```java
public record Point(int x, int y) {
    public Point {   // compact constructor — no parameter list repeated, runs BEFORE field assignment
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Coordinates must be non-negative");
        }
    }
}
```

> 💡 **When to reach for a record:** any time a class's entire purpose is to hold immutable data with no real behavior — DTOs, value objects, API response shapes, coordinate pairs. Records aren't meant to replace every class, especially ones with mutable state or significant behavior.

---

<a id="ch26"></a>
## Chapter 26 — Sealed Classes (Java 17+)

A sealed class restricts **exactly which classes** are allowed to extend it — giving you exhaustiveness guarantees that regular inheritance can't.

```java
public sealed interface Shape permits Circle, Square, Triangle {}

public final class Circle implements Shape {
    public double radius;
}

public final class Square implements Shape {
    public double side;
}

public final class Triangle implements Shape {
    public double base, height;
}

// public final class Hexagon implements Shape {}  ❌ COMPILE ERROR — not in the permits list
```

This pairs naturally with pattern matching (Chapter 27) — because the compiler knows the **complete, closed set** of possible subtypes, it can verify your `switch` covers every case, with no `default` branch needed:

```java
double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius * c.radius;
        case Square s -> s.side * s.side;
        case Triangle t -> 0.5 * t.base * t.height;
        // no default needed — compiler KNOWS these are the only three possible subtypes
    };
}
```

A subclass of a sealed class must be declared `final` (can't be extended further), `sealed` (defines its own restricted permit list), or `non-sealed` (reopens unrestricted extension from that point downward).

---

<a id="ch27"></a>
## Chapter 27 — Pattern Matching & Switch Expressions

### `instanceof` Pattern Matching (Java 16+)

```java
// Before — verbose, manual casting
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// After — the cast happens automatically, the variable is scoped to the if-block
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

### Switch Expressions (Java 14+)

```java
// Traditional switch STATEMENT — verbose, fall-through risk
String result;
switch (day) {
    case MONDAY:
    case TUESDAY:
        result = "Early week";
        break;
    default:
        result = "Other";
}

// Switch EXPRESSION — returns a value directly, no fall-through, no break needed
String result = switch (day) {
    case MONDAY, TUESDAY -> "Early week";
    default -> "Other";
};

// yield — for multi-statement branches inside a switch expression
int category = switch (score) {
    case 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100 -> {
        System.out.println("Excellent!");
        yield 1;
    }
    default -> 0;
};
```

### Pattern Matching for Switch (Java 21+)

```java
sealed interface Shape permits Circle, Square {}
record Circle(double radius) implements Shape {}
record Square(double side) implements Shape {}

double area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Square s -> s.side() * s.side();
};

// Record deconstruction patterns — destructure directly in the case label
double area2 = switch (shape) {
    case Circle(double r) -> Math.PI * r * r;
    case Square(double s) -> s * s;
};

// Guarded patterns with 'when'
String describe = switch (shape) {
    case Circle c when c.radius() > 100 -> "Huge circle";
    case Circle c -> "Normal circle";
    default -> "Other shape";
};
```

This combination — sealed types + exhaustive pattern matching + record deconstruction — is one of modern Java's most significant additions, bringing functional-language-style exhaustive matching into a traditionally object-oriented language.

---

<a id="ch28"></a>
## Chapter 28 — Text Blocks (Java 15+)

```java
// Before — painful escaping and concatenation for multi-line strings
String json = "{\n" +
              "  \"name\": \"Smit\",\n" +
              "  \"role\": \"Developer\"\n" +
              "}";

// With text blocks — clean, readable, no escaping
String json = """
    {
      "name": "Smit",
      "role": "Developer"
    }
    """;
```

Text blocks automatically strip leading whitespace based on the **least-indented line**, and you can embed expressions using regular string formatting:

```java
String name = "Smit";
String message = """
    Hello, %s!
    Welcome to the handbook.
    """.formatted(name);
```

---

<a id="ch29"></a>
## Chapter 29 — Multithreading: Overview

Multithreading deserves — and has — its own dedicated, full-depth handbook covering threads, the Java Memory Model, `volatile`, synchronization primitives, the four classic concurrency bugs (race conditions, deadlocks, livelocks, starvation), the entire `java.util.concurrent` toolkit, thread pools, `CompletableFuture`, concurrent collections, and virtual threads (Project Loom).

The essential mental model to carry forward from here:

```java
// Creating a thread
Thread t = new Thread(() -> System.out.println("Running in: " + Thread.currentThread().getName()));
t.start();

// Thread safety via synchronized
public synchronized void increment() {
    count++;
}

// Modern: thread pools instead of raw threads
ExecutorService executor = Executors.newFixedThreadPool(4);
executor.submit(() -> doWork());

// Java 21+: virtual threads for massive I/O-bound concurrency
Thread.startVirtualThread(() -> doBlockingIOWork());
```

Read the dedicated Multithreading handbook for the complete treatment — happens-before relationships, CAS-based atomics, `ConcurrentHashMap` internals, and the virtual thread pinning caveat are all covered there in full depth.

---

<a id="ch30"></a>
## Chapter 30 — Memory Management & Garbage Collection

### Stack vs Heap

```
Stack (per-thread)                Heap (shared across all threads)
┌───────────────────┐             ┌─────────────────────────────┐
│ Method frames:     │             │  All objects live here:      │
│ - local variables   │             │  - new Employee()              │
│ - primitive values  │             │  - new int[100]                 │
│ - object REFERENCES │────────────▶│  - String objects                │
│   (not objects      │             │                                    │
│    themselves)      │             │  Garbage Collector manages         │
└───────────────────┘             │  this memory automatically          │
                                    └─────────────────────────────┘
```

The stack is fast, automatically managed (frames pop when a method returns), and limited in size (`StackOverflowError` on excessive recursion). The heap holds every object you create, is much larger, and requires active garbage collection to reclaim memory from objects no longer in use.

### How Garbage Collection Actually Works

Java's garbage collector identifies objects that are no longer **reachable** from any active reference (starting from "GC roots" — local variables, static fields, active thread stacks) and reclaims their memory automatically.

```java
Employee e = new Employee("Smit");  // object created, reachable via 'e'
e = null;                            // no references remain — object is now ELIGIBLE for GC
                                       // (NOT necessarily collected immediately — GC runs on its own schedule)
```

### Generational Garbage Collection

Most modern JVM garbage collectors are **generational**, based on the empirical observation that most objects die young.

```
┌──────────────────────────────────────────────┐
│                  Heap                          │
│  ┌────────────────┐  ┌──────────────────────┐ │
│  │  Young          │  │  Old Generation        │ │
│  │  Generation     │  │  (Tenured)              │ │
│  │  ┌─────┐┌──────┐│  │                          │ │
│  │  │Eden ││Surviv││  │  Long-lived objects      │ │
│  │  │     ││or    ││──▶│  that survived many      │ │
│  │  └─────┘└──────┘│  │  young-gen collections    │ │
│  └────────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────┘
```

- **Young Generation**: new objects are allocated here first. Most die quickly (minor GC, fast and frequent).
- **Old Generation**: objects that survive several young-gen collections get **promoted** here (major/full GC, slower and less frequent).

This generational split exists because scanning the entire heap on every collection would be extremely expensive — focusing frequent, cheap collections on the young generation (where most garbage actually accumulates) is far more efficient.

### Common GC Algorithms

| Collector | Characteristics |
|---|---|
| **Serial GC** | Single-threaded, simple — fine for small applications |
| **Parallel GC** | Multi-threaded, throughput-focused — older JVM default |
| **G1 (Garbage First)** | Default since Java 9 — balances throughput and pause times, region-based |
| **ZGC / Shenandoah** | Designed for extremely low pause times, even on very large heaps |

> 💡 You rarely need to manually tune GC for typical applications — but understanding that GC pauses exist, and that excessive object churn (creating and discarding huge numbers of short-lived objects) directly drives GC frequency, explains real performance characteristics you'll encounter in production (e.g., why the `StringBuilder` discussion in Chapter 7 actually matters at scale).

---

<a id="ch31"></a>
## Chapter 31 — Class Loading & The JVM Runtime

### The Class Loading Process

```
1. Loading      → Class Loader reads the .class file's bytecode into memory
2. Linking       → Verification (bytecode is valid & safe) + Preparation (static fields get default values)
                    + Resolution (symbolic references resolved to actual memory references)
3. Initialization → Static initializers and static field assignments actually run
```

### The Class Loader Hierarchy

```
Bootstrap ClassLoader     → loads core JDK classes (java.lang.*, java.util.*)
        │
        ▼
Platform ClassLoader       → loads platform/extension classes
        │
        ▼
Application ClassLoader     → loads YOUR application's classes (from the classpath)
```

Each loader delegates upward first — the **delegation model** means a request for a class first asks the parent loader, and only falls back to loading it itself if the parent can't find it. This is why you can't accidentally override `java.lang.String` with your own malicious version — the Bootstrap loader always wins for core JDK classes.

### JVM Runtime Data Areas

```
┌─────────────────────────────────────────────────────┐
│                    JVM Memory                          │
│                                                           │
│  ┌──────────────┐  ┌─────────────────────────────┐   │
│  │ Method Area    │  │  Heap                          │   │
│  │ (class-level    │  │  (all objects, shared          │   │
│  │  metadata,       │  │   across threads)               │   │
│  │  shared)          │  └─────────────────────────────┘   │
│  └──────────────┘                                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Thread 1 Stack │  │ Thread 2 Stack │  │ PC Registers   │   │
│  │ (per-thread)    │  │ (per-thread)    │  │ (per-thread)    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

<a id="ch32"></a>
## Chapter 32 — JIT Compilation: Why Java Gets Faster While Running

A common misconception: Java is "slow" because it's interpreted. In reality, the JVM uses a **hybrid** execution model that often rivals natively compiled languages for long-running processes.

```
Bytecode
   │
   ▼
┌──────────────────────────────────────┐
│  Interpreter                            │
│  Executes bytecode line-by-line,         │
│  immediately — but relatively slow       │
└──────────────────────────────────────┘
   │
   │  JVM PROFILES execution — tracks which methods run frequently ("hot" methods)
   ▼
┌──────────────────────────────────────┐
│  JIT (Just-In-Time) Compiler             │
│  Compiles HOT methods directly to         │
│  optimized native machine code,            │
│  cached for all future calls                │
└──────────────────────────────────────┘
```

This is why Java programs often get **measurably faster** the longer they run — the JVM starts by interpreting bytecode (fast startup), then identifies hot code paths through runtime profiling, and compiles only those specific methods to highly optimized native code, applying optimizations a static, ahead-of-time compiler couldn't even know to make (since it can observe actual runtime behavior, not just static code structure).

> 💡 This is also *why* microbenchmarking Java code incorrectly (without a proper "warm-up" period before measuring) gives misleading results — your first few thousand iterations may still be running through the slower interpreter, not yet JIT-compiled.

---

<a id="ch33"></a>
## Chapter 33 — File I/O & NIO

### Classic I/O (`java.io`)

```java
// Reading a file line by line
try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}

// Writing to a file
try (BufferedWriter writer = new BufferedWriter(new FileWriter("output.txt"))) {
    writer.write("Hello, file!");
} catch (IOException e) {
    e.printStackTrace();
}
```

### Modern NIO (`java.nio.file`) — Preferred Since Java 7+

```java
import java.nio.file.*;

// Read an entire file as a String in one call
String content = Files.readString(Path.of("data.txt"));

// Read all lines as a List
List<String> lines = Files.readAllLines(Path.of("data.txt"));

// Write a String to a file
Files.writeString(Path.of("output.txt"), "Hello, NIO!");

// Stream a file's lines lazily — ideal for very large files
try (Stream<String> lineStream = Files.lines(Path.of("huge_file.txt"))) {
    long count = lineStream.filter(line -> line.contains("ERROR")).count();
}

// Common file operations
Files.exists(Path.of("data.txt"));
Files.copy(Path.of("a.txt"), Path.of("b.txt"));
Files.delete(Path.of("temp.txt"));
Files.createDirectory(Path.of("newFolder"));
```

`java.nio.file` is generally preferred in modern code — it's more concise, integrates cleanly with Streams, and provides clearer exception types than the older `java.io` API.

---

<a id="ch34"></a>
## Chapter 34 — Serialization

Serialization converts an object into a byte stream (for storage or network transmission); deserialization reverses the process.

```java
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;  // version control for serialized form
    private String name;
    private transient String password;  // 'transient' fields are SKIPPED during serialization
}

// Writing an object to a file
try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("emp.ser"))) {
    oos.writeObject(employee);
}

// Reading it back
try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("emp.ser"))) {
    Employee restored = (Employee) ois.readObject();
}
```

> ⚠️ **Modern guidance:** Java's built-in serialization has well-documented security risks (deserializing untrusted data can lead to remote code execution) and versioning fragility. In modern applications, JSON (via Jackson/Gson) or Protocol Buffers are almost always preferred over `java.io.Serializable` for actual data interchange — built-in serialization mostly persists for specific legacy or JVM-internal use cases (like certain caching and clustering mechanisms).

---

<a id="ch35"></a>
## Chapter 35 — Annotations & Reflection

### Annotations — Metadata About Your Code

```java
@Override                          // built-in — tells compiler this MUST override a parent method
public String toString() { ... }

@Deprecated                         // built-in — warns callers this shouldn't be used anymore
public void oldMethod() { ... }

@SuppressWarnings("unchecked")       // built-in — suppresses a specific compiler warning
public void legacyCode() { ... }

@FunctionalInterface                  // built-in — compiler enforces exactly one abstract method
interface Calculator {
    int calculate(int a, int b);
}
```

### Creating Custom Annotations

```java
@Retention(RetentionPolicy.RUNTIME)   // controls how long the annotation is retained
@Target(ElementType.METHOD)             // restricts WHERE this annotation can be applied
public @interface Loggable {
    String value() default "";
}

@Loggable("Tracks execution time")
public void processOrder() { ... }
```

This exact pattern (`@Retention`, `@Target`, custom marker/metadata annotations) is the foundation underneath Spring's `@Service`, `@Autowired`, `@RestController`, and virtually every annotation-driven framework feature you'd recognize from Spring Boot.

### Reflection — Inspecting Code at Runtime

```java
Class<?> clazz = Employee.class;

System.out.println(clazz.getName());               // fully qualified class name
Method[] methods = clazz.getDeclaredMethods();        // every method, including private ones
Field[] fields = clazz.getDeclaredFields();             // every field

// Creating an instance and invoking a method dynamically, entirely at runtime
Object instance = clazz.getDeclaredConstructor().newInstance();
Method setName = clazz.getMethod("setName", String.class);
setName.invoke(instance, "Smit");

// Accessing a PRIVATE field — reflection can bypass normal access rules
Field privateField = clazz.getDeclaredField("salary");
privateField.setAccessible(true);
privateField.set(instance, 90000.0);
```

> 💡 Reflection is exactly how Spring's dependency injection works under the hood — scanning classes for annotations, then constructing and wiring objects dynamically at runtime without you ever calling `new` yourself. It's powerful but has real performance overhead and bypasses compile-time type safety — used heavily by frameworks, sparingly in typical application code.

---

<a id="ch36"></a>
## Chapter 36 — Common Mistakes & How to Avoid Them

| Mistake | Why It's Wrong | Fix |
|---|---|---|
| Using `==` to compare objects (especially `String`, `Integer`) | Compares references, not content | Use `.equals()` for content comparison |
| Overriding `equals()` without `hashCode()` | Breaks `HashMap`/`HashSet` lookups silently | Always override both together |
| Catching `Exception` and doing nothing | Hides real bugs, makes debugging impossible | At minimum, log the exception |
| String concatenation in a loop with `+` | Creates a new String object every iteration | Use `StringBuilder` |
| Forgetting `break` in a traditional `switch` statement | Causes unintended fall-through | Use `break`, or prefer modern switch expressions |
| Mutating a collection while iterating with for-each | Throws `ConcurrentModificationException` | Use `Iterator.remove()` or `removeIf()` |
| Treating `Optional` as a field or parameter type | Adds overhead without the intended benefit | Reserve `Optional` for return types only |
| Assuming Java passes objects "by reference" | Java is always pass-by-value (of the reference) | Understand reassignment vs mutation (Chapter 8) |
| Ignoring checked exceptions by declaring `throws Exception` everywhere | Defeats the compiler's whole purpose for checked exceptions | Catch and handle specific exception types meaningfully |
| Using raw types instead of generics (`List` instead of `List<String>`) | Loses all compile-time type safety | Always parameterize generic types |
| Comparing floating-point values with `==` | Floating-point precision errors make exact equality unreliable | Use a tolerance/epsilon comparison, or `BigDecimal` for exactness |

---

<a id="ch37"></a>
## Chapter 37 — The Complete Cheat Sheet

### Primitive Types

```
byte (8-bit) → short (16-bit) → int (32-bit) → long (64-bit)
float (32-bit) → double (64-bit)
char (16-bit) | boolean
```

### OOP Pillars

```
Encapsulation  → private fields + public getters/setters
Inheritance    → class Dog extends Animal
Polymorphism   → Animal a = new Dog(); a.makeSound(); // calls Dog's version
Abstraction    → abstract class / interface
```

### Exception Hierarchy

```
Throwable → Error (don't catch) | Exception → RuntimeException (unchecked) | Checked (must handle)
```

### Functional Interfaces Quick Reference

```java
Function<T, R>     → R apply(T t)
Predicate<T>        → boolean test(T t)
Consumer<T>          → void accept(T t)
Supplier<T>           → T get()
```

### Stream Pipeline Skeleton

```java
collection.stream()
    .filter(predicate)
    .map(function)
    .sorted()
    .collect(Collectors.toList());
```

### Modern Java Feature Timeline

```
Java 8  → Lambdas, Streams, Optional, default interface methods
Java 9  → Module system (JPMS)
Java 10 → var (local variable type inference)
Java 14 → Switch expressions
Java 15 → Text blocks
Java 16 → Records, instanceof pattern matching
Java 17 → Sealed classes (LTS release)
Java 21 → Virtual threads, pattern matching for switch, record patterns (LTS release)
```

---

## Closing Thoughts

You now have, in one place, the entire arc from `public static void main` to JVM internals, modern functional-style Java, and the exact mechanics frameworks like Spring build on top of.

The fastest way to truly internalize this isn't rereading it — it's writing real code against every concept here, deliberately breaking things (try comparing two `Integer` objects above 127, try mutating a list mid-iteration, try recursion deep enough to trigger a `StackOverflowError`) until the *why* behind each rule becomes intuitive rather than memorized.

Java rewards exactly this kind of deliberate, hands-on curiosity. Go write some code.