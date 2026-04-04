import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase.from("blog_posts").select("title, excerpt, thumbnail_url").eq("slug", slug).eq("is_published", true).single();
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | MurmReps`,
    description: post.excerpt || post.title,
    openGraph: { title: post.title, description: post.excerpt || "", images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : [] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const { data: post } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("is_published", true).single();

  if (!post) notFound();

  // Render content: if it already contains HTML tags, use as-is; otherwise convert markdown
  const renderContent = (content: string) => {
    if (/<[a-z][\s\S]*>/i.test(content)) {
      // Already HTML — just return it
      return content;
    }
    // Markdown-like rendering for plain text posts
    return content
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent hover:underline">$1</a>')
      .replace(/^---$/gm, '<hr class="my-6 border-[rgba(255,255,255,0.06)]" />')
      .replace(/\n\n/g, '</p><p class="text-text-secondary leading-relaxed mb-4">')
      .replace(/\n/g, "<br/>");
  };

  const { data: related } = await supabase.from("blog_posts").select("slug, title, published_at, category")
    .eq("is_published", true).neq("slug", slug).order("published_at", { ascending: false }).limit(3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/news" className="hover:text-accent transition-colors">News</Link>
        <span className="mx-2">/</span>
        <span className="text-[#d4d4d8]">{post.title}</span>
      </nav>

      {post.thumbnail_url && (
        <div className="mb-6 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.thumbnail_url} alt={post.title} className="w-full aspect-video object-cover" />
        </div>
      )}

      <div className="mb-2 flex items-center gap-3 text-xs text-text-muted">
        <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">{post.category}</span>
      </div>

      <h1 className="font-heading text-3xl font-bold text-white mb-6">{post.title}</h1>

      <div className="prose-dark text-text-secondary leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_a]:text-accent [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_strong]:text-white"
        dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

      {/* KakoBuy CTA */}
      <div className="mt-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Ready to cop?</h2>
        <p className="mt-2 text-white/80">Sign up to KakoBuy and start shopping.</p>
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">Sign up to KakoBuy →</a>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-12 border-t border-[rgba(255,255,255,0.06)] pt-8">
          <h3 className="text-lg font-bold text-white mb-4">More articles</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/news/${r.slug}`} className="rounded-xl bg-[#141414] p-4 hover:bg-[#1a1a1a] transition-colors">
                <p className="text-sm font-semibold text-white mb-1">{r.title}</p>
                <p className="text-xs text-text-muted">{new Date(r.published_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
