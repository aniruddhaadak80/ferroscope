import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ferroscope — exposure observatory",
    short_name: "Ferroscope",
    description:
      "Map your blast radius before the breach does. 27 incidents, one personal exposure model, zero API keys.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090b",
    theme_color: "#08090b",
    categories: ["security", "productivity", "utilities"],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
