export const dynamic = "force-dynamic";
import { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://pulsemonitor.dev/",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://pulsemonitor.dev/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://pulsemonitor.dev/signup",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://pulsemonitor.dev/docs",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://pulsemonitor.dev/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://pulsemonitor.dev/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://pulsemonitor.dev/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
