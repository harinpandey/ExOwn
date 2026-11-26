"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, UserRound } from "lucide-react";
import { getPublicSellerReviews, getReviewableTransactions, submitSellerReview } from "@/actions/review";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function SellerReviewsSection({ sellerId }: { sellerId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [eligible, setEligible] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refresh = async () => {
    const [publicData, eligibleData] = await Promise.all([
      getPublicSellerReviews(sellerId),
      user ? getReviewableTransactions() : Promise.resolve([]),
    ]);
    setReviews(publicData.reviews || []);
    setAverage(publicData.average || 0);
    setTotal(publicData.total || 0);
    setEligible((eligibleData || []).filter((item: any) => item.sellerId === sellerId));
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, [sellerId, user?.uid]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!transactionId || sending) return;
    setSending(true);
    const result = await submitSellerReview(transactionId, rating, comment);
    if (result.success) {
      toast.success("Your seller review has been published.");
      setTransactionId("");
      setRating(5);
      setComment("");
      await refresh();
    } else {
      toast.error(result.error || "Could not publish review.");
    }
    setSending(false);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <MessageSquare size={19} className="text-primary" /> Seller Reviews
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Feedback from buyers who completed a deal with this seller.</p>
        </div>
        <div className="rounded-xl bg-[#F7F9F8] px-3 py-2 text-right dark:bg-zinc-800">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{total ? average.toFixed(1) + " / 5" : "No ratings"}</p>
          <p className="text-[11px] text-gray-500">{total} {total === 1 ? "review" : "reviews"}</p>
        </div>
      </div>

      {user && eligible.length > 0 && (
        <form onSubmit={submit} className="mt-5 rounded-xl border border-[#DDE6E0] bg-[#F7F9F8] p-4 dark:border-white/10 dark:bg-zinc-800/40">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Review this seller</p>
          <label className="mt-3 block text-xs font-medium text-gray-600 dark:text-gray-300">Completed deal</label>
          <select value={transactionId} onChange={e => setTransactionId(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900">
            <option value="">Choose your completed transaction</option>
            {eligible.map(item => <option key={item.id} value={item.id}>{item.product?.title || "Completed deal"} · {item.seller?.name || "Seller"}</option>)}
          </select>
          <div className="mt-3 flex items-center gap-2" aria-label="Select rating">
            {[1,2,3,4,5].map(value => (
              <button key={value} type="button" onClick={() => setRating(value)} aria-label={value + " stars"} className={value <= rating ? "text-amber-500" : "text-gray-300"}>
                <Star size={22} fill={value <= rating ? "currentColor" : "none"} />
              </button>
            ))}
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{rating}/5</span>
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={1000} rows={3} placeholder="Share your experience (optional)" className="mt-3 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <button type="submit" disabled={!transactionId || sending} className="mt-3 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{sending ? "Publishing…" : "Publish review"}</button>
        </form>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-gray-500">Loading reviews…</p>
      ) : reviews.length ? (
        <div className="mt-5 divide-y divide-gray-100 dark:divide-white/10">
          {reviews.map(review => (
            <article key={review.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500 dark:bg-zinc-800">
                  {review.author?.image ? <img src={review.author.image} alt="" className="h-full w-full object-cover" /> : <UserRound size={17} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.author?.name || "Campus buyer"}</p>
                    <time className="text-[11px] text-gray-500">{new Date(review.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</time>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-amber-500" aria-label={review.rating + " out of 5 stars"}>
                    {[1,2,3,4,5].map(value => <Star key={value} size={13} fill={value <= review.rating ? "currentColor" : "none"} className={value <= review.rating ? "" : "text-gray-300"} />)}
                    <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-300">{review.rating}/5</span>
                  </div>
                  {review.transactionRecord?.product?.title && <p className="mt-1 text-[11px] text-gray-500">Deal: {review.transactionRecord.product.title}</p>}
                  {review.comment && <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-700 dark:text-gray-300">{review.comment}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 py-8 text-center dark:border-white/10">
          <MessageSquare size={25} className="mx-auto text-gray-300" />
          <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">No buyer reviews yet</p>
          <p className="mt-1 text-xs text-gray-500">Reviews will appear here after completed deals.</p>
        </div>
      )}
    </section>
  );
}