// robots.txt dynamique — Next.js le sert sur /robots.txt.
// Site ouvert au référencement mondial ; on protège seulement les zones privées
// (admin, espaces token, tunnel de réservation transactionnel, API).
import type { MetadataRoute } from "next";
import { CANONICAL_SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/fr/admin/",
          "/en/admin/",
          "/fr/rdv/",
          "/en/rdv/",
          "/fr/avis/",
          "/en/avis/",
          "/fr/reservation/",
          "/en/reservation/",
          "/api/",
        ],
      },
    ],
    sitemap: `${CANONICAL_SITE}/sitemap.xml`,
    host: CANONICAL_SITE,
  };
}
