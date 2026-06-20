const aiKnowledge = {
  staygrid: `
Project: StayGrid

Overview:
Production-grade hotel booking backend built around the problems real booking platforms face — concurrency, dynamic pricing, inventory consistency, and payment workflows. Not a CRUD project.

Core Problems Solved:
- Race conditions when multiple users try to book the same room simultaneously
- Multi-layered dynamic pricing recalculated hourly
- Atomic inventory updates across multi-day stays
- Reliable payment confirmation via Stripe webhooks (not polling)

Auth & Security:
- Stateless JWT auth — short-lived access token + long-lived refresh token
- Refresh token stored in an HttpOnly cookie (XSS protection)
- Role-based access control: HOTEL_MANAGER, GUEST
- Custom JWTAuthFilter plugged into the Spring Security filter chain

Inventory & Overbooking Prevention:
- Pessimistic locking (@Lock(PESSIMISTIC_WRITE) / SELECT FOR UPDATE) to serialize concurrent writes
- Reserved vs Booked count separation to cover the gap between booking intent and payment
- Custom JPQL queries validate availability across the full multi-day stay
- All inventory mutations wrapped in @Transactional methods

Booking Lifecycle:
RESERVED -> GUESTS_ADDED -> PAYMENT_PENDING -> CONFIRMED
                                            -> CANCELLED
                                            -> EXPIRED
- 10-minute expiry window on reserved bookings, enforced via hasBookingExpired()
- Ownership validated on every state transition

Payments (Stripe):
- Stripe Checkout Session created per booking (CheckoutService)
- Webhook-driven confirmation — WebhookController verifies the Stripe signature
- Automatic refund issued on cancellation
- Idempotent booking confirmation via a unique paymentSessionId

Dynamic Pricing Engine:
Implemented with the Decorator pattern — each strategy wraps the previous one, forming a composable pricing pipeline:
- BasePricingStrategy: room's base nightly price
- SurgePricingStrategy: multiplies by a demand-based surgeFactor
- OccupancyPricingStrategy: +20% when bookedCount/reservedCount > 0.8
- UrgencyPricingStrategy: +15% for check-ins within the next 7 days
- HolidayPricingStrategy: +25% on holiday dates
Wrapping order in PricingService: Base -> Surge -> Occupancy -> Urgency -> Holiday

Scheduled Price Optimization:
- PricingUpdateService runs hourly (@Scheduled, cron "0 0 * * * *")
- Recalculates inventory prices in batches of 100 hotels
- Updates a per-day HotelMinPrice aggregate table used for fast hotel search/sorting

Query Optimization:
- Custom JPQL for availability search, locking, and min-price aggregation
- Avoids N+1 via fetch strategies and DTO projections

Global Response Handling:
- GlobalExceptionHandler maps exceptions (ResourceNotFound, Auth, JWT, AccessDenied) to a consistent ApiError shape
- GlobalResponseHandler wraps every successful response in a standard ApiResponse<T> envelope

Tech Stack:
- Java 21, Spring Boot 3.5
- Spring Security + JWT (jjwt)
- PostgreSQL (Neon Serverless), Hibernate/JPA
- Stripe Java SDK
- Swagger / OpenAPI (springdoc)
- ModelMapper for entity-DTO mapping

Key Classes:
Controllers: AuthController, HotelController, HotelBrowseController, RoomAdminController, HotelBookingController, WebhookController
Security: JWTService, JWTAuthFilter, AuthService, WebSecurityConfig
Services: BookingServiceImpl, HotelServiceImpl, RoomServiceImpl, InventoryServiceImpl, CheckoutServiceImpl, PricingUpdateService
Pricing: PricingStrategy, BasePricingStrategy, SurgePricingStrategy, OccupancyPricingStrategy, UrgencyPricingStrategy, HolidayPricingStrategy, PricingService
Entities: Hotel, Room, Inventory, Booking, Guest, User, HotelMinPrice
`
};

export default aiKnowledge;