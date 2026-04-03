"use client";
import { useState, useEffect, useCallback } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  nickname: string;
  created_at: string;
  helpful_count: number;
}

function Stars({ rating, size = "sm", interactive, onRate }: { rating: number; size?: "sm" | "lg"; interactive?: boolean; onRate?: (r: number) => void }) {
  const cls = size === "lg" ? "text-lg" : "text-xs";
  return (
    <span className={`inline-flex gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} onClick={() => interactive && onRate?.(i)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${i <= rating ? "text-accent" : "text-[#333]"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ProductReviews({ productId, avgRating, reviewCount }: { productId: number; avgRating?: number; reviewCount?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(reviewCount || 0);
  const [avg, setAvg] = useState(avgRating || 0);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [nickname, setNickname] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/products/${productId}/reviews?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (page === 1) setReviews(data.reviews);
      else setReviews((prev) => [...prev, ...data.reviews]);
      setTotal(data.total);
    }
  }, [productId, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async () => {
    if (rating === 0) { setSubmitMsg("Please select a rating"); return; }
    setSubmitting(true); setSubmitMsg("");
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment, nickname }),
    });
    if (res.ok) {
      setSubmitMsg("Review submitted!");
      setFormOpen(false); setRating(0); setComment(""); setNickname("");
      setPage(1);
      // Refresh stats
      const data = await res.json();
      if (data) fetchReviews();
      setAvg((prev) => {
        const newTotal = total + 1;
        return parseFloat(((prev * total + rating) / newTotal).toFixed(1));
      });
      setTotal((t) => t + 1);
    } else {
      const data = await res.json();
      setSubmitMsg(data.error || "Failed to submit");
    }
    setSubmitting(false);
  };

  const markHelpful = async (reviewId: string) => {
    await fetch(`/api/products/${productId}/reviews/helpful`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r));
  };

  const sorted = [...reviews].sort((a, b) => sortBy === "helpful" ? b.helpful_count - a.helpful_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Reviews</h3>
          {avg > 0 && (
            <span className="flex items-center gap-1.5 text-sm">
              <Stars rating={Math.round(avg)} />
              <span className="text-white font-medium">{avg}</span>
              <span className="text-text-muted">({total})</span>
            </span>
          )}
        </div>
        <button onClick={() => setFormOpen(!formOpen)}
          className="text-xs text-accent hover:text-accent/80 transition-colors">
          {formOpen ? "Cancel" : "Write a review"}
        </button>
      </div>

      {/* Review form */}
      {formOpen && (
        <div className="mb-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 space-y-3">
          <div>
            <p className="text-xs text-text-muted mb-1">Rating *</p>
            <Stars rating={rating} size="lg" interactive onRate={setRating} />
          </div>
          <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 30))} placeholder="Nickname (optional)"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
          <div className="relative">
            <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 500))} placeholder="Comment (optional)" rows={3}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50 resize-none" />
            <span className="absolute right-2 bottom-2 text-[10px] text-text-muted">{comment.length}/500</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSubmit} disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)] disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit"}
            </button>
            {submitMsg && <p className={`text-xs ${submitMsg.includes("submitted") ? "text-green-400" : "text-red-400"}`}>{submitMsg}</p>}
          </div>
        </div>
      )}

      {/* Sort */}
      {reviews.length > 1 && (
        <div className="mb-3 flex gap-2">
          <button onClick={() => setSortBy("recent")} className={`text-xs transition-colors ${sortBy === "recent" ? "text-white" : "text-text-muted hover:text-white"}`}>Most recent</button>
          <button onClick={() => setSortBy("helpful")} className={`text-xs transition-colors ${sortBy === "helpful" ? "text-white" : "text-text-muted hover:text-white"}`}>Most helpful</button>
        </div>
      )}

      {/* Reviews list */}
      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((r) => (
            <div key={r.id} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#141414] p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="text-xs font-medium text-white">{r.nickname}</span>
                </div>
                <span className="text-[10px] text-text-muted">{timeAgo(r.created_at)}</span>
              </div>
              {r.comment && <p className="text-xs text-text-secondary mt-1 leading-relaxed">{r.comment}</p>}
              <button onClick={() => markHelpful(r.id)}
                className="mt-2 text-[10px] text-text-muted hover:text-white transition-colors">
                👍 Helpful {r.helpful_count > 0 ? `(${r.helpful_count})` : ""}
              </button>
            </div>
          ))}
          {reviews.length < total && (
            <button onClick={() => setPage((p) => p + 1)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.06)] py-2 text-xs text-text-muted hover:text-white transition-colors">
              Load more reviews
            </button>
          )}
        </div>
      ) : !formOpen ? (
        <p className="text-xs text-text-muted">No reviews yet. Be the first!</p>
      ) : null}
    </section>
  );
}
