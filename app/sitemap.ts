import { MetadataRoute } from "next";

interface SEO {
  id: number;
  slug: string;
  updated_at: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let items: SEO[] = [];

  try {
    const response = await fetch(`${process.env.SERVER_URL}/seo`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) throw new Error();

    const res = await response.json();
    items = Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    items = [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL ?? "",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/apoteker`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${BASE_URL}/apoteker/${item.slug || item.id}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
