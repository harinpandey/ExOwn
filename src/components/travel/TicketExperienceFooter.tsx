import Link from "next/link";

export default function TicketExperienceFooter() {
  return (
    <footer className="mt-12 border-t border-[#DCE8E2] bg-white py-7 dark:border-[#2A4136] dark:bg-[#101D17]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
        <Link
          href="/"
          aria-label="ExOwn home"
          className="rounded-lg p-1 transition hover:bg-[#EAF2EF] dark:hover:bg-[#20362B]"
        >
          <img src="/exown-logo.png" alt="ExOwn" className="h-8 w-auto" />
        </Link>
        <div>
          <p className="text-sm font-extrabold">ExOwn Tickets</p>
          <p className="text-xs text-[#4A5D56] dark:text-[#B4C5BC]">
            Student-to-student ticket discovery
          </p>
        </div>
        <span className="ml-auto hidden text-xs font-medium text-[#71827A] sm:block">
          Exchange. Own. Repeat.
        </span>
      </div>
    </footer>
  );
}
