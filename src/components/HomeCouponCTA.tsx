import Link from "next/link";

export default function HomeCouponCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="my-12 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 text-center">
        <h3 className="font-heading text-2xl font-bold text-white">
          Save on Every Haul
        </h3>
        <p className="mt-2 text-gray-400">
          Sign up through MurmReps for exclusive agent coupons and the best
          shipping rates
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            Sign up with KakoBuy →
          </a>
          <Link
            href="/deals"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/5"
          >
            View All Deals
          </Link>
        </div>
      </div>
    </section>
  );
}
