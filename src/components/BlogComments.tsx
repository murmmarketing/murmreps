"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface Comment { id: string; nickname: string; comment: string; created_at: string; }

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function BlogComments({ slug }: { slug: string }) {
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}/comments`).then((r) => r.json()).then((d) => setComments(d.comments || [])).catch(() => {});
  }, [slug]);

  const submit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/blog/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, comment }),
    });
    if (res.ok) {
      showToast("Comment posted!");
      setComment("");
      // Refresh comments
      const d = await fetch(`/api/blog/${slug}/comments`).then((r) => r.json());
      setComments(d.comments || []);
    } else {
      const d = await res.json();
      showToast(d.error || "Failed to post");
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-12 border-t border-[rgba(255,255,255,0.06)] pt-8">
      <h3 className="text-lg font-bold text-white mb-4">Comments ({comments.length})</h3>

      {/* Form */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 space-y-3 mb-6">
        <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 30))} placeholder="Nickname (optional)"
          className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
        <div className="relative">
          <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 1000))} placeholder="Write a comment..." rows={3}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50 resize-none" />
          <span className="absolute right-2 bottom-2 text-[10px] text-text-muted">{comment.length}/1000</span>
        </div>
        <button onClick={submit} disabled={submitting || !comment.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)] disabled:opacity-50">
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>

      {/* List */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">{c.nickname}</span>
                <span className="text-[10px] text-text-muted">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{c.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No comments yet. Be the first!</p>
      )}
    </section>
  );
}
