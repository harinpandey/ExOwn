import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Flag,
  Mail,
  MapPin,
  Package,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { getAdminUserDetails, updateUserStatus } from "@/actions/admin";

export const dynamic = "force-dynamic";

const dateLabel = (value: Date | string | null | undefined) =>
  value ? format(new Date(value), "dd MMM yyyy, hh:mm a") : "—";

const safeDocumentUrl = (value?: string | null) =>
  value && /^https:\/\//i.test(value) ? value : null;

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getAdminUserDetails(id);
  if (!member) notFound();
  const memberRecord = member;

  async function toggleSuspension() {
    "use server";
    await updateUserStatus(
      memberRecord.id,
      !memberRecord.isSuspended,
      memberRecord.isSuspended ? undefined : "Suspended after admin review."
    );
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${memberRecord.id}`);
  }

  const documents = [
    { label: "Student photo", url: safeDocumentUrl(member.studentPhoto) },
    { label: "College ID document", url: safeDocumentUrl(member.collegeIdUrl) },
  ].filter((document) => document.url);

  const metrics = [
    { label: "Listings", value: member._count.products, icon: Package },
    { label: "Orders", value: member._count.orders, icon: CreditCard },
    { label: "Payments", value: member._count.payments, icon: CreditCard },
    { label: "Messages sent", value: member._count.messagesSent, icon: Mail },
    { label: "Reports made", value: member._count.reportsMade, icon: Flag },
    { label: "Reports received", value: member._count.reportsRecv, icon: ShieldAlert },
    { label: "Housing posts", value: member._count.housingListings, icon: MapPin },
    { label: "Rental activity", value: member._count.rentals + member._count.rentalsOwned, icon: Users },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/admin/users" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-gray-500 transition hover:text-primary">
        <ArrowLeft size={15} /> Back to user directory
      </Link>

      <section className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-cyan-400" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
              {member.image ? (
                <img src={member.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-black text-primary">
                  {(member.name || member.email || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-black text-gray-950 dark:text-white">{member.name || "Unnamed member"}</h1>
                {member.isVerified && <CheckCircle size={17} className="text-emerald-500" />}
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">{member.role}</span>
              </div>
              <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">{member.email || "No email on record"}</p>
              <p className="mt-1 text-[11px] text-gray-400">Member ID: {member.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black ${member.isSuspended
              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
              {member.isSuspended ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
              {member.isSuspended ? "Suspended" : "Active account"}
            </span>
            {member.isSuspended ? (
              <form action={toggleSuspension}>
                <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700">
                  <CheckCircle size={14} /> Restore account
                </button>
              </form>
            ) : (
              <form action={toggleSuspension}>
                <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700">
                  <Ban size={14} /> Suspend account
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <metric.icon size={17} className="mb-3 text-primary" />
            <p className="text-2xl font-black text-gray-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">{metric.label}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h2 className="text-base font-black text-gray-950 dark:text-white">Contact & account</h2>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</dt><dd className="mt-1 break-all text-sm font-semibold text-gray-800 dark:text-gray-200">{member.email || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.phone || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{dateLabel(member.createdAt)}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last active</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{dateLabel(member.lastActive)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Address</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.address || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile completed</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.isProfileCompleted ? "Yes" : "No"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account updated</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{dateLabel(member.updatedAt)}</dd></div>
          </dl>
          {member.isSuspended && member.banReason && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <strong>Suspension reason:</strong> {member.banReason}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="text-base font-black text-gray-950 dark:text-white">Student & trust profile</h2>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">College / university</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.profile?.collegeName || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Course</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.profile?.course || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Year / batch</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{[member.profile?.year, member.profile?.batch].filter(Boolean).join(" / ") || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hostel</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.profile?.hostel || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registration number</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.registrationNumber || "—"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verification level</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.verificationLevel}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.isVerified ? "Yes" : "No"}</dd></div>
            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trusted seller</dt><dd className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{member.isTrustedSeller ? "Yes" : "No"}</dd></div>
          </dl>
          {member.profile?.bio && <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{member.profile.bio}</p>}
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
            <div><p className="text-xl font-black text-gray-950 dark:text-white">{member.trustScore}</p><p className="text-[10px] font-bold uppercase text-gray-500">Trust score</p></div>
            <div><p className="text-xl font-black text-gray-950 dark:text-white">{member.fraudScore}</p><p className="text-[10px] font-bold uppercase text-gray-500">Fraud score</p></div>
            <div><p className="text-xl font-black text-gray-950 dark:text-white">{member.profile?.successfulDeals ?? 0}</p><p className="text-[10px] font-bold uppercase text-gray-500">Successful deals</p></div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Submitted identity files</p>
            {documents.length ? (
              <div className="flex flex-wrap gap-2">
                {documents.map((document) => (
                  <a key={document.label} href={document.url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200">
                    {document.label} <ExternalLink size={13} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No identity files are stored on this ExOwn account.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            <h2 className="text-base font-black text-gray-950 dark:text-white">Recent listings</h2>
          </div>
          {member.products.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead><tr className="text-[10px] font-black uppercase tracking-widest text-gray-400"><th className="pb-3">Listing</th><th className="pb-3">Category / campus</th><th className="pb-3">Price</th><th className="pb-3">Status</th><th className="pb-3">Created</th></tr></thead>
                <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
                  {member.products.map((product) => (
                    <tr key={product.id}>
                      <td className="py-3 pr-4"><Link href={`/product/${product.id}`} target="_blank" className="font-bold text-gray-900 hover:text-primary dark:text-gray-100">{product.title}</Link></td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{product.category.name} · {product.campus.name}</td>
                      <td className="py-3 pr-4 font-bold">₹{product.price.toLocaleString("en-IN")}</td>
                      <td className="py-3 pr-4"><span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black uppercase dark:bg-gray-800">{product.status}</span></td>
                      <td className="py-3 text-xs text-gray-500">{dateLabel(product.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-gray-500">No listings are associated with this account.</p>}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5 flex items-center gap-2"><CreditCard size={18} className="text-primary" /><h2 className="text-base font-black text-gray-950 dark:text-white">Recent payments</h2></div>
          {member.payments.length ? (
            <div className="space-y-3">
              {member.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
                  <div><p className="text-sm font-black text-gray-900 dark:text-white">₹{payment.amount.toLocaleString("en-IN")} {payment.currency}</p><p className="mt-1 text-[10px] text-gray-500">{dateLabel(payment.createdAt)} · {payment.transactionId || "No transaction reference"}</p></div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase dark:bg-gray-800">{payment.paymentStatus}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No payments found.</p>}
          <p className="mt-4 text-[10px] leading-relaxed text-gray-400">Only transaction summaries are shown. Payment gateway payloads and credentials are not exposed.</p>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5 flex items-center gap-2"><Flag size={18} className="text-primary" /><h2 className="text-base font-black text-gray-950 dark:text-white">Safety reports</h2></div>
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-gray-400">Reports submitted by this member</p>
          {member.reportsMade.length ? member.reportsMade.map((report) => (
            <div key={report.id} className="mb-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800">
              <p className="font-bold text-gray-800 dark:text-gray-200">{report.reason} · {report.status}</p>
              <p className="mt-1 text-gray-500">{report.product?.title || "No listing attached"} · {dateLabel(report.createdAt)}</p>
            </div>
          )) : <p className="mb-4 text-xs text-gray-500">No reports submitted.</p>}
          <p className="mb-3 mt-5 text-xs font-black uppercase tracking-wider text-gray-400">Reports received about this member</p>
          {member.reportsRecv.length ? member.reportsRecv.map((report) => (
            <div key={report.id} className="mb-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800">
              <p className="font-bold text-gray-800 dark:text-gray-200">{report.reason} · {report.status}</p>
              <p className="mt-1 text-gray-500">{report.product?.title || "No listing attached"} · {dateLabel(report.createdAt)}</p>
            </div>
          )) : <p className="text-xs text-gray-500">No reports received.</p>}
        </section>
      </div>

      <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
        This restricted record contains personal and student information. Use it only for ExOwn support, safety, verification, and operational administration. Private message contents, login credentials, session tokens, and device tokens are intentionally excluded.
      </p>
    </div>
  );
}
