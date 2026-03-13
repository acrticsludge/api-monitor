import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/docs", "/privacy", "/terms", "/status/"],
        disallow: ["/dashboard/", "/auth/", "/api/", "/login", "/signup"],
      },
    ],
    sitemap: "https://pulsemonitor.dev/sitemap.xml",
  };
}
