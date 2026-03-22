import type { MetadataRoute } from "next";

import { APP_URL, DEFAULT_SLUG } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${APP_URL}/${DEFAULT_SLUG}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
