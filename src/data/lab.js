import { Boxes, Network } from "lucide-react";

/**
 * Lab sections — each entry renders as a card on the /lab hub page.
 *
 * To add a new lab later, just append an entry at the TOP of this array:
 *   {
 *     id: "my-experiment",
 *     title: "My Experiment",
 *     tagline: "One-line hook shown on the card.",
 *     description: "Short paragraph shown on the card.",
 *     path: "/lab/my-experiment", // or "https://..." with external: true
 *     icon: Boxes,
 *     status: "Live" | "Building" | "Coming Soon",
 *     accent: "blue" | "amber" | "emerald" | "violet",
 *     meta: "e.g. 3 experiments",
 *     external: false, // set true for absolute URLs (opens in a new tab)
 *     topics: ["Topic A", "Topic B"], // optional: renders as tiles
 *                                       // instead of the description
 *   }
 *
 * Internal paths need a matching <Route> in src/routes/AppRoutes.jsx.
 * External links need no route.
 */

const labSections = [
  {
    id: "saas-products",
    title: "SaaS Products",
    tagline: "Deploy it. Then make it yours.",
    description:
      "Complete, production-grade platforms you can stand up as-is. Every product ships in its default out-of-the-box form — plug-n-play on day one — and gets customized around your business needs.",
    path: "/lab/saas-products",
    icon: Boxes,
    status: "Live",
    accent: "blue",
    meta: "Production-ready platforms",
  },
  {
    id: "system-whispering",
    title: "System Whispering",
    tagline: "Listen closely. Systems speak.",
    path: "https://systemswhispering.smitroy.com/",
    icon: Network,
    status: "Live",
    accent: "amber",
    meta: "Live · 4 tracks",
    external: true,
    topics: [
      "Data Structures & Algorithms",
      "System Design",
      "The Backend Craft",
      "AI & ML",
    ],
  },

  // 👉 New lab sections go above this line, highest priority first.
];

export default labSections;
