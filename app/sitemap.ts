import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.playmazegame.com",
      lastModified: new Date(),
    },
  ];
}
