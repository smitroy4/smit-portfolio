## From Filters to JWT, OAuth2 to Method Security — Every Concept, Every Internal

> *Imagine your Spring Boot application is a building. Every request is a visitor trying to enter. Spring Security is the entire security infrastructure of that building — the front desk that checks IDs (authentication), the access control system that decides which floors each badge allows (authorization), the security cameras (audit logging), the panic buttons (CSRF protection), and the building layout itself (filter chain). Most developers install the front door and call it done. This guide builds the whole building.*

Security is the one area where shallow knowledge is actively dangerous. A misconfigured CORS policy, a missing `@PreAuthorize`, a JWT secret stored in plain text — these aren't performance issues you can fix later. They're vulnerabilities. This guide builds the complete mental model: how Spring Security's filter chain works internally, how authentication flows through it, how JWT works cryptographically, and how OAuth2 delegates trust to external providers — all with the depth needed to configure it deliberately, not by trial and error.

---

<a id="ch1"></a>
## Chapter 1 — The Security Mindset: Authentication vs Authorization

Before touching a line of Spring Security configuration, two concepts must be completely clear — because every single decision in the framework is built around the distinction between them.

**Authentication** is the process of answering the question: *who are you?* It is the act of verifying an identity claim. When a user submits a username and password, they are asserting "I am this person" — authentication is the system checking whether that assertion is true. Authentication produces a verified identity. It says nothing about what that identity is allowed to do.

**Authorization** is the process of answering the question: *what are you allowed to do?* Given a verified identity, authorization determines whether that identity has permission to access a particular resource or perform a particular action. Authorization always comes after authentication — you cannot decide what someone is permitted to do until you know who they are.

The analogy that makes this concrete: at an airport, showing your passport to security is **authentication** — they verify you are who you claim to be. The boarding pass that determines which gate you can board at is **authorization** — it specifies what you are permitted to do given your verified identity. Your passport alone gets you through security. Your boarding pass gets you onto a specific plane. A staff ID card would get you into areas passengers never see. Same person, different levels of permission.

```
Authentication                    Authorization
─────────────────                 ─────────────────────────────
"Who are you?"                    "What are you allowed to do?"

Verifies identity                 Enforces permissions

Produces a Principal              Checks against granted authorities

Happens FIRST                     Happens AFTER authentication

Examples:                         Examples:
 - Username + password             - Role ADMIN can access /admin/**
 - JWT token validation             - Role USER cannot delete resources
 - OAuth2 token verification         - @PreAuthorize("hasRole('MANAGER')")
```

Spring Security models this distinction explicitly. After authentication, it stores a `Authentication` object in the security context — this object holds both the **Principal** (who you are) and the **GrantedAuthorities** (what you're permitted to do). Every authorization decision reads from this stored object.

---

<a id="ch2"></a>
## Chapter 2 — How Spring Security Works: The Filter Chain

Spring Security's entire architecture is built on a single, powerful concept: the **Servlet Filter Chain**. Understanding this is the key to understanding every behavior — the good, the confusing, and the seemingly magical.

In the Java Servlet model, a filter is a component that intercepts every HTTP request before it reaches your application code. Filters form a chain — each filter processes the request, then passes it to the next filter, and eventually to the servlet (your `DispatcherServlet`). Spring Security installs itself as a single special filter called `DelegatingFilterProxy` that delegates to a Spring-managed `FilterChainProxy`, which in turn holds a list of `SecurityFilterChain` instances.

![Spring Security Filter Chain Architecture](/images/blogs/internals/spring-security-filter-chain.png)

```
HTTP Request arrives
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  DelegatingFilterProxy  (Servlet container level)        │
│  — bridges Servlet world to Spring application context   │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  FilterChainProxy  (Spring Security)                      │
│  — holds one or more SecurityFilterChain instances        │
│  — picks the matching chain based on request URL          │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  SecurityFilterChain  (your configuration)                │
│                                                           │
│  Typical filter order (partial):                          │
│  1.  DisableEncodeUrlFilter                               │
│  2.  WebAsyncManagerIntegrationFilter                     │
│  3.  SecurityContextHolderFilter                          │
│  4.  HeaderWriterFilter  (security headers)               │
│  5.  CorsFilter                                           │
│  6.  CsrfFilter                                           │
│  7.  LogoutFilter                                         │
│  8.  UsernamePasswordAuthenticationFilter                 │
│  9.  BearerTokenAuthenticationFilter  (JWT/OAuth2)        │
│  10. BasicAuthenticationFilter                            │
│  11. RequestCacheAwareFilter                              │
│  12. AnonymousAuthenticationFilter                        │
│  13. ExceptionTranslationFilter  ← translates security    │
│         exceptions to HTTP responses                       │
│  14. AuthorizationFilter  ← checks permissions            │
└─────────────────────────────────────────────────────────┘
        │
        ▼
DispatcherServlet → Your @RestController
```

Each filter has a single responsibility. They run in a fixed, meaningful order — CSRF protection runs before authentication because a CSRF attack doesn't even need a valid identity. Authentication runs before authorization because you can't check permissions for an unknown identity. `ExceptionTranslationFilter` runs near the end because it needs to catch exceptions thrown by the authorization filter.

The critical insight about this architecture: **Spring Security operates entirely at the Servlet filter level, before your Spring MVC controllers are involved.** A request blocked by Spring Security never reaches `DispatcherServlet`, never reaches your `@RestController`, and never enters Spring MVC's handler mapping. This is why Spring Security can protect your API even when controllers don't exist yet — the protection is at a deeper layer.

---

<a id="ch3"></a>
## Chapter 3 — The SecurityContext and SecurityContextHolder

The `SecurityContext` is the central storage object that holds the currently authenticated user's information for the duration of a request. The `SecurityContextHolder` is the thread-local container that stores the context.

Think of `SecurityContextHolder` as a clipboard that exists per-thread. When a request arrives and authentication succeeds, Spring Security writes the authenticated user's details onto that thread's clipboard. Every piece of code executing on that same thread during that request — service methods, repository calls, business logic — can read the clipboard to know who is making the request. When the request finishes, the clipboard is cleared.

```java
// Reading the current user from anywhere in the application
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

// The principal — usually your UserDetails object
Object principal = authentication.getPrincipal();
if (principal instanceof UserDetails userDetails) {
    String username = userDetails.getUsername();
    Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
}

// Check if current user has a role
boolean isAdmin = authentication.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
```

```java
// Injecting the current user directly into a controller method
@GetMapping("/me")
public UserResponse getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
    return userService.findByEmail(userDetails.getUsername());
}

// Or injecting a custom principal directly
@GetMapping("/me")
public UserResponse getCurrentUser(@AuthenticationPrincipal CustomUserDetails user) {
    return userService.findById(user.getId());
}
```

The `SecurityContextHolder` uses a `ThreadLocal` strategy by default — the context is bound to the thread processing the request. This is why async code requires special attention: if you spawn a new thread (via `@Async` or `CompletableFuture`), the security context is not automatically propagated to the new thread. Spring Security provides `DelegatingSecurityContextRunnable` and the `MODE_INHERITABLETHREADLOCAL` strategy to handle async scenarios.

---

<a id="ch4"></a>
## Chapter 4 — Spring Security Auto-Configuration and Defaults

When you add `spring-boot-starter-security` to your `pom.xml` and run the application, something striking happens: every endpoint is immediately protected. You didn't write a line of security configuration — Spring Boot's auto-configuration did it for you.

Spring Boot's `SecurityAutoConfiguration` and `SpringBootWebSecurityConfiguration` register a default `SecurityFilterChain` bean if and only if you haven't defined one yourself (the `@ConditionalOnMissingBean` pattern from the Spring Boot internals chapter). The defaults it applies are deliberately conservative:

- Every HTTP request requires authentication — no endpoint is publicly accessible
- HTTP Basic authentication is enabled — the browser's built-in username/password popup
- A default user is created with username `user` and a randomly generated password printed to the console at startup
- CSRF protection is enabled for all state-changing requests
- A default login page is served at `/login`
- Session-based authentication is configured

These defaults are intentionally over-secure rather than under-secure. The philosophy: forcing developers to explicitly open up access is safer than forcing them to explicitly lock down access. Every whitelist is better than every blacklist for security.

As soon as you define your own `SecurityFilterChain` bean, Spring Boot's auto-configured one is suppressed entirely — you take full ownership of the security configuration.

---

<a id="ch5"></a>
## Chapter 5 — Configuring `SecurityFilterChain`

The `SecurityFilterChain` bean is the central configuration object for all of Spring Security. Everything — URL authorization rules, authentication mechanisms, CSRF settings, session management, exception handling — is configured here.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // enables @PreAuthorize, @PostAuthorize, @Secured
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless JWT APIs don't need it (see Chapter 22)
            .csrf(csrf -> csrf.disable())

            // CORS — delegate to the CorsConfig we defined
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Session management — STATELESS for JWT APIs
            // No session is created or used — every request must carry its own credentials
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // URL authorization rules — ORDER MATTERS, first match wins
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()         // public auth endpoints
                .requestMatchers("/api/v1/public/**").permitAll()        // public content
                .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll() // public reads
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")    // admin only
                .requestMatchers("/actuator/health").permitAll()          // health check
                .requestMatchers("/actuator/**").hasRole("ADMIN")         // other actuator = admin
                .anyRequest().authenticated()                              // everything else = auth required
            )

            // Exception handling
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(customAuthEntryPoint())    // 401 handler
                .accessDeniedHandler(customAccessDeniedHandler()))   // 403 handler

            // Add JWT filter BEFORE UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);  // cost factor 12 — takes ~250ms per hash
    }
}
```

The `authorizeHttpRequests` rules are evaluated in the order they are declared, and the first matching rule wins. This means more specific rules must come before more general ones — `"/api/v1/admin/**"` with `hasRole("ADMIN")` must appear before `anyRequest().authenticated()`, or the specific rule would never be reached.

---

<a id="ch6"></a>
## Chapter 6 — UserDetailsService and UserDetails

`UserDetailsService` is the interface Spring Security uses to load user information during authentication. It has exactly one method: `loadUserByUsername(String username)`. Spring Security calls this method when a user attempts to log in, passing the submitted username. Your implementation queries whatever user store you have — a database, an LDAP directory, an in-memory map — and returns a `UserDetails` object representing that user.

`UserDetails` is the contract that describes a user to Spring Security. It carries the username, the encoded password, and the user's granted authorities (roles and permissions). It also carries four boolean flags for account status: `isEnabled`, `isAccountNonExpired`, `isAccountNonLocked`, and `isCredentialsNonExpired`. Spring Security checks all four automatically during authentication — a disabled account fails authentication even with the correct password.

```java
// Your user entity
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;   // always the BCrypt hash, never plaintext

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled = true;
}

// Custom UserDetails — wraps your entity, implements the Spring Security contract
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Prefix "ROLE_" is required for hasRole() checks — hasAuthority() doesn't need the prefix
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override public String getPassword() { return user.getPassword(); }
    @Override public String getUsername() { return user.getEmail(); }
    @Override public boolean isEnabled() { return user.isEnabled(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    // Expose the underlying entity for convenience
    public Long getId() { return user.getId(); }
    public User getUser() { return user; }
}

// Your UserDetailsService implementation
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                    "No user found with email: " + email));
        return new CustomUserDetails(user);
    }
}
```

> ⚠️ **The `UsernameNotFoundException` timing attack:** throwing a different exception for "user not found" vs "wrong password" leaks information to an attacker — they can determine whether an email is registered by observing whether the error is "user not found" or "invalid credentials." Always return the same error message regardless of which check failed: `"Invalid credentials"`. Spring Security's `DaoAuthenticationProvider` already does this correctly by internally mapping `UsernameNotFoundException` to `BadCredentialsException` before it surfaces.

---

<a id="ch7"></a>
## Chapter 7 — PasswordEncoder: Storing Passwords Safely

Storing passwords in plaintext is a critical vulnerability — if your database is compromised, every user's password is immediately exposed. Storing MD5 or SHA hashes is nearly as bad — these are fast hashing algorithms, and modern GPUs can compute billions of SHA-256 hashes per second, making brute-force attacks practical.

The correct approach is a **slow, salted hashing algorithm** designed specifically for passwords. Spring Security's `BCryptPasswordEncoder` uses the BCrypt algorithm, which:

1. **Incorporates a random salt** — a unique random value mixed into each hash. Two users with the same password produce completely different hashes. This defeats precomputed rainbow table attacks.
2. **Is deliberately slow** — the cost factor (the `strength` parameter) controls how many rounds of computation are performed. At cost factor 12, a single hash takes approximately 250ms on modern hardware. This makes brute-force attacks computationally expensive — a billion guesses per second becomes 4 million guesses per second.
3. **Stores the salt in the hash** — the BCrypt output is a self-contained string that includes the algorithm version, cost factor, salt, and hash. Spring Security can verify a password using only the stored hash string — no separate salt storage needed.

```java
@Bean
public PasswordEncoder passwordEncoder() {
    // Cost factor 12 is the modern recommendation — balance security vs latency
    // Cost 10 = ~100ms, Cost 12 = ~250ms, Cost 14 = ~1000ms per hash
    return new BCryptPasswordEncoder(12);
}

// Hashing a new password — during registration
String rawPassword = "mySecurePassword123";
String hashed = passwordEncoder.encode(rawPassword);
// hashed = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW"
//           ↑ algorithm + cost factor + 22-char salt + 31-char hash

// Verifying a password — during login
boolean matches = passwordEncoder.matches(rawPassword, hashed);  // true

// Spring Security's DelegatingPasswordEncoder — supports multiple algorithms
// Recognizes {bcrypt}, {argon2}, {pbkdf2} prefixes for gradual algorithm migration
PasswordEncoder delegating = PasswordEncoderFactories.createDelegatingPasswordEncoder();
```

`Argon2PasswordEncoder` is the modern alternative — the winner of the 2015 Password Hashing Competition, resistant to both GPU and ASIC attacks. Spring Security ships an implementation. For new systems, Argon2 is the better choice. BCrypt remains widely deployed and entirely acceptable.

---

<a id="ch8"></a>
## Chapter 8 — The Authentication Flow: Step by Step

Understanding precisely how Spring Security processes a login request makes every configuration decision obvious rather than arbitrary. Here is the exact sequence for a `POST /api/v1/auth/login` with username and password:

![Spring Security Authentication Flow](/images/blogs/internals/spring-security-authentication-flow.png)

```
1. HTTP POST /api/v1/auth/login arrives with { email, password }

2. Request passes through the filter chain
   — SecurityContextHolderFilter: checks if a context already exists
   — BearerTokenFilter: no Authorization header, passes through
   — UsernamePasswordAuthenticationFilter: not triggered (we're using a custom endpoint)

3. Request reaches your AuthController.login() method

4. AuthController calls AuthenticationManager.authenticate(
       new UsernamePasswordAuthenticationToken(email, rawPassword)
   )

5. AuthenticationManager delegates to DaoAuthenticationProvider

6. DaoAuthenticationProvider calls UserDetailsService.loadUserByUsername(email)
   → Your database is queried
   → A UserDetails object is returned (or UsernameNotFoundException is thrown)

7. DaoAuthenticationProvider calls PasswordEncoder.matches(rawPassword, storedHash)
   → BCrypt runs 2^12 rounds of computation
   → Returns true if passwords match, false otherwise

8. If match:
   → DaoAuthenticationProvider creates a fully authenticated
     UsernamePasswordAuthenticationToken with:
     - principal: the UserDetails object
     - credentials: null (cleared for security)
     - authorities: the user's granted authorities

9. The Authentication object is returned to your AuthController

10. Your AuthController:
    → Generates a JWT token from the Authentication
    → Returns the JWT in the response body
    → Does NOT store anything in server-side session (stateless)

11. Future requests carry the JWT in the Authorization: Bearer <token> header
    → The JwtAuthenticationFilter validates the token
    → Populates the SecurityContext with the Authentication
    → Request proceeds to the controller
```

The key design point: in a JWT-based REST API, your `AuthController` is the only place where `AuthenticationManager.authenticate()` is called explicitly. Every subsequent request authenticates via the JWT filter — the `AuthenticationManager` is never called again for authenticated requests.

---

<a id="ch9"></a>
## Chapter 9 — Session-Based Authentication (Traditional)

Before JWT became ubiquitous for REST APIs, session-based authentication was the standard — and it still is for traditional server-rendered web applications. Understanding it is important both for working with legacy codebases and for understanding *why* JWT was created to solve its specific limitations.

In session-based authentication, after a successful login the server creates a **session** — a server-side record of the authenticated state — and sends a `Set-Cookie: JSESSIONID=abc123` header. The browser stores this cookie and sends it automatically on every subsequent request. The server looks up the session by ID on each request to retrieve the authentication state.

```java
// Session-based security configuration (for traditional web apps, NOT REST APIs)
http
    .formLogin(form -> form
        .loginPage("/login")
        .defaultSuccessUrl("/dashboard")
        .failureUrl("/login?error=true"))
    .logout(logout -> logout
        .logoutUrl("/logout")
        .logoutSuccessUrl("/login?logout=true")
        .invalidateHttpSession(true)
        .deleteCookies("JSESSIONID"))
    .sessionManagement(session -> session
        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
        .maximumSessions(1)             // prevent concurrent sessions for the same user
        .maxSessionsPreventsLogin(false)); // true = new login rejected, false = old session invalidated
```

Session-based authentication has two properties that shaped the shift toward JWT. First, it is **stateful** — the server must store session data, either in memory or in a shared store (Redis, a database). Horizontal scaling requires all server instances to share the session store — a `JSESSIONID` issued by server A must be resolvable by server B. Second, every authenticated request requires a session lookup — a database or cache read — even when the request contains all the information needed to verify identity.

JWT solved both properties: no server-side state, and identity verification from the token itself. The trade-off is that sessions can be instantly invalidated (delete the session record), while JWTs cannot be revoked before expiration without additional infrastructure (a token blacklist). Every security choice is a trade-off.

---

<a id="ch10"></a>
## Chapter 10 — What JWT Actually Is: Structure and Cryptography

JWT (JSON Web Token) is a compact, self-contained token format defined by RFC 7519. "Self-contained" means the token carries its own claims — the user's ID, email, roles, and expiration time — encoded within the token itself. The server does not need to look anything up to verify a JWT; it simply checks the signature.

A JWT consists of three Base64URL-encoded parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNtaXQgUm95IiwiaWF0IjoxNzE2MDAwMDAwLCJleHAiOjE3MTYwODY0MDB9
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Part 1 — Header:** describes the token type and signing algorithm.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Part 2 — Payload (Claims):** the actual data. Standard claims have reserved names:

```json
{
  "sub": "1234",          // subject — usually the user's ID
  "iat": 1716000000,      // issued at — Unix timestamp
  "exp": 1716086400,      // expiration — Unix timestamp (24 hours later)
  "email": "smit@example.com",
  "roles": ["ROLE_USER"],
  "jti": "unique-token-id" // JWT ID — for blacklisting specific tokens
}
```

**Part 3 — Signature:** the cryptographic proof that the header and payload haven't been tampered with.

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

The signature is computed by the server using a secret key (for HMAC algorithms like HS256) or a private key (for asymmetric algorithms like RS256). When the server receives a JWT, it recomputes the signature from the received header and payload and compares it to the signature in the token. If they match, the payload is authentic and unmodified. If someone edited the payload (changed `"roles": ["ROLE_USER"]` to `"roles": ["ROLE_ADMIN"]`), the signature would no longer match — the tampered token fails verification.

```
HS256 (HMAC-SHA256) — Symmetric
  Same secret key signs AND verifies
  Good for: single service or services sharing the secret
  Risk: every service that verifies must hold the secret — if one is compromised, all are

RS256 (RSA-SHA256) — Asymmetric
  Private key signs, Public key verifies
  Good for: microservices — only the auth service holds the private key
            all other services hold only the public key for verification
  Standard for: OAuth2 providers (Google, GitHub issue RS256 tokens)
```

> ⚠️ **Critical: the payload is not encrypted, only signed.** Anyone can decode the Base64 payload and read the claims. Never put sensitive information (passwords, payment details, secrets) in a JWT payload. The signature only proves the data wasn't modified — it does not hide the data.

---

<a id="ch11"></a>
## Chapter 11 — Why JWT for REST APIs

The stateless nature of JWT aligns perfectly with REST's statelessness constraint. Each request carries its own complete credentials in the `Authorization: Bearer <token>` header — the server needs no memory of previous requests, holds no sessions, and requires no shared state between instances.

```
Session-Based (Stateful)              JWT-Based (Stateless)
────────────────────────              ─────────────────────
Server stores session data            Server stores nothing per-user
Requires shared session store         No coordination between instances
Scales horizontally with complexity   Scales horizontally trivially
Instant revocation possible           Revocation requires blacklist
Cookie-based (CSRF risk)              Header-based (CSRF immune)
Works with browsers naturally         Works with any HTTP client
```

For a horizontally scaled microservices architecture — multiple instances of a service behind a load balancer — JWT means any instance can validate any token independently. There is no "which server has this session?" problem. This is the primary engineering reason JWT became standard for REST APIs and microservices.

The revocation trade-off deserves honesty: a JWT cannot be invalidated before its expiration time without server-side state (a blacklist). If a user logs out, changes their password, or has their account disabled, any previously issued JWT remains valid until it expires. The mitigations are: short expiration times (15 minutes to 1 hour for access tokens), refresh tokens for obtaining new access tokens, and a token blacklist (typically Redis-backed) for logout and forced invalidation scenarios.

---

<a id="ch12"></a>
## Chapter 12 — Implementing JWT: Token Generation and Validation

```xml
<!-- pom.xml — JJWT library for JWT handling -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

```yaml
# application.yml — never hardcode secrets in source code
app:
  jwt:
    secret: ${JWT_SECRET}           # inject from environment variable
    expiration: 86400000            # 24 hours in milliseconds
    refresh-expiration: 604800000   # 7 days in milliseconds
```

```java
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    // Derive a type-safe signing key from the Base64-encoded secret
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate an access token
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails instanceof CustomUserDetails custom) {
            extraClaims.put("userId", custom.getId());
            extraClaims.put("roles", custom.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
        }
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    // Generate a refresh token — minimal claims, longer lived
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration) {

        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Validate token — returns true if valid and not expired
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        // parseSignedClaims verifies the signature AND expiration simultaneously
        // Throws JwtException (ExpiredJwtException, MalformedJwtException, etc.) if invalid
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

---

<a id="ch13"></a>
## Chapter 13 — The JWT Filter: Plugging Into the Filter Chain

The JWT filter is a `OncePerRequestFilter` — guaranteed to execute exactly once per request — that intercepts every incoming request, extracts the JWT from the `Authorization` header, validates it, and populates the `SecurityContext` with the authenticated user's details. If it runs successfully, the downstream `AuthorizationFilter` finds an authenticated user in the context and permits the request. If it finds no token or an invalid one, the context remains empty and the `AuthorizationFilter` rejects the request with a `401 Unauthorized`.

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // 2. No header or doesn't start with "Bearer " — pass through, let security rules decide
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token string
        final String jwt = authHeader.substring(7);   // remove "Bearer " prefix

        try {
            // 4. Extract username from token (validates signature simultaneously)
            final String username = jwtService.extractUsername(jwt);

            // 5. Only proceed if username extracted AND not already authenticated
            if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Load the user from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 7. Validate the token against the loaded user
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 8. Create an authentication token and set it in the SecurityContext
                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,                             // credentials cleared after auth
                            userDetails.getAuthorities()
                        );
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            // Token is valid but expired — let the request proceed without authentication
            // The AuthorizationFilter will reject it with 401
            log.debug("JWT token expired for request to {}", request.getRequestURI());
        } catch (JwtException e) {
            // Token is malformed, tampered, or has invalid signature
            log.warn("Invalid JWT token for request to {}: {}", request.getRequestURI(), e.getMessage());
        }

        // 9. Always pass to next filter — authorization decisions happen in AuthorizationFilter
        filterChain.doFilter(request, response);
    }

    // Skip JWT processing for public endpoints — optimization, not a security requirement
    // (the AuthorizationFilter handles public routes; this just avoids unnecessary parsing)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getServletPath().startsWith("/api/v1/auth/");
    }
}
```

The `AuthController` that handles login and registration:

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        return new AuthResponse(accessToken, refreshToken);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        // This throws AuthenticationException if credentials are invalid
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        return new AuthResponse(accessToken, refreshToken);
    }
}
```

---

<a id="ch14"></a>
## Chapter 14 — JWT Refresh Tokens: Keeping Sessions Alive Safely

An access token with a 15-minute expiration provides excellent security — a stolen token is only valid for a short window. But requiring users to log in every 15 minutes is unacceptable UX. Refresh tokens solve this: a long-lived token (days or weeks) that can only be used to obtain new access tokens, not to access protected resources.

The pattern is two-token authentication:

```
Access Token:   Short-lived (15 min – 1 hour)
                Sent on every API request in Authorization header
                If stolen: attacker has access for at most 1 hour

Refresh Token:  Long-lived (7–30 days)
                Stored securely (HttpOnly cookie or secure storage)
                Sent ONLY to /auth/refresh endpoint
                Rotated on use — old refresh token invalidated, new one issued
                Stored in database — can be explicitly invalidated on logout
```

```java
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean revoked = false;
}

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository tokenRepository;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        RefreshToken stored = tokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        if (stored.isRevoked()) {
            // Possible token reuse attack — revoke ALL tokens for this user
            revokeAllUserTokens(stored.getUser());
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Refresh token has expired");
        }

        // Rotate the refresh token — revoke old, issue new
        stored.setRevoked(true);
        tokenRepository.save(stored);

        UserDetails userDetails = new CustomUserDetails(stored.getUser());
        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        // Save new refresh token
        saveRefreshToken(stored.getUser(), newRefreshToken);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }
}
```

Refresh token rotation — issuing a new refresh token on every use and revoking the old one — detects token theft: if an attacker and the legitimate user both try to use the same refresh token, the second use sees a revoked token and triggers a full revocation of all the user's tokens, forcing a re-login.

---

<a id="ch15"></a>
## Chapter 15 — Role-Based Access Control: `hasRole` and `hasAuthority`

Authorization in Spring Security is expressed as **granted authorities** — strings representing what a user is permitted to do. Roles are a specialized convention on top of authorities: a role is an authority prefixed with `ROLE_`. This prefix distinction drives the `hasRole()` vs `hasAuthority()` behavior.

```java
// hasRole("ADMIN") checks for authority "ROLE_ADMIN" — prefix added automatically
// hasAuthority("ROLE_ADMIN") checks for exactly "ROLE_ADMIN" — no prefix added

// In URL authorization rules
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")              // checks ROLE_ADMIN
    .requestMatchers("/manager/**").hasAnyRole("ADMIN", "MANAGER") // checks ROLE_ADMIN or ROLE_MANAGER
    .requestMatchers("/reports/**").hasAuthority("REPORT_READ") // checks exact string REPORT_READ
    .anyRequest().authenticated()
)
```

Fine-grained permissions (beyond roles) are modeled as additional `GrantedAuthority` entries. This is the difference between RBAC (role-based) and permission-based access control:

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    List<GrantedAuthority> authorities = new ArrayList<>();

    // Role-level authority
    authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

    // Fine-grained permission authorities from the user's permissions
    user.getPermissions().forEach(permission ->
        authorities.add(new SimpleGrantedAuthority(permission.name()))
    );
    // e.g., EMPLOYEE_READ, EMPLOYEE_WRITE, SALARY_READ, REPORT_GENERATE

    return authorities;
}
```

---

<a id="ch16"></a>
## Chapter 16 — Method-Level Security: `@PreAuthorize`, `@PostAuthorize`

URL-based authorization in `SecurityFilterChain` is coarse-grained — it secures endpoints by URL pattern. Method-level security is fine-grained — it secures individual service methods, including access to the method's arguments and return value. Enable it with `@EnableMethodSecurity` on your configuration class.

```java
@Service
public class EmployeeService {

    // Simple role check — only ADMIN can call this method
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    // Check based on method parameter — MANAGER can only access their own department
    @PreAuthorize("hasRole('ADMIN') or " +
                  "@departmentService.isManagerOf(authentication.name, #departmentId)")
    public List<Employee> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }

    // @PostAuthorize — runs AFTER the method, has access to the return value
    // Use for: only return the resource if the current user owns it
    @PostAuthorize("returnObject.email == authentication.name or hasRole('ADMIN')")
    public Employee getEmployee(Long id) {
        return employeeRepository.findById(id).orElseThrow();
    }

    // Combining conditions
    @PreAuthorize("hasAuthority('SALARY_READ') or hasRole('HR') or " +
                  "#employeeId == authentication.principal.id")
    public BigDecimal getSalary(Long employeeId) {
        return employeeRepository.findSalaryById(employeeId);
    }
}
```

`@PostAuthorize` is particularly useful for ownership checks where you need the actual returned object to make the decision. The trade-off: the method runs fully before the authorization check — the database query executes, then the result is checked, then optionally thrown away with a `403`. This is acceptable for reads but think carefully before using it on expensive write operations.

---

<a id="ch17"></a>
## Chapter 17 — Expression-Based Access Control

Spring Security's authorization expressions are powered by Spring Expression Language (SpEL). The expressions in `hasRole()`, `@PreAuthorize`, and URL rules are evaluated against a security-specific evaluation context that exposes useful variables and methods:

```java
// Built-in security expressions
hasRole('ADMIN')                      // has ROLE_ADMIN authority
hasAnyRole('ADMIN', 'MANAGER')        // has any of the listed roles
hasAuthority('REPORT_GENERATE')       // has exact authority string
isAuthenticated()                      // any authenticated user (not anonymous)
isAnonymous()                          // unauthenticated / anonymous user
isFullyAuthenticated()                 // authenticated and not via remember-me
permitAll()                            // always allowed
denyAll()                              // always denied

// Access to the current user's details
authentication.name                    // the username (email in our case)
authentication.principal               // the UserDetails object
authentication.principal.id            // our custom getId() method

// Method parameters (in @PreAuthorize)
#paramName                             // the value of the method parameter

// Bean reference
@beanName.method(args)                 // call a method on a Spring bean
```

```java
// Real-world examples of complex expressions
@PreAuthorize("@securityService.canAccessProject(authentication, #projectId)")
public Project getProject(Long projectId) { ... }

// The securityService bean makes the complex check
@Service
public class SecurityService {
    public boolean canAccessProject(Authentication auth, Long projectId) {
        String email = auth.getName();
        return projectRepository.isMember(email, projectId) ||
               auth.getAuthorities().stream()
                   .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
```

Delegating complex authorization logic to a service bean keeps your `@PreAuthorize` expressions readable and moves the logic to a testable class — you can unit test `SecurityService.canAccessProject()` independently of the security framework.

---

<a id="ch18"></a>
## Chapter 18 — OAuth2: The Problem It Solves

OAuth2 addresses a specific, important problem: how does a third-party application gain access to a user's data without ever knowing the user's password?

Before OAuth2, the pattern was "credential sharing" — if you wanted a third-party application to access your GitHub repositories, you gave it your GitHub username and password. The application could then do anything your credentials allowed, forever, with no way to revoke access without changing your password. This is obviously terrible.

OAuth2 (RFC 6749) defines a protocol for **delegated authorization** — a resource owner (you) can grant a third-party application limited access to a resource server (GitHub), without sharing credentials, through an authorization server (GitHub's OAuth service). The application receives an **access token** — a credential scoped to specific permissions and limited in time — rather than your password.

```
The Four OAuth2 Roles:
─────────────────────────────────────────────────────────────────
Resource Owner      You — the user who owns the protected data

Client              The application requesting access to your data
                    (a Spring Boot app wanting to read your GitHub profile)

Authorization Server  The entity that issues tokens after verifying your consent
                      (GitHub's OAuth server at github.com/login/oauth/authorize)

Resource Server     The API that holds your protected data
                    (GitHub's API at api.github.com)
```

The critical security improvement: the Client never sees your GitHub password. You authenticate directly with GitHub's Authorization Server. GitHub then gives the Client a token scoped to exactly what you consented to. The Client presents that token to GitHub's API. If you want to revoke the Client's access, you revoke the token — your password is untouched.

---

<a id="ch19"></a>
## Chapter 19 — OAuth2 Authorization Code Flow: Step by Step

The Authorization Code flow is the most secure and most common OAuth2 flow, designed for server-side applications. Here is the exact sequence when a user clicks "Login with Google":

![OAuth2 Authorization Code Flow](/images/blogs/internals/oauth2-authorization-code-flow.png)

```
1. User clicks "Login with Google" in your application

2. Your application redirects the browser to Google's Authorization Server:
   https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=YOUR_CLIENT_ID
     &redirect_uri=https://yourapp.com/login/oauth2/code/google
     &response_type=code
     &scope=openid email profile
     &state=random_csrf_prevention_value

3. Browser arrives at Google's login page
   — User authenticates with Google (your app never sees these credentials)
   — Google shows a consent screen: "Your App wants to access your email and profile"
   — User clicks "Allow"

4. Google redirects the browser BACK to your redirect_uri with an authorization code:
   https://yourapp.com/login/oauth2/code/google
     ?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
     &state=random_csrf_prevention_value

5. Your Spring Boot application (server-to-server, not browser) exchanges the code
   for tokens by calling Google's token endpoint:
   POST https://oauth2.googleapis.com/token
     client_id=YOUR_CLIENT_ID
     client_secret=YOUR_CLIENT_SECRET
     code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
     grant_type=authorization_code
     redirect_uri=https://yourapp.com/login/oauth2/code/google

6. Google responds with:
   {
     "access_token": "ya29.a0AfH6...",
     "id_token": "eyJhbGci...",    // OpenID Connect ID token with user info
     "expires_in": 3599,
     "token_type": "Bearer"
   }

7. Your application uses the id_token to get the user's email and profile
   — Creates or updates a local user record
   — Issues your own JWT for subsequent API calls
   — Redirects the browser to your frontend with the session/token
```

The authorization code is short-lived (seconds to minutes) and single-use. It is exchanged for tokens via a server-to-server call that includes your `client_secret` — a secret that never leaves your server and never appears in the browser. This is why the "code" grant is secure: even if the browser's redirect is intercepted, the attacker gets only a short-lived code they cannot exchange without your secret.

---

<a id="ch20"></a>
## Chapter 20 — Spring Boot OAuth2 Login: Google and GitHub

Spring Security's OAuth2 login support handles the entire Authorization Code flow automatically. You provide client credentials and endpoint URLs — Spring handles the redirect, the code exchange, the token fetching, and the principal mapping.

```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, email, profile
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"

          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: read:user, user:email
```

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")                            // custom login page
                .userInfoEndpoint(info -> info
                    .oidcUserService(oidcUserService))          // custom user mapping
                .successHandler(oauth2SuccessHandler())          // post-login redirect
                .failureHandler(oauth2FailureHandler())
            );

        return http.build();
    }
}

// Custom OAuth2 user service — creates or updates your local user record
@Service
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUserService delegate = new OidcUserService();
        OidcUser oidcUser = delegate.loadUser(request);

        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String provider = request.getClientRegistration().getRegistrationId(); // "google" or "github"

        // Create or update the local user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .provider(provider)
                        .role(Role.USER)
                        .enabled(true)
                        .build()));

        return oidcUser;  // return the OIDC user — Spring Security uses it for the session
    }
}
```

For a JWT-based API (not session-based), the OAuth2 success handler should issue a JWT rather than establish a session:

```java
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        User user = userRepository.findByEmail(oidcUser.getEmail()).orElseThrow();

        String jwt = jwtService.generateToken(new CustomUserDetails(user));

        // Redirect to frontend with JWT as query param — frontend stores it
        // (Use fragment or a one-time code pattern for production to avoid JWT in logs)
        String frontendUrl = "https://yourfrontend.com/oauth2/callback?token=" + jwt;
        response.sendRedirect(frontendUrl);
    }
}
```

---

<a id="ch21"></a>
## Chapter 21 — OAuth2 Resource Server: Protecting APIs With External JWTs

When your Spring Boot service is a **Resource Server** — an API that accepts tokens issued by an external Authorization Server (Auth0, Keycloak, Okta, or your own OAuth2 server) — Spring Security can automatically validate those tokens using the Authorization Server's public keys.

This is different from the JWT implementation in Chapter 12 where you issued and validated your own tokens. Here, an external party issues the tokens using RS256 (asymmetric signing), and your service validates them using the Authorization Server's published JWK (JSON Web Key Set) — the public keys available at a well-known URL.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          # Spring Security fetches the public keys from this URL automatically
          jwk-set-uri: https://your-auth-server.com/.well-known/jwks.json
          # Or for OIDC issuers, Spring auto-discovers the JWKS URI:
          issuer-uri: https://your-auth-server.com
```

```java
@Configuration
@EnableWebSecurity
public class ResourceServerConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );
        return http.build();
    }

    // Convert JWT claims to Spring Security authorities
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter =
            new JwtGrantedAuthoritiesConverter();

        // The claim in the JWT that contains roles/scopes
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        // Add ROLE_ prefix automatically
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return converter;
    }
}
```

Spring Security's resource server support caches the JWK keys and refreshes them periodically — you never implement key fetching or rotation logic manually.

---

<a id="ch22"></a>
## Chapter 22 — CSRF: What It Is and When to Disable It

**CSRF (Cross-Site Request Forgery)** is an attack where a malicious website tricks an authenticated user's browser into making a request to your application. The attack works because browsers automatically attach cookies to requests — including session cookies that prove the user's authenticated state.

The attack scenario: you are logged into `bank.com`. You visit `evil.com`. Evil.com's page contains `<form action="https://bank.com/transfer" method="POST"><input name="to" value="attacker">`. The moment you load the page, the form submits automatically. Your browser attaches your `bank.com` session cookie. The bank's server sees an authenticated request and processes the transfer.

CSRF protection works by requiring a secret token — known only to your server and the legitimate page it rendered — to accompany every state-changing request. Since `evil.com` cannot read the CSRF token from your session (same-origin policy prevents cross-origin JavaScript from reading cookies or responses), it cannot forge a valid request.

**CSRF protection is only necessary for cookie-based authentication.** REST APIs that use JWT in the `Authorization` header are immune to CSRF attacks because:

1. Browsers do not automatically attach `Authorization` headers to cross-origin requests
2. `evil.com` cannot set the `Authorization: Bearer <jwt>` header on a forged request
3. Without the JWT, the forged request is unauthenticated

This is why every JWT-based REST API configuration includes `.csrf(csrf -> csrf.disable())`. CSRF protection on a stateless JWT API adds overhead with zero security benefit.

```java
// Stateless JWT API — disable CSRF
http.csrf(csrf -> csrf.disable());

// Traditional session-based web app — keep CSRF enabled (default)
// Spring Security handles it automatically with Synchronizer Token Pattern
http.csrf(Customizer.withDefaults());

// Modern alternative: SameSite cookie attribute
// Adding SameSite=Strict to the session cookie prevents CSRF without token overhead
http.sessionManagement(session -> session
    .sessionFixation().newSession()
).csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));
```

---

<a id="ch23"></a>
## Chapter 23 — CORS in Spring Security

When Spring Security is on the classpath, CORS must be configured through Spring Security — not just through `WebMvcConfigurer`. If you configure CORS only in Spring MVC and forget Spring Security, preflight `OPTIONS` requests will be rejected by the security filter chain before they ever reach Spring MVC's CORS handling.

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // Delegate CORS to the CorsConfigurationSource bean below
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        // ... rest of config
    ;
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(
        "http://localhost:3000",
        "https://yourfrontend.com"
    ));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

Spring Security's `CorsFilter` handles `OPTIONS` preflight requests early in the filter chain — before authentication — so preflight requests succeed even for secured endpoints. This is correct behavior: the CORS preflight just asks "is this origin allowed?", not "is this user authenticated?".

---

<a id="ch24"></a>
## Chapter 24 — Security Headers

Spring Security's `HeaderWriterFilter` automatically adds security-related HTTP response headers that protect against common browser-based attacks. These headers are enabled by default and require no configuration for basic protection.

```java
// Security headers are enabled by default — this shows what's happening automatically
http.headers(headers -> headers
    .frameOptions(frame -> frame.deny())              // X-Frame-Options: DENY (clickjacking protection)
    .contentTypeOptions(Customizer.withDefaults())     // X-Content-Type-Options: nosniff
    .httpStrictTransportSecurity(hsts -> hsts          // HSTS — forces HTTPS
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000))
    .contentSecurityPolicy(csp -> csp                  // CSP — controls what resources can load
        .policyDirectives("default-src 'self'; " +
                          "script-src 'self'; " +
                          "object-src 'none'"))
    .referrerPolicy(referrer -> referrer
        .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
);
```

| Header | Protection Against |
|---|---|
| `X-Frame-Options: DENY` | Clickjacking — embedding your site in an `<iframe>` on an attacker's page |
| `X-Content-Type-Options: nosniff` | MIME type sniffing — browser executing a response as a different type than declared |
| `Strict-Transport-Security` | Protocol downgrade attacks — forces HTTPS even if user types HTTP |
| `Content-Security-Policy` | XSS — restricts which scripts, styles, and resources the page can load |
| `Referrer-Policy` | Referrer leaking — controls how much referrer information is sent |

---

<a id="ch25"></a>
## Chapter 25 — Auditing and Security Events

Spring Security publishes events throughout the authentication and authorization lifecycle. Listening to these events enables security auditing — building an immutable log of who authenticated, when, from where, and what they attempted to access.

```java
@Component
@Slf4j
public class SecurityAuditListener {

    private final AuditLogRepository auditLogRepository;

    // Successful login
    @EventListener
    public void handleAuthenticationSuccess(AuthenticationSuccessEvent event) {
        String username = event.getAuthentication().getName();
        log.info("Successful login for user: {}", username);
        auditLogRepository.save(AuditLog.of("LOGIN_SUCCESS", username, LocalDateTime.now()));
    }

    // Failed login attempt
    @EventListener
    public void handleAuthenticationFailure(AbstractAuthenticationFailureEvent event) {
        String username = event.getAuthentication().getName();
        String reason = event.getException().getMessage();
        log.warn("Failed login attempt for user: {} — reason: {}", username, reason);
        auditLogRepository.save(AuditLog.of("LOGIN_FAILURE", username, LocalDateTime.now()));
        // Consider: after N failures, lock the account or trigger a notification
    }

    // Authorization failure (403)
    @EventListener
    public void handleAuthorizationFailure(AuthorizationDeniedEvent event) {
        String username = event.getAuthentication().get().getName();
        log.warn("Authorization denied for user: {} attempting: {}",
            username, event.getAuthorizationDecision());
    }
}
```

For production audit logging, these events should write to an immutable append-only store — a separate audit table with no `UPDATE` or `DELETE` permissions for the application user, or an external audit log service. Audit logs are only meaningful if they cannot be modified after the fact.

---

<a id="ch26"></a>
## Chapter 26 — Common Security Mistakes

Understanding what goes wrong is as important as knowing what to do right. These are the most frequent Spring Security mistakes in real codebases:

| Mistake | Why It's Dangerous | Fix |
|---|---|---|
| Storing JWT secret in `application.properties` (committed to Git) | The secret is the entire security of your JWT — anyone with the Git history can forge tokens | Store in environment variables, vault, or secrets manager — never in source code |
| `anyRequest().permitAll()` as the last rule before `anyRequest().authenticated()` | The permit-all rule matches first and bypasses all authentication | Never use `permitAll()` as the final catch-all; use `authenticated()` |
| Short BCrypt cost factor (`strength = 4`) | Fast hashing means faster brute-force attacks | Use cost 12 (production) or 10 (minimum acceptable) |
| Logging the JWT token | Log files often have wider access than databases; a JWT in a log is a leaked credential | Log token prefixes at most (`Bearer ey...` → `Bearer [REDACTED]`) |
| Disabling CSRF on session-based apps "because it was annoying" | Cookie-based apps are CSRF-vulnerable without the token | Only disable CSRF for stateless JWT APIs |
| Not expiring JWT tokens | A stolen token is valid until the secret changes | Always set `exp` claim; 15min–1hr for access tokens |
| Using `@Secured` instead of `@PreAuthorize` | `@Secured` does not support SpEL expressions — limited to simple role checks | Use `@PreAuthorize` for consistent, powerful authorization expressions |
| HTTP Basic auth on a public API | Credentials are Base64-encoded, not encrypted — trivially decoded over HTTP | Always use HTTPS; prefer JWT or OAuth2 for APIs |
| Catching all exceptions in JwtFilter and returning 200 | Invalid tokens silently "authenticate" as anonymous, bypassing security | Let the filter chain handle it — return no body from the filter, let `ExceptionTranslationFilter` respond |
| Same JWT secret across environments | A development secret accidentally used in production, or a test system able to forge production tokens | Different secrets per environment, rotated regularly |

---

<a id="ch27"></a>
## Key Takeaways

**Foundations**
- Authentication answers "who are you?"; authorization answers "what are you allowed to do?" — every Spring Security component maps to one of these two concerns
- Spring Security operates entirely at the **Servlet Filter level**, before Spring MVC — a blocked request never reaches your `@RestController`
- The `SecurityContextHolder` is a thread-local clipboard — it holds the authenticated user for the duration of a request and is cleared when the request completes
- Auto-configuration defaults are deliberately over-secure — define your own `SecurityFilterChain` bean and Spring Boot's defaults are suppressed

**JWT**
- A JWT is three Base64URL-encoded parts: header (algorithm), payload (claims), signature (cryptographic proof) — the payload is readable by anyone, signed but not encrypted; never put secrets in JWT claims
- HS256 (symmetric) works for single services; RS256 (asymmetric) works for microservices — only the issuer holds the private key, all verifiers hold the public key
- Short-lived access tokens (15min–1hr) plus rotating refresh tokens (7–30 days stored in database) give the best balance of security and UX
- The JWT filter must populate the `SecurityContext` with an `Authentication` object — if it doesn't, the `AuthorizationFilter` treats the request as anonymous

**OAuth2**
- OAuth2 solves delegated authorization — a third-party app gains limited access to your resources without ever seeing your password
- The Authorization Code flow never exposes your secret to the browser — the code exchange happens server-to-server
- As a Resource Server, configure Spring Security with the Authorization Server's JWK URI — Spring fetches and caches the public keys automatically
- Your OAuth2 success handler should issue your own JWT for subsequent API calls, not rely on the OAuth2 provider's token directly

**Security Posture**
- Never store JWT secrets or OAuth2 client secrets in source code — use environment variables or a secrets manager
- CSRF protection is only needed for cookie-based authentication — disable it for stateless JWT APIs
- Configure CORS through Spring Security's `CorsConfigurationSource`, not just Spring MVC — otherwise preflight requests are rejected by the security filter chain
- Method-level security (`@PreAuthorize`) belongs in the service layer — it is the last line of defense when URL rules don't cover a specific scenario, and it's the right place for ownership checks

---

*Spring Security's complexity is proportional to what it's protecting. A misconfigured front door is worse than no front door — because it gives a false sense of security. Build it deliberately: understand the filter chain, understand what JWT actually proves (and what it doesn't), understand the difference between authentication and authorization, and configure every rule consciously rather than by trial and error.*