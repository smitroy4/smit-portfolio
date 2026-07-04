## From Entity Mapping to Advanced Queries, Relationships to Performance Tuning

> *Most Spring Boot developers know how to write a repository interface and call `findAll()`. Far fewer understand what Hibernate is actually doing when they add `@OneToMany`, why their application fires 47 SQL queries to load 10 entities, or why `@Transactional` sometimes appears to do nothing at all. This guide builds the complete mental model — from the ORM contract between Java objects and database rows, through entity relationships, through the N+1 problem and how to fix it, all the way to PostgreSQL-specific features that take your data layer from "it works" to genuinely production-grade.*

---

<a id="ch1"></a>
## Chapter 1 — What JPA, Hibernate, and Spring Data JPA Actually Are
![JPA, Hibernate, and Spring Data JPA layer stack diagram](/images/blogs/internals/jpa-hibernate-spring-data-layers.png)

These three terms are used almost interchangeably in tutorials, which causes genuine confusion when you hit your first problem and don't know which layer to blame. They are three distinct things sitting on top of each other.

**JPA (Jakarta Persistence API)** is a specification — a set of interfaces, annotations, and rules defined by the Jakarta EE standard that describes how Java objects should be mapped to relational database tables. JPA itself ships no code that runs — it's a contract, a vocabulary (`@Entity`, `@Table`, `@Column`, `@Id`, `EntityManager`), and a set of rules. You cannot use JPA alone. You need an implementation.

**Hibernate** is the most widely used JPA implementation. It is the code that actually runs: reading your `@Entity` annotations, generating SQL, managing a first-level cache (the `EntityManager`'s persistence context), handling lazy loading via proxy objects, and translating between Java's object model and the relational model of your database. When you add `spring-boot-starter-data-jpa`, Hibernate is pulled in as the default JPA provider. The SQL you see in your logs — that's Hibernate writing it.

**Spring Data JPA** sits on top of JPA (and therefore Hibernate). Its job is to eliminate the boilerplate of writing `EntityManager` code by hand. It provides the `JpaRepository` interface, derived query methods, and `@Query` annotations. When you write `findByEmailAndActiveTrue(String email)` in a repository interface and never implement it, Spring Data JPA generates the implementation by parsing the method name and delegating to the `EntityManager`. It does not replace JPA or Hibernate — it automates the repetitive parts of using them.

```
Your Code
    │
    ▼
Spring Data JPA    ← eliminates EntityManager boilerplate
    │
    ▼
JPA (Jakarta Persistence API)    ← defines the contract: @Entity, @Query, EntityManager
    │
    ▼
Hibernate    ← generates SQL, manages persistence context, handles proxies
    │
    ▼
JDBC    ← raw database connectivity layer
    │
    ▼
PostgreSQL (or any relational database)
```

The **persistence context** (also called the first-level cache) is Hibernate's most important internal concept. Every `EntityManager` has one — it is a map of entity identities to entity instances. Within a single transaction, if you load the same entity twice (by the same ID), Hibernate returns the same Java object both times from the context rather than hitting the database again. When the transaction commits, Hibernate compares the current state of every entity in the context against the state when it was first loaded, and automatically issues `UPDATE` statements for anything that changed. This mechanism is called **dirty checking**, and it's why you can modify an entity's fields inside a transaction and never call `save()` — Hibernate detects the change automatically.

---

<a id="ch2"></a>
## Chapter 2 — Setting Up: Dependencies, DataSource, and Flyway

```xml
<dependencies>
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
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: postgres
    password: secret
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate          # never 'update' or 'create' in production
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true          # readable multi-line SQL in logs
        default_schema: public
    show-sql: false               # use logging config instead, not this flag

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

logging:
  level:
    org.hibernate.SQL: DEBUG                   # shows the SQL Hibernate generates
    org.hibernate.orm.jdbc.bind: TRACE         # shows the actual bound parameter values
```

### Why Flyway Instead of `ddl-auto`

`ddl-auto: update` is one of Spring Boot's most dangerous defaults for production. It instructs Hibernate to compare your entity annotations against the live database schema and issue `ALTER TABLE` statements to make them match. The problem is that Hibernate's schema diffing is not reliable enough for production: it won't detect renamed columns (it sees a missing column and an extra column, creates one and drops the other — destroying data), it won't add `NOT NULL` constraints to existing rows that may already contain nulls, and it leaves no audit trail of what changed or when.

**Flyway** solves this properly. Migration scripts live in `src/main/resources/db/migration/` as versioned SQL files (`V1__create_employees.sql`, `V2__add_department_column.sql`). Flyway runs them in order on startup and tracks what's been applied in a `flyway_schema_history` table. Schema changes become code — version-controlled, reviewable, testable, and repeatable. Every environment (local, staging, production) runs the same migration scripts in the same order.

```sql
-- V1__create_departments_and_employees.sql
CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    salary        DECIMAL(12, 2),
    department_id BIGINT REFERENCES departments(id),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

<a id="ch3"></a>
## Chapter 3 — Entity Mapping: From Java Class to Database Table

An entity is a Java class that Hibernate maps to a database table. The `@Entity` annotation tells JPA that this class participates in the persistence context. Every entity must have exactly one field annotated with `@Id` — the primary key that identifies the row.

The relationship between a Java entity and a database table is not magic: Hibernate reads your annotations at startup, builds an internal metadata model, and uses it throughout the application's lifetime to generate SQL and map `ResultSet` columns back to object fields. Understanding this mapping layer explicitly — rather than treating it as automatic — is what lets you understand why Hibernate generates the SQL it does.

```java
@Entity
@Table(
    name = "employees",
    uniqueConstraints = @UniqueConstraint(columnNames = "email"),
    indexes = @Index(name = "idx_employee_email", columnList = "email")
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"department", "orders"}) // exclude collections from toString to avoid lazy loading
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "salary", precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

> ⚠️ **`@ToString` and lazy collections:** Lombok's default `@ToString` includes all fields. If you include a lazily-loaded collection or association in `toString()`, calling it outside a transaction triggers a `LazyInitializationException`. Always exclude associations from `@ToString`, `@EqualsAndHashCode`, and similar Lombok annotations.

### The `@Table` Annotation and Schema Management

`@Table` controls the table name, schema, unique constraints, and index hints. Declaring constraints and indexes here gives Hibernate hints used in schema generation (for development), but these are not substitutes for proper database-level constraints and indexes defined in your Flyway migrations. In production, constraints should live in the database — not just in Hibernate annotations — because the database enforces them regardless of what application inserts data.

---

<a id="ch4"></a>
## Chapter 4 — Primary Keys and ID Generation Strategies

The primary key uniquely identifies every row in a table. JPA offers four ID generation strategies, each with different performance characteristics and suitability for different situations.

**`GenerationType.IDENTITY`** delegates ID generation to the database's auto-increment mechanism — PostgreSQL's `BIGSERIAL` or `IDENTITY` column. The database assigns the ID on insert, and JDBC returns it to Hibernate immediately. This is the simplest strategy and the default choice for most Spring Boot + PostgreSQL applications. The downside is that JDBC batch inserts are disabled: Hibernate must execute each insert individually and retrieve the generated ID before it can issue the next one, because each insert's ID may be needed by subsequent operations.

**`GenerationType.SEQUENCE`** uses a database sequence object. Hibernate pre-allocates blocks of IDs from the sequence in a single database round trip (controlled by `allocationSize`), then assigns them from memory for subsequent inserts. This enables JDBC batch inserts — Hibernate knows the IDs in advance and can batch multiple inserts into a single database call, dramatically improving throughput for bulk operations.

```java
// IDENTITY — simple, disables batching
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// SEQUENCE — enables batching, better for high-throughput bulk inserts
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "employee_seq")
@SequenceGenerator(
    name = "employee_seq",
    sequenceName = "employee_id_seq",
    allocationSize = 50   // pre-allocates 50 IDs per sequence call — 1 DB round trip per 50 inserts
)
private Long id;

// UUID — no database coordination needed, good for distributed systems
@Id
@GeneratedValue(strategy = GenerationType.UUID)
@Column(columnDefinition = "uuid", updatable = false, nullable = false)
private UUID id;
```

UUIDs as primary keys have specific PostgreSQL considerations. They eliminate coordination between distributed nodes (no sequence to contend on), but they are random by nature — random primary keys cause index fragmentation in PostgreSQL's B-tree primary key index, because inserts scatter across the index tree rather than appending at the end. UUID v7 (time-ordered, available in Java 21+ libraries) solves this by keeping the time prefix ordered while keeping the suffix random.

---

<a id="ch5"></a>
## Chapter 5 — Column Mapping: Types, Constraints, Naming

Hibernate maps Java types to database column types. Most mappings are automatic, but understanding them prevents surprises.

```java
// Standard mappings — Hibernate handles these automatically
private String name;              // → VARCHAR
private Integer count;             // → INTEGER
private Long bigNumber;             // → BIGINT
private Double decimal;              // → DOUBLE PRECISION (avoid for money)
private BigDecimal money;             // → NUMERIC — exact, use this for currency
private Boolean flag;                  // → BOOLEAN
private LocalDate date;                 // → DATE
private LocalDateTime timestamp;         // → TIMESTAMP
private LocalTime time;                   // → TIME
private byte[] data;                       // → BYTEA (binary)

// Enums — two mapping strategies
@Enumerated(EnumType.STRING)   // stores "ENGINEERING", "MARKETING" etc. — readable, refactor-safe
private Department department;

@Enumerated(EnumType.ORDINAL)  // stores 0, 1, 2... — compact but fragile (enum order matters!)
private Status status;          // avoid ORDINAL — adding an enum constant in the middle breaks everything

// Large text
@Column(columnDefinition = "TEXT")
private String bio;

// Transient — field exists in Java but is NOT persisted to the database
@Transient
private String computedFullName;
```

### Naming Conventions — Hibernate vs Your Database

By default, Hibernate translates Java camelCase field names to snake_case column names — `firstName` becomes `first_name`, `createdAt` becomes `created_at`. This is controlled by Spring Boot's default `SpringPhysicalNamingStrategy`. You can override the column name explicitly with `@Column(name = "...")` when the default translation doesn't match your schema, or configure a different naming strategy globally for the entire application.

---

<a id="ch6"></a>
## Chapter 6 — Understanding Relationships: The Core Concepts
![JPA entity relationship types — OneToOne, OneToMany, ManyToOne, ManyToMany](/images/blogs/internals/jpa-entity-relationship-types.png)

Before writing a single relationship annotation, understand what Hibernate is actually doing when you declare one. A relationship annotation tells Hibernate two things: what the relationship structure is (one-to-one, one-to-many, many-to-many), and who owns it.

The **owning side** of a relationship is the entity that holds the foreign key column in the database. When you modify an association (add an item to a collection, change a reference), Hibernate only writes that change to the database if the change is made on the **owning side**. Changes made to the **inverse side** (marked with `mappedBy`) are not persisted. This is the source of one of the most common JPA bugs: adding an entity to a `@OneToMany` collection without also setting the `@ManyToOne` reference on the child entity — the collection change sits on the inverse (non-owning) side, and Hibernate silently ignores it.

The bidirectional relationship management pattern that solves this is the **convenience method**: a method on the parent entity that sets both sides of the relationship together, ensuring the object graph in memory always matches what will be persisted.

```java
// The right way to manage bidirectional relationships
public class Department {

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Employee> employees = new ArrayList<>();

    // Convenience method — keeps BOTH sides of the relationship in sync
    public void addEmployee(Employee employee) {
        employees.add(employee);          // sets the inverse (collection) side
        employee.setDepartment(this);      // sets the owning side — this is what actually persists
    }

    public void removeEmployee(Employee employee) {
        employees.remove(employee);
        employee.setDepartment(null);
    }
}
```

---

<a id="ch7"></a>
## Chapter 7 — `@OneToOne`: One-to-One Relationships

A one-to-one relationship maps one entity to exactly one other entity. The foreign key can live on either side — the choice affects which side "owns" the relationship.

```java
@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign key lives in the employees table (employee_profile_id column)
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_profile_id", unique = true)
    private EmployeeProfile profile;
}

@Entity
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bio;
    private String linkedInUrl;

    // Inverse side — mappedBy refers to the field in the OWNING entity
    @OneToOne(mappedBy = "profile")
    private Employee employee;
}
```

One-to-one relationships always default to `FetchType.EAGER` in JPA, which means loading an `Employee` automatically loads its `EmployeeProfile` in a separate query — even if you never use the profile. Always explicitly set `fetch = FetchType.LAZY` on `@OneToOne` associations unless you have a specific reason to want eager loading. The performance implication compounds quickly when loading collections of employees.

---

<a id="ch8"></a>
## Chapter 8 — `@OneToMany` and `@ManyToOne`: The Most Common Relationship

This is the most-used relationship in most applications: a parent entity has many children, each child belongs to exactly one parent. Department → Employees is the canonical example.

```java
@Entity
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // INVERSE side — mappedBy means "the owning side is Employee.department"
    // This collection is NOT what controls persistence of the relationship
    @OneToMany(
        mappedBy = "department",
        cascade = CascadeType.ALL,
        orphanRemoval = true,   // if an employee is removed from this list, DELETE it from DB
        fetch = FetchType.LAZY  // default for @OneToMany — good, never change to EAGER
    )
    private List<Employee> employees = new ArrayList<>();

    public void addEmployee(Employee employee) {
        employees.add(employee);
        employee.setDepartment(this);
    }
}

@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // OWNING side — has the foreign key column (department_id)
    // Changes HERE are what Hibernate actually persists
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
```

`@OneToMany` defaults to `FetchType.LAZY` — this is correct and should never be changed to `EAGER`. An eager `@OneToMany` means every time you load a `Department`, Hibernate immediately loads all its employees, regardless of whether you need them. For a department with thousands of employees, that single load cascades into loading thousands of entities into heap memory.

`orphanRemoval = true` means: if an `Employee` is removed from the `Department.employees` collection (rather than explicitly deleted), Hibernate automatically deletes it from the database. This is appropriate when children cannot exist without their parent. Without it, removing from the collection just breaks the foreign key link — the child row remains in the database with a null or dangling foreign key.

---

<a id="ch9"></a>
## Chapter 9 — `@ManyToMany`: Many-to-Many With a Join Table

A many-to-many relationship requires a join table in the database. An employee can have multiple skills, and a skill can belong to multiple employees — no single row on either side can hold the foreign key, so a third table holds pairs of IDs.

```java
@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owning side — defines the join table structure
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "employee_skills",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills = new HashSet<>();  // Set avoids duplicate join table entries
}

@Entity
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Inverse side
    @ManyToMany(mappedBy = "skills")
    private Set<Employee> employees = new HashSet<>();
}
```

When your join table needs to carry extra data — for example, when an employee acquired a particular skill and at what proficiency level — a plain `@ManyToMany` is insufficient. The join table itself becomes a first-class entity:

```java
@Entity
@Table(name = "employee_skills")
public class EmployeeSkill {

    @EmbeddedId
    private EmployeeSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("employeeId")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    private Skill skill;

    @Column(nullable = false)
    private LocalDate acquiredDate;

    private Integer proficiencyLevel;
}

@Embeddable
public class EmployeeSkillId implements Serializable {
    private Long employeeId;
    private Long skillId;
    // equals() and hashCode() required for composite keys
}
```

This pattern — replacing `@ManyToMany` with two `@ManyToOne` relationships to an intermediate entity — is almost always the better design in production systems, because the join relationship almost always accumulates extra attributes over time.

---

<a id="ch10"></a>
## Chapter 10 — Cascading: What Happens to Children When Parents Change

Cascading controls what happens to child entities when you perform operations on the parent. When you `save()`, `delete()`, `merge()`, or `persist()` a parent, should Hibernate apply the same operation to associated children automatically?

| CascadeType | Behavior |
|---|---|
| `PERSIST` | When you `persist()` the parent, also `persist()` new children |
| `MERGE` | When you `merge()` (update) the parent, also `merge()` children |
| `REMOVE` | When you `delete()` the parent, also `delete()` all children |
| `REFRESH` | When you `refresh()` the parent from DB, also `refresh()` children |
| `DETACH` | When you detach the parent from the context, also detach children |
| `ALL` | All of the above — equivalent to applying every cascade type |

`CascadeType.ALL` on a `@OneToMany` is the most common configuration for collections where children cannot exist independently of their parent (order items cannot exist without an order). The important nuance: `CascadeType.REMOVE` + `orphanRemoval = true` achieve similar but distinct things. `REMOVE` cascades the delete operation when you explicitly delete the parent. `orphanRemoval = true` additionally deletes a child when it's removed from the collection — even without deleting the parent. You typically want both when children are fully owned by the parent.

```java
// Safe cascade for owned child relationships
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> items = new ArrayList<>();

// Dangerous — REMOVE cascade on a Many-to-Many or shared reference
// Deleting one Department could cascade to Employees shared with other Departments
@ManyToMany(cascade = CascadeType.ALL)  // ❌ never cascade REMOVE on @ManyToMany
private Set<Skill> skills;

// Safe — only PERSIST and MERGE on shared references
@ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
private Set<Skill> skills;
```

---

<a id="ch11"></a>
## Chapter 11 — Fetch Types: Lazy vs Eager, and Why It Matters

**Fetch type** controls when Hibernate loads associated data from the database. It is one of the most important performance decisions in a JPA application, and the defaults are deliberately designed for performance — but they are frequently overridden incorrectly.

**Lazy loading** means the association is not loaded from the database when the parent entity is loaded. Instead, Hibernate creates a **proxy object** — a dynamically generated subclass that looks like your entity but contains no data. The moment you call any method on the proxy (accessing a field, calling `getSize()` on a collection), Hibernate fires a SQL query to load the real data. This is efficient when you often load the parent without needing the association.

**Eager loading** means the association is loaded in the same query (or immediately after) as the parent entity, always, every time — whether you need it or not. For collections, this means loading every child entity every time you load the parent, unconditionally.

```
JPA Default Fetch Types:
  @OneToMany   → LAZY   ✅ correct — collections should always default to lazy
  @ManyToMany  → LAZY   ✅ correct
  @ManyToOne   → EAGER  ⚠️ can cause N+1 — should explicitly set to LAZY
  @OneToOne    → EAGER  ⚠️ can cause N+1 — should explicitly set to LAZY
```

The JPA defaults for `@ManyToOne` and `@OneToOne` are `EAGER` — historically reasonable for single-object associations, but a performance trap in practice. When loading a list of 100 employees, an `EAGER` `@ManyToOne` to `Department` causes Hibernate to load the department for each employee (potentially 100 extra queries if departments aren't cached). Always set `@ManyToOne` and `@OneToOne` to `FetchType.LAZY` explicitly and use `JOIN FETCH` in queries where you know you'll need the association.

```java
// Correct defaults — explicit LAZY on all associations
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id")
private Department department;

@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "profile_id")
private EmployeeProfile profile;

@OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
private List<Order> orders;
```

---

<a id="ch12"></a>
## Chapter 12 — Spring Data Repositories: The Full Hierarchy

Spring Data's repository abstraction is a hierarchy of interfaces, each adding more capability. Understanding which interface to extend — and why — prevents you from either under-using the framework or inheriting methods you don't want to expose.

```
Repository<T, ID>                    ← marker interface, no methods
        │
        ▼
CrudRepository<T, ID>                ← save, findById, findAll, delete, count, existsById
        │
        ▼
PagingAndSortingRepository<T, ID>    ← findAll(Sort), findAll(Pageable)
        │
        ▼
JpaRepository<T, ID>                 ← flush, saveAndFlush, deleteAllInBatch, getById (reference)
```

`JpaRepository` is the most commonly extended interface — it includes everything from `CrudRepository` and `PagingAndSortingRepository`, plus JPA-specific methods like `flush()` and batch operations. But consider: when you extend `JpaRepository`, your service's dependencies have access to every method including `deleteAll()` and `saveAllAndFlush()`. For services with limited read-only requirements, extending a narrower interface or creating a custom repository interface signals intent clearly and prevents accidental mutation.

```java
// Standard — for most use cases
public interface EmployeeRepository extends JpaRepository<Employee, Long> { }

// Read-only repository — signals that this data access point should not mutate
@NoRepositoryBean
public interface ReadOnlyRepository<T, ID> extends Repository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    Page<T> findAll(Pageable pageable);
}

public interface EmployeeReadRepository extends ReadOnlyRepository<Employee, Long> { }
```

---

<a id="ch13"></a>
## Chapter 13 — Derived Query Methods: Spring Data Magic

Spring Data reads method names and translates them into JPQL at startup. This is not runtime reflection — the parsing happens once when the application context loads, and an error in a method name fails at startup, not when the method is called.

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // find by single field
    List<Employee> findByDepartmentName(String departmentName);

    // find by multiple fields (AND)
    List<Employee> findByDepartmentNameAndActiveTrue(String department);

    // find by multiple fields (OR)
    List<Employee> findByEmailOrName(String email, String name);

    // comparison operators
    List<Employee> findBySalaryGreaterThan(BigDecimal salary);
    List<Employee> findBySalaryBetween(BigDecimal min, BigDecimal max);
    List<Employee> findByCreatedAtAfter(LocalDateTime date);

    // null checks
    List<Employee> findByDepartmentIsNull();
    List<Employee> findByDepartmentIsNotNull();

    // like / contains
    List<Employee> findByNameContainingIgnoreCase(String fragment);
    List<Employee> findByEmailStartingWith(String prefix);

    // collection membership
    List<Employee> findByDepartmentIdIn(List<Long> departmentIds);
    List<Employee> findByDepartmentIdNotIn(List<Long> departmentIds);

    // ordered results
    List<Employee> findByActiveTrueOrderBySalaryDesc();

    // limiting results
    Optional<Employee> findFirstByOrderBySalaryDesc();
    List<Employee> findTop5ByDepartmentNameOrderBySalaryDesc(String dept);

    // existence and count
    boolean existsByEmail(String email);
    long countByDepartmentName(String dept);

    // delete
    void deleteByActiveIsFalse();
}
```

Derived query methods work well for simple to moderately complex queries. They become unreadable when the condition count grows past three or four clauses — `findByDepartmentNameAndActiveTrueAndSalaryGreaterThanAndCreatedAtAfter` is technically valid but unmaintainable. Use JPQL or Specifications for complex, multi-condition queries.

---

<a id="ch14"></a>
## Chapter 14 — JPQL: Java Persistence Query Language

JPQL is JPA's own query language — similar to SQL but operating on **entity objects and their fields**, not on table names and column names. Hibernate translates your JPQL to the appropriate SQL dialect for your database. This database-agnostic quality means the same JPQL works against PostgreSQL, MySQL, Oracle, or H2 without changes.

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Basic JPQL — note: 'Employee' is the entity class name, not the table name
    @Query("SELECT e FROM Employee e WHERE e.salary > :minSalary")
    List<Employee> findHighEarners(@Param("minSalary") BigDecimal minSalary);

    // JOIN across relationship — no ON clause needed, Hibernate knows the join condition
    @Query("SELECT e FROM Employee e JOIN e.department d WHERE d.name = :deptName")
    List<Employee> findByDepartmentName(@Param("deptName") String deptName);

    // Fetch join — loads the association in the same query (prevents N+1)
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE e.active = true")
    List<Employee> findActiveEmployeesWithDepartment();

    // Aggregate functions
    @Query("SELECT AVG(e.salary) FROM Employee e WHERE e.department.name = :dept")
    BigDecimal findAverageSalaryByDepartment(@Param("dept") String dept);

    // COUNT with GROUP BY
    @Query("SELECT e.department.name, COUNT(e) FROM Employee e GROUP BY e.department.name")
    List<Object[]> countByDepartment();

    // Projection into a DTO constructor
    @Query("SELECT new com.example.dto.EmployeeSummary(e.id, e.name, e.email) " +
           "FROM Employee e WHERE e.active = true")
    List<EmployeeSummary> findActiveSummaries();

    // Modifying queries — need @Modifying and @Transactional
    @Modifying
    @Transactional
    @Query("UPDATE Employee e SET e.salary = e.salary * 1.10 WHERE e.department.id = :deptId")
    int giveDepartmentRaise(@Param("deptId") Long deptId);

    // Delete via JPQL
    @Modifying
    @Transactional
    @Query("DELETE FROM Employee e WHERE e.active = false AND e.updatedAt < :cutoff")
    int deleteInactiveEmployees(@Param("cutoff") LocalDateTime cutoff);
}
```

`@Modifying` is required for `UPDATE` and `DELETE` JPQL queries — it tells Spring Data that this query modifies state and should not be treated as a read. It also controls the cache behavior: by default, `@Modifying` clears the first-level cache (`clearAutomatically = true` can be set to ensure entities are refreshed after the bulk update).

---

<a id="ch15"></a>
## Chapter 15 — Native SQL Queries in Spring Data

When JPQL isn't enough — when you need a PostgreSQL-specific function, a window function, a CTE, `RETURNING`, or any other database-specific feature — Spring Data lets you drop down to native SQL.

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Native query returning entities
    @Query(
        value = "SELECT * FROM employees WHERE salary > :min ORDER BY salary DESC",
        nativeQuery = true
    )
    List<Employee> findHighEarnersNative(@Param("min") BigDecimal min);

    // Native query with pagination — must provide countQuery separately
    @Query(
        value = "SELECT * FROM employees WHERE department_id = :deptId",
        countQuery = "SELECT COUNT(*) FROM employees WHERE department_id = :deptId",
        nativeQuery = true
    )
    Page<Employee> findByDepartmentNative(@Param("deptId") Long deptId, Pageable pageable);

    // PostgreSQL window function — impossible in JPQL
    @Query(
        value = """
            SELECT
                id, name, salary,
                RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank
            FROM employees
            WHERE active = true
            """,
        nativeQuery = true
    )
    List<Object[]> findEmployeesWithSalaryRank();

    // PostgreSQL RETURNING clause — gets the updated rows back
    @Modifying
    @Query(
        value = "UPDATE employees SET salary = salary * 1.1 WHERE department_id = :id RETURNING id, name, salary",
        nativeQuery = true
    )
    List<Object[]> giveRaiseAndReturn(@Param("id") Long departmentId);
}
```

Native queries bypass Hibernate's entity mapping — they return raw `Object[]` arrays unless you map them to a projection interface. The trade-off is power vs portability: native queries are tied to your specific database dialect, so switching databases (rare but possible) would require rewriting them. Use native queries when JPQL genuinely cannot express what you need, not as a shortcut to avoid learning JPQL.

---

<a id="ch16"></a>
## Chapter 16 — Specifications: Dynamic Queries Without String Concatenation

When a query's conditions depend on runtime input — a filter page where users might specify any combination of department, salary range, name, and status — `@Query` doesn't work cleanly because you'd need to write a separate query for every possible combination of filters. The naive alternative — building a query string by concatenating conditions — is error-prone and a SQL injection risk.

Spring Data JPA's `Specification<T>` interface solves this. A `Specification` is a predicate — a piece of a `WHERE` clause — that can be combined with other specifications using `and()`, `or()`, and `not()` at runtime. The combination happens in Java using type-safe Criteria API calls, and Hibernate generates the appropriate SQL.

```java
// Each Specification represents one filter condition
public class EmployeeSpecifications {

    public static Specification<Employee> hasName(String name) {
        return (root, query, criteriaBuilder) ->
            name == null ? null :
            criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")),
                "%" + name.toLowerCase() + "%"
            );
    }

    public static Specification<Employee> hasDepartment(String department) {
        return (root, query, criteriaBuilder) ->
            department == null ? null :
            criteriaBuilder.equal(root.get("department").get("name"), department);
    }

    public static Specification<Employee> salaryBetween(BigDecimal min, BigDecimal max) {
        return (root, query, criteriaBuilder) -> {
            if (min == null && max == null) return null;
            if (min == null) return criteriaBuilder.lessThanOrEqualTo(root.get("salary"), max);
            if (max == null) return criteriaBuilder.greaterThanOrEqualTo(root.get("salary"), min);
            return criteriaBuilder.between(root.get("salary"), min, max);
        };
    }

    public static Specification<Employee> isActive() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.isTrue(root.get("active"));
    }
}

// Repository must extend JpaSpecificationExecutor
public interface EmployeeRepository extends JpaRepository<Employee, Long>,
                                             JpaSpecificationExecutor<Employee> { }

// Service — combine specifications dynamically at runtime
public Page<Employee> search(EmployeeFilterRequest filter, Pageable pageable) {
    Specification<Employee> spec = Specification.where(isActive())
            .and(hasName(filter.getName()))
            .and(hasDepartment(filter.getDepartment()))
            .and(salaryBetween(filter.getMinSalary(), filter.getMaxSalary()));

    return employeeRepository.findAll(spec, pageable);
}
```

Specifications compose cleanly — returning `null` from a specification signals "no condition to add," so optional filters simply don't contribute to the `WHERE` clause when their input is absent. Hibernate generates clean parameterized SQL from the criteria tree, with no string concatenation and no SQL injection risk.

---

<a id="ch17"></a>
## Chapter 17 — Projections: Fetching Only What You Need

Loading a full entity when you only need two of its twenty fields wastes memory, increases GC pressure, and generates larger SQL result sets. Projections let you fetch only the columns you actually need, mapped into a convenient shape.

**Interface projections** are the most elegant approach: Spring Data generates an implementation that reads the specified columns from the query result, with no extra code from you.

```java
// Interface projection — Spring generates the implementation
public interface EmployeeSummary {
    Long getId();
    String getName();
    String getEmail();

    // Nested projection — follow a relationship
    DepartmentInfo getDepartment();

    interface DepartmentInfo {
        String getName();
    }

    // SpEL expression in projection — compute a derived value
    @Value("#{target.name + ' <' + target.email + '>'}")
    String getDisplayName();
}

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Spring generates SQL selecting only the projected columns
    List<EmployeeSummary> findByActiveTrue();

    // With pagination
    Page<EmployeeSummary> findByDepartmentName(String dept, Pageable pageable);
}
```

**DTO projections** via constructor expressions give you a concrete class instead of an interface:

```java
@Query("SELECT new com.example.dto.EmployeeSummary(e.id, e.name, e.email) " +
       "FROM Employee e WHERE e.active = true")
List<EmployeeSummary> findActiveSummaries();
```

The generated SQL for an interface projection looks like: `SELECT e.id, e.name, e.email, d.name FROM employees e LEFT JOIN departments d ON ...` — only the columns the projection needs, not `SELECT *`. At scale, this difference in transferred data volume is meaningful.

---

<a id="ch18"></a>
## Chapter 18 — The N+1 Problem: The Most Expensive Mistake in JPA
![N+1 Query Problem in JPA visualization](/images/blogs/internals/jpa-n-plus-one-problem.png)

The N+1 problem is the single most impactful performance issue in JPA applications. It is subtle enough to miss in code review, severe enough to make a production application unusable under moderate load, and so common that it deserves a full chapter.

The name describes what happens: to load N entities, the application fires 1 query to load the parent entities, then N additional queries — one per parent — to load each parent's associated data. A list of 100 employees with their departments loads in 101 queries instead of 1.

![N+1 Query Problem in JPA visualization](/images/blogs/internals/jpa-n-plus-one-problem.png)

```java
// The code that looks innocent
List<Employee> employees = employeeRepository.findAll();

for (Employee emp : employees) {
    // Each access to emp.getDepartment() fires a separate SQL query
    // if department is LAZY-loaded and wasn't explicitly fetched
    System.out.println(emp.getName() + " works in " + emp.getDepartment().getName());
}
```

```sql
-- What actually hits the database:
SELECT * FROM employees;                           -- 1 query

SELECT * FROM departments WHERE id = 1;            -- query for employee 1's dept
SELECT * FROM departments WHERE id = 2;            -- query for employee 2's dept
SELECT * FROM departments WHERE id = 1;            -- employee 3 - same dept, but Hibernate
                                                    -- may not reuse (depends on session cache)
-- ... N more queries for N employees
```

The cruel irony: enabling `EAGER` fetch on the association "solves" the problem visually (the loop no longer triggers queries) but makes it worse architecturally — now every query that loads employees always loads their departments, even when you don't need them. The real solution is to explicitly fetch what you need, when you need it.

---

<a id="ch19"></a>
## Chapter 19 — JOIN FETCH and EntityGraph: Solving N+1

There are two primary solutions to the N+1 problem: `JOIN FETCH` in JPQL queries, and `@EntityGraph` on repository methods. Both instruct Hibernate to load the association in the same SQL query as the parent entity — a single JOIN instead of N separate selects.

### `JOIN FETCH` in JPQL

```java
// Fetch employees AND their departments in one query
@Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE e.active = true")
List<Employee> findActiveWithDepartment();

// Fetch multiple associations — but be careful with multiple collections (see below)
@Query("SELECT DISTINCT e FROM Employee e " +
       "LEFT JOIN FETCH e.department " +
       "LEFT JOIN FETCH e.profile " +
       "WHERE e.active = true")
List<Employee> findActiveWithAllAssociations();
```

```sql
-- What Hibernate generates — one clean query
SELECT e.*, d.*
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
WHERE e.active = true
```

> ⚠️ **`MultipleBagFetchException` — the collection JOIN FETCH trap:** Hibernate throws this exception if you attempt to `JOIN FETCH` two different `List` (bag) collections in the same query. The reason: joining two collections produces a Cartesian product of rows that Hibernate cannot reliably de-duplicate. The solution is to use `Set` instead of `List` for collections, or to split the fetching across two separate queries, or to use `@EntityGraph`.

### `@EntityGraph` — Declarative Fetch Plans

`@EntityGraph` provides a declarative way to specify what to fetch without writing JPQL. It's cleaner than `JOIN FETCH` when you want to reuse the same fetch plan across multiple query methods:

```java
// Define a named graph on the entity
@Entity
@NamedEntityGraph(
    name = "Employee.withDepartment",
    attributeNodes = @NamedAttributeNode("department")
)
public class Employee { ... }

// Apply it to a repository method
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @EntityGraph(attributePaths = {"department"})        // inline graph — simpler for one-off cases
    List<Employee> findByActiveTrue();

    @EntityGraph("Employee.withDepartment")              // named graph
    Optional<Employee> findById(Long id);

    @EntityGraph(attributePaths = {"department", "profile", "orders"})
    List<Employee> findByDepartmentId(Long departmentId);
}
```

The strategic rule: fetch associations **at the query level**, not at the mapping level. Your entity mappings should default everything to `LAZY`. Your repository queries should explicitly specify which associations to fetch based on what each specific use case actually needs. Different service methods will need different fetch plans — a summary list needs only the name and department, a detail page needs profile, orders, and skills.

---

<a id="ch20"></a>
## Chapter 20 — Pagination With JPA

Spring Data's `Pageable` abstraction translates to `LIMIT` and `OFFSET` in SQL. The repository returns a `Page<T>` which contains the data slice and metadata about the full result set:

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Page<Employee> findByDepartmentName(String dept, Pageable pageable);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE e.active = true")
    Page<Employee> findActiveWithDepartment(Pageable pageable);
}

// Service
public Page<EmployeeResponse> getEmployees(int page, int size, String sortBy, String direction) {

    Sort sort = Sort.by(direction.equalsIgnoreCase("desc")
        ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);

    Pageable pageable = PageRequest.of(page, size, sort);

    return employeeRepository.findByActiveTrue(pageable)
            .map(employeeMapper::toResponse);
}
```

One important JPA-specific pagination concern: when combining `JOIN FETCH` with `Pageable`, Hibernate issues a warning: `HHH90003004: firstResult/maxResults specified with collection fetch; applying in memory!`. This means Hibernate loaded the entire result set into memory and applied pagination in Java — not in the database. For large datasets, this is a serious performance problem.

The solution is to separate the concerns: use one query to get a page of entity IDs, then a second query to fetch those entities with their associations:

```java
// Step 1: paginate the IDs — efficient, no joins
@Query("SELECT e.id FROM Employee e WHERE e.active = true")
Page<Long> findActiveIds(Pageable pageable);

// Step 2: fetch the full entities for those IDs with associations
@Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE e.id IN :ids")
List<Employee> findByIdsWithDepartment(@Param("ids") List<Long> ids);
```

---

<a id="ch21"></a>
## Chapter 21 — Auditing: `@CreatedDate`, `@LastModifiedDate`

Spring Data JPA provides automatic auditing — tracking when entities were created and last modified, and optionally by whom — without manually setting these fields in every service method.

```java
// Enable auditing in a configuration class
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        // Return the current user's identifier from the security context
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName);
    }
}

// Base class — put auditing fields here, extend in all your entities
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}

// All entities extend BaseEntity to get auditing for free
@Entity
public class Employee extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    // createdAt, updatedAt, createdBy, updatedBy inherited from BaseEntity
}
```

Spring Data sets `@CreatedDate` and `@CreatedBy` once, on first persist, and never updates them (`updatable = false` enforces this at the database level). `@LastModifiedDate` and `@LastModifiedBy` are set on every update. The `AuditorAware` bean tells Spring Data where to find the current user's identity — typically extracted from the Spring Security authentication context.

---

<a id="ch22"></a>
## Chapter 22 — PostgreSQL Data Types Beyond the Basics

PostgreSQL offers data types that go well beyond what most databases support, and using them correctly lets you store and query data that would otherwise require awkward workarounds.

**Arrays:** PostgreSQL supports true array columns — a single cell can hold multiple values of the same type. Useful for tags, permissions lists, and small finite sets where a separate table feels like overkill.

```java
// Requires Hibernate's @JdbcTypeCode and the PostgreSQL dialect
@Column(columnDefinition = "text[]")
@JdbcTypeCode(SqlTypes.ARRAY)
private String[] tags;

// Querying array columns in native SQL
@Query(value = "SELECT * FROM articles WHERE :tag = ANY(tags)", nativeQuery = true)
List<Article> findByTag(@Param("tag") String tag);
```

**UUID:** PostgreSQL's native `uuid` type stores UUIDs as 16-byte binary values, not as 36-character strings — more compact, faster for indexing.

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
@Column(columnDefinition = "uuid", updatable = false)
private UUID id;
```

**Network address types:** PostgreSQL has `inet` (IPv4/IPv6 address), `cidr` (IP network), and `macaddr` — useful for network applications and more semantically meaningful than storing IPs as strings.

**Range types:** `daterange`, `tsrange`, `int4range` represent ranges with built-in overlap and containment operators (`&&`, `@>`, `<@`) — extremely useful for booking/scheduling systems where you need to check if a date range overlaps an existing reservation.

```sql
-- PostgreSQL range type query for overlapping bookings
SELECT * FROM room_bookings
WHERE daterange(check_in, check_out) && daterange(:start, :end);
```

---

<a id="ch23"></a>
## Chapter 23 — JSONB: Documents Inside a Relational Table

PostgreSQL's `jsonb` type stores JSON in a binary, indexed, queryable format — not just as a text blob. This is one of PostgreSQL's most powerful features, and it's genuinely useful for modeling data that has variable structure: product attributes that differ by category, user preferences, metadata, or configuration objects.

The distinction between `json` and `jsonb` is important: `json` stores the raw text as-is (preserving whitespace and key order) and validates syntax. `jsonb` parses and stores JSON in a decomposed binary format — it's faster to query, supports GIN indexing for path and element queries, and does not preserve key order or redundant whitespace. Always use `jsonb` unless you specifically need the raw text preserved.

```java
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes;  // {"color": "red", "size": "L", "weight": 0.5}
}
```

```java
// Querying JSONB in native SQL
@Query(
    value = "SELECT * FROM products WHERE attributes->>'color' = :color",
    nativeQuery = true
)
List<Product> findByColor(@Param("color") String color);

@Query(
    value = "SELECT * FROM products WHERE (attributes->>'weight')::numeric > :minWeight",
    nativeQuery = true
)
List<Product> findByMinWeight(@Param("minWeight") double minWeight);

// Checking if a key exists
@Query(
    value = "SELECT * FROM products WHERE attributes ? 'discount'",
    nativeQuery = true
)
List<Product> findProductsWithDiscount();

// Containment query — attributes must contain this subset of key-value pairs
@Query(
    value = "SELECT * FROM products WHERE attributes @> :criteria::jsonb",
    nativeQuery = true
)
List<Product> findMatchingAttributes(@Param("criteria") String criteriaJson);
```

Flyway migration for the GIN index that makes these queries fast:

```sql
-- V3__add_jsonb_index_to_products.sql
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
-- GIN index enables fast queries on @>, ?, ?|, ?& operators
-- For -> and ->> queries, use a functional index:
CREATE INDEX idx_products_color ON products ((attributes->>'color'));
```

---

<a id="ch24"></a>
## Chapter 24 — Enums in PostgreSQL and JPA

There are three ways to store Java enums in PostgreSQL, each with different trade-offs.

**Option 1: Store as VARCHAR (recommended for most cases)**

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 30)
private EmploymentStatus status;
```

Stores `"ACTIVE"`, `"INACTIVE"`, `"ON_LEAVE"` as readable strings. Adding a new enum constant is a non-breaking change. The readable values make debugging SQL queries straightforward. The downside is slightly more storage than ordinal or a native PostgreSQL enum.

**Option 2: Native PostgreSQL ENUM type**

```sql
-- In your Flyway migration
CREATE TYPE employment_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');
ALTER TABLE employees ADD COLUMN status employment_status NOT NULL DEFAULT 'ACTIVE';
```

```java
@Column(columnDefinition = "employment_status")
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
private EmploymentStatus status;
```

Native enums are more storage-efficient and PostgreSQL validates values at the database level. The downside: adding a new enum value requires an `ALTER TYPE` migration, and renaming or removing values is painful. Use native PostgreSQL enums when the set of values is stable and small.

**Option 3: Store as a check-constrained VARCHAR (a good middle ground)**

```sql
ALTER TABLE employees
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE'));
```

This gives you the readability of `STRING` storage, database-level constraint enforcement, and easier migration paths than a native ENUM type.

---

<a id="ch25"></a>
## Chapter 25 — Indexes in PostgreSQL: B-Tree, GIN, Partial
![PostgreSQL index types comparison — B-Tree, GIN, Partial](/images/blogs/internals/postgresql-index-types-comparison.png)

Indexes are the most important PostgreSQL performance tool available to a Spring Boot developer, and they're significantly more versatile in PostgreSQL than in most other databases. Understanding which index type to use for which query pattern is what separates an application that struggles under load from one that handles it comfortably.

**B-Tree indexes** (the default when you `CREATE INDEX` without specifying a type) maintain a balanced tree of values sorted in order. They support equality (`=`), range (`>`, `<`, `BETWEEN`), and sort operations. They are the right choice for the overwhelming majority of columns queried with equality or range conditions.

```sql
-- Standard B-Tree indexes
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_dept_salary ON employees(department_id, salary DESC);

-- Functional index — indexes the result of a function, not the raw column
-- Makes case-insensitive queries use the index
CREATE INDEX idx_employees_name_lower ON employees(LOWER(name));
```

**Partial indexes** index only the rows that satisfy a condition — a smaller, faster index that only applies to the queries you actually run frequently.

```sql
-- Only index active employees — if 90% of employees are inactive,
-- this index is 10x smaller and 10x faster for active-user queries
CREATE INDEX idx_active_employees ON employees(email) WHERE active = true;

-- Only index non-null values
CREATE INDEX idx_employees_manager ON employees(manager_id) WHERE manager_id IS NOT NULL;
```

**GIN (Generalized Inverted Index)** is designed for data types that contain multiple values — arrays, `jsonb`, and full-text search. A GIN index on a `jsonb` column enables fast `?` (key exists), `@>` (containment), and `?|` / `?&` (any/all keys exist) queries.

```sql
-- GIN for JSONB — enables fast document-style queries
CREATE INDEX idx_products_attrs ON products USING GIN (attributes);

-- GIN for full-text search
CREATE INDEX idx_articles_search ON articles USING GIN (to_tsvector('english', title || ' ' || body));
```

**Covering indexes** (index-only scans) include all columns a query needs directly in the index, so PostgreSQL can answer the query entirely from the index without touching the table at all:

```sql
-- If a query selects name and email and filters by department_id,
-- this index covers the entire query
CREATE INDEX idx_employees_covering ON employees(department_id) INCLUDE (name, email);
```

The right way to know which indexes you need is to look at your actual query patterns with `EXPLAIN ANALYZE` — read the execution plan, find the `Seq Scan` nodes on large tables, and create targeted indexes. Never guess; always measure.

---

<a id="ch26"></a>
## Chapter 26 — Transactions, Isolation Levels, and Locking

A database transaction is a unit of work that is atomic — all its statements succeed together, or none of them do. Spring Boot's `@Transactional` annotation demarcates transaction boundaries in your service layer, with Hibernate and the underlying JDBC connection managing the actual `BEGIN` / `COMMIT` / `ROLLBACK`.

```java
@Service
@Transactional(readOnly = true)   // class-level default — all methods are read-only transactions
public class EmployeeService {

    // Inherits readOnly = true — Hibernate skips dirty checking, potentially faster
    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    // Override for write methods
    @Transactional   // readOnly defaults to false — can write
    public Employee create(CreateEmployeeRequest request) {
        Employee employee = mapper.toEntity(request);
        return employeeRepository.save(employee);
    }

    // Explicit isolation level for concurrent writes on shared data
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void transferBudget(Long fromDeptId, Long toDeptId, BigDecimal amount) {
        Department from = departmentRepository.findById(fromDeptId).orElseThrow();
        Department to = departmentRepository.findById(toDeptId).orElseThrow();
        from.setBudget(from.getBudget().subtract(amount));
        to.setBudget(to.getBudget().add(amount));
    }

    // Propagation — what happens when a @Transactional method calls another
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void auditLog(String action) {
        // Runs in a completely NEW transaction — commits independently of the caller
        // Useful for audit logs that should persist even if the main transaction rolls back
        auditRepository.save(new AuditEntry(action, LocalDateTime.now()));
    }
}
```

### Optimistic vs Pessimistic Locking

**Optimistic locking** assumes conflicts are rare. Hibernate adds a `@Version` column to the entity. When updating, Hibernate includes `WHERE version = :expectedVersion` in the `UPDATE`. If another transaction modified the row (incrementing the version), the update matches zero rows, and Hibernate throws `OptimisticLockException`. No database lock is ever held — no blocking.

```java
@Entity
public class Room {

    @Id
    private Long id;

    private boolean booked;

    @Version
    private Long version;   // Hibernate manages this — includes it in UPDATE WHERE clause
}
```

**Pessimistic locking** acquires an actual database row lock immediately when reading, preventing other transactions from modifying the row until the lock is released. This guarantees consistency at the cost of throughput:

```java
public interface RoomRepository extends JpaRepository<Room, Long> {

    // SELECT ... FOR UPDATE — acquires an exclusive row lock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Room> findById(Long id);

    // SELECT ... FOR SHARE — acquires a shared row lock (others can read, not write)
    @Lock(LockModeType.PESSIMISTIC_READ)
    Optional<Room> findByIdForRead(Long id);
}
```

Optimistic locking is the right choice for most situations — it scales well because no locks are held at the database level. Pessimistic locking is the right choice when the probability of conflict is high and the cost of retrying is unacceptable (financial transactions, inventory reservations at high load).

---

<a id="ch27"></a>
## Chapter 27 — Connection Pooling: HikariCP Tuning

Every SQL statement your Spring Boot application executes travels over a JDBC connection to PostgreSQL. Opening a new JDBC connection is expensive — a TCP handshake, PostgreSQL authentication, session initialization — typically 20–100ms per connection. A connection pool maintains a set of pre-opened connections and reuses them across requests, reducing connection overhead to near zero.

Spring Boot auto-configures **HikariCP** as the connection pool — the fastest JDBC pool available for Java, and the right default. But its default configuration is not tuned for production, and an incorrectly sized pool is one of the most common sources of under-load performance problems.

```yaml
spring:
  datasource:
    hikari:
      pool-name: EmployeePool
      maximum-pool-size: 10          # max connections this pool will open to PostgreSQL
      minimum-idle: 5                 # connections kept alive when idle
      connection-timeout: 30000       # ms to wait for a connection before throwing an exception
      idle-timeout: 600000            # ms before an idle connection is closed (10 min)
      max-lifetime: 1800000           # ms before a connection is proactively recycled (30 min)
                                      # must be less than PostgreSQL's own idle connection timeout
      keepalive-time: 60000           # ms between keepalive pings to prevent firewall/proxy timeouts
      connection-test-query: SELECT 1 # validate a connection before handing it to the application
```

The most important setting is `maximum-pool-size`. The counter-intuitive truth about connection pool sizing: **more is not better**. PostgreSQL has a hard limit on `max_connections` (typically 100 by default). Each connection consumes memory on the PostgreSQL server (~10MB per connection for working memory). When 20 connections all try to execute queries simultaneously, they contend for shared database resources (CPU, I/O, locks) — throughput doesn't increase, latency does.

The empirically validated starting point for pool sizing is: `(number_of_cores * 2) + effective_spindle_count`. For a 4-core machine with SSD storage: `(4 * 2) + 1 = 9`. Tune from there based on load testing. In a horizontally scaled environment with 5 application instances each with `maximum-pool-size: 10`, you're consuming 50 of PostgreSQL's connections — which must fit within `max_connections` with room for administrative connections.

```yaml
# For read-heavy workloads: consider a read replica with a separate DataSource
# Primary DataSource — writes
spring:
  datasource:
    url: jdbc:postgresql://primary-host/mydb

# Read replica DataSource — reads (requires custom routing configuration)
app:
  datasource:
    read:
      url: jdbc:postgresql://replica-host/mydb
```

---

<a id="ch28"></a>
## Key Takeaways

**Foundations**
- JPA is the specification (interfaces + annotations), Hibernate is the implementation (SQL generation, dirty checking, proxies), and Spring Data JPA eliminates the `EntityManager` boilerplate — they're three distinct layers, each with its own responsibility and its own bugs
- Hibernate's **persistence context** (first-level cache) is the most important concept to internalize — it's why dirty checking works, why `save()` is often unnecessary, and why `LazyInitializationException` appears when you access an association outside a transaction
- Use **Flyway** for schema management, never `ddl-auto: update` — migrations are code, should be version-controlled, and must be predictable across all environments

**Relationships**
- The **owning side** holds the foreign key and is the only side Hibernate syncs to the database — always use convenience methods on the parent to set both sides of a bidirectional relationship
- Set every association to `FetchType.LAZY` explicitly — `@ManyToOne` and `@OneToOne` default to `EAGER`, which causes silent N+1 problems at scale
- Cascade `REMOVE` on `@ManyToMany` is dangerous — it can delete shared entities; only cascade `PERSIST` and `MERGE` on shared references

**Querying**
- Derived query methods are concise for simple queries; switch to `@Query` JPQL for anything with more than three conditions
- **Specifications** are the right tool for dynamic filter APIs — composable, type-safe, no string concatenation, no SQL injection risk
- **Projections** reduce data transferred from the database — use interface projections or DTO constructor expressions when you don't need the full entity

**Performance**
- The **N+1 problem** is the most common and most impactful JPA performance mistake — detect it with `TRACE`-level SQL logging and fix it with `JOIN FETCH` or `@EntityGraph` at the query level, not by changing fetch types on the mapping
- When combining `JOIN FETCH` with `Pageable`, use a two-query approach — ID pagination followed by entity fetching — to avoid Hibernate's in-memory pagination fallback

**PostgreSQL**
- `JSONB` is first-class queryable, indexable storage — use it for variable-schema data instead of serializing to a text blob; always add a GIN index for containment and key-existence queries
- Partial indexes are underused and highly effective — index only the rows your queries actually filter for
- HikariCP pool sizing is not "more is better" — an oversized pool contends on PostgreSQL resources; start with `(cores * 2) + 1` per instance and tune from real load tests
- `@Version` optimistic locking scales well and should be the default for entities with concurrent-update risk; pessimistic locking is for high-contention scenarios where retrying is unacceptable

---

*Spring Data JPA makes the easy things trivial. PostgreSQL makes the hard things possible. Mastering the layer between them — understanding what Hibernate actually does, when it generates what SQL, and how to use PostgreSQL's capabilities from within the JPA abstraction — is what makes the difference between an application that works in development and one that stays stable under production load.*
