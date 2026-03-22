import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPageRenderer } from "@/features/public-page/components/public-page-renderer";
import { getPublicPageData } from "@/server/queries/page";
import { APP_URL } from "@/lib/constants";

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicPageData(slug);

  if (!data) {
    return { title: "Página não encontrada" };
  }

  const { profile, page } = data;
  const title = page.seo_title ?? `${profile.name} | ${profile.professional_title}`;
  const description =
    page.seo_description ??
    profile.bio?.slice(0, 160) ??
    `${profile.name} — ${profile.professional_title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${APP_URL}/${slug}`,
      images: page.og_image_url
        ? [{ url: page.og_image_url, alt: title }]
        : profile.avatar_url
          ? [{ url: profile.avatar_url, alt: profile.name }]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: page.canonical_url ?? `${APP_URL}/${slug}`,
    },
    robots: page.robots ?? "index,follow",
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const data = await getPublicPageData(slug);

  if (!data) notFound();

  return <PublicPageRenderer data={data} />;
}
