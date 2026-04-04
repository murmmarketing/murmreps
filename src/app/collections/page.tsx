import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Collections — Curated Rep Finds | MurmReps",
  description: "Browse curated collections: summer essentials, all black outfits, budget steals, designer bags, and sneaker picks.",
};

export const revalidate = 300;

export default async function CollectionsPage() {
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const items = collections || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Collections</h1>
      <p className="mt-2 text-text-secondary mb-8">Curated themed product picks.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`}
            className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden transition-all hover:-translate-y-0.5 hover:border-accent/20">
            {c.cover_image_url && (
              <div className="aspect-video overflow-hidden bg-[#0a0a0a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover_image_url} alt={c.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
            )}
            <div className="p-5">
              <h2 className="font-heading text-lg font-bold text-white group-hover:text-accent transition-colors">{c.title}</h2>
              {c.description && <p className="mt-1 text-sm text-text-secondary line-clamp-2">{c.description}</p>}
              <p className="mt-2 text-xs text-text-muted">{c.product_ids?.length || 0} products</p>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-text-muted">No collections yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
