import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
        <PackageSearch size={40} strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Listing Not Found
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        This listing may have been sold, removed, or the link is incorrect.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/search"
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          Browse Listings
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
