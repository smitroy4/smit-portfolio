/**
 * Products shipped as plug-and-play SaaS.
 *
 * Add new products to the TOP of this array — the first entry is treated as
 * the flagship product and is highlighted on the /products page.
 *
 * Each product accepts:
 *   id           unique slug, also used as the React key
 *   name         product name
 *   tagline      one-line positioning statement
 *   description  short paragraph shown on the card
 *   status       "Live" | "Beta" | "In Development" | "Coming Soon"
 *   cover        cover image path — a branded placeholder renders until the
 *                real image is dropped at that path
 *   demo         live demo URL, or null when there is nothing public yet
 *   repo         source repository URL, or null
 *   notes        callouts rendered on the card, e.g. the standard
 *                out-of-the-box edition and what can be customized
 *   technologies chips rendered under the description
 *   features     bullet list of what ships in the box
 */

const products = [
  {
    id: "adminpp",
    name: "Admin++",
    tagline:
      "A ready-to-run portal for teams that deliver client work.",

    description:
      "Give every client their own login so they can see exactly where their work stands, no more chasing status updates. Know who is overloaded, what is urgent and what is stuck in review at a glance, and keep every task accountable with a clear owner from raised to delivered. Fully customizable UI and can be integrated with your existing database or website.",
    status: "Live",
    cover: "/images/products/admin++.png",
    demo: "https://adminpp.smitroy.com",
    repo: null,

    notes: [
      {
        title: "Plug-n-Play | Out of the box internal solution",
        text: "Free customizations for your business.",
      },
    ],

    technologies: [
      "Java 21",
      "Spring Boot 4",
      "Spring Security 7",
      "Spring Data JPA",
      "PostgreSQL",
      "Docker",
      "Oracle Cloud",
      "GitHub Actions",
      "HTML/CSS/JS",
    ],

    features: [
      "Five-role RBAC — CLIENT, ASSOCIATE, COORDINATOR, MANAGER, ADMIN",
      "Guarded task life-cycle: OPEN → IN_PROGRESS → QUALITY → SUBMITTED → CLOSED",
      "Comment threading with internal notes and private client-to-manager escalations",
      "Associate submissions with a mandatory quality-review flow",
      "Per-role dashboards, workload metrics and status/priority breakdowns",
      "Navbar activity bell backed by a role-scoped notification feed",
      "Server-side sessions, BCrypt passwords and double-submit CSRF enforcement",
      "One-command deploy: GitHub Actions builds the image, SSH rolls it out",
    ],

    facts: [
      { label: "Backend", value: "Spring Boot 4.0.8 · Java 21" },
      { label: "Database", value: "PostgreSQL (Neon by default)" },
      { label: "Frontend", value: "Vanilla HTML/CSS/JS — no bundler, no npm" },
      {
        label: "Hosting",
        value: "Oracle Cloud VM · Ubuntu 24.04 · 1 OCPU · 1 GB",
      },
      { label: "Delivery", value: "GHCR image + SSH rollout from main" },
    ],
  },

  // 👉 New products go above this line, highest priority first.
];

export default products;