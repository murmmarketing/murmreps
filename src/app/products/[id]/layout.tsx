import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("name, brand, price_cny, image")
    .eq("id", id)
    .single();

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = `${product.name} \u2014 ${product.brand}`;
  const description = `Buy ${product.name} by ${product.brand}${product.price_cny ? ` for \u00A5${product.price_cny}` : ""}. Compare across 8 agents. QC photos available.`;
  const image = product.image || "/og-image.svg";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | MurmReps`,
      description,
      url: `/products/${id}`,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      title: `${title} | MurmReps`,
      description,
      images: [image],
    },
    alternates: { canonical: `/products/${id}` },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
